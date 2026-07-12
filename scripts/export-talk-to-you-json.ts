import * as fs from 'fs';
import catalog from '../src/lib/catalog';
import {talkBeatTime} from '../src/lib/talkToYouBeats';
import {TALK_CHAPTERS} from '../src/lib/talkToYouTimeline';

const rows: object[] = [];

for (const chapter of TALK_CHAPTERS) {
  let beat = chapter.startBeat;
  for (let index = 0; index < chapter.shots.length; index++) {
    const shot = chapter.shots[index];
    const meta = catalog.find((item) => item.id === shot.clip)!;
    const speed = shot.speed ?? 1;
    const compIn = talkBeatTime(beat);
    const compOut = talkBeatTime(beat + shot.beats);
    const srcIn = shot.trim ?? 0;

    rows.push({
      chapter: chapter.id,
      idx: index,
      clip: shot.clip,
      file: meta.file,
      beat,
      compIn: Number(compIn.toFixed(3)),
      compOut: Number(compOut.toFixed(3)),
      srcIn: Number(srcIn.toFixed(3)),
      srcOut: Number(
        (srcIn + (compOut - compIn) * speed).toFixed(3)
      ),
      srcDur: meta.duration,
      speed,
      orientation: meta.orientation,
      flags: [
        shot.whip ? `whip-${shot.whip}` : '',
        shot.bw ? 'bw' : '',
        shot.push ? 'push' : '',
        shot.audio ? 'audio' : '',
        shot.effect ?? '',
      ]
        .filter(Boolean)
        .join(','),
    });
    beat += shot.beats;
  }
}

fs.writeFileSync(
  'data/talk-to-you-timeline-resolved.json',
  JSON.stringify(rows, null, 1)
);
console.log(`wrote ${rows.length} rows`);
