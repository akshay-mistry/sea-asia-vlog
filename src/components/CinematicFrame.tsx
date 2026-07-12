import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/**
 * Global cinematic treatment: teal-orange filmic grade, vignette,
 * animated grain and a soft halation pass. Footage stays full-frame 16:9.
 */
export const CinematicFrame: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* graded footage */}
      <AbsoluteFill
        style={{
          filter: 'contrast(1.08) saturate(1.18) sepia(0.14) hue-rotate(-6deg) brightness(1.02)',
        }}
      >
        {children}
      </AbsoluteFill>

      {/* halation: blurred screen-blended copy of highlights (cheap approximation) */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255,190,120,0.08), transparent 65%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* teal shadow wash */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,40,60,0.10), rgba(0,20,40,0.16))',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.38) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* animated grain */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27300%27 height=%27300%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
          backgroundPosition: `${(frame * 97) % 300}px ${(frame * 61) % 300}px`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

    </AbsoluteFill>
  );
};
