import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {EndCard} from './components/EndCard';
import {SampleFilmFrame} from './components/SampleFilmFrame';
import {SampleLocationCard} from './components/SampleLocationCard';
import {Shot} from './components/Shot';
import {TitleFlicker} from './components/TitleFlicker';
import {
  TALK_TOTAL_FRAMES,
  talkBeatFrame,
} from './lib/talkToYouBeats';
import {
  TALK_CHAPTERS,
  TALK_END_CARD_BEAT,
  TALK_TITLE_BEAT,
  TALK_TITLE_LEN_BEATS,
  type TalkShot,
} from './lib/talkToYouTimeline';

const LOCATION_CARD_BEATS = 4;

const musicVolume = (frame: number): number => {
  const duckWindows = [
    {fromBeat: 0, toBeat: 16, volume: 0.2},
    {fromBeat: 52, toBeat: 54, volume: 0.26},
    {fromBeat: 148, toBeat: 152, volume: 0.24},
    {fromBeat: 304, toBeat: 306, volume: 0.28},
  ];
  // The source measures about -7.4 LUFS / +3.5 dBTP. A 0.6 base gain
  // supplies roughly 4.4 dB of headroom before natural-audio ducking.
  let volume = 0.6;

  for (const window of duckWindows) {
    const from = talkBeatFrame(window.fromBeat);
    const to = talkBeatFrame(window.toBeat);
    const fadeFrames = 8;
    if (frame < from - fadeFrames || frame > to + fadeFrames) continue;

    const duck =
      frame < from
        ? interpolate(
            frame,
            [from - fadeFrames, from],
            [0.6, window.volume]
          )
        : frame > to
          ? interpolate(frame, [to, to + fadeFrames], [window.volume, 0.6])
          : window.volume;
    volume = Math.min(volume, duck);
  }

  return volume;
};

const StyledShot: React.FC<{
  shot: TalkShot;
  durationFrames: number;
}> = ({shot, durationFrames}) => {
  const frame = useCurrentFrame();
  const punch =
    shot.effect === 'punch'
      ? interpolate(frame, [0, 8], [1.13, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;
  const flashOpacity =
    shot.effect === 'flash'
      ? interpolate(frame, [0, 1, 4], [0.8, 0.55, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        <Shot shot={shot} durationFrames={durationFrames} />
      </AbsoluteFill>
      {flashOpacity > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: '#fff7df',
            mixBlendMode: 'screen',
            opacity: flashOpacity,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const TalkToYouVlog: React.FC = () => {
  const endCardStart = talkBeatFrame(TALK_END_CARD_BEAT);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio
        src={staticFile('talk-to-you-edit.wav')}
        volume={musicVolume}
      />

      <SampleFilmFrame>
        {TALK_CHAPTERS.map((chapter) => {
          let beatCursor = chapter.startBeat;
          return (
            <React.Fragment key={chapter.id}>
              {chapter.shots.map((shot, index) => {
                const from = talkBeatFrame(beatCursor);
                const to = talkBeatFrame(beatCursor + shot.beats);
                beatCursor += shot.beats;
                return (
                  <Sequence
                    key={`${chapter.id}-${index}`}
                    from={from}
                    durationInFrames={to - from}
                  >
                    <StyledShot shot={shot} durationFrames={to - from} />
                  </Sequence>
                );
              })}

              {chapter.card ? (
                <Sequence
                  from={talkBeatFrame(
                    chapter.startBeat + (chapter.cardDelayBeats ?? 0)
                  )}
                  durationInFrames={
                    talkBeatFrame(
                      chapter.startBeat +
                        (chapter.cardDelayBeats ?? 0) +
                        LOCATION_CARD_BEATS
                    ) -
                    talkBeatFrame(
                      chapter.startBeat + (chapter.cardDelayBeats ?? 0)
                    )
                  }
                >
                  <SampleLocationCard
                    name={chapter.name}
                    sub={chapter.sub}
                    durationFrames={
                      talkBeatFrame(
                        chapter.startBeat +
                          (chapter.cardDelayBeats ?? 0) +
                          LOCATION_CARD_BEATS
                      ) -
                      talkBeatFrame(
                        chapter.startBeat + (chapter.cardDelayBeats ?? 0)
                      )
                    }
                  />
                </Sequence>
              ) : null}
            </React.Fragment>
          );
        })}

        <Sequence
          from={talkBeatFrame(0)}
          durationInFrames={talkBeatFrame(8) - talkBeatFrame(0)}
        >
          <OpeningStamp />
        </Sequence>

        <Sequence
          from={talkBeatFrame(TALK_TITLE_BEAT)}
          durationInFrames={
            talkBeatFrame(TALK_TITLE_BEAT + TALK_TITLE_LEN_BEATS) -
            talkBeatFrame(TALK_TITLE_BEAT)
          }
        >
          <TitleFlicker
            kicker="POST GRAD TRIP"
            word="SOUTHEAST ASIA"
            durationFrames={
              talkBeatFrame(TALK_TITLE_BEAT + TALK_TITLE_LEN_BEATS) -
              talkBeatFrame(TALK_TITLE_BEAT)
            }
          />
        </Sequence>

        <Sequence
          from={endCardStart}
          durationInFrames={TALK_TOTAL_FRAMES - endCardStart}
        >
          <EndCard durationFrames={TALK_TOTAL_FRAMES - endCardStart} />
        </Sequence>
      </SampleFilmFrame>
    </AbsoluteFill>
  );
};

const OpeningStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12, 28, 150, 200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: '0 0 78px 72px',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Avenir Next Condensed", "Arial Narrow", sans-serif',
          fontSize: 25,
          fontWeight: 600,
          letterSpacing: 10,
          color: '#fff',
          textShadow: '0 2px 18px rgba(0,0,0,0.85)',
        }}
      >
        JUNE 2026 · THE TRIP BEGINS
      </div>
    </AbsoluteFill>
  );
};
