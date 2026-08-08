# Source Directory Guidelines (`src/`)

This directory contains the Angular application source code, assets, styles, and public resources.

## 🏗️ Folder Layout

- `app/`: Angular components, services, models, and routes.
- `assets/`: Static image assets, card graphics, and icon sets.
- `public/`: Web manifest, favicons, and service worker assets for PWA support.
- `styles.scss` & `theme.scss`: Global styling, CSS variables, and Angular Material theme configuration.

## 📐 Angular & TypeScript Standards

1. **Angular Standalone Components**: All components are standalone. Do NOT add `standalone: true` in decorator as it is default in Angular 20+.
2. **Reactivity with Signals**:
   - Use `signal()`, `computed()`, and `effect()`.
   - Do NOT use `.mutate()`; use `.set()` or `.update()`.
3. **Control Flow Syntax**:
   - Use `@if`, `@for`, `@switch` instead of legacy structural directives (`*ngIf`, `*ngFor`).
4. **Dependency Injection**:
   - Prefer `inject(ServiceName)` over constructor parameters.
5. **Class & Style Bindings**:
   - Use `[class.name]="bool"` or `[style.prop]="val"` instead of `ngClass` / `ngStyle`.
6. **Change Detection**:
   - Enforce `changeDetection: ChangeDetectionStrategy.OnPush` on all components.
