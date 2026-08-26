# War of Attrition Game - Copilot Agent Instructions

## Repository Overview

This repository contains the **War of Attrition** card game - a Progressive Web Application (PWA) built with Angular and Angular Material, packaged for Android via a Trusted Web Activity (TWA). The project implements a complete physical card game simulation with responsive layouts, animations, campaign progression, persistent player profiles, and deterministic store screenshot automation.

**Key Project Details**:
- **Language**: TypeScript (Angular 20)
- **Framework**: Angular with Angular Material UI
- **Type**: Progressive Web Application (PWA) + Android TWA
- **Architecture**: Signal-based reactive state management with standalone components
- **Deployment**: GitHub Pages (hosted from `/docs`)
- **Current Status**: Feature-complete core; Progressive Narrative Unveiling and Clash Visualization sprints remain before final release polish. See `current-development-status.md`.
- **Test Coverage**: Comprehensive automated unit test coverage across game logic, turns, challenges, recursive battles, and UI components

## Build and Development Commands

**ALWAYS run `npm install` before any other commands**.

### Essential Commands
```bash
# Install dependencies
npm install

# Development server (http://localhost:4200/)
npm start

# Production build (outputs to /docs directory for GitHub Pages)
npm run build

# Run unit tests in headless environment
npm test -- --watch=false --browsers=ChromeHeadless

# Run automated store screenshot generation
npm run screenshots:store

# Validate generated store screenshot artifacts
npm run screenshots:validate
```

### Build Timing and Warnings
- **Build time**: ~7-10 seconds for production build
- **Test time**: ~3-5 seconds for full headless unit test suite
- **Bundle size**: Optimally split into lazy chunks for game, settings, and compliance routes

---

## Project Architecture and File Structure

### Core Directory Structure
```
/
├── .github/
│   ├── instructions/                  # Project specifications and guides
│   │   ├── war-of-attrition-requirements.md  # IMMUTABLE requirements (NEVER modify)
│   │   ├── current-development-status.md     # Authoritative live project status
│   │   └── README.md                         # Documentation index & hierarchy
│   └── workflows/                     # GitHub Actions (Deploy, AAB, Screenshots)
├── android/                           # Android TWA / Bubblewrap wrapper
├── docs/                              # Production build output (GitHub Pages)
├── developer-docs/                    # Technical & Play Store documentation
├── store-assets/screenshots/          # Generated Play Store screenshot packages
├── tests/screenshots/                 # Playwright screenshot test matrix
├── src/app/                           # Main application source
│   ├── core/                          # Core game engine, models, and services
│   │   ├── models/                    # Card, Deck, GameState, Settings, Achievement models
│   │   └── services/                  # GameState, Auth, Settings, Achievements, Campaign
│   ├── table-game/                    # Active primary game-table component (TableGame)
│   ├── settings/                      # Settings & card-backing customizer
│   ├── shared/components/             # Reusable UI (Card, Power Badges, Drawers, Dialogs)
│   ├── services/                      # GameControllerService, StoryBookService, Reaction
│   └── public/                        # Privacy, Support, Data Deletion compliance pages
├── angular.json                       # Angular CLI configuration
├── package.json                       # Dependencies and scripts
└── tsconfig.json                      # TypeScript configuration
```

### Service Architecture
```
Application / UI Layer (src/app/services/ & src/app/core/services/)
├── GameControllerService     # Presentation state, user actions, battlefield presentation
├── StoryBookService          # Battle chronicle narrative history
├── TableReactionService      # Situational quip dialogue
├── AchievementService        # Achievement evaluation and unlocking
├── CampaignService           # 3-War Campaign scoring and differential tracking
├── TelemetryConsentService   # GA4 analytics consent and event tracking
└── AuthService               # Commander profiles, authentication, career records

Core Engine Layer (src/app/core/services/)
├── GameStateService          # Central signals state (playerDeck, opponentDeck, discardPile)
├── TurnResolutionService     # Turn, challenge, and recursive battle resolution logic
├── CardComparisonService     # Game rules and special 2 vs Ace comparison logic
├── OpponentAIService         # AI challenge and battle targeting decisions
└── SettingsService           # Preferences, card backings, animation speed
```

---

## Development Guidelines

### Angular-Specific Patterns
- **Standalone Components**: All components are standalone (`imports: [...]`).
- **Signal-Based State**: Use Angular signals for reactive state (`signal()`, `computed()`).
- **OnPush Change Detection**: All components use `ChangeDetectionStrategy.OnPush`.
- **Modern Control Flow**: Use `@if`, `@for`, `@switch` native control flow.

### Design Principles & Guardrails
- **Fixed Dark / Felt Tabletop Presentation**: The visual world is the green felt table itself. Do not reintroduce light/dark theme toggles.
- **Physical Deck Fidelity**: The game is literally playable with an ordinary physical deck of cards. Digital features augment presentation/progression, not fantasy superpowers.
- **Immutable Requirements**: **NEVER** modify `war-of-attrition-requirements.md`.

---

## Standard Operating Procedure (SOP) for Issue & PR Workflow

When receiving bug reports, feature requests, or enhancements:
1. **Intake & Root Cause Analysis**:
   - Ground diagnosis in authoritative source code and rules in `war-of-attrition-requirements.md`.
2. **Feature/Fix Branching**:
   - Create a dedicated branch named `fix/<description>` or `feature/<description>`.
3. **Implementation & Verification**:
   - Implement following signal-based state management and standalone component patterns.
   - Run tests: `npm test -- --watch=false --browsers=ChromeHeadless`
   - Run build: `npm run build`
   - If screenshots are affected: `npm run screenshots:store && npm run screenshots:validate`
4. **Pull Request Creation**:
   - Open a PR referencing the issue.
