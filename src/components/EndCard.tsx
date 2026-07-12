import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFont as loadSignature} from '@remotion/google-fonts/MrDafoe';
import {FPS} from '../lib/beats';
import {getClip} from '../lib/catalog';

const signature = loadSignature();

/**
 * Quiet end card (sample1 style): ultra-slow sunset, small serif title,
 * long hold, fade to black.
 */
export const EndCard: React.FC<{durationFrames: number}> = ({
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const meta = getClip(209); // Phuket viewpoint sunset

  const titleIn = interpolate(frame, [16, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // signature writes itself on left-to-right after the title settles
  const signReveal = interpolate(frame, [62, 112], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - 60, durationFrames - 8],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <OffthreadVideo
          src={staticFile(`clips/${meta.file}`)}
          startFrom={Math.round(0.1 * FPS)}
          playbackRate={0.5}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        <AbsoluteFill
          style={{justifyContent: 'center', alignItems: 'center'}}
        >
          <div style={{textAlign: 'center', opacity: titleIn}}>
            <div
              style={{
                fontFamily: 'Didot, Georgia, serif',
                fontSize: 64,
                letterSpacing: 14,
                color: '#fff',
                textShadow: '0 2px 30px rgba(0,0,0,0.8)',
              }}
            >
              SOUTHEAST ASIA
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: '"Avenir Next Condensed", "Arial Narrow", sans-serif',
                fontWeight: 500,
                fontSize: 24,
                letterSpacing: 10,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              JUNE 2026 — VIETNAM · BALI · THAILAND
            </div>
            <div
              style={{
                marginTop: 46,
                fontFamily: `${signature.fontFamily}, cursive`,
                fontSize: 88,
                color: '#fff',
                transform: 'rotate(-5deg)',
                textShadow: '0 0 18px rgba(255,255,255,0.35), 0 3px 20px rgba(0,0,0,0.7)',
                clipPath: `inset(-20% ${100 - signReveal}% -20% -5%)`,
                lineHeight: 1.3,
              }}
            >
              Amistry
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
