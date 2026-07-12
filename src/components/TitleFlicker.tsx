import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {loadFont as loadRubikDirt} from '@remotion/google-fonts/RubikDirt';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadKnewave} from '@remotion/google-fonts/Knewave';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';

const rubikDirt = loadRubikDirt();
const playfair = loadPlayfair();
const anton = loadAnton();
const knewave = loadKnewave();
const marker = loadMarker();

/**
 * The type voices sample 3 flickers between on its yellow title:
 * distressed slab, elegant serif caps, solid condensed sans,
 * paint marker, letterspaced light serif, and hand marker.
 */
const FONT_VOICES = [
  // grungy distressed bold caps (the sample's default "VIETNAM" stamp)
  {family: rubikDirt.fontFamily, weight: 400, size: 150, tracking: 4, caps: true},
  // elegant high-contrast serif caps
  {family: playfair.fontFamily, weight: 800, size: 150, tracking: 8, caps: true},
  // solid condensed sans slab
  {family: anton.fontFamily, weight: 400, size: 152, tracking: 10, caps: true},
  // chunky rounded paint-marker (the huge full-width variant)
  {family: knewave.fontFamily, weight: 400, size: 148, tracking: 2, caps: true},
  // airy letterspaced light serif
  {family: playfair.fontFamily, weight: 500, size: 138, tracking: 30, caps: true},
  // angular hand marker
  {family: marker.fontFamily, weight: 400, size: 138, tracking: 4, caps: true},
] as const;

/**
 * Big yellow multi-font flicker title (the "WELCOME TO VIETNAM" treatment
 * from sample3): the main word swaps typeface, fast on entry, then
 * settling into the sample's ~0.3-0.5s alternation holds.
 */
export const TitleFlicker: React.FC<{
  kicker?: string;
  word: string;
  durationFrames: number;
}> = ({kicker, word, durationFrames}) => {
  const frame = useCurrentFrame();
  // fast constant flicker: a new type voice every 4 frames (~15 swaps/sec)
  const voiceIdx = Math.floor(frame / 4);
  const voice = FONT_VOICES[voiceIdx % FONT_VOICES.length];

  const inScale = interpolate(frame, [0, 6], [1.35, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // chromatic split that collapses as the slam settles
  const split = interpolate(frame, [0, 8], [7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = interpolate(
    frame,
    [durationFrames - 10, durationFrames - 2],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
        opacity: out,
      }}
    >
      <div style={{textAlign: 'center', transform: `scale(${inScale})`}}>
        {kicker ? (
          <div
            style={{
              fontFamily: `${playfair.fontFamily}, Georgia, serif`,
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: 16,
              color: '#fff',
              textShadow: '0 2px 24px rgba(0,0,0,0.9)',
              marginBottom: 18,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: voice.family,
            fontWeight: voice.weight,
            fontSize: voice.size,
            letterSpacing: voice.tracking,
            color: '#ffd41f',
            textShadow:
              split > 0.2
                ? `${split}px 0 0 rgba(255,40,40,0.85), ${-split}px 0 0 rgba(40,200,255,0.85), 0 4px 0 rgba(0,0,0,0.35), 0 6px 40px rgba(0,0,0,0.85)`
                : '0 4px 0 rgba(0,0,0,0.35), 0 6px 40px rgba(0,0,0,0.85)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {voice.caps
            ? word.toUpperCase()
            : word
                .toLowerCase()
                .replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
        </div>
      </div>
    </AbsoluteFill>
  );
};
