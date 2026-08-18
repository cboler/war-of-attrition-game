package com.cboler.warofattrition;

import android.app.Activity;
import android.util.Log;
import com.google.android.gms.games.AchievementsClient;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import org.json.JSONObject;

/**
 * Encapsulates Google Play Games Services v2 integration and handles Web ↔ Native achievement commands.
 */
public class PlayGamesBridge {
    private static final String TAG = "PlayGamesBridge";
    private static final String PROTOCOL_VERSION = "v1";
    private static final int RC_ACHIEVEMENT_UI = 9003;

    private final Activity activity;
    private AchievementsClient achievementsClient;
    private boolean isInitialized = false;
    private boolean isSignedIn = false;

    public interface BridgeResponseCallback {
        void sendResponse(String jsonMessage);
    }

    private BridgeResponseCallback responseCallback;

    public PlayGamesBridge(Activity activity) {
        this.activity = activity;
    }

    public void setResponseCallback(BridgeResponseCallback callback) {
        this.responseCallback = callback;
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
                    this.achievementsClient = PlayGames.getAchievementsClient(activity);
                    sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                } else {
                    sendToWeb("PLAY_GAMES_READY", null, null, null);
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "Play Games SDK initialization failed: " + e.getMessage());
            this.isInitialized = false;
            sendToWeb("PLAY_GAMES_UNAVAILABLE", null, null, e.getMessage());
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
                case "PLAY_GAMES_INIT":
                    if (!isInitialized) {
                        initialize();
                    } else if (isSignedIn) {
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                    } else {
                        sendToWeb("PLAY_GAMES_READY", null, null, null);
                    }
                    break;

                case "PLAY_GAMES_SIGN_IN":
                    requestSignIn();
                    break;

                case "UNLOCK_ACHIEVEMENT":
                    String internalId = obj.optString("internalAchievementId", "");
                    String playGamesId = obj.optString("playGamesAchievementId", "");
                    unlockAchievement(internalId, playGamesId);
                    break;

                case "SET_ACHIEVEMENT_STEPS":
                    String incInternalId = obj.optString("internalAchievementId", "");
                    String incPlayGamesId = obj.optString("playGamesAchievementId", "");
                    int steps = obj.optInt("currentSteps", 1);
                    setAchievementSteps(incInternalId, incPlayGamesId, steps);
                    break;

                case "SHOW_ACHIEVEMENTS":
                    showAchievements();
                    break;

                default:
                    Log.w(TAG, "Unhandled bridge message type: " + type);
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling bridge message: " + e.getMessage());
        }
    }

    public void requestSignIn() {
        try {
            GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
            signInClient.signIn().addOnCompleteListener(task -> {
                if (task.isSuccessful() && task.getResult().isAuthenticated()) {
                    this.isSignedIn = true;
                    this.achievementsClient = PlayGames.getAchievementsClient(activity);
                    sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                } else {
                    this.isSignedIn = false;
                    sendToWeb("PLAY_GAMES_READY", null, null, null);
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "Sign-in request failed: " + e.getMessage());
        }
    }

    public void unlockAchievement(String internalId, String playGamesId) {
        if (playGamesId == null || playGamesId.isEmpty()) {
            Log.d(TAG, "Missing achievement ID for " + internalId + ", skipping native Google Play call.");
            return;
        }

        if (!isSignedIn) {
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Play Games sign-in required");
            return;
        }

        if (achievementsClient == null) {
            this.achievementsClient = PlayGames.getAchievementsClient(activity);
        }

        try {
            achievementsClient.unlockImmediate(playGamesId).addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    sendToWeb("ACHIEVEMENT_SYNCED", internalId, playGamesId, null);
                } else {
                    String error = task.getException() != null ? task.getException().getMessage() : "Unknown sync error";
                    sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "Failed to unlock achievement: " + e.getMessage());
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, e.getMessage());
        }
    }

    public void setAchievementSteps(String internalId, String playGamesId, int steps) {
        if (playGamesId == null || playGamesId.isEmpty()) {
            return;
        }

        if (!isSignedIn) {
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Play Games sign-in required");
            return;
        }

        if (achievementsClient == null) {
            this.achievementsClient = PlayGames.getAchievementsClient(activity);
        }

        try {
            achievementsClient.setStepsImmediate(playGamesId, steps).addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    sendToWeb("ACHIEVEMENT_SYNCED", internalId, playGamesId, null);
                } else {
                    String error = task.getException() != null ? task.getException().getMessage() : "Unknown set-steps error";
                    sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "Failed to set achievement steps: " + e.getMessage());
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, e.getMessage());
        }
    }

    public void showAchievements() {
        if (!isSignedIn) {
            return;
        }

        if (achievementsClient == null) {
            this.achievementsClient = PlayGames.getAchievementsClient(activity);
        }

        try {
            achievementsClient.getAchievementsIntent().addOnSuccessListener(intent -> {
                activity.startActivityForResult(intent, RC_ACHIEVEMENT_UI);
            }).addOnFailureListener(e -> {
                Log.w(TAG, "Failed to retrieve achievements UI intent: " + e.getMessage());
            });
        } catch (Exception e) {
            Log.w(TAG, "Could not open achievements UI: " + e.getMessage());
        }
    }

    private void sendToWeb(String type, String internalId, String playGamesId, String error) {
        if (responseCallback == null) return;
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", type);
            if (internalId != null) res.put("internalAchievementId", internalId);
            if (playGamesId != null) res.put("playGamesAchievementId", playGamesId);
            if (error != null) res.put("error", error);

            responseCallback.sendResponse(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Failed to format response JSON: " + e.getMessage());
        }
    }
}
