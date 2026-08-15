import { Injectable, computed, signal } from '@angular/core';
import { Card } from '../models/card.model';
import { Deck } from '../models/deck.model';
import {
  ActiveTurn,
  BattleLayer,
  GamePhase,
  GameState,
  GameStats,
  PlayerType
} from '../models/game-state.model';

export interface CardConservationReport {
  readonly total: number;
  readonly unique: number;
  readonly duplicateIds: readonly string[];
  readonly missingIds: readonly string[];
  readonly valid: boolean;
}

export interface BattleSettlementPreview {
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly losingCards: readonly Card[];
  readonly casualtyRevealCards: readonly Card[];
  readonly publicWinnerCards: readonly Card[];
  readonly hiddenWinnerCardCount: number;
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly playerDeck = signal<Deck>(Deck.createRedDeck());
  private readonly opponentDeck = signal<Deck>(Deck.createBlackDeck());
  private readonly discardPile = signal<readonly Card[]>([]);
  private readonly gamePhase = signal(GamePhase.SETUP);
  private readonly turnNumber = signal(0);
  private readonly activeTurn = signal<ActiveTurn | null>(null);
  private readonly winner = signal<PlayerType | null>(null);
  private readonly isPlayerTurn = signal(true);
  private readonly canChallenge = signal(false);
  private readonly lastResult = signal<string | null>(null);

  readonly playerCardCount = computed(() => this.playerDeck().count);
  readonly opponentCardCount = computed(() => this.opponentDeck().count);
  readonly discardedCardCount = computed(() => this.discardPile().length);
  readonly discardedCards = computed(() => [...this.discardPile()]);

  readonly gameStats = computed<GameStats>(() => ({
    turnNumber: this.turnNumber(),
    playerCardCount: this.playerCardCount(),
    opponentCardCount: this.opponentCardCount(),
    discardedCardCount: this.discardedCardCount()
  }));

  readonly gameState = computed<GameState>(() => ({
    phase: this.gamePhase(),
    stats: this.gameStats(),
    activeTurn: this.activeTurn(),
    winner: this.winner(),
    isPlayerTurn: this.isPlayerTurn(),
    canChallenge: this.canChallenge(),
    lastResult: this.lastResult()
  }));

  get currentPhase(): GamePhase { return this.gamePhase(); }
  get currentStats(): GameStats { return this.gameStats(); }
  get currentState(): GameState { return this.gameState(); }
  get currentPlayerDeck(): Deck { return this.playerDeck().copy(); }
  get currentOpponentDeck(): Deck { return this.opponentDeck().copy(); }
  get currentDiscardPile(): readonly Card[] { return [...this.discardPile()]; }

  initializeGame(options: { shuffle?: boolean } = {}): void {
    const nextPlayerDeck = Deck.createRedDeck();
    const nextOpponentDeck = Deck.createBlackDeck();
    if (options.shuffle !== false) {
      nextPlayerDeck.shuffle();
      nextOpponentDeck.shuffle();
    }

    this.playerDeck.set(nextPlayerDeck);
    this.opponentDeck.set(nextOpponentDeck);
    this.discardPile.set([]);
    this.gamePhase.set(GamePhase.NORMAL);
    this.turnNumber.set(0);
    this.activeTurn.set(null);
    this.winner.set(null);
    this.isPlayerTurn.set(true);
    this.canChallenge.set(false);
    this.lastResult.set(null);
    this.assertCardConservation();
  }

  startTurn(): { playerCard: Card | null; opponentCard: Card | null } {
    if (this.gamePhase() !== GamePhase.NORMAL) {
      throw new Error('Cannot start turn in current phase');
    }
    if (this.playerDeck().isEmpty || this.opponentDeck().isEmpty) {
      this.endGame();
      return { playerCard: null, opponentCard: null };
    }

    const playerCard = this.takeTopCard(PlayerType.PLAYER);
    const opponentCard = this.takeTopCard(PlayerType.OPPONENT);
    if (!playerCard || !opponentCard) {
      throw new Error('Both decks were checked before drawing but a card was unavailable');
    }

    this.turnNumber.update(turn => turn + 1);
    this.activeTurn.set({
      playerCard,
      opponentCard,
      phase: GamePhase.NORMAL,
      playerChallengeCard: null,
      opponentChallengeCard: null,
      battleLayers: [],
      publicCardIds: [playerCard.id, opponentCard.id]
    });
    this.assertCardConservation();
    return { playerCard, opponentCard };
  }

  beginChallenge(challenger: PlayerType): Card | null {
    const turn = this.requireActiveTurn();
    if (turn.playerChallengeCard || turn.opponentChallengeCard) {
      throw new Error('Only one reinforcement may be played in a turn');
    }

    const challengeCard = this.takeTopCard(challenger);
    if (!challengeCard) return null;

    this.gamePhase.set(GamePhase.CHALLENGE);
    this.canChallenge.set(false);
    this.activeTurn.set({
      ...turn,
      phase: GamePhase.CHALLENGE,
      playerChallengeCard: challenger === PlayerType.PLAYER ? challengeCard : null,
      opponentChallengeCard: challenger === PlayerType.OPPONENT ? challengeCard : null,
      publicCardIds: [...turn.publicCardIds, challengeCard.id]
    });
    this.assertCardConservation();
    return challengeCard;
  }

  canDealBattleLayer(): boolean {
    return this.playerDeck().count >= 3 && this.opponentDeck().count >= 3;
  }

  dealBattleLayer(): BattleLayer | null {
    const turn = this.requireActiveTurn();
    if (!this.canDealBattleLayer()) return null;
    const previousLayer = turn.battleLayers.at(-1);
    if (previousLayer &&
        (!previousLayer.selectedPlayerCardId || !previousLayer.selectedOpponentCardId)) {
      throw new Error('A recursive Battle layer cannot be dealt before the current layer resolves');
    }

    const playerCards = this.takeTopCards(PlayerType.PLAYER, 3);
    const opponentCards = this.takeTopCards(PlayerType.OPPONENT, 3);
    const layer: BattleLayer = {
      round: turn.battleLayers.length + 1,
      playerCards,
      opponentCards,
      selectedPlayerCardId: null,
      selectedOpponentCardId: null
    };

    this.gamePhase.set(GamePhase.BATTLE);
    this.canChallenge.set(false);
    this.activeTurn.set({
      ...turn,
      phase: GamePhase.BATTLE,
      battleLayers: [...turn.battleLayers, layer]
    });
    this.assertCardConservation();
    return layer;
  }

  selectNewestBattleTargets(
    opponentCardIdChosenByPlayer: string,
    playerCardIdChosenByOpponent: string
  ): { playerCard: Card; opponentCard: Card } {
    const turn = this.requireActiveTurn();
    const latestIndex = turn.battleLayers.length - 1;
    const latest = turn.battleLayers[latestIndex];
    if (!latest) throw new Error('No Battle layer is available for selection');

    const opponentCard = latest.opponentCards.find(card => card.id === opponentCardIdChosenByPlayer);
    const playerCard = latest.playerCards.find(card => card.id === playerCardIdChosenByOpponent);
    if (!opponentCard || !playerCard) {
      throw new Error('Only cards in the newest Battle layer may be selected');
    }

    const selectedLayer: BattleLayer = {
      ...latest,
      selectedPlayerCardId: playerCard.id,
      selectedOpponentCardId: opponentCard.id
    };
    const layers = [...turn.battleLayers];
    layers[latestIndex] = selectedLayer;
    this.activeTurn.set({
      ...turn,
      battleLayers: layers,
      publicCardIds: [...new Set([...turn.publicCardIds, playerCard.id, opponentCard.id])]
    });
    this.assertCardConservation();
    return { playerCard, opponentCard };
  }

  setPhase(phase: GamePhase): void {
    this.gamePhase.set(phase);
    const turn = this.activeTurn();
    if (turn) this.activeTurn.set({ ...turn, phase });
  }

  setChallengeAvailable(available: boolean): void {
    this.canChallenge.set(available);
  }

  setLastResult(result: string): void {
    this.lastResult.set(result);
  }

  getStake(owner: PlayerType): readonly Card[] {
    const turn = this.activeTurn();
    if (!turn) return [];
    if (owner === PlayerType.PLAYER) {
      return [
        turn.playerCard,
        ...(turn.playerChallengeCard ? [turn.playerChallengeCard] : []),
        ...turn.battleLayers.flatMap(layer => layer.playerCards)
      ];
    }
    return [
      turn.opponentCard,
      ...(turn.opponentChallengeCard ? [turn.opponentChallengeCard] : []),
      ...turn.battleLayers.flatMap(layer => layer.opponentCards)
    ];
  }

  previewBattleSettlement(winner: PlayerType): BattleSettlementPreview {
    const turn = this.requireActiveTurn();
    const loser = winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    const winningCards = this.getStake(winner);
    const losingCards = this.getStake(loser);
    const publicIds = new Set(turn.publicCardIds);
    return {
      winner,
      loser,
      losingCards,
      casualtyRevealCards: losingCards.filter(card => !publicIds.has(card.id)),
      publicWinnerCards: winningCards.filter(card => publicIds.has(card.id)),
      hiddenWinnerCardCount: winningCards.filter(card => !publicIds.has(card.id)).length
    };
  }

  settleActiveTurn(winner: PlayerType): BattleSettlementPreview {
    const preview = this.previewBattleSettlement(winner);
    const winningCards = this.getStake(winner);

    this.returnOwnedCards(winner, winningCards);
    this.discardPile.update(cards => [...cards, ...preview.losingCards]);
    this.activeTurn.set(null);
    this.canChallenge.set(false);
    this.lastResult.set(winner === PlayerType.PLAYER ? 'player_wins' : 'opponent_wins');
    this.gamePhase.set(GamePhase.NORMAL);

    const loserDeckEmpty = preview.loser === PlayerType.PLAYER
      ? this.playerDeck().isEmpty
      : this.opponentDeck().isEmpty;
    if (loserDeckEmpty) this.endGame(winner);
    this.assertCardConservation();
    return preview;
  }

  settleAttritionLoss(): PlayerType {
    const attritionWinner = this.determineAttritionWinner();
    if (this.activeTurn()) this.settleActiveTurn(attritionWinner);
    this.endGame(attritionWinner);
    this.assertCardConservation();
    return attritionWinner;
  }

  determineAttritionWinner(): PlayerType {
    const playerCanContinue = this.playerDeck().count >= 3;
    const opponentCanContinue = this.opponentDeck().count >= 3;
    let attritionWinner: PlayerType;

    if (playerCanContinue !== opponentCanContinue) {
      attritionWinner = playerCanContinue ? PlayerType.PLAYER : PlayerType.OPPONENT;
    } else {
      // README does not define simultaneous insufficiency. Preserve the old
      // count-based outcome (including opponent winning an exact tie).
      attritionWinner = this.playerDeck().count > this.opponentDeck().count
        ? PlayerType.PLAYER
        : PlayerType.OPPONENT;
    }

    return attritionWinner;
  }

  endGame(explicitWinner?: PlayerType): void {
    let gameWinner = explicitWinner;
    if (!gameWinner) {
      if (this.playerDeck().isEmpty && !this.opponentDeck().isEmpty) gameWinner = PlayerType.OPPONENT;
      else if (this.opponentDeck().isEmpty && !this.playerDeck().isEmpty) gameWinner = PlayerType.PLAYER;
      else gameWinner = this.playerDeck().count > this.opponentDeck().count
        ? PlayerType.PLAYER
        : PlayerType.OPPONENT;
    }
    this.gamePhase.set(GamePhase.GAME_OVER);
    this.winner.set(gameWinner);
    this.canChallenge.set(false);
  }

  checkGameEndConditions(): boolean {
    if (this.playerDeck().isEmpty || this.opponentDeck().isEmpty) {
      this.endGame();
      return true;
    }
    return this.gamePhase() === GamePhase.GAME_OVER;
  }

  cardConservationReport(): CardConservationReport {
    const cards = [
      ...this.playerDeck().toArray(),
      ...this.opponentDeck().toArray(),
      ...this.discardPile(),
      ...this.getStake(PlayerType.PLAYER),
      ...this.getStake(PlayerType.OPPONENT)
    ];
    const counts = new Map<string, number>();
    // A standard deck contains one card per suit/rank pair, so Card.id is a
    // stable identity without introducing a second identity system.
    for (const card of cards) counts.set(card.id, (counts.get(card.id) ?? 0) + 1);

    const expectedIds = new Set(new Deck().toArray().map(card => card.id));
    const duplicateIds = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
    const missingIds = [...expectedIds].filter(id => !counts.has(id));
    return {
      total: cards.length,
      unique: counts.size,
      duplicateIds,
      missingIds,
      valid: cards.length === 52 && counts.size === 52 && duplicateIds.length === 0 && missingIds.length === 0
    };
  }

  assertCardConservation(): void {
    const report = this.cardConservationReport();
    if (!report.valid) {
      throw new Error(
        `Card conservation violated: total=${report.total}, unique=${report.unique}, ` +
        `duplicates=${report.duplicateIds.join(',') || 'none'}, missing=${report.missingIds.join(',') || 'none'}`
      );
    }
  }

  reset(): void {
    this.initializeGame();
  }

  private requireActiveTurn(): ActiveTurn {
    const turn = this.activeTurn();
    if (!turn) throw new Error('No active turn is on the table');
    return turn;
  }

  private takeTopCard(owner: PlayerType): Card | null {
    const source = owner === PlayerType.PLAYER ? this.playerDeck : this.opponentDeck;
    const nextDeck = source().copy();
    const card = nextDeck.draw();
    source.set(nextDeck);
    return card;
  }

  private takeTopCards(owner: PlayerType, count: number): Card[] {
    const cards: Card[] = [];
    for (let index = 0; index < count; index++) {
      const card = this.takeTopCard(owner);
      if (!card) throw new Error(`Unable to draw ${count} cards for ${owner}`);
      cards.push(card);
    }
    return cards;
  }

  private returnOwnedCards(owner: PlayerType, cards: readonly Card[]): void {
    const source = owner === PlayerType.PLAYER ? this.playerDeck : this.opponentDeck;
    const nextDeck = source().copy();
    nextDeck.addCards([...cards]);
    source.set(nextDeck);
  }
}
