import React from 'react';
import {Composition} from 'remotion';
import {NiceForWhatVlog} from './NiceForWhatVlog';
import {TalkToYouVlog} from './TalkToYouVlog';
import {Vlog} from './Vlog';
import {FPS, TOTAL_FRAMES} from './lib/beats';
import {NFW_FPS, NFW_TOTAL_FRAMES} from './lib/niceForWhatBeats';
import {TALK_FPS, TALK_TOTAL_FRAMES} from './lib/talkToYouBeats';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Vlog"
        component={Vlog}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="TalkToYou"
        component={TalkToYouVlog}
        durationInFrames={TALK_TOTAL_FRAMES}
        fps={TALK_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="NiceForWhat"
        component={NiceForWhatVlog}
        durationInFrames={NFW_TOTAL_FRAMES}
        fps={NFW_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
