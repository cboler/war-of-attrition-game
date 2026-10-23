package com.cboler.warofattrition;

import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class NativeBridgeRouterTest {
    private static final String HELLO = "{\"version\":\"v1\",\"type\":\"TWA_PORT_HANDSHAKE\"}";

    private static class RecordingSender implements NativeBridgeRouter.PageSender {
        final List<String> sent = new ArrayList<>();
        boolean accept = true;

        @Override
        public boolean send(String message) {
            if (!accept) return false;
            sent.add(message);
            return true;
        }
    }

    private static class TestPlayGamesBridge extends PlayGamesBridge {
        final List<String> handled = new ArrayList<>();

        TestPlayGamesBridge() {
            super(null);
        }

        @Override
        public void handleWebMessage(String jsonPayload) {
            handled.add(jsonPayload);
        }

        void respond(String message) {
            sendToWebRaw(message);
        }
    }

    private static class TestPlayGameStatsBridge extends PlayGameStatsBridge {
        final List<String> handled = new ArrayList<>();

        TestPlayGameStatsBridge() {
            super(null);
        }

        @Override
        public void handleWebMessage(String jsonPayload) {
            handled.add(jsonPayload);
        }
    }

    private TestPlayGamesBridge playGames;
    private TestPlayGameStatsBridge gameStats;
    private NativeBridgeRouter router;
    private RecordingSender page;

    @Before
    public void setUp() {
        playGames = new TestPlayGamesBridge();
        gameStats = new TestPlayGameStatsBridge();
        router = new NativeBridgeRouter(playGames, gameStats);
        page = new RecordingSender();
    }

    @Test
    public void responsesBeforeHelloAreBufferedThenDeliveredInOrder() {
        playGames.respond("{\"version\":\"v1\",\"type\":\"PLAY_GAMES_READY\"}");
        playGames.respond("{\"version\":\"v1\",\"type\":\"PLAY_GAMES_SIGNED_IN\"}");
        assertEquals(2, router.getPendingCount());
        assertFalse(router.isPageConnected());

        router.onPageMessage(HELLO, page);

        assertTrue(router.isPageConnected());
        assertEquals(0, router.getPendingCount());
        assertEquals(3, page.sent.size());
        assertEquals(NativeBridgeRouter.READY_MESSAGE, page.sent.get(0));
        assertTrue(page.sent.get(1).contains("PLAY_GAMES_READY"));
        assertTrue(page.sent.get(2).contains("PLAY_GAMES_SIGNED_IN"));
    }

    @Test
    public void connectedPageReceivesResponsesDirectly() {
        router.onPageMessage(HELLO, page);
        page.sent.clear();

        playGames.respond("{\"version\":\"v1\",\"type\":\"ACHIEVEMENT_SYNCED\"}");

        assertEquals(1, page.sent.size());
        assertEquals(0, router.getPendingCount());
    }

    @Test
    public void pageGoneBuffersUntilNextHello() {
        router.onPageMessage(HELLO, page);
        router.onPageGone();
        playGames.respond("{\"version\":\"v1\",\"type\":\"ACHIEVEMENT_SYNCED\"}");
        assertEquals(1, router.getPendingCount());

        RecordingSender nextPage = new RecordingSender();
        router.onPageMessage(HELLO, nextPage);

        assertEquals(2, nextPage.sent.size());
        assertTrue(nextPage.sent.get(1).contains("ACHIEVEMENT_SYNCED"));
    }

    @Test
    public void failedDeliveryKeepsMessageAndDisconnects() {
        router.onPageMessage(HELLO, page);
        page.accept = false;

        playGames.respond("{\"version\":\"v1\",\"type\":\"ACHIEVEMENT_SYNCED\"}");

        assertFalse(router.isPageConnected());
        assertEquals(1, router.getPendingCount());

        page.accept = true;
        router.onPageMessage(HELLO, page);
        assertTrue(page.sent.get(page.sent.size() - 1).contains("ACHIEVEMENT_SYNCED"));
    }

    @Test
    public void bufferDropsOldestWhenFull() {
        for (int i = 0; i < NativeBridgeRouter.MAX_PENDING_MESSAGES + 5; i++) {
            playGames.respond("{\"version\":\"v1\",\"type\":\"M" + i + "\"}");
        }
        assertEquals(NativeBridgeRouter.MAX_PENDING_MESSAGES, router.getPendingCount());

        router.onPageMessage(HELLO, page);
        assertTrue(page.sent.get(1).contains("\"M5\""));
    }

    @Test
    public void routesAchievementAndStatsMessages() {
        String[] achievementTypes = {
            "PLAY_GAMES_INIT", "PLAY_GAMES_SIGN_IN", "UNLOCK_ACHIEVEMENT", "SET_ACHIEVEMENT_STEPS", "SHOW_ACHIEVEMENTS"
        };
        for (String type : achievementTypes) {
            router.onPageMessage("{\"version\":\"v1\",\"type\":\"" + type + "\"}", page);
        }
        router.onPageMessage("{\"version\":\"v1\",\"type\":\"GAME_STATS_INIT\"}", page);
        router.onPageMessage("{\"version\":\"v1\",\"type\":\"RECORD_GAME_STATS\"}", page);

        assertEquals(achievementTypes.length, playGames.handled.size());
        assertEquals(2, gameStats.handled.size());
    }

    @Test
    public void rejectsMalformedAndUnsupportedMessages() {
        router.onPageMessage(null, page);
        router.onPageMessage("  ", page);
        router.onPageMessage("not-json", page);
        router.onPageMessage("{\"version\":\"v2\",\"type\":\"TWA_PORT_HANDSHAKE\"}", page);
        router.onPageMessage("{\"version\":\"v1\",\"type\":\"UNKNOWN\"}", page);

        assertFalse(router.isPageConnected());
        assertEquals(0, playGames.handled.size());
        assertEquals(0, gameStats.handled.size());
        assertEquals(0, page.sent.size());
    }

    @Test
    public void senderExceptionIsContained() {
        router.onPageMessage(HELLO, msg -> {
            throw new IllegalStateException("frame detached");
        });
        assertFalse(router.isPageConnected());
        playGames.respond("{\"version\":\"v1\",\"type\":\"PLAY_GAMES_READY\"}");
        assertEquals(1, router.getPendingCount());
    }
}
