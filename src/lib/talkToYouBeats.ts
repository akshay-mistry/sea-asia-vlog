import beatsData from '../../data/talk-to-you-beats.json';

export const TALK_FPS = 60;
export const TALK_BPM = beatsData.bpm;
export const TALK_BEAT_SEC = beatsData.beatPeriodSec;
export const TALK_PHASE_SEC = beatsData.phaseSec;
export const TALK_MUSIC_DURATION_SEC = beatsData.durationSec;

export const talkBeatTime = (beat: number): number =>
  TALK_PHASE_SEC + beat * TALK_BEAT_SEC;

export const talkBeatFrame = (beat: number): number =>
  Math.round(talkBeatTime(beat) * TALK_FPS);

export const TALK_TOTAL_FRAMES = Math.ceil(
  TALK_MUSIC_DURATION_SEC * TALK_FPS
);

export const TALK_LANDMARKS = beatsData.landmarks;
