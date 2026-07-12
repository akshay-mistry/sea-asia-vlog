# Vlog sample re-analysis

## Scope and method

The four supplied files are short excerpts (13.14–23.59 seconds), not demonstrably complete vlogs. Opening and ending observations therefore describe the excerpts; only Samples 1 and 2 have a visibly designed resolution.

Measurements used decoded frames, not container thumbnails:

- `ffprobe` for dimensions, frame rate, duration, and audio format.
- FFmpeg scene scores at four thresholds, then frame-by-frame visual verification.
- 10 fps dense filmstrips and before/after boundary sheets.
- Spectral-flux onsets plus autocorrelation beat grids. Beat estimates may resolve at half- or double-time; onset proximity is the safer cut-sync metric.
- Exact-frame freeze/duplicate analysis, `cropdetect`, `blackdetect`, and `silencedetect`.
- Timestamp precision is one source frame: ±0.040s (Sample 1), ±0.042s (Sample 2), ±0.033s (Sample 3), ±0.0417s (Sample 4).

## Technical inventory

- **Sample 1:** 18.6907s, 1276×720 (1.7722:1), 25 fps, stereo AAC 44.1 kHz. Active image 1264×720; the 6 px side margins are export residue, not a creative matte.
- **Sample 2:** 23.5886s, 720×1280 (9:16), 24 fps, stereo AAC 44.1 kHz. The actual image is a 720×480 strip at y=400, occupying only 37.5% of canvas height; 400 px black mattes sit above and below.
- **Sample 3:** 21.4988s, 1080×608 (1.7763:1), 30 fps, stereo AAC 44.1 kHz. Active image 1072×608; effectively full-frame 16:9.
- **Sample 4:** 13.1396s, 1276×718 (1.7772:1), 23.976 fps, stereo AAC 44.1 kHz. Active image 1264×704; negligible export-edge matte.

## Sample 1 — cinematic destination reel

**Structure and boundaries**

- **0.000–2.520, departure/title hold:** one continuous airport café shot. A red cutout flash occupies 0.000–0.160. The large red serif `VIETNAM` is visible 1.440–2.280; a solid red wipe occupies roughly 2.400–2.520.
- **2.520–3.600, route micro-montage:** cuts at 2.520, 2.880, 3.200, 3.480, 3.600. Durations after the first cut are 0.36/0.32/0.28/0.12s (median 0.30s): ticket, train doorway, aircraft cabin, blur, mountain reveal.
- **3.600–9.520, destination montage:** boundaries at 4.960, 5.560, 6.200, 7.000, 7.440, 8.160, 8.960, 9.520. Shot lengths 1.36/0.60/0.64/0.80/0.44/0.72/0.80/0.56s (median 0.68s). The 3.94–4.66 mountain image is deliberately held while graphic/cutout elements change.
- **9.520–15.640, object-match/travel montage:** boundaries at 10.040, 10.160, 11.440, 11.840, 12.640, 13.120, 13.880, 14.840, 15.640. Median shot length 0.76s. The map sequence at 10.040–10.560 is an object match plus zoom/blur bridge, not a sustained speed ramp.
- **15.640–18.691, resolve:** water scene 15.640–16.560; monochrome map flashes 16.560–16.720; aerial hold 16.720–18.691. Lower-left card reads `Flyscoot / Vietnam Diaries 1` for the final 1.97s.

Across the excerpt, the verified boundary list has a 0.68s median (0.779s mean; 10th–90th percentile 0.28–1.36s). Estimated music tempo is 129.2 BPM. Only 9/23 cuts are within 80ms of the simple beat grid, but 16/23 are within 80ms of a measured musical onset: it cuts to syncopation and accents, not mechanically to every beat.

**Treatment**

- Warm green/orange travel grade, soft highlights, occasional hard black-and-white insert at 6.20–7.00.
- Full frame throughout; no creative letterbox.
- Graphics recur in red: opening cutout flash, serif title, red silhouettes over scenic plates, and transition blocks.
- Hard cuts dominate; blur/zoom/object-match bridges are isolated punctuation.
- No unambiguous continuous speed ramp. The conspicuous effects are frame holding and transition zooms.

## Sample 2 — vertical collage experiment

This sample is structurally different from the other three. It is a 3:2 image strip centered inside a 9:16 black canvas, with cutout people, picture-in-picture rectangles, and background replacement.

**Structural boundaries**

- 0.000–4.792: uninterrupted field interaction.
- 4.792–5.833: sunset two-shot.
- 5.833–7.750: walking cutout with stacked/swapping scenic panels. Detected plate changes at 5.917, 6.000, and 6.083 (each 2 source frames/0.083s).
- 7.750–9.083: sunglasses close-up; landscapes replace the reflections/lenses.
- 9.083–10.958: horse/camp composite with nested panels.
- 10.958–12.542: masked close-up; background changes at 11.208, 11.458, and 12.000.
- 12.542–14.417: running figure with overlay panels; base composition changes at 13.375.
- 14.417–15.250: waterfall cutout/collage.
- 15.250–17.083: traveler/mountain tile build.
- 17.083–17.667: seven background plates at 0.083s intervals (17.083/17.167/17.250/17.333/17.417/17.500/17.583), then a 1.00s visual hold.
- 18.667–19.500: running full-frame segment.
- 19.500–21.458: group/mountain hold.
- 21.458–21.875: six 0.083s background swaps (21.458 through 21.875).
- 21.875–23.042: standing cutout over group; inset panel appears around 22.42 and expands to full image by 22.92.
- 23.042–23.589: fade down.

The 17 structural boundaries have a 1.042s median, but that number deliberately excludes internal panel/plate substitutions. The two hyper-bursts operate at 12 changes/second. Estimated half-time tempo is 112.35 BPM; 17/17 structural boundaries are within 80ms of a measured onset (13/17 within 40ms).

**Treatment**

- Active imagery is bright and moderately saturated (mean luma 0.491, mean saturation 0.364); the whole-frame luma is only 0.184 because 62.5% of the canvas is black.
- Compositing, masks, nested rectangles, and background changes carry the rhythm more than ordinary shot changes.
- No title or location card appears.
- No clear temporal speed ramp; apparent acceleration comes from increasingly fast layer replacement.

## Sample 3 — title system plus hyper-montage

**Structure and boundaries**

- **0.000–2.533, opening hook:** cuts every 0.200s from 0.200 through 2.000, then at 2.167, 2.333, and 2.533. Thirteen rapid boundaries create a 5-shots/second sensory preview.
- **2.533–8.433, hero/title breath:** a single 5.90s gate approach. Source frames are held in 0.10–0.17s groups from 2.567–3.833, producing deliberate low-frame-rate/stop-motion movement. `VIETNAM` first appears at 5.233. The title alternates between distressed bold yellow and yellow script while the subject approaches.
- **8.433–10.433, title reprise:** opening shots return under `WELCOME TO / VIETNAM`, changing every 0.200s at 8.433/8.633/8.833/9.033/9.233/9.433/9.633/9.833/10.033/10.233/10.433.
- **9.833–11.033, simultaneous squeeze-out:** black bands progressively compress the title/image into a thin horizontal line. A true black interval occurs at 11.033–11.133.
- **11.133–14.567, body montage:** mostly 0.30–0.37s shots, with brief 0.133s accents and one 0.767s breath at 13.800–14.567.
- **14.567–20.700, sustained montage:** mostly 0.300s shots, with 0.167–0.433s variants. The repeated 0.30s grid is the main body cadence.
- **20.700–21.499:** dark night hold, 0.799s, then excerpt end.

The 58 verified boundaries have a 0.267s median (0.364s mean; 10th–90th percentile 0.166–0.400s). Estimated double-time tempo is 184.57 BPM (92.29 BPM half-time). Only 32/58 cuts are within 80ms of measured onsets because the 0.2s hook/reprise grid is intentionally faster than the soundtrack pulse; the 0.30s body grid is closer to double-time.

**Treatment**

- Highest saturation of the full-frame references (0.434), teal/yellow bias, deep blacks, visible vintage/film texture.
- No chapter card beyond the long country-title system.
- Hard cuts and graphic crop/squeeze transitions dominate. No sustained speed ramp is visible.
- The opening is not “constant fast”: a 2.53s hyper-burst is followed by a 5.90s breath.

## Sample 4 — immediate title, food/day montage

**Structure and boundaries**

- **0.000–1.794, immediate title:** large white sans `DAYS IN    HOI AN` and tiny `SHOT ON SONY A6700` are present from frame 0. A foreground motorbike crosses from roughly 1.30–1.79, acting as a natural wipe into the next shot.
- **1.794–7.925, daytime montage:** verified boundaries at 2.669, 3.212, 3.462, 3.962, 4.379, 4.838, 5.339, 5.923, 6.173, 6.548, 7.049, 7.466, 7.925. Typical durations are 0.25–0.88s. A radial zoom/blur bridge occurs at 5.255–5.380; this is a transition, not a time ramp.
- **7.925–8.467, micro-burst:** title-location recall, daytime people, indoor shot, night ride, and night-market close-up; boundaries at 8.175, 8.342, and 8.467 yield 0.250/0.167/0.125s.
- **8.467–11.845, night/food montage:** boundaries 9.176, 9.676, 10.552, 11.386, 11.845; lengths 0.709/0.500/0.876/0.834/0.459s.
- **11.845–13.140, ending hold:** same doorway angle for 1.295s, with a same-angle jump at 12.346 rather than an exact freeze replay.

The 23 verified boundaries have a 0.500s median (0.547s mean; 10th–90th percentile 0.25–0.875s). Tempo is 136.0 BPM. Beat/onset locking is the strongest conventional example: 17/23 cuts are within 80ms of the beat grid and 18/23 within 80ms of a measured onset.

**Treatment**

- Crispest/highest edge contrast of the references, with warm skin, saturated foliage, and mixed day/night color.
- Mostly hard cuts. The natural motorbike wipe, one radial zoom, and a brief night whip are isolated.
- Human action and food close-ups alternate with wider context; it does not run scenic establishing shots alone.

## Repeated rules versus one-offs

**Repeated, therefore safe to treat as design rules**

1. **Put people/action in the first frame.** All four begin with a person, interaction, or human-scale action rather than an empty postcard.
2. **Use speed in bursts, not continuously.** Samples 1, 3, and 4 pair 0.12–0.30s bursts with 1.3–5.9s holds; Sample 2 opens on 4.79s before its collage accelerates.
3. **Lock structural cuts to accents.** Within 80ms of measured onsets: Sample 1 16/23, Sample 2 17/17, Sample 3 32/58, Sample 4 18/23. Sample 3 is the deliberate exception during its faster-than-music hook.
4. **Default to hard cuts.** Whips, zooms, wipes, and graphic transitions appear as occasional punctuation, not between every shot.
5. **Titles sit over meaningful live action.** Three titled samples avoid a detached black slate. Title treatment differs, but the image continues underneath.
6. **End slower than the montage.** Final holds are 1.97s (Sample 1), 0.55s fade after a 1.17s composite (Sample 2), 0.80s versus a 0.30s body (Sample 3), and 1.30s versus a 0.50s body (Sample 4).
7. **Use a restrained location label if needed.** The only small card is Sample 1's lower-left two-line label; there is no evidence for frequent full-screen chapter slates.
8. **Soundtrack remains continuous.** No sample contains a ≥180ms gap below −38 dBFS. The excerpts provide no evidence for a true music-off dialogue or ambience break.

**One-off choices, not general rules**

- Sample 2's 9:16 black canvas, 3:2 picture strip, cutouts, and nested panels.
- Sample 3's 5.90s country-title system and 5-shots/second opening.
- Sample 1's red rotoscope/cutout motif and airline-branded final card.
- Sample 4's camera-credit subtitle and motorbike wipe.
- Sample 3's full-frame squeeze into a line at 9.83–11.03.

## Concrete Remotion rules for this Southeast Asia vlog

The project footage is 326 720p clips: 274 horizontal/52 vertical; 283 iPhone/43 GoPro. The selected draft is 142 shots in a 144.1s 16:9 edit, with 126 horizontal/16 vertical shots. Its track is 133.333 BPM, 0.45s per beat, phase 0.105s, and 14.4s/32-beat phrases.

1. **Frame cuts from the beat map, not accumulated durations.** At 30 fps use `round((0.105 + beatIndex * 0.45) * 30)`. The 13.5-frame beat requires alternating 13/14-frame intervals; cumulative rounding prevents drift.
2. **Body cadence:** default 2 beats/0.90s; use 1 beat/0.45s for action inserts and 4 beats/1.80s for scenic or emotional breaths. Reserve 0.5 beat/0.225s for 4–8-shot micro-bursts at fills/drop entries.
3. **Opening:** 2–3 human/action clips at 1.35–1.80s with source audio, then one 1.35–2.25s burst of 0.225s images, then a 2.7–3.6s hero hold for the principal title. This combines Samples 1/3/4 without copying Sample 3's exhausting 2.53s wall of microcuts.
4. **Chapter boundaries:** start each location on a 32-beat phrase boundary. Put a small two-line label over the first establishing shot for 1.35–1.80s; do not insert a separate slate. Fade/slide it by 8–12 px, not a large kinetic typography package.
5. **Transition budget:** hard cuts for at least 85–90% of boundaries. Permit one 3–5-frame directional blur/zoom or foreground wipe every 8–12 cuts, only when incoming/outgoing motion direction matches.
6. **Freeze/stutter budget:** at most one designed 0.4–0.7s freeze in the cold open and one 2–4-frame same-angle stutter later. Use stable human/action footage, never fast GoPro riding footage.
7. **Vertical clips in 16:9:** do not copy Sample 2's 62.5% black matte. Keep a vertical clip full height (405×720), pairing it with a second vertical clip or a restrained blurred/tinted duplicate in the side field. Avoid aggressive center crops because all source proxies are only 1280×720/720×1280.
8. **Zoom limits:** no routine digital zoom above about 1.10–1.15× at 720p. Use Sample 4-style 0.12s radial zoom only as a transition; do not emulate Sample 2's repeated nested scaling.
9. **Color:** normalize iPhone and GoPro per chapter first. Apply restrained warm highlights/cool shadows and subtle grain globally; keep one motivated monochrome insert at most. Do not force Sample 3's heavy teal/yellow grade across mixed daylight, night, pool, and neon scenes.
10. **Natural audio:** the references do not model it, but this footage does. Preserve the six selected audio moments: opening travel, one social/animal/food interaction, and the airport outro. Duck music roughly 6–9 dB for 0.9–1.8s with short crossfades; do not copy the references' uninterrupted music-only presentation.
11. **Ending:** decelerate from 0.90s cuts to 1.80–2.70s shots during the last phrase. Use the track's final slam at 144.1s to enter one full-frame scenic/human resolve and hold through the 147.7s hard end, optionally with one understated two-line credit.

## Techniques that conflict with this footage

- **Do not copy Sample 2's full collage grammar.** The target is 16:9 and 84% of raw footage is horizontal. Shrinking 720p images into nested panels sacrifices the landscape scale that is the strongest material.
- **Do not sustain Sample 3's 0.20–0.30s cadence.** The vlog contains long GoPro rides, landscapes, group interactions, animals, food, and nightlife that need readable motion. Use microcuts only in short fill/drop bursts.
- **Do not build the visual identity around drone shots.** The catalog contains only iPhone and GoPro footage. Sample 1's aerial grandeur can be translated into the strongest wide mountain/island shots, not imitated with fake parallax or extreme crops.
- **Do not depend on clean subject cutouts.** Much of the footage has helmets, crowds, foliage, water, motion blur, and low-light noise; Sample 1/2-style segmentation would produce unstable edges.
- **Do not use cinematic black bars.** The delivery and sources are native 16:9 720p. Bars reduce already limited vertical detail; Sample 2's matte is specifically a vertical-platform conceit.
- **Do not use aggressive speed ramps on GoPro travel clips.** Their forward motion is already strong; added ramps amplify shake and compression. The samples themselves show transition bursts, not clear sustained temporal ramps.
- **Do not globally mimic one reference LUT.** The footage crosses bright mountains, overcast Hoi An, tropical water, interiors, and Bangkok neon on two cameras. Normalize locally and unify gently.
- **Do not remove natural audio just because the references do.** The selected footage has six usable audio windows and more candid narrative value than these music-led excerpts.

## Evidence artifacts

- `measurements.json`: raw probe, scene, beat/onset, freeze, duplicate, color, and texture measurements.
- `sample*-contact-500ms.jpg`: full-excerpt contact sheets.
- `sample*-boundaries.jpg`: frames immediately before/after detected boundaries.
- `sample*-dense-*.jpg`: 10 fps filmstrips used to verify titles, layer changes, and transition timing.
- `analyze_samples.py` and `make_dense_sheets.py`: reproducible measurement scripts.
