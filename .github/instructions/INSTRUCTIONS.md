# GitHub Instructions & Documentation Index

This directory contains specifications, architecture guides, and development status for War of Attrition.

## 📄 Document Sitemap

### 1. Authoritative Specification
- [`war-of-attrition-requirements.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/war-of-attrition-requirements.md) — Single source of truth for all game rules, mechanics, turn resolutions, and physical deck specifications. **⚠️ NEVER MODIFY THIS FILE.**

### 2. Current Project Status & Architecture
- [`current-development-status.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/current-development-status.md) — Authoritative live status describing the **Production Readiness / Final Polish** phase, active systems, and release priorities.
- [`implementation-guidelines.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/implementation-guidelines.md) — Code quality standards, Angular signal conventions, and architectural rules.
- [`copilot-instructions.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/copilot-instructions.md) — Detailed agent operating guidelines, build scripts, and issue workflows.

### 3. Historical Planning & Backlog
- [`development-milestones.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/development-milestones.md) — Master roadmap used during early development milestones (historical reference).
- [`progress-data.json`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/progress-data.json) — Legacy development metadata formerly used by unrouted demo components. Live status is tracked in `current-development-status.md`.
- [`developer-docs/future-gameplay-ideas.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/future-gameplay-ideas.md) — Post-release design concepts (AI Commander personalities, Hall of Valor card records, Alternate Rules Campaigns).

## ⚠️ Requirements Alignment Checklist
When adding or modifying features:
1. Ensure all game rules strictly align with `war-of-attrition-requirements.md`.
2. Do not reintroduce theme switching; the fixed dark/felt card table presentation is deliberate.
3. Validate that unit tests in `src/app/` match specified behavior.
