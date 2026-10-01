# Services Subsystem Instructions (`src/app/services/`)

This directory contains application-level controller services connecting domain logic with presentation components.

## ⚙️ Service Index

- [`game-controller.service.ts`](game-controller.service.ts) - Primary controller orchestrating deck clicks, challenge flows, opponent AI challenges, battle setups, and presentation states.
- [`story-book.service.ts`](story-book.service.ts) - Service recording tactical match chronicle entries and combat milestones.
- [`table-reaction.service.ts`](table-reaction.service.ts) - Service generating situational quip reactions during clashes, challenges, and battles.
- [`battle-animation.service.ts`](battle-animation.service.ts) - Publishes the ephemeral skirmish scene (variant, duration, plan) for a decided comparison.
- [`skirmish-plan.ts`](skirmish-plan.ts) - Pure, seeded skirmish choreography shared by the soldiers, the WebGL particles and the sound. See [`developer-docs/skirmish-and-sound.md`](../../../developer-docs/skirmish-and-sound.md).

## 🔄 Interaction Guidelines

1. `GameControllerService` is injected via `providedIn: 'root'`.
2. Asynchronous user interactions (such as delayed opponent challenge resolves) must run inside `NgZone.run()` if triggered via timers.
3. State changes should be exposed as readonly signals or getter properties to prevent uncontrolled state mutations from components.
