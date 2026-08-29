# App Subsystem Guidelines (`src/app/`)

The `src/app` directory contains the core application components, feature modules, and services for the War of Attrition game.

## 🗂️ Architectural Modules

- [`core/`](core/INSTRUCTIONS.md) - Domain models (`card.model.ts`, `deck.model.ts`, `game-state.model.ts`, `settings.model.ts`, `achievement.model.ts`) and pure business logic services.
- [`table-game/`](table-game/) - Primary active game-table view (`TableGame` component), responsive layout, card playfield, stakes, and battle presentation.
- [`services/`](services/INSTRUCTIONS.md) - High-level controller services (`GameControllerService`, `StoryBookService`, `TableReactionService`).
- [`settings/`](settings/INSTRUCTIONS.md) - User preferences view (card-backing selection, animation speed, turn counter).
- [`shared/`](shared/INSTRUCTIONS.md) - Reusable components (`CardComponent`, `ComparisonStrengthComponent`, `GameOverSummaryComponent`, drawers, dialogs).

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
