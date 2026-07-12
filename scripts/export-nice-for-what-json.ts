/* Dumps the resolved Nice For What timeline to JSON for QC tooling. */
import fs from 'node:fs';
import catalog from '../src/lib/catalog';
import {NFW_CHAPTERS} from '../src/lib/niceForWhatTimeline';
import {nfwBeatTime} from '../src/lib/niceForWhatBeats';

const rows: object[] = [];
for (const ch of NFW_CHAPTERS) {
  let beat = ch.startBeat;
  ch.shots.forEach((s, idx) => {
    const meta = catalog.find((e) => e.id === s.clip)!;
    const speed = s.speed ?? 1;
    const compIn = nfwBeatTime(beat);
    const compOut = nfwBeatTime(beat + s.beats);
    const srcIn = s.trim ?? 0;
    const srcOut = srcIn + (compOut - compIn) * speed;
    rows.push({
      chapter: ch.id,
      idx,
      clip: s.clip,
      file: meta.file,
      beat,
      compIn: Number(compIn.toFixed(3)),
      compOut: Number(compOut.toFixed(3)),
      srcIn,
      srcOut: Number(srcOut.toFixed(3)),
      srcDur: meta.duration,
      speed,
      orientation: meta.width >= meta.height ? 'horizontal' : 'vertical',
      flags: [
        s.whip ? `whip-${s.whip}` : '',
        s.bw ? 'bw' : '',
        s.push ? 'push' : '',
        s.audio ? 'audio' : '',
        s.fit ? 'contain' : '',
        s.rotation ? `rot${s.rotation}` : '',
      ]
        .filter(Boolean)
        .join(' '),
    });
    beat += s.beats;
  });
}

fs.writeFileSync(
  'data/nice-for-what-timeline-resolved.json',
  JSON.stringify(rows, null, 1)
);
console.log(`wrote ${rows.length} shots to data/nice-for-what-timeline-resolved.json`);
