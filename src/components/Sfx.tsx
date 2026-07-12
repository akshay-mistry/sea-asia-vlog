import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {beatFrame, FPS} from '../lib/beats';
import {CHAPTERS} from '../lib/timeline';

/**
 * Sound-design layer modeled on the reference vlogs:
 * - risers (rising noise sweeps) that END exactly on a drop/phrase boundary
 * - whooshes whose PEAK lands on every whip/burst transition
 * - sub-bass impacts that land ON the big slams and chapter starts
 * Levels sit 8-14 dB under the music bed so they read as texture, not FX demo.
 */

const WHOOSH_PEAK_SEC = 0.3; // peak sits at 55% of the 0.55s file
const RISER_LONG_SEC = 2.7;
const RISER_SHORT_SEC = 0.9;

/** Big moments: full riser into the slam + full impact on it.
 *  Drop 3's audible bass slam sits at beat 82, not the beat-81 grid line;
 *  the final slam begins at beat 319 (measured), where the end card cuts in. */
const DROPS = [17, 49, 82, 319];
/** Phrase boundaries that open a chapter: short riser + soft impact.
 *  Da Nang's bass accent is measured at beat 113.75, not the 113 grid line. */
const PHRASES = [25, 113.75, 145, 177, 209, 241, 273];

type Cue = {file: string; frame: number; volume: number};

const buildCues = (): Cue[] => {
  const cues: Cue[] = [];

  for (const b of DROPS) {
    cues.push({
      file: 'riser-long.wav',
      frame: beatFrame(b) - Math.round(RISER_LONG_SEC * FPS),
      volume: 0.34,
    });
    cues.push({file: 'impact.wav', frame: beatFrame(b), volume: 0.5});
  }

  for (const b of PHRASES) {
    cues.push({
      file: 'riser-short.wav',
      frame: beatFrame(b) - Math.round(RISER_SHORT_SEC * FPS),
      volume: 0.26,
    });
    cues.push({file: 'impact-soft.wav', frame: beatFrame(b), volume: 0.4});
  }

  // whoosh on every whip/burst transition, peak on the cut itself
  for (const chapter of CHAPTERS) {
    let beatCursor = chapter.startBeat;
    for (const shot of chapter.shots) {
      if (shot.whip || shot.burst) {
        cues.push({
          file: 'whoosh.wav',
          frame: beatFrame(beatCursor) - Math.round(WHOOSH_PEAK_SEC * FPS),
          volume: 0.3,
        });
      }
      if (shot.bw) {
        // camera-shutter tick as the viewfinder overlay appears
        cues.push({
          file: 'shutter.wav',
          frame: beatFrame(beatCursor) + 2,
          volume: 0.4,
        });
      }
      beatCursor += shot.beats;
    }
  }

  return cues.filter((c) => c.frame >= 0);
};

const CUES = buildCues();

export const Sfx: React.FC = () => {
  return (
    <>
      {CUES.map((cue, i) => (
        <Sequence key={i} from={cue.frame} durationInFrames={Math.round(3 * FPS)}>
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
