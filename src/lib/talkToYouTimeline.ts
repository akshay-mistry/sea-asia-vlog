import {
  CHAPTERS as SECOND_DRAFT_CHAPTERS,
  type Chapter,
  type Shot,
} from './timeline';

export type TalkShot = Shot & {
  /** Sample-derived transition treatment applied by TalkToYouVlog. */
  effect?: 'flash' | 'punch' | 'split';
};

export type TalkChapter = Omit<Chapter, 'shots'> & {
  shots: TalkShot[];
};

const sourceChapter = (id: string): Chapter => {
  const chapter = SECOND_DRAFT_CHAPTERS.find((item) => item.id === id);
  if (!chapter) throw new Error(`Missing second-draft chapter: ${id}`);
  return chapter;
};

const sourceShot = (chapterId: string, clip: number): TalkShot => {
  const shot = sourceChapter(chapterId).shots.find((item) => item.clip === clip);
  if (!shot) throw new Error(`Missing clip ${clip} in ${chapterId}`);
  return {...shot};
};

const orderedShots = (
  chapterId: string,
  order: number[],
  beats: Record<number, number>,
  effects: Partial<Record<number, TalkShot['effect']>> = {}
): TalkShot[] =>
  order.map((clip) => ({
    ...sourceShot(chapterId, clip),
    beats: beats[clip],
    effect: effects[clip],
  }));

const mappedShots = (
  chapterId: string,
  beats: Record<number, number>,
  effects: Partial<Record<number, TalkShot['effect']>> = {}
): TalkShot[] =>
  sourceChapter(chapterId).shots.map((shot) => ({
    ...shot,
    beats: beats[shot.clip] ?? shot.beats,
    effect: effects[shot.clip],
  }));

const coldOpen: TalkChapter = {
  ...sourceChapter('cold-open'),
  startBeat: 0,
  shots: orderedShots(
    'cold-open',
    [282, 283, 286, 284, 117, 127, 295, 175, 205, 213, 219, 231, 226],
    {
      282: 6,
      283: 4,
      286: 6,
      284: 4,
      117: 0.5,
      127: 0.5,
      295: 0.5,
      175: 0.5,
      205: 0.5,
      213: 0.5,
      219: 0.5,
      231: 0.5,
      226: 8,
    },
    {
      226: 'punch',
      117: 'flash',
      127: 'flash',
      295: 'flash',
      175: 'flash',
      205: 'flash',
      213: 'flash',
      219: 'flash',
      231: 'flash',
    }
  ).map((shot) => (shot.clip === 226 ? {...shot, trim: 0.15} : shot)),
};

const hanoi: TalkChapter = {
  ...sourceChapter('hanoi'),
  startBeat: 32,
  shots: mappedShots('hanoi', {}),
};

const haGiang: TalkChapter = {
  ...sourceChapter('ha-giang'),
  startBeat: 56,
  shots: mappedShots(
    'ha-giang',
    {
      17: 4,
      29: 4,
      35: 2,
      40: 4,
      93: 2,
      26: 4,
      20: 2,
      92: 2,
      94: 2,
      33: 4,
      46: 4,
      62: 2,
      64: 4,
      74: 4,
      49: 2,
      55: 0.5,
      56: 0.5,
      57: 0.5,
      58: 0.5,
      53: 2,
      50: 2,
      88: 1,
      81: 1,
      85: 1,
      96: 1,
      99: 1,
      44: 1,
      21: 1,
      60: 1,
      68: 1,
      66: 1,
      100: 1,
      27: 1,
    },
    {17: 'punch', 55: 'flash', 56: 'flash', 57: 'flash', 58: 'flash'}
  ).map((shot) => (shot.clip === 74 ? {...shot, trim: 11} : shot)),
};

const daNang: TalkChapter = {
  ...sourceChapter('da-nang'),
  startBeat: 120,
  shots: mappedShots('da-nang', {103: 2, 104: 2, 108: 4}),
};

const hoiAn: TalkChapter = {
  ...sourceChapter('hoi-an'),
  startBeat: 128,
  shots: mappedShots('hoi-an', {
    112: 1,
    117: 3,
    121: 1,
    122: 1,
    127: 4,
    129: 2,
    130: 2,
    132: 4,
    134: 2,
    135: 4,
  }),
};

const bali: TalkChapter = {
  ...sourceChapter('bali'),
  startBeat: 152,
  shots: mappedShots('bali', {}, {175: 'punch', 180: 'punch'}),
};

const phuket: TalkChapter = {
  ...sourceChapter('phuket'),
  startBeat: 216,
  shots: mappedShots('phuket', {}, {199: 'punch', 205: 'punch', 213: 'flash'}),
};

const islands: TalkChapter = {
  ...sourceChapter('islands'),
  startBeat: 248,
  shots: mappedShots('islands', {}, {216: 'punch', 219: 'flash'}),
};

const bangkok: TalkChapter = {
  ...sourceChapter('bangkok'),
  startBeat: 280,
  shots: mappedShots(
    'bangkok',
    {
      246: 2,
      247: 2,
      257: 1,
      260: 1,
      262: 2,
      264: 1,
      266: 1,
      271: 1,
      272: 1,
      254: 1,
      244: 4,
      276: 1,
      274: 2,
      277: 4,
    },
    {246: 'punch', 264: 'flash'}
  ),
};

const outro: TalkChapter = {
  ...sourceChapter('outro'),
  startBeat: 304,
  shots: mappedShots('outro', {
    280: 2,
    281: 2,
    175: 2,
    226: 2,
    224: 2,
    231: 6,
  }),
};

export const TALK_CHAPTERS: TalkChapter[] = [
  coldOpen,
  hanoi,
  haGiang,
  daNang,
  hoiAn,
  bali,
  phuket,
  islands,
  bangkok,
  outro,
];

export const TALK_TITLE_BEAT = 24;
export const TALK_TITLE_LEN_BEATS = 8;
export const TALK_END_CARD_BEAT = 312;
export const TALK_CONTENT_END_BEAT = 320;
