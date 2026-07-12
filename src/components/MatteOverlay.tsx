import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

const BURST_FRAMES = 7; // keep in sync with Shot.tsx

/**
 * Text-behind-subject pass (sample4's "DAYS IN HOI AN" look): an
 * alpha-WebM copy of the shot's foreground subject, rendered ABOVE the
 * location card (zIndex 45 > card's 40) so the subject occludes the text.
 *
 * The matte clip was extracted starting exactly at the shot's trim point
 * (scripts/make-mattes.py), so it plays from frame 0 in lockstep with the
 * base OffthreadVideo of the same shot. `burst` mirrors the base shot's
 * radial zoom-blur entry so the two layers stay pixel-aligned.
 */
export const MatteOverlay: React.FC<{
  src: string;
  burst?: boolean;
  /** mirror horizontally — must match the base shot's `flip` */
  flip?: boolean;
}> = ({src, burst, flip}) => {
  const frame = useCurrentFrame();

  let zoom = 1;
  let blur = 0;
  if (burst) {
    const p = interpolate(frame, [0, BURST_FRAMES], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const eased = p * p;
    zoom = 1 + eased * 0.34;
    blur = eased * 26;
  }

  return (
    <AbsoluteFill style={{zIndex: 45, pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          transparent
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: flip ? 'scaleX(-1)' : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
