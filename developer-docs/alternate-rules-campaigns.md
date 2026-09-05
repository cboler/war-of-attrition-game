# Alternate Rules Campaigns

Status: Implemented. The first story traversal is a mandatory four-Chapter sequence with cumulative rules. Completing Chapter IV unlocks configurable custom Campaigns.

## 1. Campaign structure

Every Campaign contains three Wars. The Chapter identity and the active mechanical modifiers are separate concepts:

- `mode` identifies the authored story Chapter and routes its commander schedule and narrative.
- `modifiers` identifies the rules currently applied by gameplay.
- Story Chapters prescribe their modifier stack and do not allow configuration.
- Custom Campaigns use the neutral `standard` narrative identity and allow each modifier to be toggled independently.

This separation prevents a custom rules choice from reopening finished story beats.

## 2. Mandatory first traversal

Completing a Chapter, regardless of victory, defeat, or draw, advances to the next Chapter. Players cannot replay an earlier Chapter or alter its rules until the full story is complete.

| Chapter | Story ID | Mandatory modifiers | Authored commanders |
| --- | --- | --- | --- |
| I: The Accord | `standard` | None | Marcel, Matthias, Bastien |
| II: The Closing Passes | `limited_reserves` | Limited Reserves | Edmund, Lorenzo, Marcel |
| III: The Blind Wheel | `fog_of_war` | Limited Reserves + Fog of War | Matthias, Marcel, Bastien |
| IV: The War of Attrition | `total_war` | Limited Reserves + Fog of War + Total War | Edmund, Lorenzo, Matthias |

Campaign Orders displays the next Chapter and its complete stack as locked Story Orders. The stack remains fixed for all three Wars.

Narrative dialogue authored for the current Chapter is guaranteed the first time its eligible event occurs during this traversal. Once that Chapter is complete, replay and procedural chatter return to their lower probabilistic frequency.

## 3. Custom Campaigns

After Chapter IV, Campaign Orders becomes a rules configurator over Classic play. The player may independently enable or disable:

- Limited Reserves
- Fog of War
- Total War

Any combination is valid, including no modifiers or all three. The selected stack is immutable once War 1 begins. A completed custom Campaign carries its selected stack into the next briefing as the default, where it can be changed before play.

Custom Campaigns use three distinct randomized commanders selected from the permanent roster. They use evergreen and replay-safe dialogue only; modifiers affect mechanics and presentation, not narrative progression.

## 4. Modifier mechanics

### Limited Reserves

- The player receives five reinforcement reserves for the whole three-War Campaign.
- One reserve is consumed only when the human accepts a challenge and commits a reinforcement card.
- Declining, conceding, ordinary clash draws, Battle commitments, and opponent reinforcements do not consume the pool.
- Remaining reserves persist between Wars and are archived in Campaign history.
- At zero reserves, the human cannot reinforce a beaten clash.

### Fog of War

- While a War is unresolved, the Boneyard, Chronicle casualty details, and Hall of Valor are sealed.
- Currently clashing or battling cards remain visible.
- Truthful domain events, statistics, achievements, and internal attribution are still recorded.
- The seal lifts at genuine game over and engages again in the next War.
- Telemetry suppresses card-ledger fields whenever Fog is present in the modifier stack.

### Total War

- Individual War results remain truthful, but the Campaign result is determined by cumulative signed card differential.
- Positive differential is victory, negative is defeat, and zero is a draw.
- The table and summaries foreground the running and final differential.
- A Campaign victory earns one token, plus one more when the final differential is positive.

## 5. Data contract

```ts
type CampaignModeId =
  | 'standard'
  | 'limited_reserves'
  | 'fog_of_war'
  | 'total_war';

type CampaignModifierId = Exclude<CampaignModeId, 'standard'>;

interface ActiveCampaign {
  readonly campaignId: string;
  readonly mode: CampaignModeId;
  readonly modifiers: readonly CampaignModifierId[];
  readonly ordersSelected: boolean;
  readonly wars: readonly CampaignWarRecord[];
  readonly commanderSchedule: CampaignCommanderSchedule;
  readonly limitedReserves?: LimitedReservesCampaignState;
}
```

The progression schema is version 3. Modifier arrays are normalized to the canonical order `limited_reserves`, `fog_of_war`, `total_war` and deduplicated.

Mechanics must consult `modifiers`, not infer rules from `mode`. Chapter and narrative systems may continue to consult `mode`.

## 6. Save migration

- Existing in-progress Campaigns without a stored modifier array retain the former single rule represented by their `mode` until that Campaign ends.
- Their Campaign ID, recorded Wars, commander schedule, processed War IDs, and remaining reserves are preserved.
- After that Campaign ends, routing selects the first unfinished scripted Chapter; that Chapter receives its new cumulative stack.
- Existing schema-v1 profiles retain their previously granted Chapter access, but an unfinished story still proceeds from its current Chapter.
- A completed story migrates to the custom Campaign flow.
- Normalization is idempotent and never rerolls an active commander schedule.

## 7. Presentation surfaces

- Campaign Orders shows one mandatory locked order during the story and three independent checkbox-style modifiers afterward.
- The Profile dialog reports the active rule stack rather than treating Chapter identity as the only rule.
- Limited Reserves shows its remaining pool on the player seat.
- Total War shows running Campaign differential.
- Fog changes access at the Boneyard, Chronicle, and Hall of Valor instead of adding a redundant seat badge.

## 8. Telemetry

Gameplay telemetry schema version 2 includes both:

- `campaign_mode`: the story Chapter identity, or `standard` for custom Campaigns.
- `campaign_modifiers`: `none` or the canonical modifier IDs joined with `+`.

Both fields are scalar and low-cardinality. All events remain within the 25-parameter GA4 limit, and Fog redaction is driven by the modifier stack with a legacy mode fallback.
