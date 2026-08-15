import { TestBed } from '@angular/core/testing';
import { GameOutcome, GamePhase, PlayerType } from '../models/game-state.model';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';
import { GameStateService } from './game-state.service';
import { OpponentAIService } from './opponent-ai.service';
import { TurnResolutionService } from './turn-resolution.service';

describe('TurnResolutionService', () => {
  let service: TurnResolutionService;
  let gameState: GameStateService;
  let comparison: CardComparisonService;
  let opponentAI: OpponentAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnResolutionService);
    gameState = TestBed.inject(GameStateService);
    comparison = TestBed.inject(CardComparisonService);
    opponentAI = TestBed.inject(OpponentAIService);
    gameState.initializeGame({ shuffle: false });
  });

  function activeCards() {
    const cards = gameState.startTurn();
    if (!cards.playerCard || !cards.opponentCard) throw new Error('Expected both active cards');
    return { playerCard: cards.playerCard, opponentCard: cards.opponentCard };
  }

  function expectConserved(): void {
    expect(gameState.cardConservationReport().valid).toBeTrue();
  }

  function reduceDecksTo(
    playerCount: number,
    opponentCount: number
  ): jasmine.Spy {
    const compareSpy = spyOn(comparison, 'compareCards');
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    while (gameState.playerCardCount() > playerCount) {
      const cards = activeCards();
      compareSpy.and.returnValue(ComparisonResult.OPPONENT_WINS);
      service.resolveTurn(cards.playerCard, cards.opponentCard);
      service.resolveChallengeConcession(PlayerType.PLAYER);
      expectConserved();
    }
    while (gameState.opponentCardCount() > opponentCount) {
      const cards = activeCards();
      compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);
      service.resolveTurn(cards.playerCard, cards.opponentCard);
      expectConserved();
    }
    return compareSpy;
  }

  function resolveTerminalAttrition(
    playerRemaining: number,
    opponentRemaining: number
  ) {
    const compareSpy = reduceDecksTo(playerRemaining + 1, opponentRemaining + 1);
    const cards = activeCards();
    expect(gameState.playerCardCount()).toBe(playerRemaining);
    expect(gameState.opponentCardCount()).toBe(opponentRemaining);
    compareSpy.and.returnValue(ComparisonResult.TIE);
    const result = service.resolveTurn(cards.playerCard, cards.opponentCard);
    expectConserved();
    return result;
  }

  it('settles an ordinary decisive turn exactly once', () => {
    const cards = activeCards();
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    const result = service.resolveTurn(cards.playerCard, cards.opponentCard);

    expect(result.winner).toBe(PlayerType.PLAYER);
    expect(gameState.playerCardCount()).toBe(26);
    expect(gameState.opponentCardCount()).toBe(25);
    expect(gameState.discardedCardCount()).toBe(1);
    expect(gameState.currentState.activeTurn).toBeNull();
    expectConserved();
  });

  it('does not pre-settle a player loss while the challenge decision is pending', () => {
    const cards = activeCards();
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    const result = service.resolveTurn(cards.playerCard, cards.opponentCard);

    expect(result.winner).toBeNull();
    expect(result.canChallenge).toBeTrue();
    expect(gameState.discardedCardCount()).toBe(0);
    expect(gameState.getStake(PlayerType.PLAYER)).toEqual([cards.playerCard]);
    expect(gameState.getStake(PlayerType.OPPONENT)).toEqual([cards.opponentCard]);
    expectConserved();
  });

  it('settles a player concession without searching a deck for the active card', () => {
    const cards = activeCards();
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    service.resolveTurn(cards.playerCard, cards.opponentCard);

    service.resolveChallengeConcession(PlayerType.PLAYER);

    expect(gameState.playerCardCount()).toBe(25);
    expect(gameState.opponentCardCount()).toBe(26);
    expect(gameState.discardedCards()).toEqual([cards.playerCard]);
    expectConserved();
  });

  it('accounts for player challenge win, loss, and tie without double removal', () => {
    const compareSpy = spyOn(comparison, 'compareCards');
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    const outcomes = [
      ComparisonResult.PLAYER_WINS,
      ComparisonResult.OPPONENT_WINS,
      ComparisonResult.TIE
    ];

    for (const outcome of outcomes) {
      gameState.initializeGame({ shuffle: false });
      const cards = activeCards();
      compareSpy.and.returnValue(ComparisonResult.OPPONENT_WINS);
      service.resolveTurn(cards.playerCard, cards.opponentCard);
      const reinforcement = gameState.beginChallenge(PlayerType.PLAYER);
      expect(reinforcement).not.toBeNull();
      compareSpy.and.returnValue(outcome);

      const result = service.resolveChallenge(PlayerType.PLAYER);
      expectConserved();

      if (outcome === ComparisonResult.PLAYER_WINS) {
        expect(gameState.playerCardCount()).toBe(26);
        expect(gameState.opponentCardCount()).toBe(25);
        expect(gameState.discardedCardCount()).toBe(1);
      } else if (outcome === ComparisonResult.OPPONENT_WINS) {
        expect(gameState.playerCardCount()).toBe(24);
        expect(gameState.opponentCardCount()).toBe(26);
        expect(gameState.discardedCardCount()).toBe(2);
      } else {
        expect(result.nextPhase).toBe(GamePhase.BATTLE);
        expect(gameState.getStake(PlayerType.PLAYER).length).toBe(2);
        expect(gameState.getStake(PlayerType.OPPONENT).length).toBe(1);
        expect(gameState.discardedCardCount()).toBe(0);
      }
    }
  });

  it('accounts for opponent challenge win, loss, and tie symmetrically', () => {
    const compareSpy = spyOn(comparison, 'compareCards');
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(true);
    const outcomes = [
      ComparisonResult.OPPONENT_WINS,
      ComparisonResult.PLAYER_WINS,
      ComparisonResult.TIE
    ];

    for (const outcome of outcomes) {
      gameState.initializeGame({ shuffle: false });
      const cards = activeCards();
      compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);
      const pending = service.resolveTurn(cards.playerCard, cards.opponentCard);
      expect(pending.opponentChallenge).toBeTrue();
      gameState.beginChallenge(PlayerType.OPPONENT);
      compareSpy.and.returnValue(outcome);

      const result = service.resolveChallenge(PlayerType.OPPONENT);
      expectConserved();

      if (outcome === ComparisonResult.OPPONENT_WINS) {
        expect(gameState.opponentCardCount()).toBe(26);
        expect(gameState.playerCardCount()).toBe(25);
        expect(gameState.discardedCardCount()).toBe(1);
      } else if (outcome === ComparisonResult.PLAYER_WINS) {
        expect(gameState.opponentCardCount()).toBe(24);
        expect(gameState.playerCardCount()).toBe(26);
        expect(gameState.discardedCardCount()).toBe(2);
      } else {
        expect(result.nextPhase).toBe(GamePhase.BATTLE);
        expect(gameState.getStake(PlayerType.OPPONENT).length).toBe(2);
      }
    }
  });

  it('passes an unordered color pool, deck count, and public information into challenge strategy', () => {
    const cards = activeCards();
    const hiddenPlayerIds = new Set(gameState.currentPlayerDeck.toArray().map(card => card.id));
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    const strategy = spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    service.resolveTurn(cards.playerCard, cards.opponentCard);

    const context = strategy.calls.mostRecent().args[1]!;
    expect(context.ownDeckCount).toBe(25);
    expect(context.ownCardPool.every(card => !card.isRed)).toBeTrue();
    expect((context as unknown as { ownDeck?: unknown }).ownDeck).toBeUndefined();
    expect(context.publicCards).toContain(cards.playerCard);
    expect(context.publicCards).toContain(cards.opponentCard);
    expect(context.publicCards.some(card => hiddenPlayerIds.has(card.id))).toBeFalse();
  });

  it('awards attrition to the player with 3 cards when the opponent has only 2', () => {
    const result = resolveTerminalAttrition(3, 2);
    expect(result.winner).toBe(PlayerType.PLAYER);
    expect(result.terminalOutcome).toBe(GameOutcome.PLAYER_WIN);
    expect(gameState.currentState.outcome).toBe(GameOutcome.PLAYER_WIN);
  });

  it('awards attrition to the opponent with 3 cards when the player has only 2', () => {
    const result = resolveTerminalAttrition(2, 3);
    expect(result.winner).toBe(PlayerType.OPPONENT);
    expect(result.terminalOutcome).toBe(GameOutcome.OPPONENT_WIN);
    expect(gameState.currentState.outcome).toBe(GameOutcome.OPPONENT_WIN);
  });

  it('uses remaining-card count when neither side can continue: player 2, opponent 1', () => {
    const result = resolveTerminalAttrition(2, 1);
    expect(result.winner).toBe(PlayerType.PLAYER);
    expect(result.terminalOutcome).toBe(GameOutcome.PLAYER_WIN);
  });

  it('uses remaining-card count when neither side can continue: player 1, opponent 2', () => {
    const result = resolveTerminalAttrition(1, 2);
    expect(result.winner).toBe(PlayerType.OPPONENT);
    expect(result.terminalOutcome).toBe(GameOutcome.OPPONENT_WIN);
  });

  it('ends in a true tie when neither side can continue at 2 cards each', () => {
    const result = resolveTerminalAttrition(2, 2);
    expect(result.winner).toBeNull();
    expect(result.terminalOutcome).toBe(GameOutcome.TIE);
    expect(gameState.currentState.winner).toBeNull();
    expect(gameState.currentState.outcome).toBe(GameOutcome.TIE);
    expect(gameState.currentState.activeTurn).not.toBeNull();
  });

  it('ends in a true tie at 0 cards each when both final cards tie', () => {
    const result = resolveTerminalAttrition(0, 0);
    expect(result.winner).toBeNull();
    expect(result.terminalOutcome).toBe(GameOutcome.TIE);
    expect(gameState.currentState.outcome).toBe(GameOutcome.TIE);
    expect(gameState.playerCardCount()).toBe(0);
    expect(gameState.opponentCardCount()).toBe(0);
  });

  it('preserves accumulated recursive layers when equal exhaustion ends in a true tie', () => {
    const compareSpy = reduceDecksTo(7, 7);
    const cards = activeCards();
    compareSpy.and.returnValue(ComparisonResult.TIE);
    service.resolveTurn(cards.playerCard, cards.opponentCard);
    const first = gameState.dealBattleLayer()!;
    service.resolveBattleSelection(first.opponentCards[0].id, first.playerCards[0].id);
    const second = gameState.dealBattleLayer()!;

    const result = service.resolveBattleSelection(
      second.opponentCards[0].id,
      second.playerCards[0].id
    );

    expect(result.terminalOutcome).toBe(GameOutcome.TIE);
    expect(result.pendingBattleSettlement).toBeFalse();
    expect(gameState.currentState.outcome).toBe(GameOutcome.TIE);
    expect(gameState.currentState.activeTurn?.battleLayers.length).toBe(2);
    expect(gameState.getStake(PlayerType.PLAYER).length).toBe(7);
    expect(gameState.getStake(PlayerType.OPPONENT).length).toBe(7);
    expectConserved();
  });

  it('defers decisive Battle settlement until casualties have been presented', () => {
    const cards = activeCards();
    const compareSpy = spyOn(comparison, 'compareCards');
    compareSpy.and.returnValue(ComparisonResult.TIE);
    service.resolveTurn(cards.playerCard, cards.opponentCard);
    const layer = gameState.dealBattleLayer()!;
    compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);

    const result = service.resolveBattleSelection(layer.opponentCards[0].id, layer.playerCards[0].id);

    expect(result.pendingBattleSettlement).toBeTrue();
    expect(result.casualtyRevealCards.length).toBe(2);
    expect(result.hiddenWinnerCardCount).toBe(2);
    expect(result.cardsKept).not.toContain(layer.playerCards[1]);
    expect(gameState.discardedCardCount()).toBe(0);
    expect(gameState.currentState.activeTurn).not.toBeNull();
    expectConserved();

    service.finalizeBattle(PlayerType.PLAYER);
    expect(gameState.discardedCardCount()).toBe(4);
    expect(gameState.playerCardCount()).toBe(26);
    expect(gameState.opponentCardCount()).toBe(22);
    expectConserved();
  });

  it('accumulates recursive Battle stakes and reveals every hidden loser casualty only', () => {
    const cards = activeCards();
    const compareSpy = spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.TIE);
    service.resolveTurn(cards.playerCard, cards.opponentCard);
    const first = gameState.dealBattleLayer()!;
    const tied = service.resolveBattleSelection(first.opponentCards[0].id, first.playerCards[0].id);
    expect(tied.nextPhase).toBe(GamePhase.BATTLE);
    const second = gameState.dealBattleLayer()!;
    compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);

    const result = service.resolveBattleSelection(second.opponentCards[0].id, second.playerCards[0].id);

    expect(result.cardsLost.length).toBe(7);
    expect(result.casualtyRevealCards.length).toBe(4);
    expect(result.hiddenWinnerCardCount).toBe(4);
    expect(gameState.currentState.activeTurn?.battleLayers.length).toBe(2);
    expect(gameState.discardedCardCount()).toBe(0);
    expectConserved();

    service.finalizeBattle(PlayerType.PLAYER);
    expect(gameState.discardedCardCount()).toBe(7);
    expect(gameState.playerCardCount()).toBe(26);
    expect(gameState.opponentCardCount()).toBe(19);
    expectConserved();
  });

  it('ends by attrition with the full 52-card ledger intact when three new cards are unavailable', () => {
    const compareSpy = spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    for (let loss = 0; loss < 23; loss++) {
      const cards = activeCards();
      service.resolveTurn(cards.playerCard, cards.opponentCard);
      service.resolveChallengeConcession(PlayerType.PLAYER);
    }
    expect(gameState.playerCardCount()).toBe(3);

    const finalCards = activeCards();
    compareSpy.and.returnValue(ComparisonResult.TIE);
    const result = service.resolveTurn(finalCards.playerCard, finalCards.opponentCard);

    expect(result.nextPhase).toBe(GamePhase.GAME_OVER);
    expect(result.winner).toBe(PlayerType.OPPONENT);
    expect(gameState.playerCardCount()).toBe(2);
    expect(gameState.opponentCardCount()).toBe(26);
    expect(gameState.discardedCardCount()).toBe(24);
    expectConserved();
  });

  it('defers recursive-Battle attrition settlement until hidden casualties are revealed', () => {
    const compareSpy = spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    for (let loss = 0; loss < 22; loss++) {
      const cards = activeCards();
      service.resolveTurn(cards.playerCard, cards.opponentCard);
      service.resolveChallengeConcession(PlayerType.PLAYER);
    }
    expect(gameState.playerCardCount()).toBe(4);

    const cards = activeCards();
    compareSpy.and.returnValue(ComparisonResult.TIE);
    service.resolveTurn(cards.playerCard, cards.opponentCard);
    const layer = gameState.dealBattleLayer()!;
    const result = service.resolveBattleSelection(layer.opponentCards[0].id, layer.playerCards[0].id);

    expect(result.nextPhase).toBe(GamePhase.GAME_OVER);
    expect(result.pendingBattleSettlement).toBeTrue();
    expect(result.winner).toBe(PlayerType.OPPONENT);
    expect(result.casualtyRevealCards.length).toBe(2);
    expect(gameState.discardedCardCount()).toBe(22);
    expect(gameState.currentState.activeTurn).not.toBeNull();
    expectConserved();

    service.finalizeBattle(PlayerType.OPPONENT, true);
    expect(gameState.currentPhase).toBe(GamePhase.GAME_OVER);
    expect(gameState.discardedCardCount()).toBe(26);
    expectConserved();
  });
});
