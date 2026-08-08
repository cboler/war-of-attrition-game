# Services Subsystem Instructions (`src/app/services/`)

This directory contains application-level controller services connecting domain logic with presentation components.

## ⚙️ Service Index

- [`game-controller.service.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/game-controller.service.ts) - Primary controller orchestrating deck clicks, challenge flows, opponent AI challenges, battle setups, and turn state resets.
- [`progress.service.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/progress.service.ts) - Service loading progress tracking data from `.github/instructions/progress-data.json`.
- [`game-demo.service.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/game-demo.service.ts) - Automated simulation service for running non-interactive game demos.
- [`Agent.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/services/Agent.md) - Subsystem technical reference for AI agents.

## 🔄 Interaction Guidelines

1. `GameControllerService` is injected via `providedIn: 'root'`.
2. Asynchronous user interactions (such as delayed opponent challenge resolves) must run inside `NgZone.run()` if triggered via timers.
3. State changes should be exposed as readonly signals or getter properties to prevent uncontrolled state mutations from components.
