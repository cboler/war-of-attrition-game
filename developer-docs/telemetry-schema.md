# Gameplay and UI engagement telemetry

Status: gameplay schema version `2`, UI engagement schema version `1`, ruleset version `2026.09.1`.

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

Every canonical gameplay record contains:

`schema_version`, `ruleset_version`, `app_version`, `war_id`, `campaign_id`, `campaign_war_index`, `campaign_mode`, `campaign_modifiers`, `commander_id` (when present), and `event_seq`.

Game-bus records also include `turn_number`. Strings are capped at 100 characters, names/keys follow GA4 naming limits, non-finite values are rejected, and no more than 25 parameters are transmitted per event. Do not register high-cardinality War/Campaign IDs as GA custom dimensions; retain them for BigQuery analysis.

`campaign_mode` identifies the authored story Chapter during the scripted traversal and is `standard` for post-story custom Campaigns. `campaign_modifiers` is `none` or a canonical `+`-joined scalar such as `limited_reserves+fog_of_war`. Gameplay and Fog-redaction policy use the modifier stack; the mode remains available for Chapter-level analysis.

Current event names:

- `war_started`, `turn_started`, `war_resolved`, `war_abandoned`
- `comparison_resolved`
- `reinforcement_offered`, `reinforcement_decision`, `reinforcement_resolved`
- `battle_started`, `battle_layer_added`, `battle_target_selected`, `battle_continues`, `battle_resolved`
- `card_eliminated`, `cards_returned`, `cards_sent_to_boneyard`, `settlement_resolved`
- `reaction_spoken`
- `achievement_unlocked`, `campaign_resolved`, `cosmetic_unlocked`

The mapper intentionally ignores presentation-complete events and all free-text dialogue. It retains only enumerated reaction categories. Reinforcement events now expose the original beaten card, Battle events use the authoritative public selection DTO, and `settlement_resolved` plus public casualty events provide source/decisive-card causality without serializing hidden Battle layers or unrevealed casualty identities.

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

## Release SDK & Closed-Testing Status

The Android wrapper contains no advertising dependency, application metadata, unit identifiers, runtime bridge, or feature flag. Test and production builds cannot initialize or request ads. Google Analytics remains a separate, optional, consent-gated telemetry integration and is not used for advertising.
