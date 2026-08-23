import { TestBed } from '@angular/core/testing';
import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { TelemetryRecord } from '../core/models/telemetry.model';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { ComparisonResult } from '../core/services/card-comparison.service';
import { GameEventBusService } from './game-event-bus.service';
import { GameTelemetryService } from './game-telemetry.service';
import {
  GAME_TELEMETRY_CONFIG,
  GAME_TELEMETRY_TRANSPORT,
  TelemetryTransport
} from './telemetry-transport.service';
import { TelemetryConsentService } from './telemetry-consent.service';

class CapturingTransport implements TelemetryTransport {
  readonly records: TelemetryRecord[] = [];
  send(record: TelemetryRecord): void {
    this.records.push(record);
  }
}

describe('GameTelemetryService', () => {
  let transport: CapturingTransport;
  let service: GameTelemetryService;
  let eventBus: GameEventBusService;
  let progression: CampaignProgressionService;
  let authService: AuthService;
  let consent: TelemetryConsentService;

  beforeEach(() => {
    localStorage.clear();
    transport = new CapturingTransport();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        CampaignProgressionService,
        GameEventBusService,
        GameTelemetryService,
        { provide: GAME_TELEMETRY_TRANSPORT, useValue: transport },
        {
          provide: GAME_TELEMETRY_CONFIG,
          useValue: {
            measurementId: 'G-TEST123',
            appVersion: '1.2.3-test',
            rulesetVersion: 'rules-test'
          }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    progression = TestBed.inject(CampaignProgressionService);
    eventBus = TestBed.inject(GameEventBusService);
    consent = TestBed.inject(TelemetryConsentService);
    consent.setAnalyticsConsent('granted');
    service = TestBed.inject(GameTelemetryService);
  });

  afterEach(() => localStorage.clear());

  it('subscribes to the event bus with stable versioned War context', () => {
    service.beginWar({
      warId: 'war-explicit',
      campaignId: 'campaign-explicit',
      campaignWarIndex: 2,
      playerDeckColor: DeckColor.BLACK
    });
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 1,
      playerCard: new CardImpl(Suit.CLUBS, Rank.ACE),
      opponentCard: new CardImpl(Suit.HEARTS, Rank.TWO),
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      specialRule: true,
      message: 'do not transmit this message'
    });

    expect(transport.records.map(record => record.name)).toEqual([
      'war_started',
      'comparison_resolved'
    ]);
    const comparison = transport.records[1].parameters;
    expect(comparison['war_id']).toBe('war-explicit');
    expect(comparison['campaign_id']).toBe('campaign-explicit');
    expect(comparison['schema_version']).toBe(1);
    expect(comparison['ruleset_version']).toBe('rules-test');
    expect(comparison['app_version']).toBe('1.2.3-test');
    expect(comparison['event_seq']).toBe(2);
    expect(JSON.stringify(comparison)).not.toContain('do not transmit this message');
  });

  it('never includes active profile PII in whitelisted records', () => {
    authService.signInWithGoogle({
      name: 'Private Commander',
      email: 'private@example.com',
      googleId: 'private-google-sub',
      avatarUrl: 'https://example.com/private-avatar.png'
    });
    service.beginWar({ playerDeckColor: DeckColor.RED });
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });

    const serialized = JSON.stringify(transport.records);
    expect(serialized).not.toContain('Private Commander');
    expect(serialized).not.toContain('private@example.com');
    expect(serialized).not.toContain('private-google-sub');
    expect(serialized).not.toContain('private-avatar');
  });

  it('keeps already-contributed telemetry separate when profile statistics reset', () => {
    service.beginWar({ warId: 'telemetry-survives-profile-reset', playerDeckColor: DeckColor.RED });
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });
    const contributedRecords = transport.records.map(record => ({
      name: record.name,
      parameters: { ...record.parameters }
    }));

    authService.recordGameResult({ outcome: 'player_win', turns: 8, durationMs: 1_000 });
    authService.resetActiveUserStats();

    expect(authService.userStats().gamesPlayed).toBe(0);
    expect(transport.records).toEqual(contributedRecords);
  });

  it('does not invent a War context from an arbitrary or nested event', () => {
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });
    expect(transport.records).toEqual([]);
    expect(service.currentWarContext()).toBeNull();
  });

  it('does not duplicate a domain war_started event', () => {
    service.beginWar({ warId: 'one-start', playerDeckColor: DeckColor.RED });
    eventBus.emit({
      type: 'war_started',
      turnNumber: 0,
      playerDeckColor: DeckColor.RED
    });
    expect(transport.records.filter(record => record.name === 'war_started').length).toBe(1);
  });

  it('keeps nested terminal achievements on the resolved War and does not close an immediate new War', async () => {
    service.beginWar({ warId: 'resolved-war', playerDeckColor: DeckColor.RED });
    eventBus.events$.subscribe(event => {
      if (event.type !== 'game_resolved') return;
      eventBus.emit({
        type: 'achievement_unlocked',
        turnNumber: event.turnNumber,
        achievementId: 'profile.first_victory',
        name: 'First Victory',
        description: 'not collected',
        icon: 'emoji_events'
      });
      service.beginWar({ warId: 'next-war', playerDeckColor: DeckColor.BLACK });
    });

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 10,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 10,
      playerCardsRemaining: 4,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
      playerDeckColor: DeckColor.RED
    });
    await Promise.resolve();

    expect(transport.records.map(record => record.name)).toEqual([
      'war_started',
      'war_resolved',
      'achievement_unlocked',
      'war_started'
    ]);
    expect(transport.records[2].parameters['war_id']).toBe('resolved-war');
    expect(service.currentWarContext()?.warId).toBe('next-war');
  });

  it('defers a mid-War consent grant until the next canonical War start', () => {
    consent.setAnalyticsConsent('denied');
    service.beginWar({ warId: 'denied-war', playerDeckColor: DeckColor.RED });
    consent.setAnalyticsConsent('granted');
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });
    progression.recordResolvedWar(war('uncollected-1', GameOutcome.PLAYER_WIN, 4, 0));
    progression.recordResolvedWar(war('uncollected-2', GameOutcome.PLAYER_WIN, 3, 0));
    progression.recordResolvedWar(war('uncollected-3', GameOutcome.OPPONENT_WIN, 0, 1));
    expect(transport.records).toEqual([]);

    service.beginWar({ warId: 'consented-war', playerDeckColor: DeckColor.BLACK });
    expect(transport.records.map(record => record.name)).toEqual(['war_started']);
  });

  it('emits Campaign and token summaries from progression domain events', () => {
    service.beginWar({ warId: 'campaign-war-3', playerDeckColor: DeckColor.RED });
    progression.recordResolvedWar(war('campaign-war-1', GameOutcome.PLAYER_WIN, 5, 0));
    progression.recordResolvedWar(war('campaign-war-2', GameOutcome.PLAYER_WIN, 4, 0));
    progression.recordResolvedWar(war('campaign-war-3', GameOutcome.OPPONENT_WIN, 0, 2));

    const campaignRecord = transport.records.find(record => record.name === 'campaign_resolved');
    expect(campaignRecord).toBeTruthy();
    expect(campaignRecord?.parameters['wins']).toBe(2);
    expect(campaignRecord?.parameters['final_differential']).toBe(7);
    expect(campaignRecord?.parameters['tokens_earned']).toBe(2);
    expect(campaignRecord?.parameters['token_balance_after']).toBe(2);
    expect(campaignRecord?.parameters['campaign_mode']).toBe('standard');
  });

  it('emits campaign_mode and remaining_reserves for Limited Reserves Campaign', () => {
    progression.selectCampaignOrders('limited_reserves');
    progression.consumeHumanReserve();
    progression.consumeHumanReserve();

    service.beginWar({ warId: 'lr-war-3', playerDeckColor: DeckColor.RED });
    progression.recordResolvedWar(war('lr-war-1', GameOutcome.PLAYER_WIN, 4, 0));
    progression.recordResolvedWar(war('lr-war-2', GameOutcome.PLAYER_WIN, 3, 0));
    progression.recordResolvedWar(war('lr-war-3', GameOutcome.PLAYER_WIN, 2, 0));

    const campaignRecord = transport.records.find(record => record.name === 'campaign_resolved');
    expect(campaignRecord).toBeTruthy();
    expect(campaignRecord?.parameters['campaign_mode']).toBe('limited_reserves');
    expect(campaignRecord?.parameters['remaining_reserves']).toBe(3);

    const warStarted = transport.records.find(record => record.name === 'war_started');
    expect(warStarted?.parameters['campaign_mode']).toBe('limited_reserves');
  });

  it('emits campaign_mode: total_war for Total War Campaign', () => {
    progression.selectCampaignOrders('total_war');

    service.beginWar({ warId: 'tw-war-3', playerDeckColor: DeckColor.RED });
    progression.recordResolvedWar(war('tw-war-1', GameOutcome.PLAYER_WIN, 4, 0));
    progression.recordResolvedWar(war('tw-war-2', GameOutcome.OPPONENT_WIN, 0, 2));
    progression.recordResolvedWar(war('tw-war-3', GameOutcome.PLAYER_WIN, 2, 0));

    const campaignRecord = transport.records.find(record => record.name === 'campaign_resolved');
    expect(campaignRecord).toBeTruthy();
    expect(campaignRecord?.parameters['campaign_mode']).toBe('total_war');

    const warStarted = transport.records.find(record => record.name === 'war_started');
    expect(warStarted?.parameters['campaign_mode']).toBe('total_war');
  });

  it('emits campaign_mode: fog_of_war for Fog of War Campaign', () => {
    progression.selectCampaignOrders('fog_of_war');

    service.beginWar({ warId: 'fog-war-3', playerDeckColor: DeckColor.RED });
    progression.recordResolvedWar(war('fog-war-1', GameOutcome.PLAYER_WIN, 4, 0));
    progression.recordResolvedWar(war('fog-war-2', GameOutcome.OPPONENT_WIN, 0, 2));
    progression.recordResolvedWar(war('fog-war-3', GameOutcome.PLAYER_WIN, 2, 0));

    const campaignRecord = transport.records.find(record => record.name === 'campaign_resolved');
    expect(campaignRecord).toBeTruthy();
    expect(campaignRecord?.parameters['campaign_mode']).toBe('fog_of_war');

    const warStarted = transport.records.find(record => record.name === 'war_started');
    expect(warStarted?.parameters['campaign_mode']).toBe('fog_of_war');
  });
});

function war(
  warId: string,
  outcome: GameOutcome,
  playerCardsRemaining: number,
  opponentCardsRemaining: number
) {
  return {
    warId,
    outcome,
    playerCardsRemaining,
    opponentCardsRemaining,
    playerDeckColor: DeckColor.RED
  };
}
