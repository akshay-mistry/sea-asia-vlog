import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {nfwBeatFrame, NFW_TOTAL_FRAMES} from './lib/niceForWhatBeats';
import {
  NFW_CHAPTERS,
  NFW_END_CARD_BEAT,
  NFW_TITLE_BEAT,
  NFW_TITLE_LEN_BEATS,
} from './lib/niceForWhatTimeline';
import {Shot} from './components/Shot';
import {CinematicFrame} from './components/CinematicFrame';
import {TitleFlicker} from './components/TitleFlicker';
import {LocationCard} from './components/LocationCard';
import {EndCard} from './components/EndCard';

export const NiceForWhatVlog: React.FC = () => {
  const endCardStart = nfwBeatFrame(NFW_END_CARD_BEAT);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio src={staticFile('nice-for-what-edit.wav')} />

      <CinematicFrame>
        {NFW_CHAPTERS.map((chapter) => {
          let beatCursor = chapter.startBeat;
          return (
            <React.Fragment key={chapter.id}>
              {chapter.shots.map((shot, i) => {
                const from = nfwBeatFrame(beatCursor);
                const to = nfwBeatFrame(beatCursor + shot.beats);
                beatCursor += shot.beats;
                return (
                  <Sequence
                    key={`${chapter.id}-${i}`}
                    from={from}
                    durationInFrames={to - from}
                  >
                    <Shot shot={shot} durationFrames={to - from} />
                  </Sequence>
                );
              })}
              {chapter.card ? (
                <Sequence
                  from={nfwBeatFrame(
                    chapter.startBeat + (chapter.cardDelayBeats ?? 0)
                  )}
                  durationInFrames={
                    nfwBeatFrame(
                      chapter.startBeat + (chapter.cardDelayBeats ?? 0) + 6
                    ) -
                    nfwBeatFrame(chapter.startBeat + (chapter.cardDelayBeats ?? 0))
                  }
                >
                  <LocationCard
                    name={chapter.name}
                    sub={chapter.sub}
                    durationFrames={
                      nfwBeatFrame(
                        chapter.startBeat + (chapter.cardDelayBeats ?? 0) + 6
                      ) -
                      nfwBeatFrame(
                        chapter.startBeat + (chapter.cardDelayBeats ?? 0)
                      )
                    }
                  />
                </Sequence>
              ) : null}
            </React.Fragment>
          );
        })}

        {/* cold-open kicker tease over the quiet Lauryn loop */}
        <Sequence
          from={nfwBeatFrame(5)}
          durationInFrames={nfwBeatFrame(14) - nfwBeatFrame(5)}
        >
          <ColdOpenTease />
        </Sequence>

        {/* drop-1 title slam */}
        <Sequence
          from={nfwBeatFrame(NFW_TITLE_BEAT)}
          durationInFrames={
            nfwBeatFrame(NFW_TITLE_BEAT + NFW_TITLE_LEN_BEATS) -
            nfwBeatFrame(NFW_TITLE_BEAT)
          }
        >
          <TitleFlicker
            kicker="POST GRAD TRIP"
            word="SOUTHEAST ASIA"
            durationFrames={
              nfwBeatFrame(NFW_TITLE_BEAT + NFW_TITLE_LEN_BEATS) -
              nfwBeatFrame(NFW_TITLE_BEAT)
            }
          />
        </Sequence>

        {/* red slam accents (sample 1's red flash motif) on the two
            biggest musical hits: the title drop and the climax */}
        {[NFW_TITLE_BEAT, 192].map((beat) => (
          <Sequence key={beat} from={nfwBeatFrame(beat)} durationInFrames={6}>
            <RedSlam />
          </Sequence>
        ))}

        {/* end card rides the natural decay of the beat */}
        <Sequence
          from={endCardStart}
          durationInFrames={NFW_TOTAL_FRAMES - endCardStart}
        >
          <EndCard durationFrames={NFW_TOTAL_FRAMES - endCardStart} />
        </Sequence>
      </CinematicFrame>
    </AbsoluteFill>
  );
};

/** Small quiet text during the cold open, before the drop. */
const ColdOpenTease: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 24, 250, 320], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{justifyContent: 'flex-end', alignItems: 'flex-start', zIndex: 40}}
    >
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

/** Two-frame warm red wash that punches the biggest hits. */
const RedSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 1, 5], [0.55, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#e0301e',
        mixBlendMode: 'screen',
        opacity,
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  );
};
