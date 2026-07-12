"""Synthesize the sound-design layer heard in the reference vlogs.

Measured in the samples (analysis/fx/analyze_sfx.py):
- whoosh: 0.3-0.6s broadband noise burst peaking at the cut, ~10-16 dB over bed
- riser:  0.5-2.7s high-band noise sweep rising INTO a boundary
- impact: sub-bass (25-90 Hz) hit landing ON the boundary, +15-46 dB
All files land in public/sfx/ and are mixed inside the Remotion comp.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
import os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)

rng = np.random.default_rng(7)


def save(name, x, peak=0.9):
    x = np.asarray(x)
    x = x / (np.abs(x).max() + 1e-9) * peak
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    wavfile.write(os.path.join(OUT, name), SR, (x * 32767).astype(np.int16))
    print(name, f'{x.shape[0]/SR:.2f}s')


def bp(x, lo, hi, order=4):
    sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return sosfilt(sos, x)


def lp(x, hz, order=4):
    sos = butter(order, hz, btype='low', fs=SR, output='sos')
    return sosfilt(sos, x)


def t(dur):
    return np.arange(int(SR * dur)) / SR


# ---------------------------------------------------------------- whoosh
# noise burst, band sweeps up then releases; peak at 55% of duration
def make_whoosh(dur=0.55, peak_at=0.55):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    # time-varying bandpass via overlapping chunks
    chunks = 24
    out = np.zeros(n)
    for i in range(chunks):
        a, b = i * n // chunks, (i + 1) * n // chunks
        p = i / (chunks - 1)
        center = 400 * (14 ** p)            # 400 Hz -> 5.6 kHz
        seg = bp(x, center * 0.5, min(center * 2.2, 16000))
        out[a:b] = seg[a:b]
    tt = np.linspace(0, 1, n)
    env = np.where(tt < peak_at, (tt / peak_at) ** 2.2, (1 - (tt - peak_at) / (1 - peak_at)) ** 1.6)
    y = out * env
    # gentle stereo width
    yl = np.roll(y, 24) * 0.96 + y * 0.04
    return np.stack([yl, y], axis=1)


save('whoosh.wav', make_whoosh(), peak=0.8)
save('whoosh-soft.wav', make_whoosh(0.4, 0.6), peak=0.55)

# ---------------------------------------------------------------- risers
def make_riser(dur, lo0=250, hi_pow=1.6):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    chunks = 48
    out = np.zeros(n)
    for i in range(chunks):
        a, b = i * n // chunks, (i + 1) * n // chunks
        p = i / (chunks - 1)
        center = lo0 * ((12000 / lo0) ** (p ** hi_pow))
        seg = bp(x, center * 0.55, min(center * 2.0, 16500))
        out[a:b] = seg[a:b]
    tt = np.linspace(0, 1, n)
    env = tt ** 2.4                        # exponential swell, ends at max
    # tiny 1/16-note tremolo so it feels rhythmic (133.33 BPM -> 8.888 Hz)
    trem = 1 - 0.22 * (0.5 + 0.5 * np.cos(2 * np.pi * 8.888 * t(dur)))
    y = out * env * trem
    yl = np.roll(y, 30) * 0.95 + y * 0.05
    return np.stack([yl, y], axis=1)


save('riser-long.wav', make_riser(2.7), peak=0.85)    # 6 beats into a drop
save('riser-short.wav', make_riser(0.9, lo0=500), peak=0.7)  # 2 beats

# ---------------------------------------------------------------- impact
def make_impact(dur=1.3):
    n = int(SR * dur)
    tt = t(dur)
    # pitch-dropping sub: 85 Hz -> 38 Hz over 0.3 s
    f = 38 + 47 * np.exp(-tt / 0.11)
    phase = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(phase) * np.exp(-tt / 0.32)
    # body thump
    thump = lp(rng.standard_normal(n), 180) * np.exp(-tt / 0.05) * 1.6
    # transient click
    click = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-tt / 0.008) * 0.5
    y = sub * 1.0 + thump + click
    return lp(y, 7000)


save('impact.wav', make_impact(), peak=0.95)
save('impact-soft.wav', make_impact(0.9) * 0.7, peak=0.6)

# ---------------------------------------------------------------- shutter
def make_shutter():
    n = int(SR * 0.16)
    tt = t(0.16)
    c1 = bp(rng.standard_normal(n), 2000, 9000) * np.exp(-tt / 0.004)
    c2 = np.roll(bp(rng.standard_normal(n), 1500, 8000) * np.exp(-tt / 0.006), int(0.07 * SR))
    return c1 + c2 * 0.8


save('shutter.wav', make_shutter(), peak=0.5)
print('done ->', os.path.abspath(OUT))
