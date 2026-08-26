# Alternate Rules Campaigns — Architecture, Mechanics, and Chapter Availability

Status: **All four campaign modes are mechanically implemented. Progressive chapter availability is settled design for Narrative Sprint 1 and is not yet implemented.**

## 1. Overview and Strategic Philosophy

Alternate Rules Campaigns provide structured modifiers, altered information states, and campaign-level constraints across the canonical Three-War Campaign.

### Mechanical Guardrails

1. **Physical-deck fidelity:** Modes never grant magical card abilities, rank changes, deck-building effects, or hidden-information access.
2. **Three-War scope:** Campaign Orders are selected before War 1, remain fixed through Wars 1–3, and affect only the stated rules or information boundary.
3. **Profile isolation:** Each profile owns its active mode, War history, Limited Reserves balance, and future narrative unlock state.
4. **Truthful records:** Domain events and durable statistics record what actually happened even when Fog of War temporarily conceals presentation details.
5. **Narrative access is not monetized or skill-gated:** Completing a chapter—not winning it—unlocks the next chapter. Tokens, purchases, achievements, ads, and win rate never control chapter access.

The current production schema predates the narrative progression decision. It displays all four modes immediately. That current reality and the Sprint 1 target are deliberately distinguished below.

## 2. Canonical Modes in Narrative Progression Order

The permanent mode IDs and intended chapter order are:

> **`standard` → `limited_reserves` → `fog_of_war` → `total_war`**

Each chapter is a completed Three-War Campaign in its associated mode. See [`narrative-canon.md`](./narrative-canon.md) for chapter-specific may/must-not-reveal rules.

### A. Standard Campaign (`standard`) — Chapter I, “The Accord”

- **Rules:** Classic War of Attrition across a Three-War series.
- **Reinforcements:** Limited only by physical deck depth.
- **Campaign scoring:** Best Campaign record across the three Wars; ties remain truthful.
- **Narrative resonance:** Establishes the surface Mont-Rouge story and sincere accusations without revealing the natural cause or absence of evidence.

### B. Limited Reserves (`limited_reserves`) — Chapter II, “The Closing Passes”

- **Rules:** The player receives exactly **5 reinforcement reserves** for the complete Three-War Campaign (`LIMITED_RESERVES_INITIAL_COUNT = 5`).
- **Persistence:** Remaining reserves carry across Wars 1, 2, and 3 and do not replenish between Wars.
- **Authoritative consumption:**
  - One reserve is consumed only when the human accepts a challenge and commits a reinforcement card.
  - Declining or conceding consumes no reserve.
  - Opponent reinforcements do not use the human reserve pool.
  - Ordinary clash draws and Battle commitments do not use the pool.
- **Zero reserves:** The human cannot reinforce a beaten clash. The controller bypasses the choice, announces that the position must be conceded, records it in the Chronicle, and performs standard concession settlement.
- **Completion:** War 3 archives the remaining count in `CampaignHistoryEntry`; the current code then creates a fresh unselected Standard Campaign.
- **Narrative resonance:** Scarcity, closed passes, impounded shipments, and reciprocal defensive escalation.

### C. Fog of War (`fog_of_war`) — Chapter III, “The Blind Wheel”

- **Rules:** Standard scoring and reinforcement rules with constrained access to past casualty information while a War is active.
- **Core principle:** **Record truth; present according to information access.** Domain events, achievements, statistics, and internal attribution stay truthful.
- **Active-War sealing:**
  - **Boneyard:** Face-down top card, non-numeric `Sealed` state, and disabled casualty inspection.
  - **Chronicle:** Exact past card identities, comparison explanations, and casualty strips are replaced by operational summaries.
  - **Hall of Valor:** Service records are hidden while internal attribution continues.
  - **Rules of Engagement:** Always available.
- **Current live event:** Cards presently clashing or battling remain visible with ordinary glows and comparison presentation.
- **War-end reveal:** At genuine `GamePhase.GAME_OVER`, all seals lift. A subsequent War engages the seal again.
- **Opponent AI:** Uses the same legal public information as normal and neither cheats nor receives artificial memory loss.
- **Narrative resonance:** Conflicting records, missing proof, mundane dairy fragments, natural eye-formation context, and retrospective meaning in Bastien's warnings.

### D. Total War (`total_war`) — Chapter IV, “The War of Attrition”

- **Rules:** Ordinary in-War mechanics; Campaign outcome is determined solely by signed cumulative card differential across all three Wars.
- **Outcome:**
  - `differential > 0` → Campaign Victory
  - `differential < 0` → Campaign Defeat
  - `differential === 0` → Campaign Draw
- **Truthful records:** Individual War wins/losses/ties remain intact for career statistics and Hall of Valor.
- **Presentation:** Wars 1 and 2, and the War phase of War 3, foreground signed War and running Campaign differential. War 3 presents the final differential verdict.
- **Seat badge:** The player seat shows the running value (`TOTAL WAR · DIFF +8`).
- **Token rewards:** One token for Campaign Victory plus one for a positive differential, preserving the existing two-token maximum.
- **Narrative resonance:** Every accumulated action matters; loyal accelerants confront their roles; Marcel and Matthias confront the absence of proof and the human cost.

## 3. Current Availability vs. Sprint 1 Unlock Contract

### Current Version 4.2.0 Behavior

- `CampaignOrdersDialogComponent` renders all four options in this UI order: Standard, Limited Reserves, Total War, Fog of War.
- Any fresh or newly completed Campaign with `ordersSelected: false` may choose any of the four modes before War 1.
- `CampaignProgressionService.selectCampaignOrders()` validates that no War has been recorded but does not validate an unlock entitlement.
- `CampaignProgression` schema version 1 stores `mode` and `ordersSelected`, but no chapter completion or unlocked-mode field.
- Completing War 3 rotates the commander and initializes a fresh `standard` Campaign with `ordersSelected: false`.

The UI order and immediate availability are implementation reality, not the new narrative progression. Sprint 1 should reorder Campaign Orders to Standard, Limited Reserves, Fog of War, Total War and present locked/completed/replay states without altering mode mechanics.

### Sprint 1 Required Behavior

1. A new narrative-schema profile begins with Standard available.
2. Completing all three Wars of the current chapter unlocks the next mode regardless of Campaign outcome.
3. Every unlocked mode remains replayable.
4. Campaign Orders remain immutable after War 1 begins.
5. No token, cosmetic, purchase, achievement, ad, or victory requirement may gate narrative access.
6. Only a minimal durable unlock/completion field should be added; do not reinterpret `ordersSelected` as narrative progress.

### Backward-Compatible Migration

- Preserve the active Campaign's ID, commander, mode, orders state, recorded Wars, and Limited Reserves count.
- Inspect active mode and `recentCampaigns` to infer the highest chapter played or completed, then include its prerequisites.
- Preserve completed history and processed War IDs exactly through normalization.
- The old schema gave every profile all four choices and did not record modes merely viewed or intended. Profiles known to predate the narrative schema should therefore be grandfathered conservatively—full access is safer than silently revoking an option a player previously had.
- New-profile gating should apply only after the new schema can reliably distinguish a newly created profile from migrated data.
- Add migration tests for active Campaigns in all four modes, incomplete Campaigns, history-only evidence, malformed stored data, and legacy profiles with no alternate-mode history.

## 4. Current Data Models and Domain Contracts

```typescript
export type CampaignModeId =
  | 'standard'
  | 'limited_reserves'
  | 'total_war'
  | 'fog_of_war';

export interface LimitedReservesCampaignState {
  readonly initialReserves: number;
  readonly remainingReserves: number;
}

export interface ActiveCampaign {
  readonly campaignId: string;
  readonly commanderId: OpponentCommanderId;
  readonly mode: CampaignModeId;
  readonly ordersSelected: boolean;
  readonly wars: readonly CampaignWarRecord[];
  readonly limitedReserves?: LimitedReservesCampaignState;
}

export interface CampaignHistoryEntry {
  readonly campaignId: string;
  readonly commanderId?: OpponentCommanderId;
  readonly mode: CampaignModeId;
  readonly wars: readonly CampaignWarRecord[];
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly differential: number;
  readonly outcome: 'victory' | 'defeat' | 'draw';
  readonly tokensEarned: number;
  readonly completedAt: string;
  readonly remainingReserves?: number;
}
```

`CampaignProgression` additionally stores schema version, recent Campaigns, tokens, cosmetic unlocks/selections, and processed War IDs. Chapter unlock data does not yet exist and should be introduced through an explicit schema bump in Sprint 1.

### Current Pure Rule Functions

- `canHumanReinforce(campaign, deckCount)` requires a positive deck count and, only in Limited Reserves, a positive reserve count.
- `getHumanReserves(campaign)` returns the Limited Reserves pair or `null` in every other mode.
- `isLimitedReservesMode`, `isFogOfWarMode`, and `isTotalWarMode` identify exact current modes.
- `isFogOfWarActive(mode, isWarResolved)` seals only an unresolved Fog War.
- `canInspectCasualties(mode, isWarResolved)` is the inverse of the active Fog seal.
- `summarizeCampaign` derives Total War outcomes from differential and all other outcomes from War record.

Do not change these mechanical meanings when adding chapter availability.

## 5. Current UI and Presentation Surfaces

### Campaign Orders

`CampaignOrdersDialogComponent` is a forced, non-dismissible pre-War-1 briefing with dark felt/gold styling, opposing commander name/title, four radio-card choices, rule summaries, and reinforcement policy. Sprint 1 should extend this surface rather than create a separate chapter-select application.

### Table Badges

- Limited Reserves displays remaining/max reserves on the player seat.
- Total War displays running Campaign differential.
- Fog of War avoids a redundant seat badge and instead changes information access at the Boneyard and Field Manual.

### Field Manual and Profile

- The Profile dialog shows active Campaign Orders.
- The Field Manual Chronicle and Hall of Valor apply Fog sealing based on active mode and War resolution.
- Narrative chapter labels and replay/completion status are not currently displayed.

## 6. Telemetry and Privacy

- Telemetry context includes `campaign_mode` across War, turn, comparison, reinforcement, Battle, settlement, game, abandonment, and Campaign events.
- `campaign_resolved` includes mode, final differential, and remaining reserves when applicable.
- All custom events remain within the GA4 parameter budget.

During an unresolved Fog of War War, mapper-level redaction suppresses card-ledger fields such as exact card IDs, ranks, suits, values, casualty indexes/counts, decisive IDs, and high-value indicators while retaining non-identifying operational metrics. Aggregate resolved-War values may transmit after the seal lifts. Because play is local, Fog is an information-access design, not a cryptographic anti-cheat boundary.

Sprint 1 narrative unlocks must not weaken consent, test/screenshot suppression, Fog redaction, or the existing telemetry privacy contract.
