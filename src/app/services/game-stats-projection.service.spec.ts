import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { GameStatsProjectionService } from './game-stats-projection.service';
import { GameEventBusService } from './game-event-bus.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { PlatformGameStatsService } from '../core/services/platform-game-stats.service';
import { AuthService } from '../core/services/auth.service';
import {
  ComparisonResult,
  DeckColor,
  GameOutcome,
  PlayerType
} from '../core/models/game-state.model';
import { Rank, Suit } from '../core/models/card.model';
import { OpponentCommanderId } from '../core/models/commander.model';
import { CampaignModeId, CampaignModifierId } from '../core/models/campaign-chapter.model';

describe('GameStatsProjectionService', () => {
  let service: GameStatsProjectionService;
  let eventBus: GameEventBusService;
  let mockProgression: any;
  let mockPlatformGameStats: any;
  let mockAuth: any;

  const activeProfileSignal = signal({ id: 'profile-1', name: 'Commander 1' });
  const ordersSelectedSignal = signal(true);
  const warIndexSignal = signal<number>(1);
  const currentCommanderIdSignal = signal<OpponentCommanderId>('quartermaster');
  const activeModeSignal = signal<CampaignModeId>('standard');
  const activeModifiersSignal = signal<readonly CampaignModifierId[]>([]);
  const allChaptersCompletedSignal = signal(false);
  const remainingReservesSignal = signal<number | null>(null);

  beforeEach(() => {
    ordersSelectedSignal.set(true);
    warIndexSignal.set(1);
    currentCommanderIdSignal.set('quartermaster');
    activeModeSignal.set('standard');
    activeModifiersSignal.set([]);
    allChaptersCompletedSignal.set(false);
    remainingReservesSignal.set(null);
    activeProfileSignal.set({ id: 'profile-1', name: 'Commander 1' });

    mockProgression = {
      ordersSelected: ordersSelectedSignal,
      campaignWarIndex: warIndexSignal,
      currentCommanderId: currentCommanderIdSignal,
      activeCampaignMode: activeModeSignal,
      activeCampaignModifiers: activeModifiersSignal,
      isAllChaptersCompleted: allChaptersCompletedSignal,
      remainingReserves: remainingReservesSignal,
      isLimitedReserves: () => activeModifiersSignal().includes('limited_reserves')
    };

    mockPlatformGameStats = {
      canRecordGameStats: jasmine.createSpy('canRecordGameStats').and.returnValue(true),
      recordWarCompleted: jasmine.createSpy('recordWarCompleted').and.returnValue(true)
    };

    mockAuth = {
      activeProfile: activeProfileSignal
    };

    TestBed.configureTestingModule({
      providers: [
        GameStatsProjectionService,
        GameEventBusService,
        { provide: CampaignProgressionService, useValue: mockProgression },
        { provide: PlatformGameStatsService, useValue: mockPlatformGameStats },
        { provide: AuthService, useValue: mockAuth }
      ]
    });

    eventBus = TestBed.inject(GameEventBusService);
    service = TestBed.inject(GameStatsProjectionService);
  });

  it('resets accumulators and state upon beginWar()', () => {
    service.beginWar('test-war-1');
    expect(service.getCurrentWarId()).toBe('test-war-1');
    expect(service.getDeepestBattle()).toBe(0);
    expect(service.getSuccessfulReinforcements()).toBe(0);
    expect(service.getAcesFelledByTwos()).toBe(0);
    expect(service.isCurrentWarEligible()).toBeFalse(); // Not locked until first turn
  });

  it('freezes context and locks eligibility on first turn_started after orders are selected', () => {
    service.beginWar('test-war-1');

    eventBus.emit({
      type: 'turn_started',
      turnNumber: 1
    });

    expect(service.isCurrentWarEligible()).toBeTrue();
    expect(mockPlatformGameStats.canRecordGameStats).toHaveBeenCalled();
  });

  it('waits for orders to be selected on War 1 before freezing context', () => {
    ordersSelectedSignal.set(false);
    warIndexSignal.set(1);
    service.beginWar('test-war-1');

    // Turn event before orders are ready
    eventBus.emit({
      type: 'turn_started',
      turnNumber: 0
    });

    expect(service.isCurrentWarEligible()).toBeFalse();

    // Now orders become ready and turn 1 begins
    ordersSelectedSignal.set(true);
    eventBus.emit({
      type: 'turn_started',
      turnNumber: 1
    });

    expect(service.isCurrentWarEligible()).toBeTrue();
  });

  it('accumulates deepest dealt battle layers (max over battle_started and battle_layer_added)', () => {
    service.beginWar('test-war-1');
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });

    eventBus.emit({
      type: 'battle_started',
      turnNumber: 1,
      layerRound: 1
    });
    expect(service.getDeepestBattle()).toBe(1);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 1,
      layerRound: 2
    });
    expect(service.getDeepestBattle()).toBe(2);

    // battle_continues does NOT add a layer
    eventBus.emit({
      type: 'battle_continues',
      turnNumber: 1,
      layerRound: 2
    });
    expect(service.getDeepestBattle()).toBe(2);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 1,
      layerRound: 3
    });
    expect(service.getDeepestBattle()).toBe(3);
  });

  it('increments successful reinforcements only on direct player comparison wins', () => {
    service.beginWar('test-war-1');
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });

    const cardTwo = { id: 'c1', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
    const cardKing = { id: 'c2', suit: Suit.SPADES, rank: Rank.KING, value: 13, isRed: false };

    // 1. Player reinforcement comparison won outright -> increments
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 1,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardTwo,
      originalWinnerCard: cardKing,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      escalatedToBattle: false,
      message: 'Direct rescue win',
      savedTwo: false,
      originalBeatenCard: cardKing
    });
    expect(service.getSuccessfulReinforcements()).toBe(1);

    // 2. Player reinforcement comparison tied (even if won later by attrition) -> does NOT increment
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 2,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardKing,
      originalWinnerCard: cardKing,
      comparison: ComparisonResult.TIE,
      winner: PlayerType.PLAYER,
      challengerWon: false,
      escalatedToBattle: false,
      message: 'Tie resolved by attrition',
      savedTwo: false,
      originalBeatenCard: cardTwo
    });
    expect(service.getSuccessfulReinforcements()).toBe(1);

    // 3. Opponent reinforcement comparison won -> does NOT increment human counter
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.OPPONENT,
      reinforcementCard: cardKing,
      originalWinnerCard: cardTwo,
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      challengerWon: true,
      escalatedToBattle: false,
      message: 'Opponent won',
      savedTwo: false,
      originalBeatenCard: cardKing
    });
    expect(service.getSuccessfulReinforcements()).toBe(1);
  });

  describe('Two-over-Ace tracking (aces_felled_by_twos)', () => {
    const playerTwo = { id: 'h2', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
    const opponentAce = { id: 'sa', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };
    const playerAce = { id: 'ha', suit: Suit.HEARTS, rank: Rank.ACE, value: 14, isRed: true };
    const opponentTwo = { id: 's2', suit: Suit.SPADES, rank: Rank.TWO, value: 2, isRed: false };
    const dummyCard = { id: 'd5', suit: Suit.DIAMONDS, rank: Rank.FIVE, value: 5, isRed: true };

    it('counts clash where human Two beats opponent Ace', () => {
      service.beginWar('test-war-1');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 1,
        playerCard: playerTwo,
        opponentCard: opponentAce,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'Two beats Ace!'
      });

      expect(service.getAcesFelledByTwos()).toBe(1);
    });

    it('does not count clash where opponent Two beats human Ace', () => {
      service.beginWar('test-war-1');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 1,
        playerCard: playerAce,
        opponentCard: opponentTwo,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        specialRule: true,
        message: 'Opponent Two beats Ace!'
      });

      expect(service.getAcesFelledByTwos()).toBe(0);
    });

    it('counts challenge where human challenger plays Two against opponent Ace', () => {
      service.beginWar('test-war-1');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 1,
        challenger: PlayerType.PLAYER,
        reinforcementCard: playerTwo,
        originalWinnerCard: opponentAce,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Rescue Two beats Ace',
        savedTwo: false,
        originalBeatenCard: dummyCard
      });

      expect(service.getAcesFelledByTwos()).toBe(1);
    });

    it('counts challenge where opponent challenger plays Ace against human original Two', () => {
      service.beginWar('test-war-1');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      // Opponent challenges, human original card was Two, opponent plays Ace
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 1,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: opponentAce,
        originalWinnerCard: playerTwo,
        comparison: ComparisonResult.PLAYER_WINS, // Oriented human wins!
        winner: PlayerType.PLAYER,
        challengerWon: false,
        escalatedToBattle: false,
        message: 'Original Two defeats opponent rescue Ace',
        savedTwo: false,
        originalBeatenCard: dummyCard
      });

      expect(service.getAcesFelledByTwos()).toBe(1);
    });

    it('counts battle cards revealed where selected human Two beats opponent Ace', () => {
      service.beginWar('test-war-1');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'battle_cards_revealed',
        turnNumber: 1,
        layerRound: 1,
        playerChosenCard: playerTwo,
        opponentChosenCard: opponentAce,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'Battle champion Two beats Ace',
        selection: {
          layerRound: 1,
          playerCard: playerTwo,
          opponentCard: opponentAce,
          playerCardId: playerTwo.id,
          opponentCardId: opponentAce.id,
          comparison: ComparisonResult.PLAYER_WINS,
          winner: PlayerType.PLAYER,
          specialRule: true
        }
      });

      expect(service.getAcesFelledByTwos()).toBe(1);
    });
  });

  describe('terminal war_completed emission', () => {
    it('emits a valid war_completed event when eligible and completed', () => {
      service.beginWar('war-abc-123');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 12,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 12,
        playerCardsRemaining: 15,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 4,
        isComeback: true,
        battlesCount: 2,
        playerReinforcementsSent: 3
      });

      expect(mockPlatformGameStats.recordWarCompleted).toHaveBeenCalledTimes(1);
      const [warId, payload] = mockPlatformGameStats.recordWarCompleted.calls.mostRecent().args;
      expect(warId).toBe('war-abc-123');
      expect(payload.outcome).toBe('player_win');
      expect(payload.player_win).toBe(1);
      expect(payload.turns).toBe(12);
      expect(payload.comeback_deficit).toBe(4);
      expect(payload.battles).toBe(2);
      expect(payload.war_margin).toBe(15);
      expect(payload.stats_schema_version).toBe(1);
    });

    it('does not emit a second time on duplicate game_resolved events', () => {
      service.beginWar('war-dup');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      const event: any = {
        type: 'game_resolved',
        turnNumber: 8,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 8,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 1
      };

      eventBus.emit(event);
      eventBus.emit(event);

      expect(mockPlatformGameStats.recordWarCompleted).toHaveBeenCalledTimes(1);
    });

    it('does not emit anything on game_abandoned', () => {
      service.beginWar('war-abandoned');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'game_abandoned',
        turnNumber: 5,
        turnsPlayed: 5,
        playerDeckCount: 10,
        opponentDeckCount: 12,
        playerCardsAtStakeCount: 0,
        opponentCardsAtStakeCount: 0,
        playerCardDeficit: 2,
        gamePhase: 'normal' as any,
        battleDepth: 0
      });

      expect(mockPlatformGameStats.recordWarCompleted).not.toHaveBeenCalled();
      expect(service.getCurrentWarId()).toBeNull();
    });

    it('includes reserves_at_war_start when limited_reserves is active', () => {
      activeModeSignal.set('limited_reserves');
      activeModifiersSignal.set(['limited_reserves']);
      remainingReservesSignal.set(4);

      service.beginWar('war-lr');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 10,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 10,
        playerCardsRemaining: 12,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 2
      });

      expect(mockPlatformGameStats.recordWarCompleted).toHaveBeenCalledTimes(1);
      const [, payload] = mockPlatformGameStats.recordWarCompleted.calls.mostRecent().args;
      expect(payload.campaign_modifiers).toBe('limited_reserves');
      expect(payload.reserves_at_war_start).toBe(4);
    });

    it('invalidates eligibility if active profile switches mid-War', () => {
      service.beginWar('war-profile-switch');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      // Profile switch happens during War
      activeProfileSignal.set({ id: 'profile-2', name: 'Different Commander' });

      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 10,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 10,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 1
      });

      expect(mockPlatformGameStats.recordWarCompleted).not.toHaveBeenCalled();
    });

    it('safely does nothing if game stats are not available / browser mode', () => {
      mockPlatformGameStats.canRecordGameStats.and.returnValue(false);

      service.beginWar('war-browser-mode');
      eventBus.emit({ type: 'turn_started', turnNumber: 1 });

      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 10,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 10,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 1
      });

      expect(mockPlatformGameStats.recordWarCompleted).not.toHaveBeenCalled();
    });
  });
});
