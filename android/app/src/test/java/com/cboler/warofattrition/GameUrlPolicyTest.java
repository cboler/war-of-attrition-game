package com.cboler.warofattrition;

import org.junit.Test;

import static com.cboler.warofattrition.GameUrlPolicy.Target.BLOCKED;
import static com.cboler.warofattrition.GameUrlPolicy.Target.EXTERNAL;
import static com.cboler.warofattrition.GameUrlPolicy.Target.GAME;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class GameUrlPolicyTest {
    private final GameUrlPolicy release = new GameUrlPolicy(false);
    private final GameUrlPolicy debug = new GameUrlPolicy(true);

    @Test
    public void gamePagesStayInTheApp() {
        assertEquals(GAME, release.classify("https://cboler.github.io/war-of-attrition-game/"));
        assertEquals(GAME, release.classify("https://cboler.github.io/war-of-attrition-game/?twa=1"));
        assertEquals(GAME, release.classify("https://cboler.github.io/war-of-attrition-game/privacy/"));
        assertEquals(GAME, release.classify("https://cboler.github.io/war-of-attrition-game"));
        assertEquals(GAME, release.classify("about:blank"));
    }

    @Test
    public void otherSitesOpenInTheBrowser() {
        assertEquals(EXTERNAL, release.classify("https://policies.google.com/privacy"));
        assertEquals(EXTERNAL, release.classify("https://cboler.github.io/"));
        assertEquals(EXTERNAL, release.classify("https://cboler.github.io/war-of-attrition-gamex/"));
        assertEquals(EXTERNAL, release.classify("https://cboler.github.io.evil.example/war-of-attrition-game/"));
        assertEquals(EXTERNAL, release.classify("http://cboler.github.io/war-of-attrition-game/"));
        assertEquals(EXTERNAL, release.classify("mailto:someone@example.com"));
    }

    @Test
    public void dangerousSchemesAreBlocked() {
        assertEquals(BLOCKED, release.classify("javascript:alert(1)"));
        assertEquals(BLOCKED, release.classify("file:///sdcard/x.html"));
        assertEquals(BLOCKED, release.classify("intent://scan/#Intent;scheme=zxing;end"));
        assertEquals(BLOCKED, release.classify("content://com.example/data"));
        assertEquals(BLOCKED, release.classify(""));
        assertEquals(BLOCKED, release.classify(null));
        assertEquals(BLOCKED, release.classify("ht tp://bad url"));
    }

    @Test
    public void localDevServerOnlyInDebug() {
        assertEquals(EXTERNAL, release.classify("http://localhost:4205/"));
        assertEquals(GAME, debug.classify("http://localhost:4205/"));
        assertEquals(GAME, debug.classify("http://127.0.0.1:4205/privacy"));
    }

    @Test
    public void bridgeOriginCheck() {
        assertTrue(release.isGameUrl("https://cboler.github.io/war-of-attrition-game/"));
        assertFalse(release.isGameUrl("https://cboler.github.io:8443/war-of-attrition-game/"));
        assertFalse(release.isGameUrl("not a url"));
    }
}
