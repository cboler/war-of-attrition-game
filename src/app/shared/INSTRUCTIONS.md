# Shared Components Instructions (`src/app/shared/`)

This directory contains reusable, presentational UI components used across the application.

## 📁 Component Directory

- `components/`:
  - `card/` - [`card.component.ts`](components/card/card.component.ts): Card rendering component handling suit icons, rank text, flip animations, and glow highlights.

## 📐 Component Guidelines

1. **Presentational / Dumb Components**: Shared components should rely on Angular `input()` and `output()` signals for data binding and event emission.
2. **Reusability**: Keep styling modular in component-specific SCSS files.
3. **Accessibility**: All interactive shared elements must support keyboard focus indicators and ARIA roles.
