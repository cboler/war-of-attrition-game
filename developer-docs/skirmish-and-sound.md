# Skirmish Choreography and Table Sound

Release 4.4.0 replaces the block-move infantry skirmish with per-soldier choreography and replaces
the oscillator beeps with a synthesised sound layer. Both are **presentation only**: they read the
public result of a comparison that is already decided, and nothing they do feeds back into play.

No third-party library and no audio file is involved. Soldiers move with the browser's Web
Animations API, and every sound is generated at run time with the Web Audio API.

## One plan, three readers

| Piece | File | Role |
| --- | --- | --- |
| Plan | [`src/app/services/skirmish-plan.ts`](../src/app/services/skirmish-plan.ts) | Pure, seeded choreography. Builds every soldier's motion track and the timed cues (clash, launches, landings). |
| Scene | [`src/app/services/battle-animation.service.ts`](../src/app/services/battle-animation.service.ts) | Chooses the variant and duration for the current animation speed and publishes the scene signal. |
| Soldiers | [`src/app/shared/components/battle-animation/`](../src/app/shared/components/battle-animation/) | Renders one SVG soldier per unit and plays each track as a single compositor animation. |
| Particles | [`src/app/shared/fx/table-fx-overlay.component.ts`](../src/app/shared/fx/table-fx-overlay.component.ts) | Fires sparks, dust and rings on the plan's cues. |
| Sound | [`src/app/core/audio/table-audio-engine.ts`](../src/app/core/audio/table-audio-engine.ts) | Schedules the skirmish soundtrack from the same cues. |

Because the soldiers, the particles and the sound all read the same cue list, a thud and a spark
land on the frame the soldier is hit. Nothing estimates timing from a CSS duration any more.

### Plan space and time

- Distance is measured in soldier widths (`u`). `x = 0` is the middle of the field, `y = 0` is the
  ground and a jump is negative. `skirmishUnitPx()` converts to pixels (18 to 40 px per `u`).
- Time is a 0 to 1 fraction of the scene. A standard scene lasts 1830 / 1400 / 1050 ms at
  Slow / Normal / Fast.
- The player's army always enters from the left. Army colour follows the deck assignment.

### Standard clash

Two ranks per army (7 soldiers, 9 inside a Battle) charge, meet at 36% of the scene, and resolve:

| Input | Effect |
| --- | --- |
| Rank gap (`margin`) | Wider gaps launch more of the losing line. A one-rank win launches two; a gap of nine or more launches all but one. |
| Narrow win (`margin < 0.2`) | The winner's front soldier falls too, and the rest of the losing line withdraws in order instead of fleeing. |
| Battle depth | Larger armies, one more launch, and the survivors fall rather than run. |

Fates are `launch` (a spinning ballistic arc back toward the soldier's own side), `fall`, `retreat`,
`flee` and, for winners, `press` followed by a cheer.

### Giant killer (a Two beats an Ace)

A longer scene (1.6x) with its own cast. The Ace's side sends a crowned giant with an `A` on the
shield and four escorts; the Two's side sends one small hero. Three stomps, a wind-up, a leap and
one strike to the helmet, a held beat, then the giant topples backward onto his escort. Three are
launched and the one at the back runs before he lands. The scene mirrors when the opponent holds
the Two.

The controller selects it from the two cards that were actually compared, so it also plays when a
reinforcement Two beats an Ace, and for a conceded Ace.

### Reduced motion and skipping

- With `prefers-reduced-motion` the component poses a single still frame taken from
  `plan.stillAt` and plays no animation or skirmish sound.
- Continue/skip removes the scene. Scheduled particle cues check the scene id before firing, and the
  controller calls the function returned by `SoundService.playSkirmish()` to cut any sound that has
  not started.

## Sound

`TableAudioEngine` takes any `BaseAudioContext`, so the same voices play live and render through an
`OfflineAudioContext` in the unit tests. `SoundService` loads the synthesis code on demand when the
table opens (about 6 kB gzipped), so it stays out of the initial bundle; a cue requested before it
arrives is skipped rather than played late.

| Voice | How it is made |
| --- | --- |
| Card draw, flip, land, Boneyard | Filtered noise: a band that slides upward for friction, a short bright burst for the snap, a soft low pat for felt. Nearly dry. |
| Steel | Six inharmonic sine partials that decay at different rates, plus a brief noise transient. Pitch and ring vary per strike. |
| Shield thud, body thump, boom | A pitch-dropping tone under low noise. The tone is soft-clipped so its harmonics still read on a phone speaker. |
| Shouts and crowd | A buzzy source and noise through three vowel formant filters. |
| War drum, horn, chime | Drum: driven sine with a skin slap. Horn: detuned saws under an opening lowpass with a scoop and late vibrato. Chime: four bell partials. |
| Reverb | A convolver fed a generated impulse (decaying noise), one per bus. |

The mix has two buses (`sfx`, `ambience`) into a fast limiter, so a busy clash cannot clip.

### Cues

| `SoundService` method | Sound |
| --- | --- |
| `playCardDraw` / `playCardFlip` / `playCardLand` / `playBoneyard` | Card foley |
| `playClash` | Blades and shields meeting |
| `playBattleCall(depth)` | Drum and horn call to a Battle; each layer adds a horn and a harder drum figure |
| `playPositiveResolution` / `playNegativeResolution` | Two rising bells / a dull knock and a sagging tone |
| `playBattleVictory` / `playBattleDefeat` | Rising / falling horn figure with drums |
| `playVictory` / `playDefeat` | Fanfare with a cheering camp / three slow horn steps down over wind |
| `playSkirmish(cues, durationMs)` | The whole skirmish, scheduled from the plan's cues and panned by position |

### Ambience

[`TableAmbience`](../src/app/core/audio/table-ambience.ts) plays while the table is on screen.

- **At rest:** a quiet tent. Room air, slow wind, and the lamp ticking.
- **In a Battle:** each layer raises `tension` (the same curve the table's visual heat uses). A crowd
  roar and low rumble come up, distant steel, thuds and shouts are scattered at random at a rate
  that rises with tension, and a war drum plays a figure that tightens with depth
  (one stroke per bar at depth 1, four at depth 4 or deeper).

Events are committed half a second ahead of the audio clock, so density follows a change in depth
within a beat. Measured through the offline renderer, the bed is about 6 dB louder at depth 1 than
at rest and about 13 dB louder at depth 4.

### When sound plays

- Browsers only start audio from a tap or key press. Ambience waits for the first one.
- A hidden tab or backgrounded app suspends the audio context, ambience included.
- Settings and the Profile dialog have a master Sound toggle and separate Effects and Ambience
  volumes (`soundVolume`, `ambienceVolume`, 0 to 100). Ambience at 0 turns the bed off.

## Tuning in development

`ng serve` builds expose `window.__attritionSound`:

```js
const { service, load } = __attritionSound;
service.playBattleCall(3);                       // audition a cue
service.setBattleDepth(3);                       // preview the ambience of a deep Battle
const { renderTableAudio } = await load();
const buffer = await renderTableAudio(1, (engine, when) => engine.steel(when));   // offline AudioBuffer
```

The levels and spectra in this release were set from offline renders and spectrograms rather than
by ear. Each voice's character lives in a few numbers near the top of its method in
`table-audio-engine.ts` (partial tables, filter frequencies, the level passed to `port()`), which is
where to adjust anything that sounds wrong on real speakers.

`skirmish-plan.spec.ts`, `battle-animation.component.spec.ts` and `table-audio-engine.spec.ts` cover
the choreography, the rendered animation and the rendered audio.
