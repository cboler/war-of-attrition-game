import { TestBed } from '@angular/core/testing';
import { StoryBookService } from './story-book.service';
import { GameEventBusService } from './game-event-bus.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { ComparisonResult } from '../core/services/card-comparison.service';

describe('StoryBookService', () => {
  let service: StoryBookService;
  let eventBus: GameEventBusService;

  const sampleCard1: Card = { id: 'c1', suit: Suit.HEARTS, rank: Rank.ACE, value: 14, isRed: true };
  const sampleCard2: Card = { id: 'c2', suit: Suit.SPADES, rank: Rank.KING, value: 13, isRed: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoryBookService, GameEventBusService]
    });
    service = TestBed.inject(StoryBookService);
    eventBus = TestBed.inject(GameEventBusService);
  });

  it('should start with empty journal', () => {
    expect(service.entries().length).toBe(0);
    expect(service.hasEntries()).toBe(false);
  });

  it('should record turn started', () => {
    eventBus.emit({ type: 'turn_started', turnNumber: 1 });
    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].type).toBe('turn');
    expect(service.entries()[0].text).toBe('TURN 1');
  });

  it('should record clash resolution', () => {
    eventBus.emit({
      type: 'clash_resolved',
      turnNumber: 1,
      playerCard: sampleCard1,
      opponentCard: sampleCard2,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: false,
      message: 'A♥ defeated K♠.'
    });

    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].type).toBe('clash');
    expect(service.entries()[0].text).toContain('A♥ defeated K♠');
    expect(service.entries()[0].badge).toBe('victory');
  });

  it('should record battle layer and selections', () => {
    eventBus.emit({
      type: 'battle_started',
      turnNumber: 2,
      layerRound: 1
    });

    eventBus.emit({
      type: 'battle_target_selected',
      turnNumber: 2,
      layerRound: 1,
      selector: PlayerType.PLAYER,
      targetIndex: 0
    });

    expect(service.entries().length).toBe(2);
    expect(service.entries()[0].type).toBe('battle_header');
    expect(service.entries()[1].type).toBe('battle_selection');
    expect(service.entries()[1].text).toContain('left card');
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
      isComeback: false
    });

    expect(service.entries().length).toBe(1);
    expect(service.entries()[0].type).toBe('game_over');
    expect(service.entries()[0].title).toBe('VICTORY');

    service.clear();
    expect(service.entries().length).toBe(0);
  });
});
