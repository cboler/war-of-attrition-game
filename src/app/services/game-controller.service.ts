import { Injectable, computed, inject, signal } from '@angular/core';
import { ActiveTurn, GameOutcome, GamePhase, PlayerType } from '../core/models/game-state.model';
import { Card, Rank } from '../core/models/card.model';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SoundService } from '../core/services/sound.service';
import { TurnResolutionService, TurnResult } from '../core/services/turn-resolution.service';
import { CardComparisonService } from '../core/services/card-comparison.service';
import { AuthService } from '../core/services/auth.service';
import { PresentationSequencerService } from './presentation-sequencer.service';
import { TableReaction, TableReactionService } from './table-reaction.service';
import { GameEventBusService } from './game-event-bus.service';

export enum PresentationState {
  READY = 'ready',
  DRAWING = 'drawing',
  CLASH_REVEAL = 'clash_reveal',
  CLASH_RESOLUTION = 'clash_resolution',
  PLAYER_CHALLENGE_DECISION = 'player_challenge_decision',
  OPPONENT_CONSIDERING_CHALLENGE = 'opponent_considering_challenge',
  CHALLENGE_DRAW = 'challenge_draw',
  CHALLENGE_CLASH = 'challenge_clash',
  BATTLE_SETUP = 'battle_setup',
  PLAYER_TARGET_SELECTION = 'player_target_selection',
  OPPONENT_TARGET_SELECTION = 'opponent_target_selection',
  BATTLE_REVEAL = 'battle_reveal',
  BATTLE_TIE = 'battle_tie',
  CASUALTY_REVEAL = 'casualty_reveal',
  RETURN_WINNER_CARDS = 'return_winner_cards',
  SEND_LOSER_CARDS_TO_BONEYARD = 'send_loser_cards_to_boneyard',
  TURN_COMPLETE = 'turn_complete',
  GAME_OVER = 'game_over'
}

export interface TableCardView {
  readonly id: string;
  readonly card: Card | null;
  readonly owner: PlayerType;
  readonly faceDown: boolean;
  readonly selected: boolean;
  readonly eligible: boolean;
  readonly casualty: boolean;
}

export interface TableBattleLayerView {
  readonly round: number;
  readonly receded: boolean;
  readonly playerCards: readonly TableCardView[];
  readonly opponentCards: readonly TableCardView[];
}

export interface CurrentGameSummary {
  readonly outcome: GameOutcome | null;
  readonly turns: number;
  readonly battlesCount: number;
  readonly deepestBattleLayer: number;
  readonly maxCardsAtStake: number;
  readonly largestBattleVictory: number;
  readonly largestBattleLoss: number;
  readonly playerChallengesCount: number;
  readonly playerChallengesWon: number;
  readonly playerCardsRemaining: number;
  readonly opponentCardsRemaining: number;
  readonly isComeback: boolean;
  readonly maxDeficit: number;
}

@Injectable({ providedIn: 'root' })
export class GameControllerService {
  private readonly gameState = inject(GameStateService);
  private readonly turnResolution = inject(TurnResolutionService);
  private readonly opponentAI = inject(OpponentAIService);
  private readonly sound = inject(SoundService);
  private readonly sequencer = inject(PresentationSequencerService);
  private readonly reactions = inject(TableReactionService);
  private readonly eventBus = inject(GameEventBusService);
  private readonly comparison = inject(CardComparisonService);
  private readonly authService = inject(AuthService);

  private readonly gameMessage = signal('Your deck is ready.');
  private readonly phase = signal(PresentationState.READY);
  private readonly presentedTurn = signal<ActiveTurn | null>(null);
  private readonly revealedCasualtyIds = signal<readonly string[]>([]);
  private readonly movingToBoneyardIds = signal<readonly string[]>([]);
  private readonly returningHomeIds = signal<readonly string[]>([]);
  private readonly withheldBoneyardIds = signal<readonly string[]>([]);
  private readonly pendingHumanTargetId = signal<string | null>(null);
  private readonly selectedOpponentCard = signal<Card | null>(null);
  private readonly selectedPlayerCard = signal<Card | null>(null);
  private readonly opponentPointer = signal<number | null>(null);
  private readonly reaction = signal<TableReaction | null>(null);

  // Active game telemetry
  private gameStartTime = Date.now();
  private turnsPlayed = 0;
  private playerChallengesCount = 0;
  private playerChallengesWon = 0;
  private battlesCount = 0;
  private deepestBattleLayer = 0;
  private maxCardsAtStake = 0;
  private largestBattleVictory = 0;
  private largestBattleLoss = 0;
  private acesDefeatedByTwo = 0;
  private twosSavedByChallenge = 0;
  private acesLostInBattles = 0;
  private aceAndTwoLostInSameBattle = 0;
  private maxDeficitExperienced = 0;
  private abandonmentRecorded = false;

  private readonly gameSummarySignal = signal<CurrentGameSummary | null>(null);

  readonly presentationState = this.phase.asReadonly();
  readonly tableMessage = this.gameMessage.asReadonly();
  readonly tableReaction = this.reaction.asReadonly();
  readonly opponentPointerIndex = this.opponentPointer.asReadonly();
  readonly cardsMovingToBoneyard = this.movingToBoneyardIds.asReadonly();
  readonly cardsReturningHome = this.returningHomeIds.asReadonly();
  readonly currentGameSummary = this.gameSummarySignal.asReadonly();

  readonly visibleBoneyardCards = computed(() => {
    const withheld = new Set(this.withheldBoneyardIds());
    return this.gameState.discardedCards().filter(card => !withheld.has(card.id));
  });
  readonly visibleBoneyardCount = computed(() => this.visibleBoneyardCards().length);
  readonly canDraw = computed(() => this.phase() === PresentationState.READY);
  readonly canChooseChallenge = computed(
    () => this.phase() === PresentationState.PLAYER_CHALLENGE_DECISION
  );
  readonly canSelectTarget = computed(
    () => this.phase() === PresentationState.PLAYER_TARGET_SELECTION
  );
  readonly presentationCanAdvance = computed(() => this.sequencer.waiting());
  readonly playerCardsAtRisk = computed(() => this.gameState.getStake(PlayerType.PLAYER).length);
  readonly opponentCardsAtRisk = computed(() => this.gameState.getStake(PlayerType.OPPONENT).length);

  readonly activePlayerCard = computed(() => this.presentedTurn()?.playerCard ?? null);
  readonly activeOpponentCard = computed(() => this.presentedTurn()?.opponentCard ?? null);
  readonly playerChallengeCard = computed(() => this.presentedTurn()?.playerChallengeCard ?? null);
  readonly opponentChallengeCard = computed(() => this.presentedTurn()?.opponentChallengeCard ?? null);

  readonly battleLayers = computed<readonly TableBattleLayerView[]>(() => {
    const turn = this.presentedTurn();
    if (!turn) return [];
    const publicIds = new Set(turn.publicCardIds);
    const casualtyIds = new Set(this.revealedCasualtyIds());
    const newestRound = turn.battleLayers.length;
    return turn.battleLayers.map(layer => ({
      round: layer.round,
      receded: layer.round !== newestRound,
      playerCards: layer.playerCards.map(card => this.cardView(
        card,
        PlayerType.PLAYER,
        publicIds,
        casualtyIds,
        layer.selectedPlayerCardId,
        false
      )),
      opponentCards: layer.opponentCards.map(card => this.cardView(
        card,
        PlayerType.OPPONENT,
        publicIds,
        casualtyIds,
        layer.selectedOpponentCardId ?? this.pendingHumanTargetId(),
        layer.round === newestRound && this.canSelectTarget()
      ))
    }));
  });

  // Compatibility getters keep the review-only classic route operational.
  get message(): string { return this.gameMessage(); }
  get canChallenge(): boolean { return this.canChooseChallenge(); }
  get showChallengePrompt(): boolean { return this.canChooseChallenge(); }
  get currentChallengeCard(): Card | null { return this.playerChallengeCard(); }
  get showChallengeCardDisplay(): boolean { return false; }
  get playerCanAct(): boolean { return this.canDraw(); }
  get currentBattleCards(): Card[] {
    const layers = this.presentedTurn()?.battleLayers ?? [];
    return [...(layers.at(-1)?.playerCards ?? [])];
  }
  get currentOpponentBattleCards(): Card[] {
    const layers = this.presentedTurn()?.battleLayers ?? [];
    return [...(layers.at(-1)?.opponentCards ?? [])];
  }
  get currentBattlePhase(): 'setup' | 'selection' | 'revealing' | 'resolution' {
    if (this.phase() === PresentationState.PLAYER_TARGET_SELECTION) return 'selection';
    if ([PresentationState.OPPONENT_TARGET_SELECTION, PresentationState.BATTLE_REVEAL]
      .includes(this.phase())) return 'revealing';
    return 'setup';
  }
  get currentBattleStep(): 'none' | 'selection' | 'revealing_player' | 'revealing_opponent' | 'revealing_all' {
    if (this.phase() === PresentationState.PLAYER_TARGET_SELECTION) return 'selection';
    if (this.phase() === PresentationState.BATTLE_REVEAL) return 'revealing_opponent';
    return 'none';
  }
  get playerPickedCard(): Card | null { return this.selectedOpponentCard(); }
  get opponentPickedCard(): Card | null { return this.selectedPlayerCard(); }
  get isRevealAll(): boolean { return false; }

  startNewGame(): void {
    // Record abandonment if previous game was in progress and unresolved
    if (
      this.phase() !== PresentationState.READY &&
      this.phase() !== PresentationState.GAME_OVER &&
      this.turnsPlayed > 0 &&
      !this.abandonmentRecorded
    ) {
      this.authService.recordGameAbandoned();
      this.eventBus.emit({
        type: 'game_abandoned',
        turnNumber: this.turnsPlayed,
        turnsPlayed: this.turnsPlayed
      });
      this.abandonmentRecorded = true;
    }

    this.sequencer.cancel();
    this.gameState.initializeGame();
    this.phase.set(PresentationState.READY);
    this.gameMessage.set('Your deck is ready.');
    this.presentedTurn.set(null);
    this.revealedCasualtyIds.set([]);
    this.movingToBoneyardIds.set([]);
    this.returningHomeIds.set([]);
    this.withheldBoneyardIds.set([]);
    this.pendingHumanTargetId.set(null);
    this.selectedOpponentCard.set(null);
    this.selectedPlayerCard.set(null);
    this.opponentPointer.set(null);
    this.reaction.set(null);
    this.gameSummarySignal.set(null);

    // Reset active game telemetry
    this.gameStartTime = Date.now();
    this.turnsPlayed = 0;
    this.playerChallengesCount = 0;
    this.playerChallengesWon = 0;
    this.battlesCount = 0;
    this.deepestBattleLayer = 0;
    this.maxCardsAtStake = 0;
    this.largestBattleVictory = 0;
    this.largestBattleLoss = 0;
    this.acesDefeatedByTwo = 0;
    this.twosSavedByChallenge = 0;
    this.acesLostInBattles = 0;
    this.aceAndTwoLostInSameBattle = 0;
    this.maxDeficitExperienced = 0;
    this.abandonmentRecorded = false;
  }

  playerDrawCard(): boolean {
    if (!this.canDraw() || this.gameState.currentPhase !== GamePhase.NORMAL) return false;
    void this.playTurn();
    return true;
  }

  handleChallenge(acceptChallenge: boolean): void {
    if (!this.canChooseChallenge()) return;
    void this.playPlayerChallenge(acceptChallenge);
  }

  /** Challenges commit when the reinforcement is drawn; retained for classic UI compatibility. */
  confirmChallenge(): void {}

  selectBattleCard(selectedCardOrId: Card | string): void {
    if (!this.canSelectTarget()) return;
    const newest = this.presentedTurn()?.battleLayers.at(-1);
    const selectedId = typeof selectedCardOrId === 'string' ? selectedCardOrId : selectedCardOrId.id;
    const selectedCard = newest?.opponentCards.find(card => card.id === selectedId);
    if (!selectedCard) return;
    void this.playBattleSelection(selectedCard);
  }

  advancePresentation(): boolean {
    return this.sequencer.advance();
  }

  getGameStats() { return this.gameState.currentStats; }
  getGameState() { return this.gameState.currentState; }

  private async playTurn(): Promise<void> {
    const version = this.sequencer.begin();
    this.reaction.set(null);
    this.revealedCasualtyIds.set([]);
    this.phase.set(PresentationState.DRAWING);
    this.gameMessage.set('Cards out.');

    try {
      const { playerCard, opponentCard } = this.gameState.startTurn();
      if (!playerCard || !opponentCard) {
        this.finishAtGameOver();
        return;
      }
      this.turnsPlayed = this.gameState.gameStats().turnNumber;

      // Update deficit tracking
      const deficit = this.gameState.opponentCardCount() - this.gameState.playerCardCount();
      if (deficit > this.maxDeficitExperienced) {
        this.maxDeficitExperienced = deficit;
      }

      this.eventBus.emit({
        type: 'turn_started',
        turnNumber: this.turnsPlayed
      });

      this.syncPresentedTurn();
      this.sound.playCardDraw();
      await this.sequencer.pause(280, version);
      this.phase.set(PresentationState.CLASH_REVEAL);
      this.gameMessage.set('Show.');
      this.sound.playCardFlip();
      await this.sequencer.pause(360, version);
      this.phase.set(PresentationState.CLASH_RESOLUTION);
      this.sound.playCardLand();

      const result = this.turnResolution.resolveTurn(playerCard, opponentCard);
      this.withholdBoneyard(result);
      this.gameMessage.set(result.message);

      const specialRule = this.comparison.isSpecialAceVsTwoRule(playerCard, opponentCard);
      if (specialRule && result.winner === PlayerType.PLAYER) {
        this.acesDefeatedByTwo++;
      }

      this.eventBus.emit({
        type: 'clash_resolved',
        turnNumber: this.turnsPlayed,
        playerCard,
        opponentCard,
        comparison: result.result,
        winner: result.winner,
        specialRule,
        message: result.message
      });

      await this.sequencer.pause(430, version);
      await this.continueFromResult(result, version);
    } catch (error) {
      this.recoverFromError(error);
    }
  }

  private async playPlayerChallenge(accept: boolean): Promise<void> {
    const version = this.sequencer.begin();
    try {
      if (!accept) {
        const result = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        this.gameMessage.set(result.message);
        this.eventBus.emit({
          type: 'challenge_conceded',
          turnNumber: this.turnsPlayed,
          loser: PlayerType.PLAYER,
          winner: PlayerType.OPPONENT,
          message: result.message
        });
        await this.playOrdinarySettlement(result, version);
        return;
      }

      this.playerChallengesCount++;
      const reinforcement = this.gameState.beginChallenge(PlayerType.PLAYER);
      if (!reinforcement) {
        const result = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        await this.playOrdinarySettlement(result, version);
        return;
      }

      this.eventBus.emit({
        type: 'challenge_accepted',
        turnNumber: this.turnsPlayed,
        challenger: PlayerType.PLAYER,
        reinforcementCard: reinforcement
      });

      this.syncPresentedTurn();
      this.phase.set(PresentationState.CHALLENGE_DRAW);
      this.gameMessage.set('Reinforcement committed.');
      this.sound.playCardDraw();
      await this.sequencer.pause(360, version);
      this.sound.playCardFlip();
      this.phase.set(PresentationState.CHALLENGE_CLASH);
      this.gameMessage.set('Reinforcement clashes with the original winner.');
      await this.sequencer.pause(500, version);
      const result = this.turnResolution.resolveChallenge(PlayerType.PLAYER);
      this.withholdBoneyard(result);
      this.gameMessage.set(result.message);

      const challengerWon = result.winner === PlayerType.PLAYER;
      if (challengerWon) {
        this.playerChallengesWon++;
      }
      const initialCard = this.presentedTurn()?.playerCard;
      const savedTwo = challengerWon && initialCard?.rank === Rank.TWO;
      if (savedTwo) {
        this.twosSavedByChallenge++;
      }

      const turn = this.presentedTurn();
      if (turn) {
        this.eventBus.emit({
          type: 'challenge_resolved',
          turnNumber: this.turnsPlayed,
          challenger: PlayerType.PLAYER,
          reinforcementCard: reinforcement,
          originalWinnerCard: turn.opponentCard,
          comparison: result.result,
          winner: result.winner,
          challengerWon,
          message: result.message,
          savedTwo
        });
      }

      await this.sequencer.pause(420, version);
      await this.continueFromResult(result, version);
    } catch (error) {
      this.recoverFromError(error);
    }
  }

  private async continueFromResult(result: TurnResult, version: number): Promise<void> {
    if (result.terminalOutcome === GameOutcome.TIE) {
      await this.playTerminalTie(result, version);
      return;
    }

    if (result.canChallenge) {
      this.phase.set(PresentationState.PLAYER_CHALLENGE_DECISION);
      this.gameMessage.set('Your card is beaten.');
      this.eventBus.emit({
        type: 'challenge_offered',
        turnNumber: this.turnsPlayed,
        defender: PlayerType.PLAYER
      });
      this.sequencer.end(version);
      return;
    }

    if (result.opponentConsidered) {
      await this.playOpponentDecision(result, version);
      return;
    }

    if (result.nextPhase === GamePhase.BATTLE) {
      await this.setupBattle(version);
      return;
    }

    await this.playOrdinarySettlement(result, version);
  }

  private async playOpponentDecision(result: TurnResult, version: number): Promise<void> {
    this.phase.set(PresentationState.OPPONENT_CONSIDERING_CHALLENGE);
    this.eventBus.emit({
      type: 'challenge_offered',
      turnNumber: this.turnsPlayed,
      defender: PlayerType.OPPONENT
    });

    for (let dots = 1; dots <= 3; dots++) {
      this.gameMessage.set(`Reinforce ${'.'.repeat(dots)}`);
      await this.sequencer.pause(230, version);
    }

    if (!result.opponentChallenge) {
      this.gameMessage.set('Concede.');
      this.eventBus.emit({
        type: 'challenge_conceded',
        turnNumber: this.turnsPlayed,
        loser: PlayerType.OPPONENT,
        winner: PlayerType.PLAYER,
        message: 'Opponent concedes.'
      });
      await this.sequencer.pause(300, version);
      await this.playOrdinarySettlement(result, version);
      return;
    }

    this.gameMessage.set('Challenge.');
    await this.sequencer.pause(260, version);
    const reinforcement = this.gameState.beginChallenge(PlayerType.OPPONENT);
    if (!reinforcement) {
      const concession = this.turnResolution.resolveChallengeConcession(PlayerType.OPPONENT);
      await this.playOrdinarySettlement(concession, version);
      return;
    }

    this.eventBus.emit({
      type: 'challenge_accepted',
      turnNumber: this.turnsPlayed,
      challenger: PlayerType.OPPONENT,
      reinforcementCard: reinforcement
    });

    this.syncPresentedTurn();
    this.phase.set(PresentationState.CHALLENGE_DRAW);
    this.gameMessage.set('Opponent sends reinforcement.');
    this.sound.playCardDraw();
    await this.sequencer.pause(380, version);
    this.sound.playCardFlip();
    this.phase.set(PresentationState.CHALLENGE_CLASH);
    await this.sequencer.pause(480, version);
    const challengeResult = this.turnResolution.resolveChallenge(PlayerType.OPPONENT);
    this.withholdBoneyard(challengeResult);
    this.gameMessage.set(challengeResult.message);

    const turn = this.presentedTurn();
    if (turn) {
      this.eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: this.turnsPlayed,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: reinforcement,
        originalWinnerCard: turn.playerCard,
        comparison: challengeResult.result,
        winner: challengeResult.winner,
        challengerWon: challengeResult.winner === PlayerType.OPPONENT,
        message: challengeResult.message,
        savedTwo: false
      });
    }

    await this.sequencer.pause(420, version);
    await this.continueFromResult(challengeResult, version);
  }

  private async setupBattle(version: number): Promise<void> {
    this.phase.set(PresentationState.BATTLE_SETUP);
    const existingLayers = this.gameState.currentState.activeTurn?.battleLayers.length ?? 0;
    if (existingLayers === 0) {
      this.battlesCount++;
    }
    this.deepestBattleLayer = Math.max(this.deepestBattleLayer, existingLayers + 1);

    this.gameMessage.set(existingLayers === 0 ? 'BATTLE' : `BATTLE - LAYER ${existingLayers + 1}`);
    this.sound.playClash();
    await this.sequencer.pause(470, version);

    const layer = this.gameState.dealBattleLayer();
    if (!layer) {
      this.gameState.settleAttrition();
      this.finishAtGameOver();
      return;
    }

    const currentStake = this.playerCardsAtRisk() + this.opponentCardsAtRisk();
    if (currentStake > this.maxCardsAtStake) {
      this.maxCardsAtStake = currentStake;
    }

    this.eventBus.emit({
      type: existingLayers === 0 ? 'battle_started' : 'battle_layer_added',
      turnNumber: this.turnsPlayed,
      layerRound: layer.round
    });

    this.syncPresentedTurn();
    this.sound.playCardDraw();
    await this.sequencer.pause(520, version);
    this.phase.set(PresentationState.PLAYER_TARGET_SELECTION);
    this.gameMessage.set('SELECT YOUR TARGET');
    this.sequencer.end(version);
  }

  private async playBattleSelection(selectedOpponentCard: Card): Promise<void> {
    const version = this.sequencer.begin();
    const newest = this.presentedTurn()?.battleLayers.at(-1);
    if (!newest) return;
    const selectedIndex = this.opponentAI.selectBattleTarget(newest.playerCards.length);
    const selectedPlayerCard = newest.playerCards[selectedIndex];
    this.pendingHumanTargetId.set(selectedOpponentCard.id);
    this.selectedOpponentCard.set(selectedOpponentCard);
    this.selectedPlayerCard.set(selectedPlayerCard);

    this.eventBus.emit({
      type: 'battle_target_selected',
      turnNumber: this.turnsPlayed,
      layerRound: newest.round,
      selector: PlayerType.PLAYER,
      targetIndex: newest.opponentCards.findIndex(c => c.id === selectedOpponentCard.id)
    });

    this.phase.set(PresentationState.OPPONENT_TARGET_SELECTION);
    this.gameMessage.set('Opponent chooses blindly.');

    const pointerPath = [0, 2, 1, selectedIndex];
    for (const index of pointerPath) {
      this.opponentPointer.set(index);
      await this.sequencer.pause(130, version);
    }
    await this.sequencer.pause(220, version);

    this.eventBus.emit({
      type: 'battle_target_selected',
      turnNumber: this.turnsPlayed,
      layerRound: newest.round,
      selector: PlayerType.OPPONENT,
      targetIndex: selectedIndex
    });

    const result = this.turnResolution.resolveBattleSelection(
      selectedOpponentCard.id,
      selectedPlayerCard.id
    );
    this.syncPresentedTurn();
    this.pendingHumanTargetId.set(null);
    this.phase.set(PresentationState.BATTLE_REVEAL);
    this.gameMessage.set('Only the chosen cards turn over.');
    this.sound.playCardFlip();
    await this.sequencer.pause(560, version);
    this.sound.playClash();
    this.gameMessage.set(result.message);

    const specialRule = this.comparison.isSpecialAceVsTwoRule(selectedPlayerCard, selectedOpponentCard);
    if (specialRule && result.winner === PlayerType.PLAYER) {
      this.acesDefeatedByTwo++;
    }

    this.eventBus.emit({
      type: 'battle_cards_revealed',
      turnNumber: this.turnsPlayed,
      layerRound: newest.round,
      playerChosenCard: selectedPlayerCard,
      opponentChosenCard: selectedOpponentCard,
      comparison: result.result,
      winner: result.winner,
      specialRule,
      message: result.message
    });

    await this.sequencer.pause(500, version);

    if (result.pendingBattleSettlement) {
      await this.playBattleSettlement(result, version);
      return;
    }

    if (result.terminalOutcome === GameOutcome.TIE) {
      await this.playTerminalTie(result, version);
      return;
    }

    if (result.result === 'tie') {
      this.eventBus.emit({
        type: 'battle_continues',
        turnNumber: this.turnsPlayed,
        layerRound: newest.round
      });
      this.phase.set(PresentationState.BATTLE_TIE);
      await this.sequencer.pause(520, version);
      this.selectedOpponentCard.set(null);
      this.selectedPlayerCard.set(null);
      this.opponentPointer.set(null);
      await this.setupBattle(version);
      return;
    }

    await this.playBattleSettlement(result, version);
  }

  private async playBattleSettlement(result: TurnResult, version: number): Promise<void> {
    const winner = result.winner;
    if (!winner) throw new Error('A decisive Battle must have a winner');
    const loser = winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    this.phase.set(PresentationState.CASUALTY_REVEAL);

    const lostAce = result.cardsLost.some(c => c.rank === Rank.ACE);
    const lostTwo = result.cardsLost.some(c => c.rank === Rank.TWO);
    if (loser === PlayerType.PLAYER) {
      this.largestBattleLoss = Math.max(this.largestBattleLoss, result.cardsLost.length);
      if (lostAce) this.acesLostInBattles++;
      if (lostAce && lostTwo) this.aceAndTwoLostInSameBattle++;
    } else {
      this.largestBattleVictory = Math.max(this.largestBattleVictory, result.cardsLost.length);
    }

    for (let index = 0; index < result.casualtyRevealCards.length; index++) {
      const card = result.casualtyRevealCards[index];
      this.revealedCasualtyIds.update(ids => [...ids, card.id]);
      this.gameMessage.set(`Casualty ${index + 1} of ${result.casualtyRevealCards.length}`);
      this.sound.playCardFlip();

      this.eventBus.emit({
        type: 'casualty_revealed',
        turnNumber: this.turnsPlayed,
        card,
        casualtyIndex: index + 1,
        totalCasualties: result.casualtyRevealCards.length,
        loser
      });

      const isSignificant = card.rank === Rank.ACE || card.rank === Rank.TWO;
      const pace = Math.max(220, 500 - index * 36) + (isSignificant ? 200 : 0);
      await this.sequencer.pause(pace, version);
    }

    // A casualty-specific quip is safe only after every losing card is public.
    const reaction = this.reactions.forBattleLoss(loser, result.cardsLost);
    this.reaction.set(reaction);
    if (reaction) {
      this.eventBus.emit({
        type: 'quip_spoken',
        turnNumber: this.turnsPlayed,
        speaker: reaction.speaker,
        message: reaction.message
      });
    }

    this.eventBus.emit({
      type: 'battle_resolved',
      turnNumber: this.turnsPlayed,
      winner,
      loser,
      layerDepth: this.deepestBattleLayer || 1,
      revealedCasualties: result.casualtyRevealCards,
      hiddenWinnerCardCount: result.hiddenWinnerCardCount,
      totalCardsAtStake: result.cardsLost.length,
      lostAce,
      lostTwo,
      lostAceAndTwo: lostAce && lostTwo
    });

    const turn = this.presentedTurn();
    const winningIds = turn
      ? (winner === PlayerType.PLAYER
          ? [turn.playerCard, ...(turn.playerChallengeCard ? [turn.playerChallengeCard] : []),
              ...turn.battleLayers.flatMap(layer => layer.playerCards)]
          : [turn.opponentCard, ...(turn.opponentChallengeCard ? [turn.opponentChallengeCard] : []),
              ...turn.battleLayers.flatMap(layer => layer.opponentCards)])
        .map(card => card.id)
      : [];
    this.returningHomeIds.set(winningIds);
    this.phase.set(PresentationState.RETURN_WINNER_CARDS);
    this.gameMessage.set(`${result.hiddenWinnerCardCount} hidden winner card${result.hiddenWinnerCardCount === 1 ? '' : 's'} return face-down.`);
    await this.sequencer.pause(380, version);

    this.withheldBoneyardIds.set(result.cardsLost.map(card => card.id));
    this.turnResolution.finalizeBattle(winner, result.nextPhase === GamePhase.GAME_OVER);
    this.movingToBoneyardIds.set(result.cardsLost.map(card => card.id));
    this.phase.set(PresentationState.SEND_LOSER_CARDS_TO_BONEYARD);
    this.gameMessage.set(`${result.cardsLost.length} cards to the Boneyard.`);
    this.sound.playBoneyard();
    await this.sequencer.pause(520, version);
    this.withheldBoneyardIds.set([]);
    this.clearPresentedCards();
    await this.finishTurn(version);
  }

  private async playOrdinarySettlement(result: TurnResult, version: number): Promise<void> {
    this.withholdBoneyard(result);
    const winner = result.winner;
    if (winner) {
      const winningIds = this.cardsOwnedBy(winner).map(card => card.id);
      this.returningHomeIds.set(winningIds);
      this.phase.set(PresentationState.RETURN_WINNER_CARDS);
      await this.sequencer.pause(230, version);
    }
    this.movingToBoneyardIds.set(result.cardsLost.map(card => card.id));
    this.phase.set(PresentationState.SEND_LOSER_CARDS_TO_BONEYARD);
    this.sound.playBoneyard();
    await this.sequencer.pause(310, version);
    this.withheldBoneyardIds.set([]);
    this.clearPresentedCards();
    await this.finishTurn(version);
  }

  private async finishTurn(version: number): Promise<void> {
    if (this.gameState.currentPhase === GamePhase.GAME_OVER) {
      this.finishAtGameOver();
      this.sequencer.end(version);
      return;
    }
    this.phase.set(PresentationState.TURN_COMPLETE);
    this.gameMessage.set('Table clear.');
    await this.sequencer.pause(170, version);
    this.phase.set(PresentationState.READY);
    this.gameMessage.set('Draw when ready.');
    this.sequencer.end(version);
  }

  private finishAtGameOver(): void {
    const outcome = this.gameState.currentState.outcome ?? GameOutcome.TIE;
    this.phase.set(PresentationState.GAME_OVER);

    const isComeback = outcome === GameOutcome.PLAYER_WIN && this.maxDeficitExperienced >= 3;
    const durationMs = Math.max(1000, Date.now() - this.gameStartTime);
    const pCardsRemaining = this.gameState.playerCardCount();
    const oCardsRemaining = this.gameState.opponentCardCount();

    // Compile summary for table dialog
    const summary: CurrentGameSummary = {
      outcome,
      turns: this.turnsPlayed,
      battlesCount: this.battlesCount,
      deepestBattleLayer: this.deepestBattleLayer,
      maxCardsAtStake: this.maxCardsAtStake,
      largestBattleVictory: this.largestBattleVictory,
      largestBattleLoss: this.largestBattleLoss,
      playerChallengesCount: this.playerChallengesCount,
      playerChallengesWon: this.playerChallengesWon,
      playerCardsRemaining: pCardsRemaining,
      opponentCardsRemaining: oCardsRemaining,
      isComeback,
      maxDeficit: this.maxDeficitExperienced
    };
    this.gameSummarySignal.set(summary);

    // Record long-term stats
    this.authService.recordGameResult({
      outcome: outcome === GameOutcome.PLAYER_WIN ? 'player_win' : (outcome === GameOutcome.OPPONENT_WIN ? 'opponent_win' : 'tie'),
      turns: this.turnsPlayed,
      durationMs,
      playerCardsRemaining: pCardsRemaining,
      opponentCardsRemaining: oCardsRemaining,
      battlesCount: this.battlesCount,
      deepestBattleLayer: this.deepestBattleLayer,
      maxCardsAtStake: this.maxCardsAtStake,
      largestBattleLoss: this.largestBattleLoss,
      largestBattleVictory: this.largestBattleVictory,
      playerChallengesCount: this.playerChallengesCount,
      playerChallengesWon: this.playerChallengesWon,
      acesDefeatedByTwo: this.acesDefeatedByTwo,
      twosSavedByChallenge: this.twosSavedByChallenge,
      acesLostInBattles: this.acesLostInBattles,
      aceAndTwoLostInSameBattle: this.aceAndTwoLostInSameBattle,
      maxDeficitExperienced: this.maxDeficitExperienced,
      isComeback
    });

    // Emit game_resolved
    this.eventBus.emit({
      type: 'game_resolved',
      turnNumber: this.turnsPlayed,
      outcome,
      turns: this.turnsPlayed,
      playerCardsRemaining: pCardsRemaining,
      opponentCardsRemaining: oCardsRemaining,
      maxDeficitExperienced: this.maxDeficitExperienced,
      isComeback
    });

    if (outcome === GameOutcome.TIE) {
      this.gameMessage.set('The war ends in a true tie.');
    } else if (outcome === GameOutcome.PLAYER_WIN) {
      this.gameMessage.set('You win the war.');
      this.sound.playVictory();
    } else {
      this.gameMessage.set('Opponent wins the war.');
      this.sound.playDefeat();
    }
  }

  private async playTerminalTie(result: TurnResult, version: number): Promise<void> {
    this.phase.set(PresentationState.BATTLE_TIE);
    this.gameMessage.set(result.message);
    this.sound.playClash();
    await this.sequencer.pause(600, version);
    this.finishAtGameOver();
    this.sequencer.end(version);
  }

  private syncPresentedTurn(): void {
    this.presentedTurn.set(this.gameState.currentState.activeTurn);
  }

  private cardsOwnedBy(owner: PlayerType): readonly Card[] {
    const turn = this.presentedTurn();
    if (!turn) return [];
    return owner === PlayerType.PLAYER
      ? [turn.playerCard, ...(turn.playerChallengeCard ? [turn.playerChallengeCard] : []),
          ...turn.battleLayers.flatMap(layer => layer.playerCards)]
      : [turn.opponentCard, ...(turn.opponentChallengeCard ? [turn.opponentChallengeCard] : []),
          ...turn.battleLayers.flatMap(layer => layer.opponentCards)];
  }

  private clearPresentedCards(): void {
    this.presentedTurn.set(null);
    this.revealedCasualtyIds.set([]);
    this.movingToBoneyardIds.set([]);
    this.returningHomeIds.set([]);
    this.pendingHumanTargetId.set(null);
    this.selectedOpponentCard.set(null);
    this.selectedPlayerCard.set(null);
    this.opponentPointer.set(null);
  }

  private withholdBoneyard(result: TurnResult): void {
    if (result.cardsLost.length > 0) {
      this.withheldBoneyardIds.set(result.cardsLost.map(card => card.id));
    }
  }

  private cardView(
    card: Card,
    owner: PlayerType,
    publicIds: ReadonlySet<string>,
    casualtyIds: ReadonlySet<string>,
    selectedId: string | null,
    eligible: boolean
  ): TableCardView {
    const isPublic = publicIds.has(card.id) || casualtyIds.has(card.id);
    return {
      id: card.id,
      card: isPublic ? card : null,
      owner,
      faceDown: !isPublic,
      selected: selectedId === card.id,
      eligible,
      casualty: casualtyIds.has(card.id)
    };
  }

  private recoverFromError(error: unknown): void {
    console.error('Game flow error:', error);
    this.sequencer.cancel();
    this.gameMessage.set('The table was reset after an invalid game state.');
    this.startNewGame();
  }
}
