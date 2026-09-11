package com.cboler.warofattrition;

import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Unit tests for PlayGamesBridge covering exception categorization, response formatting,
 * message protocol validation, and error handling.
 */
public class PlayGamesBridgeTest {

    private PlayGamesBridge bridge;
    private List<String> capturedResponses;

    @Before
    public void setUp() {
        bridge = new PlayGamesBridge(null);
        capturedResponses = new ArrayList<>();
        bridge.setResponseCallback(capturedResponses::add);
    }

    @Test
    public void testCategorizeExceptionWithApiExceptionStatusCodes() {
        ApiException signInReq = new ApiException(new Status(CommonStatusCodes.SIGN_IN_REQUIRED, "Sign in needed"));
        assertTrue(PlayGamesBridge.categorizeException(signInReq).contains("Sign-in required"));

        ApiException networkErr = new ApiException(new Status(CommonStatusCodes.NETWORK_ERROR, "No connection"));
        assertTrue(PlayGamesBridge.categorizeException(networkErr).contains("Network/transient failure"));

        ApiException devErr = new ApiException(new Status(CommonStatusCodes.DEVELOPER_ERROR, "Config mismatch"));
        assertTrue(PlayGamesBridge.categorizeException(devErr).contains("Developer/configuration error"));
        assertTrue(PlayGamesBridge.categorizeException(devErr).contains("check package name/SHA-1"));

        ApiException apiNotConnected = new ApiException(new Status(CommonStatusCodes.API_NOT_CONNECTED, "Unavailable"));
        assertTrue(PlayGamesBridge.categorizeException(apiNotConnected).contains("API unavailable/not connected"));

        ApiException internalErr = new ApiException(new Status(CommonStatusCodes.INTERNAL_ERROR, "Internal"));
        assertTrue(PlayGamesBridge.categorizeException(internalErr).contains("Internal Google Play Services error"));

        ApiException otherApi = new ApiException(new Status(9999, "Custom code"));
        assertTrue(PlayGamesBridge.categorizeException(otherApi).contains("Play Games API error"));
    }

    @Test
    public void testCategorizeExceptionWithGenericThrowable() {
        assertEquals("Unknown error", PlayGamesBridge.categorizeException(null));

        NullPointerException npe = new NullPointerException("Null reference test");
        assertEquals("NullPointerException: Null reference test", PlayGamesBridge.categorizeException(npe));

        IllegalStateException ise = new IllegalStateException("Not ready");
        assertEquals("IllegalStateException: Not ready", PlayGamesBridge.categorizeException(ise));
    }

    @Test
    public void testSendToWebFormatsValidProtocolPayload() throws Exception {
        bridge.sendToWeb("ACHIEVEMENT_SYNCED", "war.first_casualty", "CgkIz5juh94JEAIQDA", null);

        assertEquals(1, capturedResponses.size());
        JSONObject json = new JSONObject(capturedResponses.get(0));
        assertEquals("v1", json.getString("version"));
        assertEquals("ACHIEVEMENT_SYNCED", json.getString("type"));
        assertEquals("war.first_casualty", json.getString("internalAchievementId"));
        assertEquals("CgkIz5juh94JEAIQDA", json.getString("playGamesAchievementId"));
        assertFalse(json.has("error"));
    }

    @Test
    public void testSendToWebWithFailurePayload() throws Exception {
        bridge.sendToWeb("ACHIEVEMENT_SYNC_FAILED", "war.first_casualty", "CgkIz5juh94JEAIQDA", "Sign-in required");

        assertEquals(1, capturedResponses.size());
        JSONObject json = new JSONObject(capturedResponses.get(0));
        assertEquals("v1", json.getString("version"));
        assertEquals("ACHIEVEMENT_SYNC_FAILED", json.getString("type"));
        assertEquals("war.first_casualty", json.getString("internalAchievementId"));
        assertEquals("CgkIz5juh94JEAIQDA", json.getString("playGamesAchievementId"));
        assertEquals("Sign-in required", json.getString("error"));
    }

    @Test
    public void testHandleWebMessageRejectsUnsupportedVersion() {
        bridge.handleWebMessage("{\"version\":\"v2\",\"type\":\"PLAY_GAMES_INIT\"}");
        assertEquals(0, capturedResponses.size());
    }

    @Test
    public void testHandleWebMessageRejectsMalformedJsonGracefully() {
        bridge.handleWebMessage(null);
        bridge.handleWebMessage("");
        bridge.handleWebMessage("   ");
        bridge.handleWebMessage("{not-valid-json}");
        assertEquals(0, capturedResponses.size());
    }

    @Test
    public void testInitializeWithNullActivityReportsUnavailable() throws Exception {
        bridge.initialize();

        assertEquals(1, capturedResponses.size());
        JSONObject json = new JSONObject(capturedResponses.get(0));
        assertEquals("v1", json.getString("version"));
        assertEquals("PLAY_GAMES_UNAVAILABLE", json.getString("type"));
        assertFalse(bridge.isInitialized());
        assertFalse(bridge.isSignedIn());
    }

    @Test
    public void testUnlockAchievementWithEmptyIdSkipsWithoutCrashing() {
        bridge.unlockAchievement("war.first_casualty", "");
        bridge.unlockAchievement("war.first_casualty", null);
        assertEquals(0, capturedResponses.size());
    }

    @Test
    public void testSetAchievementStepsWithEmptyIdSkipsWithoutCrashing() {
        bridge.setAchievementSteps("profile.veteran", "", 10);
        bridge.setAchievementSteps("profile.veteran", null, 10);
        assertEquals(0, capturedResponses.size());
    }
}
