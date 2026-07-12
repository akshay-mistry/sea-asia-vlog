#!/usr/bin/env python3
"""
Build foreground alpha-WebM overlays for the text-behind-subject effect
(sample4's "people walk in front of the title" look).

For each configured spot this:
  1. extracts the exact trimmed segment of the source clip as PNG frames
     (native fps, so Remotion's time->frame mapping matches the base
     OffthreadVideo exactly),
  2. runs rembg (isnet-general-use) per frame to get a subject matte,
  3. merges frame+matte into an RGBA VP9 .webm in public/mattes/.

Run inside a python >=3.10 venv with: pip install "rembg[cpu]" "numba>=0.61" pillow
  python scripts/make-mattes.py
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
CLIPS = ROOT / 'public' / 'clips'
OUT = ROOT / 'public' / 'mattes'

# (output name, source file, trim seconds, duration seconds, native fps)
SPOTS = [
    # PHUKET card: elephant walks up to the camera (clip 205, beats 217-221)
    ('phuket-elephant-fg', 'IMG_8451.mov', 1.2, 1.9, '30000/1001'),
    # HOI AN card: arrival at the duck farm, two people in the foreground
    # (clip 112, beats 119-121)
    ('hoian-arrival-fg', 'IMG_7535.mov', 2.0, 1.1, '30'),
]

session = new_session('isnet-general-use')

OUT.mkdir(parents=True, exist_ok=True)

# smoothstep the matte between these levels: kills semi-transparent
# midtone noise (background haze) while keeping soft subject edges
LO, HI = 0.35, 0.75


def clean(mask: Image.Image) -> Image.Image:
    def f(v: int) -> int:
        t = (v / 255 - LO) / (HI - LO)
        t = max(0.0, min(1.0, t))
        return round(255 * t * t * (3 - 2 * t))

    return mask.point(f)

for name, src, trim, dur, fps in SPOTS:
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error',
             '-ss', str(trim), '-t', str(dur), '-i', str(CLIPS / src),
             '-fps_mode', 'passthrough', str(tmp / 'f_%04d.png')],
            check=True,
        )
        frames = sorted(tmp.glob('f_*.png'))
        print(f'{name}: {len(frames)} frames')
        for i, f in enumerate(frames):
            img = Image.open(f).convert('RGB')
            mask = remove(img, session=session, only_mask=True)
            clean(mask).save(tmp / f'm_{f.stem[2:]}.png')
            if i % 10 == 0:
                print(f'  matte {i}/{len(frames)}', flush=True)
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error',
             '-framerate', fps, '-i', str(tmp / 'f_%04d.png'),
             '-framerate', fps, '-i', str(tmp / 'm_%04d.png'),
             '-filter_complex', '[0:v][1:v]alphamerge[out]',
             '-map', '[out]', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
             '-b:v', '0', '-crf', '24', '-row-mt', '1',
             '-color_primaries', 'bt709', '-color_trc', 'bt709',
             '-colorspace', 'bt709',
             str(OUT / f'{name}.webm')],
            check=True,
        )
        print(f'wrote {OUT / f"{name}.webm"}')

print('done')
