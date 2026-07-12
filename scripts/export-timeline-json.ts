/* Dumps the resolved timeline (absolute times, source ranges) to data/timeline-resolved.json */
import * as fs from 'fs';
import catalog from '../src/lib/catalog';
import {CHAPTERS} from '../src/lib/timeline';
import {beatTime} from '../src/lib/beats';

const rows: object[] = [];
for (const ch of CHAPTERS) {
  let b = ch.startBeat;
  for (let i = 0; i < ch.shots.length; i++) {
    const s = ch.shots[i];
    const meta = catalog.find((e) => e.id === s.clip)!;
    const speed = s.speed ?? 1;
    const t0 = beatTime(b);
    const t1 = beatTime(b + s.beats);
    const srcIn = s.trim ?? 0;
    const srcOut = srcIn + (t1 - t0) * speed;
    rows.push({
      chapter: ch.id,
      idx: i,
      clip: s.clip,
      file: meta.file,
      beat: b,
      compIn: Number(t0.toFixed(3)),
      compOut: Number(t1.toFixed(3)),
      srcIn: Number(srcIn.toFixed(3)),
      srcOut: Number(srcOut.toFixed(3)),
      srcDur: meta.duration,
      speed,
      orientation: meta.orientation,
      flags: [s.whip ? `whip-${s.whip}` : '', s.bw ? 'bw' : '', s.push ? 'push' : '', s.audio ? 'audio' : ''].filter(Boolean).join(','),
    });
    b += s.beats;
  }
}
fs.writeFileSync('data/timeline-resolved.json', JSON.stringify(rows, null, 1));
console.log(`wrote ${rows.length} rows`);
