# Gameplay telemetry schema and owner setup

Status: schema version `1`, ruleset version `2026.08.2`.

Gameplay telemetry is implemented behind `GameTelemetryService`. The service consumes the typed `GameEventBusService` and profile-progression events, maps them through an explicit scalar whitelist, and sends them through the replaceable `TelemetryTransport` interface. There are no direct analytics calls in gameplay controllers.

## Privacy and delivery behavior

- Collection is a no-op unless `GA4_MEASUREMENT_ID` is a valid `G-...` value **and** the player explicitly selects `granted` through the Settings privacy controls.
- The GA script is loaded dynamically only after those conditions are true. Automatic page views, Google signals, ad storage, and ad personalization are disabled by the transport.
- Events dropped while configuration or consent is absent are not queued or replayed.
- A grant made during an active War takes effect at the next War boundary, ensuring every collected War has its canonical start record. Denial/withdrawal takes effect immediately and propagates `analytics_storage: denied` to an already-loaded Google tag; all advertising consent signals remain denied.
- No raw telemetry history is stored with resettable profile statistics or in local storage.
- Never send names, email addresses, Google subject/profile IDs, avatar URLs, dialogue text, or hidden card identities. The mapper emits random War/Campaign IDs and public game-card identities only.
- `Reset Stats` does not affect remote telemetry or cause old events to be resent. Full local deletion resets the saved consent choice but cannot retract events already transmitted to Google.

## Build configuration

`scripts/set-env.js` accepts:

| Environment variable | Purpose |
| --- | --- |
| `GA4_MEASUREMENT_ID` | Public GA4 web-stream measurement ID; empty means no-op. |
| `APP_VERSION` | Canonical deployed app version included in each record. |
| `RULESET_VERSION` | Queryable rules version; defaults to `2026.08.2`. |
| `GOOGLE_CLIENT_ID` | Existing Google Identity configuration; never included in telemetry. |

A measurement ID is public client configuration, not an API credential. Do not add a Google service-account key, Analytics Admin credential, BigQuery key, or other secret to the web bundle.

## Common event parameters

Every canonical gameplay record contains:

`schema_version`, `ruleset_version`, `app_version`, `war_id`, `campaign_id`, `campaign_war_index`, `commander_id` (when present), and `event_seq`.

Game-bus records also include `turn_number`. Strings are capped at 100 characters, names/keys follow GA4 naming limits, non-finite values are rejected, and no more than 25 parameters are transmitted per event. Do not register high-cardinality War/Campaign IDs as GA custom dimensions; retain them for BigQuery analysis.

Current event names:

- `war_started`, `turn_started`, `war_resolved`, `war_abandoned`
- `comparison_resolved`
- `reinforcement_offered`, `reinforcement_decision`, `reinforcement_resolved`
- `battle_started`, `battle_layer_added`, `battle_target_selected`, `battle_continues`, `battle_resolved`
- `card_eliminated`, `cards_returned`, `cards_sent_to_boneyard`, `settlement_resolved`
- `reaction_spoken`
- `achievement_unlocked`, `campaign_resolved`, `cosmetic_unlocked`

The mapper intentionally ignores presentation-complete events and all free-text dialogue. It retains only enumerated reaction categories. Reinforcement events now expose the original beaten card, Battle events use the authoritative public selection DTO, and `settlement_resolved` plus public casualty events provide source/decisive-card causality without serializing hidden Battle layers or unrevealed casualty identities.

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
2. Validate the implemented explicit grant/deny/withdraw Settings flow against applicable policy/legal requirements before configuring `GA4_MEASUREMENT_ID` in deployment.
3. Configure only low-cardinality GA custom definitions such as outcome, deck color, comparison stage, special rule, and unlock reason.
4. In GA4 Admin, link the property to the correct BigQuery project and choose the data location and daily/streaming export options. This is a console operation and requires no client credential.
5. Validate consent behavior and event parameters in GA4 DebugView, then verify `events_YYYYMMDD` / `events_intraday_YYYYMMDD` exports and retention settings.

Official references: [GA4 event collection](https://developers.google.com/analytics/devguides/collection/ga4/events), [collection limits](https://support.google.com/analytics/answer/9267744), [Google tag privacy controls](https://developers.google.com/tag-platform/security/guides/privacy), [consent mode concepts](https://developers.google.com/tag-platform/security/concepts/consent-mode), [PII policy](https://support.google.com/analytics/answer/6366371), [Analytics data deletion requests](https://support.google.com/analytics/answer/9940393), [BigQuery linking](https://support.google.com/analytics/answer/9823238), and [BigQuery export schema](https://support.google.com/analytics/answer/7029846).

## Release SDK & Closed-Testing Status

The Android wrapper contains no advertising dependency, application metadata, unit identifiers, runtime bridge, or feature flag. Test and production builds cannot initialize or request ads. Google Analytics remains a separate, optional, consent-gated telemetry integration and is not used for advertising.
