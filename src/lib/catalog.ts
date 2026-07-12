import catalogData from '../../data/footage-catalog.json';

export type ClipMeta = {
  id: number;
  file: string;
  recordedAt: string;
  epoch: number;
  timeSource: string;
  duration: number;
  width: number;
  height: number;
  orientation: 'vertical' | 'horizontal';
  fps: number;
  codec: string | null;
  camera: string;
  location: string | null;
  chapter: string | null;
};

const catalog = catalogData as unknown as ClipMeta[];

export const getClip = (id: number): ClipMeta => {
  const c = catalog[id];
  if (!c || c.id !== id) {
    const found = catalog.find((e) => e.id === id);
    if (!found) throw new Error(`clip id ${id} not in catalog`);
    return found;
  }
  return c;
};

export default catalog;
