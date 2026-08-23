# Shared Components Instructions (`src/app/shared/`)

This directory contains reusable, presentational UI components used across the application.

## 📁 Component Directory

- `components/`:
  - `game-board/` - [`game-board.component.ts`](components/game-board/game-board.component.ts): Main green-felt table layout container, deck placeholders, message banner, and health bars.
  - `card/` - [`card.component.ts`](components/card/card.component.ts): Card rendering component handling suit icons, rank text, flip animations, and glow highlights.
  - `health-bar/` - [`health-bar.component.ts`](components/health-bar/health-bar.component.ts): Health bar component showing card count percentage (Green 75-100%, Yellow 50-74%, Orange 25-49%, Red 1-24%), at-risk card highlights, and damage animations.
  - [`Agent.md`](components/Agent.md) - Presentational components reference document.

## 📐 Component Guidelines

1. **Presentational / Dumb Components**: Shared components should rely on Angular `input()` and `output()` signals for data binding and event emission.
2. **Reusability**: Keep styling modular in component-specific SCSS files.
3. **Accessibility**: All interactive shared elements must support keyboard focus indicators and ARIA roles.
