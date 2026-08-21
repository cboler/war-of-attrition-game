import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { GameEventBusService } from './game-event-bus.service';
import { AuthService } from '../core/services/auth.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { BattleOutcome, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { ComparisonResult } from '../core/services/card-comparison.service';
import { ACHIEVEMENTS } from '../core/models/achievement.model';
import { PLAY_ACHIEVEMENT_MAPPINGS } from '../core/models/play-achievements-map';

describe('AchievementService', () => {
  let service: AchievementService;
  let eventBus: GameEventBusService;
  let authService: AuthService;

  const cardAce: Card = { id: 'a1', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };
  const cardTwo: Card = { id: 't1', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };

  function battleOutcome(
    winner: PlayerType,
    casualties: readonly Card[],
    battleDepth = 1,
  ): BattleOutcome {
    const loser = winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    return {
      winner,
      loser,
      battleDepth,
      layers: [],
      playerCardsAtStake: loser === PlayerType.PLAYER ? casualties : [],
      opponentCardsAtStake: loser === PlayerType.OPPONENT ? casualties : [],
      winningCards: [],
      casualties,
      publicWinnerCards: [],
      hiddenWinnerCards: [],
      selectedPlayerChampion: null,
      selectedOpponentChampion: null,
      playerDeckCountBeforeSettlement: 10,
      opponentDeckCountBeforeSettlement: 10,
      boneyardCountBeforeSettlement: 0,
      finalPlayerDeckCount: 10,
      finalOpponentDeckCount: 10,
      finalBoneyardCount: casualties.length,
    };
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AchievementService, GameEventBusService, AuthService],
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
      message: '2♥ beats A♠ by special rule.',
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
      savedTwo: true,
    });

    expect(service.isUnlocked('war.not_today')).toBe(true);
  });

  it('should unlock war.battle_layer_3 and war.battle_layer_4 on deep layers', () => {
    expect(service.isUnlocked('war.battle_layer_3')).toBe(false);
    expect(service.isUnlocked('war.battle_layer_4')).toBe(false);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 5,
      layerRound: 3,
    });
    expect(service.isUnlocked('war.battle_layer_3')).toBe(true);
    expect(service.isUnlocked('war.battle_layer_4')).toBe(false);

    eventBus.emit({
      type: 'battle_layer_added',
      turnNumber: 6,
      layerRound: 4,
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
      isRed: false,
    }));

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 7,
      outcome: battleOutcome(PlayerType.PLAYER, tenCards, 2),
    });

    expect(service.isUnlocked('war.massacre')).toBe(true);
  });

  it('should unlock war.royal_disaster when losing both Ace and 2 in same battle', () => {
    expect(service.isUnlocked('war.royal_disaster')).toBe(false);

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 8,
      outcome: battleOutcome(PlayerType.OPPONENT, [cardAce, cardTwo], 2),
    });

    expect(service.isUnlocked('war.royal_disaster')).toBe(true);
  });

  it('queues Battle achievements until the presentation completes', () => {
    eventBus.emit({ type: 'battle_started', turnNumber: 9, layerRound: 1 });

    expect(service.isUnlocked('war.first_battle')).toBeTrue();
    expect(service.latestUnlock()).toBeNull();

    eventBus.emit({ type: 'battle_presentation_complete', turnNumber: 9 });

    expect(service.latestUnlock()?.id).toBe('war.first_battle');
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
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
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
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
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
      isComeback: true,
      battlesCount: 0,
      playerReinforcementsSent: 0,
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
      isComeback: true,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });

    expect(service.isUnlocked('war.comeback_15')).toBe(true);
  });

  it('should unlock war.marathon on games with >= 40 turns', () => {
    expect(service.isUnlocked('war.marathon')).toBe(false);

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 40,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 40,
      playerCardsRemaining: 10,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });

    expect(service.isUnlocked('war.marathon')).toBe(true);
  });

  it('defines and maps all 22 canonical achievements exactly once', () => {
    const exactPlayIds: Readonly<Record<string, string>> = {
      'war.first_casualty': 'CgkIz5juh94JEAIQDA',
      'war.first_battle': 'CgkIz5juh94JEAIQEQ',
      'war.first_win': 'CgkIz5juh94JEAIQEg',
      'war.first_defeat': 'CgkIz5juh94JEAIQEw',
      'war.first_rescue': 'CgkIz5juh94JEAIQDQ',
      'war.first_battle_win': 'CgkIz5juh94JEAIQCw',
      'war.assassin': 'CgkIz5juh94JEAIQAg',
      'war.not_today': 'CgkIz5juh94JEAIQBQ',
      'war.battle_layer_3': 'CgkIz5juh94JEAIQBg',
      'war.battle_layer_4': 'CgkIz5juh94JEAIQCA',
      'war.deep_battle_win': 'CgkIz5juh94JEAIQAA',
      'war.royal_disaster': 'CgkIz5juh94JEAIQCQ',
      'war.massacre': 'CgkIz5juh94JEAIQFA',
      'war.no_reinforcements_win': 'CgkIz5juh94JEAIQFQ',
      'war.five_battles_game': 'CgkIz5juh94JEAIQBw',
      'war.pyrrhic_victory': 'CgkIz5juh94JEAIQBA',
      'war.untouchable': 'CgkIz5juh94JEAIQCg',
      'war.comeback_15': 'CgkIz5juh94JEAIQDg',
      'war.marathon': 'CgkIz5juh94JEAIQDw',
      'profile.campaigner': 'CgkIz5juh94JEAIQAQ',
      'profile.veteran': 'CgkIz5juh94JEAIQEA',
      'profile.centurion': 'CgkIz5juh94JEAIQAw',
    };
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    expect(ids.length).toBe(22);
    expect(new Set(ids).size).toBe(22);
    expect(Object.keys(PLAY_ACHIEVEMENT_MAPPINGS).sort()).toEqual([...ids].sort());
    expect(
      Object.fromEntries(
        Object.entries(PLAY_ACHIEVEMENT_MAPPINGS).map(([id, mapping]) => [id, mapping.playGamesId]),
      ),
    ).toEqual(exactPlayIds);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.veteran'].totalSteps).toBe(25);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.centurion'].totalSteps).toBe(100);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.campaigner'].isIncremental).toBeFalse();
  });

  it('unlocks the first casualty from any real Boneyard loss', () => {
    eventBus.emit({
      type: 'cards_sent_to_boneyard',
      turnNumber: 1,
      cards: [cardAce],
    });
    expect(service.isUnlocked('war.first_casualty')).toBeTrue();
  });

  it('unlocks first Battle, first Battle win, and deep Battle win from typed Battle events', () => {
    eventBus.emit({ type: 'battle_started', turnNumber: 2, layerRound: 1 });
    expect(service.isUnlocked('war.first_battle')).toBeTrue();

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 2,
      outcome: battleOutcome(PlayerType.PLAYER, [cardAce], 3),
    });
    expect(service.isUnlocked('war.first_battle_win')).toBeTrue();
    expect(service.isUnlocked('war.deep_battle_win')).toBeTrue();
  });

  it('unlocks first rescue from a successful player reinforcement', () => {
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardAce,
      originalWinnerCard: cardTwo,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      message: 'Card rescued.',
      savedTwo: false,
    });
    expect(service.isUnlocked('war.first_rescue')).toBeTrue();
  });

  it('distinguishes resolved wins and defeats from abandonment', () => {
    eventBus.emit({ type: 'game_abandoned', turnNumber: 1, turnsPlayed: 1 });
    expect(service.isUnlocked('war.first_defeat')).toBeFalse();

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 8,
      outcome: GameOutcome.OPPONENT_WIN,
      turns: 8,
      playerCardsRemaining: 0,
      opponentCardsRemaining: 8,
      maxDeficitExperienced: 4,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });
    expect(service.isUnlocked('war.first_defeat')).toBeTrue();
    expect(service.isUnlocked('war.first_win')).toBeFalse();
  });

  it('unlocks first win, no-reinforcement win, and a five-Battle game literally', () => {
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 20,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 20,
      playerCardsRemaining: 10,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 5,
      playerReinforcementsSent: 0,
    });
    expect(service.isUnlocked('war.first_win')).toBeTrue();
    expect(service.isUnlocked('war.no_reinforcements_win')).toBeTrue();
    expect(service.isUnlocked('war.five_battles_game')).toBeTrue();
  });

  it('unlocks Campaigner, Veteran, and Centurion from cumulative resolved games', () => {
    for (let game = 0; game < 100; game++) {
      authService.recordGameResult({ outcome: 'tie', turns: 1, durationMs: 1000 });
    }
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 1,
      outcome: GameOutcome.TIE,
      turns: 1,
      playerCardsRemaining: 1,
      opponentCardsRemaining: 1,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });
    expect(service.isUnlocked('profile.campaigner')).toBeTrue();
    expect(service.isUnlocked('profile.veteran')).toBeTrue();
    expect(service.isUnlocked('profile.centurion')).toBeTrue();
  });
});
