package com.cboler.warofattrition;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.util.Base64;
import android.util.Log;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.images.ImageManager;
import com.google.android.gms.games.AchievementsClient;
import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.tasks.Task;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;

/**
 * Encapsulates Google Play Games Services v2 integration and handles Web ↔ Native achievement commands.
 */
public class PlayGamesBridge {
    private static final String TAG = "PlayGamesBridge";
    private static final String PROTOCOL_VERSION = "v1";
    private static final int RC_ACHIEVEMENT_UI = 9003;
    private static final String SIGN_IN_REQUIRED = "Play Games sign-in required";
    /** Avatar edge in pixels; small enough to keep the data URL around 10 KB. */
    private static final int AVATAR_SIZE_PX = 96;

    private final Activity activity;
    private AchievementsClient achievementsClient;
    private boolean isInitialized = false;
    private boolean isSignedIn = false;
    /** Last PLAY_GAMES_PLAYER message, resent to each new page that initialises. */
    private String lastPlayerMessage;

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
            signInClient().isAuthenticated().addOnCompleteListener(task -> {
                this.isInitialized = true;
                reportAuthentication(task, "isAuthenticated");
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
                        sendToWebRaw(lastPlayerMessage);
                    } else {
                        // Re-check isAuthenticated in case automatic background sign-in just finished
                        checkAuthenticationAndReport();
                    }
                    break;

                case "PLAY_GAMES_SIGN_IN":
                    requestSignIn();
                    break;

                case "UNLOCK_ACHIEVEMENT":
                    unlockAchievement(
                            obj.optString("internalAchievementId", ""),
                            obj.optString("playGamesAchievementId", ""));
                    break;

                case "SET_ACHIEVEMENT_STEPS":
                    setAchievementSteps(
                            obj.optString("internalAchievementId", ""),
                            obj.optString("playGamesAchievementId", ""),
                            obj.optInt("currentSteps", 1));
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
            signInClient().signIn().addOnCompleteListener(task -> reportAuthentication(task, "signIn"));
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
        runWhenSignedIn(internalId, playGamesId, "unlockImmediate", client -> client.unlockImmediate(playGamesId));
    }

    public void setAchievementSteps(String internalId, String playGamesId, int steps) {
        if (playGamesId == null || playGamesId.isEmpty()) {
            Log.d(TAG, "Missing achievement ID for " + internalId + ", skipping native Google Play call.");
            return;
        }
        Log.i(TAG, "setAchievementSteps requested: " + internalId + " -> " + playGamesId + " (steps=" + steps + ", isSignedIn=" + isSignedIn + ")");
        runWhenSignedIn(internalId, playGamesId, "setStepsImmediate(" + steps + ")",
                client -> client.setStepsImmediate(playGamesId, steps));
    }

    public void showAchievements() {
        if (!isSignedIn) {
            Log.w(TAG, "showAchievements called while not signed in");
            return;
        }
        AchievementsClient client = achievementsClient();
        if (client == null) {
            Log.e(TAG, "showAchievements: achievementsClient is unavailable");
            return;
        }

        Log.d(TAG, "Requesting Play Games achievements UI intent");
        try {
            client.getAchievementsIntent().addOnSuccessListener(intent -> {
                try {
                    activity.startActivityForResult(intent, RC_ACHIEVEMENT_UI);
                } catch (Throwable t) {
                    Log.w(TAG, "Failed to launch achievements UI activity: " + t.getMessage(), t);
                }
            }).addOnFailureListener(e ->
                    Log.w(TAG, "Failed to retrieve achievements UI intent: " + categorizeException(e), e));
        } catch (Throwable t) {
            Log.w(TAG, "Could not open achievements UI: " + t.getMessage(), t);
        }
    }

    /** One Play Games achievement call, given a ready client. */
    private interface AchievementCall {
        Task<?> run(AchievementsClient client);
    }

    /**
     * Runs an achievement call, first re-checking authentication when the cached state says the
     * player is signed out (automatic sign-in can finish after the web page asked).
     */
    private void runWhenSignedIn(String internalId, String playGamesId, String operation, AchievementCall call) {
        if (isSignedIn) {
            executeAchievementCall(internalId, playGamesId, operation, call);
            return;
        }
        if (activity == null) {
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "Activity is null");
            return;
        }
        Log.w(TAG, operation + " requested while not signed in for " + internalId + "; checking isAuthenticated first");
        try {
            signInClient().isAuthenticated().addOnCompleteListener(task -> {
                if (isAuthenticated(task)) {
                    onSignedIn();
                    executeAchievementCall(internalId, playGamesId, operation, call);
                } else {
                    String err = SIGN_IN_REQUIRED;
                    if (!task.isSuccessful() && task.getException() != null) {
                        err += ": " + categorizeException(task.getException());
                    }
                    Log.w(TAG, operation + " failed: " + err);
                    sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, err);
                }
            });
        } catch (Throwable t) {
            Log.w(TAG, "Failed checking authentication before " + operation + ": " + t.getMessage(), t);
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, SIGN_IN_REQUIRED);
        }
    }

    private void executeAchievementCall(String internalId, String playGamesId, String operation, AchievementCall call) {
        AchievementsClient client = achievementsClient();
        if (client == null) {
            Log.e(TAG, operation + ": achievementsClient is unavailable despite signed-in state");
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, "AchievementsClient unavailable");
            return;
        }

        Log.i(TAG, "Calling AchievementsClient." + operation + " for " + internalId + " (" + playGamesId + ")");
        try {
            call.run(client).addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    Log.i(TAG, "Successfully synced achievement in Google Play Games: " + internalId + " (" + playGamesId + ") via " + operation);
                    sendToWeb("ACHIEVEMENT_SYNCED", internalId, playGamesId, null);
                } else {
                    String error = categorizeException(task.getException());
                    Log.e(TAG, operation + " failed for " + internalId + " (" + playGamesId + "): " + error, task.getException());
                    sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
                }
            });
        } catch (Throwable t) {
            String error = categorizeException(t);
            Log.e(TAG, "Failed to call " + operation + " for " + internalId + " (" + playGamesId + "): " + error, t);
            sendToWeb("ACHIEVEMENT_SYNC_FAILED", internalId, playGamesId, error);
        }
    }

    /** Sends SIGNED_IN or READY to the web for a finished isAuthenticated()/signIn() task. */
    private void reportAuthentication(Task<AuthenticationResult> task, String source) {
        try {
            boolean authenticated = isAuthenticated(task);
            Log.i(TAG, "Play Games " + source + " result: " + authenticated + " (task.isSuccessful=" + task.isSuccessful() + ")");
            if (authenticated) {
                onSignedIn();
                return;
            }
            this.isSignedIn = false;
            if (!task.isSuccessful() && task.getException() != null) {
                Log.w(TAG, source + " returned failure: " + categorizeException(task.getException()), task.getException());
            }
        } catch (Throwable t) {
            Log.w(TAG, "Error in " + source + " completion listener: " + t.getMessage(), t);
            this.isSignedIn = false;
        }
        sendToWeb("PLAY_GAMES_READY", null, null, null);
    }

    private void onSignedIn() {
        boolean wasSignedIn = this.isSignedIn;
        this.isSignedIn = true;
        achievementsClient();
        sendToWeb("PLAY_GAMES_SIGNED_IN", null, null, null);
        if (!wasSignedIn) {
            sendCurrentPlayer();
        }
    }

    /**
     * Sends the signed-in player's Play Games name, then again with an avatar once it loads.
     * The web app shows them on the local profile (Google sign-in cannot run inside a WebView).
     * Nothing here leaves the device; no player ID is sent.
     */
    private void sendCurrentPlayer() {
        if (activity == null) return;
        try {
            PlayGames.getPlayersClient(activity).getCurrentPlayer().addOnSuccessListener(player -> {
                if (player == null) return;
                String name = player.getDisplayName();
                lastPlayerMessage = buildPlayerMessage(name, null);
                sendToWebRaw(lastPlayerMessage);
                Uri icon = player.getIconImageUri();
                if (icon == null) return;
                ImageManager.create(activity).loadImage((uri, drawable, isRequested) -> {
                    String dataUrl = toPngDataUrl(drawable);
                    if (dataUrl != null) {
                        lastPlayerMessage = buildPlayerMessage(name, dataUrl);
                        sendToWebRaw(lastPlayerMessage);
                    }
                }, icon);
            }).addOnFailureListener(e ->
                    Log.w(TAG, "Could not load the current Play Games player: " + categorizeException(e)));
        } catch (Throwable t) {
            Log.w(TAG, "Could not request the current Play Games player: " + t.getMessage(), t);
        }
    }

    static String buildPlayerMessage(String displayName, String avatarDataUrl) {
        try {
            JSONObject res = new JSONObject();
            res.put("version", PROTOCOL_VERSION);
            res.put("type", "PLAY_GAMES_PLAYER");
            res.put("displayName", displayName == null ? "" : displayName);
            if (avatarDataUrl != null) res.put("avatarDataUrl", avatarDataUrl);
            return res.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private static String toPngDataUrl(Drawable drawable) {
        if (drawable == null) return null;
        try {
            Bitmap bitmap = Bitmap.createBitmap(AVATAR_SIZE_PX, AVATAR_SIZE_PX, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            if (drawable instanceof BitmapDrawable && ((BitmapDrawable) drawable).getBitmap() != null) {
                canvas.drawBitmap(Bitmap.createScaledBitmap(
                        ((BitmapDrawable) drawable).getBitmap(), AVATAR_SIZE_PX, AVATAR_SIZE_PX, true), 0, 0, null);
            } else {
                drawable.setBounds(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
                drawable.draw(canvas);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
            return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
        } catch (Throwable t) {
            Log.w(TAG, "Could not encode Play Games avatar: " + t.getMessage());
            return null;
        }
    }

    private static boolean isAuthenticated(Task<AuthenticationResult> task) {
        return task.isSuccessful() && task.getResult() != null && task.getResult().isAuthenticated();
    }

    private GamesSignInClient signInClient() {
        return PlayGames.getGamesSignInClient(activity);
    }

    /** Returns the cached achievements client, creating it on first use; null when unavailable. */
    private AchievementsClient achievementsClient() {
        if (achievementsClient == null && activity != null) {
            try {
                achievementsClient = PlayGames.getAchievementsClient(activity);
            } catch (Throwable t) {
                Log.w(TAG, "Failed to get achievements client: " + t.getMessage(), t);
            }
        }
        return achievementsClient;
    }

    /** Delivers an already-formatted protocol message to the page. */
    void sendToWebRaw(String jsonMessage) {
        if (jsonMessage != null && responseCallback != null) {
            responseCallback.sendResponse(jsonMessage);
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
