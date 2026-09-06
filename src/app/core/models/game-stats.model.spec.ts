import {
  WarCompletedStatsPayload,
  validateWarCompletedPayload,
  GAME_STATS_SCHEMA_VERSION,
  VALID_COMMANDER_IDS,
  VALID_CAMPAIGN_MODIFIER_STACKS
} from './game-stats.model';

describe('validateWarCompletedPayload', () => {
  const validStandardWin: WarCompletedStatsPayload = {
    stats_schema_version: 1,
    ruleset_version: '2026.09.1',
    app_version: '4.2.1',
    commander_id: 'quartermaster',
    campaign_kind: 'story',
    campaign_mode: 'standard',
    campaign_modifiers: 'none',
    campaign_war_index: 1,
    outcome: 'player_win',
    player_win: 1,
    turns: 15,
    comeback_deficit: 0,
    battles: 2,
    deepest_battle: 1,
    reinforcements_sent: 3,
    successful_reinforcements: 2,
    aces_felled_by_twos: 1,
    war_margin: 12
  };

  it('validates a correct standard player win payload', () => {
    const result = validateWarCompletedPayload(validStandardWin);
    expect(result.valid).toBeTrue();
    if (result.valid) {
      expect(result.data).toEqual(validStandardWin);
    }
  });

  it('validates a correct opponent win with negative margin', () => {
    const lossPayload = {
      ...validStandardWin,
      outcome: 'opponent_win',
      player_win: 0,
      comeback_deficit: 0,
      war_margin: -8
    };
    const result = validateWarCompletedPayload(lossPayload);
    expect(result.valid).toBeTrue();
  });

  it('validates a true tie with zero margin and zero player_win', () => {
    const tiePayload = {
      ...validStandardWin,
      outcome: 'tie',
      player_win: 0,
      comeback_deficit: 0,
      war_margin: 0
    };
    const result = validateWarCompletedPayload(tiePayload);
    expect(result.valid).toBeTrue();
  });

  it('validates a qualifying comeback victory (>= 3 cards)', () => {
    const comebackPayload = {
      ...validStandardWin,
      comeback_deficit: 5
    };
    const result = validateWarCompletedPayload(comebackPayload);
    expect(result.valid).toBeTrue();
  });

  it('rejects a comeback deficit of 1 or 2', () => {
    const result1 = validateWarCompletedPayload({ ...validStandardWin, comeback_deficit: 1 });
    expect(result1.valid).toBeFalse();
    if (!result1.valid) {
      expect(result1.error).toContain('comeback_deficit');
    }

    const result2 = validateWarCompletedPayload({ ...validStandardWin, comeback_deficit: 2 });
    expect(result2.valid).toBeFalse();
  });

  it('rejects a positive comeback deficit on a loss or tie', () => {
    const lossWithComeback = {
      ...validStandardWin,
      outcome: 'opponent_win',
      player_win: 0,
      comeback_deficit: 4,
      war_margin: -6
    };
    const result = validateWarCompletedPayload(lossWithComeback);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('comeback_deficit must be 0 for non-wins');
    }
  });

  it('requires reserves_at_war_start when limited_reserves is present', () => {
    const lrPayloadWithoutReserves = {
      ...validStandardWin,
      campaign_mode: 'limited_reserves' as const,
      campaign_modifiers: 'limited_reserves' as const
    };
    const result = validateWarCompletedPayload(lrPayloadWithoutReserves);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('reserves_at_war_start must be integer 0..5');
    }

    const lrPayloadValid = {
      ...lrPayloadWithoutReserves,
      reserves_at_war_start: 5,
      reinforcements_sent: 3
    };
    const validResult = validateWarCompletedPayload(lrPayloadValid);
    expect(validResult.valid).toBeTrue();
  });

  it('forbids reserves_at_war_start when limited_reserves is not present', () => {
    const payloadWithUnneededReserves = {
      ...validStandardWin,
      reserves_at_war_start: 4
    };
    const result = validateWarCompletedPayload(payloadWithUnneededReserves);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('reserves_at_war_start must be omitted');
    }
  });

  it('rejects reinforcements_sent exceeding reserves_at_war_start under limited_reserves', () => {
    const invalidLR = {
      ...validStandardWin,
      campaign_mode: 'limited_reserves' as const,
      campaign_modifiers: 'limited_reserves' as const,
      reserves_at_war_start: 2,
      reinforcements_sent: 3
    };
    const result = validateWarCompletedPayload(invalidLR);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('cannot exceed reserves_at_war_start');
    }
  });

  it('validates all 5 permanent commander IDs and rejects display names or unknown IDs', () => {
    for (const commanderId of VALID_COMMANDER_IDS) {
      const result = validateWarCompletedPayload({
        ...validStandardWin,
        commander_id: commanderId
      });
      expect(result.valid).toBeTrue();
    }

    const resultDisplayName = validateWarCompletedPayload({
      ...validStandardWin,
      commander_id: 'Marcel' as any
    });
    expect(resultDisplayName.valid).toBeFalse();

    const resultUnknown = validateWarCompletedPayload({
      ...validStandardWin,
      commander_id: 'unknown_commander' as any
    });
    expect(resultUnknown.valid).toBeFalse();
  });

  it('validates all 8 canonical campaign modifier stacks and rejects arbitrary order', () => {
    for (const stack of VALID_CAMPAIGN_MODIFIER_STACKS) {
      const payload: any = {
        ...validStandardWin,
        campaign_modifiers: stack
      };
      if (stack.includes('limited_reserves')) {
        payload.reserves_at_war_start = 4;
      }
      const result = validateWarCompletedPayload(payload);
      expect(result.valid).toBeTrue();
    }

    const reversedStack = {
      ...validStandardWin,
      campaign_modifiers: 'fog_of_war+limited_reserves' as any,
      reserves_at_war_start: 4
    };
    const result = validateWarCompletedPayload(reversedStack);
    expect(result.valid).toBeFalse();
  });

  it('enforces margin sign agreement with outcome', () => {
    const winWithNegativeMargin = { ...validStandardWin, war_margin: -5 };
    expect(validateWarCompletedPayload(winWithNegativeMargin).valid).toBeFalse();

    const winWithZeroMargin = { ...validStandardWin, war_margin: 0 };
    expect(validateWarCompletedPayload(winWithZeroMargin).valid).toBeFalse();

    const lossWithPositiveMargin = {
      ...validStandardWin,
      outcome: 'opponent_win' as const,
      player_win: 0 as const,
      war_margin: 4
    };
    expect(validateWarCompletedPayload(lossWithPositiveMargin).valid).toBeFalse();

    const tieWithNonZeroMargin = {
      ...validStandardWin,
      outcome: 'tie' as const,
      player_win: 0 as const,
      war_margin: 1
    };
    expect(validateWarCompletedPayload(tieWithNonZeroMargin).valid).toBeFalse();
  });

  it('enforces turn boundaries (1..51)', () => {
    expect(validateWarCompletedPayload({ ...validStandardWin, turns: 0 }).valid).toBeFalse();
    expect(validateWarCompletedPayload({ ...validStandardWin, turns: 1, battles: 1, reinforcements_sent: 1, successful_reinforcements: 1 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, turns: 51 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, turns: 52 }).valid).toBeFalse();
  });

  it('enforces deepest_battle bounds (0..8)', () => {
    expect(validateWarCompletedPayload({ ...validStandardWin, deepest_battle: 0 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, deepest_battle: 8 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, deepest_battle: 9 }).valid).toBeFalse();
    expect(validateWarCompletedPayload({ ...validStandardWin, deepest_battle: -1 }).valid).toBeFalse();
  });

  it('enforces successful_reinforcements <= reinforcements_sent', () => {
    const invalid = {
      ...validStandardWin,
      reinforcements_sent: 2,
      successful_reinforcements: 3
    };
    const result = validateWarCompletedPayload(invalid);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('successful_reinforcements');
    }
  });

  it('enforces aces_felled_by_twos range (0..2)', () => {
    expect(validateWarCompletedPayload({ ...validStandardWin, aces_felled_by_twos: 0 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, aces_felled_by_twos: 2 }).valid).toBeTrue();
    expect(validateWarCompletedPayload({ ...validStandardWin, aces_felled_by_twos: 3 }).valid).toBeFalse();
  });

  it('strictly rejects unknown properties (whitelist check)', () => {
    const withExtra = {
      ...validStandardWin,
      warId: 'should-not-be-in-google-payload'
    };
    const result = validateWarCompletedPayload(withExtra);
    expect(result.valid).toBeFalse();
    if (!result.valid) {
      expect(result.error).toContain('Unknown property');
    }
  });

  it('rejects non-object or null input', () => {
    expect(validateWarCompletedPayload(null).valid).toBeFalse();
    expect(validateWarCompletedPayload(undefined).valid).toBeFalse();
    expect(validateWarCompletedPayload('string').valid).toBeFalse();
    expect(validateWarCompletedPayload([1, 2, 3]).valid).toBeFalse();
  });
});
