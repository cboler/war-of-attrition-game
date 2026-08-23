import { TestBed } from '@angular/core/testing';
import {
  BattleSelectionOutcome,
  ComparisonResult,
  DeckColor,
  GameOutcome,
  GamePhase,
  PlayerType,
} from '../models/game-state.model';
import { DECK_ASSIGNMENT_RANDOM, GameStateService } from './game-state.service';

describe('GameStateService card ledger', () => {
  let service: GameStateService;
  let assignmentRolls: number[];

  beforeEach(() => {
    assignmentRolls = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DECK_ASSIGNMENT_RANDOM,
          useFactory: () => () => assignmentRolls.shift() ?? 0,
        },
      ],
    });
    service = TestBed.inject(GameStateService);
    service.initializeGame({ shuffle: false, playerDeckColor: DeckColor.RED });
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

  it('supports either color assignment while ownership and the exposed assignment stay stable', () => {
    service.initializeGame({ shuffle: false, playerDeckColor: DeckColor.BLACK });

    expect(service.currentPlayerDeckColor).toBe(DeckColor.BLACK);
    expect(service.currentOpponentDeckColor).toBe(DeckColor.RED);
    expect(service.assignedPlayerDeckColor()).toBe(DeckColor.BLACK);
    expect(service.assignedOpponentDeckColor()).toBe(DeckColor.RED);
    expect(service.currentState.playerDeckColor).toBe(DeckColor.BLACK);
    expect(service.currentPlayerDeck.toArray().every((card) => !card.isRed)).toBeTrue();
    expect(service.currentOpponentDeck.toArray().every((card) => card.isRed)).toBeTrue();
    expect(service.assignedCardPool(PlayerType.PLAYER).every((card) => !card.isRed)).toBeTrue();
    expect(service.assignedCardPool(PlayerType.OPPONENT).every((card) => card.isRed)).toBeTrue();
    expectConserved();
  });

  it('rolls assignment once per War and never changes it during that War', () => {
    assignmentRolls = [0.49, 0.75];
    service.initializeGame({ shuffle: false });
    expect(service.currentPlayerDeckColor).toBe(DeckColor.RED);

    service.startTurn();
    service.settleActiveTurn(PlayerType.PLAYER);
    expect(service.currentPlayerDeckColor).toBe(DeckColor.RED);

    service.initializeGame({ shuffle: false });
    expect(service.currentPlayerDeckColor).toBe(DeckColor.BLACK);
    expect(assignmentRolls).toEqual([]);
    expectConserved();
  });

  it('publishes both selected Battle cards in the same state transition', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    const battle = service.dealBattleLayer()!;
    const playerChoice = battle.playerCards[1];
    const opponentChoice = battle.opponentCards[2];

    expect(service.currentState.activeTurn?.publicCardIds).not.toContain(playerChoice.id);
    expect(service.currentState.activeTurn?.publicCardIds).not.toContain(opponentChoice.id);

    service.selectNewestBattleTargets(opponentChoice.id, playerChoice.id);

    const publicIds = service.currentState.activeTurn?.publicCardIds ?? [];
    expect(publicIds).toContain(playerChoice.id);
    expect(publicIds).toContain(opponentChoice.id);
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
    const outcome = service.settleActiveTurn(PlayerType.PLAYER);
    expect(outcome.casualties.length).toBe(1);
    expect(service.playerCardCount()).toBe(26);
    expect(service.opponentCardCount()).toBe(25);
    expect(service.discardedCardCount()).toBe(1);
    expect(service.currentState.activeTurn).toBeNull();
    expectConserved();
  });

  it('captures every battle casualty in one settlement outcome', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    const layer = service.dealBattleLayer()!;
    service.selectNewestBattleTargets(layer.opponentCards[0].id, layer.playerCards[0].id);

    const outcome = service.previewBattleSettlement(PlayerType.PLAYER);
    const activeTurn = service.currentState.activeTurn!;
    expect(outcome.hiddenWinnerCards.length).toBe(2);
    expect(outcome.publicWinnerCards.map(card => card.id)).not.toContain(layer.playerCards[1].id);
    expect(outcome.casualties.map(card => card.id)).toEqual([
      activeTurn.opponentCard.id,
      ...layer.opponentCards.map(card => card.id)
    ]);
    expect(outcome.casualties).toContain(outcome.selectedOpponentChampion!);
    expect(outcome.casualties.length).toBe(4);
    expect(outcome.finalBoneyardCount).toBe(outcome.boneyardCountBeforeSettlement + 4);
    expectConserved();
  });

  it('rejects a Battle outcome whose physical selection does not match active target IDs', () => {
    service.startTurn();
    service.setPhase(GamePhase.BATTLE);
    const layer = service.dealBattleLayer()!;
    const selected = service.selectNewestBattleTargets(
      layer.opponentCards[0].id,
      layer.playerCards[0].id,
    );
    const mismatchedSelection: BattleSelectionOutcome = {
      layerRound: layer.round,
      playerCard: layer.playerCards[1],
      opponentCard: selected.opponentCard,
      playerCardId: layer.playerCards[1].id,
      opponentCardId: selected.opponentCard.id,
      comparison: ComparisonResult.PLAYER_WINS,
      winner: PlayerType.PLAYER,
      specialRule: false,
    };
    const outcome = service.previewBattleSettlement(PlayerType.PLAYER, mismatchedSelection);

    expect(() => service.settleActiveTurn(PlayerType.PLAYER, outcome)).toThrowError(
      'Battle outcome selection no longer matches the selected physical cards',
    );
    expect(service.discardedCardCount()).toBe(0);
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

  it('clears previous lastResult when a new turn starts', () => {
    service.startTurn();
    service.settleActiveTurn(PlayerType.PLAYER);
    expect(service.currentState.lastResult).toBe('player_wins');

    service.startTurn();
    expect(service.currentState.lastResult).toBeNull();
    expectConserved();
  });

  it('represents an equal terminal state as a true tie rather than an arbitrary winner', () => {
    service.endGame();
    expect(service.currentPhase).toBe(GamePhase.GAME_OVER);
    expect(service.currentState.outcome).toBe(GameOutcome.TIE);
    expect(service.currentState.winner).toBeNull();
    expectConserved();
  });
});
