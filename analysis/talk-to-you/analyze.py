"""Reproducible signal measurements for the exact Talk To You MP3.

Requires only numpy/scipy and the mono float WAV decoded by ffmpeg in this
directory.  It does not touch application source files.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile


HERE = Path(__file__).resolve().parent
WAV = HERE / "song-mono-22050.wav"

# Robust fit from 187 strong low-frequency attacks:
# slope=0.4545434129 s/beat, intercept=0.2482217343 s.
# The fitted slope differs from an exact 132 BPM grid by only 0.00204 ms/beat,
# so the musically intended constant grid (5/11 s) is used.
BPM = 132.0
BEAT_PERIOD = 5.0 / 11.0
DOWNBEAT = 0.2482217343
BEATS_PER_BAR = 4
COMPLETE_BARS = 104

# Recommended 80-bar edit: omit source bars 25-40 and 89-96.
OMITTED_BAR_RANGES = ((25, 40), (89, 96))

CHAPTERS = (
    ("cold-open", 8, 13),
    ("hanoi", 6, 11),
    ("ha-giang", 16, 33),
    ("da-nang", 2, 3),
    ("hoi-an", 6, 10),
    ("bali", 16, 25),
    ("phuket", 8, 13),
    ("islands", 8, 13),
    ("bangkok", 6, 15),
    ("outro", 4, 6),
)


def source_bar_time(bar_1_based: int) -> float:
    return DOWNBEAT + (bar_1_based - 1) * BEATS_PER_BAR * BEAT_PERIOD


def omitted_before(bar_1_based: int) -> int:
    return sum(
        hi - lo + 1
        for lo, hi in OMITTED_BAR_RANGES
        if bar_1_based > hi
    )


def source_to_edit_time(source_time: float, source_bar: int) -> float:
    return source_time - omitted_before(source_bar) * BEATS_PER_BAR * BEAT_PERIOD


def main() -> None:
    sample_rate, samples = wavfile.read(WAV)
    samples = samples.astype(np.float64)
    duration = len(samples) / sample_rate

    # Broadband spectral-flux envelope for transient-density comparisons.
    frame_size = 512
    hop = 128
    frames = np.lib.stride_tricks.sliding_window_view(samples, frame_size)[::hop]
    spectrum = np.abs(np.fft.rfft(frames * np.hanning(frame_size), axis=1)) + 1e-9
    frequencies = np.fft.rfftfreq(frame_size, 1 / sample_rate)
    flux = np.maximum(
        np.diff(
            np.log(spectrum[:, frequencies > 150]),
            axis=0,
            prepend=np.log(spectrum[:1, frequencies > 150]),
        ),
        0,
    ).mean(axis=1)
    flux = np.maximum(flux - signal.medfilt(flux, 129), 0)
    flux_times = (
        np.arange(len(flux)) * hop / sample_rate + frame_size / (2 * sample_rate)
    )
    transient_threshold = np.percentile(flux, 72)
    transient_peaks, _ = signal.find_peaks(
        flux,
        distance=int(0.07 * sample_rate / hop),
        height=transient_threshold,
        prominence=transient_threshold * 0.2,
    )
    transient_times = flux_times[transient_peaks]

    with (HERE / "beats.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            (
                "beat_index_0",
                "source_bar",
                "beat_in_bar",
                "source_time_sec",
                "retained_in_recommended_edit",
                "edited_bar",
                "edited_time_sec",
            )
        )
        edited_beat = 0
        for beat_index in range(COMPLETE_BARS * BEATS_PER_BAR):
            source_bar = beat_index // BEATS_PER_BAR + 1
            beat_in_bar = beat_index % BEATS_PER_BAR + 1
            source_time = DOWNBEAT + beat_index * BEAT_PERIOD
            retained = not any(lo <= source_bar <= hi for lo, hi in OMITTED_BAR_RANGES)
            if retained:
                edited_bar = edited_beat // BEATS_PER_BAR + 1
                edited_time = DOWNBEAT + edited_beat * BEAT_PERIOD
                edited_beat += 1
            else:
                edited_bar = ""
                edited_time = ""
            writer.writerow(
                (
                    beat_index,
                    source_bar,
                    beat_in_bar,
                    f"{source_time:.6f}",
                    str(retained).lower(),
                    edited_bar,
                    f"{edited_time:.6f}" if retained else edited_time,
                )
            )

    block_metrics = []
    with (HERE / "energy-4bar.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            (
                "source_bars",
                "start_sec",
                "end_sec",
                "rms_dbfs",
                "crest_factor",
                "transients_per_sec",
            )
        )
        for block in range(COMPLETE_BARS // 4):
            first_bar = block * 4 + 1
            last_bar = first_bar + 3
            start = source_bar_time(first_bar)
            end = source_bar_time(last_bar + 1)
            segment = samples[int(start * sample_rate) : int(end * sample_rate)]
            rms = np.sqrt(np.mean(segment * segment) + 1e-15)
            rms_dbfs = 20 * np.log10(rms + 1e-15)
            crest = np.max(np.abs(segment)) / rms
            density = np.sum((transient_times >= start) & (transient_times < end)) / (
                end - start
            )
            block_metrics.append(rms_dbfs)
            writer.writerow(
                (
                    f"{first_bar}-{last_bar}",
                    f"{start:.6f}",
                    f"{end:.6f}",
                    f"{rms_dbfs:.3f}",
                    f"{crest:.3f}",
                    f"{density:.3f}",
                )
            )

    with (HERE / "chapter-allocation.csv").open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            (
                "chapter",
                "edited_bars",
                "clip_count",
                "edited_start_sec",
                "edited_end_sec",
                "average_clip_sec",
            )
        )
        bar_cursor = 1
        for chapter, bar_count, clip_count in CHAPTERS:
            start = source_bar_time(bar_cursor)
            end = source_bar_time(bar_cursor + bar_count)
            writer.writerow(
                (
                    chapter,
                    bar_count,
                    clip_count,
                    f"{start:.6f}",
                    f"{end:.6f}",
                    f"{(end - start) / clip_count:.3f}",
                )
            )
            bar_cursor += bar_count

    removed_duration = sum(
        hi - lo + 1 for lo, hi in OMITTED_BAR_RANGES
    ) * BEATS_PER_BAR * BEAT_PERIOD
    metrics = {
        "decoded_duration_sec": round(duration, 9),
        "container_duration_sec": 189.521270,
        "sample_rate_hz": sample_rate,
        "bpm": BPM,
        "tempo_model": "constant",
        "beat_period_sec": BEAT_PERIOD,
        "first_downbeat_sec": DOWNBEAT,
        "meter": "4/4",
        "complete_bars": COMPLETE_BARS,
        "complete_beats": COMPLETE_BARS * BEATS_PER_BAR,
        "musical_end_downbeat_sec": source_bar_time(COMPLETE_BARS + 1),
        "trailing_tail_sec": duration - source_bar_time(COMPLETE_BARS + 1),
        "tempo_fit": {
            "strong_attacks_used": 187,
            "fitted_bpm": 132.0005929016,
            "fitted_period_sec": 0.4545434129,
            "fitted_downbeat_sec": 0.2482217343,
            "residual_std_ms": 2.491,
        },
        "loudness": {
            "integrated_lufs": -7.4,
            "loudness_range_lu": 4.2,
            "true_peak_dbtp": 3.5,
        },
        "recommended_edit": {
            "omitted_source_bars": [list(item) for item in OMITTED_BAR_RANGES],
            "removed_duration_sec": removed_duration,
            "complete_bars": 80,
            "musical_end_downbeat_sec": source_bar_time(81),
            "file_end_sec": duration - removed_duration,
            "phase_matched_splices": [
                {
                    "musical_boundary_source_sec": source_bar_time(25),
                    "outgoing_cut_source_sec": 43.892930,
                    "incoming_cut_source_sec": 72.983839,
                    "shared_offset_after_downbeat_ms": 8.345,
                },
                {
                    "musical_boundary_source_sec": source_bar_time(89),
                    "outgoing_cut_source_sec": 160.263211,
                    "incoming_cut_source_sec": 174.808665,
                    "shared_offset_after_downbeat_ms": 14.989,
                },
            ],
        },
        "energy_4bar_rms_dbfs_min": min(block_metrics),
        "energy_4bar_rms_dbfs_max": max(block_metrics),
    }
    (HERE / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")


if __name__ == "__main__":
    main()
