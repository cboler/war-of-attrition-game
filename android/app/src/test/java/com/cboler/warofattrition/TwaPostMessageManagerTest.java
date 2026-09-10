package com.cboler.warofattrition;

import android.net.Uri;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

/**
 * Unit tests for TwaPostMessageManager covering channel handshake, ordering,
 * message routing, buffering, and fault tolerance.
 */
public class TwaPostMessageManagerTest {

    private static class TestPostMessageSender implements TwaPostMessageManager.PostMessageSender {
        final List<String> postedMessages = new ArrayList<>();
        Uri requestedTargetOrigin = null;
        int requestChannelCalls = 0;
        boolean requestChannelResult = true;
        RuntimeException requestChannelException = null;

        @Override
        public int postMessage(String message) {
            postedMessages.add(message);
            return 0; // RESULT_SUCCESS
        }

        @Override
        public boolean requestPostMessageChannel(Uri targetOrigin) {
            requestChannelCalls++;
            requestedTargetOrigin = targetOrigin;
            if (requestChannelException != null) {
                throw requestChannelException;
            }
            return requestChannelResult;
        }
    }

    private static class TestPlayGamesBridge extends PlayGamesBridge {
        String lastHandledMessage = null;
        int handleCount = 0;

        TestPlayGamesBridge() {
            super(null);
        }

        @Override
        public void handleWebMessage(String jsonPayload) {
            lastHandledMessage = jsonPayload;
            handleCount++;
        }

        void simulateResponse(String jsonMessage) {
            // Invokes the registered response callback
            try {
                java.lang.reflect.Field callbackField = PlayGamesBridge.class.getDeclaredField("responseCallback");
                callbackField.setAccessible(true);
                PlayGamesBridge.BridgeResponseCallback cb = (PlayGamesBridge.BridgeResponseCallback) callbackField.get(this);
                if (cb != null) {
                    cb.sendResponse(jsonMessage);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static class TestPlayGameStatsBridge extends PlayGameStatsBridge {
        String lastHandledMessage = null;
        int handleCount = 0;

        TestPlayGameStatsBridge() {
            super(null);
        }

        @Override
        public void handleWebMessage(String jsonPayload) {
            lastHandledMessage = jsonPayload;
            handleCount++;
        }

        void simulateResponse(String jsonMessage) {
            try {
                java.lang.reflect.Field callbackField = PlayGameStatsBridge.class.getDeclaredField("responseCallback");
                callbackField.setAccessible(true);
                PlayGameStatsBridge.BridgeResponseCallback cb = (PlayGameStatsBridge.BridgeResponseCallback) callbackField.get(this);
                if (cb != null) {
                    cb.sendResponse(jsonMessage);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    private TestPlayGamesBridge playGamesBridge;
    private TestPlayGameStatsBridge playGameStatsBridge;
    private TwaPostMessageManager manager;
    private TestPostMessageSender sender;

    @Before
    public void setUp() {
        playGamesBridge = new TestPlayGamesBridge();
        playGameStatsBridge = new TestPlayGameStatsBridge();
        manager = new TwaPostMessageManager(playGamesBridge, playGameStatsBridge);
        sender = new TestPostMessageSender();
    }

    @Test
    public void testChannelNotRequestedUntilBothSessionAndNavigationAreReady_SessionFirst() {
        assertFalse(manager.isSessionAvailable());
        assertFalse(manager.isNavigationFinished());
        assertFalse(manager.isChannelRequested());

        // 1. Session arrives first
        manager.setPostMessageSender(sender);
        assertTrue(manager.isSessionAvailable());
        assertFalse(manager.isChannelRequested());
        assertEquals(0, sender.requestChannelCalls);

        // 2. Navigation finishes second
        manager.onNavigationFinished();
        assertTrue(manager.isNavigationFinished());
        assertTrue(manager.isChannelRequested());
        assertEquals(1, sender.requestChannelCalls);
    }

    @Test
    public void testChannelNotRequestedUntilBothSessionAndNavigationAreReady_NavigationFirst() {
        // 1. Navigation finishes first
        manager.onNavigationFinished();
        assertTrue(manager.isNavigationFinished());
        assertFalse(manager.isChannelRequested());
        assertEquals(0, sender.requestChannelCalls);

        // 2. Session arrives second
        manager.setPostMessageSender(sender);
        assertTrue(manager.isSessionAvailable());
        assertTrue(manager.isChannelRequested());
        assertEquals(1, sender.requestChannelCalls);
    }

    @Test
    public void testNoDuplicateChannelRequestsFromSubsequentEvents() {
        manager.setPostMessageSender(sender);
        manager.onNavigationFinished();
        assertEquals(1, sender.requestChannelCalls);

        // Additional navigation finished or session calls do not re-request channel
        manager.onNavigationFinished();
        manager.setPostMessageSender(sender);
        assertEquals(1, sender.requestChannelCalls);
    }

    @Test
    public void testRejectedChannelRequestCanRetry() {
        sender.requestChannelResult = false;
        manager.setPostMessageSender(sender);

        assertFalse(manager.maybeRequestPostMessageChannel());
        manager.onNavigationFinished();

        assertFalse(manager.isChannelRequested());
        assertEquals(1, sender.requestChannelCalls);

        sender.requestChannelResult = true;
        assertTrue(manager.maybeRequestPostMessageChannel());
        assertTrue(manager.isChannelRequested());
        assertEquals(2, sender.requestChannelCalls);
    }

    @Test
    public void testChannelRequestExceptionDoesNotEscape() {
        sender.requestChannelException = new SecurityException("PostMessageService bind rejected");
        manager.setPostMessageSender(sender);

        manager.onNavigationFinished();

        assertFalse(manager.isChannelRequested());
        assertEquals(1, sender.requestChannelCalls);
    }

    @Test
    public void testOutboundResponsesBufferedUntilChannelReadyThenFlushed() {
        manager.setPostMessageSender(sender);

        // Simulate bridge emitting responses before channel is ready
        playGamesBridge.simulateResponse("{\"version\":\"v1\",\"type\":\"PLAY_GAMES_READY\"}");
        playGameStatsBridge.simulateResponse("{\"version\":\"v1\",\"type\":\"GAME_STATS_READY\",\"available\":true}");

        // Messages should be buffered, sender should have 0 posted
        assertEquals(2, manager.getPendingResponseCount());
        assertEquals(0, sender.postedMessages.size());

        // Channel becomes ready
        manager.onMessageChannelReady();
        assertTrue(manager.isChannelReady());
        assertEquals(0, manager.getPendingResponseCount());

        // Should have received handshake ready + 2 flushed responses
        assertEquals(3, sender.postedMessages.size());
        assertTrue(sender.postedMessages.get(0).contains("TWA_PORT_READY"));
        assertTrue(sender.postedMessages.get(1).contains("PLAY_GAMES_READY"));
        assertTrue(sender.postedMessages.get(2).contains("GAME_STATS_READY"));
    }

    @Test
    public void testDirectSendWhenChannelAlreadyReady() {
        manager.setPostMessageSender(sender);
        manager.onNavigationFinished();
        manager.onMessageChannelReady();

        sender.postedMessages.clear(); // Clear handshake marker

        playGamesBridge.simulateResponse("{\"version\":\"v1\",\"type\":\"ACHIEVEMENT_SYNCED\"}");
        assertEquals(1, sender.postedMessages.size());
        assertTrue(sender.postedMessages.get(0).contains("ACHIEVEMENT_SYNCED"));
    }

    @Test
    public void testRoutingAchievementMessages() {
        String[] achievementTypes = {
            "PLAY_GAMES_INIT",
            "PLAY_GAMES_SIGN_IN",
            "UNLOCK_ACHIEVEMENT",
            "SET_ACHIEVEMENT_STEPS",
            "SHOW_ACHIEVEMENTS"
        };

        for (String type : achievementTypes) {
            String msg = "{\"version\":\"v1\",\"type\":\"" + type + "\"}";
            manager.onPostMessage(msg);
            assertEquals(msg, playGamesBridge.lastHandledMessage);
            assertEquals(0, playGameStatsBridge.handleCount);
        }
        assertEquals(achievementTypes.length, playGamesBridge.handleCount);
    }

    @Test
    public void testRoutingGameStatsMessages() {
        String[] gameStatsTypes = {
            "GAME_STATS_INIT",
            "RECORD_GAME_STATS"
        };

        for (String type : gameStatsTypes) {
            String msg = "{\"version\":\"v1\",\"type\":\"" + type + "\"}";
            manager.onPostMessage(msg);
            assertEquals(msg, playGameStatsBridge.lastHandledMessage);
            assertEquals(0, playGamesBridge.handleCount);
        }
        assertEquals(gameStatsTypes.length, playGameStatsBridge.handleCount);
    }

    @Test
    public void testMalformedAndUnsupportedMessagesRejectedGracefully() {
        // Null or empty
        manager.onPostMessage(null);
        manager.onPostMessage("");
        manager.onPostMessage("   ");

        // Invalid JSON
        manager.onPostMessage("not-json");

        // Wrong version
        manager.onPostMessage("{\"version\":\"v2\",\"type\":\"PLAY_GAMES_INIT\"}");

        // Unknown type
        manager.onPostMessage("{\"version\":\"v1\",\"type\":\"UNKNOWN_TYPE\"}");

        assertEquals(0, playGamesBridge.handleCount);
        assertEquals(0, playGameStatsBridge.handleCount);
    }

    @Test
    public void testSessionNullGraceful() {
        manager.setCustomTabsSession(null);
        assertFalse(manager.isSessionAvailable());
        manager.sendResponse("{\"version\":\"v1\",\"type\":\"TEST\"}");
        // Buffers gracefully without throwing NullPointerException
        assertEquals(1, manager.getPendingResponseCount());
    }
}
