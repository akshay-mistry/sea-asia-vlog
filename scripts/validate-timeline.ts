/* Validates the edit: chapter beat sums, source-clip overruns, catalog refs. */
import catalog from '../src/lib/catalog';
import {CHAPTERS, END_CARD_BEAT} from '../src/lib/timeline';
import {beatTime, MUSIC_DURATION_SEC} from '../src/lib/beats';

let errors = 0;

for (let ci = 0; ci < CHAPTERS.length; ci++) {
  const ch = CHAPTERS[ci];
  const sum = ch.shots.reduce((a, s) => a + s.beats, 0);
  const end = ch.startBeat + sum;
  const expectedEnd = ci + 1 < CHAPTERS.length ? CHAPTERS[ci + 1].startBeat : END_CARD_BEAT;
  const status = end === expectedEnd ? 'ok' : `MISMATCH (ends ${end}, next starts ${expectedEnd}, diff ${expectedEnd - end})`;
  if (end !== expectedEnd) errors++;
  console.log(
    `${ch.id.padEnd(10)} beats ${String(ch.startBeat).padStart(3)}-${String(end).padStart(3)} ` +
    `(${sum} beats, ${(sum * 0.45).toFixed(1)}s, ${ch.shots.length} shots)  ${status}`
  );

  for (const s of ch.shots) {
    const meta = catalog.find((e) => e.id === s.clip);
    if (!meta) {
      console.log(`  ERROR clip ${s.clip} not in catalog`);
      errors++;
      continue;
    }
    const speed = s.speed ?? 1;
    const needSec = (s.trim ?? 0) + s.beats * 0.45 * speed;
    if (needSec > meta.duration + 0.05) {
      console.log(
        `  OVERRUN clip ${s.clip} ${meta.file}: needs ${needSec.toFixed(1)}s, has ${meta.duration.toFixed(1)}s`
      );
      errors++;
    }
  }
}

const endT = beatTime(END_CARD_BEAT);
console.log(`\nend card at ${endT.toFixed(2)}s, music ends ${MUSIC_DURATION_SEC}s (card hold ${(MUSIC_DURATION_SEC - endT).toFixed(1)}s)`);
const shots = CHAPTERS.flatMap((c) => c.shots);
console.log(`total shots: ${shots.length}, unique clips: ${new Set(shots.map((s) => s.clip)).size}`);
console.log(errors ? `\n${errors} ERRORS` : '\nALL OK');
process.exit(errors ? 1 : 0);
