#!/usr/bin/env python3
"""Create timestamped 10 fps filmstrips for manual edit inspection."""

from __future__ import annotations

import io
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SPECS = {
    "sample1": [(0.0, 3.8), (9.3, 12.1), (15.3, 18.69)],
    "sample2": [
        (0.0, 6.3),
        (16.2, 19.9),
        (20.8, 23.58),
        (6.2, 10.2),
        (10.0, 13.2),
        (13.0, 16.4),
    ],
    "sample3": [(0.0, 3.0), (2.2, 5.8), (5.6, 8.8), (8.2, 11.3), (18.3, 21.49)],
    "sample4": [(0.0, 2.9), (4.6, 8.2), (8.0, 10.2), (10.0, 13.13)],
}


def extract(path: Path, start: float, end: float, crop: str | None = None) -> list[Image.Image]:
    filters = []
    if crop:
        filters.append(f"crop={crop}")
    filters.extend(["fps=10", "scale=240:134:force_original_aspect_ratio=decrease", "pad=240:136:(ow-iw)/2:(oh-ih)/2"])
    payload = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            str(start),
            "-to",
            str(end),
            "-i",
            str(path),
            "-vf",
            ",".join(filters),
            "-f",
            "image2pipe",
            "-vcodec",
            "mjpeg",
            "-q:v",
            "3",
            "-",
        ],
        check=True,
        capture_output=True,
    ).stdout
    marker = b"\xff\xd8"
    offsets = []
    position = 0
    while True:
        found = payload.find(marker, position)
        if found < 0:
            break
        offsets.append(found)
        position = found + 2
    offsets.append(len(payload))
    return [
        Image.open(io.BytesIO(payload[offsets[i] : offsets[i + 1]])).convert("RGB")
        for i in range(len(offsets) - 1)
    ]


def sheet(images: list[Image.Image], start: float, destination: Path) -> None:
    cols = 5
    image_height = 136
    label_height = 20
    rows = math.ceil(len(images) / cols)
    canvas = Image.new("RGB", (cols * 240, rows * (image_height + label_height)), "white")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=14)
    for index, image in enumerate(images):
        x = (index % cols) * 240
        y = (index // cols) * (image_height + label_height)
        canvas.paste(image, (x, y))
        draw.rectangle((x, y + image_height, x + 240, y + image_height + label_height), fill="black")
        draw.text((x + 4, y + image_height + 3), f"{start + index / 10:06.2f}s", fill="white", font=font)
    canvas.save(destination, quality=92)


def main() -> None:
    for stem, segments in SPECS.items():
        source = ROOT / "vlog-samples" / f"{stem}.mp4"
        for index, (start, end) in enumerate(segments, 1):
            crop = "720:480:0:400" if stem == "sample2" else None
            images = extract(source, start, end, crop)
            sheet(images, start, OUT / f"{stem}-dense-{index}.jpg")


if __name__ == "__main__":
    main()
