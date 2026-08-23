import { TestBed } from '@angular/core/testing';
import { StoryBookService } from './story-book.service';
import { GameEventBusService } from './game-event-bus.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { PublicBattleResolution } from '../core/models/game-events.model';
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

  function battleOutcome(casualties: readonly Card[]): PublicBattleResolution {
    return {
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      battleDepth: 1,
      selection: null,
      selectedPlayerChampion: null,
      selectedOpponentChampion: null,
      casualties,
      casualtyIds: casualties.map((card) => card.id),
      hiddenWinnerCount: 0,
      publicWinnerCount: 0,
      playerCardsAtStakeCount: 0,
      opponentCardsAtStakeCount: casualties.length,
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

  it('should keep Battle depth, authoritative reveals, and casualties without target-position noise', () => {
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
      selection: {
        layerRound: 1,
        playerCard: cardKing,
        opponentCard: cardEight,
        playerCardId: cardKing.id,
        opponentCardId: cardEight.id,
        comparison: ComparisonResult.PLAYER_WINS,
        winner: PlayerType.PLAYER,
        specialRule: false,
      },
      specialRule: false,
      message: 'K♣ defeated 8♦.',
    });

    eventBus.emit({
      type: 'battle_resolved',
      turnNumber: 3,
      outcome: battleOutcome([cardEight]),
    });

    expect(service.entries().length).toBe(3);
    expect(service.entries()[0].type).toBe('battle_header');
    expect(service.entries()[0].eyebrow).toContain('BATTLE');
    expect(service.entries()[0].eyebrow).not.toContain('BATTLE 1');
    expect(service.entries()[1].type).toBe('battle_reveal');
    expect(service.entries()[1].cards?.map(card => card.id)).toEqual([cardKing.id, cardEight.id]);
    expect(service.entries()[2].type).toBe('casualty');
    expect(service.entries()[2].text).toContain("foe's card falls to the Boneyard");
  });

  it('does not expose reinforcement identity when only the acceptance decision is public', () => {
    eventBus.emit({
      type: 'challenge_accepted',
      turnNumber: 4,
      challenger: PlayerType.OPPONENT,
      reinforcementCard: cardAce,
    });

    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].text).toBe('Opponent committed a reinforcement.');
    expect(service.entries()[0].text).not.toContain('A');
    expect(service.entries()[0].cards).toBeUndefined();
  });

  it('records an equal-rank selected champion reveal as an authoritative tie', () => {
    const cardThreeHearts: Card = {
      id: 'three-hearts-physical',
      suit: Suit.HEARTS,
      rank: Rank.THREE,
      value: 3,
      isRed: true,
    };
    const cardThreeClubs: Card = {
      id: 'three-clubs-physical',
      suit: Suit.CLUBS,
      rank: Rank.THREE,
      value: 3,
      isRed: false,
    };

    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 5,
      // Compatibility mirrors are deliberately stale: Chronicle must trust selection.
      layerRound: 99,
      playerChosenCard: cardKing,
      opponentChosenCard: cardEight,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: true,
      selection: {
        layerRound: 1,
        playerCard: cardThreeHearts,
        opponentCard: cardThreeClubs,
        playerCardId: cardThreeHearts.id,
        opponentCardId: cardThreeClubs.id,
        comparison: ComparisonResult.TIE,
        winner: null,
        specialRule: false,
      },
      message: 'Equal ranks tie.',
    });

    const reveal = service.entries()[0];
    expect(reveal.text).toContain('tied');
    expect(reveal.text).not.toContain('defeated');
    expect(reveal.eyebrow).toBe('BATTLE REVEAL');
    expect(reveal.cards?.map(card => card.id)).toEqual([
      'three-hearts-physical',
      'three-clubs-physical',
    ]);
  });

  it('uses rescue/loss language for challenge results', () => {
    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 4,
      challenger: PlayerType.PLAYER,
      originalBeatenCard: cardEight,
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
      originalBeatenCard: cardTwo,
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

  it('should record valor citation awards as a dignified Chronicle achievement entry', () => {
    eventBus.emit({
      type: 'valor_citation_awarded',
      turnNumber: 12,
      card: cardKing,
      cardId: cardKing.id,
      citation: 'juggernaut',
      citationName: 'Juggernaut Citation',
      description: 'K♣ recorded 3 consecutive decisive victories in this War.'
    });

    expect(service.entries().length).toBe(1);
    const entry = service.entries()[0];
    expect(entry.type).toBe('achievement');
    expect(entry.title).toBe('Juggernaut Citation');
    expect(entry.eyebrow).toContain('VALOR CITATION');
    expect(entry.cards).toEqual([cardKing]);
    expect(entry.badge).toBe('achievement');
  });
});
