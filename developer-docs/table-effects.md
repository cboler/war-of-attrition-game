# Table Effects (WebGL presentation layer)

Release 4.3.0 adds a three.js presentation layer to the card table. It is **decoration only**: it
never reads hidden state, never feeds back into play, and can vanish at any moment without changing
a single rule or outcome.

## Architecture

| Piece | File | Role |
| --- | --- | --- |
| Engine | [`src/app/shared/fx/table-fx-engine.ts`](../src/app/shared/fx/table-fx-engine.ts) | The only module that imports `three`. Owns both WebGL renderers, shaders, particle pools, confetti, rings and trails. Lazy-loaded (~116 kB gzip) so it never touches the initial bundle. |
| Service | [`src/app/shared/fx/table-fx.service.ts`](../src/app/shared/fx/table-fx.service.ts) | Decides whether effects run, loads the engine on demand, tracks the `full`/`static` motion mode, and handles context loss. |
| Backdrop | [`src/app/shared/fx/table-backdrop.component.ts`](../src/app/shared/fx/table-backdrop.component.ts) | Canvas projected into `app-card-table`'s `[table-backdrop]` slot. Renders the shader-lit baize and ambient embers under the cards. The CSS felt stays underneath as the fallback. |
| Director | [`src/app/shared/fx/table-fx-overlay.component.ts`](../src/app/shared/fx/table-fx-overlay.component.ts) | Pointer-transparent canvas over the table. Watches public presentation signals, measures the DOM they produced, and asks the engine for effects. |

### Two canvases

- **Backdrop** (inside the card table, `z-index: -1`): a full-screen fragment shader for woven felt,
  an oil-lamp light pool with flicker, impact blooms, battle heat on the rails, and a victory/defeat
  colour grade. A GPU-only ember field rises with Battle depth.
- **Overlay** (over the table, `z-index: 30`, below drawers, dialogs and the tutorial): GPU particles
  integrated analytically in the vertex shader (sparks with streak trails, glows, dust, ash),
  pooled shockwave rings, CPU Bézier ember trails, and instanced paper confetti.

The overlay loop runs only while something is alive, then stops. The backdrop loop is capped at
60 fps (30 fps on the `low` tier) and pauses while the tab is hidden.

## What triggers what

| Presentation signal | Effect |
| --- | --- |
| `DRAWING` | Dust puffs where the dealt cards land |
| `CLASH_RESOLUTION` / `CHALLENGE_CLASH` | Spark burst at the midpoint of the active cards. Sparks drive toward the beaten side in the victor's army colour. Ties spark silver. A 2-beats-Ace override adds a violet starburst. |
| `battleLayers().length` increases | Drum slam: rings, dust wave, screen shake and rising table heat. Depth 3+ erupts embers. |
| `BATTLE_REVEAL` / `BATTLE_TIE` | Impact between the two selected cards; a tie clashes both army colours |
| `CASUALTY_REVEAL` | Red flare on Ace/2 casualties and a gilt glow on court cards |
| `RETURN_WINNER_CARDS` | Gilt trails home to the winner's deck |
| `SEND_LOSER_CARDS_TO_BONEYARD` | Ember trails into the Boneyard |
| `battleAnimation()` skirmish scene | Dust at the charge, impact starburst at 43% of the CSS duration, dust where the losers fall |
| `deckDefeatPopOwner()` | Burst on the depleted deck |
| `GAME_OVER` | Victory: confetti volleys and fireworks with a gilt grade. Defeat: falling ash and a cold desaturated table. Tie: silver starburst. |
| `achievements.latestUnlock()` | Starburst and confetti at the toast icon |

Timings read the table's CSS custom properties (`--clash-duration`, `--boneyard-duration`, and so
on), so effects follow the player's animation-speed setting automatically.

## When effects are off

- **Animations setting off, or `prefers-reduced-motion`:** the table renders a single still frame
  with no particles.
- **No WebGL, context lost, Karma, `navigator.webdriver` (Playwright store screenshots),
  `?scene=` screenshot fixtures, or `?fx=off`:** nothing loads, and the existing CSS table is shown
  unchanged.

## Performance tiers

`low` applies to coarse-pointer devices with ≤4 cores or ≤4 GB memory, or any device with both. It
halves particle budgets, caps DPR at 1–1.25, and runs the backdrop at 30 fps. Everything else is
`high`.

## Tuning in development

In `ng serve` builds the director exposes the engine as `window.__attritionFx`:

```js
__attritionFx.setTimeScale(0.2);          // slow motion
__attritionFx.setTension(1);              // preview a depth-3 Battle table
__attritionFx.starburst({ x: 300, y: 200 }, '#ffd27a');
```

`table-fx-engine.spec.ts` compiles every shader in headless Chrome and fails on any `THREE` program
error.
