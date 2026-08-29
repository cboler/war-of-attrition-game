# War of Attrition — Documentation Index & Architecture

## 📋 Documentation Hierarchy

To ensure clarity for developers and automated coding agents, documentation in this repository is structured into three distinct tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AUTHORITATIVE SPECIFICATION                              │
│    war-of-attrition-requirements.md                         │
│    (Immutable rules, mechanics, and game requirements)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. CURRENT PROJECT STATUS                                   │
│    current-development-status.md                            │
│    (Live implementation state, priorities, design decisions)│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. CREATIVE DIRECTION, CANON & ROADMAP                      │
│    - developer-docs/north-star.md (Creative North Star)     │
│    - developer-docs/narrative-canon.md (Private canon)      │
│    - developer-docs/narrative-disclosure-matrix.md          │
│    - developer-docs/commander-voice-bible.md                │
│    - developer-docs/future-gameplay-ideas.md (Roadmap)      │
└─────────────────────────────────────────────────────────────┘
```

### 1. Authoritative Specification
- [`war-of-attrition-requirements.md`](./war-of-attrition-requirements.md) — **SINGLE SOURCE OF TRUTH** for all game rules, rank hierarchies, Battle resolution, and core requirements. **⚠️ NEVER MODIFY THIS FILE.**

### 2. Current Project State & Guidance
- [`current-development-status.md`](./current-development-status.md) — Authoritative live status describing the feature-complete core, implemented creative initial passes, and final release priorities.

### 3. Creative Direction & Backlog References
- [`developer-docs/north-star.md`](../../developer-docs/north-star.md) — **CREATIVE NORTH STAR** establishing thematic world identity, tone, JRPG-inspired visual grammar, and cosmetic principles.
- [`developer-docs/narrative-canon.md`](../../developer-docs/narrative-canon.md) — **PRIVATE WRITER CANON** for Mont-Rouge, commander dossiers, chapters, unlock philosophy, and source plan.
- [`developer-docs/narrative-disclosure-matrix.md`](../../developer-docs/narrative-disclosure-matrix.md) — **SPRINT 1 CREATIVE ROUTING** with the Reveal Ledger, authored twelve-War order, progressive dossiers, transitions, callbacks, spoiler/truth audits, sources, and runtime handoff.
- [`developer-docs/commander-voice-bible.md`](../../developer-docs/commander-voice-bible.md) — **CANONICAL VOICE & COPY** with relationship language, replay safety, and the curated twelve-encounter dialogue bank.
- [`developer-docs/future-gameplay-ideas.md`](../../developer-docs/future-gameplay-ideas.md) — Implemented Narrative and Clash Visualization sprint boundaries, release-polish concerns, and later candidates.

---

## 🎯 Current State Summary

- **Project Phase**: Feature-complete core with production initial passes for Progressive Narrative Unveiling and every-comparison Clash Visualizations / Battlefield Animations. Final release polish follows.
- **Active Table Route**: `src/app/table-game/` (`TableGame`) — Fully responsive across Mobile Phone (`<= 620px`), 7-inch Tablet (`620px - 820px`), and 10-inch Tabletop Grid (`>= 1100px`).
- **Visual Design**: Fixed dark/green felt card table. (Theme toggling was intentionally removed as the visual world is the felt table itself).
- **Automated Tests**: Comprehensive unit test suite (`npm test`) covering game logic, turns, challenges, recursive battles, and UI components.
- **Store Screenshots**: Automated Playwright Chromium screenshot generation suite (`npm run screenshots:store`) with binary header validation (`npm run screenshots:validate`).

---

## 🚀 Development & Build Commands

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:4200/)
npm start

# Run unit tests (headless)
npm test -- --watch=false --browsers=ChromeHeadless

# Run automated store screenshot generation
npm run screenshots:store

# Validate generated store screenshot artifacts
npm run screenshots:validate

# Production build (outputs to /docs for GitHub Pages)
npm run build
```

---

## 🎮 Attrition Game Flow

The canonical game-flow diagram is maintained in the repository [README](../../README.md#attrition-game-flow). It covers deck exhaustion, true ties, recursive Battles, and hidden-card settlement behavior implemented by the current engine.
