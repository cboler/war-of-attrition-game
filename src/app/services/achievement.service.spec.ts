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

  it('should unlock war.battle_layer_3 when reaching Layer 3', () => {
    expect(service.isUnlocked('war.battle_layer_3')).toBe(false);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 5,
      layerRound: 3
    });

    expect(service.isUnlocked('war.battle_layer_3')).toBe(true);
  });

  it('should unlock war.pyrrhic_victory on 1-card victory', () => {
    expect(service.isUnlocked('war.pyrrhic_victory')).toBe(false);

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
  });

  it('should unlock war.comeback_15 on comeback from deficit >= 15', () => {
    expect(service.isUnlocked('war.comeback_15')).toBe(false);

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 45,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 45,
      playerCardsRemaining: 16,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 16,
      isComeback: true
    });

    expect(service.isUnlocked('war.comeback_15')).toBe(true);
  });
});
