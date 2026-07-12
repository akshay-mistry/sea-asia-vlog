/* Validates the Nice For What edit: chapter beat sums, source-clip
 * overruns, catalog refs, and clip-multiset parity with the second draft. */
import fs from 'node:fs';
import catalog from '../src/lib/catalog';
import {NFW_CHAPTERS, NFW_END_CARD_BEAT} from '../src/lib/niceForWhatTimeline';
import {
  NFW_BEAT_SEC,
  NFW_MUSIC_DURATION_SEC,
  nfwBeatTime,
} from '../src/lib/niceForWhatBeats';

let errors = 0;

for (let ci = 0; ci < NFW_CHAPTERS.length; ci++) {
  const ch = NFW_CHAPTERS[ci];
  const sum = ch.shots.reduce((a, s) => a + s.beats, 0);
  const end = ch.startBeat + sum;
  const expectedEnd =
    ci + 1 < NFW_CHAPTERS.length
      ? NFW_CHAPTERS[ci + 1].startBeat
      : NFW_END_CARD_BEAT;
  const status =
    end === expectedEnd
      ? 'ok'
      : `MISMATCH (ends ${end}, next starts ${expectedEnd}, diff ${expectedEnd - end})`;
  if (end !== expectedEnd) errors++;
  console.log(
    `${ch.id.padEnd(10)} beats ${String(ch.startBeat).padStart(3)}-${String(end).padStart(3)} ` +
      `(${sum} beats, ${(sum * NFW_BEAT_SEC).toFixed(1)}s, ${ch.shots.length} shots)  ${status}`
  );

  for (const s of ch.shots) {
    const meta = catalog.find((e) => e.id === s.clip);
    if (!meta) {
      console.log(`  ERROR clip ${s.clip} not in catalog`);
      errors++;
      continue;
    }
    const speed = s.speed ?? 1;
    const needSec = (s.trim ?? 0) + s.beats * NFW_BEAT_SEC * speed;
    if (needSec > meta.duration + 0.05) {
      console.log(
        `  OVERRUN clip ${s.clip} ${meta.file}: needs ${needSec.toFixed(1)}s, has ${meta.duration.toFixed(1)}s`
      );
      errors++;
    }
  }
}

// clip multiset parity with the frozen second draft
const secondDraft: {clip: number}[] = JSON.parse(
  fs.readFileSync('data/second-draft-timeline.json', 'utf8')
);
const count = (ids: number[]) => {
  const m = new Map<number, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
};
const want = count(secondDraft.map((s) => s.clip));
const have = count(NFW_CHAPTERS.flatMap((c) => c.shots.map((s) => s.clip)));
for (const [id, n] of want) {
  const h = have.get(id) ?? 0;
  if (h !== n) {
    console.log(`  PARITY clip ${id}: second draft uses ${n}x, this cut ${h}x`);
    errors++;
  }
}
for (const [id, n] of have) {
  if (!want.has(id)) {
    console.log(`  PARITY clip ${id}: not in second draft (used ${n}x here)`);
    errors++;
  }
}

const endT = nfwBeatTime(NFW_END_CARD_BEAT);
console.log(
  `\nend card at ${endT.toFixed(2)}s, music ends ${NFW_MUSIC_DURATION_SEC}s (card hold ${(NFW_MUSIC_DURATION_SEC - endT).toFixed(1)}s)`
);
const shots = NFW_CHAPTERS.flatMap((c) => c.shots);
console.log(
  `total shots: ${shots.length}, unique clips: ${new Set(shots.map((s) => s.clip)).size}`
);
console.log(errors ? `\n${errors} ERRORS` : '\nALL OK');
process.exit(errors ? 1 : 0);
