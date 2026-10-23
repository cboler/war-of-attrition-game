package com.cboler.warofattrition;

import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import org.json.JSONObject;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Routes messages between the game page (window.AttritionNative) and the native Play Games and
 * Game Stats bridges.
 *
 * <p>Each page load says hello once ({@code TWA_PORT_HANDSHAKE}); that hello carries the reply
 * path for that document. Until a page has said hello, or after it navigates away, native
 * responses are buffered and delivered when the next hello arrives. The message names keep their
 * original TWA-era spelling because they are the wire protocol shared with the web app.
 */
public class NativeBridgeRouter {
    private static final String TAG = "NativeBridgeRouter";
    public static final String PROTOCOL_VERSION = "v1";
    static final String HELLO_TYPE = "TWA_PORT_HANDSHAKE";
    static final int MAX_PENDING_MESSAGES = 50;
    static final String READY_MESSAGE =
            "{\"version\":\"" + PROTOCOL_VERSION + "\",\"type\":\"TWA_PORT_READY\"}";

    /** Delivers one message to the page; returns false when the page cannot receive it. */
    public interface PageSender {
        boolean send(@NonNull String message);
    }

    private final PlayGamesBridge playGamesBridge;
    private final PlayGameStatsBridge playGameStatsBridge;
    private final Deque<String> pending = new ArrayDeque<>();
    private PageSender pageSender;

    public NativeBridgeRouter(
            @NonNull PlayGamesBridge playGamesBridge,
            @NonNull PlayGameStatsBridge playGameStatsBridge) {
        this.playGamesBridge = playGamesBridge;
        this.playGameStatsBridge = playGameStatsBridge;
        playGamesBridge.setResponseCallback(this::sendResponse);
        playGameStatsBridge.setResponseCallback(this::sendResponse);
    }

    /**
     * Handles one message from the page. A hello (re)connects the page using {@code replySender};
     * everything else is routed to the matching native bridge.
     */
    public synchronized void onPageMessage(@Nullable String message, @NonNull PageSender replySender) {
        if (message == null || message.trim().isEmpty()) {
            return;
        }
        String type;
        try {
            JSONObject obj = new JSONObject(message);
            if (!PROTOCOL_VERSION.equals(obj.optString("version", ""))) {
                Log.w(TAG, "Rejected page message with unsupported protocol version");
                return;
            }
            type = obj.optString("type", "");
        } catch (Exception e) {
            Log.w(TAG, "Rejected malformed page message: " + e.getMessage());
            return;
        }

        switch (type) {
            case HELLO_TYPE:
                connect(replySender);
                break;
            case "PLAY_GAMES_INIT":
            case "PLAY_GAMES_SIGN_IN":
            case "UNLOCK_ACHIEVEMENT":
            case "SET_ACHIEVEMENT_STEPS":
            case "SHOW_ACHIEVEMENTS":
                Log.d(TAG, "Routing to PlayGamesBridge: " + type);
                playGamesBridge.handleWebMessage(message);
                break;
            case "GAME_STATS_INIT":
            case "RECORD_GAME_STATS":
                Log.d(TAG, "Routing to PlayGameStatsBridge: " + type);
                playGameStatsBridge.handleWebMessage(message);
                break;
            default:
                Log.w(TAG, "Unhandled page message type: " + type);
                break;
        }
    }

    /** The page navigated away or its renderer died; buffer until the next hello. */
    public synchronized void onPageGone() {
        if (pageSender != null) {
            Log.i(TAG, "Page gone; buffering native responses until the next page says hello");
        }
        pageSender = null;
    }

    public synchronized void sendResponse(@Nullable String message) {
        if (message == null || message.trim().isEmpty()) {
            return;
        }
        if (pageSender == null || !deliver(message)) {
            buffer(message);
        }
    }

    private void connect(PageSender sender) {
        pageSender = sender;
        Log.i(TAG, "Page connected; delivering " + pending.size() + " buffered responses");
        if (!deliver(READY_MESSAGE)) {
            return;
        }
        while (!pending.isEmpty()) {
            String next = pending.pollFirst();
            if (!deliver(next)) {
                pending.addFirst(next);
                return;
            }
        }
    }

    private boolean deliver(String message) {
        boolean sent;
        try {
            sent = pageSender != null && pageSender.send(message);
        } catch (RuntimeException e) {
            Log.w(TAG, "Delivering to page failed: " + e.getMessage());
            sent = false;
        }
        if (!sent) {
            pageSender = null;
        }
        return sent;
    }

    private void buffer(String message) {
        if (pending.size() >= MAX_PENDING_MESSAGES) {
            // Drop the oldest: the newest state (sign-in, sync results) matters most.
            pending.pollFirst();
            Log.w(TAG, "Pending response buffer full; dropped the oldest message");
        }
        pending.addLast(message);
    }

    synchronized boolean isPageConnected() {
        return pageSender != null;
    }

    synchronized int getPendingCount() {
        return pending.size();
    }
}
