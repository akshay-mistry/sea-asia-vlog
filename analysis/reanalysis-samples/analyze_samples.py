#!/usr/bin/env python3
"""Measure short-form editing characteristics of the user-provided vlog samples."""

from __future__ import annotations

import json
import math
import re
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import signal


ROOT = Path(__file__).resolve().parents[2]
SAMPLES = ROOT / "vlog-samples"
OUT = Path(__file__).resolve().parent


def run(args: list[str], *, text: bool = True) -> str | bytes:
    result = subprocess.run(args, check=True, capture_output=True, text=text)
    return result.stdout


def ffprobe(path: Path) -> dict:
    return json.loads(
        run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                (
                    "format=filename,duration,size,bit_rate:"
                    "stream=index,codec_type,codec_name,width,height,"
                    "r_frame_rate,avg_frame_rate,sample_rate,channels,channel_layout"
                ),
                "-of",
                "json",
                str(path),
            ]
        )
    )


def rate(value: str) -> float:
    numerator, denominator = value.split("/")
    return float(numerator) / float(denominator)


def scene_cuts(path: Path, threshold: float) -> list[dict]:
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "info",
            "-i",
            str(path),
            "-vf",
            f"select='gt(scene,{threshold})',metadata=print",
            "-an",
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    lines = proc.stderr.splitlines()
    found: list[dict] = []
    current_time: float | None = None
    for line in lines:
        match = re.search(r"pts_time:([0-9.]+)", line)
        if match:
            current_time = float(match.group(1))
        match = re.search(r"lavfi\.scene_score=([0-9.]+)", line)
        if match and current_time is not None:
            found.append({"time": round(current_time, 4), "score": round(float(match.group(1)), 5)})
            current_time = None
    return found


def raw_frames(path: Path, fps: float, pix_fmt: str, width: int, height: int) -> np.ndarray:
    channels = 1 if pix_fmt == "gray" else 3
    payload = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(path),
            "-vf",
            f"fps={fps},scale={width}:{height}:flags=area",
            "-f",
            "rawvideo",
            "-pix_fmt",
            pix_fmt,
            "-",
        ],
        text=False,
    )
    array = np.frombuffer(payload, dtype=np.uint8)
    complete = array.size // (width * height * channels)
    if channels == 1:
        return array[: complete * width * height].reshape(complete, height, width)
    return array[: complete * width * height * channels].reshape(complete, height, width, channels)


def visual_metrics(path: Path, duration: float) -> dict:
    analysis_fps = 12.0
    frames = raw_frames(path, analysis_fps, "gray", 160, 90).astype(np.float32)
    diffs = np.mean(np.abs(np.diff(frames, axis=0)), axis=(1, 2))
    timestamps = np.arange(1, len(frames)) / analysis_fps
    freeze_mask = diffs < 0.45
    freeze_runs = runs(freeze_mask, timestamps, 1 / analysis_fps, minimum=0.22)

    # Tiny 8x8 grayscale fingerprints expose exact/near-exact replayed frames.
    tiny = frames.reshape(len(frames), 8, 20, 8, 11.25) if False else None
    fingerprints = raw_frames(path, 4.0, "gray", 16, 9).astype(np.float32)
    normalized = fingerprints - fingerprints.mean(axis=(1, 2), keepdims=True)
    norms = np.linalg.norm(normalized.reshape(len(normalized), -1), axis=1) + 1e-6
    repeated: list[dict] = []
    for i in range(len(normalized)):
        for j in range(i + 4, len(normalized)):
            similarity = float(
                np.dot(normalized[i].ravel(), normalized[j].ravel()) / (norms[i] * norms[j])
            )
            if similarity > 0.992:
                repeated.append(
                    {
                        "first": round(i / 4.0, 3),
                        "second": round(j / 4.0, 3),
                        "similarity": round(similarity, 5),
                    }
                )
    # Keep only the strongest, nonredundant repeats.
    repeated.sort(key=lambda item: item["similarity"], reverse=True)
    compact_repeats: list[dict] = []
    for item in repeated:
        if not any(
            abs(item["first"] - old["first"]) < 0.4
            and abs(item["second"] - old["second"]) < 0.4
            for old in compact_repeats
        ):
            compact_repeats.append(item)
        if len(compact_repeats) == 30:
            break

    rgb = raw_frames(path, 2.0, "rgb24", 96, 54).astype(np.float32) / 255.0
    maximum = rgb.max(axis=3)
    minimum = rgb.min(axis=3)
    saturation = np.where(maximum > 0, (maximum - minimum) / np.maximum(maximum, 1e-6), 0)
    luma = 0.2126 * rgb[:, :, :, 0] + 0.7152 * rgb[:, :, :, 1] + 0.0722 * rgb[:, :, :, 2]
    edge_contrast = np.mean(
        np.abs(np.diff(luma, axis=1)), axis=(1, 2)
    ) + np.mean(np.abs(np.diff(luma, axis=2)), axis=(1, 2))

    border = max(1, int(rgb.shape[1] * 0.08))
    top = luma[:, :border, :].mean(axis=(1, 2))
    bottom = luma[:, -border:, :].mean(axis=(1, 2))
    center = luma[:, border:-border, :].mean(axis=(1, 2))
    likely_bars = (top < 0.035) & (bottom < 0.035) & (center > 0.08)

    return {
        "analysis_fps": analysis_fps,
        "frame_difference": {
            "median": round(float(np.median(diffs)), 4),
            "p90": round(float(np.percentile(diffs, 90)), 4),
            "p99": round(float(np.percentile(diffs, 99)), 4),
            "largest": [
                {"time": round(float(timestamps[i]), 3), "difference": round(float(diffs[i]), 4)}
                for i in np.argsort(diffs)[-15:][::-1]
            ],
        },
        "freeze_like_runs": freeze_runs,
        "repeated_frame_candidates": compact_repeats,
        "color_texture_2fps": {
            "mean_luma": round(float(luma.mean()), 4),
            "luma_p10": round(float(np.percentile(luma, 10)), 4),
            "luma_p90": round(float(np.percentile(luma, 90)), 4),
            "mean_saturation": round(float(saturation.mean()), 4),
            "mean_edge_contrast": round(float(edge_contrast.mean()), 4),
            "likely_letterbox_fraction": round(float(likely_bars.mean()), 4),
            "per_half_second": [
                {
                    "time": round(i / 2.0, 3),
                    "luma": round(float(luma[i].mean()), 4),
                    "saturation": round(float(saturation[i].mean()), 4),
                    "edge_contrast": round(float(edge_contrast[i]), 4),
                    "likely_letterbox": bool(likely_bars[i]),
                }
                for i in range(len(rgb))
                if i / 2.0 <= duration
            ],
        },
    }


def runs(mask: np.ndarray, timestamps: np.ndarray, step: float, minimum: float) -> list[dict]:
    output: list[dict] = []
    start: int | None = None
    for index, value in enumerate(np.r_[mask, False]):
        if value and start is None:
            start = index
        elif not value and start is not None:
            end = index - 1
            start_time = float(timestamps[start] - step)
            end_time = float(timestamps[end])
            if end_time - start_time >= minimum:
                output.append(
                    {
                        "start": round(max(0, start_time), 3),
                        "end": round(end_time, 3),
                        "duration": round(end_time - max(0, start_time), 3),
                    }
                )
            start = None
    return output


def audio_metrics(path: Path, duration: float) -> dict:
    wav_path = OUT / f"{path.stem}.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "22050",
            "-c:a",
            "pcm_s16le",
            str(wav_path),
        ],
        check=True,
    )
    with wave.open(str(wav_path), "rb") as handle:
        sr = handle.getframerate()
        audio = np.frombuffer(handle.readframes(handle.getnframes()), dtype=np.int16).astype(np.float32)
    audio /= 32768.0

    hop = 256
    nperseg = 1024
    _, times, spectrum = signal.stft(
        audio, fs=sr, window="hann", nperseg=nperseg, noverlap=nperseg - hop, padded=False
    )
    magnitude = np.abs(spectrum)
    flux = np.maximum(0, np.diff(magnitude, axis=1)).sum(axis=0)
    flux = np.r_[0.0, flux]
    smooth = signal.savgol_filter(flux, 9, 2) if len(flux) >= 9 else flux
    prominence = max(float(np.std(smooth)) * 0.35, 1e-6)
    peaks, properties = signal.find_peaks(
        smooth, distance=max(1, int(0.19 * sr / hop)), prominence=prominence
    )
    onset_times = times[peaks]
    strengths = smooth[peaks]

    # Tempo from onset-envelope autocorrelation, constrained to 70–180 BPM.
    centered = smooth - smooth.mean()
    autocorrelation = signal.correlate(centered, centered, mode="full", method="fft")
    autocorrelation = autocorrelation[len(autocorrelation) // 2 :]
    min_lag = int((60 / 180) * sr / hop)
    max_lag = int((60 / 70) * sr / hop)
    lag = min_lag + int(np.argmax(autocorrelation[min_lag : max_lag + 1]))
    tempo = 60.0 / (lag * hop / sr)
    beat_period = 60.0 / tempo

    # Find beat-grid phase maximizing nearby onset strength.
    candidates = np.linspace(0, beat_period, 240, endpoint=False)
    phase_scores = []
    for phase in candidates:
        grid = np.arange(phase, duration + beat_period, beat_period)
        distances = np.min(np.abs(onset_times[:, None] - grid[None, :]), axis=1)
        phase_scores.append(float(np.sum(strengths * np.exp(-0.5 * (distances / 0.055) ** 2))))
    phase = float(candidates[int(np.argmax(phase_scores))])
    beats = np.arange(phase, duration + 1e-6, beat_period)

    window = max(1, int(0.05 * sr))
    squared = np.convolve(audio * audio, np.ones(window) / window, mode="same")
    rms = np.sqrt(np.maximum(squared, 1e-12))
    rms_db = 20 * np.log10(rms + 1e-9)
    sample_times = np.arange(len(audio)) / sr
    quiet = rms_db < -38
    quiet_runs = runs(quiet, sample_times, 1 / sr, minimum=0.18)

    # Stereo-channel decorrelation hints at ambience mixed under centered music/dialogue.
    return {
        "sample_rate": sr,
        "estimated_tempo_bpm": round(float(tempo), 3),
        "estimated_beat_period": round(float(beat_period), 5),
        "estimated_beat_phase": round(phase, 5),
        "beat_grid": [round(float(value), 4) for value in beats],
        "onsets": [
            {"time": round(float(time), 4), "strength": round(float(strength), 4)}
            for time, strength in zip(onset_times, strengths)
        ],
        "quiet_runs_below_minus_38db": quiet_runs,
        "rms_db": {
            "median": round(float(np.median(rms_db)), 3),
            "p10": round(float(np.percentile(rms_db, 10)), 3),
            "p90": round(float(np.percentile(rms_db, 90)), 3),
        },
    }


def make_contact_sheet(path: Path, duration: float, interval: float = 0.5) -> None:
    thumb_width, thumb_height = 319, 180
    frames = raw_frames(path, 1 / interval, "rgb24", thumb_width, thumb_height)
    cols = 4
    label_height = 22
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGB", (cols * thumb_width, rows * (thumb_height + label_height)), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=16)
    for index, frame in enumerate(frames):
        image = Image.fromarray(frame)
        x = (index % cols) * thumb_width
        y = (index // cols) * (thumb_height + label_height)
        sheet.paste(image, (x, y))
        draw.rectangle((x, y + thumb_height, x + thumb_width, y + thumb_height + label_height), fill="black")
        draw.text((x + 5, y + thumb_height + 3), f"{index * interval:06.2f}s", fill="white", font=font)
    sheet.save(OUT / f"{path.stem}-contact-500ms.jpg", quality=92)


def make_boundary_sheet(path: Path, cuts: list[dict], duration: float) -> None:
    times = sorted(
        {
            round(max(0.0, min(duration - 0.001, value)), 3)
            for cut in cuts
            for value in (cut["time"] - 0.08, cut["time"] + 0.08)
        }
    )
    if not times:
        return
    images: list[Image.Image] = []
    for time in times:
        payload = run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-ss",
                str(time),
                "-i",
                str(path),
                "-frames:v",
                "1",
                "-vf",
                "scale=319:180:force_original_aspect_ratio=decrease,pad=319:180:(ow-iw)/2:(oh-ih)/2",
                "-f",
                "image2pipe",
                "-vcodec",
                "png",
                "-",
            ],
            text=False,
        )
        import io

        images.append(Image.open(io.BytesIO(payload)).convert("RGB"))
    cols = 4
    label_height = 22
    rows = math.ceil(len(images) / cols)
    sheet = Image.new("RGB", (cols * 319, rows * 202), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=16)
    for index, (image, time) in enumerate(zip(images, times)):
        x = (index % cols) * 319
        y = (index // cols) * 202
        sheet.paste(image, (x, y))
        draw.rectangle((x, y + 180, x + 319, y + 202), fill="black")
        draw.text((x + 5, y + 183), f"{time:06.3f}s", fill="white", font=font)
    sheet.save(OUT / f"{path.stem}-boundaries.jpg", quality=92)


def main() -> None:
    results: dict[str, dict] = {}
    for path in sorted(SAMPLES.glob("*.mp4")):
        metadata = ffprobe(path)
        video = next(stream for stream in metadata["streams"] if stream["codec_type"] == "video")
        duration = float(metadata["format"]["duration"])
        fps = rate(video["avg_frame_rate"])
        cuts = {str(threshold): scene_cuts(path, threshold) for threshold in (0.05, 0.1, 0.18, 0.28)}
        results[path.name] = {
            "metadata": metadata,
            "derived": {
                "duration": round(duration, 6),
                "fps": round(fps, 6),
                "display_aspect_ratio": round(video["width"] / video["height"], 6),
            },
            "scene_candidates": cuts,
            "visual": visual_metrics(path, duration),
            "audio": audio_metrics(path, duration),
        }
        make_contact_sheet(path, duration)
        make_boundary_sheet(path, cuts["0.1"], duration)

    (OUT / "measurements.json").write_text(json.dumps(results, indent=2) + "\n")
    print(json.dumps({name: data["derived"] for name, data in results.items()}, indent=2))


if __name__ == "__main__":
    main()
