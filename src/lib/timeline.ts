/**
 * The entire edit lives here, expressed in BEATS on the music grid
 * (133.33 BPM, beat n lands at 0.105 + n*0.45 seconds).
 *
 * Musical landmarks of the 2:28 music edit:
 *   beat 0-17    quiet intro tease (0 - 7.755s)
 *   beat 17      DROP 1  - title slam
 *   beat 49      DROP 2  - loudest 14s of the track starts
 *   beat 81      DROP 3
 *   every 32 beats afterwards = 8-bar phrase boundary
 *   beat 241     (invisible) splice point of the music edit
 *   beat 320     final slam (144.1s), hard end ~147.7s
 */

export type Shot = {
  /** catalog id */
  clip: number;
  /** duration in beats (fractional allowed for stutters) */
  beats: number;
  /** seconds to skip into the source clip */
  trim?: number;
  /** playbackRate (0.25 on 120fps clips = true slow-mo) */
  speed?: number;
  /** whip-pan wipe-in direction */
  whip?: 'left' | 'right';
  /** radial zoom-blur burst entry (sample-4 bridge) */
  burst?: boolean;
  /** slam in oversized and settle to 1 over the first frames */
  impact?: boolean;
  /** black & white viewfinder treatment */
  bw?: boolean;
  /** extra zoom on top of cover-fit */
  zoom?: number;
  /** natural clip audio volume, default 0 (music only) */
  audio?: number;
  /** slow ken-burns push-in */
  push?: boolean;
  /** 'contain' letterboxes vertical clips over a blurred fill instead of
   *  cover-cropping (keeps the full action visible) */
  fit?: 'contain';
  /** correct source footage recorded with the camera physically rotated */
  rotation?: 90 | -90 | 180;
  /** mirror the shot horizontally (e.g. to steer action across a card) */
  flip?: boolean;
};

export type Chapter = {
  id: string;
  /** big text of the location card */
  name: string;
  /** small text above it */
  sub: string;
  /** absolute beat where this chapter starts */
  startBeat: number;
  /** whether to show the location card */
  card: boolean;
  /** delay the location card by this many beats (e.g. to clear the title) */
  cardDelayBeats?: number;
  /** how long the card stays up, in beats (default 8) */
  cardBeats?: number;
  shots: Shot[];
};

/* ------------------------------------------------------------------ */
/* COLD OPEN — quiet intro, natural audio, flash-forward build,        */
/* then the Maya Bay title slam (beats 0-25)                           */
/* ------------------------------------------------------------------ */
const coldOpen: Chapter = {
  id: 'cold-open',
  name: '',
  sub: '',
  startBeat: 0,
  card: false,
  shots: [
    // quiet narrative intro with natural audio — day 1, in true order:
    // land in Hanoi, ride into the city, first walk through the Old Quarter
    {clip: 282, beats: 4, trim: 1.0, audio: 0.7}, // airport arrival, luggage in tow
    {clip: 283, beats: 3, trim: 3.0, audio: 0.5}, // van into the city
    {clip: 286, beats: 3, trim: 2.0, audio: 0.5}, // first walk, talking to the camera
    {clip: 284, beats: 2.5, trim: 4.0}, // old-quarter street, scooters buzzing past
    // stutter build into the drop — flash-forward through the trip,
    // in chronological order (drum fill)
    {clip: 117, beats: 0.75, trim: 13.0}, // wading through a thousand ducks (Hoi An)
    {clip: 127, beats: 0.75, trim: 20.0}, // basket boat spin (Hoi An)
    {clip: 295, beats: 0.5, trim: 3.8, fit: 'contain'}, // pool backflip mid-air (Bali)
    {clip: 175, beats: 0.5, trim: 2.5}, // volcano sunrise (Bali)
    {clip: 205, beats: 0.5, trim: 1.0}, // elephant close-up (Phuket)
    {clip: 213, beats: 0.5, trim: 13.0}, // party bus (Phuket)
    {clip: 219, beats: 0.5, trim: 13.0}, // fire poi (the islands)
    {clip: 231, beats: 0.5, trim: 1.0}, // island sunset (the islands)
    // TITLE SLAM (beats 17-25) — MAYA BAY: turquoise water, karst cliffs,
    // the crew on the sand. Nature hero shot under the title.
    {clip: 226, beats: 8, trim: 0.2, whip: 'left', push: true},
  ],
};

/* ------------------------------------------------------------------ */
/* HANOI + NINH BINH (GoPro) — beats 25-49                             */
/* (chronologically the first stop of the trip)                        */
/* ------------------------------------------------------------------ */
const hanoi: Chapter = {
  id: 'hanoi',
  name: 'HANOI',
  sub: 'OLD QUARTER + NINH BINH — DAY 1',
  startBeat: 25,
  card: true,
  shots: [
    {clip: 294, beats: 4, trim: 22.0, whip: 'left'}, // TRAIN passes inches away (chapter slam)
    {clip: 289, beats: 2, trim: 2.0}, // crossing old-quarter traffic
    {clip: 293, beats: 2, trim: 10.0, bw: true}, // train street - viewfinder beat
    {clip: 288, beats: 2, trim: 8.0}, // street-food dinner, beers
    {clip: 307, beats: 2, trim: 6.0, whip: 'right'}, // Trang An boat launch
    {clip: 309, beats: 2, trim: 8.0}, // kayaking the karst river
    {clip: 311, beats: 2, trim: 8.0}, // paddling into the cave
    {clip: 313, beats: 2, trim: 4.0}, // inside the dark cave, lights on the water
    {clip: 323, beats: 2, trim: 2.0}, // group hotpot dinner
    // transition north: overnight bus + planning the loop
    {clip: 0, beats: 2, trim: 1.2, audio: 0.4}, // sleeper bus to Ha Giang
    {clip: 2, beats: 2, trim: 6.0}, // planning the loop on the wall map
  ],
};

/* ------------------------------------------------------------------ */
/* HA GIANG — beats 49-113, riding run opens on DROP 2 (loudest        */
/* section), the night-out strobes land exactly on DROP 3 (beat 81)    */
/* ------------------------------------------------------------------ */
const haGiang: Chapter = {
  id: 'ha-giang',
  name: 'HA GIANG',
  sub: 'NORTHERN VIETNAM',
  startBeat: 49,
  card: true,
  shots: [
    // DAY — the riding run opens on drop 2 (loudest section of the song)
    {clip: 17, beats: 2, trim: 5.6, whip: 'left', impact: true}, // convoy through the pass
    {clip: 29, beats: 2, trim: 11.5}, // hairpin sweep from above
    {clip: 35, beats: 2, trim: 0.5}, // riders rounding the guardrail bend
    {clip: 40, beats: 2, trim: 5.0, whip: 'right'},
    {clip: 93, beats: 2, trim: 1.0}, // dirt road through the village
    {clip: 26, beats: 2, trim: 7.3}, // valley road curve
    {clip: 20, beats: 2, trim: 6.0}, // convoy strung along the ridge road
    {clip: 92, beats: 2, trim: 4.5}, // full-throttle straightaway
    {clip: 94, beats: 2, trim: 3.2}, // picking through the rocky riverbed trail
    {clip: 33, beats: 2, trim: 6.0}, // valley switchbacks
    {clip: 46, beats: 2, trim: 8.0}, // crew at the viewpoint
    {clip: 62, beats: 2, trim: 0.0}, // group selfie at the cloud viewpoint
    {clip: 64, beats: 2, trim: 2.0}, // posing on the karst peak
    {clip: 74, beats: 4, trim: 9.0}, // long valley pan (breather)
    // the audible drop-3 slam lands at beat 82 (36.99s), one beat after the
    // beat-81 grid point — hold the feast an extra beat so the night cut
    // hits ON the bass, then accelerate the strobe run to get back on grid
    {clip: 49, beats: 3, trim: 15.0}, // feast spread — night falls
    {clip: 55, beats: 1, trim: 1.5, impact: true}, // club strobe (ON the slam)
    {clip: 56, beats: 1, trim: 3.0},
    {clip: 57, beats: 0.5, trim: 1.0},
    {clip: 58, beats: 0.5, trim: 1.5},
    {clip: 53, beats: 2, trim: 2.0, speed: 0.5}, // market lights slow-mo
    {clip: 50, beats: 2, trim: 1.0, speed: 0.5}, // night market slow-mo (120fps)
    {clip: 88, beats: 2, trim: 0.5}, // karaoke-bar madness
    {clip: 81, beats: 2, trim: 2.0, speed: 0.5}, // bar 120fps slow-mo
    {clip: 85, beats: 2, trim: 1.0}, // bar dance floor
    // MORNING AFTER — back on the bikes
    {clip: 96, beats: 2, trim: 7.0, whip: 'right'}, // rain ride
    {clip: 99, beats: 2, trim: 2.0}, // wet street convoy
    {clip: 44, beats: 2, trim: 4.0}, // back through the canyon
    {clip: 21, beats: 2, trim: 6.0}, // hairpin sweep
    {clip: 60, beats: 2, trim: 4.0}, // through the village
    {clip: 68, beats: 2, trim: 5.0},
    {clip: 66, beats: 2, trim: 5.0}, // roadside stop with the crew
    {clip: 100, beats: 2, trim: 0.2}, // massage after the loop (comic beat)
    // the Da Nang bass accent lands at beat 113.75 (51.29s), not the 113
    // grid line — hold the lunch shot through it so the cut hits ON the beat
    {clip: 27, beats: 2.75, trim: 6.5}, // group lunch overlooking the valley
  ],
};

/* ------------------------------------------------------------------ */
/* DA NANG + HOI AN — beats 113-145                                    */
/* ------------------------------------------------------------------ */
const daNang: Chapter = {
  id: 'da-nang',
  name: 'DA NANG',
  sub: 'CENTRAL VIETNAM',
  startBeat: 113.75, // measured bass accent (51.29s); grid beat 113 is empty
  card: true,
  cardBeats: 4.5, // chapter is short; don't overlap the HOI AN card
  shots: [
    {clip: 103, beats: 1.25, trim: 1.0, speed: 0.5, whip: 'left', impact: true}, // dragon bridge night (120fps)
    {clip: 104, beats: 2, trim: 0.5}, // night market rush
    {clip: 108, beats: 2, trim: 0.5}, // night skyline, lit towers
  ],
};

const hoiAn: Chapter = {
  id: 'hoi-an',
  name: 'HOI AN',
  sub: 'CENTRAL VIETNAM',
  startBeat: 119,
  card: true,
  shots: [
    {clip: 112, beats: 2, trim: 2.0, burst: true}, // DUCKS - the farm
    {clip: 117, beats: 4, trim: 12.0}, // wading through a thousand ducks
    {clip: 121, beats: 2, trim: 30.0}, // holding a duck
    {clip: 122, beats: 2, trim: 24.0}, // duck herding chaos
    {clip: 127, beats: 4, trim: 20.0, burst: true}, // basket boat SPINNING
    {clip: 129, beats: 2, trim: 1.0}, // basket boat flotilla
    {clip: 130, beats: 2, trim: 1.5}, // lantern street at dusk
    {clip: 132, beats: 4, trim: 15.0, push: true}, // lantern boats on the river (slow breather)
    {clip: 134, beats: 2, trim: 2.0}, // airport crew goodbye
    {clip: 135, beats: 2, trim: 0.3, audio: 0.4}, // plane cabin hop
  ],
};

/* ------------------------------------------------------------------ */
/* BALI — beats 145-209 (two phrases, the mid-video anchor)            */
/* ------------------------------------------------------------------ */
const bali: Chapter = {
  id: 'bali',
  name: 'BALI',
  sub: 'INDONESIA',
  startBeat: 145,
  card: true,
  shots: [
    {clip: 138, beats: 2, trim: 1.0, whip: 'left', impact: true}, // villa reveal
    // pool BACKFLIP — 4 beats so the full run-up, flip and splash play out
    {clip: 295, beats: 4, trim: 2.6, fit: 'contain'},
    {clip: 144, beats: 2, trim: 0.5}, // rooftop pool jump-in
    {clip: 147, beats: 2, trim: 0.5}, // bean-bag lawn to pool pan
    {clip: 142, beats: 2, trim: 1.5}, // beach club panorama
    {clip: 149, beats: 2, trim: 4.0}, // scooter cruise between stops
    {clip: 152, beats: 4, trim: 1.0, speed: 0.5}, // longer beach club golden-hour slow-mo
    {clip: 157, beats: 2, trim: 55.0}, // purple club crowd (upright section)
    {clip: 159, beats: 2, trim: 5.0, whip: 'right'}, // monkey forest bridge
    {clip: 160, beats: 4, trim: 8.0}, // monkeys everywhere
    {clip: 162, beats: 2, trim: 3.0}, // monkey close encounter
    {clip: 163, beats: 2, trim: 12.0}, // temple walk
    // sunrise hike sequence — drop at beat 177 lands on the summit
    {clip: 169, beats: 2, trim: 0.5}, // 4am headlamps in the dark
    {clip: 171, beats: 2, trim: 0.1}, // climbing in the dark, city lights below
    {clip: 174, beats: 2, trim: 1.5}, // first light on the horizon
    {clip: 175, beats: 4, trim: 2.0, push: true}, // SUNRISE over the caldera (hero)
    {clip: 180, beats: 4, trim: 2.0}, // summit group celebration
    {clip: 179, beats: 6, trim: 3.0}, // long horizontal pan across the summit view (extended)
    {clip: 183, beats: 2, trim: 3.0, rotation: -90}, // scree descent POV (upright section)
    {clip: 188, beats: 2, trim: 6.0, whip: 'left'}, // scooter POV pull-out
    {clip: 189, beats: 2, trim: 8.0}, // scooter convoy
    {clip: 190, beats: 2, trim: 20.0}, // cocktail-making class
    {clip: 191, beats: 2, trim: 6.0}, // bartender crew toast
    {clip: 195, beats: 2, trim: 2.0}, // last night out (upright section; clip flips upside down after ~6s)
    {clip: 143, beats: 2, trim: 0.5}, // pool dive-bomb send-off
  ],
};

/* ------------------------------------------------------------------ */
/* PHUKET — beats 209-241                                              */
/* ------------------------------------------------------------------ */
const phuket: Chapter = {
  id: 'phuket',
  name: 'PHUKET',
  sub: 'THAILAND',
  startBeat: 209,
  card: true,
  // hold the card through the clip-205 elephant walk-up (beats 217-221) so
  // the elephant passes IN FRONT of the text (matte overlay in Vlog.tsx)
  cardBeats: 12,
  shots: [
    {clip: 199, beats: 2, trim: 2.0, whip: 'left', impact: true}, // old town facades
    {clip: 197, beats: 2, trim: 0.3}, // market
    {clip: 201, beats: 2, trim: 1.0}, // elephants reaching over the rail
    {clip: 202, beats: 2, trim: 0.2}, // elephant selfie at the fence
    // trim 1.2 so the elephant walks right up AND past the camera within
    // the window; mirrored so the pass sweeps across the lower-left,
    // in front of the PHUKET card (matte overlay in Vlog.tsx)
    {clip: 205, beats: 4, trim: 1.2, flip: true},
    {clip: 206, beats: 2, trim: 1.0}, // washing the elephant
    {clip: 207, beats: 2, trim: 3.0}, // elephant shower spray
    {clip: 208, beats: 2, trim: 1.0, speed: 0.5}, // viewpoint sunset (120fps)
    {clip: 210, beats: 2, trim: 1.0, speed: 0.5}, // dusk view slow-mo (120fps)
    {clip: 211, beats: 2, trim: 0.3}, // heading out for the night (flips after ~1.5s)
    {clip: 213, beats: 6, trim: 12.0, speed: 0.5}, // longer PARTY BUS slow-mo (120fps)
    {clip: 212, beats: 4, trim: 0.5}, // toast to close the night
  ],
};

/* ------------------------------------------------------------------ */
/* THE ISLANDS (Ko Yao / Phi Phi) — beats 241-273                      */
/* ------------------------------------------------------------------ */
const islands: Chapter = {
  id: 'islands',
  name: 'THE ISLANDS',
  sub: 'KO YAO — PHI PHI — MAYA BAY',
  startBeat: 241,
  card: true,
  shots: [
    // DAY (Jun 19) — boat out, Maya Bay, jump + snorkel (new clips in true order)
    {clip: 216, beats: 2, trim: 1.0, whip: 'right', impact: true}, // pier turquoise water
    {clip: 225, beats: 2, trim: 12.0}, // longtail past the karst cliffs
    {clip: 226, beats: 2, trim: 1.5}, // MAYA BAY reveal
    {clip: 227, beats: 1, trim: 1.0}, // white sand walk
    {clip: 228, beats: 1, trim: 0.5}, // turquoise pan
    {clip: 328, beats: 2, trim: 4.95, fit: 'contain'}, // NEW: flip off the platform into the splash
    {clip: 329, beats: 2, trim: 9.0}, // NEW: snorkeling under the karst cliffs
    {clip: 229, beats: 2, trim: 2.0}, // boat snacks grin
    // SUNSET (Jun 19)
    {clip: 330, beats: 2, trim: 1.5}, // NEW: viewpoint pan across the crew at sunset
    // clip 333 is the motion-interpolated 4x version of 231; speed 2 nets a
    // smooth 0.5x (the raw clip is ~29 real fps and juddered at half speed)
    {clip: 333, beats: 3, trim: 2.4, speed: 2}, // sunset slow-mo hero
    // NIGHT — fire show (Jun 18) grouped into the night run
    {clip: 218, beats: 1, trim: 2.0}, // fire show start
    {clip: 219, beats: 2, trim: 12.0, burst: true}, // fire poi spinning
    {clip: 326, beats: 2, trim: 13.0}, // NEW: fire show wide, crowd on the sand
    {clip: 327, beats: 2, trim: 2.0}, // NEW: flaming jump-rope close
    {clip: 220, beats: 1, trim: 5.0}, // beach restaurant night
    {clip: 232, beats: 1, trim: 1.0}, // hotel room dance
    {clip: 234, beats: 1, trim: 1.0}, // neon bar street
    {clip: 235, beats: 1, trim: 0.4}, // night out, neon bar street (upright section; flips after ~2s)
    {clip: 331, beats: 2, trim: 5.8, fit: 'contain'}, // NEW: last night, jumping the fire rope
  ],
};

/* ------------------------------------------------------------------ */
/* BANGKOK — beats 273-305                                             */
/* ------------------------------------------------------------------ */
const bangkok: Chapter = {
  id: 'bangkok',
  name: 'BANGKOK',
  sub: 'THAILAND — FINAL STOP',
  startBeat: 273,
  card: true,
  shots: [
    {clip: 246, beats: 2, trim: 0.5, whip: 'left', impact: true}, // reclining buddha
    {clip: 247, beats: 2, trim: 1.0}, // grand palace walls
    {clip: 332, beats: 2, trim: 3.0}, // NEW: motorbike taxi weaving under the skytrain
    {clip: 257, beats: 2, trim: 1.5}, // motorbike taxi selfie
    {clip: 260, beats: 2, trim: 6.0}, // flower market
    {clip: 262, beats: 2, trim: 0.5}, // cooking class aprons
    {clip: 264, beats: 2, trim: 5.0}, // wok flames
    {clip: 266, beats: 2, trim: 10.0}, // pad thai plating
    {clip: 271, beats: 2, trim: 1.0}, // TATTOO gun lines
    {clip: 272, beats: 2, trim: 2.0}, // fresh ink reveal
    {clip: 254, beats: 2, trim: 1.0}, // karaoke room disco lights
    {clip: 244, beats: 2, trim: 2.0}, // club balcony crowd
    {clip: 276, beats: 2, trim: 6.0}, // party van singalong
    {clip: 274, beats: 2, trim: 2.0}, // night highway bikes
    {clip: 277, beats: 4, trim: 0.5}, // skyline at night (longer hold into the outro)
  ],
};

/* ------------------------------------------------------------------ */
/* OUTRO — beats 305-320, final slam at 320 cuts to the end card       */
/* ------------------------------------------------------------------ */
const outro: Chapter = {
  id: 'outro',
  name: '',
  sub: '',
  startBeat: 305,
  card: false,
  shots: [
    // shots crossfade into each other here (see Vlog.tsx) — the montage
    // decelerates and dissolves instead of hard-cutting over the quieting music
    {clip: 280, beats: 2, trim: 0.5, audio: 0.3}, // airport walk
    {clip: 281, beats: 2, trim: 0.2}, // plane seats home
    {clip: 175, beats: 2, trim: 4.0}, // sunrise echo
    {clip: 226, beats: 2, trim: 2.5}, // maya bay echo
    {clip: 224, beats: 2, trim: 1.8}, // fresh longtail-boat shot approaching the karst islands
    // motion-interpolated 4x slow-mo (the raw clip is ~29 real fps despite its
    // 120fps container, so playbackRate 0.25 juddered — clip 333 is smooth)
    {clip: 333, beats: 4, trim: 0.0, push: true}, // sunset ultra-slow into the slam
  ],
};

export const CHAPTERS: Chapter[] = [
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

/** Beat where the end card starts. The audible final slam BEGINS at beat 319
 *  (143.65s, measured sub-bass peak) — beat 320 is already its decay. */
export const END_CARD_BEAT = 319;
