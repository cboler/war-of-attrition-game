# War of Attrition Game - Project Instructions & Guidelines

Welcome to the **War of Attrition Game** codebase. This file serves as the top-level architectural and behavioral instruction entrypoint for developers and AI coding agents working on this repository.

## 📖 Cascading Instructions Sitemap

For domain-specific instructions and subsystem details, refer to the cascading instruction files:

- [`.github/instructions/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/.github/instructions/INSTRUCTIONS.md) - Specifications, rules, milestone plans, and requirements.
- [`src/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/INSTRUCTIONS.md) - Source root standards, TypeScript rules, and Angular configuration.
- [`src/app/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/INSTRUCTIONS.md) - Application structure, routing, and Signal-based state architecture.
- [`src/app/core/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/core/INSTRUCTIONS.md) - Core domain logic (models, card comparison, game state, turn resolution).
- [`src/app/game/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/INSTRUCTIONS.md) - Game board UI component, animations, user action handling, and demo mode.
- [`src/app/services/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/INSTRUCTIONS.md) - High-level controller services (`GameControllerService`, `ProgressService`).
- [`src/app/settings/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/settings/INSTRUCTIONS.md) - Preferences and settings component (theme, card backings).
- [`src/app/shared/INSTRUCTIONS.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/shared/INSTRUCTIONS.md) - Reusable components (`GameBoardComponent`, `CardComponent`).

---

## 🎯 Core Rules Summary

1. **Deck Setup**: 52-card standard deck split by color. Player = 26 Red cards (Hearts, Diamonds). Opponent = 26 Black cards (Clubs, Spades). Both decks shuffled independently.
2. **Standard Ranking**: Ace > King > Queen > Jack > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2.
3. **Special Exception**: **2 beats Ace**. (Ace beats King, but 2 beats Ace).
4. **Challenge Logic**: When a player/AI loses a turn comparison, they can Challenge by drawing 1 extra card.
   - Challenge Win: Challenger keeps both active cards; opponent card discarded.
   - Challenge Loss: Challenger loses both active cards; opponent keeps original winning card.
   - **Challenge Tie**: Triggers a **Battle phase**, preserving all active cards on the board as staked cards.
5. **Battle Logic**: Initiated on equal card values (or Challenge tie). Each side places 3 face-down cards. Each player selects 1 face-down card from the opponent. The selected cards are revealed and compared.
   - Battle Win: Winner keeps all staked cards + their 3 battle cards. Loser's staked cards + 3 battle cards are discarded.
   - Recursive Battle: If selected cards tie, another round of 3 face-down cards per side is placed, accumulating all staked cards.
6. **Attrition Loss**: If a player cannot place 3 cards for a Battle due to having < 3 cards in deck, they immediately suffer an Attrition Loss.

---

## 🛠️ Key CLI Commands

- **Development Server**: `ng serve` (Access at `http://localhost:4200/`)
- **Run Unit Tests**: `npx ng test --watch=false`
- **Build Production PWA**: `ng build`
