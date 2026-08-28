# War of Attrition — Current Development Status

## 1. Project State: Core and Two Creative Sprints Complete

**War of Attrition** is a feature-complete digital implementation of the physical head-to-head card game. It is an Angular Progressive Web Application packaged for Android through a Trusted Web Activity and is currently version 4.2.0 (Android `versionCode` 40200).

The project is no longer in broad feature discovery. Both substantial creative sprints now have production implementations:

1. **Progressive Narrative Unveiling** — named commanders, four-chapter access and disclosure, mode-aware characterization, compact framing, lore fragments, source links, persistence/migration, and tests.
2. **Clash Visualizations / Battlefield Animations** — every decisive comparison summons readable opposing infantry while cards remain authoritative; the scoped portrait, rule-demo, layout, and callout closure work is complete.

The next planned engineering task is a separate final simplification, cleanup, dependency/bundle review, and release-AAB pass. Physical-device breadth and store review remain release validation. Rank-specific units and richer battlefield ideas remain deliberate later refinements.

Authoritative creative references:

- [`developer-docs/north-star.md`](../../developer-docs/north-star.md) — tone, physical-deck fidelity, and visual identity.
- [`developer-docs/narrative-canon.md`](../../developer-docs/narrative-canon.md) — private Mont-Rouge canon, commander dossiers, chapter disclosure, and narrative migration contract.
- [`developer-docs/narrative-disclosure-matrix.md`](../../developer-docs/narrative-disclosure-matrix.md) — authored twelve-War encounter order, Reveal Ledger, progressive dossier plan, transitions, callbacks, sources, and Sprint 1 handoff.
- [`developer-docs/commander-voice-bible.md`](../../developer-docs/commander-voice-bible.md) — canonical voices and curated implementation-ready dialogue bank.
- [`developer-docs/commander-portrait-assets.md`](../../developer-docs/commander-portrait-assets.md) — canonical supplied portrait sheet, reproducible extraction, typed asset registry, and expression/accessibility contract.
- [`developer-docs/opponent-commanders.md`](../../developer-docs/opponent-commanders.md) — permanent AI strategy assets and current dialogue architecture.
- [`developer-docs/alternate-rules-campaigns.md`](../../developer-docs/alternate-rules-campaigns.md) — implemented mode mechanics and planned chapter availability.
- [`developer-docs/future-gameplay-ideas.md`](../../developer-docs/future-gameplay-ideas.md) — completed sprint boundaries, later refinements, and backlog.

---

## 2. Completed Major Systems — Do Not Re-Propose

The following architectures are implemented, tested, and active. Future agents should extend their existing seams rather than proposing them as new systems.

### Core Game Engine and Rules

- Standard 52-card physical deck split by suit color: Red for the player and Black for the opponent, with independent legal shuffling.
- Truthful rank comparison with the sole special exception that **2 defeats Ace**.
- Complete ordinary clash, Challenge/reinforcement, settlement, recursive Battle, Boneyard, and deck-exhaustion lifecycle.
- Three face-down cards per side at each Battle layer, blind cross-selection, and strict hidden-card privacy.
- Attrition loss when a side cannot commit the required Battle cards.

The authoritative mechanical specification remains [`war-of-attrition-requirements.md`](./war-of-attrition-requirements.md) and must not be changed by narrative or animation work.

### Active Table and Presentation

- `TableGame` is the active table view, with responsive phone, tablet, and desktop layouts on fixed dark green felt.
- Physical cards remain visible game state. The table already presents stakes, Battle layers, deck counters, Boneyard movement, combat-strength badges, battlefield announcements, and sparse contextual reactions.
- `PresentationSequencerService` provides timed presentation phases, animation-speed multipliers, player Continue/skip behavior, timing collapse when animations are disabled, and `prefers-reduced-motion` handling.
- `BattleAnimationService` and `BattleAnimationComponent` visualize every decisive ordinary, reinforcement, and Battle comparison as two five-unit inline-SVG infantry formations. They charge horizontally, bonk at center, and give the losing formation the larger recoil/tumble before cleanup.
- The V1 scene replaces each comparison's existing result hold: Fast is floored at about 0.72 seconds for readability, Normal remains about 0.92 seconds, Slow remains about 1.2 seconds, Continue collapses the active beat, and no extra resolution state is introduced.
- The existing global **Auto-play Animations** preference is the only toggle. Disabling it suppresses scene creation; a retired `battleAnimationsEnabled` storage key is ignored safely, and `prefers-reduced-motion` receives a short static winner/loser cue with no animated travel.
- Routine deal/reveal/comparison/settlement status still updates the accessible current status but is not added to the prominent top-of-table message stack. Battles, reinforcements, milestones, and other exceptional events retain that channel.
- Authored reactions carry semantic priority: they remain visible for 7.5 seconds and cannot be replaced by procedural quips. Procedural messages are dropped rather than queued, so they cannot create a backlog ahead of narrative.
- `RuleDemoComponent` provides isolated, frame-based, replayable and skippable rules drills with reduced-motion support. Its Battle drill visibly stages exactly three committed face-down cards per side before revealing the selected champions.
- The active opponent has a compact decorative commander portrait. Explicit presentation metadata selects Calm, Smug, Determined, Angry, Sad, or Surprised for meaningful reactions; Calm is the default and returns after the reaction expires.

### Field Manual, Chronicle, and Hall of Valor

- `StoryBookDrawerComponent` supplies the Field Manual tab architecture: Chronicle, Hall of Valor, Rules of Engagement, and contextual Card Reference.
- `StoryBookService` builds the current War's in-memory tactical Chronicle from public domain events. It records ordinary comparison detail as well as Challenges, Battles, casualties, reactions, achievements, and resolution, allowing routine mechanical copy to leave the transient table channel without losing factual history. It is not presently a persistent narrative codex.
- Interactive rule demonstrations are implemented and never alter the active War.
- Boneyard casualty inspection and exact card reference are implemented outside active Fog of War sealing.
- **Hall of Valor is fully implemented**, profile-persistent, and integrated into the Field Manual. It records truthful physical-card service histories, honors, rivalries, Juggernaut Citations, and War survival with zero gameplay buffs. See [`developer-docs/hall-of-valor.md`](../../developer-docs/hall-of-valor.md).

### Campaigns and Alternate Rules

- Three-War Campaign progression, history, signed margins, token rewards, one-commander-per-Campaign assignment, and post-Campaign commander rotation are implemented. That commander scope is a known Sprint 1 mismatch with the authored per-War narrative schedule.
- The Campaign Orders modal is implemented and opens before War 1 when orders are unselected.
- Settings exposes separate confirmed **Restart War**, **Abandon War**, and **Abandon Campaign** actions. Campaign abandonment creates a fresh Campaign without completion rewards while preserving earned history, achievements, chapters, dossiers, cosmetics, tokens, and preferences.
- All four mechanical modes are implemented:
  - `standard`
  - `limited_reserves` — five human reinforcement reserves across the Three-War Campaign, including zero-reserve automatic concession.
  - `fog_of_war` — sealed Boneyard, redacted active Chronicle details, sealed Hall records, and telemetry redaction while fighting continues.
  - `total_war` — signed cumulative card differential determines the Campaign outcome.
- Chapter availability follows **Standard → Limited Reserves → Fog of War → Total War**, unlocked by completing each Three-War chapter rather than by victory. The backward-compatible migration and legacy grandfathering are active.

### Opponent Commanders and Reactions

- Five permanent, parameterized, fair-play strategies are implemented in `commander.model.ts` and evaluated by `OpponentAIService`:
  - `quartermaster`
  - `gambler`
  - `analyst`
  - `attritionist`
  - `cornered-general`
- The permanent strategies are mapped to Marcel de Brie, Sir Edmund Gloucester, Matthias von Greyerz, Bastien de Herve, and Lorenzo di Taleggio. `NarrativeResolverService` supplies sparse chapter/mode-aware authored dialogue with a bounded fallback hierarchy.
- The supplied commander art sheet is the canonical portrait set. Typed asset mapping links each existing commander ID to six expressions and one crest; Field Manual dossiers use Calm portraits and accessible crest-plus-name switchers.

### Progression, Personalization, and Telemetry

- Profile-scoped Campaign progress, bounded Campaign history, career statistics, and cosmetic entitlements are persisted and normalized.
- Card-backing cosmetics and token purchase/unlock flow are implemented.
- Thirty local tiered achievements are implemented. `Against the Odds`, `Crippled`, and `Neverending Stalemate` are intentionally local-only pending final Play Games reconciliation; the existing 27 Play mappings remain unchanged.
- Google Analytics 4 telemetry is consent-gated and denied by default until permission. Test and screenshot modes collect no analytics. Fog of War applies presentation and mapper-level information redaction while a War is active.

### Platform Packaging and Tooling

- Android TWA wrapper targeting the current project Android configuration.
- GitHub Pages deployment, Android bundle, secret scanning, and deterministic Playwright store-screenshot workflows.
- Store screenshot matrix for phone, 7-inch tablet, and 10-inch tablet targets with validation tooling.

---

## 3. Implemented Boundary and Intentional Later Refinements

| Area | Production reality | Boundary |
| --- | --- | --- |
| Commander mechanics & identities | Five named characters are active in table UI, dossiers, authored reactions, portraits, crests, telemetry, and tests. | Existing strategy IDs remain permanent; no sixth commander or emotion engine. |
| Commander schedule/history | Schema v2 authored per-War schedule, dynamic encounter resolution, replay randomization, and truthful three-opponent history are active. | First-play disclosure order remains canonical. |
| Dialogue & narrative | All four chapters, transitions, progressive dossiers, deduplication, and fallback routing are active. | The private disclosure firewall remains authoritative. |
| Campaign availability | Standard → Limited Reserves → Fog of War → Total War unlocks through chapter completion with migration and replay access. | No victory, achievement, token, or purchase gate. |
| Field Manual | Chronicle, Hall of Valor, truthful rule demos, dossier portraits/crest switcher, evidence records, and safe links are active. | It does not become a visual-novel or persistent quest engine. |
| Battlefield presentation | Card movement, Battle layers, sequencing, skip/speed/motion controls, and summoned-infantry scenes are active and presentation-only. | Rank/suit classes, magnitude scaling, recursive spectacle, bespoke Two-vs-Ace animation, skins, and sound remain later refinements. |

The private mouse/hay cause in [`narrative-canon.md`](../../developer-docs/narrative-canon.md) is writer knowledge. It must not simply appear as an early player-facing explanation.

---

## 4. Sprint 1 State — Narrative Architecture Complete (Passes A, B, and C)

Sprint 1 is fully complete, validated, and tested end-to-end:

- **Named Opponent Presentation**: Top seat dynamically renders active commander name, title, and faction across all five commanders (`Marcel de Brie`, `Sir Edmund Gloucester`, `Matthias von Greyerz`, `Bastien de Herve`, `Lorenzo di Taleggio`).
- **Opponent Header Dossier Deep-Linking**: Interactive button on opponent identity directly opens the Field Manual drawer to the active commander's progressive dossier.
- **Field Manual Commander Dossier Tab**: Dedicated `dossier` tab with commander switcher chips, header summary, 24 progressive records (Overview, Mont-Rouge Record, Known Associations, Campaign Notes, Archived Statement), evidence badges (`documented`, `attributed interpretation`, `prophetic metaphor`), and safe external source links.
- **Complete Authored Dialogue & Evergreen Corpus**: 227 authored dialogue records total:
  - 192 encounter-specific dialogue records (48 per chapter, 16 per encounter) with first-play vs. replay availability, trigger matching, and deduplication.
  - 35 evergreen dialogue records (7 per commander) covering clashes, battles, rescues, and results across both canonical and replay campaigns.
  - Robust 4-tier fallback: Encounter line → Evergreen line → Personality-tuned generic line → Silence.
- **Speech Bubble Visibility & Delivery Engine**:
  - Live opponent speech rendered in top rail with high-contrast military styling and guaranteed layering (`z-index: 10`).
  - Intro speech triggered on match start and after Orders modal closes; guaranteed Turn 1 context delivered when Turn 1 settles.
  - Procedural speech auto-dismisses after 5.5 seconds; authored reactions receive 7.5 seconds and remain protected from premature turn-draw wiping.
- **Post-Story Randomized Replay Scheduling**:
  - Canonical first playthrough remains 100% scripted across Chapters I–IV.
  - Completing all 4 chapters unlocks randomized replay scheduling: replaying any chapter generates a 3-War schedule of 3 distinct commanders chosen via Fisher-Yates from all 5 permanent commanders.
  - Replay schedule persists into active campaign state (`currentCampaign.commanderSchedule`) without rerolling on reload.
  - Campaign Orders modal indicates `"Replay Command: Opposition randomized"` for unlocked replay chapters.
- **Between-War & Completion Transitions**: `GameOverSummaryComponent` renders narrative transition cards (`TR-C1-01` through `TR-C4-04`), resolution quotes, and dynamic next-war action buttons.
- **Spoiler Firewall & Canonical Resolution**: Strict information boundaries across all four chapters; private Mont-Rouge mechanism (mouse/hay) safely protected in author knowledge; Chapter IV completes with the canonical resolution (`Matthias: “I never proved it.”` / `Marcel: “Non. Neither did I.”`) without an extraneous Bastien punchline.
- **Comprehensive Test Suite**: Full unit and integration suite green at **567 / 567 tests passing**, including narrative traversal/firewall coverage, authoritative achievement settlement/tie cases, portrait-expression lifecycle, Campaign abandonment preservation, rule-demo staging, viewport measurement, and table/message-hierarchy presentation tests.
- **Browser and Visual Validation**: Full Playwright matrix green at **18 passed** with 36 intentional cross-project skips; all 11 store screenshots validate at their required phone, 7-inch tablet, and 10-inch tablet resolutions.
- **Zero Build Budget Increase**: Production build passes cleanly with 0 errors and zero budget increases in `angular.json`.

Next steps for future work:
- Final release polish and device validation; richer battlefield variants remain optional later work.


---

## 5. Sprint 2 — Closed and Implemented

The production presentation layer and its scoped closure/polish pass are implemented.

> **The cards do not merely represent the battle. They summon the battle.**

The physical cards continue to show and determine state. After any ordinary, reinforcement, or Battle comparison has an authoritative winner:

- Five player infantry enter from the left and five opponent infantry enter from the right.
- The formations meet at a small central star/bonk cue.
- The winner recoils slightly and holds; the loser is displaced much farther and several units tumble or fall.
- The overlay is layout-neutral, pointer-transparent, and removed before casualty presentation continues.
- `BattleAnimationService` owns ephemeral scene state; `GameControllerService` requests it only after `TurnResolutionService` has decided the result; `BattleAnimationComponent` owns SVG/CSS rendering.

Implemented runtime guardrails:

- Inline SVG and CSS only; no asset files or animation dependency.
- Fast is about 0.72 seconds, Normal about 0.92 seconds, and Slow about 1.2 seconds. The feature-specific Fast floor does not change other application animation timing.
- Continue completes the current beat immediately; cancellation, restart, and error paths clear the scene.
- The existing global **Auto-play Animations** setting controls scene creation; there is no feature-specific toggle.
- Reduced motion replaces travel with a roughly 0.28-second static winner/loser cue.
- Verified without horizontal overflow at 360×740, 540×960, and 1280×800 CSS viewports.

Routine comparison results are now retained in the Chronicle and accessible status without entering the prominent transient message stack. Exceptional game events still use the stack. Authored persona/story reactions are held longer and cannot be displaced by procedural quips; no routine-message queue is maintained.

Closure work adds the canonical commander portraits/crests and explicit reaction expressions, truthful three-card Battle drill staging, first-render `visualViewport` measurement with lifecycle remeasurement, rail-height-aware deck sizing, compact Challenge callout/action lanes, a verified Material-icon set, Campaign abandonment, and the `Crippled` / `Neverending Stalemate` achievements. Automated browser geometry is covered at 360×740, 540×960, and 1280×800.

The every-comparison trigger is intentionally an experiment. Its policy remains in `GameControllerService`, separate from the reusable ephemeral animation state and renderer, so later playtesting can narrow the frequency without rebuilding the presentation.

Intentionally deferred: rank-specific classes, suit-specific armies, magnitude scaling, recursive spectacle escalation, the special Two-vs-Ace assassination treatment, skins, sound, and a general animation framework.

---

## 6. Separate Final Cleanup / Release Pass

The creative sprint scopes are closed. The next pass may address:

1. Google Play closed-testing feedback, crash review, and store compliance.
2. Physical-device validation across compact phones, foldables, and tablets.
3. Broad code simplification, dead-code/dependency review, asset/bundle optimization, and final release-AAB preparation.
4. Remaining physical-device-specific compatibility observations not reproducible in automated Chromium checks.
5. Store screenshots, feature graphics, listing copy, and final accessibility smoke checks.
6. Monetization remains deferred (`ADS_ENABLED=false`) and cannot gate narrative.

---

## 7. Durable Architectural Guardrails

- Preserve the fixed dark-green felt table, gold accents, and dignified military interaction language.
- Preserve physical 52-card fidelity and deterministic game correctness.
- AI never inspects hidden deck order, face-down Battle cards, or concealed player information.
- Cosmetics, story, dialogue, portraits, and battlefield spectacle are presentation only.
- Do not reintroduce theme switching, collectible card stats, deck building, fantasy card abilities, or pay-to-win progression.
- Preserve accessibility, mobile readability, and current telemetry/privacy guarantees.
