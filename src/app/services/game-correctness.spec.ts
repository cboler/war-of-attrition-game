import { fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { CAMPAIGN_CHAPTER_ORDER } from '../core/models/campaign-chapter.model';
import { Card, Rank } from '../core/models/card.model';
import { Deck } from '../core/models/deck.model';
import { ChallengeResolvedEvent, GameEvent } from '../core/models/game-events.model';
import { ComparisonResult, DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { TelemetryRecord } from '../core/models/telemetry.model';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { DECK_ASSIGNMENT_RANDOM, GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { AchievementService } from './achievement.service';
import { GameControllerService, PresentationState } from './game-controller.service';
import { GameEventBusService } from './game-event-bus.service';
import { GameTelemetryService } from './game-telemetry.service';
import { HallOfValorService } from './hall-of-valor.service';
import { PresentationSequencerService } from './presentation-sequencer.service';
import { StoryBookService } from './story-book.service';
import { TableReactionService } from './table-reaction.service';
import { TelemetryConsentService } from './telemetry-consent.service';
import {
  GAME_TELEMETRY_CONFIG,
  GAME_TELEMETRY_TRANSPORT,
  normalizeTelemetryRecordForGa4,
} from './telemetry-transport.service';

describe('War context and reinforcement correctness', () => {
  let controller: GameControllerService;
  let state: GameStateService;
  let progression: CampaignProgressionService;
  let auth: AuthService;
  let telemetry: GameTelemetryService;
  let consent: TelemetryConsentService;
  let hall: HallOfValorService;
  let records: TelemetryRecord[];
  let events: GameEvent[];

  beforeEach(() => {
    localStorage.clear();
    records = [];
    events = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: DECK_ASSIGNMENT_RANDOM, useValue: () => 0 },
        { provide: GAME_TELEMETRY_TRANSPORT, useValue: {
          send: (record: TelemetryRecord) => records.push(record),
        } },
        { provide: GAME_TELEMETRY_CONFIG, useValue: {
          measurementId: 'G-TEST123', appVersion: 'test', rulesetVersion: '2026.09.1',
        } },
      ],
    });
    auth = TestBed.inject(AuthService);
    progression = TestBed.inject(CampaignProgressionService);
    consent = TestBed.inject(TelemetryConsentService);
    consent.setAnalyticsConsent('granted');
    const settings = TestBed.inject(SettingsService);
    settings.setTutorialEnabled(false);
    settings.setSoundEnabled(false);
    controller = TestBed.inject(GameControllerService);
    state = TestBed.inject(GameStateService);
    telemetry = TestBed.inject(GameTelemetryService);
    TestBed.inject(AchievementService);
    hall = TestBed.inject(HallOfValorService);
    TestBed.inject(GameEventBusService).events$.subscribe(event => events.push(event));
    // Preserve real game resolution while collapsing only presentation waits.
    spyOn(TestBed.inject(PresentationSequencerService), 'pause').and.resolveTo();
    spyOn(TestBed.inject(TableReactionService), 'forIntroduction').and.returnValue(null);
  });

  afterEach(() => localStorage.clear());

  const starts = () => records.filter(record => record.name === 'war_started');

  function customProfile(): void {
    auth.updateActiveProfileProgression(previous => ({
      ...previous,
      unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER],
      completedChapterModes: [...CAMPAIGN_CHAPTER_ORDER],
    }));
    progression.setRandomSource(() => 0);
  }

  /** Real canonical cards, draw order first; all other cards remain conserved in the Boneyard. */
  function decks(playerRanks: readonly Rank[], opponentRanks: readonly Rank[]): Card[] {
    const playerPool = Deck.createRedDeck().toArray();
    const opponentPool = Deck.createBlackDeck().toArray();
    const used = new Set<string>();
    const select = (pool: readonly Card[], ranks: readonly Rank[]) => ranks.map(rank => {
      const card = pool.find(candidate => candidate.rank === rank && !used.has(candidate.id))!;
      used.add(card.id);
      return card;
    });
    const player = select(playerPool, playerRanks);
    const opponent = select(opponentPool, opponentRanks);
    state.loadFixtureState({
      playerDeckCards: [...player].reverse(),
      opponentDeckCards: [...opponent].reverse(),
      discardCards: [...playerPool, ...opponentPool].filter(card => !used.has(card.id)),
      playerDeckColor: DeckColor.RED,
      turnNumber: 0,
    });
    return player;
  }

  function orderedWar(): void {
    progression.selectCampaignOrders('standard');
    controller.ensureGameStarted();
  }

  function humanReinforcement(player: readonly Rank[], opponent: readonly Rank[]): ChallengeResolvedEvent {
    orderedWar();
    decks(player, opponent);
    expect(controller.playerDrawCard()).toBeTrue();
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.PLAYER_CHALLENGE_DECISION);
    controller.handleChallenge(true);
    flushMicrotasks();
    return events.find((event): event is ChallengeResolvedEvent => event.type === 'challenge_resolved')!;
  }

  function expectNoRescue(event: ChallengeResolvedEvent): void {
    expect(event.challengerWon).toBeFalse();
    expect(event.savedTwo).toBeFalse();
    expect(auth.userStats().unlockedAchievements).not.toContain('war.first_rescue');
    expect(auth.userStats().unlockedAchievements).not.toContain('war.not_today');
    expect(auth.userStats().unlockedAchievements).not.toContain('war.cavalry_came');
    expect(hall.getRecord(event.reinforcementCard.id)?.reinforcementRescues ?? 0).toBe(0);
    expect(hall.getRecord(event.originalBeatenCard.id)?.timesRescued ?? 0).toBe(0);
  }

  it('defers fresh War 1 context and its single start until Orders are confirmed', () => {
    const begin = spyOn(telemetry, 'beginWar').and.callThrough();
    controller.ensureGameStarted();
    controller.ensureGameStarted();
    expect(state.hasGame()).toBeTrue();
    expect(controller.playerDrawCard()).toBeFalse();
    expect(begin).not.toHaveBeenCalled();
    expect(telemetry.currentWarContext()).toBeNull();
    expect(starts()).toEqual([]);

    progression.selectCampaignOrders('standard');
    controller.ensureGameStarted();
    controller.ensureGameStarted();
    expect(begin).toHaveBeenCalledTimes(1);
    expect(starts().length).toBe(1);
    expect(starts()[0].parameters['commander_id']).toBe(progression.currentCommanderId());
    expect(starts()[0].parameters['campaign_modifiers']).toBe('none');
    expect(events.filter(event => event.type === 'war_started').length).toBe(1);
  });

  it('captures randomized custom Orders and applies their final Fog redaction', fakeAsync(() => {
    customProfile();
    controller.ensureGameStarted();
    const before = progression.currentCommanderId();
    expect(starts()).toEqual([]);
    progression.selectCampaignOrders('standard', ['fog_of_war', 'limited_reserves']);
    expect(progression.currentCommanderId()).not.toBe(before);
    controller.ensureGameStarted();
    decks([Rank.TWO, Rank.ACE], [Rank.KING]);
    controller.playerDrawCard();
    flushMicrotasks();
    controller.handleChallenge(true);
    flushMicrotasks();

    expect(starts().length).toBe(1);
    const start = starts()[0];
    expect(start.parameters['commander_id']).toBe(progression.currentCampaign().wars[0].commanderId);
    expect(start.parameters['campaign_mode']).toBe('standard');
    expect(start.parameters['campaign_modifiers']).toBe('limited_reserves+fog_of_war');
    const clash = records.find(record => record.name === 'comparison_resolved')!;
    const reinforcement = records.find(record => record.name === 'reinforcement_resolved')!;
    expect(clash.parameters['player_card_id']).toBeUndefined();
    expect(reinforcement.parameters['reinforcement_id']).toBeUndefined();
    expect(reinforcement.parameters['original_card_id']).toBeUndefined();
    expect(reinforcement.parameters['rescued_two']).toBeUndefined();
    const terminal = records.find(record => record.name === 'war_resolved')!;
    expect(terminal.parameters['war_id']).toBe(start.parameters['war_id']);
    expect(terminal.parameters['commander_id']).toBe(start.parameters['commander_id']);
    expect(start.parameters['war_id']).toBe(progression.currentCampaign().wars[0].warId);
    flush();
  }));

  it('starts ordered Wars 1/2/3 once and defers the next Chapter until its Orders lock', fakeAsync(() => {
    orderedWar();
    const campaignId = progression.currentCampaign().campaignId;
    for (let index = 1; index <= 3; index++) {
      if (index > 1) controller.startNewGame();
      controller.ensureGameStarted();
      expect(starts().length).toBe(index);
      expect(starts()[index - 1].parameters['campaign_war_index']).toBe(index);
      expect(starts()[index - 1].parameters['campaign_id']).toBe(campaignId);
      decks([Rank.TWO], [Rank.ACE]);
      controller.playerDrawCard();
      flushMicrotasks();
    }
    controller.startNewGame();
    expect(progression.ordersSelected()).toBeFalse();
    expect(telemetry.currentWarContext()).toBeNull();
    expect(starts().length).toBe(3);
    progression.selectCampaignOrders('limited_reserves');
    controller.ensureGameStarted();
    expect(starts().length).toBe(4);
    expect(starts()[3].parameters['campaign_modifiers']).toBe('limited_reserves');
    expect(starts()[3].parameters['campaign_id']).not.toBe(campaignId);
    flush();
  }));

  it('guards the controller draw path when Orders close without a UI startup callback', fakeAsync(() => {
    controller.startNewGame();
    expect(controller.playerDrawCard()).toBeFalse();
    progression.selectCampaignOrders('standard');
    decks([Rank.TWO], [Rank.ACE]);
    expect(controller.playerDrawCard()).toBeTrue();
    flushMicrotasks();
    expect(starts().length).toBe(1);
    expect(records.find(record => record.name === 'turn_started')?.parameters['war_id'])
      .toBe(starts()[0].parameters['war_id']);
    flush();
  }));

  it('keeps mid-War consent grants at the next boundary and withdrawal immediate', fakeAsync(() => {
    consent.clearAnalyticsConsent();
    orderedWar();
    const firstId = telemetry.currentWarContext()!.warId;
    consent.setAnalyticsConsent('granted');
    controller.ensureGameStarted();
    decks([Rank.TWO], [Rank.ACE]);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(records).toEqual([]);
    expect(progression.currentCampaign().wars[0].warId).toBe(firstId);

    controller.startNewGame();
    expect(starts().length).toBe(1);
    consent.setAnalyticsConsent('denied');
    decks([Rank.TWO], [Rank.ACE]);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(records.map(record => record.name)).toEqual(['war_started']);
    flush();
  }));

  for (const action of ['restart', 'abandon'] as const) {
    it(`preserves ordered rules and creates one new War after ${action}`, fakeAsync(() => {
      orderedWar();
      decks([Rank.TWO, Rank.ACE], [Rank.KING, Rank.FIVE]);
      controller.playerDrawCard();
      flushMicrotasks();
      const id = starts()[0].parameters['war_id'];
      controller.startNewGame(action);
      controller.ensureGameStarted();
      expect(starts().length).toBe(2);
      expect(starts()[1].parameters['war_id']).not.toBe(id);
      expect(starts()[1].parameters['start_type']).toBe('restart');
      expect(events.filter(event => event.type === 'game_abandoned').length).toBe(1);
      expect(progression.currentCampaign().wars).toEqual([]);
      expect(progression.ordersSelected()).toBeTrue();
      flush();
    }));
  }

  it('closes abandoned Campaign context while awaiting fresh Orders', fakeAsync(() => {
    orderedWar();
    decks([Rank.TWO, Rank.ACE], [Rank.KING, Rank.FIVE]);
    controller.playerDrawCard();
    flushMicrotasks();
    const campaignId = progression.currentCampaign().campaignId;
    expect(controller.abandonCampaign()).toBeTrue();
    expect(telemetry.currentWarContext()).toBeNull();
    expect(starts().length).toBe(1);
    expect(controller.playerDrawCard()).toBeFalse();
    progression.selectCampaignOrders('standard');
    controller.ensureGameStarted();
    expect(starts().length).toBe(2);
    expect(starts()[1].parameters['campaign_id']).not.toBe(campaignId);
    flush();
  }));

  it('credits an outright human reinforcement win and its immediate rescue', fakeAsync(() => {
    const event = humanReinforcement([Rank.TWO, Rank.ACE], [Rank.KING]);
    expect(event.comparison).toBe(ComparisonResult.PLAYER_WINS);
    expect(event.challengerWon).toBeTrue();
    expect(event.escalatedToBattle).toBeFalse();
    expect(event.savedTwo).toBeTrue();
    expect(auth.userStats().successfulChallenges).toBe(1);
    expect(auth.userStats().challengeSuccessRate).toBe(100);
    expect(auth.userStats().mostSuccessfulChallengesInGame).toBe(1);
    expect(auth.userStats().acesRescuingTwos).toBe(1);
    expect(auth.userStats().unlockedAchievements).toContain('war.first_rescue');
    expect(hall.getRecord(event.reinforcementCard.id)?.reinforcementRescues).toBe(1);
    expect(records.find(record => record.name === 'reinforcement_resolved')?.parameters['outcome'])
      .toBe('success');
    flush();
  }));

  it('records an outright human reinforcement loss without rescue credit', fakeAsync(() => {
    const event = humanReinforcement([Rank.TWO, Rank.THREE], [Rank.KING]);
    expect(event.comparison).toBe(ComparisonResult.OPPONENT_WINS);
    expectNoRescue(event);
    expect(auth.userStats().successfulChallenges).toBe(0);
    expect(records.find(record => record.name === 'reinforcement_resolved')?.parameters['outcome'])
      .toBe('failure');
    flush();
  }));

  it('records a tied reinforcement entering Battle without rescue credit or failure dialogue', fakeAsync(() => {
    const reaction = spyOn(TestBed.inject(TableReactionService), 'forChallengeResolution').and.callThrough();
    const event = humanReinforcement(
      [Rank.TWO, Rank.KING, Rank.FOUR, Rank.FIVE, Rank.SIX],
      [Rank.KING, Rank.SEVEN, Rank.EIGHT, Rank.NINE],
    );
    expect(event.comparison).toBe(ComparisonResult.TIE);
    expect(event.winner).toBeNull();
    expect(event.escalatedToBattle).toBeTrue();
    expectNoRescue(event);
    expect(events.some(item => item.type === 'battle_started')).toBeTrue();
    expect(reaction).not.toHaveBeenCalled();
    const mapped = records.find(record => record.name === 'reinforcement_resolved')!;
    expect(mapped.parameters['outcome']).toBe('battle');
    expect(mapped.parameters['escalated_to_battle']).toBe(1);
    expect(TestBed.inject(StoryBookService).entries().some(entry => entry.text.includes('Battle initiated!')))
      .toBeTrue();
    // Complete the actual Battle so the local War counters are persisted too.
    controller.selectBattleCard(state.currentState.activeTurn!.battleLayers[0].opponentCards[0]);
    flushMicrotasks();
    expect(auth.userStats().successfulChallenges).toBe(0);
    expect(auth.userStats().totalChallenges).toBe(1);
    flush();
  }));

  it('does not credit a Two rescue when a tied reinforcement wins by immediate attrition', fakeAsync(() => {
    const reaction = spyOn(TestBed.inject(TableReactionService), 'forChallengeResolution').and.callThrough();
    const event = humanReinforcement([Rank.TWO, Rank.KING, Rank.FIVE], [Rank.KING]);
    expect(event.comparison).toBe(ComparisonResult.TIE);
    expect(event.winner).toBe(PlayerType.PLAYER);
    expect(event.escalatedToBattle).toBeFalse();
    expectNoRescue(event);
    const stats = auth.userStats();
    expect(stats.gamesWon).toBe(1);
    expect(stats.totalChallenges).toBe(1);
    expect(stats.successfulChallenges).toBe(0);
    expect(stats.challengeSuccessRate).toBe(0);
    expect(stats.mostSuccessfulChallengesInGame).toBe(0);
    expect(stats.twosSavedByChallenge).toBe(0);
    expect(stats.acesRescuedByChallenge).toBe(0);
    expect(stats.acesRescuingTwos).toBe(0);
    expect(reaction).not.toHaveBeenCalled();
    const mapped = records.find(record => record.name === 'reinforcement_resolved')!;
    expect(mapped.parameters['outcome']).toBe('tie');
    expect(mapped.parameters['escalated_to_battle']).toBe(0);
    expect(mapped.parameters['rescued_two']).toBe(0);
    expect(Object.keys(mapped.parameters).length).toBe(25);
    expect(normalizeTelemetryRecordForGa4(mapped)).not.toBeNull();
    const entry = TestBed.inject(StoryBookService).entries()
      .find(item => item.type === 'challenge' && item.eyebrow?.endsWith('RESOLUTION'))!;
    expect(entry.text).toContain('tied');
    expect(entry.text).toContain(event.message);
    expect(entry.text).not.toContain('rescued');
    expect(entry.text).not.toContain('Both are now lost');
    expect(events.some(item => item.type === 'battle_started')).toBeFalse();
    expect(state.cardConservationReport().valid).toBeTrue();
    flush();
  }));

  it('distinguishes a terminal true tie from actual Battle escalation', fakeAsync(() => {
    const event = humanReinforcement([Rank.TWO, Rank.KING], [Rank.KING]);
    expect(event.comparison).toBe(ComparisonResult.TIE);
    expect(event.winner).toBeNull();
    expect(event.escalatedToBattle).toBeFalse();
    expectNoRescue(event);
    expect(auth.userStats().gamesTied).toBe(1);
    const mapped = records.find(record => record.name === 'reinforcement_resolved')!;
    expect(mapped.parameters['outcome']).toBe('tie');
    expect(mapped.parameters['escalated_to_battle']).toBe(0);
    expect(events.some(item => item.type === 'battle_started')).toBeFalse();
    flush();
  }));

  for (const tie of [false, true]) {
    it(`orients opponent reinforcement ${tie ? 'attrition tie' : 'outright win'} correctly`, fakeAsync(() => {
      orderedWar();
      decks([Rank.KING], [Rank.TWO, tie ? Rank.KING : Rank.ACE, Rank.FIVE]);
      spyOn(TestBed.inject(OpponentAIService), 'shouldChallenge').and.returnValue(true);
      controller.playerDrawCard();
      flushMicrotasks();
      const event = events.find((item): item is ChallengeResolvedEvent => item.type === 'challenge_resolved')!;
      expect(event.challenger).toBe(PlayerType.OPPONENT);
      expect(event.comparison).toBe(tie ? ComparisonResult.TIE : ComparisonResult.OPPONENT_WINS);
      expect(event.winner).toBe(PlayerType.OPPONENT);
      expect(event.challengerWon).toBe(!tie);
      expect(event.escalatedToBattle).toBeFalse();
      expect(auth.userStats().successfulChallenges).toBe(0);
      expect(records.find(record => record.name === 'reinforcement_resolved')?.parameters['outcome'])
        .toBe(tie ? 'tie' : 'success');
      flush();
    }));
  }
});
