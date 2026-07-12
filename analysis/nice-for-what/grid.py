#!/usr/bin/env python3
"""Precise beat grid + section segmentation for Nice For What."""
import json

import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

SR = 22050
sr_read, y = wavfile.read("analysis/nice-for-what/song-mono-22050.wav")
y = y.astype(np.float64)
dur = len(y) / SR

NPERSEG = 1024
HOP = 256
f, t, Z = stft(y, fs=SR, nperseg=NPERSEG, noverlap=NPERSEG - HOP, padded=False)
mag = np.abs(Z)
flux = np.maximum(mag[:, 1:] - mag[:, :-1], 0).sum(axis=0)
flux_t = t[1:]
frame_rate = SR / HOP

# low band (kick) flux for drum-presence detection
low = f < 150
kick_flux = np.maximum(mag[low, 1:] - mag[low, :-1], 0).sum(axis=0)

env = flux - np.convolve(flux, np.ones(int(frame_rate)) / int(frame_rate), mode="same")
env = np.maximum(env, 0)


def grid_score(period, phase, t0, t1):
    beats = np.arange(phase, dur, period)
    beats = beats[(beats >= t0) & (beats < t1)]
    idx = np.clip((beats * frame_rate).astype(int), 0, len(env) - 1)
    return env[idx].mean(), len(beats)


# --- refine tempo over the steady main body 25-190s ---
best = None
for bpm in np.arange(93.0, 94.3, 0.005):
    period = 60.0 / bpm
    for phase in np.arange(0, period, 0.010):
        s, n = grid_score(period, phase, 25, 190)
        if best is None or s > best[0]:
            best = (s, bpm, phase)
score, bpm, phase = best
period = 60.0 / bpm
# refine phase finer
for ph in np.arange(max(0, phase - 0.012), phase + 0.012, 0.001):
    s, _ = grid_score(period, ph, 25, 190)
    if s > score:
        score, phase = s, ph
print(f"main grid: {bpm:.3f} BPM, period {period:.6f}s, phase {phase:.3f}s, score {score:.1f}")

# check where grid holds from the very start (does intro share the grid?)
for t0, t1 in [(0, 12), (12, 25), (25, 60), (60, 120), (120, 190), (190, 220), (220, 262)]:
    s, n = grid_score(period, phase, t0, t1)
    # compare to offbeat score (phase + half period)
    s_off, _ = grid_score(period, phase + period / 2, t0, t1)
    print(f"  window {t0:5.1f}-{t1:5.1f}: on-beat {s:8.1f}  off-beat {s_off:8.1f}  ratio {s/max(s_off,1e-9):.2f}")

# --- RMS + kick presence per second ---
sec_rms = []
for s0 in range(0, int(dur)):
    seg = y[s0 * SR : (s0 + 1) * SR]
    sec_rms.append(np.sqrt((seg**2).mean()))
sec_rms = np.array(sec_rms)
sec_rms_db = 20 * np.log10(sec_rms / sec_rms.max() + 1e-12)

kick_sec = []
for s0 in range(0, int(dur)):
    i0, i1 = int(s0 * frame_rate), int((s0 + 1) * frame_rate)
    kick_sec.append(kick_flux[i0:i1].mean())
kick_sec = np.array(kick_sec)
kick_norm = kick_sec / kick_sec.max()

print("\nsec  rms_db  kick   (every 2s)")
for s0 in range(0, int(dur), 2):
    bar = "#" * int(kick_norm[s0] * 40)
    print(f"{s0:4d}  {sec_rms_db[s0]:6.1f}  {kick_norm[s0]:.2f} {bar}")
