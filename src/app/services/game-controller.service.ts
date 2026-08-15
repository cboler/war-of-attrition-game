import { Injectable, computed, inject, signal } from '@angular/core';
import { ActiveTurn, GamePhase, PlayerType } from '../core/models/game-state.model';
import { Card } from '../core/models/card.model';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SoundService } from '../core/services/sound.service';
import { TurnResolutionService, TurnResult } from '../core/services/turn-resolution.service';
import { PresentationSequencerService } from './presentation-sequencer.service';
import { TableReaction, TableReactionService } from './table-reaction.service';

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

@Injectable({ providedIn: 'root' })
export class GameControllerService {
  private readonly gameState = inject(GameStateService);
  private readonly turnResolution = inject(TurnResolutionService);
  private readonly opponentAI = inject(OpponentAIService);
  private readonly sound = inject(SoundService);
  private readonly sequencer = inject(PresentationSequencerService);
  private readonly reactions = inject(TableReactionService);

  private readonly gameMessage = signal('Your deck is ready.');
  private readonly phase = signal(PresentationState.READY);
  private readonly presentedTurn = signal<ActiveTurn | null>(null);
  private readonly revealedCasualtyIds = signal<readonly string[]>([]);
  private readonly movingToBoneyardIds = signal<readonly string[]>([]);
  private readonly returningHomeIds = signal<readonly string[]>([]);
  private readonly pendingHumanTargetId = signal<string | null>(null);
  private readonly selectedOpponentCard = signal<Card | null>(null);
  private readonly selectedPlayerCard = signal<Card | null>(null);
  private readonly opponentPointer = signal<number | null>(null);
  private readonly reaction = signal<TableReaction | null>(null);

  readonly presentationState = this.phase.asReadonly();
  readonly tableMessage = this.gameMessage.asReadonly();
  readonly tableReaction = this.reaction.asReadonly();
  readonly opponentPointerIndex = this.opponentPointer.asReadonly();
  readonly cardsMovingToBoneyard = this.movingToBoneyardIds.asReadonly();
  readonly cardsReturningHome = this.returningHomeIds.asReadonly();
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
    this.sequencer.cancel();
    this.gameState.initializeGame();
    this.phase.set(PresentationState.READY);
    this.gameMessage.set('Your deck is ready.');
    this.presentedTurn.set(null);
    this.revealedCasualtyIds.set([]);
    this.movingToBoneyardIds.set([]);
    this.returningHomeIds.set([]);
    this.pendingHumanTargetId.set(null);
    this.selectedOpponentCard.set(null);
    this.selectedPlayerCard.set(null);
    this.opponentPointer.set(null);
    this.reaction.set(null);
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
      this.gameMessage.set(result.message);
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
        await this.playOrdinarySettlement(result, version);
        return;
      }

      const reinforcement = this.gameState.beginChallenge(PlayerType.PLAYER);
      if (!reinforcement) {
        const result = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        await this.playOrdinarySettlement(result, version);
        return;
      }
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
      this.gameMessage.set(result.message);
      await this.sequencer.pause(420, version);
      await this.continueFromResult(result, version);
    } catch (error) {
      this.recoverFromError(error);
    }
  }

  private async continueFromResult(result: TurnResult, version: number): Promise<void> {
    if (result.canChallenge) {
      this.phase.set(PresentationState.PLAYER_CHALLENGE_DECISION);
      this.gameMessage.set('Your card is beaten.');
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
    for (let dots = 1; dots <= 3; dots++) {
      this.gameMessage.set(`Reinforce ${'.'.repeat(dots)}`);
      await this.sequencer.pause(230, version);
    }

    if (!result.opponentChallenge) {
      this.gameMessage.set('Concede.');
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

    this.syncPresentedTurn();
    this.phase.set(PresentationState.CHALLENGE_DRAW);
    this.gameMessage.set('Opponent sends reinforcement.');
    this.sound.playCardDraw();
    await this.sequencer.pause(380, version);
    this.sound.playCardFlip();
    this.phase.set(PresentationState.CHALLENGE_CLASH);
    await this.sequencer.pause(480, version);
    const challengeResult = this.turnResolution.resolveChallenge(PlayerType.OPPONENT);
    this.gameMessage.set(challengeResult.message);
    await this.sequencer.pause(420, version);
    await this.continueFromResult(challengeResult, version);
  }

  private async setupBattle(version: number): Promise<void> {
    this.phase.set(PresentationState.BATTLE_SETUP);
    const existingLayers = this.gameState.currentState.activeTurn?.battleLayers.length ?? 0;
    this.gameMessage.set(existingLayers === 0 ? 'BATTLE' : `BATTLE · LAYER ${existingLayers + 1}`);
    this.sound.playClash();
    await this.sequencer.pause(470, version);

    const layer = this.gameState.dealBattleLayer();
    if (!layer) {
      this.gameState.settleAttritionLoss();
      this.finishAtGameOver();
      return;
    }
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
    this.phase.set(PresentationState.OPPONENT_TARGET_SELECTION);
    this.gameMessage.set('Opponent chooses blindly.');

    const pointerPath = [0, 2, 1, selectedIndex];
    for (const index of pointerPath) {
      this.opponentPointer.set(index);
      await this.sequencer.pause(130, version);
    }
    await this.sequencer.pause(220, version);

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
    await this.sequencer.pause(500, version);

    if (result.pendingBattleSettlement) {
      await this.playBattleSettlement(result, version);
      return;
    }

    if (result.result === 'tie') {
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
    this.reaction.set(this.reactions.forBattleLoss(loser, result.cardsLost));
    this.phase.set(PresentationState.CASUALTY_REVEAL);

    for (let index = 0; index < result.casualtyRevealCards.length; index++) {
      const card = result.casualtyRevealCards[index];
      this.revealedCasualtyIds.update(ids => [...ids, card.id]);
      this.gameMessage.set(`Casualty ${index + 1} of ${result.casualtyRevealCards.length}`);
      this.sound.playCardFlip();
      const pace = Math.max(150, 470 - index * 42);
      await this.sequencer.pause(pace, version);
    }

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

    this.turnResolution.finalizeBattle(winner, result.nextPhase === GamePhase.GAME_OVER);
    this.movingToBoneyardIds.set(result.cardsLost.map(card => card.id));
    this.phase.set(PresentationState.SEND_LOSER_CARDS_TO_BONEYARD);
    this.gameMessage.set(`${result.cardsLost.length} cards to the Boneyard.`);
    this.sound.playBoneyard();
    await this.sequencer.pause(520, version);
    this.clearPresentedCards();
    await this.finishTurn(version);
  }

  private async playOrdinarySettlement(result: TurnResult, version: number): Promise<void> {
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
    const winner = this.gameState.currentState.winner;
    this.phase.set(PresentationState.GAME_OVER);
    this.gameMessage.set(winner === PlayerType.PLAYER ? 'You win the war.' : 'Opponent wins the war.');
    if (winner === PlayerType.PLAYER) this.sound.playVictory();
    else this.sound.playDefeat();
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
