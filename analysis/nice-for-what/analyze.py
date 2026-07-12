#!/usr/bin/env python3
"""Beat/structure analysis for Drake - Nice For What.

Method: STFT spectral flux onset envelope -> autocorrelation tempo ->
phase grid search -> per-window tempo stability -> RMS/band energy
segmentation. Outputs JSON + plots under analysis/nice-for-what.
"""
import json

import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

SR = 22050
WAV = "analysis/nice-for-what/song-mono-22050.wav"

sr_read, y = wavfile.read(WAV)
assert sr_read == SR
y = y.astype(np.float64)
if y.ndim > 1:
    y = y.mean(axis=1)
dur = len(y) / SR
print(f"duration {dur:.6f}s")

# --- onset envelope (spectral flux) ---
NPERSEG = 1024
HOP = 256
f, t, Z = stft(y, fs=SR, nperseg=NPERSEG, noverlap=NPERSEG - HOP, padded=False)
mag = np.abs(Z)
flux = np.maximum(mag[:, 1:] - mag[:, :-1], 0).sum(axis=0)
flux_t = t[1:]
frame_rate = SR / HOP
# smooth + local-mean subtract
kernel = np.ones(9) / 9
local = np.convolve(flux, np.ones(int(frame_rate * 1.0)) / int(frame_rate * 1.0), mode="same")
env = np.maximum(np.convolve(flux, kernel, mode="same") - local, 0)

# --- global tempo via autocorrelation of the envelope ---
def tempo_from(env_seg):
    e = env_seg - env_seg.mean()
    ac = np.correlate(e, e, mode="full")[len(e) - 1 :]
    # search 70-180 BPM
    lo = int(frame_rate * 60 / 180)
    hi = int(frame_rate * 60 / 70)
    lag = lo + np.argmax(ac[lo:hi])
    # parabolic refine
    if 0 < lag < len(ac) - 1:
        a, b, c = ac[lag - 1], ac[lag], ac[lag + 1]
        denom = a - 2 * b + c
        if denom != 0:
            lag = lag + 0.5 * (a - c) / denom
    return 60 * frame_rate / lag

print(f"global tempo estimate: {tempo_from(env):.3f} BPM")

# --- per-window tempo (detect tempo changes, e.g. the outro switch) ---
win = int(frame_rate * 20)
step = int(frame_rate * 5)
print("windowed tempo (start_sec, bpm):")
for s in range(0, len(env) - win, step):
    bpm = tempo_from(env[s : s + win])
    print(f"  {flux_t[s]:7.2f}  {bpm:7.3f}")
