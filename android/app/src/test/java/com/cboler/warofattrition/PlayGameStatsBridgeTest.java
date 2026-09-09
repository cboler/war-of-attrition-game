package com.cboler.warofattrition;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class PlayGameStatsBridgeTest {

    private JSONObject validStandardWin;

    @Before
    public void setUp() throws Exception {
        validStandardWin = new JSONObject();
        validStandardWin.put("stats_schema_version", 1);
        validStandardWin.put("ruleset_version", "2026.09.1");
        validStandardWin.put("app_version", "4.2.1");
        validStandardWin.put("commander_id", "quartermaster");
        validStandardWin.put("campaign_kind", "story");
        validStandardWin.put("campaign_mode", "standard");
        validStandardWin.put("campaign_modifiers", "none");
        validStandardWin.put("campaign_war_index", 1);
        validStandardWin.put("outcome", "player_win");
        validStandardWin.put("player_win", 1);
        validStandardWin.put("turns", 15);
        validStandardWin.put("comeback_deficit", 0);
        validStandardWin.put("battles", 2);
        validStandardWin.put("deepest_battle", 1);
        validStandardWin.put("reinforcements_sent", 3);
        validStandardWin.put("successful_reinforcements", 2);
        validStandardWin.put("aces_felled_by_twos", 1);
        validStandardWin.put("war_margin", 12);
        validStandardWin.put("anomalies_observed", 0);
    }

    private JSONObject copyOf(JSONObject src) throws Exception {
        return new JSONObject(src.toString());
    }

    @Test
    public void testValidStandardWin() {
        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(validStandardWin);
        assertTrue(result.errorMessage, result.isValid);
    }

    @Test
    public void testValidOpponentWinWithNegativeMargin() throws Exception {
        JSONObject payload = copyOf(validStandardWin);
        payload.put("outcome", "opponent_win");
        payload.put("player_win", 0);
        payload.put("war_margin", -8);

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
        assertTrue(result.errorMessage, result.isValid);
    }

    @Test
    public void testValidTieWithZeroMargin() throws Exception {
        JSONObject payload = copyOf(validStandardWin);
        payload.put("outcome", "tie");
        payload.put("player_win", 0);
        payload.put("war_margin", 0);

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
        assertTrue(result.errorMessage, result.isValid);
    }

    @Test
    public void testCommanderIdsAllowed() throws Exception {
        String[] allowed = {"quartermaster", "gambler", "analyst", "attritionist", "cornered-general"};
        for (String commander : allowed) {
            JSONObject payload = copyOf(validStandardWin);
            payload.put("commander_id", commander);
            PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
            assertTrue("Expected commander " + commander + " to be valid", result.isValid);
        }

        JSONObject invalidCommander = copyOf(validStandardWin);
        invalidCommander.put("commander_id", "invalid_commander");
        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(invalidCommander);
        assertFalse(result.isValid);
        assertTrue(result.errorMessage.contains("Invalid commander_id"));
    }

    @Test
    public void testAllEightCanonicalModifierStacks() throws Exception {
        String[] stacks = {
            "none",
            "limited_reserves",
            "fog_of_war",
            "total_war",
            "limited_reserves+fog_of_war",
            "limited_reserves+total_war",
            "fog_of_war+total_war",
            "limited_reserves+fog_of_war+total_war"
        };

        for (String stack : stacks) {
            JSONObject payload = copyOf(validStandardWin);
            payload.put("campaign_modifiers", stack);
            if (stack.contains("limited_reserves")) {
                payload.put("reserves_at_war_start", 4);
            }
            PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
            assertTrue("Expected stack " + stack + " to be valid", result.isValid);
        }
    }

    @Test
    public void testArbitraryModifierOrderRejected() throws Exception {
        JSONObject payload = copyOf(validStandardWin);
        payload.put("campaign_modifiers", "fog_of_war+limited_reserves");
        payload.put("reserves_at_war_start", 4);

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
        assertFalse(result.isValid);
        assertTrue(result.errorMessage.contains("Invalid campaign_modifiers"));
    }

    @Test
    public void testReservesAtWarStartRequiredWhenLimitedReservesActive() throws Exception {
        JSONObject payload = copyOf(validStandardWin);
        payload.put("campaign_modifiers", "limited_reserves");
        // Missing reserves_at_war_start

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
        assertFalse(result.isValid);
        assertTrue(result.errorMessage.contains("reserves_at_war_start is required"));
    }

    @Test
    public void testReservesAtWarStartForbiddenWhenLimitedReservesAbsent() throws Exception {
        JSONObject payload = copyOf(validStandardWin);
        payload.put("campaign_modifiers", "none");
        payload.put("reserves_at_war_start", 5);

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(payload);
        assertFalse(result.isValid);
        assertTrue(result.errorMessage.contains("reserves_at_war_start must not be present"));
    }

    @Test
    public void testMarginSignAgreement() throws Exception {
        // Player win with negative margin
        JSONObject winNegative = copyOf(validStandardWin);
        winNegative.put("war_margin", -1);
        assertFalse(PlayGameStatsBridge.validatePayload(winNegative).isValid);

        // Player win with zero margin
        JSONObject winZero = copyOf(validStandardWin);
        winZero.put("war_margin", 0);
        assertFalse(PlayGameStatsBridge.validatePayload(winZero).isValid);

        // Opponent win with positive margin
        JSONObject lossPositive = copyOf(validStandardWin);
        lossPositive.put("outcome", "opponent_win");
        lossPositive.put("player_win", 0);
        lossPositive.put("war_margin", 2);
        assertFalse(PlayGameStatsBridge.validatePayload(lossPositive).isValid);

        // Tie with non-zero margin
        JSONObject tieNonZero = copyOf(validStandardWin);
        tieNonZero.put("outcome", "tie");
        tieNonZero.put("player_win", 0);
        tieNonZero.put("war_margin", 1);
        assertFalse(PlayGameStatsBridge.validatePayload(tieNonZero).isValid);
    }

    @Test
    public void testTurnAndBattleBoundaries() throws Exception {
        // turns 0 rejected
        JSONObject t0 = copyOf(validStandardWin);
        t0.put("turns", 0);
        assertFalse(PlayGameStatsBridge.validatePayload(t0).isValid);

        // turns 1 valid when battles and reinforcements <= 1
        JSONObject t1 = copyOf(validStandardWin);
        t1.put("turns", 1);
        t1.put("battles", 1);
        t1.put("reinforcements_sent", 1);
        t1.put("successful_reinforcements", 1);
        assertTrue(PlayGameStatsBridge.validatePayload(t1).isValid);

        // turns 51 valid
        JSONObject t51 = copyOf(validStandardWin);
        t51.put("turns", 51);
        assertTrue(PlayGameStatsBridge.validatePayload(t51).isValid);

        // turns 52 rejected
        JSONObject t52 = copyOf(validStandardWin);
        t52.put("turns", 52);
        assertFalse(PlayGameStatsBridge.validatePayload(t52).isValid);

        // battles > turns rejected
        JSONObject bgt = copyOf(validStandardWin);
        bgt.put("turns", 5);
        bgt.put("battles", 6);
        assertFalse(PlayGameStatsBridge.validatePayload(bgt).isValid);
    }

    @Test
    public void testReinforcementConstraints() throws Exception {
        // successful > reinforcements_sent rejected
        JSONObject invalidReinf = copyOf(validStandardWin);
        invalidReinf.put("reinforcements_sent", 2);
        invalidReinf.put("successful_reinforcements", 3);
        assertFalse(PlayGameStatsBridge.validatePayload(invalidReinf).isValid);

        // reinforcements_sent > turns rejected
        JSONObject reinfExceedsTurns = copyOf(validStandardWin);
        reinfExceedsTurns.put("turns", 2);
        reinfExceedsTurns.put("reinforcements_sent", 3);
        reinfExceedsTurns.put("successful_reinforcements", 2);
        assertFalse(PlayGameStatsBridge.validatePayload(reinfExceedsTurns).isValid);
    }

    @Test
    public void testDeepestBattleAndAcesFelledBounds() throws Exception {
        // deepest_battle 0..8
        JSONObject db8 = copyOf(validStandardWin);
        db8.put("deepest_battle", 8);
        assertTrue(PlayGameStatsBridge.validatePayload(db8).isValid);

        JSONObject db9 = copyOf(validStandardWin);
        db9.put("deepest_battle", 9);
        assertFalse(PlayGameStatsBridge.validatePayload(db9).isValid);

        // aces_felled_by_twos 0..2
        JSONObject af2 = copyOf(validStandardWin);
        af2.put("aces_felled_by_twos", 2);
        assertTrue(PlayGameStatsBridge.validatePayload(af2).isValid);

        JSONObject af3 = copyOf(validStandardWin);
        af3.put("aces_felled_by_twos", 3);
        assertFalse(PlayGameStatsBridge.validatePayload(af3).isValid);
    }

    @Test
    public void testAnomaliesObservedBounds() throws Exception {
        JSONObject fiveAnomalies = copyOf(validStandardWin);
        fiveAnomalies.put("anomalies_observed", 5);
        assertTrue(PlayGameStatsBridge.validatePayload(fiveAnomalies).isValid);

        JSONObject negativeAnomalies = copyOf(validStandardWin);
        negativeAnomalies.put("anomalies_observed", -1);
        assertFalse(PlayGameStatsBridge.validatePayload(negativeAnomalies).isValid);

        JSONObject tooManyAnomalies = copyOf(validStandardWin);
        tooManyAnomalies.put("anomalies_observed", 6);
        assertFalse(PlayGameStatsBridge.validatePayload(tooManyAnomalies).isValid);
    }

    @Test
    public void testStrictWhitelistRejection() throws Exception {
        JSONObject extraProp = copyOf(validStandardWin);
        extraProp.put("extra_telemetry", 123);

        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(extraProp);
        assertFalse(result.isValid);
        assertTrue(result.errorMessage.contains("Unknown property"));
    }

    @Test
    public void testCampaignKindAndWarIndexBounds() throws Exception {
        JSONObject validStory = copyOf(validStandardWin);
        validStory.put("campaign_kind", "story");
        assertTrue(PlayGameStatsBridge.validatePayload(validStory).isValid);

        JSONObject validCustom = copyOf(validStandardWin);
        validCustom.put("campaign_kind", "custom");
        assertTrue(PlayGameStatsBridge.validatePayload(validCustom).isValid);

        JSONObject invalidKind = copyOf(validStandardWin);
        invalidKind.put("campaign_kind", "endless");
        assertFalse(PlayGameStatsBridge.validatePayload(invalidKind).isValid);

        // war index 1..3
        JSONObject wi1 = copyOf(validStandardWin);
        wi1.put("campaign_war_index", 1);
        assertTrue(PlayGameStatsBridge.validatePayload(wi1).isValid);

        JSONObject wi3 = copyOf(validStandardWin);
        wi3.put("campaign_war_index", 3);
        assertTrue(PlayGameStatsBridge.validatePayload(wi3).isValid);

        JSONObject wi0 = copyOf(validStandardWin);
        wi0.put("campaign_war_index", 0);
        assertFalse(PlayGameStatsBridge.validatePayload(wi0).isValid);

        JSONObject wi4 = copyOf(validStandardWin);
        wi4.put("campaign_war_index", 4);
        assertFalse(PlayGameStatsBridge.validatePayload(wi4).isValid);
    }

    @Test
    public void testNullPayload() {
        PlayGameStatsBridge.ValidationResult result = PlayGameStatsBridge.validatePayload(null);
        assertFalse(result.isValid);
    }

    @Test
    public void testWebMessageProtocolHandling() throws Exception {
        PlayGameStatsBridge bridge = new PlayGameStatsBridge(null);
        final List<String> responses = new ArrayList<>();
        bridge.setResponseCallback(responses::add);

        // Unknown protocol version rejected
        JSONObject badVersion = new JSONObject();
        badVersion.put("version", "v2");
        badVersion.put("type", "GAME_STATS_INIT");
        bridge.handleWebMessage(badVersion.toString());
        assertEquals(0, responses.size());

        // Null / empty message ignored
        bridge.handleWebMessage(null);
        bridge.handleWebMessage("   ");
        assertEquals(0, responses.size());

        // RECORD_GAME_STATS with missing warId
        JSONObject missingWarId = new JSONObject();
        missingWarId.put("version", "v1");
        missingWarId.put("type", "RECORD_GAME_STATS");
        bridge.handleWebMessage(missingWarId.toString());
        assertEquals(1, responses.size());
        JSONObject respObj = new JSONObject(responses.get(0));
        assertEquals("GAME_STATS_REJECTED", respObj.getString("type"));
        assertEquals("missing_war_id", respObj.getString("reason"));

        // RECORD_GAME_STATS with invalid payload
        responses.clear();
        JSONObject invalidReq = new JSONObject();
        invalidReq.put("version", "v1");
        invalidReq.put("type", "RECORD_GAME_STATS");
        invalidReq.put("warId", "war-123");
        JSONObject badPayload = copyOf(validStandardWin);
        badPayload.put("turns", 999);
        invalidReq.put("payload", badPayload);
        bridge.handleWebMessage(invalidReq.toString());
        assertEquals(1, responses.size());
        JSONObject respObj2 = new JSONObject(responses.get(0));
        assertEquals("GAME_STATS_REJECTED", respObj2.getString("type"));
        assertEquals("war-123", respObj2.getString("warId"));
        assertTrue(respObj2.getString("reason").contains("turns"));
    }
}
