# Game Component Instructions (`src/app/game/`)

The `game` folder contains the primary interactive UI component (`Game`) orchestrating game execution, visual animation flows, user prompts, and demo mode.

## 📄 File Overview

- [`game.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/game.ts) - Game component TypeScript logic.
- [`game.html`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/game.html) - Component template utilizing Angular native control flow (`@if`, `@for`).
- [`game.scss`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/game.scss) - SCSS styles, layout rules, and animation classes.
- [`Agent.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/game/Agent.md) - Agent technical reference document.

## 🎮 Component Key Responsibilities

1. **State Binding**: Binds component signals to `GameControllerService` and `GameStateService` computed values.
2. **User Prompts**: Displays inline action messages for drawing cards, challenge decisions, and selecting face-down battle cards.
3. **Animations**: Coordinates card slide-in, card flip, battle clash animations, and health bar damage transitions.
4. **Demo Mode**: Integrates with `GameDemoService` and `ProgressService` for milestone verification and demo logs.

## 🎨 UI & Accessibility Guidelines
- Enforce blue glow effect for active clickable user actions (player deck, battle cards).
- All buttons must have descriptive `aria-label` attributes for screen readers.
- Keyboard navigation must support Space/Enter for deck clicks and battle card selections.
