import { TestBed } from '@angular/core/testing';
import { StoryBookService } from './story-book.service';
import { GameEventBusService } from './game-event-bus.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { BattleOutcome, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { ComparisonResult } from '../core/services/card-comparison.service';

describe('StoryBookService', () => {
  let service: StoryBookService;
  let eventBus: GameEventBusService;

  const cardAce: Card = { id: 'c1', suit: Suit.HEARTS, rank: Rank.ACE, value: 14, isRed: true };
  const cardTwo: Card = { id: 'c2', suit: Suit.SPADES, rank: Rank.TWO, value: 2, isRed: false };
  const cardKing: Card = { id: 'c3', suit: Suit.CLUBS, rank: Rank.KING, value: 13, isRed: false };
  const cardEight: Card = {
    id: 'c4',
    suit: Suit.DIAMONDS,
    rank: Rank.EIGHT,
    value: 8,
    isRed: true,
  };

  function battleOutcome(casualties: readonly Card[]): BattleOutcome {
    return {
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      battleDepth: 1,
      layers: [],
      playerCardsAtStake: [],
      opponentCardsAtStake: casualties,
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
    TestBed.configureTestingModule({
      providers: [StoryBookService, GameEventBusService],
    });
    service = TestBed.inject(StoryBookService);
    eventBus = TestBed.inject(GameEventBusService);
  });

  it('should start with empty journal', () => {
    expect(service.entries().length).toBe(0);
    expect(service.hasEntries()).toBe(false);
  });

  it('should curate narrative and omit ordinary mundane clash turns to avoid noise', () => {
    // Ordinary clash: K beats 8 without special rule
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 1,
      playerCard: cardKing,
      opponentCard: cardEight,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: false,
      message: 'K♣ defeated 8♦.',
    });

    // Should NOT create an entry for mundane clash
    expect(service.entries().length).toBe(0);
  });

  it('should record special rule assassin clashes', () => {
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 2,
      playerCard: cardTwo,
      opponentCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: true,
      message: '2♠ assassinated A♥!',
    });

    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].type).toBe('clash');
    expect(service.entries()[0].text).toContain('2♠ assassinated A♥');
    expect(service.entries()[0].badge).toBe('victory');
  });

  it('should record battle layer, target selections, reveals, and casualties', () => {
    eventBus.emit({
      type: 'battle_started',
      turnNumber: 3,
      layerRound: 1,
    });

    eventBus.emit({
      type: 'battle_target_selected',
      turnNumber: 3,
      layerRound: 1,
      selector: PlayerType.PLAYER,
      targetIndex: 0,
    });

    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 3,
      layerRound: 1,
      playerChosenCard: cardKing,
      opponentChosenCard: cardEight,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: false,
      message: 'K♣ defeated 8♦.',
    });

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 3,
      outcome: battleOutcome([cardEight]),
    });

    expect(service.entries().length).toBe(4);
    expect(service.entries()[0].type).toBe('battle_header');
    expect(service.entries()[1].type).toBe('battle_selection');
    expect(service.entries()[2].type).toBe('battle_reveal');
    expect(service.entries()[3].type).toBe('casualty');
    expect(service.entries()[3].text).toContain("foe's card falls to the Boneyard");
  });

  it('uses rescue/loss language for challenge results', () => {
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 4,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardTwo,
      originalWinnerCard: cardAce,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      message: 'Card rescued. Both cards survive.',
      savedTwo: false,
    });
    expect(service.entries().at(-1)?.text).toContain('Card rescued.');
    expect(service.entries().at(-1)?.text).toContain('both of your cards survive');

    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 5,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardEight,
      originalWinnerCard: cardKing,
      comparison: ComparisonResult.OPPONENT_WINS,
      winner: PlayerType.OPPONENT,
      challengerWon: false,
      message: 'Both are now lost.',
      savedTwo: false,
    });
    expect(service.entries().at(-1)?.text).toContain('Both are now lost.');
  });

  it('should record game resolution and clear on clear()', () => {
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 15,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 15,
      playerCardsRemaining: 26,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 0,
      playerReinforcementsSent: 0,
    });

    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].type).toBe('game_over');
    expect(service.entries()[0].title).toBe('WAR WON · VICTORY');

    service.clear();
    expect(service.entries().length).toBe(0);
    expect(service.hasEntries()).toBe(false);
  });
});
