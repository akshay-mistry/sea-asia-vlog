#!/usr/bin/env python3
"""Per-chapter QC sheets: for every timeline shot, extract the exact
first / middle / last SOURCE frames that will appear in the comp."""
import json
import os
import subprocess
import sys
from collections import defaultdict

timeline_path = (
    sys.argv[1] if len(sys.argv) > 1 else "data/timeline-resolved.json"
)
OUT = sys.argv[2] if len(sys.argv) > 2 else "analysis/qc"
rows = json.load(open(timeline_path))
os.makedirs(OUT, exist_ok=True)

by_ch = defaultdict(list)
for r in rows:
    by_ch[r["chapter"]].append(r)

PAGE = 8
paged = {}
for ch, shots in by_ch.items():
    if len(shots) <= PAGE:
        paged[ch] = shots
    else:
        for p in range(0, len(shots), PAGE):
            paged[f"{ch}_p{p // PAGE}"] = shots[p : p + PAGE]

for ch, shots in paged.items():
    ins, n = [], 0
    labels = []
    for r in shots:
        pts = [r["srcIn"], (r["srcIn"] + r["srcOut"]) / 2, min(r["srcOut"], r["srcDur"] - 0.05)]
        for p in pts:
            ins += ["-ss", f"{max(p,0):.2f}", "-i", f"assets/clips/{r['file']}"]
        labels.append(r)
        n += 1
    fc = ""
    for i in range(n * 3):
        fc += f"[{i}:v]scale=340:192:force_original_aspect_ratio=increase,crop=340:192[s{i}];"
    stacks = []
    for i in range(n):
        r = labels[i]
        label = (
            f"{r['chapter']}#{r['idx']} clip{r['clip']} b{r['beat']} "
            f"src {r['srcIn']:.1f}-{r['srcOut']:.1f}/{r['srcDur']:.0f}s x{r['speed']} {r['flags']}"
        ).replace(":", "\\:").replace("'", "")
        fc += f"[s{i*3}][s{i*3+1}][s{i*3+2}]hstack=3,pad=iw:ih+30:0:30:black,drawtext=text='{label}':x=6:y=6:fontsize=20:fontcolor=yellow[row{i}];"
    fc += "".join(f"[row{i}]" for i in range(n)) + (f"vstack={n}[out]" if n > 1 else "null[out]")
    out = f"{OUT}/{ch}.jpg"
    cmd = ["ffmpeg", "-y", "-v", "error"] + ins + ["-filter_complex", fc, "-map", "[out]", "-frames:v", "1", "-q:v", "5", out]
    r2 = subprocess.run(cmd, capture_output=True)
    print(ch, "ok" if r2.returncode == 0 else f"FAIL {r2.stderr.decode()[:300]}")
