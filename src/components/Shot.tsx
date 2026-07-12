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
import type {Shot as ShotType} from '../lib/timeline';

const WHIP_FRAMES = 12;
const BURST_FRAMES = 7;
const PUNCH_FRAMES = 10;

/** One clip segment: trimmed, speed-adjusted, cover-fit, with optional
 *  whip-pan entry, radial-blur burst entry, impact punch-settle,
 *  B&W viewfinder, and slow push-in. */
export const Shot: React.FC<{shot: ShotType; durationFrames: number}> = ({
  shot,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const meta = getClip(shot.clip);
  const speed = shot.speed ?? 1;
  const startFrom = Math.round((shot.trim ?? 0) * FPS);

  // whip-pan entry: slide + directional blur over the first frames,
  // with compensating zoom so no black edge is revealed
  let translateX = 0;
  let blur = 0;
  let whipZoom = 1;
  if (shot.whip) {
    const p = interpolate(frame, [0, WHIP_FRAMES], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const dir = shot.whip === 'left' ? 1 : -1;
    translateX = dir * p * p * 20; // percent
    blur = p * 24;
    whipZoom = 1 + p * 0.5;
  }

  // radial zoom-blur burst entry (sample 4's 5.26-5.38s bridge)
  let burstZoom = 1;
  if (shot.burst) {
    const p = interpolate(frame, [0, BURST_FRAMES], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const eased = p * p;
    burstZoom = 1 + eased * 0.34;
    blur = Math.max(blur, eased * 26);
  }

  // impact punch-settle: slam in oversized, settle to 1 on the beat
  const punch = shot.impact
    ? interpolate(frame, [0, PUNCH_FRAMES], [1.11, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t) => 1 - (1 - t) ** 3,
      })
    : 1;

  // slow push-in for hero shots
  const push = shot.push
    ? interpolate(frame, [0, durationFrames], [1, 1.09])
    : 1;
  const zoom = (shot.zoom ?? 1) * push * whipZoom * burstZoom * punch;

  const filters: string[] = [];
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (shot.bw) filters.push('grayscale(1) contrast(1.15)');

  const contain = shot.fit === 'contain';
  const quarterTurn = shot.rotation === 90 || shot.rotation === -90;
  const flip = shot.flip ? ' scaleX(-1)' : '';
  const videoStyle: React.CSSProperties = quarterTurn
    ? {
        // The composition is 1920x1080. Give a sideways 9:16 source a
        // 1080x1920 box, center it, then rotate it into the full 16:9 frame.
        position: 'absolute',
        width: 1080,
        height: 1920,
        left: 420,
        top: -420,
        objectFit: 'cover',
        transform: `rotate(${shot.rotation}deg)${flip}`,
      }
    : {
        width: '100%',
        height: '100%',
        objectFit: contain ? 'contain' : 'cover',
        transform:
          shot.rotation || shot.flip
            ? `${shot.rotation ? `rotate(${shot.rotation}deg)` : ''}${flip}`
            : undefined,
      };

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      {contain ? (
        // blurred cover-fit copy fills the frame behind the contained video
        <AbsoluteFill style={{transform: 'scale(1.2)', filter: 'blur(40px) brightness(0.6)'}}>
          <OffthreadVideo
            src={staticFile(`clips/${meta.file}`)}
            startFrom={startFrom}
            playbackRate={speed}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          transform: `translateX(${translateX}%) scale(${zoom})`,
          filter: filters.length ? filters.join(' ') : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile(`clips/${meta.file}`)}
          startFrom={startFrom}
          playbackRate={speed}
          muted={!shot.audio}
          volume={shot.audio ?? 0}
          style={videoStyle}
        />
      </AbsoluteFill>
      {shot.bw ? <Viewfinder /> : null}
    </AbsoluteFill>
  );
};

/** Film-leader viewfinder overlay for B&W beats (sample1 style). */
const Viewfinder: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 30) % 2 === 0;
  return (
    <AbsoluteFill style={{zIndex: 10, pointerEvents: 'none'}}>
      {/* dashed border */}
      <div
        style={{
          position: 'absolute',
          inset: '16% 6%',
          border: '3px dashed rgba(255,255,255,0.85)',
        }}
      />
      {/* corner brackets */}
      {[
        {top: '13%', left: '4%', bt: true, bl: true},
        {top: '13%', right: '4%', bt: true, br: true},
        {bottom: '13%', left: '4%', bb: true, bl: true},
        {bottom: '13%', right: '4%', bb: true, br: true},
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 54,
            height: 54,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            borderTop: c.bt ? '5px solid #fff' : undefined,
            borderBottom: c.bb ? '5px solid #fff' : undefined,
            borderLeft: c.bl ? '5px solid #fff' : undefined,
            borderRight: c.br ? '5px solid #fff' : undefined,
          }}
        />
      ))}
      {/* REC dot + focus reticle */}
      <div
        style={{
          position: 'absolute',
          top: '17%',
          right: '9%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'Menlo, monospace',
          fontSize: 30,
          color: '#fff',
          letterSpacing: 4,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: blink ? '#ff2222' : 'transparent',
            border: '2px solid #ff2222',
          }}
        />
        REC
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 170,
          height: 170,
          marginLeft: -85,
          marginTop: -85,
          border: '2px solid rgba(255,255,255,0.9)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 2,
          height: 40,
          marginTop: -20,
          background: '#fff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 40,
          height: 2,
          marginLeft: -20,
          background: '#fff',
        }}
      />
    </AbsoluteFill>
  );
};
