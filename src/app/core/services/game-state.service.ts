import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { Card } from '../models/card.model';
import { Deck } from '../models/deck.model';
import {
  ActiveTurn,
  BattleOutcome,
  BattleLayer,
  BattleSelectionOutcome,
  DeckColor,
  GameOutcome,
  GamePhase,
  GameState,
  GameStats,
  PlayerType,
} from '../models/game-state.model';

export const DECK_ASSIGNMENT_RANDOM = new InjectionToken<() => number>('DECK_ASSIGNMENT_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});

export interface InitializeGameOptions {
  readonly shuffle?: boolean;
  /** Deterministic override for tests, demos, and restored Wars. */
  readonly playerDeckColor?: DeckColor;
}

export interface CardConservationReport {
  readonly total: number;
  readonly unique: number;
  readonly duplicateIds: readonly string[];
  readonly missingIds: readonly string[];
  readonly valid: boolean;
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly assignmentRandom = inject(DECK_ASSIGNMENT_RANDOM);
  private readonly playerDeck = signal<Deck>(Deck.createRedDeck());
  private readonly opponentDeck = signal<Deck>(Deck.createBlackDeck());
  private readonly playerDeckColor = signal(DeckColor.RED);
  private readonly discardPile = signal<readonly Card[]>([]);
  private readonly gamePhase = signal(GamePhase.SETUP);
  private readonly turnNumber = signal(0);
  private readonly activeTurn = signal<ActiveTurn | null>(null);
  private readonly winner = signal<PlayerType | null>(null);
  private readonly outcome = signal<GameOutcome | null>(null);
  private readonly isPlayerTurn = signal(true);
  private readonly canChallenge = signal(false);
  private readonly lastResult = signal<string | null>(null);

  readonly playerCardCount = computed(() => this.playerDeck().count);
  readonly opponentCardCount = computed(() => this.opponentDeck().count);
  readonly discardedCardCount = computed(() => this.discardPile().length);
  readonly discardedCards = computed(() => [...this.discardPile()]);
  readonly assignedPlayerDeckColor = this.playerDeckColor.asReadonly();
  readonly assignedOpponentDeckColor = computed(() => this.oppositeColor(this.playerDeckColor()));
  readonly hasGame = computed(() => this.gamePhase() !== GamePhase.SETUP);

  readonly gameStats = computed<GameStats>(() => ({
    turnNumber: this.turnNumber(),
    playerCardCount: this.playerCardCount(),
    opponentCardCount: this.opponentCardCount(),
    discardedCardCount: this.discardedCardCount(),
  }));

  readonly gameState = computed<GameState>(() => ({
    phase: this.gamePhase(),
    stats: this.gameStats(),
    activeTurn: this.activeTurn(),
    winner: this.winner(),
    outcome: this.outcome(),
    isPlayerTurn: this.isPlayerTurn(),
    canChallenge: this.canChallenge(),
    lastResult: this.lastResult(),
    playerDeckColor: this.playerDeckColor(),
  }));

  get currentPhase(): GamePhase {
    return this.gamePhase();
  }
  get currentStats(): GameStats {
    return this.gameStats();
  }
  get currentState(): GameState {
    return this.gameState();
  }
  get currentPlayerDeck(): Deck {
    return this.playerDeck().copy();
  }
  get currentOpponentDeck(): Deck {
    return this.opponentDeck().copy();
  }
  get currentDiscardPile(): readonly Card[] {
    return [...this.discardPile()];
  }
  get currentPlayerDeckColor(): DeckColor {
    return this.playerDeckColor();
  }
  get currentOpponentDeckColor(): DeckColor {
    return this.oppositeColor(this.playerDeckColor());
  }

  /** Business-level match state; deliberately independent of presentation timing. */
  hasMeaningfulUnresolvedGame(): boolean {
    return this.hasGame() && this.gamePhase() !== GamePhase.GAME_OVER && this.turnNumber() > 0;
  }

  initializeGame(options: InitializeGameOptions = {}): void {
    const playerColor =
      options.playerDeckColor ??
      (this.assignmentRandom() < 0.5 ? DeckColor.RED : DeckColor.BLACK);
    const opponentColor = this.oppositeColor(playerColor);
    const nextPlayerDeck = this.createDeck(playerColor);
    const nextOpponentDeck = this.createDeck(opponentColor);
    if (options.shuffle !== false) {
      nextPlayerDeck.shuffle();
      nextOpponentDeck.shuffle();
    }

    this.playerDeck.set(nextPlayerDeck);
    this.opponentDeck.set(nextOpponentDeck);
    this.playerDeckColor.set(playerColor);
    this.discardPile.set([]);
    this.gamePhase.set(GamePhase.NORMAL);
    this.turnNumber.set(0);
    this.activeTurn.set(null);
    this.winner.set(null);
    this.outcome.set(null);
    this.isPlayerTurn.set(true);
    this.canChallenge.set(false);
    this.lastResult.set(null);
    this.assertCardConservation();
  }

  /** Full known color pool, never the shuffled draw order or current hidden contents. */
  assignedCardPool(owner: PlayerType): readonly Card[] {
    const color = owner === PlayerType.PLAYER ? this.currentPlayerDeckColor : this.currentOpponentDeckColor;
    return this.createDeck(color).toArray();
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

    this.turnNumber.update((turn) => turn + 1);
    this.activeTurn.set({
      playerCard,
      opponentCard,
      phase: GamePhase.NORMAL,
      playerChallengeCard: null,
      opponentChallengeCard: null,
      battleLayers: [],
      publicCardIds: [playerCard.id, opponentCard.id],
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
      publicCardIds: [...turn.publicCardIds, challengeCard.id],
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
    if (
      previousLayer &&
      (!previousLayer.selectedPlayerCardId || !previousLayer.selectedOpponentCardId)
    ) {
      throw new Error('A recursive Battle layer cannot be dealt before the current layer resolves');
    }

    const playerCards = this.takeTopCards(PlayerType.PLAYER, 3);
    const opponentCards = this.takeTopCards(PlayerType.OPPONENT, 3);
    const layer: BattleLayer = {
      round: turn.battleLayers.length + 1,
      playerCards,
      opponentCards,
      selectedPlayerCardId: null,
      selectedOpponentCardId: null,
    };

    this.gamePhase.set(GamePhase.BATTLE);
    this.canChallenge.set(false);
    this.activeTurn.set({
      ...turn,
      phase: GamePhase.BATTLE,
      battleLayers: [...turn.battleLayers, layer],
    });
    this.assertCardConservation();
    return layer;
  }

  selectNewestBattleTargets(
    opponentCardIdChosenByPlayer: string,
    playerCardIdChosenByOpponent: string,
  ): { playerCard: Card; opponentCard: Card } {
    const turn = this.requireActiveTurn();
    const latestIndex = turn.battleLayers.length - 1;
    const latest = turn.battleLayers[latestIndex];
    if (!latest) throw new Error('No Battle layer is available for selection');

    const opponentCard = latest.opponentCards.find(
      (card) => card.id === opponentCardIdChosenByPlayer,
    );
    const playerCard = latest.playerCards.find((card) => card.id === playerCardIdChosenByOpponent);
    if (!opponentCard || !playerCard) {
      throw new Error('Only cards in the newest Battle layer may be selected');
    }

    const selectedLayer: BattleLayer = {
      ...latest,
      selectedPlayerCardId: playerCard.id,
      selectedOpponentCardId: opponentCard.id,
    };
    const layers = [...turn.battleLayers];
    layers[latestIndex] = selectedLayer;
    this.activeTurn.set({
      ...turn,
      battleLayers: layers,
      publicCardIds: [...new Set([...turn.publicCardIds, playerCard.id, opponentCard.id])],
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
        ...turn.battleLayers.flatMap((layer) => layer.playerCards),
      ];
    }
    return [
      turn.opponentCard,
      ...(turn.opponentChallengeCard ? [turn.opponentChallengeCard] : []),
      ...turn.battleLayers.flatMap((layer) => layer.opponentCards),
    ];
  }

  previewBattleSettlement(
    winner: PlayerType,
    battleSelection: BattleSelectionOutcome | null = null,
  ): BattleOutcome {
    const turn = this.requireActiveTurn();
    const loser = winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    const playerCardsAtStake = [...this.getStake(PlayerType.PLAYER)];
    const opponentCardsAtStake = [...this.getStake(PlayerType.OPPONENT)];
    const winningCards = winner === PlayerType.PLAYER ? playerCardsAtStake : opponentCardsAtStake;
    const casualties = loser === PlayerType.PLAYER ? playerCardsAtStake : opponentCardsAtStake;
    const publicIds = new Set(turn.publicCardIds);
    const hiddenWinnerCards = winningCards.filter((card) => !publicIds.has(card.id));
    const newestLayer = turn.battleLayers.at(-1);
    const selectedPlayerChampion = newestLayer?.selectedPlayerCardId
      ? (newestLayer.playerCards.find((card) => card.id === newestLayer.selectedPlayerCardId) ??
        null)
      : null;
    const selectedOpponentChampion = newestLayer?.selectedOpponentCardId
      ? (newestLayer.opponentCards.find((card) => card.id === newestLayer.selectedOpponentCardId) ??
        null)
      : null;
    const playerDeckCount = this.playerDeck().count;
    const opponentDeckCount = this.opponentDeck().count;
    const boneyardCount = this.discardPile().length;

    return {
      winner,
      loser,
      battleDepth: turn.battleLayers.length,
      layers: turn.battleLayers.map((layer) => ({
        ...layer,
        playerCards: [...layer.playerCards],
        opponentCards: [...layer.opponentCards],
      })),
      playerCardsAtStake,
      opponentCardsAtStake,
      winningCards,
      // This must contain every losing card: triggers, reinforcements,
      // champions, and every hidden card across nested layers.
      casualties,
      publicWinnerCards: winningCards.filter((card) => publicIds.has(card.id)),
      hiddenWinnerCards,
      selectedPlayerChampion,
      selectedOpponentChampion,
      battleSelection,
      playerDeckCountBeforeSettlement: playerDeckCount,
      opponentDeckCountBeforeSettlement: opponentDeckCount,
      boneyardCountBeforeSettlement: boneyardCount,
      finalPlayerDeckCount:
        playerDeckCount + (winner === PlayerType.PLAYER ? winningCards.length : 0),
      finalOpponentDeckCount:
        opponentDeckCount + (winner === PlayerType.OPPONENT ? winningCards.length : 0),
      finalBoneyardCount: boneyardCount + casualties.length,
    };
  }

  settleActiveTurn(winner: PlayerType, outcome?: BattleOutcome): BattleOutcome {
    const settlement = outcome ?? this.previewBattleSettlement(winner);
    if (settlement.winner !== winner) {
      throw new Error('Battle settlement winner does not match its authoritative outcome');
    }
    this.assertOutcomeMatchesActiveTurn(settlement);

    this.returnOwnedCards(winner, settlement.winningCards);
    this.discardPile.update((cards) => [...cards, ...settlement.casualties]);
    this.activeTurn.set(null);
    this.canChallenge.set(false);
    this.lastResult.set(winner === PlayerType.PLAYER ? 'player_wins' : 'opponent_wins');
    this.gamePhase.set(GamePhase.NORMAL);

    const loserDeckEmpty =
      settlement.loser === PlayerType.PLAYER
        ? this.playerDeck().isEmpty
        : this.opponentDeck().isEmpty;
    if (loserDeckEmpty) this.endGame(this.outcomeForWinner(winner));
    this.assertCardConservation();
    return settlement;
  }

  settleAttrition(): GameOutcome {
    const outcome = this.determineAttritionOutcome();
    const attritionWinner = this.winnerForOutcome(outcome);
    if (attritionWinner && this.activeTurn()) this.settleActiveTurn(attritionWinner);
    this.endGame(outcome);
    this.assertCardConservation();
    return outcome;
  }

  determineAttritionOutcome(): GameOutcome {
    const playerCanContinue = this.playerDeck().count >= 3;
    const opponentCanContinue = this.opponentDeck().count >= 3;

    if (playerCanContinue !== opponentCanContinue) {
      return playerCanContinue ? GameOutcome.PLAYER_WIN : GameOutcome.OPPONENT_WIN;
    }

    if (this.playerDeck().count > this.opponentDeck().count) return GameOutcome.PLAYER_WIN;
    if (this.opponentDeck().count > this.playerDeck().count) return GameOutcome.OPPONENT_WIN;
    return GameOutcome.TIE;
  }

  endGame(explicitOutcome?: GameOutcome): void {
    let gameOutcome = explicitOutcome;
    if (!gameOutcome) {
      if (this.playerDeck().isEmpty && !this.opponentDeck().isEmpty) {
        gameOutcome = GameOutcome.OPPONENT_WIN;
      } else if (this.opponentDeck().isEmpty && !this.playerDeck().isEmpty) {
        gameOutcome = GameOutcome.PLAYER_WIN;
      } else if (this.playerDeck().count > this.opponentDeck().count) {
        gameOutcome = GameOutcome.PLAYER_WIN;
      } else if (this.opponentDeck().count > this.playerDeck().count) {
        gameOutcome = GameOutcome.OPPONENT_WIN;
      } else {
        gameOutcome = GameOutcome.TIE;
      }
    }
    this.gamePhase.set(GamePhase.GAME_OVER);
    const turn = this.activeTurn();
    if (turn) this.activeTurn.set({ ...turn, phase: GamePhase.GAME_OVER });
    this.outcome.set(gameOutcome);
    this.winner.set(this.winnerForOutcome(gameOutcome));
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
      ...this.getStake(PlayerType.OPPONENT),
    ];
    const counts = new Map<string, number>();
    // A standard deck contains one card per suit/rank pair, so Card.id is a
    // stable identity without introducing a second identity system.
    for (const card of cards) counts.set(card.id, (counts.get(card.id) ?? 0) + 1);

    const expectedIds = new Set(new Deck().toArray().map((card) => card.id));
    const duplicateIds = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
    const missingIds = [...expectedIds].filter((id) => !counts.has(id));
    return {
      total: cards.length,
      unique: counts.size,
      duplicateIds,
      missingIds,
      valid:
        cards.length === 52 &&
        counts.size === 52 &&
        duplicateIds.length === 0 &&
        missingIds.length === 0,
    };
  }

  assertCardConservation(): void {
    const report = this.cardConservationReport();
    if (!report.valid) {
      throw new Error(
        `Card conservation violated: total=${report.total}, unique=${report.unique}, ` +
          `duplicates=${report.duplicateIds.join(',') || 'none'}, missing=${report.missingIds.join(',') || 'none'}`,
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

  private assertOutcomeMatchesActiveTurn(outcome: BattleOutcome): void {
    const currentPlayerIds = this.getStake(PlayerType.PLAYER).map((card) => card.id);
    const currentOpponentIds = this.getStake(PlayerType.OPPONENT).map((card) => card.id);
    if (
      currentPlayerIds.join('|') !== outcome.playerCardsAtStake.map((card) => card.id).join('|') ||
      currentOpponentIds.join('|') !== outcome.opponentCardsAtStake.map((card) => card.id).join('|')
    ) {
      throw new Error('Battle outcome no longer matches the cards at stake');
    }
    if (outcome.battleSelection) {
      const latest = this.requireActiveTurn().battleLayers.at(-1);
      const selection = outcome.battleSelection;
      if (
        !latest ||
        latest.round !== selection.layerRound ||
        latest.selectedPlayerCardId !== selection.playerCardId ||
        latest.selectedOpponentCardId !== selection.opponentCardId ||
        selection.playerCard.id !== selection.playerCardId ||
        selection.opponentCard.id !== selection.opponentCardId
      ) {
        throw new Error('Battle outcome selection no longer matches the selected physical cards');
      }
    }
  }

  private createDeck(color: DeckColor): Deck {
    return color === DeckColor.RED ? Deck.createRedDeck() : Deck.createBlackDeck();
  }

  private oppositeColor(color: DeckColor): DeckColor {
    return color === DeckColor.RED ? DeckColor.BLACK : DeckColor.RED;
  }

  private outcomeForWinner(winner: PlayerType): GameOutcome {
    return winner === PlayerType.PLAYER ? GameOutcome.PLAYER_WIN : GameOutcome.OPPONENT_WIN;
  }

  private winnerForOutcome(outcome: GameOutcome): PlayerType | null {
    if (outcome === GameOutcome.PLAYER_WIN) return PlayerType.PLAYER;
    if (outcome === GameOutcome.OPPONENT_WIN) return PlayerType.OPPONENT;
    return null;
  }

  /**
   * Directly sets internal game state for deterministic testing / store screenshot generation.
   */
  loadFixtureState(state: {
    readonly playerDeckCards: readonly Card[];
    readonly opponentDeckCards: readonly Card[];
    readonly playerDeckColor?: DeckColor;
    readonly discardCards?: readonly Card[];
    readonly phase?: GamePhase;
    readonly turnNumber?: number;
    readonly activeTurn?: ActiveTurn | null;
    readonly winner?: PlayerType | null;
    readonly outcome?: GameOutcome | null;
  }): void {
    this.playerDeck.set(new Deck([...state.playerDeckCards]));
    this.opponentDeck.set(new Deck([...state.opponentDeckCards]));
    if (state.playerDeckColor) {
      this.playerDeckColor.set(state.playerDeckColor);
    }
    this.discardPile.set(state.discardCards ?? []);
    this.gamePhase.set(state.phase ?? GamePhase.NORMAL);
    this.turnNumber.set(state.turnNumber ?? 1);
    this.activeTurn.set(state.activeTurn ?? null);
    this.winner.set(state.winner ?? null);
    this.outcome.set(state.outcome ?? null);
  }
}
