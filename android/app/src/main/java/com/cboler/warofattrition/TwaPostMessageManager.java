package com.cboler.warofattrition;

import android.net.Uri;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsSession;
import org.json.JSONObject;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Manages the bidirectional TWA postMessage channel lifecycle, message routing,
 * and response buffering between the web application and native Play Games/Game Stats bridges.
 */
public class TwaPostMessageManager {
    private static final String TAG = "TwaPostMessageManager";
    public static final String PROTOCOL_VERSION = "v1";
    public static final String TARGET_ORIGIN_STRING = "https://cboler.github.io";

    private final PlayGamesBridge playGamesBridge;
    private final PlayGameStatsBridge playGameStatsBridge;

    public interface PostMessageSender {
        int postMessage(String message);
        boolean requestPostMessageChannel(Uri targetOrigin);
    }

    private PostMessageSender postMessageSender;
    private boolean sessionAvailable = false;
    private boolean navigationFinished = false;
    private boolean relationshipValidated = false;
    private boolean channelRequested = false;
    private boolean channelReady = false;
    private static final int MAX_PENDING_MESSAGES = 50;
    private final Queue<String> pendingOutboundResponses = new LinkedList<>();

    public TwaPostMessageManager(
            @NonNull PlayGamesBridge playGamesBridge,
            @NonNull PlayGameStatsBridge playGameStatsBridge) {
        this.playGamesBridge = playGamesBridge;
        this.playGameStatsBridge = playGameStatsBridge;

        this.playGamesBridge.setResponseCallback(this::sendResponse);
        this.playGameStatsBridge.setResponseCallback(this::sendResponse);
    }

    public synchronized void setCustomTabsSession(@Nullable CustomTabsSession session) {
        if (session == null) {
            this.postMessageSender = null;
            this.sessionAvailable = false;
            return;
        }
        setPostMessageSender(new PostMessageSender() {
            @Override
            public int postMessage(String message) {
                return session.postMessage(message, null);
            }

            @Override
            public boolean requestPostMessageChannel(Uri targetOrigin) {
                return session.requestPostMessageChannel(targetOrigin);
            }
        });
    }

    public synchronized void setPostMessageSender(@Nullable PostMessageSender sender) {
        this.postMessageSender = sender;
        this.sessionAvailable = (sender != null);
        maybeRequestPostMessageChannel();
    }

    public synchronized void onRelationshipValidationResult(int relation, @NonNull Uri requestedOrigin, boolean result) {
        Log.i(TAG, "onRelationshipValidationResult received for " + requestedOrigin + " (relation=" + relation + ", result=" + result + ")");
        if (result && isTargetOriginMatch(requestedOrigin)) {
            this.relationshipValidated = true;
            maybeRequestPostMessageChannel();
        }
    }

    private boolean isTargetOriginMatch(Uri origin) {
        if (origin == null) return true;
        String requested = origin.toString().toLowerCase();
        return requested.startsWith(TARGET_ORIGIN_STRING.toLowerCase());
    }

    public synchronized boolean isRelationshipValidated() {
        return relationshipValidated;
    }

    public synchronized void onNavigationFinished() {
        Log.i(TAG, "onNavigationFinished received in TwaPostMessageManager");
        this.navigationFinished = true;
        maybeRequestPostMessageChannel();
    }

    public synchronized boolean maybeRequestPostMessageChannel() {
        if (channelReady) {
            Log.d(TAG, "postMessage channel already established and ready");
            return true;
        }
        if (channelRequested) {
            Log.d(TAG, "postMessage channel already requested, waiting for onMessageChannelReady callback");
            return true;
        }
        if (!sessionAvailable) {
            Log.d(TAG, "Cannot request postMessage channel: CustomTabsSession is unavailable");
            return false;
        }
        if (!navigationFinished) {
            Log.d(TAG, "Cannot request postMessage channel: TWA navigation has not completed");
            return false;
        }
        if (postMessageSender == null) {
            Log.w(TAG, "Cannot request postMessage channel: postMessageSender is null");
            return false;
        }

        Uri targetOrigin = Uri.parse(TARGET_ORIGIN_STRING);
        Log.i(TAG, "Requesting postMessage channel for target origin: " + targetOrigin
                + " (relationshipValidated=" + relationshipValidated + ")");
        try {
            boolean success = postMessageSender.requestPostMessageChannel(targetOrigin);
            channelRequested = success;
            Log.i(TAG, "requestPostMessageChannel(" + targetOrigin + ") returned: " + success);
            return success;
        } catch (RuntimeException e) {
            channelRequested = false;
            Log.e(TAG, "requestPostMessageChannel threw exception without terminating app: " + e.getMessage(), e);
            return false;
        }
    }

    public synchronized void onMessageChannelReady() {
        this.channelReady = true;
        Log.i(TAG, "onMessageChannelReady callback received: Transferred MessagePort ready in browser. Notifying web and draining "
                + pendingOutboundResponses.size() + " pending responses.");
        sendDirect("{\"version\":\"" + PROTOCOL_VERSION + "\",\"type\":\"TWA_PORT_READY\"}");
        drainPendingResponses();
    }

    public synchronized void sendResponse(String jsonMessage) {
        if (jsonMessage == null || jsonMessage.trim().isEmpty()) {
            return;
        }
        if (channelReady && postMessageSender != null) {
            sendDirect(jsonMessage);
        } else {
            if (pendingOutboundResponses.size() < MAX_PENDING_MESSAGES) {
                pendingOutboundResponses.offer(jsonMessage);
                Log.d(TAG, "Buffered outbound response (total=" + pendingOutboundResponses.size() + "): " + jsonMessage);
            } else {
                Log.w(TAG, "Pending outbound response buffer full (" + MAX_PENDING_MESSAGES + "). Discarding message.");
            }
        }
    }

    private void sendDirect(String jsonMessage) {
        if (postMessageSender == null) {
            Log.w(TAG, "Cannot send postMessage: postMessageSender is null");
            return;
        }
        try {
            int result = postMessageSender.postMessage(jsonMessage);
            Log.i(TAG, "postMessage sent to web (" + jsonMessage.length() + " chars, result=" + result + "): " + jsonMessage);
        } catch (Exception e) {
            Log.e(TAG, "Failed to send postMessage to web: " + e.getMessage(), e);
        }
    }

    private synchronized void drainPendingResponses() {
        while (!pendingOutboundResponses.isEmpty() && channelReady && postMessageSender != null) {
            String message = pendingOutboundResponses.poll();
            sendDirect(message);
        }
    }

    public synchronized void onPostMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return;
        }

        try {
            JSONObject obj = new JSONObject(message);
            String version = obj.optString("version", "");
            if (!PROTOCOL_VERSION.equals(version)) {
                Log.w(TAG, "Rejected inbound postMessage with unsupported protocol version: " + version);
                return;
            }

            String type = obj.optString("type", "");
            Log.i(TAG, "onPostMessage received from web: type=" + type + ", message=" + message);
            switch (type) {
                // Play Games Achievements
                case "PLAY_GAMES_INIT":
                case "PLAY_GAMES_SIGN_IN":
                case "UNLOCK_ACHIEVEMENT":
                case "SET_ACHIEVEMENT_STEPS":
                case "SHOW_ACHIEVEMENTS":
                    Log.d(TAG, "Routing message to PlayGamesBridge: " + type);
                    playGamesBridge.handleWebMessage(message);
                    break;

                // Play Games Game Stats
                case "GAME_STATS_INIT":
                case "RECORD_GAME_STATS":
                    Log.d(TAG, "Routing message to PlayGameStatsBridge: " + type);
                    playGameStatsBridge.handleWebMessage(message);
                    break;

                // Transport handshake marker
                case "TWA_PORT_HANDSHAKE":
                    sendDirect("{\"version\":\"" + PROTOCOL_VERSION + "\",\"type\":\"TWA_PORT_READY\"}");
                    break;

                default:
                    Log.w(TAG, "Unhandled or unrouted inbound postMessage type: " + type);
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to parse inbound postMessage JSON: " + e.getMessage(), e);
        }
    }

    public synchronized boolean isChannelReady() {
        return channelReady;
    }

    public synchronized boolean isChannelRequested() {
        return channelRequested;
    }

    public synchronized boolean isSessionAvailable() {
        return sessionAvailable;
    }

    public synchronized boolean isNavigationFinished() {
        return navigationFinished;
    }

    public synchronized int getPendingResponseCount() {
        return pendingOutboundResponses.size();
    }
}
