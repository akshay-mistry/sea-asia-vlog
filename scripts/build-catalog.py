#!/usr/bin/env python3
"""Build a chronologically-sorted catalog of all clips in assets/clips.

Outputs:
  data/footage-catalog.json  - one entry per clip, sorted by real recording time
  analysis/clips/strips/<n>_<name>.jpg - 4-frame preview strip per clip
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

CLIPS_DIR = "assets/clips"
STRIPS_DIR = "analysis/clips/strips"
OUT_JSON = "data/footage-catalog.json"

os.makedirs(STRIPS_DIR, exist_ok=True)
os.makedirs("data", exist_ok=True)


def ffprobe(path):
    cmd = [
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", path,
    ]
    return json.loads(subprocess.check_output(cmd).decode())


def parse_time(info):
    """Return (iso_string, epoch, source). Prefer Apple's local-TZ tag."""
    fmt_tags = info.get("format", {}).get("tags", {})
    apple = fmt_tags.get("com.apple.quicktime.creationdate")
    if apple:
        try:
            dt = datetime.strptime(apple, "%Y-%m-%dT%H:%M:%S%z")
            return apple, dt.timestamp(), "apple_local"
        except ValueError:
            pass
    ct = fmt_tags.get("creation_time")
    if not ct:
        for s in info.get("streams", []):
            ct = s.get("tags", {}).get("creation_time")
            if ct:
                break
    if ct:
        try:
            dt = datetime.strptime(ct.replace("Z", "+0000"), "%Y-%m-%dT%H:%M:%S.%f%z")
            return ct, dt.timestamp(), "creation_time_utc"
        except ValueError:
            try:
                dt = datetime.strptime(ct.replace("Z", "+0000"), "%Y-%m-%dT%H:%M:%S%z")
                return ct, dt.timestamp(), "creation_time_utc"
            except ValueError:
                pass
    # fallback: file mtime
    mtime = os.path.getmtime(os.path.join(CLIPS_DIR, info["_name"]))
    return datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat(), mtime, "file_mtime"


def video_stream(info):
    for s in info.get("streams", []):
        if s.get("codec_type") == "video":
            return s
    return {}


entries = []
files = sorted(os.listdir(CLIPS_DIR))
files = [f for f in files if not f.startswith(".") and f.lower().endswith((".mov", ".mp4", ".m4v"))]
print(f"probing {len(files)} clips...")

for i, name in enumerate(files):
    path = os.path.join(CLIPS_DIR, name)
    try:
        info = ffprobe(path)
    except subprocess.CalledProcessError:
        print(f"  SKIP (probe failed): {name}")
        continue
    info["_name"] = name
    v = video_stream(info)
    iso, epoch, tsrc = parse_time(info)

    rotation = 0
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            rotation = sd["rotation"]

    fr = v.get("r_frame_rate", "30/1")
    try:
        num, den = fr.split("/")
        fps = float(num) / float(den)
    except (ValueError, ZeroDivisionError):
        fps = 30.0

    w, h = v.get("width", 0), v.get("height", 0)
    if abs(rotation) in (90, 270):
        w, h = h, w

    entries.append({
        "file": name,
        "recordedAt": iso,
        "epoch": epoch,
        "timeSource": tsrc,
        "duration": float(info["format"].get("duration", 0)),
        "width": w,
        "height": h,
        "orientation": "vertical" if h > w else "horizontal",
        "fps": round(fps, 3),
        "codec": v.get("codec_name"),
        "pixFmt": v.get("pix_fmt"),
        "colorTransfer": v.get("color_transfer"),
        "camera": "gopro" if name.startswith("GX") else "iphone",
    })
    if (i + 1) % 50 == 0:
        print(f"  probed {i+1}/{len(files)}")

# GoPro clips were re-muxed on import (Apple Core Media handler): their
# creation_time is the transfer moment, not the recording moment. Mark them
# so the edit doesn't trust their absolute position in the chronology.
for e in entries:
    if e["camera"] == "gopro":
        e["timeSource"] = "transfer_time_unreliable"

entries.sort(key=lambda e: e["epoch"])
for idx, e in enumerate(entries):
    e["id"] = idx

with open(OUT_JSON, "w") as f:
    json.dump(entries, f, indent=1)
print(f"wrote {OUT_JSON} with {len(entries)} entries")
print(f"time sources: ", {s: sum(1 for e in entries if e['timeSource'] == s) for s in set(e['timeSource'] for e in entries)})
print(f"date range: {entries[0]['recordedAt']} -> {entries[-1]['recordedAt']}")

if "--no-thumbs" in sys.argv:
    sys.exit(0)

print("extracting preview strips...")
for i, e in enumerate(entries):
    out = os.path.join(STRIPS_DIR, f"{e['id']:03d}_{os.path.splitext(e['file'])[0]}.jpg")
    if os.path.exists(out):
        continue
    d = max(e["duration"], 0.5)
    pts = [d * p for p in (0.08, 0.35, 0.62, 0.88)]
    inputs = []
    for p in pts:
        inputs += ["-ss", f"{p:.2f}", "-i", os.path.join(CLIPS_DIR, e["file"])]
    label = f"{e['id']:03d} {e['file']}  {e['recordedAt'][:16]}  {e['duration']:.0f}s {e['camera']}"
    label = label.replace(":", "\\:").replace("'", "")
    fc = (
        "[0:v]scale=400:-2[a];[1:v]scale=400:-2[b];[2:v]scale=400:-2[c];[3:v]scale=400:-2[d];"
        "[a][b][c][d]hstack=4,pad=iw:ih+34:0:34:black,"
        f"drawtext=text='{label}':x=8:y=8:fontsize=22:fontcolor=white[out]"
    )
    cmd = ["ffmpeg", "-y", "-v", "error"] + inputs + [
        "-filter_complex", fc, "-map", "[out]", "-frames:v", "1", "-q:v", "5", out,
    ]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        print(f"  strip failed: {e['file']}: {r.stderr.decode()[:200]}")
    if (i + 1) % 25 == 0:
        print(f"  strips {i+1}/{len(entries)}")
print("done")
