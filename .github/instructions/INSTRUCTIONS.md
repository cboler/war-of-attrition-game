# GitHub Instructions & Documentation Index

This directory contains specifications, architecture guides, and development status for War of Attrition.

## 📄 Document Sitemap

### 1. Authoritative Specification
- [`war-of-attrition-requirements.md`](./war-of-attrition-requirements.md) — Single source of truth for all game rules, mechanics, turn resolutions, and physical deck specifications. **⚠️ NEVER MODIFY THIS FILE.**

### 2. Current Project Status & Architecture
- [`current-development-status.md`](./current-development-status.md) — Authoritative live status describing the feature-complete core, implemented Narrative and Clash Visualization initial passes, and final release priorities.
- [`implementation-guidelines.md`](./implementation-guidelines.md) — Code quality standards, Angular signal conventions, and architectural rules.
- [`copilot-instructions.md`](./copilot-instructions.md) — Detailed agent operating guidelines, build scripts, and issue workflows.

### 3. Historical Planning & Backlog
- [`development-milestones.md`](./development-milestones.md) — Master roadmap used during early development milestones (historical reference).
- [`progress-data.json`](./progress-data.json) — Legacy development metadata formerly used by unrouted demo components. Live status is tracked in `current-development-status.md`.
- [`developer-docs/narrative-canon.md`](../../developer-docs/narrative-canon.md) — Private Mont-Rouge canon, five commander dossiers, four-chapter disclosure, and narrative migration contract.
- [`developer-docs/narrative-disclosure-matrix.md`](../../developer-docs/narrative-disclosure-matrix.md) — Authored twelve-War narrative routing, progressive dossiers, callbacks, source map, audits, and Sprint 1 handoff.
- [`developer-docs/commander-voice-bible.md`](../../developer-docs/commander-voice-bible.md) — Canonical commander voices and curated implementation-ready dialogue records.
- [`developer-docs/future-gameplay-ideas.md`](../../developer-docs/future-gameplay-ideas.md) — Implemented Narrative and Clash Visualization sprint boundaries plus later backlog.

## ⚠️ Requirements Alignment Checklist
When adding or modifying features:
1. Ensure all game rules strictly align with `war-of-attrition-requirements.md`.
2. Do not reintroduce theme switching; the fixed dark/felt card table presentation is deliberate.
3. Validate that unit tests in `src/app/` match specified behavior.
