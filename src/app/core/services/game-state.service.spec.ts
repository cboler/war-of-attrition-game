import { TestBed } from '@angular/core/testing';
import { GamePhase, PlayerType } from '../models/game-state.model';
import { GameStateService } from './game-state.service';

describe('GameStateService card ledger', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
    service.initializeGame({ shuffle: false });
  });

  function expectConserved(): void {
    const report = service.cardConservationReport();
    expect(report.valid).withContext(JSON.stringify(report)).toBeTrue();
    expect(report.total).toBe(52);
    expect(report.unique).toBe(52);
  }

  it('initializes two color-owned decks with 52 unique suit/rank identities', () => {
    expect(service.playerCardCount()).toBe(26);
    expect(service.opponentCardCount()).toBe(26);
    expect(service.currentPlayerDeck.toArray().every(card => card.isRed)).toBeTrue();
    expect(service.currentOpponentDeck.toArray().every(card => !card.isRed)).toBeTrue();
    expectConserved();
  });

  it('moves ordinary draw cards into the table stake without losing them', () => {
    service.startTurn();
    expect(service.playerCardCount()).toBe(25);
    expect(service.opponentCardCount()).toBe(25);
    expect(service.getStake(PlayerType.PLAYER).length).toBe(1);
    expect(service.getStake(PlayerType.OPPONENT).length).toBe(1);
    expectConserved();
  });

  it('adds reinforcement to the existing stake exactly once', () => {
    service.startTurn();
    service.beginChallenge(PlayerType.PLAYER);
    expect(service.playerCardCount()).toBe(24);
    expect(service.getStake(PlayerType.PLAYER).length).toBe(2);
    expect(service.currentState.activeTurn?.playerChallengeCard).not.toBeNull();
    expectConserved();
  });

  it('deals immutable recursive layers and restricts targets to the newest three', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    const first = service.dealBattleLayer()!;
    service.selectNewestBattleTargets(first.opponentCards[0].id, first.playerCards[1].id);
    const second = service.dealBattleLayer()!;

    expect(service.currentState.activeTurn?.battleLayers.length).toBe(2);
    expect(() => service.selectNewestBattleTargets(
      first.opponentCards[2].id,
      first.playerCards[2].id
    )).toThrowError('Only cards in the newest Battle layer may be selected');
    expect(() => service.selectNewestBattleTargets(
      second.opponentCards[0].id,
      second.playerCards[0].id
    )).not.toThrow();
    expectConserved();
  });

  it('will not create a recursive layer before the current one has resolved', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    service.dealBattleLayer();
    expect(() => service.dealBattleLayer()).toThrowError(
      'A recursive Battle layer cannot be dealt before the current layer resolves'
    );
    expectConserved();
  });

  it('settles only owned cards: winner returns home and loser enters the Boneyard', () => {
    service.startTurn();
    const preview = service.settleActiveTurn(PlayerType.PLAYER);
    expect(preview.losingCards.length).toBe(1);
    expect(service.playerCardCount()).toBe(26);
    expect(service.opponentCardCount()).toBe(25);
    expect(service.discardedCardCount()).toBe(1);
    expect(service.currentState.activeTurn).toBeNull();
    expectConserved();
  });

  it('keeps hidden winner cards out of the public Battle settlement preview', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    const layer = service.dealBattleLayer()!;
    service.selectNewestBattleTargets(layer.opponentCards[0].id, layer.playerCards[0].id);

    const preview = service.previewBattleSettlement(PlayerType.PLAYER);
    expect(preview.hiddenWinnerCardCount).toBe(2);
    expect(preview.publicWinnerCards.map(card => card.id)).not.toContain(layer.playerCards[1].id);
    expect(preview.casualtyRevealCards.map(card => card.id)).toContain(layer.opponentCards[1].id);
    expect(preview.casualtyRevealCards.length).toBe(2);
    expectConserved();
  });

  it('resets a completed game to a fresh conserved ledger', () => {
    service.startTurn();
    service.settleActiveTurn(PlayerType.OPPONENT);
    service.reset();
    expect(service.currentPhase).toBe(GamePhase.NORMAL);
    expect(service.currentState.activeTurn).toBeNull();
    expect(service.discardedCardCount()).toBe(0);
    expectConserved();
  });
});
