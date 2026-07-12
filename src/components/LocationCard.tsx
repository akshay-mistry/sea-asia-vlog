import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

/**
 * Chapter location card (sample4-style): big white condensed sans with
 * tracking that animates open, small kicker line above, bottom-left.
 */
export const LocationCard: React.FC<{
  name: string;
  sub: string;
  durationFrames: number;
}> = ({name, sub, durationFrames}) => {
  const frame = useCurrentFrame();

  const inO = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outO = interpolate(
    frame,
    [durationFrames - 16, durationFrames - 2],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const tracking = interpolate(frame, [0, 28], [26, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [0, 12], [26, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        bottom: '17.5%',
        zIndex: 40,
        opacity: Math.min(inO, outO),
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          fontFamily: '"Avenir Next Condensed", "Arial Narrow", sans-serif',
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 10,
          color: '#ffd41f',
          marginBottom: 6,
          textShadow: '0 2px 16px rgba(0,0,0,0.9)',
        }}
      >
        {sub}
      </div>
      <div
        style={{
          fontFamily: '"Arial Black", "Helvetica Neue", sans-serif',
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: tracking,
          color: '#fff',
          lineHeight: 1,
          textShadow: '0 4px 32px rgba(0,0,0,0.85)',
        }}
      >
        {name}
      </div>
    </div>
  );
};
