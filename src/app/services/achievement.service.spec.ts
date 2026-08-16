import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { GameEventBusService } from './game-event-bus.service';
import { AuthService } from '../core/services/auth.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { ComparisonResult } from '../core/services/card-comparison.service';

describe('AchievementService', () => {
  let service: AchievementService;
  let eventBus: GameEventBusService;
  let authService: AuthService;

  const cardAce: Card = { id: 'a1', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };
  const cardTwo: Card = { id: 't1', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AchievementService, GameEventBusService, AuthService]
    });
    service = TestBed.inject(AchievementService);
    eventBus = TestBed.inject(GameEventBusService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should unlock war.assassin when 2 beats Ace', () => {
    expect(service.isUnlocked('war.assassin')).toBe(false);

    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 1,
      playerCard: cardTwo,
      opponentCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: true,
      message: '2♥ beats A♠ by special rule.'
    });

    expect(service.isUnlocked('war.assassin')).toBe(true);
    expect(service.latestUnlock()?.id).toBe('war.assassin');
  });

  it('should unlock war.not_today when saving a 2 via challenge', () => {
    expect(service.isUnlocked('war.not_today')).toBe(false);

    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardAce,
      originalWinnerCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      message: 'Defended position!',
      savedTwo: true
    });

    expect(service.isUnlocked('war.not_today')).toBe(true);
  });

  it('should unlock war.battle_layer_3 and war.battle_layer_4 on deep layers', () => {
    expect(service.isUnlocked('war.battle_layer_3')).toBe(false);
    expect(service.isUnlocked('war.battle_layer_4')).toBe(false);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 5,
      layerRound: 3
    });
    expect(service.isUnlocked('war.battle_layer_3')).toBe(true);
    expect(service.isUnlocked('war.battle_layer_4')).toBe(false);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 6,
      layerRound: 4
    });
    expect(service.isUnlocked('war.battle_layer_4')).toBe(true);
  });

  it('should unlock war.massacre when defeating >= 10 opponent cards in one battle', () => {
    expect(service.isUnlocked('war.massacre')).toBe(false);

    const tenCards = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      suit: Suit.CLUBS,
      rank: Rank.SEVEN,
      value: 7,
      isRed: false
    }));

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 7,
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      layerDepth: 2,
      revealedCasualties: tenCards,
      hiddenWinnerCardCount: 4,
      totalCardsAtStake: 14,
      lostAce: false,
      lostTwo: false,
      lostAceAndTwo: false
    });

    expect(service.isUnlocked('war.massacre')).toBe(true);
  });

  it('should unlock war.royal_disaster when losing both Ace and 2 in same battle', () => {
    expect(service.isUnlocked('war.royal_disaster')).toBe(false);

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 8,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      layerDepth: 2,
      revealedCasualties: [cardAce, cardTwo],
      hiddenWinnerCardCount: 4,
      totalCardsAtStake: 6,
      lostAce: true,
      lostTwo: true,
      lostAceAndTwo: true
    });

    expect(service.isUnlocked('war.royal_disaster')).toBe(true);
  });

  it('should unlock war.pyrrhic_victory and war.untouchable based on remaining cards', () => {
    expect(service.isUnlocked('war.pyrrhic_victory')).toBe(false);
    expect(service.isUnlocked('war.untouchable')).toBe(false);

    // Pyrrhic victory: exactly 1 card remaining
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 22,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 22,
      playerCardsRemaining: 1,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false
    });

    expect(service.isUnlocked('war.pyrrhic_victory')).toBe(true);
    expect(service.isUnlocked('war.untouchable')).toBe(false);

    // Untouchable: >= 20 cards remaining
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 12,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 12,
      playerCardsRemaining: 24,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false
    });

    expect(service.isUnlocked('war.untouchable')).toBe(true);
  });

  it('should unlock war.comeback_15 on comeback from deficit >= 15', () => {
    expect(service.isUnlocked('war.comeback_15')).toBe(false);

    // Boundary: deficit 14 should NOT unlock
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 40,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 40,
      playerCardsRemaining: 15,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 14,
      isComeback: true
    });
    expect(service.isUnlocked('war.comeback_15')).toBe(false);

    // Deficit 15 SHOULD unlock
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 45,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 45,
      playerCardsRemaining: 16,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 15,
      isComeback: true
    });

    expect(service.isUnlocked('war.comeback_15')).toBe(true);
  });

  it('should unlock war.marathon on games with >= 100 turns', () => {
    expect(service.isUnlocked('war.marathon')).toBe(false);

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 102,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 102,
      playerCardsRemaining: 10,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false
    });

    expect(service.isUnlocked('war.marathon')).toBe(true);
  });
});
