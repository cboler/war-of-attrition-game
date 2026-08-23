# Settings Subsystem Instructions (`src/app/settings/`)

This directory contains the settings configuration component and user preferences management.

## 📁 Files

- [`settings.ts`](settings.ts) - Settings component class.
- [`settings.html`](settings.html) - Settings component template.
- [`settings.scss`](settings.scss) - Settings styling.
- [`Agent.md`](Agent.md) - Subsystem technical documentation.

## 🎨 Feature Responsibilities

1. **Card Back Customization**: Allows selection between classic, modern, geometric, and custom card back patterns.
2. **Animation Settings**: Choose animation speed and automatic playback for comfort and performance.
3. **Sound & Control Preferences**: Manages sound effects, deck handedness, turn counter, card details, and tutorial guidance.
4. **Persistence**: Syncs settings changes with `SettingsService` for `localStorage` persistence.
