"""Detect sound-design events (whooshes, risers, sub impacts) in the sample audio.

Method: STFT band energies. A whoosh = broadband high-frequency noise burst that
rises then falls over 0.2-0.8s, typically centered on a visual cut. A sub impact
= short low-band (25-90 Hz) burst. A riser = sustained multi-second increase in
high-band energy leading into a boundary.
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

BOUNDS = {
    1: [2.52, 2.88, 3.2, 3.48, 3.6, 4.96, 5.56, 6.2, 7.0, 7.44, 8.16, 8.96,
        9.52, 10.04, 10.16, 11.44, 11.84, 12.64, 13.12, 13.88, 14.84, 15.64,
        16.56, 16.72],
    2: [4.792, 5.833, 7.75, 9.083, 10.958, 12.542, 14.417, 15.25, 17.083,
        18.667, 19.5, 21.458, 21.875, 23.042],
    3: [2.533, 8.433, 10.433, 11.033, 11.133, 14.567, 20.7],
    4: [1.794, 5.339, 7.925, 8.467, 11.845],
}


def analyze(path, sid):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x /= (np.abs(x).max() + 1e-9)

    nper = 2048
    f, t, Z = stft(x, fs=sr, nperseg=nper, noverlap=nper - 512)
    P = np.abs(Z) ** 2

    def band(lo, hi):
        m = (f >= lo) & (f < hi)
        return P[m].sum(axis=0)

    sub = band(25, 90)
    low = band(90, 400)
    mid = band(400, 3000)
    high = band(5000, 14000)
    total = P.sum(axis=0) + 1e-12

    # high-band ratio: fraction of energy that is hissy/noisy
    hr = high / total
    # smooth
    k = 5
    hr_s = np.convolve(hr, np.ones(k) / k, mode='same')
    sub_db = 10 * np.log10(sub + 1e-12)
    hi_db = 10 * np.log10(high + 1e-12)

    med_hr = np.median(hr_s)
    med_hi = np.median(hi_db)
    med_sub = np.median(sub_db)

    print(f'\n===== sample{sid} ===== sr={sr} dur={len(x)/sr:.2f}s')
    print(f'median high-ratio={med_hr:.3f}  median hi_db={med_hi:.1f}  median sub_db={med_sub:.1f}')

    # examine a +-0.6s window around each known visual boundary
    print('--- boundary windows: (pre-peak hi ramp?, hi burst dB over median, sub hit dB over median)')
    for b in BOUNDS[sid]:
        w0, w1 = b - 0.6, b + 0.4
        m = (t >= w0) & (t <= w1)
        if not m.any():
            continue
        hi_burst = hi_db[m].max() - med_hi
        sub_m = (t >= b - 0.1) & (t <= b + 0.25)
        sub_hit = sub_db[sub_m].max() - med_sub if sub_m.any() else 0
        # ramp: is hi energy rising into the boundary?
        pre = (t >= b - 0.8) & (t < b)
        ramp = 0.0
        if pre.sum() > 4:
            seg = hi_db[pre]
            ramp = seg[-3:].mean() - seg[:3].mean()
        flag = []
        if hi_burst > 12:
            flag.append('HI-BURST')
        if sub_hit > 10:
            flag.append('SUB-HIT')
        if ramp > 8:
            flag.append('RISE-IN')
        print(f'  t={b:7.3f}  hiburst={hi_burst:5.1f}dB ramp={ramp:5.1f}dB subhit={sub_hit:5.1f}dB  {" ".join(flag)}')

    # global whoosh candidates: hi-ratio peaks well above median lasting 0.15-1s
    thresh = med_hr * 2.5
    above = hr_s > thresh
    events = []
    i = 0
    while i < len(above):
        if above[i]:
            j = i
            while j < len(above) and above[j]:
                j += 1
            dur = t[min(j, len(t) - 1)] - t[i]
            if 0.08 <= dur <= 1.5:
                events.append((t[i], dur))
            i = j
        else:
            i += 1
    print(f'--- global high-noise events (ratio>{thresh:.2f}, 0.08-1.5s): {len(events)}')
    for e in events[:40]:
        near = min(BOUNDS[sid], key=lambda b: abs(b - e[0]))
        print(f'  start={e[0]:7.3f} dur={e[1]:.2f}s  nearest-cut={near:7.3f} (d={e[0]-near:+.2f}s)')


for sid in (1, 2, 3, 4):
    analyze(f'analysis/fx/sample{sid}-44k.wav', sid)
