import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { GameEventBusService } from './game-event-bus.service';
import { AuthService } from '../core/services/auth.service';
import { Card, CardImpl, Rank, Suit } from '../core/models/card.model';
import {
  DeckColor,
  GameOutcome,
  GamePhase,
  PlayerType,
  SettlementAttribution,
} from '../core/models/game-state.model';
import { PublicBattleResolution } from '../core/models/game-events.model';
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
  ): PublicBattleResolution {
    const loser = winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    return {
      winner,
      loser,
      battleDepth,
      selection: null,
      selectedPlayerChampion: null,
      selectedOpponentChampion: null,
      casualties,
      casualtyIds: casualties.map((card) => card.id),
      hiddenWinnerCount: 0,
      publicWinnerCount: 0,
      playerCardsAtStakeCount: loser === PlayerType.PLAYER ? casualties.length : 0,
      opponentCardsAtStakeCount: loser === PlayerType.OPPONENT ? casualties.length : 0,
      finalPlayerDeckCount: 10,
      finalOpponentDeckCount: 10,
      finalBoneyardCount: casualties.length,
    };
  }

  function emitPlayerSettlement(
    decisiveCard: Card,
    casualties: readonly Card[],
    source: SettlementAttribution['source'] = 'clash',
  ): void {
    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: 1,
      attribution: {
        source,
        winner: PlayerType.PLAYER,
        loser: PlayerType.OPPONENT,
        decisiveCard,
        casualties,
        battleDepth: source === 'battle' ? 1 : 0,
      },
    });
  }

  function emitOpponentSettlement(
    casualties: readonly Card[],
    turnNumber = 1,
    source: SettlementAttribution['source'] = 'clash',
  ): void {
    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber,
      attribution: {
        source,
        winner: PlayerType.OPPONENT,
        loser: PlayerType.PLAYER,
        decisiveCard: cardAce,
        casualties,
        battleDepth: source === 'battle' ? 1 : 0,
      },
    });
  }

  function emitClashComparison(comparison: ComparisonResult, turnNumber: number): void {
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber,
      playerCard: new CardImpl(Suit.HEARTS, Rank.SEVEN),
      opponentCard: new CardImpl(Suit.CLUBS, Rank.SEVEN),
      comparison,
      winner:
        comparison === ComparisonResult.TIE
          ? null
          : comparison === ComparisonResult.PLAYER_WINS
            ? PlayerType.PLAYER
            : PlayerType.OPPONENT,
      specialRule: false,
      message: comparison === ComparisonResult.TIE ? 'True tie.' : 'Resolved.',
    });
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

  it('uses the authoritative Battle selection for Assassin, not compatibility mirrors', () => {
    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 2,
      layerRound: 99,
      playerChosenCard: cardAce,
      opponentChosenCard: cardTwo,
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      specialRule: false,
      message: 'Authoritative selection wins.',
      selection: {
        layerRound: 1,
        playerCard: cardTwo,
        opponentCard: cardAce,
        playerCardId: cardTwo.id,
        opponentCardId: cardAce.id,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
      },
    });

    expect(service.isUnlocked('war.assassin')).toBeTrue();
  });

  it('should unlock war.not_today when saving a 2 via challenge', () => {
    expect(service.isUnlocked('war.not_today')).toBe(false);

    eventBus.emit({
      escalatedToBattle: false,
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: cardTwo,
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

  it('should unlock war.massacre when defeating >= 14 opponent cards in one battle', () => {
    expect(service.isUnlocked('war.massacre')).toBe(false);

    const fourteenCards = Array.from({ length: 14 }, (_, i) => ({
      id: `c${i}`,
      suit: Suit.CLUBS,
      rank: Rank.SEVEN,
      value: 7,
      isRed: false,
    }));

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 7,
      outcome: battleOutcome(PlayerType.PLAYER, fourteenCards, 2),
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

  it('credits Battle bulk casualties to the one physical champion for Juggernaut', () => {
    const champion = new CardImpl(Suit.HEARTS, Rank.ACE);
    const casualties = [
      new CardImpl(Suit.CLUBS, Rank.KING),
      new CardImpl(Suit.CLUBS, Rank.QUEEN),
      new CardImpl(Suit.CLUBS, Rank.JACK),
    ];
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });

    emitPlayerSettlement(champion, casualties, 'battle');

    expect(service.isUnlocked('war.juggernaut')).toBeTrue();
    expect(service.achievementProgress().juggernautOccurrences).toBe(1);
    expect(service.achievementProgress().juggernautCardIds).toEqual([champion.id]);
  });

  it('tracks Juggernaut casualties by physical card id instead of combining equal ranks', () => {
    const heartsQueen = new CardImpl(Suit.HEARTS, Rank.QUEEN);
    const diamondsQueen = new CardImpl(Suit.DIAMONDS, Rank.QUEEN);
    const casualties = [
      new CardImpl(Suit.CLUBS, Rank.FOUR),
      new CardImpl(Suit.CLUBS, Rank.FIVE),
      new CardImpl(Suit.CLUBS, Rank.SIX),
      new CardImpl(Suit.CLUBS, Rank.SEVEN),
      new CardImpl(Suit.CLUBS, Rank.EIGHT),
    ];
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });

    emitPlayerSettlement(heartsQueen, casualties.slice(0, 2));
    emitPlayerSettlement(diamondsQueen, casualties.slice(2, 4));
    expect(service.isUnlocked('war.juggernaut')).toBeFalse();

    emitPlayerSettlement(heartsQueen, [casualties[4]]);
    expect(service.isUnlocked('war.juggernaut')).toBeTrue();
    expect(service.achievementProgress().juggernautCardIds).toEqual([heartsQueen.id]);
  });

  it('keeps Battle streaks across War boundaries and resets only on the opposite result', () => {
    for (let win = 1; win <= 3; win++) {
      eventBus.emit({
        type: 'battle_resolved',
        turnNumber: win,
        outcome: battleOutcome(PlayerType.PLAYER, [cardAce]),
      });
    }
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.BLACK });
    for (let win = 4; win <= 5; win++) {
      eventBus.emit({
        type: 'battle_resolved',
        turnNumber: win,
        outcome: battleOutcome(PlayerType.PLAYER, [cardAce]),
      });
    }

    expect(service.isUnlocked('war.expert_strategist')).toBeTrue();
    expect(service.achievementProgress().currentBattleWinStreak).toBe(5);
    expect(service.achievementProgress().bestBattleWinStreak).toBe(5);

    for (let loss = 1; loss <= 5; loss++) {
      eventBus.emit({
        type: 'battle_resolved',
        turnNumber: 5 + loss,
        outcome: battleOutcome(PlayerType.OPPONENT, [cardTwo]),
      });
    }
    expect(service.isUnlocked('war.poor_strategy')).toBeTrue();
    expect(service.achievementProgress().currentBattleWinStreak).toBe(0);
    expect(service.achievementProgress().currentBattleLossStreak).toBe(5);
    expect(service.achievementProgress().bestBattleLossStreak).toBe(5);
  });

  it('rehydrates cleared achievement progress when Career Records reset on the same profile', () => {
    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 1,
      outcome: battleOutcome(PlayerType.PLAYER, [cardAce]),
    });
    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 2,
      outcome: battleOutcome(PlayerType.PLAYER, [cardAce]),
    });
    expect(service.achievementProgress().currentBattleWinStreak).toBe(2);
    expect(authService.userStats().currentBattleWinStreak).toBe(2);

    authService.resetActiveUserStats();
    TestBed.flushEffects();

    expect(service.achievementProgress().currentBattleWinStreak).toBe(0);
    expect(service.achievementProgress().bestBattleWinStreak).toBe(0);
    expect(service.achievementProgress().juggernautOccurrences).toBe(0);
    expect(service.achievementProgress().juggernautCardIds).toEqual([]);

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 3,
      outcome: battleOutcome(PlayerType.PLAYER, [cardAce]),
    });
    expect(service.achievementProgress().currentBattleWinStreak).toBe(1);
  });

  it('unlocks Grave Intelligence from public Boneyard knowledge for a red player deck', () => {
    const heartsTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
    const diamondsTwo = new CardImpl(Suit.DIAMONDS, Rank.TWO);
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });

    eventBus.emit({ type: 'cards_sent_to_boneyard', turnNumber: 1, cards: [heartsTwo] });
    expect(service.isUnlocked('war.grave_intelligence')).toBeFalse();
    eventBus.emit({ type: 'cards_sent_to_boneyard', turnNumber: 2, cards: [diamondsTwo] });

    expect(service.isUnlocked('war.grave_intelligence')).toBeTrue();
  });

  it('does not unlock Grave Intelligence after a public opposing Ace casualty', () => {
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.BLACK });
    eventBus.emit({
      type: 'cards_sent_to_boneyard',
      turnNumber: 1,
      cards: [
        new CardImpl(Suit.CLUBS, Rank.TWO),
        new CardImpl(Suit.HEARTS, Rank.ACE),
        new CardImpl(Suit.SPADES, Rank.TWO),
      ],
    });

    expect(service.isUnlocked('war.grave_intelligence')).toBeFalse();
  });

  it('unlocks Crippled only when both physical player-owned 2s are lost in one settlement', () => {
    const heartsTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
    const diamondsTwo = new CardImpl(Suit.DIAMONDS, Rank.TWO);
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });

    emitOpponentSettlement([heartsTwo, diamondsTwo], 3, 'battle');

    expect(service.isUnlocked('war.crippled')).toBeTrue();
  });

  it('does not combine 2 casualties from separate settlements for Crippled', () => {
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });
    emitOpponentSettlement([new CardImpl(Suit.HEARTS, Rank.TWO)], 1);
    emitOpponentSettlement([new CardImpl(Suit.DIAMONDS, Rank.TWO)], 2, 'challenge');

    expect(service.isUnlocked('war.crippled')).toBeFalse();
  });

  it('does not unlock Crippled for one 2, unrelated cards, or duplicate attribution', () => {
    const heartsTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });
    emitOpponentSettlement([new CardImpl(Suit.HEARTS, Rank.SEVEN), heartsTwo], 1);
    emitOpponentSettlement([heartsTwo, heartsTwo], 2);

    expect(service.isUnlocked('war.crippled')).toBeFalse();
  });

  it('unlocks Neverending Stalemate at exactly three authoritative ties', () => {
    emitClashComparison(ComparisonResult.TIE, 1);
    emitClashComparison(ComparisonResult.TIE, 2);
    expect(service.isUnlocked('war.neverending_stalemate')).toBeFalse();

    emitClashComparison(ComparisonResult.TIE, 3);
    expect(service.isUnlocked('war.neverending_stalemate')).toBeTrue();
  });

  it('resets the stalemate streak on a non-tied comparison', () => {
    emitClashComparison(ComparisonResult.TIE, 1);
    emitClashComparison(ComparisonResult.TIE, 2);
    emitClashComparison(ComparisonResult.PLAYER_WINS, 3);
    emitClashComparison(ComparisonResult.TIE, 4);

    expect(service.isUnlocked('war.neverending_stalemate')).toBeFalse();
  });

  it('counts recursive Battle ties by the same authoritative comparison semantics', () => {
    emitClashComparison(ComparisonResult.TIE, 1);
    for (const layerRound of [1, 2]) {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.NINE);
      const opponentCard = new CardImpl(Suit.CLUBS, Rank.NINE);
      eventBus.emit({
        type: 'battle_cards_revealed',
        turnNumber: 1,
        layerRound,
        playerChosenCard: playerCard,
        opponentChosenCard: opponentCard,
        comparison: ComparisonResult.TIE,
        winner: null,
        specialRule: false,
        message: 'Battle remains tied.',
        selection: {
          layerRound,
          playerCard,
          opponentCard,
          playerCardId: playerCard.id,
          opponentCardId: opponentCard.id,
          comparison: ComparisonResult.TIE,
          winner: null,
          specialRule: false,
        },
      });
    }

    expect(service.isUnlocked('war.neverending_stalemate')).toBeTrue();
  });

  it('keeps both new awards idempotent after their persisted unlocks are re-evaluated', () => {
    const heartsTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
    const diamondsTwo = new CardImpl(Suit.DIAMONDS, Rank.TWO);
    eventBus.emit({ type: 'war_started', turnNumber: 0, playerDeckColor: DeckColor.RED });
    emitOpponentSettlement([heartsTwo, diamondsTwo]);
    emitClashComparison(ComparisonResult.TIE, 1);
    emitClashComparison(ComparisonResult.TIE, 2);
    emitClashComparison(ComparisonResult.TIE, 3);

    const unlocked = authService.userStats().unlockedAchievements;
    emitOpponentSettlement([heartsTwo, diamondsTwo], 4);
    emitClashComparison(ComparisonResult.TIE, 4);

    expect(unlocked.filter((id) => id === 'war.crippled').length).toBe(1);
    expect(unlocked.filter((id) => id === 'war.neverending_stalemate').length).toBe(1);
    expect(authService.userStats().unlockedAchievements).toEqual(unlocked);
  });

  it('requires an Ace reinforcement to successfully rescue the original 2 for Cavalry', () => {
    const originalTwo = new CardImpl(Suit.HEARTS, Rank.TWO);
    const opposingKing = new CardImpl(Suit.CLUBS, Rank.KING);
    eventBus.emit({
      escalatedToBattle: false,
      type: 'challenge_resolved',
      turnNumber: 1,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: originalTwo,
      reinforcementCard: new CardImpl(Suit.DIAMONDS, Rank.ACE),
      originalWinnerCard: opposingKing,
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      challengerWon: false,
      message: 'Both are now lost.',
      savedTwo: false,
    });
    expect(service.isUnlocked('war.cavalry_came')).toBeFalse();

    eventBus.emit({
      escalatedToBattle: false,
      type: 'challenge_resolved',
      turnNumber: 2,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: originalTwo,
      reinforcementCard: new CardImpl(Suit.DIAMONDS, Rank.ACE),
      originalWinnerCard: opposingKing,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      message: 'Card rescued.',
      savedTwo: true,
    });

    expect(service.isUnlocked('war.cavalry_came')).toBeTrue();
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

  it('unlocks war.marathon at 42 turns, not 41', () => {
    expect(service.isUnlocked('war.marathon')).toBe(false);

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 41,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 41,
      playerCardsRemaining: 10,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });

    expect(service.isUnlocked('war.marathon')).toBe(false);

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 42,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 42,
      playerCardsRemaining: 10,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });

    expect(service.isUnlocked('war.marathon')).toBe(true);
  });

  it('defines the canonical achievements and maps the 29 Play Games achievements', () => {
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
      'war.juggernaut': 'CgkIz5juh94JEAIQGA',
      'war.expert_strategist': 'CgkIz5juh94JEAIQGg',
      'war.poor_strategy': 'CgkIz5juh94JEAIQGw',
      'war.grave_intelligence': 'CgkIz5juh94JEAIQGQ',
      'war.cavalry_came': 'CgkIz5juh94JEAIQFw',
      'war.no_reinforcements_win': 'CgkIz5juh94JEAIQFQ',
      'war.five_battles_game': 'CgkIz5juh94JEAIQBw',
      'war.deuce_ex_machina': 'CgkIz5juh94JEAIQJw',
      'war.snatched_from_jaws_of_victory': 'CgkIz5juh94JEAIQKA',
      'war.pyrrhic_victory': 'CgkIz5juh94JEAIQBA',
      'war.untouchable': 'CgkIz5juh94JEAIQCg',
      'war.comeback_15': 'CgkIz5juh94JEAIQDg',
      'war.marathon': 'CgkIz5juh94JEAIQDw',
      'profile.campaigner': 'CgkIz5juh94JEAIQAQ',
      'profile.veteran': 'CgkIz5juh94JEAIQEA',
      'profile.centurion': 'CgkIz5juh94JEAIQAw',
    };
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    expect(ids.length).toBe(39);
    expect(new Set(ids).size).toBe(39);
    expect(ACHIEVEMENTS.filter((a) => !a.hidden).length).toBe(34);
    expect(ACHIEVEMENTS.filter((a) => a.classification === 'anomaly').length).toBe(5);
    expect(ids).toContain('war.battle_assassin');
    expect(ids).toContain('war.crippled');
    expect(ids).toContain('war.neverending_stalemate');
    expect(ids).toContain('war.wrong_tool_for_job');
    expect(ids).toContain('war.twin_assassins');
    expect(ids).toContain('war.deuce_ex_machina');
    expect(ids).toContain('war.snatched_from_jaws_of_victory');
    expect(Object.keys(PLAY_ACHIEVEMENT_MAPPINGS).length).toBe(29);
    expect(
      Object.fromEntries(
        Object.entries(PLAY_ACHIEVEMENT_MAPPINGS).map(([id, mapping]) => [id, mapping.playGamesId]),
      ),
    ).toEqual(exactPlayIds);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.veteran'].totalSteps).toBe(25);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.centurion'].totalSteps).toBe(100);
    expect(PLAY_ACHIEVEMENT_MAPPINGS['profile.campaigner'].isIncremental).toBeFalse();
    expect(ACHIEVEMENTS.find((achievement) => achievement.id === 'profile.campaigner')?.name)
      .toBe('War Tested');
    expect(ACHIEVEMENTS.find((achievement) => achievement.id === 'war.battle_assassin')?.name)
      .toBe('Against the Odds');
    expect(ACHIEVEMENTS.find((achievement) => achievement.id === 'war.first_win')?.name)
      .toBe('First Victory');
    expect(PLAY_ACHIEVEMENT_MAPPINGS['war.first_win']?.playGamesId).toBe('CgkIz5juh94JEAIQEg');
    expect(ids).not.toContain('war.iron_defense');
    const visible = ACHIEVEMENTS.filter((a) => !a.hidden);
    expect(visible.length).toBe(34);
    expect(visible.filter((a) => a.classification === 'milestone').length).toBe(9);
    expect(visible.filter((a) => a.classification === 'distinction').length).toBe(16);
    expect(visible.filter((a) => a.classification === 'prestige').length).toBe(9);
    expect(ACHIEVEMENTS.find((a) => a.id === 'war.twin_assassins')?.classification).toBe('prestige');
    expect(ACHIEVEMENTS.find((a) => a.id === 'war.wrong_tool_for_job')?.classification).toBe('distinction');
    expect(ACHIEVEMENTS.find((a) => a.id === 'war.deuce_ex_machina')?.classification).toBe('distinction');
    expect(ACHIEVEMENTS.find((a) => a.id === 'war.snatched_from_jaws_of_victory')?.classification).toBe('distinction');
    expect(ACHIEVEMENTS.find((achievement) => achievement.id === 'war.marathon')?.description)
      .toContain('42 turns');
  });

  it('unlocks both war.assassin and war.battle_assassin when player 2 defeats opponent Ace in Battle', () => {
    eventBus.emit({ type: 'battle_started', turnNumber: 4, layerRound: 1 });

    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 4,
      layerRound: 1,
      playerChosenCard: cardTwo,
      opponentChosenCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      selection: {
        layerRound: 1,
        playerCard: cardTwo,
        opponentCard: cardAce,
        playerCardId: cardTwo.id,
        opponentCardId: cardAce.id,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
      },
      specialRule: true,
      message: '2♠ assassinated A♥.',
    });

    expect(service.isUnlocked('war.assassin')).toBeTrue();
    expect(service.isUnlocked('war.battle_assassin')).toBeTrue();

    // Toasts are deferred during Battle until battle_presentation_complete
    expect(service.latestUnlock()).toBeNull();

    eventBus.emit({ type: 'battle_presentation_complete', turnNumber: 4 });
    expect(service.latestUnlock()).not.toBeNull();
  });

  it('unlocks war.assassin but NOT war.battle_assassin when 2 defeats Ace in regular clash', () => {
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 1,
      playerCard: cardTwo,
      opponentCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: true,
      message: '2♠ assassinated A♥!',
    });

    expect(service.isUnlocked('war.assassin')).toBeTrue();
    expect(service.isUnlocked('war.battle_assassin')).toBeFalse();
  });

  it('does not unlock war.battle_assassin when opponent 2 defeats player Ace in Battle', () => {
    eventBus.emit({ type: 'battle_started', turnNumber: 5, layerRound: 1 });

    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 5,
      layerRound: 1,
      playerChosenCard: cardAce,
      opponentChosenCard: cardTwo,
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      selection: {
        layerRound: 1,
        playerCard: cardAce,
        opponentCard: cardTwo,
        playerCardId: cardAce.id,
        opponentCardId: cardTwo.id,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        specialRule: true,
      },
      specialRule: true,
      message: 'Opponent 2 defeated your Ace.',
    });

    expect(service.isUnlocked('war.assassin')).toBeFalse();
    expect(service.isUnlocked('war.battle_assassin')).toBeFalse();
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
      escalatedToBattle: false,
      type: 'challenge_resolved',
      turnNumber: 3,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: cardAce,
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
    eventBus.emit({
      type: 'game_abandoned',
      turnNumber: 1,
      turnsPlayed: 1,
      playerDeckCount: 25,
      opponentDeckCount: 25,
      playerCardsAtStakeCount: 1,
      opponentCardsAtStakeCount: 1,
      playerCardDeficit: 0,
      gamePhase: GamePhase.NORMAL,
      battleDepth: 0,
    });
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

  describe('retuned achievements and new visible/anomaly recognition', () => {
    it('evaluates retuned Untouchable with >= 18 remaining cards', () => {
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 15,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 15,
        playerCardsRemaining: 17,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 0,
      });
      expect(service.isUnlocked('war.untouchable')).toBeFalse();

      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 15,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 15,
        playerCardsRemaining: 18,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 0,
      });
      expect(service.isUnlocked('war.untouchable')).toBeTrue();
    });

    it('evaluates retuned Massacre with >= 14 opponent casualties in one Battle', () => {
      const casualties13 = Array.from({ length: 13 }, (_, i) => ({
        id: `opp-card-${i}`,
        suit: Suit.CLUBS,
        rank: Rank.SEVEN,
        value: 7,
        isRed: false
      }));
      eventBus.emit({
        type: 'battle_resolved',
        turnNumber: 5,
        outcome: battleOutcome(PlayerType.PLAYER, casualties13, 2),
      });
      expect(service.isUnlocked('war.massacre')).toBeFalse();

      const casualties14 = Array.from({ length: 14 }, (_, i) => ({
        id: `opp-card-${i}`,
        suit: Suit.CLUBS,
        rank: Rank.SEVEN,
        value: 7,
        isRed: false
      }));
      eventBus.emit({
        type: 'battle_resolved',
        turnNumber: 6,
        outcome: battleOutcome(PlayerType.PLAYER, casualties14, 3),
      });
      expect(service.isUnlocked('war.massacre')).toBeTrue();
    });

    it('unlocks Wrong Tool for the Job when player reinforcement 2 loses outright to 3, 4, or 5', () => {
      const pTwo = { id: 'p2-1', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
      const oppFour = { id: 'o4-1', suit: Suit.CLUBS, rank: Rank.FOUR, value: 4, isRed: false };
      const oppSix = { id: 'o6-1', suit: Suit.CLUBS, rank: Rank.SIX, value: 6, isRed: false };
      const oppAce = { id: 'oa-1', suit: Suit.CLUBS, rank: Rank.ACE, value: 14, isRed: false };
      const pSeven = { id: 'p7-1', suit: Suit.HEARTS, rank: Rank.SEVEN, value: 7, isRed: true };

      // Case 1: Losing to 6 does not qualify
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 2,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: pSeven,
        reinforcementCard: pTwo,
        originalWinnerCard: oppSix,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: false,
        escalatedToBattle: false,
        message: 'Lost challenge to 6',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.wrong_tool_for_job')).toBeFalse();

      // Case 2: Player reinforcement not a 2 (e.g. 7 against 4) does not qualify
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 3,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: { id: 'p3', suit: Suit.HEARTS, rank: Rank.THREE, value: 3, isRed: true },
        reinforcementCard: pSeven,
        originalWinnerCard: oppFour,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: false,
        escalatedToBattle: false,
        message: 'Lost challenge',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.wrong_tool_for_job')).toBeFalse();

      // Case 3: Opponent is challenger (not human player sending reinforcement) does not qualify
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 4,
        challenger: PlayerType.OPPONENT,
        originalBeatenCard: oppSix,
        reinforcementCard: pTwo,
        originalWinnerCard: oppFour,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: false,
        escalatedToBattle: false,
        message: 'Opponent challenged',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.wrong_tool_for_job')).toBeFalse();

      // Case 4: Reinforcement 2 against Ace wins (special rule) - not an outright loss to 3, 4, 5
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 5,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: pSeven,
        reinforcementCard: pTwo,
        originalWinnerCard: oppAce,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Two beats Ace',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.wrong_tool_for_job')).toBeFalse();

      // Case 5: Human sends 2 as reinforcement and loses outright to 4 -> qualifies!
      let observedId = '';
      let observedClassification = '';
      eventBus.events$.subscribe((evt) => {
        if (evt.type === 'achievement_observed') {
          observedId = evt.achievementId;
          observedClassification = evt.classification ?? '';
        }
      });

      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 6,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: pSeven,
        reinforcementCard: pTwo,
        originalWinnerCard: oppFour,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: false,
        escalatedToBattle: false,
        message: 'Lost challenge to 4',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.wrong_tool_for_job')).toBeTrue();
      expect(observedId).toBe('war.wrong_tool_for_job');
      expect(observedClassification).toBe('distinction');
    });

    it('unlocks Twin Assassins only when two distinct player 2s defeat two distinct enemy Aces', () => {
      const p2a = { id: 'p2-hearts', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
      const p2b = { id: 'p2-diamonds', suit: Suit.DIAMONDS, rank: Rank.TWO, value: 2, isRed: true };
      const oAa = { id: 'oa-spades', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };
      const oAb = { id: 'oa-clubs', suit: Suit.CLUBS, rank: Rank.ACE, value: 14, isRed: false };

      eventBus.emit({
        type: 'war_started',
        turnNumber: 1,
        playerDeckColor: DeckColor.RED,
      });

      // Pair 1: p2a beats oAa
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 2,
        playerCard: p2a,
        opponentCard: oAa,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'Two beats Ace',
      });
      expect(service.isUnlocked('war.twin_assassins')).toBeFalse();

      // Negative Case: Same 2 (p2a) beating second Ace (oAb) does NOT qualify (one 2 defeating both Aces)
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 4,
        playerCard: p2a,
        opponentCard: oAb,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'Two beats Ace again',
      });
      expect(service.isUnlocked('war.twin_assassins')).toBeFalse();

      // Second distinct 2 (p2b) beating second distinct Ace (oAb) unlocks!
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 6,
        challenger: PlayerType.PLAYER,
        originalBeatenCard: { id: 'px', suit: Suit.HEARTS, rank: Rank.FIVE, value: 5, isRed: true },
        reinforcementCard: p2b,
        originalWinnerCard: oAb,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Second 2 beats second Ace',
        savedTwo: false,
      });
      expect(service.isUnlocked('war.twin_assassins')).toBeTrue();
    });

    it('requires two distinct enemy Aces for Twin Assassins (both 2s defeating same Ace does not qualify)', () => {
      const p2a = { id: 'p2-h', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
      const p2b = { id: 'p2-d', suit: Suit.DIAMONDS, rank: Rank.TWO, value: 2, isRed: true };
      const oAa = { id: 'oa-s', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };

      eventBus.emit({
        type: 'war_started',
        turnNumber: 1,
        playerDeckColor: DeckColor.RED,
      });

      // p2a beats oAa
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 2,
        playerCard: p2a,
        opponentCard: oAa,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'First 2 beats Ace 1',
      });
      expect(service.isUnlocked('war.twin_assassins')).toBeFalse();

      // p2b beats SAME oAa (not a different opponent Ace)
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 3,
        playerCard: p2b,
        opponentCard: oAa,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: 'Second 2 beats same Ace 1',
      });
      expect(service.isUnlocked('war.twin_assassins')).toBeFalse();
    });

    it('recognizes Against Arithmetic on authoritative player victory with maxDeficitExperienced >= 20', () => {
      // 1. Deficit 19 on player victory -> does NOT unlock
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 30,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 30,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 19,
        isComeback: true,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.comeback_20')).toBeFalse();

      // 2. Deficit 22 on OPPONENT victory -> does NOT unlock
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 32,
        outcome: GameOutcome.OPPONENT_WIN,
        turns: 32,
        playerCardsRemaining: 0,
        opponentCardsRemaining: 10,
        maxDeficitExperienced: 22,
        isComeback: false,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.comeback_20')).toBeFalse();

      // 3. Deficit 20 on player victory -> UNLOCKS!
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 35,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 35,
        playerCardsRemaining: 12,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 20,
        isComeback: true,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.comeback_20')).toBeTrue();
    });

    it('recognizes Fifty-One only when turns === 51', () => {
      // Turns 50 -> does not unlock
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 50,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 50,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 2,
        isComeback: false,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.turn_51')).toBeFalse();

      // Turns 52 -> does not unlock
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 52,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 52,
        playerCardsRemaining: 10,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 2,
        isComeback: false,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.turn_51')).toBeFalse();

      // Turns 51 -> UNLOCKS!
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 51,
        outcome: GameOutcome.OPPONENT_WIN,
        turns: 51,
        playerCardsRemaining: 0,
        opponentCardsRemaining: 10,
        maxDeficitExperienced: 2,
        isComeback: false,
        battlesCount: 2,
        playerReinforcementsSent: 1,
      });
      expect(service.isUnlocked('war.turn_51')).toBeTrue();
    });

    it('recognizes Not a Scratch only when player victory with playerCardsRemaining === 26', () => {
      // 25 cards remaining on player victory -> does not unlock
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 15,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 15,
        playerCardsRemaining: 25,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 0,
      });
      expect(service.isUnlocked('war.perfect_victory')).toBeFalse();

      // 26 cards remaining on player victory -> UNLOCKS!
      eventBus.emit({
        type: 'game_resolved',
        turnNumber: 15,
        outcome: GameOutcome.PLAYER_WIN,
        turns: 15,
        playerCardsRemaining: 26,
        opponentCardsRemaining: 0,
        maxDeficitExperienced: 0,
        isComeback: false,
        battlesCount: 1,
        playerReinforcementsSent: 0,
      });
      expect(service.isUnlocked('war.perfect_victory')).toBeTrue();
    });
  });

  describe('Deuce Ex Machina Achievement', () => {
    const cardAceOpponent: Card = { id: 'ace-opp', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };
    const cardTwoPlayer: Card = { id: 'two-ply', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
    const cardEightPlayer: Card = { id: 'eight-ply', suit: Suit.CLUBS, rank: Rank.EIGHT, value: 8, isRed: true };

    it('unlocks when player reveals a 2 as reinforcement against an opponent Ace and defeats it', () => {
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 3,
        challenger: PlayerType.PLAYER,
        reinforcementCard: cardTwoPlayer,
        originalWinnerCard: cardAceOpponent,
        originalBeatenCard: cardEightPlayer,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Card rescued. Both cards survive.',
        savedTwo: false,
      });

      expect(service.isUnlocked('war.deuce_ex_machina')).toBeTrue();
      // Coexists with existing assassin achievement
      expect(service.isUnlocked('war.assassin')).toBeTrue();
    });

    it('does not unlock when a 2 defeats an Ace in an ordinary clash outside reinforcement', () => {
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 1,
        playerCard: cardTwoPlayer,
        opponentCard: cardAceOpponent,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: true,
        message: '2 beats Ace.',
      });

      expect(service.isUnlocked('war.assassin')).toBeTrue();
      expect(service.isUnlocked('war.deuce_ex_machina')).toBeFalse();
    });

    it('does not unlock when the opponent reveals the reinforcement 2 against the player Ace', () => {
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 5,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: cardTwoPlayer,
        originalWinnerCard: cardAceOpponent,
        originalBeatenCard: cardEightPlayer,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Opponent rescues their card.',
        savedTwo: false,
      });

      expect(service.isUnlocked('war.deuce_ex_machina')).toBeFalse();
    });
  });

  describe('Snatched from the Jaws of Victory Achievement', () => {
    const cardAcePlayer: Card = { id: 'ace-p', suit: Suit.HEARTS, rank: Rank.ACE, value: 14, isRed: true };
    const cardKingPlayer: Card = { id: 'king-p', suit: Suit.HEARTS, rank: Rank.KING, value: 13, isRed: true };
    const cardTwoOpponent: Card = { id: 'two-o', suit: Suit.SPADES, rank: Rank.TWO, value: 2, isRed: false };
    const cardKingOpponent: Card = { id: 'king-o', suit: Suit.SPADES, rank: Rank.KING, value: 13, isRed: false };
    const cardTenOpponent: Card = { id: 'ten-o', suit: Suit.SPADES, rank: Rank.TEN, value: 10, isRed: false };

    it('unlocks when opponent reinforces with a 2 to assassinate player winning Ace and reverses outcome', () => {
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 7,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: cardTwoOpponent,
        originalWinnerCard: cardAcePlayer,
        originalBeatenCard: cardTenOpponent,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Opponent rescues their card.',
        savedTwo: false,
      });

      expect(service.isUnlocked('war.snatched_from_jaws_of_victory')).toBeTrue();
    });

    it('does not unlock if player was not winning with an Ace before reinforcement', () => {
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 7,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: cardTwoOpponent,
        originalWinnerCard: cardKingPlayer, // King instead of Ace
        originalBeatenCard: cardTenOpponent,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Opponent rescues their card.',
        savedTwo: false,
      });

      expect(service.isUnlocked('war.snatched_from_jaws_of_victory')).toBeFalse();
    });

    it('does not unlock if opponent reinforcement is not a 2', () => {
      eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: 7,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: cardKingOpponent, // Not a 2
        originalWinnerCard: cardAcePlayer,
        originalBeatenCard: cardTenOpponent,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        challengerWon: true,
        escalatedToBattle: false,
        message: 'Opponent rescues their card.',
        savedTwo: false,
      });

      expect(service.isUnlocked('war.snatched_from_jaws_of_victory')).toBeFalse();
    });

    it('does not unlock if Ace vs 2 event occurs outside reinforcement', () => {
      // Ordinary clash where opponent 2 defeats player Ace
      eventBus.emit({
        type: 'clash_resolved',
        turnNumber: 2,
        playerCard: cardAcePlayer,
        opponentCard: cardTwoOpponent,
        comparison: ComparisonResult.OPPONENT_WINS,
        winner: PlayerType.OPPONENT,
        specialRule: true,
        message: '2 beats Ace.',
      });

      expect(service.isUnlocked('war.snatched_from_jaws_of_victory')).toBeFalse();
    });
  });
});
