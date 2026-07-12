import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export const SampleLocationCard: React.FC<{
  name: string;
  sub: string;
  durationFrames: number;
}> = ({name, sub, durationFrames}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, durationFrames - 12, durationFrames - 2],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const rise = interpolate(frame, [0, 12], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        bottom: 64,
        zIndex: 40,
        opacity,
        transform: `translateY(${rise}px)`,
        textShadow: '0 2px 16px rgba(0,0,0,0.88)',
      }}
    >
      <div
        style={{
          fontFamily: '"Avenir Next Condensed", "Arial Narrow", sans-serif',
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 7,
          color: '#ffd84a',
          marginBottom: 4,
        }}
      >
        {sub}
      </div>
      <div
        style={{
          fontFamily: '"Arial Black", "Helvetica Neue", sans-serif',
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: 5,
          lineHeight: 1,
          color: '#fff',
        }}
      >
        {name}
      </div>
    </div>
  );
};
