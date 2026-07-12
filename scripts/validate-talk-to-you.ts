import {getClip} from '../src/lib/catalog';
import {TALK_BEAT_SEC, talkBeatTime} from '../src/lib/talkToYouBeats';
import {
  TALK_CHAPTERS,
  TALK_CONTENT_END_BEAT,
} from '../src/lib/talkToYouTimeline';
import {CHAPTERS as SECOND_DRAFT_CHAPTERS} from '../src/lib/timeline';

let errors = 0;

for (let index = 0; index < TALK_CHAPTERS.length; index++) {
  const chapter = TALK_CHAPTERS[index];
  const endBeat =
    chapter.startBeat +
    chapter.shots.reduce((total, shot) => total + shot.beats, 0);
  const expectedEnd =
    TALK_CHAPTERS[index + 1]?.startBeat ?? TALK_CONTENT_END_BEAT;

  if (endBeat !== expectedEnd) {
    console.error(
      `${chapter.id}: ends at beat ${endBeat}, expected ${expectedEnd}`
    );
    errors++;
  }

  for (const shot of chapter.shots) {
    const meta = getClip(shot.clip);
    const consumedSeconds =
      shot.beats * TALK_BEAT_SEC * (shot.speed ?? 1);
    const sourceEnd = (shot.trim ?? 0) + consumedSeconds;
    if (sourceEnd > meta.duration + 0.03) {
      console.error(
        `${chapter.id} clip ${shot.clip}: source ends at ${sourceEnd.toFixed(
          3
        )}s, file duration is ${meta.duration.toFixed(3)}s`
      );
      errors++;
    }
  }
}

const secondDraftClips = SECOND_DRAFT_CHAPTERS.flatMap((chapter) =>
  chapter.shots.map((shot) => shot.clip)
).sort((a, b) => a - b);
const talkClips = TALK_CHAPTERS.flatMap((chapter) =>
  chapter.shots.map((shot) => shot.clip)
).sort((a, b) => a - b);

if (JSON.stringify(secondDraftClips) !== JSON.stringify(talkClips)) {
  console.error('Talk To You does not use the exact second-draft clip multiset');
  errors++;
}

console.log(
  `${talkClips.length} shots, ${new Set(talkClips).size} unique clips`
);
console.log(
  `content ends ${talkBeatTime(TALK_CONTENT_END_BEAT).toFixed(3)}s`
);

if (errors > 0) {
  console.error(`${errors} ERRORS`);
  process.exit(1);
}

console.log('ALL OK');
