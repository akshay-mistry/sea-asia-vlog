#!/usr/bin/env python3
"""Enrich footage-catalog.json with GPS coords and human location labels."""
import json
import subprocess

CAT = "data/footage-catalog.json"

REGIONS = [
    # (name, chapter, lat_min, lat_max, lon_min, lon_max)
    ("Ha Giang, Vietnam", "ha-giang", 22.0, 24.0, 104.0, 106.0),
    ("Da Nang, Vietnam", "da-nang", 15.98, 16.5, 107.9, 108.5),
    ("Hoi An, Vietnam", "hoi-an", 15.5, 15.98, 108.0, 108.6),
    ("Bali, Indonesia", "bali", -9.2, -8.0, 114.0, 116.0),
    ("Phuket, Thailand", "phuket", 7.5, 8.5, 98.0, 98.6),
    ("Ko Yao, Thailand", "ko-yao", 7.5, 8.5, 98.6, 99.2),
    ("Bangkok, Thailand", "bangkok", 13.4, 14.2, 100.3, 101.0),
]


def locate(lat, lon):
    for name, chap, la0, la1, lo0, lo1 in REGIONS:
        if la0 <= lat <= la1 and lo0 <= lon <= lo1:
            return name, chap
    return f"({lat:.2f},{lon:.2f})", "other"


def parse_iso6709(s):
    # e.g. +22.9269+104.9492+000.000/
    s = s.rstrip("/")
    parts = []
    cur = ""
    for ch in s:
        if ch in "+-" and cur:
            parts.append(cur)
            cur = ch
        else:
            cur += ch
    parts.append(cur)
    return float(parts[0]), float(parts[1])


cat = json.load(open(CAT))
n_gps = 0
for e in cat:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-print_format", "json", "-show_format",
        f"assets/clips/{e['file']}",
    ]).decode()
    tags = json.loads(out)["format"].get("tags", {})
    iso = tags.get("com.apple.quicktime.location.ISO6709")
    if iso:
        lat, lon = parse_iso6709(iso)
        loc, chap = locate(lat, lon)
        e["lat"], e["lon"] = lat, lon
        e["location"], e["chapter"] = loc, chap
        n_gps += 1
    else:
        e["lat"] = e["lon"] = None
        e["location"], e["chapter"] = None, None

json.dump(cat, open(CAT, "w"), indent=1)
print(f"gps on {n_gps}/{len(cat)} clips")

chapters = {}
for e in cat:
    c = e["chapter"] or "no-gps"
    chapters.setdefault(c, {"n": 0, "dur": 0})
    chapters[c]["n"] += 1
    chapters[c]["dur"] += e["duration"]
for c, v in chapters.items():
    print(f"  {c:10s} {v['n']:3d} clips {v['dur']/60:6.1f} min")
