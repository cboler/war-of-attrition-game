# Opponent Commanders & AI Personalities

Status: Implemented in core gameplay, campaign progression, table presentation, and telemetry.

> [!NOTE]
> **Creative Direction & Character Evolution**
> The titles and generic labels in this document (*The Quartermaster*, *The Gambler*, *The Analyst*, *The Attritionist*, *The Cornered General*) describe the **implemented AI strategy layer and behavioral archetypes**.
> 
> As defined in [`developer-docs/north-star.md`](./north-star.md), future fictional opponent identities will be richer named characters (e.g. passionate international cheesemakers and affineurs) whose personalities and visual presentation map directly onto these established strategy archetypes.
> 
> The current generic names should **not** be treated as immutable creative canon, but the underlying parameterized AI strategy architecture and fair-play math remain authoritative.

## 1. Physical 52-Card Deck Integrity & Fair Play

*War of Attrition* is designed to be physically playable with an ordinary 52-card deck. Opponent commanders strictly respect that identity:

- **Identical Rules**: Commanders obey the exact same physical rules as the player.
- **No Cheating / No Hidden Information**: Commanders never inspect hidden deck order, never know the player's face-down cards, and never manipulate draw orders.
- **No Stat Buffs or Extra Cards**: Commanders never receive extra cards, altered ranks, bonus hit points, or statistical modifiers.
- **Strategic Variance**: Differences between commanders stem solely from distinct risk models, challenge thresholds, card valuations, and contextual table reactions.

---

## 2. Commander Archetypes & Strategy Parameters

The system defines 5 distinct commander archetypes implemented via parameterized strategy weights in `src/app/core/models/commander.model.ts`:

### 1. The Quartermaster (`quartermaster`)
- **Title**: Conservative Logistics
- **Description**: Conserves reserves; only challenges to protect critical high-rank cards when probabilities strongly favor success.
- **Behavioral Weights**:
  - `cardValueWeight`: `1.25` (strongly protects face cards/Aces/Twos)
  - `winRateWeight`: `1.30` (requires high probability of winning)
  - `reserveDepletionPenalty`: `1.8` (avoids risks when reserve count is low)
  - `autoAcceptScore`: `22` / `autoRejectScore`: `-12`
  - `gambleBandMultiplier`: `0.70` (reluctant gambler)

### 2. The Gambler (`gambler`)
- **Title**: High-Stakes Opportunist
- **Description**: Aggressive and opportunistic; challenges often on narrow odds and embraces high-stakes Battles.
- **Behavioral Weights**:
  - `cardValueWeight`: `0.85`
  - `winRateWeight`: `0.90` (willing to challenge on coin flips)
  - `supportedTieWeight`: `1.20` / `unsupportedTiePenalty`: `0.80` (embraces Battles)
  - `reserveDepletionPenalty`: `0.5`
  - `autoAcceptScore`: `12` / `autoRejectScore`: `-24`
  - `gambleBandMultiplier`: `1.45` (high risk tolerance)

### 3. The Analyst (`analyst`)
- **Title**: Probabilistic Calculus
- **Description**: Cold and calculated; computes public card probabilities with strict mathematical cutoffs and zero emotional bias.
- **Behavioral Weights**:
  - `cardValueWeight`: `1.00`
  - `winRateWeight`: `1.15`
  - `candidatePoolStrengthWeight`: `1.20` (tracks remaining deck quality)
  - `supportedTieWeight`: `1.00` / `unsupportedTiePenalty`: `1.00`
  - `autoAcceptScore`: `18` / `autoRejectScore`: `-18`
  - `gambleBandMultiplier`: `1.00` (neutral, mathematically calibrated)

### 4. The Attritionist (`attritionist`)
- **Title**: Resource Depletion
- **Description**: Relentless grinding; welcomes Battles and card trades to bleed down the opponent's overall deck count.
- **Behavioral Weights**:
  - `cardValueWeight`: `0.70` (cares less about card rank than total attrition)
  - `winRateWeight`: `0.95`
  - `supportedTieWeight`: `1.40` (actively seeks Battles to force casualties)
  - `unsupportedTiePenalty`: `0.60`
  - `autoAcceptScore`: `14` / `autoRejectScore`: `-20`
  - `gambleBandMultiplier`: `1.20`

### 5. The Cornered General (`cornered-general`)
- **Title**: Desperate Gambit
- **Description**: Begins cautious, but shifts into erratic, high-risk aggression as reserves dwindle.
- **Behavioral Weights**:
  - `cardValueWeight`: `1.10`
  - `winRateWeight`: `1.05`
  - `desperationWeights`:
    - `lowDeckBonus`: `12.0` (when deck <= 3 cards)
    - `mediumDeckBonus`: `6.0` (when deck <= 6 cards)
    - `mildDeckBonus`: `2.5` (when deck <= 10 cards)
  - `autoAcceptScore`: `17` / `autoRejectScore`: `-16`
  - `gambleBandMultiplier`: `1.10`

---

## 3. Architecture & Service Design

Rather than duplicating AI logic across five distinct services, the system uses a clean, data-driven strategy pattern:

1. **`commander.model.ts`**: Single source of truth for commander IDs, strategy configurations, registry maps, and curated dialogue pools.
2. **`OpponentAIService`**: Evaluates public candidate cards (the 26 opposing-color cards minus revealed/discarded cards) against the active commander's strategy parameters to generate continuous challenge scores and decisions.
3. **`TableReactionService`**: Emits context-sensitive reactions using the active commander's dialogue for opponent lines while keeping player lines generic. Silence remains the default.
4. **`CampaignProgressionService`**: Persists the active `commanderId` across all 3 Wars of a Campaign. When a Campaign completes, `selectNextCommander()` rotates to a new commander (preventing immediate repetition).
5. **Persistence Migration**: `normalizeCampaignProgression` automatically derives a deterministic commander ID from the `campaignId` for legacy profiles lacking `commanderId`, ensuring no rerolls on page reload.
6. **Telemetry**: Transmits `commander_id` across `beginWar`, `TelemetryEnvelope`, `war_started`, and `campaign_resolved` events for analytics.
