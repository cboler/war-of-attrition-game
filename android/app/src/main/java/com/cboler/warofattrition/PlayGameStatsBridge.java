package com.cboler.warofattrition;

import android.app.Activity;
import android.util.Log;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.GameStatsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.playergameevent.PlayerGameEvent;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Native bridge handling Play Games Services Game Stats v1 integration.
 * Validates the 19 declared properties strictly before emitting PlayerGameEvent.
 */
public class PlayGameStatsBridge {
    private static final String TAG = "PlayGameStatsBridge";
    private static final String PROTOCOL_VERSION = "v1";
    private static final String EVENT_NAME_WAR_COMPLETED = "war_completed";
    private static final int MAX_DEDUP_CACHE_SIZE = 100;

    private static final Set<String> VALID_COMMANDER_IDS = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "quartermaster", "gambler", "analyst", "attritionist", "cornered-general"
    )));

    private static final Set<String> VALID_CAMPAIGN_KINDS = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "story", "custom"
    )));

    private static final Set<String> VALID_CAMPAIGN_MODES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "standard", "limited_reserves", "fog_of_war", "total_war"
    )));

    private static final Set<String> VALID_CAMPAIGN_MODIFIER_STACKS = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "none",
        "limited_reserves",
        "fog_of_war",
        "total_war",
        "limited_reserves+fog_of_war",
        "limited_reserves+total_war",
        "fog_of_war+total_war",
        "limited_reserves+fog_of_war+total_war"
    )));

    private static final Set<String> VALID_OUTCOMES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "player_win", "opponent_win", "tie"
    )));

    private static final Set<String> KNOWN_PROPERTY_NAMES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
        "stats_schema_version",
        "ruleset_version",
        "app_version",
        "commander_id",
        "campaign_kind",
        "campaign_mode",
        "campaign_modifiers",
        "campaign_war_index",
        "outcome",
        "player_win",
        "turns",
        "comeback_deficit",
        "battles",
        "deepest_battle",
        "reinforcements_sent",
        "successful_reinforcements",
        "aces_felled_by_twos",
        "war_margin",
        "reserves_at_war_start"
    )));

    private final Activity activity;
    private GameStatsClient gameStatsClient;
    private boolean isInitialized = false;
    private boolean isSignedIn = false;
    private final Set<String> recordedWarIds = new LinkedHashSet<>();

    public interface BridgeResponseCallback {
        void sendResponse(String jsonMessage);
    }

    private BridgeResponseCallback responseCallback;

    public PlayGameStatsBridge(Activity activity) {
        this.activity = activity;
    }

    public void setResponseCallback(BridgeResponseCallback callback) {
        this.responseCallback = callback;
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public boolean isSignedIn() {
        return isSignedIn;
    }

    public boolean canRecord() {
        return isInitialized && isSignedIn && gameStatsClient != null;
    }

    public void initialize() {
        try {
            PlayGamesSdk.initialize(activity);
            GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
            signInClient.isAuthenticated().addOnCompleteListener(task -> {
                boolean authenticated = task.isSuccessful() && task.getResult().isAuthenticated();
                this.isInitialized = true;
                this.isSignedIn = authenticated;
                if (authenticated) {
                    this.gameStatsClient = PlayGames.getGameStatsClient(activity);
                }
                sendStateToWeb();
            });
        } catch (Exception e) {
            Log.w(TAG, "Play Games SDK initialization failed: " + e.getMessage());
            this.isInitialized = false;
            this.isSignedIn = false;
            sendStateToWeb();
        }
    }

    public void handleWebMessage(String jsonPayload) {
        if (jsonPayload == null || jsonPayload.trim().isEmpty()) {
            return;
        }

        try {
            JSONObject obj = new JSONObject(jsonPayload);
            String version = obj.optString("version", "");
            if (!PROTOCOL_VERSION.equals(version)) {
                Log.w(TAG, "Rejected bridge message with unsupported version: " + version);
                return;
            }

            String type = obj.optString("type", "");
            switch (type) {
                case "GAME_STATS_INIT":
                    if (!isInitialized) {
                        initialize();
                    } else {
                        sendStateToWeb();
                    }
                    break;

                case "RECORD_GAME_STATS":
                    handleRecordGameStats(obj);
                    break;

                default:
                    Log.w(TAG, "Unhandled Game Stats bridge message type: " + type);
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling bridge message: " + e.getMessage());
        }
    }

    private void handleRecordGameStats(JSONObject request) {
        String warId = request.optString("warId", "");
        if (warId.isEmpty()) {
            sendRejected("", "missing_war_id");
            return;
        }

        // Check duplicate guard
        synchronized (recordedWarIds) {
            if (recordedWarIds.contains(warId)) {
                Log.d(TAG, "Duplicate warId already recorded: " + warId);
                sendBuffered(warId);
                return;
            }
        }

        JSONObject payload = request.optJSONObject("payload");
        if (payload == null) {
            sendRejected(warId, "missing_payload");
            return;
        }

        ValidationResult validation = validatePayload(payload);
        if (!validation.isValid) {
            Log.w(TAG, "Validation failed for war " + warId + ": " + validation.errorMessage);
            sendRejected(warId, validation.errorMessage);
            return;
        }

        if (!canRecord()) {
            sendRejected(warId, "not_signed_in");
            return;
        }

        try {
            PlayerGameEvent.Builder builder = new PlayerGameEvent.Builder(EVENT_NAME_WAR_COMPLETED);

            // Add string properties
            builder.addProperty("ruleset_version", payload.getString("ruleset_version"));
            builder.addProperty("app_version", payload.getString("app_version"));
            builder.addProperty("commander_id", payload.getString("commander_id"));
            builder.addProperty("campaign_kind", payload.getString("campaign_kind"));
            builder.addProperty("campaign_mode", payload.getString("campaign_mode"));
            builder.addProperty("campaign_modifiers", payload.getString("campaign_modifiers"));
            builder.addProperty("outcome", payload.getString("outcome"));

            // Add numeric properties
            builder.addProperty("stats_schema_version", (long) payload.getInt("stats_schema_version"));
            builder.addProperty("campaign_war_index", (long) payload.getInt("campaign_war_index"));
            builder.addProperty("player_win", (long) payload.getInt("player_win"));
            builder.addProperty("turns", (long) payload.getInt("turns"));
            builder.addProperty("comeback_deficit", (long) payload.getInt("comeback_deficit"));
            builder.addProperty("battles", (long) payload.getInt("battles"));
            builder.addProperty("deepest_battle", (long) payload.getInt("deepest_battle"));
            builder.addProperty("reinforcements_sent", (long) payload.getInt("reinforcements_sent"));
            builder.addProperty("successful_reinforcements", (long) payload.getInt("successful_reinforcements"));
            builder.addProperty("aces_felled_by_twos", (long) payload.getInt("aces_felled_by_twos"));
            builder.addProperty("war_margin", (long) payload.getInt("war_margin"));

            // Add conditional reserves_at_war_start if present
            if (payload.has("reserves_at_war_start") && !payload.isNull("reserves_at_war_start")) {
                builder.addProperty("reserves_at_war_start", (long) payload.getInt("reserves_at_war_start"));
            }

            gameStatsClient.recordEvent(builder.build());
            gameStatsClient.requestEventsUpload();

            synchronized (recordedWarIds) {
                if (recordedWarIds.size() >= MAX_DEDUP_CACHE_SIZE) {
                    Iterator<String> it = recordedWarIds.iterator();
                    if (it.hasNext()) {
                        it.next();
                        it.remove();
                    }
                }
                recordedWarIds.add(warId);
            }

            sendBuffered(warId);
        } catch (Exception e) {
            Log.e(TAG, "Failed to record PlayerGameEvent for war " + warId + ": " + e.getMessage());
            sendRejected(warId, "record_event_failed");
        }
    }

    public static class ValidationResult {
        public final boolean isValid;
        public final String errorMessage;

        public ValidationResult(boolean isValid, String errorMessage) {
            this.isValid = isValid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, message);
        }
    }

    public static ValidationResult validatePayload(JSONObject p) {
        if (p == null) {
            return ValidationResult.invalid("Payload cannot be null");
        }

        // Whitelist check
        Iterator<String> keys = p.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            if (!KNOWN_PROPERTY_NAMES.contains(key)) {
                return ValidationResult.invalid("Unknown property: " + key);
            }
        }

        try {
            // stats_schema_version == 1
            if (!p.has("stats_schema_version") || p.getInt("stats_schema_version") != 1) {
                return ValidationResult.invalid("stats_schema_version must be 1");
            }

            // ruleset_version
            String rulesetVersion = p.optString("ruleset_version", "");
            if (rulesetVersion.isEmpty()) {
                return ValidationResult.invalid("ruleset_version is required");
            }

            // app_version
            String appVersion = p.optString("app_version", "");
            if (appVersion.isEmpty()) {
                return ValidationResult.invalid("app_version is required");
            }

            // commander_id
            String commanderId = p.optString("commander_id", "");
            if (!VALID_COMMANDER_IDS.contains(commanderId)) {
                return ValidationResult.invalid("Invalid commander_id: " + commanderId);
            }

            // campaign_kind
            String campaignKind = p.optString("campaign_kind", "");
            if (!VALID_CAMPAIGN_KINDS.contains(campaignKind)) {
                return ValidationResult.invalid("Invalid campaign_kind: " + campaignKind);
            }

            // campaign_mode
            String campaignMode = p.optString("campaign_mode", "");
            if (!VALID_CAMPAIGN_MODES.contains(campaignMode)) {
                return ValidationResult.invalid("Invalid campaign_mode: " + campaignMode);
            }

            // campaign_modifiers
            String modifiers = p.optString("campaign_modifiers", "");
            if (!VALID_CAMPAIGN_MODIFIER_STACKS.contains(modifiers)) {
                return ValidationResult.invalid("Invalid campaign_modifiers: " + modifiers);
            }

            // campaign_war_index: 1..3
            int warIndex = p.getInt("campaign_war_index");
            if (warIndex < 1 || warIndex > 3) {
                return ValidationResult.invalid("campaign_war_index must be 1..3");
            }

            // outcome
            String outcome = p.optString("outcome", "");
            if (!VALID_OUTCOMES.contains(outcome)) {
                return ValidationResult.invalid("Invalid outcome: " + outcome);
            }

            // player_win: 1 if player_win, 0 otherwise
            int playerWin = p.getInt("player_win");
            if ("player_win".equals(outcome)) {
                if (playerWin != 1) return ValidationResult.invalid("player_win must be 1 for player_win outcome");
            } else {
                if (playerWin != 0) return ValidationResult.invalid("player_win must be 0 for opponent_win or tie");
            }

            // turns: 1..51
            int turns = p.getInt("turns");
            if (turns < 1 || turns > 51) {
                return ValidationResult.invalid("turns must be 1..51");
            }

            // comeback_deficit: >= 0
            int comebackDeficit = p.getInt("comeback_deficit");
            if (comebackDeficit < 0) {
                return ValidationResult.invalid("comeback_deficit must be >= 0");
            }

            // battles: 0..51, <= turns
            int battles = p.getInt("battles");
            if (battles < 0 || battles > 51 || battles > turns) {
                return ValidationResult.invalid("battles must be 0..51 and <= turns");
            }

            // deepest_battle: 0..8
            int deepestBattle = p.getInt("deepest_battle");
            if (deepestBattle < 0 || deepestBattle > 8) {
                return ValidationResult.invalid("deepest_battle must be 0..8");
            }

            // reinforcements_sent: 0..51, <= turns
            int reinforcementsSent = p.getInt("reinforcements_sent");
            if (reinforcementsSent < 0 || reinforcementsSent > 51 || reinforcementsSent > turns) {
                return ValidationResult.invalid("reinforcements_sent must be 0..51 and <= turns");
            }

            // successful_reinforcements: 0..reinforcements_sent
            int successfulReinforcements = p.getInt("successful_reinforcements");
            if (successfulReinforcements < 0 || successfulReinforcements > reinforcementsSent) {
                return ValidationResult.invalid("successful_reinforcements must be 0..reinforcements_sent");
            }

            // aces_felled_by_twos: 0..2
            int acesFelled = p.getInt("aces_felled_by_twos");
            if (acesFelled < 0 || acesFelled > 2) {
                return ValidationResult.invalid("aces_felled_by_twos must be 0..2");
            }

            // war_margin sign checks
            int warMargin = p.getInt("war_margin");
            if ("player_win".equals(outcome)) {
                if (warMargin <= 0) return ValidationResult.invalid("war_margin must be > 0 for player_win");
            } else if ("opponent_win".equals(outcome)) {
                if (warMargin >= 0) return ValidationResult.invalid("war_margin must be < 0 for opponent_win");
            } else {
                if (warMargin != 0) return ValidationResult.invalid("war_margin must be 0 for tie");
            }

            // Conditional reserves_at_war_start check
            boolean hasLimitedReserves = modifiers.contains("limited_reserves");
            boolean hasReservesProperty = p.has("reserves_at_war_start") && !p.isNull("reserves_at_war_start");

            if (hasLimitedReserves) {
                if (!hasReservesProperty) {
                    return ValidationResult.invalid("reserves_at_war_start is required when limited_reserves modifier is active");
                }
                int reserves = p.getInt("reserves_at_war_start");
                if (reserves < 0) {
                    return ValidationResult.invalid("reserves_at_war_start must be >= 0");
                }
            } else {
                if (hasReservesProperty) {
                    return ValidationResult.invalid("reserves_at_war_start must not be present when limited_reserves modifier is absent");
                }
            }

            return ValidationResult.valid();
        } catch (Exception e) {
            return ValidationResult.invalid("Malformed property type or missing required field: " + e.getMessage());
        }
    }

    private void sendStateToWeb() {
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", "GAME_STATS_READY");
            res.put("available", isInitialized);
            res.put("signedIn", isSignedIn);
            sendResponse(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Failed to send state: " + e.getMessage());
        }
    }

    private void sendBuffered(String warId) {
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", "GAME_STATS_BUFFERED");
            res.put("warId", warId);
            sendResponse(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Failed to send buffered receipt: " + e.getMessage());
        }
    }

    private void sendRejected(String warId, String reason) {
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", "GAME_STATS_REJECTED");
            res.put("warId", warId);
            res.put("reason", reason);
            sendResponse(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Failed to send rejected receipt: " + e.getMessage());
        }
    }

    private void sendResponse(String jsonMessage) {
        if (responseCallback != null) {
            responseCallback.sendResponse(jsonMessage);
        }
    }
}
