# War of Attrition — Completed Sprints and Later Backlog

This document records the boundaries of the two implemented creative sprints and separates their deliberately deferred ideas from final release polish and longer-term work.

Authoritative companions:

- [`north-star.md`](./north-star.md) — tone, physical-deck fidelity, and visual grammar.
- [`narrative-canon.md`](./narrative-canon.md) — private history, dossiers, chapters, and disclosure rules.
- [`narrative-disclosure-matrix.md`](./narrative-disclosure-matrix.md) — Reveal Ledger, authored twelve-War routing, transitions, progressive dossiers, prophecies, callbacks, sources, and Sprint 1 seams.
- [`commander-voice-bible.md`](./commander-voice-bible.md) — final voice rules and curated implementation-ready dialogue bank.
- [`opponent-commanders.md`](./opponent-commanders.md) — implemented strategy layer and current dialogue seams.
- [`alternate-rules-campaigns.md`](./alternate-rules-campaigns.md) — implemented mode mechanics and planned availability.
- [`.github/instructions/current-development-status.md`](../.github/instructions/current-development-status.md) — authoritative implementation status.

## 1. Implemented Foundations — Not Backlog Proposals

The following graduated systems are in production code and should not be re-proposed:

- Five fair-play commander strategy IDs in `commander.model.ts`, legal public-information decisions in `OpponentAIService`, current one-commander-per-Campaign assignment/rotation, sparse reactions, and commander telemetry.
- Hall of Valor card service records, Roll of Honor/detail views, Juggernaut Citations, rivalries, profile persistence, and Field Manual integration.
- All four Campaign modes: Standard, Limited Reserves, Fog of War, and Total War.
- Campaign Orders before War 1, Three-War history/scoring, tokens, cosmetic card-backing unlocks, and profile presentation.
- Field Manual tabs for Chronicle, Hall of Valor, Rules of Engagement, and Card Reference.
- Frame-based interactive rule demos and an active-table presentation sequencer with animation speed, Continue/skip, disabled-animation timing collapse, and reduced-motion handling.

The implemented creative layers extend these foundations without redesigning mechanics.

## 2. Sprint 1 — Progressive Narrative Unveiling (Implemented)

This production scope is implemented.

### Implemented Scope

- Map the canonical cast onto the permanent strategy IDs:
  - Marcel de Brie → `quartermaster`
  - Sir Edmund Gloucester → `gambler`
  - Matthias von Greyerz → `analyst`
  - Bastien de Herve → `attritionist`
  - Lorenzo di Taleggio → `cornered-general`
- Translate the private dossiers into concise player-facing names, titles, biographies, relationships, omissions, and distinct voices.
- Implement the authored first-play War schedule: Marcel/Matthias/Bastien; Edmund/Lorenzo/Marcel; Matthias/Marcel/Bastien; Edmund/Lorenzo/Matthias.
- Move commander identity and attribution to the War encounter, preserving the actual opponent in each War record and completed Campaign history.
- Implement chapter availability in the order **Standard → Limited Reserves → Fog of War → Total War**.
- Unlock the next chapter after a complete Three-War Campaign regardless of victory, defeat, or draw; retain every unlocked chapter for replay.
- Add a versioned, backward-compatible progression migration that preserves active Campaigns and sensibly grandfathers legacy profiles that previously had all-mode access.
- Add short pre-Campaign/pre-War framing, mode-aware table reactions, War/Campaign resolution reactions, and lore fragments.
- Add progressive Field Manual commander dossiers and make the top-table opponent identity block a keyboard/touch-accessible deep link to the current dossier.
- Use the existing Campaign Orders, Field Manual, Chronicle, Hall of Valor, achievements, card-back/item descriptions, and appropriate loading/interstitial surfaces.
- Add optional, unobtrusive historical/scientific links following the source plan in [`narrative-canon.md`](./narrative-canon.md).
- Persist only chapter unlock/completion state and any genuinely necessary major narrative flags.
- Add focused tests for migration, unlock-on-completion, replay access, mode-aware line selection, disclosure boundaries, and accessibility.

### Architectural Boundary

The implementation uses small conditioned narrative data and `NarrativeResolverService`; it does not create a general branching dialogue engine.

The canonical schedule remains fixed for the first playthrough. After all four chapters are complete, randomized replay schedules use three distinct commanders without weakening ordered first-play disclosure.

The current Chronicle is an in-memory truthful tactical War feed. Narrative fragments may complement it, but Fog of War redaction, card identities, combat attribution, and Hall of Valor statistics must remain mechanically truthful.

### Explicit Exclusions

- No new strategy archetype or sixth Tyromancer.
- No visual novel, quest graph, relationship meter, collectible commander stats, or RPG combat system.
- No magical gameplay abilities or narrative-based access to hidden cards.
- No victory, token, achievement, purchase, advertising, or monetization gate on chapter access.
- No direct early-game statement of the private mouse/hay cause.
- No battlefield-unit animation was added during Sprint 1; the scoped V1 belongs to and is implemented in Sprint 2.

## 3. Sprint 2 Initial Pass — Clash Visualizations / Battlefield Animations

The production V1 is implemented. It establishes the visual joke and integration seam without attempting the complete rank-to-unit vision.

> **The cards do not merely represent the battle. They summon the battle.**

### Authoritative Presentation Contract

- The physical cards remain visible, readable, and authoritative state.
- The digital layer briefly imagines the resolved cards as small opposing military forces.
- Visuals never determine an outcome, change timing-sensitive game state, or conceal which cards actually fought.

### Implemented V1

- Every decisive Battle may summon five red player infantry from the left and five steel opponent infantry from the right.
- The formations charge, meet at a restrained star/bonk, recoil, and resolve asymmetrically; several losing units tumble while the winning line holds.
- `BattleAnimationService` contains short-lived result/orientation state, and `BattleAnimationComponent` renders reusable inline SVG with CSS transforms/keyframes.
- The scene occupies the existing Battle result wait in `GameControllerService`; normal duration is about 0.92 seconds and Continue skips the active beat.
- **Battle Animations** is a persisted, default-on Settings toggle. Global animation disabling suppresses scene creation.
- `prefers-reduced-motion` produces a short static winner/loser cue instead of horizontal travel.
- The absolute overlay is pointer-transparent, clipped to the table center, and does not participate in layout.

### Deferred Rank-to-Unit Mapping

| Card rank | Battlefield presentation |
| --- | --- |
| Number cards | Ordinary soldiers or infantry, with scale/formation influenced by rank |
| Jack | Cavalry or knight |
| Queen | Mage or equivalent elite specialist |
| King | Regal swordsman or champion |
| Ace | Commander or general |
| Two | Humble soldiers/scouts that remain visually capable of the signature Ace-defeating infiltration |

Against ordinary 3-through-King opposition, the Two can read as a small, vulnerable formation. Against an Ace, it must visibly communicate its special lethal role rather than appearing to win through unexplained power scaling.

This mapping, suit-specific forces, battle-magnitude scaling, and recursive spectacle escalation are intentionally not part of V1.

### Desired Visual Grammar

- Economical late-16-bit/early-32-bit tactical-JRPG staging.
- Original, clean sprite or SVG silhouettes readable on phones.
- Small forces charge from opposite sides; collision, recoil, defeat, retreat, or casualties resolve quickly.
- Recursive Battles may increase scale or intensity while preserving the exact staked layers.
- Prefer reusable SVG/CSS/keyframes or similarly economical techniques where practical.
- Do not copy sprites, characters, effects, animations, or UI from *Suikoden*, *Final Fantasy*, or other inspirations.

### Speed, Accessibility, and Runtime Guardrails

- A routine clash should resolve in roughly one to two seconds at normal speed and must not make rapid play feel trapped.
- Continue/skip behavior should allow experienced players to finish the current visual beat immediately.
- Respect animation-speed settings, disabled animations, and `prefers-reduced-motion` with a clear static outcome.
- Keep cards and core actions readable throughout; never recreate input freezes or delayed action availability.
- Avoid large asset, style, or runtime budgets.

### Integration Seams Used

- `PresentationSequencerService` sequences the scene, multiplies timing by user speed, collapses reduced motion, and permits Continue.
- `TableGame` hosts the overlay without changing its stakes or responsive layout.
- Existing CSS handles dealing, card collisions, Battle layers, casualty reveals, return, Boneyard movement, and motion-disabled behavior.
- `RuleDemoComponent` demonstrates an economical frame-data model with Replay, Skip to result, sound cues, and reduced-motion collapse.
- `CardTableComponent` provides the responsive table/rail/center layout into which a presentation layer may fit.

The runtime scene is not coupled to the rules-demo implementation. Deterministic game resolution remains in the existing engine.

## 4. Final-Pass Release and UX Concerns

These should be addressed after or alongside tightly scoped validation, without expanding Narrative Sprint 1 or demoting Sprint 2 into a generic bucket.

### Responsive Initial Layout / Redraw

On mobile PWA/TWA launches, the player deck or seat information can initially appear partially below the visible viewport and correct after a later redraw. Treat this as a release-polish investigation involving physical devices, visual viewport stabilization, dynamic viewport units, safe-area insets, and measurement timing. Do not declare a root cause without evidence.

### Material Icons

The Rules of Engagement Battle entry and early achievements reference icon names such as `swords` and `playing_cards` that are not reliably supplied by the configured Material Icons font. Audit and replace only with verified identifiers or an intentional local SVG.

### Combat-Math and Callout Composition

Power badges, combat math, and announcements can compete spatially. Treat this as composition and timing work, not a `z-index` escalation contest. Sprint 2 may reduce the need for simultaneous explanatory overlays, but it must not remove accessible outcome text.

### Campaign Abandonment

There is no prominent dedicated flow to abandon/reset an active Three-War Campaign. A future deliberate affordance should confirm the action and preserve career history, achievements, unlocked chapters, and cosmetics. This is not a prerequisite for documenting or implementing the chapter order.

## 5. Longer-Term Candidates — Beyond the Final Two Sprints

- **No Retreat:** A deliberately evaluated Campaign variant in which abandonment has Campaign consequences.
- **Escalation:** A possible variant where repeated reinforcement or deep Battle changes later Campaign pressure while preserving physical-deck rules.
- **Hall of Valor casualty granularity:** Split one-on-one clash casualties from mass Battle casualties using existing settlement source attribution.
- **Alternate army themes:** Purely visual suit-army reskins after the default clash language proves readable and maintainable.
- **Head-to-head multiplayer:** Long-term only, with strict cosmetic-only progression and fair-play integrity.
- **Licensed partnerships:** Distant and permitted only with explicit rights; no unauthorized trademarks or trade dress.
