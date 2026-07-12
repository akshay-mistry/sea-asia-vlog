import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {FPS} from '../lib/beats';
import {getClip} from '../lib/catalog';

/** Warm 8-frame exposure flash on a drop (sample-2/3 style boundary hit). */
export const ImpactFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 1, 8], [0.85, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'rgb(255,244,224)',
        opacity: o,
        mixBlendMode: 'screen',
        zIndex: 55,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Monochrome flash insert (sample 1, 16.56-16.72s): 2 frames of hard black,
 * then a high-contrast B&W plate that cuts to the resolve ON the slam.
 * The black lead-in makes the plate strobe instead of blending in.
 */
export const MonoFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const meta = getClip(226); // Maya Bay — the title hero, echoed in B&W
  return (
    <AbsoluteFill style={{zIndex: 60, backgroundColor: '#000'}}>
      {frame >= 2 ? (
        <OffthreadVideo
          src={staticFile(`clips/${meta.file}`)}
          startFrom={Math.round(1.5 * FPS)}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) contrast(1.9) brightness(1.3)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
