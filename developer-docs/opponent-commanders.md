# Opponent Commanders & AI Personalities

Status: **Five fair-play strategy assets are implemented. Canonical fictional identities are settled for Sprint 1 but are not yet reflected in production data.**

The private biographies, knowledge/belief boundaries, and relationships live in [`narrative-canon.md`](./narrative-canon.md). This document describes the permanent mechanical layer and the exact boundary between current code and the named cast.

## 1. Permanent Strategy IDs and Canonical Identities

| Permanent strategy ID | Current production label | Canonical Sprint 1 identity | Faction and role |
| --- | --- | --- | --- |
| `quartermaster` | The Quartermaster | **Marcel de Brie** | French master affineur; principal French negotiator of the Mont-Rouge Accord |
| `gambler` | The Gambler | **Sir Edmund Gloucester** | English artisan-adventurer; Marcel's confidant |
| `analyst` | The Analyst | **Matthias von Greyerz** | Swiss master cheesemaker; principal Swiss negotiator of the Accord |
| `attritionist` | The Attritionist | **Bastien de Herve** | Belgian tyromancer and apolitical itinerant rind-seer |
| `cornered-general` | The Cornered General | **Lorenzo di Taleggio** | Italian Alpine merchant-prince, cheesemaker, and Matthias's confidant |

The IDs are permanent mechanical assets. Sprint 1 changes the player-facing `name`, `title`, `description`, biography, and dialogue data; it does not replace the strategies or introduce a sixth commander. Bastien is intentionally both the Belgian commander and the Tyromancer.

## 2. Physical-Deck Integrity and Fair Play

All commanders obey the same physical rules and information boundaries as the player:

- They never inspect hidden deck order or face-down Battle cards.
- They never manipulate draws, deck composition, rank, or comparison results.
- They receive no bonus cards, durability, magical powers, or statistical modifiers.
- Their differences come only from parameterized risk evaluation of legal public information and from presentation/dialogue.
- Narrative knowledge is not gameplay knowledge. Bastien's prophecy never allows the AI to peek at a future card.

## 3. Implemented Strategy Parameters

`src/app/core/models/commander.model.ts` is the executable source of truth. The values below match version 4.2.0 and replace earlier exploratory numbers that no longer matched code.

| ID | Card value | Win rate | Supported tie | Unsupported tie | Reserve penalty | Desperation severe / moderate / mild | Accept / reject | Pool strength | Gamble band |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `quartermaster` | 0.84 | 38 | 8 | -26 | 6 | 34 / 22 / 10 | 82 / 26 | 0.08 | 0.85 |
| `gambler` | 0.52 | 26 | 16 | -12 | 0 | 36 / 24 / 14 | 72 / 16 | 0.04 | 1.35 |
| `analyst` | 0.38 | 56 | 14 | -28 | 4 | 32 / 20 / 10 | 78 / 22 | 0.16 | 1.00 |
| `attritionist` | 0.58 | 30 | 12 | -36 | 18 | 28 / 16 / 8 | 80 / 24 | 0.08 | 0.90 |
| `cornered-general` | 0.66 | 32 | 10 | -20 | 2 | 58 / 38 / 14 | 80 / 20 | 0.08 | 1.15 |

The parameter fields are:

- `cardValueWeight` — value placed on the card at risk.
- `winRateWeight` — weight applied to clean win probability from the public candidate pool.
- `supportedTieWeight` / `unsupportedTiePenalty` — treatment of tie probability depending on whether the deck can sustain a Battle.
- `reserveDepletionPenalty` — caution as deck depth approaches critical thresholds.
- `desperationWeights` — urgency bonuses at deck counts `<= 3`, `<= 6`, and `<= 10`.
- `autoAcceptScore` / `autoRejectScore` — deterministic decision thresholds around the probabilistic marginal band.
- `candidatePoolStrengthWeight` — influence of average legal candidate-pool quality.
- `gambleBandMultiplier` — risk tolerance inside the marginal decision band.

### `quartermaster` → Marcel de Brie

The implemented model strongly values the card at risk, requires favorable odds, and uses a narrow gamble band. Marcel's characterization should make reserve husbandry feel like the discipline of an affineur protecting irreplaceable stock. Narrative pride must not distort the underlying legal calculation.

### `gambler` → Sir Edmund Gloucester

The implemented model has the lowest acceptance threshold, no reserve-depletion penalty, high supported-tie appetite, and the broadest gamble band. Edmund treats hesitation as a decision and embraces action under uncertainty. He pushed Marcel toward decisive action but did not intend war.

### `analyst` → Matthias von Greyerz

The implemented model gives the greatest weight to visible win probabilities and candidate-pool strength. Matthias describes his decisions as objective calculus even when the private canon makes clear that humiliation and suspicion affected his historical judgment. His AI still uses only legal public information.

### `attritionist` → Bastien de Herve

The implemented model emphasizes long-horizon deck sustainability, strongly penalizes unsupported Battles near exhaustion, and treats the War as longer than any single clash. This maps naturally to a prophet who behaves as though he has already seen the campaign's end. Prophecy is voice, not a gameplay advantage.

### `cornered-general` → Lorenzo di Taleggio

The implemented model is relatively controlled while healthy and receives the sharpest desperation bonuses at low deck counts. Lorenzo believes waiting for danger to become undeniable means waiting until one is already cornered. He is an accelerant and loyal adviser, not a mastermind.

## 4. Current Architecture

1. **`commander.model.ts`** defines IDs, strategy configuration, current generic presentation metadata, and fixed dialogue pools.
2. **`OpponentAIService`** evaluates legal public candidate cards against the active strategy and produces challenge decisions.
3. **`TableReactionService`** emits sparse contextual reactions. Opponent lines come from the active commander; player lines remain generic.
4. **`CampaignProgressionService`** persists one commander across all three Wars of a Campaign and rotates after Campaign completion without immediate repetition.
5. **`normalizeCampaignProgression`** deterministically derives a commander from `campaignId` for legacy data missing `commanderId`, preventing reload rerolls.
6. **Telemetry** carries `commander_id` in War/Campaign context without changing privacy guarantees.

## 5. Current Dialogue Contract and Sprint 1 Extension

`OpponentCommanderDialogue` currently holds pools for:

- 2-defeats-Ace clashes;
- Jack-over-Ten narrow clashes;
- successful and failed reinforcement rescues;
- notable Battle losses, split by Ace/Two loss, deep Battle, large loss, and general loss;
- optional concessions and low-deck desperate rescues.

`TableReactionService` applies event-specific probabilities, so silence remains the default. It has no mode, chapter, completion, or narrative-flag context, and it does not currently supply pre-War, War-resolution, or Campaign-completion dialogue.

Sprint 1 should use the smallest data extension capable of selecting a line by:

- commander;
- campaign mode/chapter;
- broad chapter progression;
- relevant gameplay event;
- optionally, prior chapter completion or a very small set of major narrative flags.

A compact conditioned-line record or keyed pool overlay is sufficient. Do not build a branching RPG engine, persistent relationship system, quest graph, or unrestricted scripting language.

## 6. Character Relationship Boundary

- Marcel and Matthias are respected rivals who each believes the other betrayed him.
- Edmund and Lorenzo are mirror-image loyal accelerants on opposite sides.
- Bastien is apolitical, truthful about Mont-Rouge, and obscure enough to be dismissed.
- Neither principal is evil or the saboteur.
- Edmund and Lorenzo are not secret masterminds.
- Bastien is not a conventional omniscient narrator and receives no sixth strategy identity.

See [`narrative-canon.md`](./narrative-canon.md) for each commander's exact knowledge, belief, omission, relationships, and chapter disclosure limits.
