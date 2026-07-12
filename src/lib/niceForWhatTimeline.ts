/**
 * NICE FOR WHAT cut. Same clip multiset as the second draft, re-cut onto the
 * 93.5 BPM bounce grid (beat n lands at 0.128 + n*0.6417 seconds).
 *
 * Musical landmarks of the 2:39 music edit:
 *   beat 0-16    quiet Lauryn Hill loop (natural-audio intro)
 *   beat 16      vocal build starts
 *   beat 32      DROP 1  - title slam (20.66s)
 *   beat 64-76   kick drops out (Ninh Binh calm rides the silence)
 *   beat 96-112  4-bar quiet breath (the hungover morning after)
 *   beat 112     DROP 2  - Da Nang dragon bridge night
 *   beat 176     strong section - Phuket entry
 *   beat 192     CLIMAX  - loudest bars of the song (party bus / Maya Bay)
 *   beat 220-224 one-bar dropout (cooking-class calm)
 *   beat 240     the beat dies - end card rides the natural decay
 */

import type {Shot} from './timeline';

export type {Shot};

export type NfwChapter = {
  id: string;
  name: string;
  sub: string;
  startBeat: number;
  card: boolean;
  cardDelayBeats?: number;
  shots: Shot[];
};

/* ------------------------------------------------------------------ */
/* COLD OPEN — natural audio over the bare Lauryn loop, flash-forward  */
/* build as the vocals ramp, title slam on the drop (beats 0-40)       */
/* ------------------------------------------------------------------ */
const coldOpen: NfwChapter = {
  id: 'cold-open',
  name: '',
  sub: '',
  startBeat: 0,
  card: false,
  shots: [
    // day 1 in true order: land in Hanoi, ride in, first walk, old quarter
    {clip: 282, beats: 5, trim: 1.0, audio: 0.7}, // airport arrival, luggage in tow
    {clip: 283, beats: 4, trim: 3.0, audio: 0.5}, // van into the city
    {clip: 286, beats: 4, trim: 2.0, audio: 0.5}, // first walk, talking to the camera
    {clip: 284, beats: 3, trim: 4.0}, // old-quarter street, scooters buzzing past
    // flash-forward through the trip as the vocals build — accelerating cuts
    {clip: 117, beats: 3, trim: 13.0}, // wading through a thousand ducks (Hoi An)
    {clip: 127, beats: 2.5, trim: 20.0}, // basket boat spin (Hoi An)
    {clip: 295, beats: 2.5, trim: 3.8, fit: 'contain'}, // pool backflip mid-air (Bali)
    {clip: 175, beats: 2, trim: 2.5}, // volcano sunrise (Bali)
    {clip: 205, beats: 2, trim: 1.0}, // elephant close-up (Phuket)
    {clip: 213, beats: 1.5, trim: 13.0}, // party bus (Phuket)
    {clip: 219, beats: 1.25, trim: 13.0}, // fire poi (the islands)
    {clip: 231, beats: 1.25, trim: 0.2}, // island sunset (the islands)
    // TITLE SLAM (beats 32-40) — MAYA BAY hero under the drop,
    // gently slowed so the full clip carries the 5.1s hold
    {clip: 226, beats: 8, trim: 0.0, speed: 0.7, whip: 'left', push: true},
  ],
};

/* ------------------------------------------------------------------ */
/* HANOI + NINH BINH — beats 40-57, bouncing city on the drop-1 verse  */
/* ------------------------------------------------------------------ */
const hanoi: NfwChapter = {
  id: 'hanoi',
  name: 'HANOI',
  sub: 'OLD QUARTER + NINH BINH — DAY 1',
  startBeat: 40,
  card: true,
  shots: [
    {clip: 294, beats: 3, trim: 22.0, whip: 'left'}, // TRAIN passes inches away (chapter slam)
    {clip: 289, beats: 1.5, trim: 2.0}, // crossing old-quarter traffic
    {clip: 293, beats: 1.5, trim: 10.0, bw: true}, // train street - viewfinder beat
    {clip: 288, beats: 1.5, trim: 8.0}, // street-food dinner, beers
    {clip: 323, beats: 1.5, trim: 2.0}, // group hotpot dinner
    {clip: 307, beats: 1.5, trim: 6.0, whip: 'right'}, // Trang An boat launch
    {clip: 309, beats: 1.25, trim: 8.0}, // kayaking the karst river
    {clip: 311, beats: 1.25, trim: 8.0}, // paddling into the cave
    {clip: 313, beats: 1.25, trim: 4.0}, // inside the dark cave, lights on the water
    {clip: 0, beats: 2, trim: 1.2, audio: 0.4}, // sleeper bus north to Ha Giang
    {clip: 2, beats: 0.75, trim: 6.0}, // glance at the loop map
  ],
};

/* ------------------------------------------------------------------ */
/* HA GIANG — beats 57-112. Arrival viewpoints ride the kick dropout   */
/* (64-76), day riding on the kick return, strobes on the strongest    */
/* pre-drop bars, and the hungover morning floats through the 4-bar    */
/* quiet breath (96-112).                                              */
/* ------------------------------------------------------------------ */
const haGiang: NfwChapter = {
  id: 'ha-giang',
  name: 'HA GIANG',
  sub: 'NORTHERN VIETNAM',
  startBeat: 57,
  card: true,
  shots: [
    // arrival — the kick drops out and the mountains open up
    {clip: 17, beats: 3, trim: 5.6, whip: 'left'}, // convoy rolls out
    {clip: 74, beats: 4, trim: 9.0, push: true}, // long valley pan (card over this)
    {clip: 46, beats: 3, trim: 8.0}, // crew at the viewpoint
    {clip: 62, beats: 2.5, trim: 0.0}, // group selfie at the cloud viewpoint
    {clip: 64, beats: 2.5, trim: 2.0}, // posing on the karst peak
    {clip: 27, beats: 2, trim: 6.5}, // lunch overlooking the valley
    {clip: 21, beats: 2, trim: 6.0}, // rolling again — hairpin sweep
    // kick back in (beat 76) — the riding montage rips
    {clip: 29, beats: 1.5, trim: 11.5}, // hairpin sweep from above
    {clip: 35, beats: 1.5, trim: 0.5}, // riders rounding the guardrail bend
    {clip: 40, beats: 1, trim: 5.0}, // pass sweep
    {clip: 93, beats: 1, trim: 1.0}, // dirt road through the village
    {clip: 26, beats: 1, trim: 7.3}, // valley road curve
    {clip: 94, beats: 1, trim: 3.2}, // rocky riverbed trail
    {clip: 33, beats: 1, trim: 6.0}, // valley switchbacks
    {clip: 49, beats: 2, trim: 15.0}, // feast spread — night falls
    // NIGHT — strobes on the strongest pre-drop bars (beats 86-96)
    {clip: 55, beats: 1, trim: 1.5}, // club strobe
    {clip: 56, beats: 1, trim: 3.0},
    {clip: 57, beats: 1, trim: 1.0},
    {clip: 58, beats: 1, trim: 1.5},
    {clip: 53, beats: 1.5, trim: 2.0, speed: 0.5}, // market lights slow-mo
    {clip: 50, beats: 1.5, trim: 1.0, speed: 0.5}, // night market slow-mo (120fps)
    {clip: 88, beats: 1, trim: 0.5}, // karaoke-bar madness
    {clip: 81, beats: 1, trim: 2.0, speed: 0.5}, // bar 120fps slow-mo
    {clip: 85, beats: 1, trim: 1.0}, // bar dance floor
    // MORNING AFTER — the music itself goes quiet for 4 bars (beats 96-112)
    {clip: 96, beats: 2.5, trim: 7.0, whip: 'right'}, // rain ride through the mist
    {clip: 99, beats: 2, trim: 2.0}, // wet street convoy
    {clip: 44, beats: 1.5, trim: 4.0}, // back through the canyon
    {clip: 60, beats: 1.5, trim: 4.0}, // through the village
    {clip: 68, beats: 1.5, trim: 5.0},
    {clip: 66, beats: 1.5, trim: 5.0}, // roadside stop with the crew
    {clip: 100, beats: 1.5, trim: 0.2}, // massage after the loop (comic beat)
    {clip: 20, beats: 2.5, trim: 6.0}, // convoy strung along the ridge road
    {clip: 92, beats: 1.5, trim: 4.5}, // last full-throttle straightaway
  ],
};

/* ------------------------------------------------------------------ */
/* DA NANG — beats 112-118, dragon bridge slow-mo lands ON DROP 2      */
/* ------------------------------------------------------------------ */
const daNang: NfwChapter = {
  id: 'da-nang',
  name: 'DA NANG',
  sub: 'CENTRAL VIETNAM',
  startBeat: 112,
  card: true,
  shots: [
    {clip: 103, beats: 2.5, trim: 1.0, speed: 0.5, whip: 'left'}, // dragon bridge night (120fps)
    {clip: 104, beats: 2, trim: 0.5}, // night market rush
    {clip: 108, beats: 1.5, trim: 0.5}, // night skyline, lit towers
  ],
};

/* ------------------------------------------------------------------ */
/* HOI AN — beats 118-134, ducks bounce on the drop-2 groove           */
/* ------------------------------------------------------------------ */
const hoiAn: NfwChapter = {
  id: 'hoi-an',
  name: 'HOI AN',
  sub: 'CENTRAL VIETNAM',
  startBeat: 118,
  card: true,
  shots: [
    {clip: 112, beats: 1.5, trim: 2.0}, // DUCKS - the farm
    {clip: 117, beats: 2.5, trim: 12.0}, // wading through a thousand ducks
    {clip: 121, beats: 1.5, trim: 30.0}, // holding a duck
    {clip: 122, beats: 1.5, trim: 24.0}, // duck herding chaos
    {clip: 127, beats: 2.5, trim: 20.0}, // basket boat SPINNING
    {clip: 129, beats: 1, trim: 1.0}, // basket boat flotilla
    {clip: 130, beats: 1.5, trim: 1.5}, // lantern street at dusk
    {clip: 132, beats: 2, trim: 15.0, push: true}, // lantern boats on the river
    {clip: 134, beats: 1, trim: 2.0}, // airport crew goodbye
    {clip: 135, beats: 1, trim: 0.3, audio: 0.4}, // plane cabin hop
  ],
};

/* ------------------------------------------------------------------ */
/* BALI — beats 134-176, pool party through the medium section,        */
/* sunrise hike closes the chapter into the strong section             */
/* ------------------------------------------------------------------ */
const bali: NfwChapter = {
  id: 'bali',
  name: 'BALI',
  sub: 'INDONESIA',
  startBeat: 134,
  card: true,
  shots: [
    {clip: 138, beats: 2, trim: 1.0, whip: 'left'}, // villa reveal
    // pool BACKFLIP — full run-up, flip and splash
    {clip: 295, beats: 4, trim: 2.6, fit: 'contain'},
    {clip: 143, beats: 1.5, trim: 0.5}, // pool dive-bomb
    {clip: 144, beats: 1.5, trim: 0.5}, // rooftop pool jump-in
    {clip: 147, beats: 1.5, trim: 0.5}, // bean-bag lawn to pool pan
    {clip: 142, beats: 1.5, trim: 1.5}, // beach club panorama
    {clip: 149, beats: 1.5, trim: 4.0}, // scooter cruise between stops
    {clip: 152, beats: 2, trim: 1.0, speed: 0.5}, // beach club golden-hour slow-mo
    {clip: 157, beats: 1.5, trim: 55.0}, // purple club crowd (upright section)
    {clip: 159, beats: 1.5, trim: 5.0, whip: 'right'}, // monkey forest bridge
    {clip: 160, beats: 1.5, trim: 8.0}, // monkeys everywhere
    {clip: 162, beats: 1.5, trim: 3.0}, // monkey close encounter
    {clip: 163, beats: 1, trim: 12.0}, // temple walk
    // sunrise hike — quiet awe before the strong section
    {clip: 169, beats: 1.5, trim: 0.5}, // 4am headlamps in the dark
    {clip: 171, beats: 1.5, trim: 0.1}, // climbing in the dark, city lights below
    {clip: 174, beats: 1.5, trim: 1.5}, // first light on the horizon
    {clip: 175, beats: 3.5, trim: 2.0, push: true}, // SUNRISE over the caldera (hero)
    {clip: 180, beats: 1.5, trim: 2.0}, // summit group celebration
    {clip: 179, beats: 3, trim: 3.0}, // long horizontal pan across the summit view
    {clip: 183, beats: 1, trim: 3.0, rotation: -90}, // scree descent POV
    // last evening social run into Phuket
    {clip: 188, beats: 1, trim: 6.0}, // scooter POV pull-out
    {clip: 189, beats: 1, trim: 8.0}, // scooter convoy
    {clip: 190, beats: 1, trim: 20.0}, // cocktail-making class
    {clip: 191, beats: 1, trim: 6.0}, // bartender crew toast
    {clip: 193, beats: 1, trim: 3.0}, // card games at the villa
    {clip: 195, beats: 1, trim: 2.0}, // last night out (upright section)
  ],
};

/* ------------------------------------------------------------------ */
/* PHUKET — beats 176-196, opens on the strong section; the PARTY BUS  */
/* slow-mo lands exactly on the CLIMAX at beat 192                     */
/* ------------------------------------------------------------------ */
const phuket: NfwChapter = {
  id: 'phuket',
  name: 'PHUKET',
  sub: 'THAILAND',
  startBeat: 176,
  card: true,
  shots: [
    {clip: 199, beats: 1.5, trim: 2.0, whip: 'left'}, // old town facades
    {clip: 197, beats: 1, trim: 0.3}, // market
    {clip: 201, beats: 1.5, trim: 1.0}, // elephants reaching over the rail
    {clip: 202, beats: 1, trim: 0.2}, // elephant selfie at the fence
    {clip: 205, beats: 2.5, trim: 0.3}, // elephant walking right up to the camera
    {clip: 206, beats: 1.5, trim: 1.0}, // washing the elephant
    {clip: 207, beats: 1.5, trim: 3.0}, // elephant shower spray
    {clip: 208, beats: 2, trim: 0.4, speed: 0.5}, // viewpoint sunset (120fps)
    {clip: 210, beats: 1.5, trim: 1.0, speed: 0.5}, // dusk view slow-mo (120fps)
    {clip: 211, beats: 1, trim: 0.3}, // heading out for the night
    {clip: 212, beats: 1, trim: 0.5}, // toast
    // CLIMAX (beat 192) — the rowdiest footage on the loudest bars
    {clip: 213, beats: 4, trim: 12.0, speed: 0.5}, // PARTY BUS slow-mo (120fps)
  ],
};

/* ------------------------------------------------------------------ */
/* THE ISLANDS — beats 196-216, Maya Bay mid-climax, fire show on the  */
/* climax tail                                                         */
/* ------------------------------------------------------------------ */
const islands: NfwChapter = {
  id: 'islands',
  name: 'THE ISLANDS',
  sub: 'KO YAO — PHI PHI — MAYA BAY',
  startBeat: 196,
  card: true,
  shots: [
    {clip: 216, beats: 1.5, trim: 1.0, whip: 'right'}, // pier turquoise water
    {clip: 225, beats: 2.5, trim: 12.0}, // longtail past the karst cliffs
    {clip: 226, beats: 2, trim: 1.5}, // MAYA BAY reveal
    {clip: 227, beats: 1.5, trim: 1.0}, // white sand walk
    {clip: 228, beats: 1.5, trim: 0.5}, // turquoise pan
    {clip: 229, beats: 1.5, trim: 1.0}, // boat snacks grin
    {clip: 231, beats: 2.5, trim: 0.0, speed: 0.5}, // sunset slow-mo hero (120fps)
    {clip: 218, beats: 1.5, trim: 2.0}, // fire show start
    {clip: 219, beats: 2, trim: 12.0}, // fire poi spinning
    {clip: 220, beats: 1.5, trim: 5.0}, // beach restaurant night
    {clip: 232, beats: 1, trim: 1.0}, // hotel room dance
    {clip: 234, beats: 0.5, trim: 1.0}, // neon bar street
    {clip: 235, beats: 0.5, trim: 0.4}, // night out, neon bar street (upright section)
  ],
};

/* ------------------------------------------------------------------ */
/* BANGKOK — beats 216-232. Cooking-class calm rides the one-bar       */
/* dropout (220-224), then a rapid-fire night blitz on the final       */
/* strong bars                                                         */
/* ------------------------------------------------------------------ */
const bangkok: NfwChapter = {
  id: 'bangkok',
  name: 'BANGKOK',
  sub: 'THAILAND — FINAL STOP',
  startBeat: 216,
  card: true,
  shots: [
    {clip: 246, beats: 1.5, trim: 0.5, whip: 'left'}, // reclining buddha
    {clip: 247, beats: 1.25, trim: 1.0}, // grand palace walls
    {clip: 257, beats: 0.75, trim: 1.5}, // motorbike taxi selfie
    {clip: 260, beats: 0.5, trim: 6.0}, // flower market
    // one-bar dropout — the calm inside the chaos
    {clip: 262, beats: 2, trim: 0.5}, // cooking class aprons
    {clip: 264, beats: 2, trim: 5.0}, // wok flames
    // final strong bars — night blitz
    {clip: 266, beats: 1, trim: 10.0}, // pad thai plating
    {clip: 271, beats: 1, trim: 1.0}, // TATTOO gun lines
    {clip: 272, beats: 1, trim: 2.0}, // fresh ink reveal
    {clip: 254, beats: 0.75, trim: 1.0}, // karaoke room disco lights
    {clip: 244, beats: 1.75, trim: 2.0}, // club balcony crowd (longer hold)
    {clip: 276, beats: 0.75, trim: 6.0}, // party van singalong
    {clip: 274, beats: 0.75, trim: 2.0}, // night highway bikes
    {clip: 277, beats: 1, trim: 0.5}, // skyline at night
  ],
};

/* ------------------------------------------------------------------ */
/* OUTRO — beats 232-240; memories flash by, the last slow-mo sunset   */
/* holds until the beat dies at 240 and the end card rides the decay   */
/* ------------------------------------------------------------------ */
const outro: NfwChapter = {
  id: 'outro',
  name: '',
  sub: '',
  startBeat: 232,
  card: false,
  shots: [
    {clip: 280, beats: 2.5, trim: 0.5, audio: 0.3}, // airport walk
    {clip: 281, beats: 1.5, trim: 0.2}, // plane seats home
    {clip: 175, beats: 0.75, trim: 4.0}, // sunrise echo
    {clip: 226, beats: 0.75, trim: 2.5}, // maya bay echo
    {clip: 224, beats: 0.75, trim: 1.8}, // longtail-boat echo
    {clip: 231, beats: 1.75, trim: 0.0, speed: 0.25, push: true}, // sunset ultra-slow into the slam
  ],
};

export const NFW_CHAPTERS: NfwChapter[] = [
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

export const NFW_TITLE_BEAT = 32;
export const NFW_TITLE_LEN_BEATS = 8;

/** Beat where the montage ends and the end card rides the decay. */
export const NFW_END_CARD_BEAT = 240;
