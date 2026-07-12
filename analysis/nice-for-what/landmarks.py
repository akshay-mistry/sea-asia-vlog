#!/usr/bin/env python3
"""Find exact landmarks: kick entry, vocal loop start, downbeat phase, switch point."""
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
frame_rate = SR / HOP

low = f < 150
kick_flux = np.maximum(mag[low, 1:] - mag[low, :-1], 0).sum(axis=0)
flux_t = t[1:]

BPM = 93.5
PERIOD = 60.0 / BPM
PHASE = 0.128

# 1. exact first kick: first frame in 30-40s where kick_flux exceeds 50% of section max
sec = (flux_t > 30) & (flux_t < 42)
th = kick_flux[sec].max() * 0.5
first_kick_t = flux_t[sec][np.argmax(kick_flux[sec] > th)]
print(f"first strong kick: {first_kick_t:.3f}s")
# nearest grid beat
n = round((first_kick_t - PHASE) / PERIOD)
print(f"  nearest beat n={n} at {PHASE + n * PERIOD:.3f}s (offset {first_kick_t - PHASE - n * PERIOD:+.3f}s)")

# 2. downbeat phase: among the 4 beat classes, which has most kick energy (36-78s)
for k in range(4):
    beats = PHASE + (np.arange(0, 400) * 4 + k) * PERIOD
    beats = beats[(beats > 36) & (beats < 180)]
    idx = np.clip((beats * frame_rate).astype(int), 0, len(kick_flux) - 1)
    # window +-2 frames
    vals = [kick_flux[max(0, i - 2) : i + 3].max() for i in idx]
    print(f"beat class {k}: mean kick {np.mean(vals):.1f}")

# 3. full-band RMS at 0.25s resolution around key transitions
def rms_scan(t0, t1, step=0.25):
    print(f"-- rms scan {t0}-{t1}")
    for s in np.arange(t0, t1, step):
        seg = y[int(s * SR) : int((s + step) * SR)]
        db = 20 * np.log10(np.sqrt((seg**2).mean()) / 32768 + 1e-12)
        # relative-ish print
        print(f"  {s:7.2f}  {db:6.1f}")

rms_scan(14.0, 18.0)      # vocal loop start
rms_scan(177.0, 184.0)    # switch point
rms_scan(209.0, 215.0)    # slow section start

# 4. tempo & grid phase drift check: optimize phase separately in late body
def grid_score(period, phase, t0, t1):
    env = np.maximum(mag[:, 1:] - mag[:, :-1], 0).sum(axis=0)
    env = env - np.convolve(env, np.ones(int(frame_rate)) / int(frame_rate), mode="same")
    env = np.maximum(env, 0)
    beats = np.arange(phase, dur, period)
    beats = beats[(beats >= t0) & (beats < t1)]
    idx = np.clip((beats * frame_rate).astype(int), 0, len(env) - 1)
    return env[idx].mean()

for t0, t1 in [(36, 96), (96, 156), (140, 190)]:
    best = (0, 0)
    for ph in np.arange(0, PERIOD, 0.005):
        s = grid_score(PERIOD, ph, t0, t1)
        if s > best[0]:
            best = (s, ph)
    print(f"window {t0}-{t1}: best phase {best[1]:.3f} (global {PHASE})")

# 5. slow outro tempo
def tempo_from(env_seg):
    e = env_seg - env_seg.mean()
    ac = np.correlate(e, e, mode="full")[len(e) - 1 :]
    lo = int(frame_rate * 60 / 120)
    hi = int(frame_rate * 60 / 60)
    lag = lo + np.argmax(ac[lo:hi])
    return 60 * frame_rate / lag

env_full = np.maximum(mag[:, 1:] - mag[:, :-1], 0).sum(axis=0)
i0, i1 = int(212 * frame_rate), int(256 * frame_rate)
print(f"slow outro tempo (60-120 range): {tempo_from(env_full[i0:i1]):.2f} BPM")
