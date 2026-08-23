# Alternate Rules Campaigns — Architecture & Specification

## 1. Overview & Strategic Philosophy

**Alternate Rules Campaigns** provide structured strategic modifiers, altered information states, and campaign-level resource constraints across the canonical **Three-War Campaign** in War of Attrition.

### Guiding Principles

1. **Strict Physical Deck Fidelity**:
   - The game is fully playable with a standard 52-card deck. Alternate Rules never grant magical card abilities, fantasy power-ups, or deck-building manipulations.
2. **Campaign-Scale Decisions**:
   - Standard War of Attrition evaluates reinforcements on a per-clash basis bounded only by physical deck depth. Alternate Rules introduce cross-war strategic planning where decisions in War 1 echo into Wars 2 and 3.
3. **Player Agency & Profile Isolation**:
   - Campaign Orders are chosen explicitly by the player before War 1 begins.
   - Campaign Orders are immutable for the duration of that Three-War series.
   - Free to play, unlocked for all profiles immediately without token gating or achievement prerequisites.
   - Profile-isolated: Each profile maintains its own active campaign mode and remaining reserves.
4. **Safe Backward Compatibility & Migration**:
   - Legacy profiles and existing saved campaigns without explicit mode tags safely normalize to `standard` with `ordersSelected: true`.

---

## 2. Canonical Campaign Modes

### A. Standard Campaign (`standard`)

- **Description**: Classic War of Attrition rules across a three-War series.
- **Reinforcement Rules**: Bounded only by the physical cards remaining in the player's deck.
- **Quota**: No cross-war reserve limit.
- **Orders Flow**: Default starting mode.

### B. Limited Reserves (`limited_reserves`)

- **Description**: A strict strategic constraint testing long-range resource management across all three Wars of a Campaign.
- **Initial Allocation**: Exactly **5 reinforcement reserves** allocated at Campaign initiation (`LIMITED_RESERVES_INITIAL_COUNT = 5`).
- **Persistence**: Remaining reserves carry across Wars 1, 2, and 3 without replenishment between Wars.
- **Authoritative Consumption**:
  - A reserve is consumed **only** when the human player actively accepts a challenge and commits a reinforcement card from their deck.
  - Declining a challenge (or choosing concession) does **not** consume a reserve.
  - Opponent reinforcements do **not** draw from or affect the human player's reserve pool.
  - Normal clash draws and regular multi-card battles do **not** consume reserves.
- **Zero-Reserves Behavior**:
  - When remaining reserves reach `0`, the human player cannot reinforce any beaten clash.
  - The controller automatically bypasses the challenge decision prompt, announces `"Reserves exhausted. The position must be conceded."`, logs the event in the StoryBook, and resolves standard concession settlement.
- **Completion & Reset**:
  - Upon conclusion of War 3, the final remaining reserve count is archived in the completed `CampaignHistoryEntry`.
  - The subsequent Campaign initializes fresh with `mode: 'standard'` and `ordersSelected: false`, allowing the player to select new Campaign Orders.

### C. Total War (`total_war`)

- **Description**: The Campaign outcome is determined solely by signed cumulative card differential across all three Wars. Every card matters, even in defeat.
- **Gameplay within Wars**: Standard War of Attrition mechanics (deck count bounds reinforcements).
- **Scoring & Outcome Derivation**:
  - Final outcome is calculated strictly from the sum of signed margins across all 3 Wars:
    - `differential > 0` => Campaign Victory
    - `differential < 0` => Campaign Defeat
    - `differential === 0` => Campaign Draw
  - Individual War records (wins/losses/ties) are preserved truthfully for statistics, career records, and Hall of Valor.
- **War-End Presentation**:
  - For Wars 1 & 2 (and the War phase of War 3), the table presentation foregrounds signed differential (`War differential: +7`, `Cumulative Campaign differential: +11`) rather than headlining a final victory or defeat.
  - Upon War 3 completion, the final verdict is clearly stated as differential-based (e.g. `Total War Campaign Victory · Final Differential: +11`).
- **Table & Seat Badging**:
  - Player table seat displays running cumulative differential (`TOTAL WAR · DIFF +8`).
- **Token Rewards**:
  - 1 token for Campaign Victory + 1 bonus token for positive differential (2 tokens max, matching standard economy).

### D. Fog of War (`fog_of_war`)

- **Description**: Strategic information constraint creating imperfect historical knowledge during active play.
- **Core Principle**: Record Truth, Present According to Information Access. Domain models, event buses, telemetry, achievements, and statistics record complete truthful history internally, while presentation surfaces conceal past casualties and historical comparisons until the War concludes.
- **Active-War Sealing**:
  - **Boneyard**: Casualty pile displays face-down top card, non-numeric `Sealed` status, and disabled tap-to-inspect viewer with atmospheric foggy blur effect.
  - **Chronicle (Field Manual)**: Comparison card identities, combat math formulas/expanders, and casualty strips are sealed in active play, replaced with narrative operational summaries.
  - **Hall of Valor**: Live service record ledger is sealed until War conclusion with thematic field notice. Internal attribution continues uninterrupted.
  - **Rules of Engagement**: Interactive drills and rules remain 100% accessible at all times.
- **Current-Live Event Presentation**:
  - Cards currently clashing or battling on table remain visible, with live glows and comparison strength indicators rendered normally.
- **War-End Reveal**:
  - Upon genuine War conclusion (`GamePhase.GAME_OVER`), all seals lift immediately: Boneyard inspection resumes, Chronicle reveals exact combat math and card identities, and Hall of Valor updates become viewable.
  - Starting the subsequent War re-engages the active-War seal.
- **Scoring**:
  - Uses Standard Campaign scoring (best 2-of-3 match wins/losses).
- **Opponent AI**:
  - Operates strictly with standard legal public information; does not cheat or suffer artificial memory loss.

---

## 3. Data Models & Domain Contracts

```typescript
export type CampaignModeId = 'standard' | 'limited_reserves' | 'total_war' | 'fog_of_war';

export interface LimitedReservesCampaignState {
  readonly initialReserves: number;    // Exactly 5
  readonly remainingReserves: number;  // Clamped in [0, 5]
}

export interface ActiveCampaign {
  readonly campaignId: string;
  readonly commanderId: OpponentCommanderId;
  readonly mode: CampaignModeId;
  readonly ordersSelected: boolean;
  readonly limitedReserves?: LimitedReservesCampaignState;
  readonly wars: readonly CampaignWarRecord[];
}

export interface CampaignHistoryEntry {
  readonly campaignId: string;
  readonly completedAt: string;
  readonly commanderId?: OpponentCommanderId;
  readonly mode: CampaignModeId;
  readonly remainingReserves?: number;
  readonly outcome: 'victory' | 'defeat' | 'draw';
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly differential: number;
  readonly tokensEarned: number;
  readonly wars: readonly CampaignWarRecord[];
}
```

### Pure Rule Functions

- `canHumanReinforce(campaign: ActiveCampaign, deckCount: number): boolean`
  - Returns `deckCount > 0` for `standard`, `total_war`, and `fog_of_war`.
  - Returns `deckCount > 0 && (campaign.limitedReserves?.remainingReserves ?? 0) > 0` for `limited_reserves`.
- `getHumanReserves(campaign: ActiveCampaign): { remaining: number; max: number } | null`
  - Returns `null` for `standard`, `total_war`, and `fog_of_war`.
  - Returns `{ remaining, max }` for `limited_reserves`.
- `isLimitedReservesMode(campaign: ActiveCampaign): boolean`
  - Returns `campaign.mode === 'limited_reserves'`.
- `isTotalWarMode(campaign: ActiveCampaign): boolean`
  - Returns `campaign.mode === 'total_war'`.
- `isFogOfWarMode(campaign: ActiveCampaign): boolean`
  - Returns `campaign.mode === 'fog_of_war'`.
- `isFogOfWarActive(mode: CampaignModeId, isWarResolved: boolean): boolean`
  - Returns `mode === 'fog_of_war' && !isWarResolved`.
- `canInspectCasualties(mode: CampaignModeId, isWarResolved: boolean): boolean`
  - Returns `!isFogOfWarActive(mode, isWarResolved)`.

---

## 4. UI & Table Presentation

### 1. Campaign Orders Briefing Modal (`CampaignOrdersDialogComponent`)
- Displayed before War 1 begins when `ordersSelected === false`.
- Thematic military briefing interface with gold trim, dark green felt styling, opposing commander profile, and clear selection among *Standard Campaign*, *Limited Reserves*, *Total War*, and *Fog of War*.
- Accessible with full keyboard navigation (`Tab`, `Space`, `Enter`, arrow keys) and ARIA attributes.

### 2. Tabletop Badges (`PlayerSeatComponent`)
- Rendered on the player's seat during active play:
  - When `activeCampaignMode === 'limited_reserves'`: Displays `RESERVES 5 / 5` or `RESERVES 0 / 5`.
  - When `activeCampaignMode === 'total_war'`: Displays running differential `TOTAL WAR · DIFF +8`.
  - When `activeCampaignMode === 'fog_of_war'`: Seat remains unencumbered without unnecessary badges.

### 3. Career & Profile Dialog (`ProfileDialogComponent`)
- Displays the active Campaign Orders (`Fog of War` with `Boneyard sealed until War end` status pill) under the Current Campaign overview tab.

---

## 5. Telemetry & Analytics Integration

- Telemetry context includes `campaign_mode` across all domain events (`war_started`, `turn_started`, `comparison_resolved`, `reinforcement_offered`, `reinforcement_decision`, `reinforcement_resolved`, `battle_resolved`, `settlement_resolved`, `game_resolved`, `game_abandoned`, `campaign_resolved`).
- `campaign_resolved` records include:
  - `campaign_mode: 'standard' | 'limited_reserves' | 'total_war' | 'fog_of_war'`
  - `remaining_reserves: number` (when `limited_reserves`)
  - `final_differential: number`
- All events strictly maintain GA4 parameter budget limits (<= 25 parameters per custom event).

### Fog of War Telemetry Policy
- **Information Boundary Principle**: *Fog of War removes player-facing and routine diagnostic information channels; because the game executes locally, it is not intended as a cryptographic anti-cheat boundary.*
- **Mapper-Level Redaction During Active War**:
  - While a `fog_of_war` War is unresolved, GA4 `window.dataLayer` event payloads suppress card-ledger parameters (exact card IDs, ranks, suits, values, casualty indexes/counts, decisive card IDs, and high-value indicators) to prevent telemetry from functioning as an accidental retrospective memory ledger.
  - Useful non-identifying analytical metrics are retained (`event_type`, `turn_number`, `stage`, `winner`, `comparison_result`, `battle_depth`, `actor`, `choice`, `outcome`, `special_rule`, `campaign_mode`).
- **Post-War Transmission**:
  - Once the War is resolved (`war_resolved`, `campaign_resolved`), complete aggregate statistics (final remaining counts, margin, differential, turns, battles, comebacks) transmit normally because the Fog seal has officially lifted.
