# App Subsystem Guidelines (`src/app/`)

The `src/app` directory contains the core application components, feature modules, and services for the War of Attrition game.

## 🗂️ Architectural Modules

- [`core/`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/core/INSTRUCTIONS.md) - Domain models (`card.model.ts`, `deck.model.ts`, `game-state.model.ts`) and pure business logic services (`card-comparison.service.ts`, `game-state.service.ts`, `turn-resolution.service.ts`, `opponent-ai.service.ts`).
- [`game/`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/INSTRUCTIONS.md) - Main interactive game view (`Game` component), visual animations, and demo mode.
- [`services/`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/INSTRUCTIONS.md) - High-level controller services (`GameControllerService`, `ProgressService`, `GameDemoService`).
- [`settings/`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/settings/INSTRUCTIONS.md) - User preferences view (card theme selection, animations toggle).
- [`shared/`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/shared/INSTRUCTIONS.md) - Reusable presentational components (`GameBoardComponent`, `CardComponent`, `HealthBarComponent`).

## 🔄 State Flow Architecture

```
User Action (UI Component)
    ↓
GameControllerService / Component Methods
    ↓
TurnResolutionService & CardComparisonService
    ↓
GameStateService (Updates Signals)
    ↓
UI Signals / Computed Signals (Re-render)
```

## ⚙️ Key Constraints
- Core business logic must remain decoupled from presentation components.
- Direct mutations of decks or game state must go through `GameStateService`.
- Unit tests must be maintained alongside every service and model file (`*.spec.ts`).
