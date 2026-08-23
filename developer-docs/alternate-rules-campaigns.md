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

---

## 3. Data Models & Domain Contracts

```typescript
export type CampaignModeId = 'standard' | 'limited_reserves';

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
  readonly mode?: CampaignModeId;
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
  - Returns `deckCount > 0` for `standard`.
  - Returns `deckCount > 0 && (campaign.limitedReserves?.remainingReserves ?? 0) > 0` for `limited_reserves`.
- `getHumanReserves(campaign: ActiveCampaign): number | null`
  - Returns `null` for `standard`.
  - Returns `remainingReserves` (clamped `0..5`) for `limited_reserves`.
- `isLimitedReservesMode(campaign: ActiveCampaign): boolean`
  - Returns `campaign.mode === 'limited_reserves'`.

---

## 4. UI & Table Presentation

### 1. Campaign Orders Briefing Modal (`CampaignOrdersDialogComponent`)
- Displayed before War 1 begins when `ordersSelected === false`.
- Thematic military briefing interface with gold trim, dark green felt styling, opposing commander profile, and clear radio selection between *Standard Campaign* and *Limited Reserves*.
- Accessible with full keyboard navigation (`Tab`, `Space`, `Enter`, arrow keys) and ARIA attributes.

### 2. Tabletop Reserves Badge (`PlayerSeatComponent`)
- Rendered on the player's seat during active play when `activeCampaignMode === 'limited_reserves'`.
- Displays `RESERVES 5 / 5` with gold borders and ivory lettering.
- Changes to a high-contrast warning badge (`RESERVES 0 / 5`) when reserves are exhausted.

### 3. Career & Profile Dialog (`ProfileDialogComponent`)
- Displays the active Campaign Orders and reserve tally under the Current Campaign overview tab.

---

## 5. Telemetry & Analytics Integration

- Telemetry context includes `campaign_mode` across all domain events (`war_started`, `turn_started`, `comparison_resolved`, `reinforcement_offered`, `reinforcement_decision`, `reinforcement_resolved`, `battle_resolved`, `settlement_resolved`, `game_resolved`, `game_abandoned`, `campaign_resolved`).
- `campaign_resolved` records include:
  - `campaign_mode: 'standard' | 'limited_reserves'`
  - `remaining_reserves: number` (when `limited_reserves`)
- All events strictly maintain GA4 parameter budget limits (<= 25 parameters per custom event).
