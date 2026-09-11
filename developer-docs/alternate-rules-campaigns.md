# Alternate Rules Campaigns

Status: Implemented. The first story traversal is a mandatory four-Chapter sequence with cumulative rules. Completing Chapter IV unlocks configurable custom Campaigns.

## 1. Campaign structure

Every Campaign contains three Wars. The authored Story Campaign and Custom Campaigns serve distinct purposes:

- **Campaign**: Authored progression with predetermined rules, scripted commander schedules, and narrative progression across Chapters I–IV.
- **Custom Campaign**: Player-selected combination of available rules and independent opponent selection over Classic play, unlocked after completing Chapter IV.

The Chapter identity and active mechanical modifiers are separate concepts:

- `mode` identifies the authored story Chapter and routes its commander schedule and narrative.
- `modifiers` identifies the rules currently applied by gameplay.
- Story Chapters prescribe their predetermined modifier stack and do not allow player modification.
- Custom Campaigns use the neutral `standard` narrative identity and allow each mechanical rule to be toggled independently, with independent opponent selection.

This separation ensures custom rule combinations never interfere with the authored story progression.

## 2. Mandatory first traversal

Completing a Chapter, regardless of victory, defeat, or draw, advances to the next Chapter. Players cannot replay an earlier Chapter or alter its rules until the full story is complete.

| Chapter | Story ID | Mandatory modifiers | Authored commanders |
| --- | --- | --- | --- |
| I: The Accord | `standard` | None | Marcel, Matthias, Bastien |
| II: The Closing Passes | `limited_reserves` | Limited Reserves | Edmund, Lorenzo, Marcel |
| III: The Blind Wheel | `fog_of_war` | Limited Reserves + Fog of War | Matthias, Marcel, Bastien |
| IV: The War of Attrition | `total_war` | Limited Reserves + Fog of War + Total War | Edmund, Lorenzo, Matthias |

Campaign Orders displays the next Chapter and its complete stack as locked Story Orders. The stack remains fixed for all three Wars.

### Invariants & Protection
- **Pristine and Reset Profiles**: A fresh profile, clean career reset, or full local deletion always initializes at Chapter I / `standard` with empty `completedChapterModes`, unselected orders, zero wars, and the authored Chapter I schedule (`quartermaster` → `analyst` → `attritionist`).
- **Schedule Integrity**: Opposing commander selection is strictly locked during the scripted traversal. Even if an accidental caller passes a custom commander ID to `selectCampaignOrders`, or if legacy storage retains a 3-same-commander schedule, the service layer rejects the override and enforces `getAuthoredCommanderSchedule(mode)`.
- **Abandonment**: Abandoning a scripted Campaign always restores the current Chapter's authored schedule and scripted modifier stack, preventing accidental retention of Custom Campaign state.
- **Conservative Migration**: Normalization never resurrects `completedChapterModes` from `recentCampaigns` if `completedChapterModes` was explicitly cleared. Legacy saves without the explicit field count only genuine recorded victories (`outcome === 'victory'`).

Narrative dialogue authored for the current Chapter is guaranteed the first time its eligible event occurs during this traversal. Once that Chapter is complete, replay and procedural chatter return to their lower probabilistic frequency.

## 3. Custom Campaigns

After Chapter IV, Field Command Briefing functions as a manual game rules configuration interface rather than a mission or chapter preset selector. The player sets the rules before cards are dealt:

- **Opposing Force**: Independent from rules. The player can view and change the opposing commander from the roster of 5 permanent commanders. The chosen commander commands the opposing force across all three Wars of the custom Campaign.
- **Rules of Engagement**: The player may independently enable or disable:
  - **Limited Reserves**: Restricts reinforcement availability across the Three-War Campaign (5 reserve pool).
  - **Fog of War**: Conceals information that would normally be inspectable during a War (seals Boneyard, casualty details, and Hall of Valor records).
  - **Campaign Differential** (`total_war`): Each War's signed card margin contributes to the final Campaign result.

Any combination is valid, including no modifiers (pure Classic rules), any single modifier, any pair, or all three. Options are independent rules of engagement—not progressive chapters—and do not imply chronological order or prerequisite rules.

A concise configuration summary is displayed before confirming with "Issue Orders & Engage". The selected stack is immutable once War 1 begins. A completed custom Campaign carries its selected stack into the next briefing as the default, where it can be adjusted before play.

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

- Campaign Orders / Field Command Briefing shows one mandatory locked story order during the authored campaign, and a full rules configurator (opposing force selector, three independent rules-of-engagement toggles, and configuration summary) in Custom Campaigns.
- The Profile dialog reports the active rule stack rather than treating Chapter identity as the only rule.
- Limited Reserves shows its remaining pool on the player seat.
- Campaign Differential (Total War) shows running Campaign differential.
- Fog of War changes access at the Boneyard, Chronicle, and Hall of Valor instead of adding a redundant seat badge.

## 8. Telemetry

Gameplay telemetry schema version 2 includes both:

- `campaign_mode`: the story Chapter identity, or `standard` for custom Campaigns.
- `campaign_modifiers`: `none` or the canonical modifier IDs joined with `+`.

Both fields are scalar and low-cardinality. All events remain within the 25-parameter GA4 limit, and Fog redaction is driven by the modifier stack with a legacy mode fallback.

## 9. Event & Achievement Tiering

To maintain a clean and sustainable balance between player milestones, narrative immersion, and achievement catalog stability, gameplay events are classified across three distinct tiers:

1. **Permanent Achievements** (`permanent_achievement`):
   - Canonical, collectible milestones with permanent internal IDs and mapped Google Play Games achievements.
   - Earned once per profile career; displayed in the Achievements tab and profile showcases.
   - Examples: `war.comeback`, `chapter.one`, `veteran`, `centurion`.
   - New gameplay events must **not** automatically become permanent achievements.

2. **Significant Events** (`significant_event`):
   - Unusual, memorable, and repeatable tactical feats worthy of acknowledgment in the Chronicle/StoryBook and distinct commander dialogue, but intentionally kept out of the permanent achievement catalog.
   - Examples: `double_two_lost` (capturing both opposing 2 cards during a single challenge clash or among battle casualties), `valor_citation_awarded` (Juggernaut citations), `war.wrong_tool_for_job` (observed rarity events).
   - Presentation: Commander-specific reaction line (with suppression of generic single-loss dialogue) and expressive Chronicle log entries.

3. **Ambient Reactions** (`ambient_reaction`):
   - Frequent or situational battlefield occurrences that bring opposing commander personalities to life without creating permanent or historical journal entries.
   - Examples: ordinary clash quips, single-card elimination reactions, introduction lines, and general battle aftermath dialogue.

