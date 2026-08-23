# Core Domain Instructions (`src/app/core/`)

The `core` directory is the single source of truth for game business logic, state containers, card models, and comparison rules.

## 📁 Directory Structure

- `models/`: Immutable domain models and interfaces:
  - [`card.model.ts`](models/card.model.ts) - Suits, ranks, display names, and color identifiers.
  - [`deck.model.ts`](models/deck.model.ts) - Deck operations (draw, shuffle, count, color filtering).
  - [`game-state.model.ts`](models/game-state.model.ts) - Enums (`GamePhase`, `PlayerType`, `ComparisonResult`) and state interfaces (`GameState`, `ActiveTurn`).
  - [`settings.model.ts`](models/settings.model.ts) - Preference configuration models.
- `services/`: Core logic services:
  - [`card-comparison.service.ts`](services/card-comparison.service.ts) - Evaluates rank comparisons including Ace vs. 2 special rule.
  - [`game-state.service.ts`](services/game-state.service.ts) - Manages player/opponent decks, discard pile, turn history, and signal state.
  - [`turn-resolution.service.ts`](services/turn-resolution.service.ts) - Resolves turn comparisons, challenge wins/losses/ties, and battle outcomes.
  - [`opponent-ai.service.ts`](services/opponent-ai.service.ts) - AI decision making for challenging turn losses.

## 🃏 Game Logic Rules

1. **Card Comparison**:
   - Standard: Ace > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2.
   - Special Rule: 2 > Ace.
2. **Challenge Ties**:
   - When a Challenge results in equal values (`ComparisonResult.TIE`), the turn transitions to `GamePhase.BATTLE`.
   - All active cards currently on the board remain staked into the Battle.
3. **Battle Phase**:
   - Requires 3 cards per deck to place face-down.
   - If either player has < 3 cards when Battle is triggered, `GameStateService.endGame()` is called immediately (Attrition Loss).
