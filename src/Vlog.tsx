import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {beatFrame, TOTAL_FRAMES} from './lib/beats';
import {CHAPTERS, END_CARD_BEAT} from './lib/timeline';
import {Shot} from './components/Shot';
import {CinematicFrame} from './components/CinematicFrame';
import {TitleFlicker} from './components/TitleFlicker';
import {LocationCard} from './components/LocationCard';
import {EndCard} from './components/EndCard';
import {Sfx} from './components/Sfx';
import {ImpactFlash, MonoFlash} from './components/Punctuation';
import {MatteOverlay} from './components/MatteOverlay';

const TITLE_BEAT = 17; // drop 1: title slam
const TITLE_LEN_BEATS = 8;

/** Dissolve length between outro shots (0.33s at 60fps). */
const OUTRO_XFADE_FRAMES = 20;

/** Exposure-flash beats: the three drops (drop 3's audible slam is at 82). */
const FLASH_BEATS = [17, 49, 82];

/** Windows (in beats) where natural clip audio plays: duck the music bed
 *  ~7 dB with short ramps, like rule 10 of the sample analysis. */
const DUCK_WINDOWS: Array<[number, number]> = [
  [0, 10], // cold-open arrival / van / first walk
  [43, 45], // sleeper bus
  [143, 145], // plane cabin hop
  [305, 307], // airport walk home
];

const DUCK_RAMP_FRAMES = 20;
const DUCK_LEVEL = 0.5;

const musicVolume = (frame: number): number => {
  let v = 1;
  for (const [b0, b1] of DUCK_WINDOWS) {
    const f0 = beatFrame(b0);
    const f1 = beatFrame(b1);
    const inRamp = interpolate(
      frame,
      [f0 - DUCK_RAMP_FRAMES, f0, f1, f1 + DUCK_RAMP_FRAMES],
      [1, DUCK_LEVEL, DUCK_LEVEL, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );
    v = Math.min(v, inRamp);
  }
  return v;
};

export const Vlog: React.FC = () => {
  const endCardStart = beatFrame(END_CARD_BEAT);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio src={staticFile('music-edit.wav')} volume={musicVolume} />
      <Sfx />

      <CinematicFrame>
        {CHAPTERS.map((chapter) => {
          let beatCursor = chapter.startBeat;
          // the outro dissolves between shots instead of hard-cutting:
          // each shot runs long under the next one, which fades in on top
          const xfade = chapter.id === 'outro' ? OUTRO_XFADE_FRAMES : 0;
          return (
            <React.Fragment key={chapter.id}>
              {chapter.shots.map((shot, i) => {
                const from = beatFrame(beatCursor);
                const to = beatFrame(beatCursor + shot.beats);
                beatCursor += shot.beats;
                const isLast = i === chapter.shots.length - 1;
                const tail = xfade && !isLast ? xfade : 0;
                return (
                  <Sequence
                    key={`${chapter.id}-${i}`}
                    from={from}
                    durationInFrames={to - from + tail}
                  >
                    <FadeIn frames={xfade && i > 0 ? xfade : 0}>
                      <Shot shot={shot} durationFrames={to - from + tail} />
                    </FadeIn>
                  </Sequence>
                );
              })}
              {chapter.card ? (
                (() => {
                  const cardStart = chapter.startBeat + (chapter.cardDelayBeats ?? 0);
                  const cardLen =
                    beatFrame(cardStart + (chapter.cardBeats ?? 8)) -
                    beatFrame(cardStart);
                  return (
                    <Sequence from={beatFrame(cardStart)} durationInFrames={cardLen}>
                      <LocationCard
                        name={chapter.name}
                        sub={chapter.sub}
                        durationFrames={cardLen}
                      />
                    </Sequence>
                  );
                })()
              ) : null}
            </React.Fragment>
          );
        })}

        {/* cold-open kicker tease */}
        <Sequence from={beatFrame(4)} durationInFrames={beatFrame(12) - beatFrame(4)}>
          <ColdOpenTease />
        </Sequence>

        {/* drop-1 title slam */}
        <Sequence
          from={beatFrame(TITLE_BEAT)}
          durationInFrames={beatFrame(TITLE_BEAT + TITLE_LEN_BEATS) - beatFrame(TITLE_BEAT)}
        >
          <TitleFlicker
            kicker="POST GRAD TRIP"
            word="SOUTHEAST ASIA"
            durationFrames={
              beatFrame(TITLE_BEAT + TITLE_LEN_BEATS) - beatFrame(TITLE_BEAT)
            }
          />
        </Sequence>

        {/* text-behind-subject passes (sample4's "people in front of the
            title" look): alpha-matte foreground copies of the shot,
            layered above the location card. Mattes are cut from the same
            trim point as the shot, so frame 0 lines up exactly. */}
        {/* HOI AN card: the crew walks in front of the text on arrival */}
        <Sequence from={beatFrame(119)} durationInFrames={beatFrame(121) - beatFrame(119)}>
          <MatteOverlay src="mattes/hoian-arrival-fg.webm" burst />
        </Sequence>
        {/* PHUKET card: the elephant walks up and in front of the text */}
        <Sequence from={beatFrame(217)} durationInFrames={beatFrame(221) - beatFrame(217)}>
          <MatteOverlay src="mattes/phuket-elephant-fg.webm" flip />
        </Sequence>

        {/* warm exposure flash on each drop */}
        {FLASH_BEATS.map((b) => (
          <Sequence key={`flash-${b}`} from={beatFrame(b)} durationInFrames={10}>
            <ImpactFlash />
          </Sequence>
        ))}

        {/* sample-1 style monochrome flash right before the resolve:
            2 frames of black, then a hard 6-frame B&W plate, cutting to the
            end card exactly on the measured slam onset (beat 319) */}
        <Sequence from={endCardStart - 8} durationInFrames={8}>
          <MonoFlash />
        </Sequence>

        {/* end card over the final slam */}
        <Sequence from={endCardStart} durationInFrames={TOTAL_FRAMES - endCardStart}>
          <EndCard durationFrames={TOTAL_FRAMES - endCardStart} />
        </Sequence>
      </CinematicFrame>
    </AbsoluteFill>
  );
};

/** Opacity ramp for outro dissolves; passthrough when frames is 0. */
const FadeIn: React.FC<{frames: number; children: React.ReactNode}> = ({
  frames,
  children,
}) => {
  const frame = useCurrentFrame();
  const o = frames
    ? interpolate(frame, [0, frames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** Small quiet text during the cold open, before the drop. */
const ColdOpenTease: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 24, 160, 200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', zIndex: 40}}>
      <div
        style={{
          margin: '0 0 120px 90px',
          opacity: o,
          fontFamily: '"Avenir Next Condensed", "Arial Narrow", sans-serif',
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: 12,
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 2px 18px rgba(0,0,0,0.9)',
        }}
      >
        JUNE 2026 · 21 DAYS · 3 COUNTRIES
      </div>
    </AbsoluteFill>
  );
};
