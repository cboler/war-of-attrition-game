package com.cboler.warofattrition;

import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsSession;
import org.json.JSONObject;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;

/**
 * Manages the bidirectional TWA postMessage channel lifecycle, message routing,
 * and response buffering between the web application and native Play Games/Game Stats bridges.
 *
 * <p>The channel belongs to one web document. A reload or full navigation gives the page a fresh
 * document with no port, so every NAVIGATION_FINISHED after a channel exists starts a new
 * handshake. Chromium's channel setup is also timing-sensitive (crbug.com/41301759), so an
 * unanswered request is retried a bounded number of times, and a failed send re-opens the channel.
 */
public class TwaPostMessageManager {
    private static final String TAG = "TwaPostMessageManager";
    public static final String PROTOCOL_VERSION = "v1";
    public static final String TARGET_ORIGIN_STRING = "https://cboler.github.io";

    /** CustomTabsService.RESULT_SUCCESS; any other postMessage result means the port is unusable. */
    static final int POST_MESSAGE_RESULT_SUCCESS = 0;
    /** How long to wait for onMessageChannelReady before asking again. */
    static final long CHANNEL_READY_TIMEOUT_MS = 3000L;
    /** Channel requests per document before giving up (local achievements keep working). */
    static final int MAX_CHANNEL_ATTEMPTS = 4;
    private static final int MAX_PENDING_MESSAGES = 50;
    private static final String PORT_READY_MESSAGE =
            "{\"version\":\"" + PROTOCOL_VERSION + "\",\"type\":\"TWA_PORT_READY\"}";

    private final PlayGamesBridge playGamesBridge;
    private final PlayGameStatsBridge playGameStatsBridge;

    public interface PostMessageSender {
        int postMessage(String message);
        boolean requestPostMessageChannel(Uri sourceOrigin, Uri targetOrigin);
    }

    /** Delays work on the main thread; injected so tests can drive time explicitly. */
    public interface Scheduler {
        void schedule(@NonNull Runnable task, long delayMs);
        void cancel(@NonNull Runnable task);
    }

    private PostMessageSender postMessageSender;
    private Scheduler scheduler;
    private boolean sessionAvailable = false;
    private boolean navigationFinished = false;
    private boolean navigationSettledForPostMessage = false;
    private boolean relationshipValidated = false;
    private boolean channelRequested = false;
    private boolean channelReady = false;
    private int channelAttempts = 0;
    private final Deque<String> pendingOutboundResponses = new ArrayDeque<>();
    private final Runnable channelWatchdog = this::onChannelWatchdog;

    public TwaPostMessageManager(
            @NonNull PlayGamesBridge playGamesBridge,
            @NonNull PlayGameStatsBridge playGameStatsBridge) {
        this.playGamesBridge = playGamesBridge;
        this.playGameStatsBridge = playGameStatsBridge;

        this.playGamesBridge.setResponseCallback(this::sendResponse);
        this.playGameStatsBridge.setResponseCallback(this::sendResponse);
    }

    public synchronized void setScheduler(@Nullable Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    public synchronized void setCustomTabsSession(@Nullable CustomTabsSession session) {
        if (session == null) {
            setPostMessageSender(null);
            return;
        }
        setPostMessageSender(new PostMessageSender() {
            @Override
            public int postMessage(String message) {
                return session.postMessage(message, null);
            }

            @Override
            public boolean requestPostMessageChannel(Uri sourceOrigin, Uri targetOrigin) {
                return session.requestPostMessageChannel(sourceOrigin, targetOrigin, new Bundle());
            }
        });
    }

    public synchronized void setPostMessageSender(@Nullable PostMessageSender sender) {
        this.postMessageSender = sender;
        this.sessionAvailable = (sender != null);
        if (sender == null) {
            resetChannel();
            return;
        }
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
        String requested = origin.toString().toLowerCase(Locale.ROOT);
        return requested.startsWith(TARGET_ORIGIN_STRING.toLowerCase(Locale.ROOT));
    }

    public synchronized boolean isRelationshipValidated() {
        return relationshipValidated;
    }

    /**
     * A finished navigation is a new web document. Any port held by the previous document is gone,
     * so the channel is reset and re-requested once the new page settles.
     */
    public synchronized void onNavigationFinished() {
        if (channelRequested || channelReady) {
            Log.i(TAG, "New document loaded; the previous postMessage channel is stale and will be re-requested");
        }
        // Always reset: the attempt budget is per document, so a page that gave up earlier
        // gets a fresh set of attempts after a reload.
        resetChannel();
        Log.i(TAG, "onNavigationFinished received in TwaPostMessageManager");
        this.navigationFinished = true;
        this.navigationSettledForPostMessage = false;
    }

    public synchronized void onNavigationSettledForPostMessage() {
        if (!navigationFinished) {
            return;
        }
        this.navigationSettledForPostMessage = true;
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
        if (!navigationSettledForPostMessage) {
            Log.d(TAG, "Cannot request postMessage channel: navigation settle delay has not elapsed");
            return false;
        }
        if (postMessageSender == null) {
            Log.w(TAG, "Cannot request postMessage channel: postMessageSender is null");
            return false;
        }
        if (channelAttempts >= MAX_CHANNEL_ATTEMPTS) {
            Log.w(TAG, "postMessage channel not established after " + channelAttempts
                    + " attempts; Play Games sync is unavailable for this page (local progress is unaffected)");
            return false;
        }

        Uri targetOrigin = Uri.parse(TARGET_ORIGIN_STRING);
        channelAttempts++;
        Log.i(TAG, "Requesting postMessage channel for target origin: " + targetOrigin
                + " (attempt " + channelAttempts + "/" + MAX_CHANNEL_ATTEMPTS
                + ", relationshipValidated=" + relationshipValidated + ")");
        try {
            boolean success = postMessageSender.requestPostMessageChannel(targetOrigin, targetOrigin);
            channelRequested = success;
            Log.i(TAG, "requestPostMessageChannel(" + targetOrigin + ") returned: " + success);
            if (success) {
                scheduleWatchdog();
            }
            return success;
        } catch (RuntimeException e) {
            channelRequested = false;
            Log.e(TAG, "requestPostMessageChannel threw exception without terminating app: " + e.getMessage(), e);
            return false;
        }
    }

    public synchronized void onMessageChannelReady() {
        cancelWatchdog();
        this.channelReady = true;
        Log.i(TAG, "onMessageChannelReady callback received: Transferred MessagePort ready in browser. Notifying web and draining "
                + pendingOutboundResponses.size() + " pending responses.");
        // The attempt budget resets only once a message is delivered, so a channel that reports
        // ready but cannot carry messages cannot loop forever.
        if (sendDirect(PORT_READY_MESSAGE)) {
            this.channelAttempts = 0;
            drainPendingResponses();
        }
    }

    /** Fires when Chrome never confirmed a request; asks again until the attempt budget is spent. */
    synchronized void onChannelWatchdog() {
        if (channelReady || !channelRequested) {
            return;
        }
        Log.w(TAG, "onMessageChannelReady not received within " + CHANNEL_READY_TIMEOUT_MS + "ms; re-requesting channel");
        channelRequested = false;
        maybeRequestPostMessageChannel();
    }

    public synchronized void sendResponse(String jsonMessage) {
        if (jsonMessage == null || jsonMessage.trim().isEmpty()) {
            return;
        }
        if (channelReady && postMessageSender != null) {
            if (!sendDirect(jsonMessage)) {
                bufferResponse(jsonMessage, true);
            }
        } else {
            bufferResponse(jsonMessage, false);
        }
    }

    private void bufferResponse(String jsonMessage, boolean atFront) {
        if (pendingOutboundResponses.size() >= MAX_PENDING_MESSAGES) {
            Log.w(TAG, "Pending outbound response buffer full (" + MAX_PENDING_MESSAGES + "). Discarding message.");
            return;
        }
        if (atFront) {
            pendingOutboundResponses.addFirst(jsonMessage);
        } else {
            pendingOutboundResponses.addLast(jsonMessage);
        }
        Log.d(TAG, "Buffered outbound response (total=" + pendingOutboundResponses.size() + "): " + jsonMessage);
    }

    /**
     * Posts one message. A non-success result means Chrome reported the channel ready but the
     * page cannot receive (seen on Chrome 150-152 after reloads), so the channel is re-opened.
     */
    private boolean sendDirect(String jsonMessage) {
        if (postMessageSender == null) {
            Log.w(TAG, "Cannot send postMessage: postMessageSender is null");
            return false;
        }
        int result;
        try {
            result = postMessageSender.postMessage(jsonMessage);
        } catch (Exception e) {
            Log.e(TAG, "Failed to send postMessage to web: " + e.getMessage(), e);
            result = Integer.MIN_VALUE;
        }
        if (result == POST_MESSAGE_RESULT_SUCCESS) {
            Log.i(TAG, "postMessage sent to web (" + jsonMessage.length() + " chars): " + jsonMessage);
            return true;
        }
        if (!channelReady) {
            Log.w(TAG, "postMessage failed before the channel was ready (result=" + result + ")");
            return false;
        }
        Log.w(TAG, "postMessage failed (result=" + result + "); re-opening the channel");
        channelReady = false;
        channelRequested = false;
        maybeRequestPostMessageChannel();
        return false;
    }

    private void drainPendingResponses() {
        while (!pendingOutboundResponses.isEmpty() && channelReady && postMessageSender != null) {
            String message = pendingOutboundResponses.pollFirst();
            if (!sendDirect(message)) {
                bufferResponse(message, true);
                return;
            }
        }
    }

    private void resetChannel() {
        cancelWatchdog();
        channelRequested = false;
        channelReady = false;
        channelAttempts = 0;
    }

    private void scheduleWatchdog() {
        if (scheduler == null) return;
        scheduler.cancel(channelWatchdog);
        scheduler.schedule(channelWatchdog, CHANNEL_READY_TIMEOUT_MS);
    }

    private void cancelWatchdog() {
        if (scheduler != null) {
            scheduler.cancel(channelWatchdog);
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
                    sendDirect(PORT_READY_MESSAGE);
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

    synchronized int getChannelAttempts() {
        return channelAttempts;
    }
}
