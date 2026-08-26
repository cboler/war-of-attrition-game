# War of Attrition — Current Development Status

## 1. Project State: Core Complete, Two Creative Sprints Remaining

**War of Attrition** is a feature-complete digital implementation of the physical head-to-head card game. It is an Angular Progressive Web Application packaged for Android through a Trusted Web Activity and is currently version 4.2.0 (Android `versionCode` 40200).

The project is no longer in broad feature discovery. Barring a newly discovered release-blocking defect, two substantial creative implementation sprints remain before final release-polish work:

1. **Progressive Narrative Unveiling** — named commanders, four-chapter access and disclosure, mode-aware characterization, compact framing, lore fragments, source links, persistence/migration, and tests.
2. **Clash Visualizations / Battlefield Animations** — the first-class visual system through which cards briefly summon readable battlefield units while cards remain authoritative.

After those sprints, the remaining work returns to release validation, responsive/redraw fixes, accessibility, pacing, device compatibility, and store presentation. Do not use known layout gremlins as a reason to expand either creative sprint.

Authoritative creative references:

- [`developer-docs/north-star.md`](../../developer-docs/north-star.md) — tone, physical-deck fidelity, and visual identity.
- [`developer-docs/narrative-canon.md`](../../developer-docs/narrative-canon.md) — private Mont-Rouge canon, commander dossiers, chapter disclosure, and narrative migration contract.
- [`developer-docs/narrative-disclosure-matrix.md`](../../developer-docs/narrative-disclosure-matrix.md) — authored twelve-War encounter order, Reveal Ledger, progressive dossier plan, transitions, callbacks, sources, and Sprint 1 handoff.
- [`developer-docs/commander-voice-bible.md`](../../developer-docs/commander-voice-bible.md) — canonical voices and curated implementation-ready dialogue bank.
- [`developer-docs/opponent-commanders.md`](../../developer-docs/opponent-commanders.md) — permanent AI strategy assets and current dialogue architecture.
- [`developer-docs/alternate-rules-campaigns.md`](../../developer-docs/alternate-rules-campaigns.md) — implemented mode mechanics and planned chapter availability.
- [`developer-docs/future-gameplay-ideas.md`](../../developer-docs/future-gameplay-ideas.md) — the remaining two-sprint boundary and later backlog.

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
- Existing CSS/card animations cover dealing, clash movement, reinforcement, casualty reveals, Battle-layer staging, return, and Boneyard movement. They are not yet the planned rank-to-unit battlefield visualization system.
- `RuleDemoComponent` provides isolated, frame-based, replayable and skippable rules drills with reduced-motion support. It is a useful economy/readability reference for Sprint 2, not a requirement to turn the runtime table into a rule demo.

### Field Manual, Chronicle, and Hall of Valor

- `StoryBookDrawerComponent` supplies the Field Manual tab architecture: Chronicle, Hall of Valor, Rules of Engagement, and contextual Card Reference.
- `StoryBookService` builds the current War's in-memory tactical Chronicle from public domain events. It records curated clashes, Challenges, Battles, casualties, reactions, achievements, and resolution. It is not presently a persistent narrative codex.
- Interactive rule demonstrations are implemented and never alter the active War.
- Boneyard casualty inspection and exact card reference are implemented outside active Fog of War sealing.
- **Hall of Valor is fully implemented**, profile-persistent, and integrated into the Field Manual. It records truthful physical-card service histories, honors, rivalries, Juggernaut Citations, and War survival with zero gameplay buffs. See [`developer-docs/hall-of-valor.md`](../../developer-docs/hall-of-valor.md).

### Campaigns and Alternate Rules

- Three-War Campaign progression, history, signed margins, token rewards, one-commander-per-Campaign assignment, and post-Campaign commander rotation are implemented. That commander scope is a known Sprint 1 mismatch with the authored per-War narrative schedule.
- The Campaign Orders modal is implemented and opens before War 1 when orders are unselected.
- All four mechanical modes are implemented:
  - `standard`
  - `limited_reserves` — five human reinforcement reserves across the Three-War Campaign, including zero-reserve automatic concession.
  - `fog_of_war` — sealed Boneyard, redacted active Chronicle details, sealed Hall records, and telemetry redaction while fighting continues.
  - `total_war` — signed cumulative card differential determines the Campaign outcome.
- Current code displays all four Campaign Orders to every profile and permits any selection before War 1. Progressive narrative chapter locks do **not** exist yet; that is Sprint 1 work.
- The intended future chapter order is **Standard → Limited Reserves → Fog of War → Total War**, unlocked by chapter completion rather than victory. Existing profiles require a backward-compatible migration and sensible grandfathering.

### Opponent Commanders and Reactions

- Five permanent, parameterized, fair-play strategies are implemented in `commander.model.ts` and evaluated by `OpponentAIService`:
  - `quartermaster`
  - `gambler`
  - `analyst`
  - `attritionist`
  - `cornered-general`
- The current registry still exposes generic creative labels and event-specific dialogue pools. `TableReactionService` selects sparse lines for special/narrow clashes, successful and failed reinforcements, concessions, desperation, and notable Battle losses.
- Dialogue is currently conditioned on commander and gameplay event only. It has no campaign-mode, chapter-progress, or narrative-flag condition layer.
- Sprint 1 will map the existing strategies to Marcel de Brie, Sir Edmund Gloucester, Matthias von Greyerz, Bastien de Herve, and Lorenzo di Taleggio. It must not add commanders, change strategy fairness, or provide hidden information.

### Progression, Personalization, and Telemetry

- Profile-scoped Campaign progress, bounded Campaign history, career statistics, and cosmetic entitlements are persisted and normalized.
- Card-backing cosmetics and token purchase/unlock flow are implemented.
- Twenty-eight local tiered achievements are implemented, with the 2-defeats-Ace Battle achievement intentionally local-only pending final Play Games reconciliation.
- Google Analytics 4 telemetry is consent-gated and denied by default until permission. Test and screenshot modes collect no analytics. Fog of War applies presentation and mapper-level information redaction while a War is active.

### Platform Packaging and Tooling

- Android TWA wrapper targeting the current project Android configuration.
- GitHub Pages deployment, Android bundle, secret scanning, and deterministic Playwright store-screenshot workflows.
- Store screenshot matrix for phone, 7-inch tablet, and 10-inch tablet targets with validation tooling.

---

## 3. Current Implementation Boundary vs. Settled Design

The documentation pass establishes creative decisions; it does not imply they are already in production code.

| Area | Implemented now | Settled next state |
| --- | --- | --- |
| Commander mechanics & identities | Five named characters (Marcel, Edmund, Matthias, Bastien, Lorenzo) active in table UI, headers, and presentation | Same IDs and strategies, active in runtime and tests |
| Commander schedule/history | Schema v2 authored per-War schedule, dynamic current encounter resolution, truthful 3-opponent Campaign history | Fully active in progression model, services, telemetry, and Hall of Valor |
| Dialogue & narrative foundation | Chapter-I authored dialogue bank, transitions, progressive dossiers, deduplication, and `NarrativeResolverService` | Fully active in table reactions, game controller, dialogs, and summary |
| Campaign chapter availability | Schema v2 chapter progression: Standard → Limited Reserves → Fog of War → Total War, canonical order and lock cues in Orders modal | Completed for Chapter I; Chapters II–IV data and presentation ready for subsequent passes |
| Narrative persistence & migration | Schema v2 persistence with full v1 migration, legacy grandfathering, and reload determinism | Unlocked dossiers and story progress persisted cleanly |
| Field Manual / Dossiers | Field Manual dossier tab, commander switcher chips, progressive records, evidence badges, safe external source links, table-header deep link | Fully active in runtime with keyboard navigation and ARIA support |
| Table animation | Card movement, Battle layers, sequencing, skip/speed/motion controls | Sprint 2 rank-to-unit clash visualization while cards remain visible and authoritative |

The private mouse/hay cause in [`narrative-canon.md`](../../developer-docs/narrative-canon.md) is writer knowledge. It must not simply appear as an early player-facing explanation.

---

## 4. Sprint 1 State — Four-Chapter Narrative Architecture Complete

Sprint 1 (Pass A & Pass B) is complete, tested, and verified end-to-end across all four chapters and twelve canonical encounters:

- **Named Opponent Presentation**: Top seat dynamically renders active commander name, title, and faction across all five commanders (`Marcel de Brie`, `Sir Edmund Gloucester`, `Matthias von Greyerz`, `Bastien de Herve`, `Lorenzo di Taleggio`).
- **Opponent Header Dossier Deep-Linking**: Interactive button on opponent identity directly opens the Field Manual drawer to the active commander's progressive dossier.
- **Field Manual Commander Dossier Tab**: Dedicated `dossier` tab with commander switcher chips, header summary, progressive records (Overview, Mont-Rouge Record, Known Associations, Campaign Notes, Archived Statement), evidence badges (`documented`, `attributed interpretation`, `prophetic metaphor`), and safe external source links.
- **Complete Authored Dialogue Bank**: 192 authored dialogue records (48 per chapter, 16 per encounter) with first-play vs. Replay availability, trigger matching, in-memory deduplication, and evergreen fallback pools.
- **Campaign Orders Framing & Chapter Availability**: Canonical chapter order (Chapters I–IV), `TR-C1-01` through `TR-C4-01` framing dispatches, and chapter unlock/lock state presentation.
- **Between-War & Completion Transitions**: `GameOverSummaryComponent` renders narrative transition cards (`TR-C1-01` through `TR-C4-04`), resolution quotes, and dynamic next-war action buttons.
- **Spoiler Firewall & Canonical Resolution**: Strict information boundaries across all four chapters; private Mont-Rouge mechanism (mouse/hay) safely protected; Chapter IV completes with the canonical resolution (`Matthias: “I never proved it.”` / `Marcel: “Non. Neither did I.”`) without an extraneous Bastien punchline.
- **Comprehensive Test Suite**: Full unit and integration suite green (521/521 tests passing), including `chapter-one-narrative-flow.spec.ts`, `narrative-campaign-traversal.spec.ts` (12-War traversal & spoiler firewall), and `narrative-resolver.service.spec.ts`.

Next steps for future work:
- Sprint 2 Clash Visualizations / Battlefield Animations.


---

## 5. Remaining Substantial Sprint 2 — Clash Visualizations / Battlefield Animations

This sprint is a first-class expression of the visual identity, not generic optional polish.

> **The cards do not merely represent the battle. They summon the battle.**

The physical cards continue to show and determine state. A presentation layer briefly imagines them as opposing units:

- Number cards → ordinary soldiers/infantry, with scale or formation influenced by rank.
- Jack → cavalry or knight.
- Queen → mage or equivalent elite specialist.
- King → regal swordsman or champion.
- Ace → commander or general.
- Two → visually humble ordinary troops/scouts that remain capable of the signature Ace-defeating role rather than merely looking weak.

Required qualities:

- Economical late-16-bit/early-32-bit tactical-JRPG grammar without copying copyrighted sprites, characters, animations, or UI.
- Clean silhouettes readable at phone scale; reusable SVG/CSS/keyframe or similarly economical assets where practical.
- Quick charge, collision, recoil, defeat, retreat, and/or casualty communication.
- Recursive Battles may escalate spectacle without obscuring stakes or extending play unnecessarily.
- Continue/skip and animation-speed behavior for experienced players, plus full reduced-motion support.
- No asset, runtime, or style budget that undermines mobile reliability.

The existing presentation phases, sequencer, settings, card table, Battle layers, CSS motion rules, and deterministic rule demos are implementation seams to evaluate. They do not authorize changes to card resolution or game state.

---

## 6. Final-Pass Release Concerns After the Two Sprints

These remain important but should not absorb or expand the creative sprint scopes:

1. Google Play closed-testing feedback, crash review, and store compliance.
2. Physical-device validation across compact phones, foldables, and tablets.
3. Known initial responsive layout/redraw gremlins, including first-load mobile viewport/reflow behavior that can correct after a redraw. Diagnose on real devices; do not assert a root cause without evidence.
4. Animation pacing and touch-target refinement for rapid one-handed play.
5. Screen-reader, focus, contrast, and reduced-motion verification across dialogs and drawers.
6. Store screenshots, feature graphics, and listing copy.
7. Unsupported Material icon audit and combat-math/callout overlay composition where still reproducible.
8. Monetization remains deferred (`ADS_ENABLED=false`) and cannot gate narrative.

---

## 7. Durable Architectural Guardrails

- Preserve the fixed dark-green felt table, gold accents, and dignified military interaction language.
- Preserve physical 52-card fidelity and deterministic game correctness.
- AI never inspects hidden deck order, face-down Battle cards, or concealed player information.
- Cosmetics, story, dialogue, portraits, and battlefield spectacle are presentation only.
- Do not reintroduce theme switching, collectible card stats, deck building, fantasy card abilities, or pay-to-win progression.
- Preserve accessibility, mobile readability, and current telemetry/privacy guarantees.
