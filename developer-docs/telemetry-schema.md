# Gameplay and UI engagement telemetry

Status: gameplay schema version `3`, UI engagement schema version `1`, ruleset version `2026.09.1`.

Gameplay telemetry is implemented behind `GameTelemetryService`. The service consumes the typed `GameEventBusService` and profile-progression events, maps them through an explicit scalar whitelist, and sends them through the replaceable `TelemetryTransport` interface. There are no direct analytics calls in gameplay controllers.

## Privacy and delivery behavior

- Collection is a no-op unless `GA4_MEASUREMENT_ID` is a valid `G-...` value **and** the player explicitly selects `granted` in the post-War invitation or Settings privacy controls. A new or locally deleted installation is `unknown`, which is off.
- The GA script is loaded dynamically only after those conditions are true. Automatic page views, Google signals, ad storage, and ad personalization are disabled by the transport.
- Events dropped while configuration or consent is absent are not queued or replayed.
- The invitation is offered only after a completed War has reached its settled game-over state and no tutorial prompt is active. It requires an explicit **Share anonymous data** or **No thanks** choice. Displaying the invitation is not measured, and it cannot grant consent by rendering or dismissal.
- A grant made during or after a War takes effect for gameplay at the next War boundary, ensuring every collected War has its canonical start record. UI events begin only with the next intentional surface transition; no pre-consent view is reconstructed. Denial/withdrawal takes effect immediately and propagates `analytics_storage: denied` to an already-loaded Google tag; all advertising consent signals remain denied.
- No raw telemetry history is stored with resettable profile statistics or in local storage.
- Never send names, email addresses, Google subject/profile IDs, avatar URLs, dialogue text, or hidden card identities. The mapper emits random War/Campaign IDs and public game-card identities only.
- `Reset Stats` does not affect remote telemetry or cause old events to be resent. Full local deletion resets the saved consent choice but cannot retract events already transmitted to Google.

## Build configuration

`scripts/set-env.js` accepts:

| Environment variable | Purpose |
| --- | --- |
| `GA4_MEASUREMENT_ID` | Public GA4 web-stream measurement ID; empty means no-op. |
| `APP_VERSION` | Canonical deployed app version included in each record. |
| `RULESET_VERSION` | Queryable rules version; defaults to `2026.09.1`. |
| `GOOGLE_CLIENT_ID` | Existing Google Identity configuration; never included in telemetry. |

A measurement ID is public client configuration, not an API credential. Do not add a Google service-account key, Analytics Admin credential, BigQuery key, or other secret to the web bundle.

## Common event parameters

All ordinary game-bus gameplay records produced by the mapper (`commonParameters`) share a 10-parameter common envelope:

`schema_version`, `ruleset_version`, `app_version`, `war_id`, `campaign_id`, `campaign_war_index`, `campaign_mode`, `campaign_modifiers`, `event_seq`, and `turn_number`.

Strings are capped at 100 characters, names/keys follow GA4 naming limits, non-finite values are rejected, and no more than 25 parameters are transmitted per event. Do not register high-cardinality War/Campaign IDs as GA custom dimensions; retain them for BigQuery analysis.

### `commander_id` placement and parameter budget

`commander_id` is **not** part of the common gameplay envelope and is omitted from ordinary gameplay records (`turn_started`, `comparison_resolved`, `reinforcement_*`, `battle_*`, `card_eliminated`, `settlement_resolved`, `cards_*`, `reaction_spoken`, `achievement_unlocked`).

Instead, `commander_id` is emitted only on explicit War boundary records:

- `war_started`: explicitly populated via `GameTelemetryService.commonEnvelope()`.
- `war_resolved`: explicitly added by `mapGameEventToTelemetry`.
- `war_abandoned`: explicitly added by `mapGameEventToTelemetry`.

Ordinary records retain `war_id`, allowing BigQuery attribution through a normalized join to `war_started` (or terminal records) when that context is trustworthy.

This omission is dictated by GA4 collection constraints: `normalizeTelemetryRecordForGa4` strictly drops any record with more than 25 parameters rather than truncating excess fields. With full card identities present in non-Fog play, several rich gameplay events already reach or approach this limit:

| Record | Parameters | With commander added to common parameters |
| --- | --- | --- |
| Clash `comparison_resolved` | 24 | 25 |
| Battle `comparison_resolved` | 25 | 26 (rejected by transport) |
| `battle_resolved` with selection | 25 | 26 (rejected by transport) |
| `reinforcement_resolved` | 25 | 26 (rejected by transport) |

Documenting that `commander_id` is present on all records is incorrect. Adding `commander_id` to common parameters would push those 25-parameter events over the limit and cause GA4 transport to reject entire records, losing critical causal and join data.

### Scope of War and Campaign identifiers

`war_id` and Campaign context are not universal across all telemetry records:

- **Game-bus gameplay records**: Contain `war_id` and the complete Campaign context (`campaign_id`, `campaign_war_index`, `campaign_mode`, `campaign_modifiers`, `turn_number`).
- **`campaign_resolved`**: Contains Campaign context (`campaign_id`, `campaign_mode`, `campaign_modifiers`, `campaign_war_index` set to `3`) and sets `war_id` to the final War of the Campaign (`campaign.wars[2].warId`). It does **not** carry a single `commander_id` for the Campaign; instead, it emits three indexed commander IDs: `war_1_commander_id`, `war_2_commander_id`, and `war_3_commander_id`.
- **`cosmetic_unlocked`**: A standalone progression event that contains **no** `war_id`, **no** `campaign_id`, **no** `commander_id`, and **no** campaign mode/modifiers. It carries only `schema_version`, `ruleset_version`, `app_version`, `event_seq`, `item_type`, `item_id`, `unlock_reason`, `token_cost`, and `token_balance_after`.

`campaign_mode` identifies the authored story Chapter during the scripted traversal and is `standard` for post-story custom Campaigns. `campaign_modifiers` is `none` or a canonical `+`-joined scalar such as `limited_reserves+fog_of_war`. Gameplay and Fog-redaction policy use the modifier stack; the mode remains available for Chapter-level analysis.

Current event names:

- `war_started`, `turn_started`, `war_resolved`, `war_abandoned`
- `comparison_resolved`
- `reinforcement_offered`, `reinforcement_decision`, `reinforcement_resolved`
- `battle_started`, `battle_layer_added`, `battle_target_selected`, `battle_continues`, `battle_resolved`
- `card_eliminated`, `cards_returned`, `cards_sent_to_boneyard`, `settlement_resolved`
- `reaction_spoken`
- `achievement_unlocked`, `campaign_resolved`, `cosmetic_unlocked`

The mapper intentionally ignores presentation-complete events and all free-text dialogue. It retains only enumerated reaction categories. Reinforcement events expose the original beaten card, Battle events use the authoritative public selection DTO, and `settlement_resolved` plus public casualty events provide source/decisive-card causality without serializing hidden Battle layers or unrevealed casualty identities.

### Reinforcement resolution semantics

From gameplay schema `3`, `reinforcement_resolved` distinguishes the reinforcement comparison from its eventual settlement:

| Comparison | `outcome` | `escalated_to_battle` |
| --- | --- | --- |
| Challenger wins outright | `success` | `0` |
| Challenger loses outright | `failure` | `0` |
| Tie proceeding into Battle | `battle` | `1` |
| Tie immediately resolved by attrition, including a true terminal tie | `tie` | `0` |

`ChallengeResolvedEvent.challengerWon` means an outright comparison win, oriented to `challenger`: `PLAYER_WINS` for the human, `OPPONENT_WINS` for the opponent. `winner` remains the separate turn/attrition winner and can be non-null on a comparison tie. The domain-only `escalatedToBattle` flag comes from the resolver's `nextPhase === BATTLE`; null winner alone cannot distinguish Battle from terminal attrition. No GA4 parameter was added: the existing outcome enum and escalation flag carry this distinction, retaining the rich non-Fog record's 25-parameter budget.

Local successful-challenge counters and rescue credit now use this same direct-win meaning. Two/Ace rescue flags require an outright win; Fog still omits rank-ledger fields. Ties do not produce rescue/failure dialogue, and the Chronicle describes either Battle initiation or the authoritative attrition result. Actual card settlement is unchanged.

### Historical cohorts and versioning

Gameplay schema advances from `2` to `3` for both corrected Orders-boundary attribution and reinforcement outcome semantics. Use `schema_version >= 3` for the corrected cohort. Earlier reinforcement ties could be mislabeled success/failure when attrition chose a winner, or Battle when immediate attrition produced a true tie. Earlier War 1 commander/modifier context may also be stale. Historical events and saved career totals are not rewritten, and no events are replayed.

UI schema remains `1`: UI engagement semantics did not change. Ruleset remains `2026.09.1`: comparison, settlement, Battle mechanics, and AI decisions did not change. This is a recording/interpretation correction, not new gameplay rules. Future Game Stats direct-win definitions now align with newly recorded local and GA4 reinforcement successes; do not compare unqualified historical cohorts.

## UI engagement telemetry

`UiTelemetryService` is a separate typed facade over the same consent service, environment configuration, record validation, and `TelemetryTransport` used by gameplay. The additive UI schema does not change gameplay event names or gameplay schema version.

The only UI event names are:

- `surface_opened`: an intentional entry into a tracked semantic surface or subview.
- `surface_engaged`: the corresponding conclusion, with a coarse `duration_bucket`.

Every UI record contains `ui_schema_version`, `app_version`, `ui_session_id`, `ui_event_seq`, and `surface`. Depending on the view, it may also contain only the applicable whitelisted fields: `subsurface`, `source_surface`, `commander_id`, `rule_id`, `chronicle_entry`, `manual_entry_type`, and `duration_bucket`. Empty or unrelated fields are omitted.

Tracked surfaces and current subviews are:

| Surface | Meaningful subviews/context |
| --- | --- |
| `table` | One component-lifecycle visit; gameplay events remain authoritative for play. |
| `field_manual` | Drawer lifetime plus `hall_of_valor`, `commander_dossier`, and `card_reference` subviews. Card Reference deliberately sends no card identity. |
| `chronicle` | Chronicle tab lifetime. Expanding an available Combat Math entry starts an `entry_detail` view identified only by its stable entry-type enumeration in `chronicle_entry`, never prose or rendered labels. |
| `rules` | Rules tab lifetime and `rule_demo` views with an enumerated `rule_id`. |
| `profile` | Dialog lifetime and the `career_records` subview. |
| `achievements` | Achievements tab lifetime. Existing `achievement_unlocked` gameplay/progression records are unchanged. |
| `settings` | Profile Settings tab or the legacy routed Settings component. |

Commander dossiers may include only the public enumerated `commander_id`. Rule identifiers are limited to the rule-demo enumeration. UI telemetry never includes names, emails, Google/profile IDs, avatars, story or dossier text, arbitrary labels, URLs/query strings, hidden cards, unrevealed state, or user-entered values. Feature components call the typed UI facade and contain no GA-specific calls.

Durations are calculated in memory and transmitted only as:

- `lt_10s`: less than 10 seconds
- `10_30s`: at least 10 and less than 30 seconds
- `30_60s`: at least 30 and less than 60 seconds
- `1_3m`: at least 1 and less than 3 minutes
- `3m_plus`: at least 3 minutes

There is no heartbeat. When the document becomes hidden/backgrounded, all active surfaces are finalized at that point and are not automatically resumed. Route changes, tab changes, component destruction, and detail closure also conclude the applicable view. A long Chronicle or Field Manual view means the surface remained actively visible for that duration bucket. It is evidence of engagement, not proof that the content was read.

`ui_session_id` is random, generated lazily after consent, retained only in memory for the current app instance, and never tied to a profile or persisted. `ui_event_seq` orders UI records within that ephemeral session. Both are BigQuery-only analysis fields and must not be registered as GA4 custom dimensions. GA4/BigQuery's consented session fields can support aggregate same-session comparison between gameplay and UI events; Attrition does not add a persistent application user ID or fingerprint for cross-session analysis.

Recommended low-cardinality GA4 custom definitions are `surface`, `subsurface`, `source_surface`, `duration_bucket`, `manual_entry_type`, and (if needed) enumerated `rule_id` / `commander_id`. Keep `ui_session_id`, `ui_event_seq`, and any content-entry identifiers in BigQuery only.

## Abandonment and interruption state machine

- `war_abandoned` means an explicit player Restart/Abandon action while a War is unresolved. It records the destructive action separately from the last meaningful gameplay decision.
- A single visibility/background transition is an **interruption**, never an abandonment. Interruption/resume events are deliberately not emitted until a durable resumable War snapshot and stable War ID can prove that the same War returned.
- **Probable abandonment** is deliberately deferred. It must eventually be a backend/BigQuery classification over an unresolved started War with no resume/resolution after a documented, defensible expiry window and classification version. Never infer it from one `visibilitychange`.

## Controller integration contract

At the authoritative start of each War call:

```ts
telemetry.beginWar({
  warId,
  playerDeckColor,
  startType: 'new'
});
```

Use the same `warId` when recording the resolved War:

```ts
campaignProgression.recordResolvedWar({
  warId,
  outcome,
  playerCardsRemaining,
  opponentCardsRemaining,
  playerDeckColor
});
```

`recordResolvedWar` is idempotent by War ID. The telemetry service is eagerly constructed by the root app because the event bus does not replay old events. It never invents a War from an arbitrary bus event: the controller must call `beginWar` first. Terminal context cleanup is deferred through synchronous nested achievement events and guarded by War ID so an immediate restart cannot close the new War.

### Campaign Orders and the canonical War boundary

The controller owns the boundary for every normal War-creation path. `replaceGame` may prepare the decks before Campaign Orders, but closes the old telemetry context and keeps a pending start. For War 1 with unselected Orders it emits neither canonical telemetry nor the domain `war_started`; player draws are blocked at the controller boundary as well as by the Orders dialog.

After Orders are confirmed, `ensureGameStarted` calls `beginWarWhenOrdersReady`, which freezes the actual commander schedule, Campaign mode and modifier stack once, stores the stable War ID, and emits the domain start. Repeated calls do not restart collection. `playerDrawCard` also checks this boundary, so correctness does not depend on a dialog callback. Already-ordered Campaigns and Wars 2/3 start immediately through the same helper. Restart/Abandon War preserve Orders; Abandon Campaign and starting after Campaign completion wait for fresh Orders.

The pending deck preparation is not yet the collectible War boundary. Consent is evaluated at the one canonical start after Orders lock; grants after that start apply only to the next War, withdrawal remains immediate, and no event is replayed. Finalized modifiers therefore govern Fog redaction from the first collected event. The same War ID is used in start, terminal records and idempotent Campaign progression. Tutorial setup remains available during preparation; introductions and Limited Reserves Chronicle context use finalized Orders.

The pre-schema-3 sequencing defect is historical: start and terminal records could agree on a stale commander/modifier snapshot, so a War-ID join cannot repair those cohorts by itself. The normalized join remains the intended analytics method for correctly captured context. The future [Game Stats design](google-play-game-stats-v1.md) is still unimplemented.

## Future community aggregate contract

The client must never query BigQuery directly. A future thresholded provider may implement:

```ts
interface CommunityStatsProvider {
  getReinforcementStats(input: {
    aggregationVersion: string;
    positionBucket: string;
  }): Promise<null | {
    sampleSize: number;
    reinforcedCount: number;
    reinforceRate: number;
    reinforceWarWinRate: number;
    generatedAt: string;
  }>;
}
```

The input is a documented, non-PII context bucket; output contains anonymous aggregate counts/rates only and returns `null` below a minimum sample/privacy threshold. BigQuery credentials remain backend-only. The UI must render nothing when data is missing or below threshold and must never substitute invented percentages.

## GA4 and BigQuery owner actions

1. Confirm the intended GA4 property and web stream; the former static measurement ID was removed and is **not** assumed to be correct.
2. Validate the implemented post-War invitation and grant/deny/withdraw Settings flow against applicable policy/legal requirements before configuring `GA4_MEASUREMENT_ID` in deployment.
3. Configure only low-cardinality GA custom definitions such as outcome, deck color, comparison stage, special rule, and unlock reason.
4. In GA4 Admin, link the property to the correct BigQuery project and choose the data location and daily/streaming export options. This is a console operation and requires no client credential.
5. Validate consent behavior and event parameters in GA4 DebugView, then verify `events_YYYYMMDD` / `events_intraday_YYYYMMDD` exports and retention settings.

Official references: [GA4 event collection](https://developers.google.com/analytics/devguides/collection/ga4/events), [collection limits](https://support.google.com/analytics/answer/9267744), [Google tag privacy controls](https://developers.google.com/tag-platform/security/guides/privacy), [consent mode concepts](https://developers.google.com/tag-platform/security/concepts/consent-mode), [PII policy](https://support.google.com/analytics/answer/6366371), [Analytics data deletion requests](https://support.google.com/analytics/answer/9940393), [BigQuery linking](https://support.google.com/analytics/answer/9823238), and [BigQuery export schema](https://support.google.com/analytics/answer/7029846).

## Relationship to Google Play Game Stats v1

The Google Play Game Stats v1 integration specified in [google-play-game-stats-v1.md](google-play-game-stats-v1.md) is a separate future contract and data path:

- **Separate schemas**: GA4 is a fine-grained, consent-gated event stream for gameplay analysis (schema version `3`). PGS Game Stats v1 is a career aggregation contract centered on a single self-contained `war_completed` event emitted at War resolution.
- **Commander inclusion**: PGS Game Stats v1 includes `commander_id` directly on every `war_completed` event within Google's 20-property Console limit. GA4 gameplay events omit `commander_id` from ordinary records to respect GA4's 25-parameter cap.
- **Independent lifecycle snapshot**: The proposed PGS Game Stats adapter freezes its rules and commander context on the first `turn_started` event for eligibility and starting-reserve inputs. GA4 now establishes its authoritative context after Campaign Orders lock, before that first turn.
- **Distinct transport and privacy**: GA4 telemetry is transport-gated by web consent and `GA4_MEASUREMENT_ID`. PGS Game Stats uses a native Play Games bridge gated by native account authentication. No analytics identifiers are sent to PGS, and no PGS player identifiers enter GA4.

## Release SDK & Closed-Testing Status

The Android wrapper contains no advertising dependency, application metadata, unit identifiers, runtime bridge, or feature flag. Test and production builds cannot initialize or request ads. Google Analytics remains a separate, optional, consent-gated telemetry integration and is not used for advertising.
