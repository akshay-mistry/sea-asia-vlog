import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Restrained treatment for the Talk To You cut. The references preserve
 * natural location color, then add only light contrast, grain and vignette.
 */
export const SampleFilmFrame: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{
          filter: 'contrast(1.04) saturate(1.06) brightness(1.01)',
        }}
      >
        {children}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.22) 100%)',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.025,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27300%27 height=%27300%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
          backgroundPosition: `${(frame * 73) % 300}px ${(frame * 47) % 300}px`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
