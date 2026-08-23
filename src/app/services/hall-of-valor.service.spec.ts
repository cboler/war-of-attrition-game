import { TestBed } from '@angular/core/testing';
import { Card, CardImpl, Rank, Suit } from '../core/models/card.model';
import {
  DeckColor,
  GameOutcome,
  PlayerType,
  SettlementAttribution
} from '../core/models/game-state.model';
import { AuthService } from '../core/services/auth.service';
import { GameEventBusService } from './game-event-bus.service';
import { HallOfValorService } from './hall-of-valor.service';

describe('HallOfValorService', () => {
  let service: HallOfValorService;
  let eventBus: GameEventBusService;
  let authService: AuthService;

  const cardH2 = new CardImpl(Suit.HEARTS, Rank.TWO);
  const cardHK = new CardImpl(Suit.HEARTS, Rank.KING);
  const cardHQ = new CardImpl(Suit.HEARTS, Rank.QUEEN);
  const cardH10 = new CardImpl(Suit.HEARTS, Rank.TEN);
  const cardSA = new CardImpl(Suit.SPADES, Rank.ACE);
  const cardSK = new CardImpl(Suit.SPADES, Rank.KING);
  const cardSQ = new CardImpl(Suit.SPADES, Rank.QUEEN);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [HallOfValorService, GameEventBusService, AuthService]
    });
    service = TestBed.inject(HallOfValorService);
    eventBus = TestBed.inject(GameEventBusService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty decorated cards', () => {
    expect(service.decoratedCards()).toEqual([]);
    expect(service.totalDecoratedCards()).toBe(0);
    expect(service.hasDecorations('hearts-K')).toBeFalse();
    expect(service.getRecord('hearts-K')).toBeNull();
  });

  it('should credit confirmed casualties to player decisive card on player settlement victory', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    const attribution: SettlementAttribution = {
      source: 'clash',
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      decisiveCard: cardHK,
      casualties: [cardSQ],
      battleDepth: 0
    };

    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: 1,
      attribution
    });

    const record = service.getRecord(cardHK.id);
    expect(record).toBeTruthy();
    expect(record?.confirmedCasualties).toBe(1);
    expect(record?.aceAssassinations).toBe(0);
    expect(service.hasDecorations(cardHK.id)).toBeTrue();
  });

  it('should NOT credit player cards when opponent wins a settlement', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    const attribution: SettlementAttribution = {
      source: 'clash',
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      decisiveCard: cardSK,
      casualties: [cardHQ],
      battleDepth: 0
    };

    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: 1,
      attribution
    });

    expect(service.getRecord(cardSK.id)).toBeNull(); // Rival card not credited as player winner
    const playerRecord = service.getRecord(cardHQ.id);
    expect(playerRecord?.confirmedCasualties ?? 0).toBe(0);
    expect(playerRecord?.notableLosses).toEqual({ [cardSK.id]: 1 }); // Rival recorded
  });

  it('should credit Ace assassinations when Two defeats an Ace', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    const attribution: SettlementAttribution = {
      source: 'clash',
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      decisiveCard: cardH2,
      casualties: [cardSA],
      battleDepth: 0
    };

    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: 1,
      attribution
    });

    const record = service.getRecord(cardH2.id);
    expect(record?.confirmedCasualties).toBe(1);
    expect(record?.aceAssassinations).toBe(1);
  });

  it('should credit reinforcement rescues and times rescued on successful challenge', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    eventBus.emit({
      type: 'challenge_resolved',
      turnNumber: 2,
      challenger: PlayerType.PLAYER,
      reinforcementCard: cardHK,
      originalWinnerCard: cardSQ,
      originalBeatenCard: cardH10,
      comparison: { playerValue: 13, opponentValue: 12, winner: PlayerType.PLAYER, specialRule: false } as any,
      winner: PlayerType.PLAYER,
      challengerWon: true,
      savedTwo: false,
      message: 'Rescue successful!'
    });

    const rescueRecord = service.getRecord(cardHK.id);
    expect(rescueRecord?.reinforcementRescues).toBe(1);

    const savedRecord = service.getRecord(cardH10.id);
    expect(savedRecord?.timesRescued).toBe(1);
  });

  it('should credit battle layers survived for legally revealed public champion', () => {
    eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: 5,
      layerRound: 1,
      playerChosenCard: cardSK,
      opponentChosenCard: cardHK,
      comparison: { playerValue: 13, opponentValue: 13, winner: null, specialRule: false } as any,
      winner: null,
      specialRule: false,
      message: 'Battle tie',
      selection: {
        layerRound: 1,
        playerCard: cardHK,
        opponentCard: cardSK,
        playerCardId: cardHK.id,
        opponentCardId: cardSK.id,
        comparison: {} as any,
        winner: null,
        specialRule: false
      }
    });

    const record = service.getRecord(cardHK.id);
    expect(record?.battleLayersSurvived).toBe(1);
  });

  it('should credit victorious wars survived only for player victories', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 30,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 30,
      playerCardsRemaining: 2,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 1,
      playerReinforcementsSent: 1,
      playerDeckColor: DeckColor.RED,
      survivingPlayerCardIds: [cardHK.id, cardH2.id]
    });

    expect(service.getRecord(cardHK.id)?.victoriousWarsSurvived).toBe(1);
    expect(service.getRecord(cardH2.id)?.victoriousWarsSurvived).toBe(1);
    expect(service.getRecord(cardHQ.id)).toBeNull(); // Eliminated card not credited

    // Opponent win should not credit
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 30,
      outcome: GameOutcome.OPPONENT_WIN,
      turns: 30,
      playerCardsRemaining: 0,
      opponentCardsRemaining: 10,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 1,
      playerReinforcementsSent: 1,
      playerDeckColor: DeckColor.RED,
      survivingPlayerCardIds: [cardHK.id]
    });

    // Count remains 1
    expect(service.getRecord(cardHK.id)?.victoriousWarsSurvived).toBe(1);
  });

  it('should award Juggernaut Citation on 5 consecutive decisive appearances in a War and emit event', () => {
    let emittedEvent: any = null;
    eventBus.events$.subscribe(event => {
      if (event.type === 'valor_citation_awarded' && event.cardId === cardHK.id) {
        emittedEvent = event;
      }
    });

    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    const makeWin = (turn: number) => {
      eventBus.emit({
        type: 'settlement_resolved',
        turnNumber: turn,
        attribution: {
          source: 'clash',
          winner: PlayerType.PLAYER,
          loser: PlayerType.OPPONENT,
          decisiveCard: cardHK,
          casualties: [cardSQ],
          battleDepth: 0
        }
      });
    };

    // 1st through 4th win -> No citation yet
    makeWin(1);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(0);
    expect(emittedEvent).toBeNull();

    makeWin(5);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(0);
    expect(emittedEvent).toBeNull();

    makeWin(9);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(0);
    expect(emittedEvent).toBeNull();

    makeWin(12);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(0);
    expect(emittedEvent).toBeNull();

    // 5th win -> Citation awarded!
    makeWin(15);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(1);
    expect(emittedEvent).not.toBeNull();
    expect(emittedEvent.description).toContain('5 consecutive decisive victories');

    // 6th win in same War -> Still 1 citation (at most one per War)
    makeWin(18);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(1);
  });

  it('should reset Juggernaut streak when the card suffers a defeat in the same War', () => {
    eventBus.emit({
      type: 'war_started',
      turnNumber: 1,
      playerDeckColor: DeckColor.RED
    });

    const makeWin = (turn: number) => {
      eventBus.emit({
        type: 'settlement_resolved',
        turnNumber: turn,
        attribution: {
          source: 'clash',
          winner: PlayerType.PLAYER,
          loser: PlayerType.OPPONENT,
          decisiveCard: cardHK,
          casualties: [cardSQ],
          battleDepth: 0
        }
      });
    };

    // 4 wins
    makeWin(1);
    makeWin(3);
    makeWin(5);
    makeWin(7);

    // Defeat cardHK
    eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: 9,
      attribution: {
        source: 'clash',
        winner: PlayerType.OPPONENT,
        loser: PlayerType.PLAYER,
        decisiveCard: cardSA,
        casualties: [cardHK],
        battleDepth: 0
      }
    });

    // 4 wins after defeat (streak is now 4, not 5 -> not awarded)
    makeWin(11);
    makeWin(13);
    makeWin(15);
    makeWin(17);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(0);

    // 5th win after defeat (streak reaches 5) -> now awarded!
    makeWin(19);
    expect(service.getRecord(cardHK.id)?.juggernautCitations).toBe(1);
  });
});
