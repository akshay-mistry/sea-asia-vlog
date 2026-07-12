import beatsData from '../../data/beats.json';

export const FPS = 60;
export const BPM = beatsData.bpm;
export const BEAT_SEC = beatsData.beatPeriodSec;
export const PHASE_SEC = beatsData.phaseSec;
export const MUSIC_DURATION_SEC = beatsData.durationSec;

/** Absolute time (sec) of beat n on the continuous grid. */
export const beatTime = (n: number): number => PHASE_SEC + n * BEAT_SEC;

/** Composition frame of beat n. Max error is half a frame. */
export const beatFrame = (n: number): number => Math.round(beatTime(n) * FPS);

/** Duration in frames between two beats. */
export const beatsToFrames = (from: number, to: number): number =>
  beatFrame(to) - beatFrame(from);

export const TOTAL_FRAMES = Math.ceil(MUSIC_DURATION_SEC * FPS);

export const LANDMARKS = beatsData.landmarks;
