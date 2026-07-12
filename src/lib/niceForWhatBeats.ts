import beatsData from '../../data/nice-for-what-beats.json';

export const NFW_FPS = 60;
export const NFW_BPM = beatsData.bpm;
export const NFW_BEAT_SEC = beatsData.beatPeriodSec;
export const NFW_PHASE_SEC = beatsData.phaseSec;
export const NFW_MUSIC_DURATION_SEC = beatsData.durationSec;

/** Second where beat n lands in the edited track. */
export const nfwBeatTime = (beat: number): number =>
  NFW_PHASE_SEC + beat * NFW_BEAT_SEC;

/** Composition frame of beat n. Max error is half a frame. */
export const nfwBeatFrame = (beat: number): number =>
  Math.round(nfwBeatTime(beat) * NFW_FPS);

export const NFW_TOTAL_FRAMES = Math.ceil(NFW_MUSIC_DURATION_SEC * NFW_FPS);

export const NFW_LANDMARKS = beatsData.landmarks;
