package com.cboler.warofattrition;

import android.app.Activity;
import android.util.Log;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
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

    public boolean isInitialized() {
        return isInitialized;
    }

    public boolean isSignedIn() {
        return isSignedIn;
    }

    /**
     * Categorizes Google Play Services exceptions into actionable diagnostic summaries.
     */
    public static String categorizeException(Throwable t) {
        if (t == null) return "Unknown error";
        if (t instanceof ApiException) {
            int statusCode = ((ApiException) t).getStatusCode();
            switch (statusCode) {
                case CommonStatusCodes.SIGN_IN_REQUIRED:
                    return "Sign-in required (statusCode=" + statusCode + ")";
                case CommonStatusCodes.NETWORK_ERROR:
                    return "Network/transient failure (statusCode=" + statusCode + ")";
                case CommonStatusCodes.DEVELOPER_ERROR:
                    return "Developer/configuration error (statusCode=" + statusCode + " - check package name/SHA-1 in Play Console)";
                case CommonStatusCodes.API_NOT_CONNECTED:
                    return "API unavailable/not connected (statusCode=" + statusCode + ")";
                case CommonStatusCodes.INTERNAL_ERROR:
                    return "Internal Google Play Services error (statusCode=" + statusCode + ")";
                default:
                    return "Play Games API error (statusCode=" + statusCode + ": " + t.getMessage() + ")";
            }
        }
        return t.getClass().getSimpleName() + ": " + t.getMessage();
    }

    public void initialize() {
        Log.i(TAG, "Initializing Google Play Games SDK v2...");
        if (activity == null) {
            Log.w(TAG, "Activity is null; cannot initialize Play Games SDK");
            this.isInitialized = false;
            this.isSignedIn = false;
            sendToWeb("PLAY_GAMES_UNAVAILABLE", null, null, "Activity is null");
            return;
        }

        try {
            PlayGamesSdk.initialize(activity);
            this.isInitialized = true;
            Log.i(TAG, "PlayGamesSdk.initialize() completed successfully. Checking authentication...");
            checkAuthenticationAndReport();
        } catch (Throwable t) {
            String error = categorizeException(t);
            Log.e(TAG, "Play Games SDK initialization failed: " + error, t);
            this.isInitialized = false;
            this.isSignedIn = false;
            sendToWeb("PLAY_GAMES_UNAVAILABLE", null, null, error);
        }
    }

    /**
     * Queries GamesSignInClient.isAuthenticated() to determine current sign-in state.
     */
    public void checkAuthenticationAndReport() {
        if (activity == null) {
            Log.w(TAG, "checkAuthenticationAndReport: Activity is null");
            return;
        }

        try {
            Log.d(TAG, "Checking Play Games authentication status via GamesSignInClient.isAuthenticated()...");
            GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
            signInClient.isAuthenticated().addOnCompleteListener(task -> {
                try {
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    this.isInitialized = true;
                    this.isSignedIn = authenticated;
                    Log.i(TAG, "Play Games isAuthenticated result: " + authenticated + " (task.isSuccessful=" + task.isSuccessful() + ")");
                    if (authenticated) {
                        try {
                            this.achievementsClient = PlayGames.getAchievementsClient(activity);
                        } catch (Throwable t) {
                            Log.w(TAG, "Failed to get achievements client: " + t.getMessage(), t);
                        }
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                    } else {
                        if (!task.isSuccessful() && task.getException() != null) {
                            Log.w(TAG, "isAuthenticated check returned failure: " + categorizeException(task.getException()), task.getException());
                        }
                        sendToWeb("PLAY_GAMES_READY", null, null, null);
                    }
                } catch (Throwable t) {
                    Log.w(TAG, "Error in isAuthenticated completion listener: " + t.getMessage(), t);
                    this.isSignedIn = false;
                    sendToWeb("PLAY_GAMES_READY", null, null, null);
                }
            });
        } catch (Throwable t) {
            Log.w(TAG, "Failed to invoke isAuthenticated(): " + t.getMessage(), t);
            this.isSignedIn = false;
            sendToWeb("PLAY_GAMES_READY", null, null, null);
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
            Log.d(TAG, "Handling web message type: " + type);
            switch (type) {
                case "PLAY_GAMES_INIT":
                    Log.i(TAG, "Received PLAY_GAMES_INIT from web (isInitialized=" + isInitialized + ", isSignedIn=" + isSignedIn + ")");
                    if (!isInitialized) {
                        initialize();
                    } else if (isSignedIn) {
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                    } else {
                        // Re-check isAuthenticated in case automatic background sign-in just finished
                        checkAuthenticationAndReport();
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
            Log.e(TAG, "Error handling bridge message: " + e.getMessage(), e);
        }
    }

    public void requestSignIn() {
        Log.i(TAG, "Explicit Play Games sign-in requested");
        if (activity == null) {
            Log.w(TAG, "Activity is null; cannot request Play Games sign-in");
            return;
        }

        try {
            if (activity instanceof MainActivity) {
                ((MainActivity) activity).setHandlingInternalActivityResult(true);
            }
            GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
            signInClient.signIn().addOnCompleteListener(task -> {
                try {
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    Log.i(TAG, "Play Games signIn result: authenticated=" + authenticated + " (task.isSuccessful=" + task.isSuccessful() + ")");
                    this.isSignedIn = authenticated;
                    if (authenticated) {
                        try {
                            this.achievementsClient = PlayGames.getAchievementsClient(activity);
                        } catch (Throwable t) {
                            Log.w(TAG, "Failed to get achievements client: " + t.getMessage(), t);
                        }
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                    } else {
                        if (!task.isSuccessful() && task.getException() != null) {
                            Log.w(TAG, "signIn task failed: " + categorizeException(task.getException()), task.getException());
                        }
                        sendToWeb("PLAY_GAMES_READY", null, null, null);
                    }
                } catch (Throwable t) {
                    Log.w(TAG, "Error in signIn completion listener: " + t.getMessage(), t);
                    this.isSignedIn = false;
                    sendToWeb("PLAY_GAMES_READY", null, null, null);
                }
            });
        } catch (Throwable t) {
            Log.w(TAG, "Sign-in request failed: " + t.getMessage(), t);
        }
    }

    public void unlockAchievement(String internalId, String playGamesId) {
        if (playGamesId == null || playGamesId.isEmpty()) {
            Log.d(TAG, "Missing achievement ID for " + internalId + ", skipping native Google Play call.");
            return;
        }

        Log.i(TAG, "unlockAchievement requested: " + internalId + " -> " + playGamesId + " (isSignedIn=" + isSignedIn + ")");

        if (!isSignedIn) {
            Log.w(TAG, "unlockAchievement called while not signed in for: " + internalId + ". Checking isAuthenticated before failing...");
            if (activity == null) {
                sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Activity is null");
                return;
            }
            try {
                GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
                signInClient.isAuthenticated().addOnCompleteListener(task -> {
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    if (authenticated) {
                        this.isSignedIn = true;
                        try {
                            this.achievementsClient = PlayGames.getAchievementsClient(activity);
                        } catch (Throwable t) {
                            Log.w(TAG, "Failed to get achievements client: " + t.getMessage(), t);
                        }
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                        executeUnlock(internalId, playGamesId);
                    } else {
                        String err = "Play Games sign-in required";
                        if (!task.isSuccessful() && task.getException() != null) {
                            err += ": " + categorizeException(task.getException());
                        }
                        Log.w(TAG, "unlockAchievement failed: " + err);
                        sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, err);
                    }
                });
            } catch (Throwable t) {
                Log.w(TAG, "Failed checking authentication during unlockAchievement: " + t.getMessage(), t);
                sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Play Games sign-in required");
            }
            return;
        }

        executeUnlock(internalId, playGamesId);
    }

    private void executeUnlock(String internalId, String playGamesId) {
        if (activity == null) {
            Log.w(TAG, "executeUnlock: Activity is null");
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Activity is null");
            return;
        }

        if (achievementsClient == null) {
            try {
                this.achievementsClient = PlayGames.getAchievementsClient(activity);
            } catch (Throwable t) {
                Log.w(TAG, "Failed to get achievementsClient: " + t.getMessage(), t);
            }
        }

        if (achievementsClient == null) {
            Log.e(TAG, "executeUnlock: achievementsClient is null despite signed-in state");
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "AchievementsClient unavailable");
            return;
        }

        Log.i(TAG, "Calling AchievementsClient.unlockImmediate(" + playGamesId + ") for " + internalId);
        try {
            achievementsClient.unlockImmediate(playGamesId).addOnCompleteListener(task -> {
                try {
                    if (task.isSuccessful()) {
                        Log.i(TAG, "Successfully unlocked achievement in Google Play Games: " + internalId + " (" + playGamesId + ")");
                        sendToWeb("ACHIEVEMENT_SYNCED", internalId, playGamesId, null);
                    } else {
                        Exception ex = task.getException();
                        String error = categorizeException(ex);
                        Log.e(TAG, "unlockImmediate failed for " + internalId + " (" + playGamesId + "): " + error, ex);
                        sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
                    }
                } catch (Throwable t) {
                    Log.w(TAG, "Error in unlockImmediate callback: " + t.getMessage(), t);
                }
            });
        } catch (Throwable t) {
            String error = categorizeException(t);
            Log.e(TAG, "Failed to call unlockImmediate for " + internalId + " (" + playGamesId + "): " + error, t);
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
        }
    }

    public void setAchievementSteps(String internalId, String playGamesId, int steps) {
        if (playGamesId == null || playGamesId.isEmpty()) {
            Log.d(TAG, "Missing achievement ID for " + internalId + ", skipping native Google Play call.");
            return;
        }

        Log.i(TAG, "setAchievementSteps requested: " + internalId + " -> " + playGamesId + " (steps=" + steps + ", isSignedIn=" + isSignedIn + ")");

        if (!isSignedIn) {
            Log.w(TAG, "setAchievementSteps called while not signed in for: " + internalId + ". Checking isAuthenticated before failing...");
            if (activity == null) {
                sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Activity is null");
                return;
            }
            try {
                GamesSignInClient signInClient = PlayGames.getGamesSignInClient(activity);
                signInClient.isAuthenticated().addOnCompleteListener(task -> {
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    if (authenticated) {
                        this.isSignedIn = true;
                        try {
                            this.achievementsClient = PlayGames.getAchievementsClient(activity);
                        } catch (Throwable t) {
                            Log.w(TAG, "Failed to get achievements client: " + t.getMessage(), t);
                        }
                        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
                        executeSetSteps(internalId, playGamesId, steps);
                    } else {
                        String err = "Play Games sign-in required";
                        if (!task.isSuccessful() && task.getException() != null) {
                            err += ": " + categorizeException(task.getException());
                        }
                        Log.w(TAG, "setAchievementSteps failed: " + err);
                        sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, err);
                    }
                });
            } catch (Throwable t) {
                Log.w(TAG, "Failed checking authentication during setAchievementSteps: " + t.getMessage(), t);
                sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Play Games sign-in required");
            }
            return;
        }

        executeSetSteps(internalId, playGamesId, steps);
    }

    private void executeSetSteps(String internalId, String playGamesId, int steps) {
        if (activity == null) {
            Log.w(TAG, "executeSetSteps: Activity is null");
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Activity is null");
            return;
        }

        if (achievementsClient == null) {
            try {
                this.achievementsClient = PlayGames.getAchievementsClient(activity);
            } catch (Throwable t) {
                Log.w(TAG, "Failed to get achievementsClient: " + t.getMessage(), t);
            }
        }

        if (achievementsClient == null) {
            Log.e(TAG, "executeSetSteps: achievementsClient is null despite signed-in state");
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "AchievementsClient unavailable");
            return;
        }

        Log.i(TAG, "Calling AchievementsClient.setStepsImmediate(" + playGamesId + ", " + steps + ") for " + internalId);
        try {
            achievementsClient.setStepsImmediate(playGamesId, steps).addOnCompleteListener(task -> {
                try {
                    if (task.isSuccessful()) {
                        Log.i(TAG, "Successfully updated achievement steps in Google Play Games: " + internalId + " (" + playGamesId + ") -> " + steps);
                        sendToWeb("ACHIEVEMENT_SYNCED", internalId, playGamesId, null);
                    } else {
                        Exception ex = task.getException();
                        String error = categorizeException(ex);
                        Log.e(TAG, "setStepsImmediate failed for " + internalId + " (" + playGamesId + "): " + error, ex);
                        sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
                    }
                } catch (Throwable t) {
                    Log.w(TAG, "Error in setStepsImmediate callback: " + t.getMessage(), t);
                }
            });
        } catch (Throwable t) {
            String error = categorizeException(t);
            Log.e(TAG, "Failed to call setStepsImmediate for " + internalId + " (" + playGamesId + "): " + error, t);
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
        }
    }

    public void showAchievements() {
        if (!isSignedIn) {
            Log.w(TAG, "showAchievements called while not signed in");
            return;
        }

        if (activity == null) {
            Log.w(TAG, "showAchievements: Activity is null");
            return;
        }

        if (achievementsClient == null) {
            try {
                this.achievementsClient = PlayGames.getAchievementsClient(activity);
            } catch (Throwable t) {
                Log.w(TAG, "Failed to get achievementsClient: " + t.getMessage(), t);
            }
        }

        if (achievementsClient == null) {
            Log.e(TAG, "showAchievements: achievementsClient is null");
            return;
        }

        Log.d(TAG, "Requesting Play Games achievements UI intent");
        try {
            achievementsClient.getAchievementsIntent().addOnSuccessListener(intent -> {
                try {
                    if (activity instanceof MainActivity) {
                        ((MainActivity) activity).setHandlingInternalActivityResult(true);
                    }
                    activity.startActivityForResult(intent, RC_ACHIEVEMENT_UI);
                } catch (Throwable t) {
                    Log.w(TAG, "Failed to launch achievements UI activity: " + t.getMessage(), t);
                }
            }).addOnFailureListener(e -> {
                Log.w(TAG, "Failed to retrieve achievements UI intent: " + categorizeException(e), e);
            });
        } catch (Throwable t) {
            Log.w(TAG, "Could not open achievements UI: " + t.getMessage(), t);
        }
    }

    void sendToWeb(String type, String internalId, String playGamesId, String error) {
        if (responseCallback == null) {
            Log.w(TAG, "sendToWeb: responseCallback is null, cannot deliver " + type);
            return;
        }
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", type);
            if (internalId != null) res.put("internalAchievementId", internalId);
            if (playGamesId != null) res.put("playGamesAchievementId", playGamesId);
            if (error != null) res.put("error", error);

            Log.d(TAG, "Sending message to web: " + res.toString());
            responseCallback.sendResponse(res.toString());
        } catch (Exception e) {
            Log.e(TAG, "Failed to format response JSON: " + e.getMessage());
        }
    }
}
