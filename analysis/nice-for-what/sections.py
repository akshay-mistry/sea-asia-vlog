#!/usr/bin/env python3
"""Per-bar energy/kick profile on the 93.5 BPM grid."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

SR = 22050
sr_read, y = wavfile.read("analysis/nice-for-what/song-mono-22050.wav")
y = y.astype(np.float64)
dur = len(y) / SR

BPM = 93.5
PERIOD = 60.0 / BPM
PHASE = 0.128

NPERSEG = 1024
HOP = 256
f, t, Z = stft(y, fs=SR, nperseg=NPERSEG, noverlap=NPERSEG - HOP, padded=False)
mag = np.abs(Z)
frame_rate = SR / HOP
low = f < 150
kick = mag[low].sum(axis=0)
kick_n = kick / np.percentile(kick, 99)

print("bar beat  time    rms_db  kick")
n_bars = int((dur - PHASE) / (PERIOD * 4))
peak = np.sqrt((y**2).mean())
for bar in range(n_bars):
    b0 = PHASE + bar * 4 * PERIOD
    b1 = b0 + 4 * PERIOD
    seg = y[int(b0 * SR) : int(b1 * SR)]
    rms = np.sqrt((seg**2).mean())
    db = 20 * np.log10(rms / 32768 + 1e-12)
    i0, i1 = int(b0 * frame_rate), int(b1 * frame_rate)
    kk = np.percentile(kick_n[i0:i1], 90)
    bar_vis = "#" * int(min(kk, 1) * 30)
    print(f"{bar:3d} {bar*4:4d}  {b0:7.2f}  {db:6.1f}  {kk:.2f} {bar_vis}")
