#!/usr/bin/env python3
"""Verify the spliced edit: drop-1 kick time, grid score, splice continuity."""
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

subprocess.run(
    [
        "ffmpeg", "-hide_banner", "-y", "-i", "public/nice-for-what-edit.wav",
        "-ac", "1", "-ar", "22050", "/tmp/nfw-edit-mono.wav",
    ],
    check=True,
    capture_output=True,
)
sr, y = wavfile.read("/tmp/nfw-edit-mono.wav")
y = y.astype(np.float64)
dur = len(y) / sr

NPERSEG = 1024
HOP = 256
f, t, Z = stft(y, fs=sr, nperseg=NPERSEG, noverlap=NPERSEG - HOP, padded=False)
mag = np.abs(Z)
frame_rate = sr / HOP
low = f < 150
kick_flux = np.maximum(mag[low, 1:] - mag[low, :-1], 0).sum(axis=0)
flux_t = t[1:]

PERIOD = 60.0 / 93.5
PHASE = 0.128

# first strong kick after 15s (expected: beat 32 = 20.663)
sec = (flux_t > 15) & (flux_t < 25)
th = kick_flux[sec].max() * 0.5
first = flux_t[sec][np.argmax(kick_flux[sec] > th)]
expected = PHASE + 32 * PERIOD
print(f"first kick: {first:.3f}s, expected beat32 at {expected:.3f}s, offset {first - expected:+.3f}s")

# drop 2 expected at beat 112
sec2 = (flux_t > 66) & (flux_t < 76)
th2 = kick_flux[sec2].max() * 0.5
d2 = flux_t[sec2][np.argmax(kick_flux[sec2] > th2)]
exp2 = PHASE + 112 * PERIOD
print(f"drop2 kick: {d2:.3f}s, expected beat112 at {exp2:.3f}s, offset {d2 - exp2:+.3f}s")

# on-beat vs off-beat grid score over the whole edit body
env = np.maximum(mag[:, 1:] - mag[:, :-1], 0).sum(axis=0)
env = env - np.convolve(env, np.ones(int(frame_rate)) / int(frame_rate), mode="same")
env = np.maximum(env, 0)


def score(phase, t0, t1):
    beats = np.arange(phase, dur, PERIOD)
    beats = beats[(beats >= t0) & (beats < t1)]
    idx = np.clip((beats * frame_rate).astype(int), 0, len(env) - 1)
    return env[idx].mean()


on = score(PHASE, 21, 154)
off = score(PHASE + PERIOD / 2, 21, 154)
print(f"grid score body: on {on:.2f} off {off:.2f} ratio {on/off:.2f}")

# best phase overall
best = (0, 0)
for ph in np.arange(0, PERIOD, 0.004):
    s = score(ph, 21, 154)
    if s > best[0]:
        best = (s, ph)
print(f"best phase in edit: {best[1]:.3f} (design {PHASE})")

# rms around splices at 10.395 and 61.732 (checking no click/level jump)
for splice in (10.395, 61.732):
    a = y[int((splice - 0.5) * sr) : int(splice * sr)]
    b = y[int(splice * sr) : int((splice + 0.5) * sr)]
    ra = 20 * np.log10(np.sqrt((a**2).mean()) + 1e-9)
    rb = 20 * np.log10(np.sqrt((b**2).mean()) + 1e-9)
    print(f"splice {splice}: rms before {ra:.1f} dB, after {rb:.1f} dB")
