import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActiveTurn,
  BattleOutcome,
  GameOutcome,
  GamePhase,
  PlayerType,
} from '../core/models/game-state.model';
import { Card, Rank } from '../core/models/card.model';
import {
  DEFAULT_COMMANDER_ID,
  OpponentCommander,
  OpponentCommanderId,
  getCommander,
} from '../core/models/commander.model';
import type { PublicBattleResolution } from '../core/models/game-events.model';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SoundService } from '../core/services/sound.service';
import { TurnResolutionService, TurnResult } from '../core/services/turn-resolution.service';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { AuthService } from '../core/services/auth.service';
import { SettingsService } from '../core/services/settings.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { CampaignModeId } from '../core/models/progression.model';
import {
  PresentationSequenceCancelled,
  PresentationSequencerService,
} from './presentation-sequencer.service';
import { TableReaction, TableReactionService } from './table-reaction.service';
import { GameEventBusService } from './game-event-bus.service';
import { StoryBookService } from './story-book.service';
import { TutorialService } from './tutorial.service';
import { TutorialStep } from '../core/models/tutorial.model';
import { GameTelemetryService } from './game-telemetry.service';
import { CommanderIdentity, getCommanderIdentity } from '../core/models/commander-identity.model';
import { CommanderExpression } from '../core/models/commander-art.model';
import {
  AuthoredDialogueRecord,
  NarrativeTransitionRecord
} from '../core/models/narrative.model';
import { NarrativeResolverService } from '../narrative/narrative-resolver.service';
import { BattleAnimationService } from './battle-animation.service';
import type { ComparisonStrengthView } from '../shared/components/comparison-strength/comparison-strength.component';
import {
  battleTargetInstruction,
  cardsToBoneyard,
  casualtyProgress,
  hiddenCardsReturn,
} from './table-copy';

export const MODEST_COMEBACK_DEFICIT_THRESHOLD = 3;
export const SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD = 15;
export const SKIRMISH_ANIMATION_BASE_DURATION_MS = 800;
export const SKIRMISH_ANIMATION_FAST_MIN_DURATION_MS = 720;

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
  DECK_DEFEAT_POP = 'deck_defeat_pop',
  TURN_COMPLETE = 'turn_complete',
  GAME_OVER = 'game_over',
}

export interface TableCardView {
  readonly id: string;
  readonly card: Card | null;
  readonly owner: PlayerType;
  readonly faceDown: boolean;
  readonly selected: boolean;
  readonly eligible: boolean;
  readonly casualty: boolean;
  readonly casualtyEmphasis: 'major' | 'face' | null;
}

export type CasualtyEmphasis = TableCardView['casualtyEmphasis'];

export function casualtyEmphasisFor(card: Card): CasualtyEmphasis {
  if (card.rank === Rank.ACE || card.rank === Rank.TWO) return 'major';
  if (card.rank === Rank.KING || card.rank === Rank.QUEEN || card.rank === Rank.JACK) return 'face';
  return null;
}

export function battleAnnouncementFor(round: number): string {
  return round <= 1 ? 'Battle' : `Battle: Depth ${round}`;
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
  readonly campaignMode?: CampaignModeId;
  readonly warDifferential?: number;
  readonly runningCampaignDifferential?: number;
  readonly warIndex?: number;
  readonly commanderIdentity?: CommanderIdentity;
  readonly transition?: NarrativeTransitionRecord;
  readonly resolutionLine?: AuthoredDialogueRecord;
  readonly nextCommanderIdentity?: CommanderIdentity;
}

export interface BattlefieldMessage {
  readonly id: number;
  readonly text: string;
}

export type BattlefieldMessageProminence = 'routine' | 'significant';

export interface ComparisonPresentation {
  readonly player: ComparisonStrengthView;
  readonly opponent: ComparisonStrengthView;
  readonly resolved: boolean;
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
  private readonly settings = inject(SettingsService);
  private readonly campaignProgression = inject(CampaignProgressionService);
  private readonly telemetry = inject(GameTelemetryService);
  private readonly storyBook = inject(StoryBookService);
  private readonly tutorial = inject(TutorialService);
  private readonly narrativeResolver = inject(NarrativeResolverService, { optional: true });
  private readonly battleAnimationService = inject(BattleAnimationService);

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
  private readonly comparisonPresentationSignal = signal<ComparisonPresentation | null>(null);
  private readonly battlefieldMessagesSignal = signal<readonly BattlefieldMessage[]>([
    { id: 0, text: 'Your deck is ready.' },
  ]);
  private readonly deckDefeatPopOwnerSignal = signal<PlayerType | null>(null);
  private readonly presentationStepSkippedPhaseSignal = signal<PresentationState | null>(null);
  private readonly holdPlayerFinalBadgeSignal = signal(false);
  private readonly holdOpponentFinalBadgeSignal = signal(false);
  private readonly fixtureCommanderSignal = signal<OpponentCommander | null>(null);
  private messageCounter = 0;

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
  private acesRescuedByChallenge = 0;
  private acesRescuingTwos = 0;
  private acesLostInBattles = 0;
  private aceAndTwoLostInSameBattle = 0;
  private maxDeficitExperienced = 0;
  private abandonmentRecorded = false;
  private currentWarId = '';
  private lastMeaningfulDecision:
    | 'draw'
    | 'challenge'
    | 'concede'
    | 'battle_target'
    | 'continue'
    | undefined;

  private readonly gameSummarySignal = signal<CurrentGameSummary | null>(null);

  readonly presentationState = this.phase.asReadonly();
  readonly tableMessage = this.gameMessage.asReadonly();
  readonly tableReaction = this.reaction.asReadonly();
  readonly opponentExpression = computed<CommanderExpression>(() => {
    const reaction = this.reaction();
    return reaction?.speaker === PlayerType.OPPONENT ? (reaction.expression ?? 'calm') : 'calm';
  });
  readonly opponentCommander = computed<OpponentCommander>(
    () => this.fixtureCommanderSignal() ?? this.campaignProgression.currentCommander()
  );
  readonly opponentCommanderIdentity = computed<CommanderIdentity>(() => {
    const fixture = this.fixtureCommanderSignal();
    return fixture
      ? getCommanderIdentity(fixture.id)
      : this.campaignProgression.currentCommanderIdentity();
  });
  readonly opponentPointerIndex = this.opponentPointer.asReadonly();
  readonly cardsMovingToBoneyard = this.movingToBoneyardIds.asReadonly();
  readonly cardsReturningHome = this.returningHomeIds.asReadonly();
  readonly currentGameSummary = this.gameSummarySignal.asReadonly();
  readonly comparisonPresentation = this.comparisonPresentationSignal.asReadonly();
  readonly battlefieldMessages = this.battlefieldMessagesSignal.asReadonly();
  readonly deckDefeatPopOwner = this.deckDefeatPopOwnerSignal.asReadonly();
  readonly battleAnimation = this.battleAnimationService.scene;
  readonly presentationStepSkipped = computed(
    () => this.presentationStepSkippedPhaseSignal() === this.phase(),
  );
  readonly playerDeckDisplayCount = computed(() => {
    const count = this.gameState.playerCardCount();
    return count === 0 && this.holdPlayerFinalBadgeSignal() ? 1 : count;
  });
  readonly opponentDeckDisplayCount = computed(() => {
    const count = this.gameState.opponentCardCount();
    return count === 0 && this.holdOpponentFinalBadgeSignal() ? 1 : count;
  });


  readonly isFogOfWarActive = computed<boolean>(
    () => this.campaignProgression.isFogOfWar() && this.phase() !== PresentationState.GAME_OVER
  );
  readonly canInspectCasualties = computed<boolean>(() => !this.isFogOfWarActive());
  readonly visibleBoneyardCards = computed(() => {
    const withheld = new Set(this.withheldBoneyardIds());
    return this.gameState.discardedCards().filter((card) => !withheld.has(card.id));
  });
  readonly visibleBoneyardCount = computed(() => this.visibleBoneyardCards().length);
  readonly canDraw = computed(() => this.phase() === PresentationState.READY);
  readonly canChooseChallenge = computed(
    () => this.phase() === PresentationState.PLAYER_CHALLENGE_DECISION,
  );
  readonly canSelectTarget = computed(
    () => this.phase() === PresentationState.PLAYER_TARGET_SELECTION,
  );
  readonly presentationCanAdvance = computed(() => this.sequencer.waiting());
  readonly playerCardsAtRisk = computed(() => this.gameState.getStake(PlayerType.PLAYER).length);
  readonly opponentCardsAtRisk = computed(
    () => this.gameState.getStake(PlayerType.OPPONENT).length,
  );

  readonly activePlayerCard = computed(() => this.presentedTurn()?.playerCard ?? null);
  readonly activeOpponentCard = computed(() => this.presentedTurn()?.opponentCard ?? null);
  readonly playerChallengeCard = computed(() => this.presentedTurn()?.playerChallengeCard ?? null);
  readonly opponentChallengeCard = computed(
    () => this.presentedTurn()?.opponentChallengeCard ?? null,
  );

  readonly battleLayers = computed<readonly TableBattleLayerView[]>(() => {
    const turn = this.presentedTurn();
    if (!turn) return [];
    const publicIds = new Set(turn.publicCardIds);
    const casualtyIds = new Set(this.revealedCasualtyIds());
    const newestRound = turn.battleLayers.length;
    return turn.battleLayers.map((layer) => ({
      round: layer.round,
      receded: layer.round !== newestRound,
      playerCards: layer.playerCards.map((card) =>
        this.cardView(
          card,
          PlayerType.PLAYER,
          publicIds,
          casualtyIds,
          layer.selectedPlayerCardId,
          false,
        ),
      ),
      opponentCards: layer.opponentCards.map((card) =>
        this.cardView(
          card,
          PlayerType.OPPONENT,
          publicIds,
          casualtyIds,
          layer.selectedOpponentCardId ?? this.pendingHumanTargetId(),
          layer.round === newestRound && this.canSelectTarget(),
        ),
      ),
    }));
  });

  // Compatibility getters keep the review-only classic route operational.
  get message(): string {
    return this.gameMessage();
  }
  get canChallenge(): boolean {
    return this.canChooseChallenge();
  }
  get showChallengePrompt(): boolean {
    return this.canChooseChallenge();
  }
  get currentChallengeCard(): Card | null {
    return this.playerChallengeCard();
  }
  get showChallengeCardDisplay(): boolean {
    return false;
  }
  get playerCanAct(): boolean {
    return this.canDraw();
  }
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
    if (
      [PresentationState.OPPONENT_TARGET_SELECTION, PresentationState.BATTLE_REVEAL].includes(
        this.phase(),
      )
    )
      return 'revealing';
    return 'setup';
  }
  get currentBattleStep():
    'none' | 'selection' | 'revealing_player' | 'revealing_opponent' | 'revealing_all' {
    if (this.phase() === PresentationState.PLAYER_TARGET_SELECTION) return 'selection';
    if (this.phase() === PresentationState.BATTLE_REVEAL) return 'revealing_opponent';
    return 'none';
  }
  get playerPickedCard(): Card | null {
    return this.selectedOpponentCard();
  }
  get opponentPickedCard(): Card | null {
    return this.selectedPlayerCard();
  }
  get isRevealAll(): boolean {
    return false;
  }

  /** Starts the first match only; route/component remounts leave an existing match untouched. */
  ensureGameStarted(): void {
    if (!this.gameState.hasGame()) {
      this.replaceGame(false);
    } else if (this.turnsPlayed === 0 && this.phase() === PresentationState.READY) {
      this.tutorial.triggerStep(TutorialStep.FIRST_TURN);
    }
  }

  hasMeaningfulUnresolvedGame(): boolean {
    return this.gameState.hasMeaningfulUnresolvedGame();
  }

  /** Explicit player-requested replacement of the current match. */
  startNewGame(abandonmentDecision: 'restart' | 'abandon' = 'restart'): void {
    this.replaceGame(true, abandonmentDecision);
  }

  /** Deliberately abandons the active Campaign without resolving or rewarding it. */
  abandonCampaign(): boolean {
    if (!this.campaignProgression.hasActiveCampaign()) return false;

    this.recordCurrentWarAbandonment('abandon');
    if (!this.campaignProgression.abandonActiveCampaign()) return false;
    this.replaceGame(false);
    return true;
  }

  private replaceGame(
    recordAbandonment: boolean,
    abandonmentDecision: 'restart' | 'abandon' = 'restart',
  ): void {
    const interruptedBattlePresentation = this.isBattlePresentationPhase();
    const interruptedTurnNumber = this.turnsPlayed;
    const didAbandon = recordAbandonment
      ? this.recordCurrentWarAbandonment(abandonmentDecision)
      : false;

    this.sequencer.cancel();
    this.battleAnimationService.clear();
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
    this.gameState.initializeGame();
    this.phase.set(PresentationState.READY);
    this.gameMessage.set('Your deck is ready.');
    this.battlefieldMessagesSignal.set([{ id: ++this.messageCounter, text: 'Your deck is ready.' }]);
    void this.tutorial.triggerStep(TutorialStep.FIRST_TURN);
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
    this.comparisonPresentationSignal.set(null);
    this.deckDefeatPopOwnerSignal.set(null);
    this.holdPlayerFinalBadgeSignal.set(false);
    this.holdOpponentFinalBadgeSignal.set(false);
    this.gameSummarySignal.set(null);
    this.fixtureCommanderSignal.set(null);
    this.storyBook.clear();

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
    this.acesRescuedByChallenge = 0;
    this.acesRescuingTwos = 0;
    this.acesLostInBattles = 0;
    this.aceAndTwoLostInSameBattle = 0;
    this.maxDeficitExperienced = 0;
    this.abandonmentRecorded = false;
    this.lastMeaningfulDecision = undefined;

    // An interrupted Battle must release any deferred achievement notices. The
    // old sequence cannot complete after cancellation, so this fresh table is
    // the first stable place to present them.
    if (interruptedBattlePresentation) {
      this.eventBus.emit({
        type: 'battle_presentation_complete',
        turnNumber: interruptedTurnNumber,
      });
    }

    const warContext = this.telemetry.beginWar({
      playerDeckColor: this.gameState.currentPlayerDeckColor,
      startType: didAbandon ? 'restart' : 'new',
      commanderId: this.opponentCommander().id,
      campaignMode: this.campaignProgression.activeCampaignMode(),
    });
    this.currentWarId = warContext.warId;
    this.eventBus.emit({
      type: 'war_started',
      turnNumber: 0,
      playerDeckColor: this.gameState.currentPlayerDeckColor,
    });
    if (
      this.campaignProgression.isLimitedReserves() &&
      this.campaignProgression.campaignWarIndex() === 1
    ) {
      this.storyBook.addEntry({
        turnNumber: 0,
        type: 'challenge',
        eyebrow: 'CAMPAIGN ORDERS',
        title: 'Limited Reserves',
        text: 'Campaign initiated under Limited Reserves. 5 reinforcement reserves allocated for all three Wars.',
        badge: 'challenge',
      });
    }

    if (
      this.campaignProgression.ordersSelected() ||
      this.campaignProgression.campaignWarIndex() > 1
    ) {
      this.speakIntroduction();
    }
  }

  private recordCurrentWarAbandonment(
    abandonmentDecision: 'restart' | 'abandon',
  ): boolean {
    if (this.hasMeaningfulUnresolvedGame() && !this.abandonmentRecorded) {
      const activeTurn = this.gameState.currentState.activeTurn;
      const career = this.authService.userStats();
      this.authService.recordGameAbandoned();
      this.eventBus.emit({
        type: 'game_abandoned',
        turnNumber: this.turnsPlayed,
        turnsPlayed: this.turnsPlayed,
        playerDeckCount: this.gameState.playerCardCount(),
        opponentDeckCount: this.gameState.opponentCardCount(),
        playerCardsAtStakeCount: this.gameState.getStake(PlayerType.PLAYER).length,
        opponentCardsAtStakeCount: this.gameState.getStake(PlayerType.OPPONENT).length,
        playerCardDeficit:
          this.gameState.opponentCardCount() - this.gameState.playerCardCount(),
        gamePhase: this.gameState.currentPhase,
        battleDepth: activeTurn?.battleLayers.length ?? 0,
        currentBattleWinStreak: career.currentBattleWinStreak,
        currentBattleLossStreak: career.currentBattleLossStreak,
        presentationPhase: this.phase(),
        animationSpeed: this.settings.animationSpeed(),
        lastDecision: this.lastMeaningfulDecision,
        abandonmentAction: abandonmentDecision,
        recentEventCategory: this.recentEventCategory(),
        recentReactionCategory: this.reaction()?.category,
      });
      this.abandonmentRecorded = true;
      return true;
    }
    return false;
  }

  speakIntroduction(): void {
    const introReaction = this.reactions.forIntroduction(this.opponentCommander().id);
    if (introReaction) {
      this.speakReaction(introReaction);
    }
  }

  playerDrawCard(): boolean {
    if (!this.canDraw() || this.gameState.currentPhase !== GamePhase.NORMAL) return false;
    this.lastMeaningfulDecision = 'draw';
    void this.playTurn();
    return true;
  }

  handleChallenge(acceptChallenge: boolean): void {
    if (!this.canChooseChallenge()) return;
    this.lastMeaningfulDecision = acceptChallenge ? 'challenge' : 'concede';
    void this.playPlayerChallenge(acceptChallenge);
  }

  /** Challenges commit when the reinforcement is drawn; retained for classic UI compatibility. */
  confirmChallenge(): void {}

  selectBattleCard(selectedCardOrId: Card | string): void {
    if (!this.canSelectTarget()) return;
    const newest = this.presentedTurn()?.battleLayers.at(-1);
    const selectedId =
      typeof selectedCardOrId === 'string' ? selectedCardOrId : selectedCardOrId.id;
    const selectedCard = newest?.opponentCards.find((card) => card.id === selectedId);
    if (!selectedCard) return;
    this.lastMeaningfulDecision = 'battle_target';
    void this.playBattleSelection(selectedCard);
  }

  advancePresentation(): boolean {
    const skippedPhase = this.phase();
    const advanced = this.sequencer.advance();
    if (advanced) {
      this.lastMeaningfulDecision = 'continue';
      this.presentationStepSkippedPhaseSignal.set(skippedPhase);
      setTimeout(() => {
        if (this.presentationStepSkippedPhaseSignal() === skippedPhase) {
          this.presentationStepSkippedPhaseSignal.set(null);
        }
      }, 80);
    }
    return advanced;
  }

  comparisonStrengthFor(cardId: string): ComparisonStrengthView | null {
    const comparison = this.comparisonPresentationSignal();
    if (!comparison) return null;
    if (comparison.player.cardId === cardId) return comparison.player;
    if (comparison.opponent.cardId === cardId) return comparison.opponent;
    return null;
  }

  isInactiveComparator(cardId: string): boolean {
    const turn = this.presentedTurn();
    const comparison = this.comparisonPresentationSignal();
    if (
      !turn ||
      !comparison ||
      comparison.resolved ||
      (!turn.playerChallengeCard && !turn.opponentChallengeCard)
    ) {
      return false;
    }
    const activeIds = new Set([comparison.player.cardId, comparison.opponent.cardId]);
    return (cardId === turn.playerCard.id || cardId === turn.opponentCard.id) && !activeIds.has(cardId);
  }

  isRevealedCasualty(cardId: string): boolean {
    return this.revealedCasualtyIds().includes(cardId);
  }

  getGameStats() {
    return this.gameState.currentStats;
  }
  getGameState() {
    return this.gameState.currentState;
  }

  private async playTurn(): Promise<void> {
    const version = this.sequencer.begin();
    this.battleAnimationService.clear();
    this.comparisonPresentationSignal.set(null);
    this.revealedCasualtyIds.set([]);
    this.phase.set(PresentationState.DRAWING);
    this.announce('Cards are dealt.', 'routine');


    try {
      this.holdFinalBadgeIfDepletedBy(PlayerType.PLAYER, 1);
      this.holdFinalBadgeIfDepletedBy(PlayerType.OPPONENT, 1);
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
        turnNumber: this.turnsPlayed,
      });

      this.primeComparison(playerCard, opponentCard);
      this.syncPresentedTurn();
      this.sound.playCardDraw();
      await this.sequencer.pause(280, version);
      this.phase.set(PresentationState.CLASH_REVEAL);
      this.announce('Reveal.', 'routine');
      this.sound.playCardFlip();
      await this.sequencer.pause(360, version);
      this.phase.set(PresentationState.CLASH_RESOLUTION);
      this.sound.playCardLand();

      const result = this.turnResolution.resolveTurn(
        playerCard,
        opponentCard,
        this.opponentCommander(),
      );
      this.withholdBoneyard(result);
      const specialRule = this.comparison.isSpecialAceVsTwoRule(playerCard, opponentCard);
      this.resolveComparison(playerCard, opponentCard, result.result, specialRule);
      this.playComparisonResolutionSound(result.result);
      this.announce(result.message, specialRule ? 'significant' : 'routine');
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
        message: result.message,
      });
      if (result.winner) {
        this.speakReaction(
          this.reactions.forClash(
            {
              playerCard,
              opponentCard,
              winner: result.winner,
              specialRule,
            },
            this.opponentCommander(),
          ),
        );
      }

      if (specialRule) {
        await this.tutorial.triggerStep(TutorialStep.ACE_ASSASSINATION);
      } else {
        await this.tutorial.triggerStep(TutorialStep.FIRST_COMPARISON);
      }
      if (result.winner) {
        await this.playComparisonSkirmish(result.winner, version);
      } else {
        await this.sequencer.pause(430, version, 650);
      }
      await this.continueFromResult(result, version);
    } catch (error) {
      this.handleSequenceError(error);
    }
  }

  private async playPlayerChallenge(accept: boolean): Promise<void> {
    const version = this.sequencer.begin();
    try {
      if (!accept || !this.campaignProgression.canHumanReinforce(this.gameState.playerCardCount())) {
        const result = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        this.announce(result.message);
        this.eventBus.emit({
          type: 'challenge_conceded',
          turnNumber: this.turnsPlayed,
          loser: PlayerType.PLAYER,
          winner: PlayerType.OPPONENT,
          message: result.message,
        });
        await this.playOrdinarySettlement(result, version);
        return;
      }

      this.playerChallengesCount++;
      this.holdFinalBadgeIfDepletedBy(PlayerType.PLAYER, 1);
      const reinforcement = this.gameState.beginChallenge(PlayerType.PLAYER);
      if (!reinforcement) {
        const result = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        await this.playOrdinarySettlement(result, version);
        return;
      }

      // Authoritative point of human reserve consumption
      this.campaignProgression.consumeHumanReserve();
      if (
        this.campaignProgression.isLimitedReserves() &&
        this.campaignProgression.remainingReserves() === 0
      ) {
        this.storyBook.addEntry({
          turnNumber: this.turnsPlayed,
          type: 'challenge',
          eyebrow: 'LIMITED RESERVES',
          title: 'Reserves Depleted',
          text: 'Final reinforcement reserve committed. Reinforcements are exhausted for the remainder of this Campaign.',
          badge: 'challenge',
        });
      }

      this.syncPresentedTurn();
      const turnBeforeReveal = this.presentedTurn();
      if (turnBeforeReveal) this.primeComparison(reinforcement, turnBeforeReveal.opponentCard);
      this.phase.set(PresentationState.CHALLENGE_DRAW);
      this.announce('Reinforcement committed.');
      this.sound.playCardDraw();
      await this.sequencer.pause(360, version);
      this.sound.playCardFlip();
      this.phase.set(PresentationState.CHALLENGE_CLASH);
      this.announce('Reinforcement replaces the beaten card for this comparison.');
      this.eventBus.emit({
        type: 'challenge_accepted',
        turnNumber: this.turnsPlayed,
        challenger: PlayerType.PLAYER,
        reinforcementCard: reinforcement,
      });
      await this.sequencer.pause(500, version);
      const result = this.turnResolution.resolveChallenge(PlayerType.PLAYER);
      this.withholdBoneyard(result);
      const challengeTurn = this.presentedTurn();
      if (challengeTurn) {
        this.resolveComparison(
          reinforcement,
          challengeTurn.opponentCard,
          result.result,
          this.comparison.isSpecialAceVsTwoRule(reinforcement, challengeTurn.opponentCard),
        );
        this.playComparisonResolutionSound(result.result);
      }
      this.announce(result.message);

      const challengerWon = result.winner === PlayerType.PLAYER;
      if (challengerWon) {
        this.playerChallengesWon++;
      }
      const initialCard = this.presentedTurn()?.playerCard;
      const savedTwo = challengerWon && initialCard?.rank === Rank.TWO;
      if (savedTwo) {
        this.twosSavedByChallenge++;
      }
      if (challengerWon && initialCard?.rank === Rank.ACE) {
        this.acesRescuedByChallenge++;
      }
      if (savedTwo && reinforcement.rank === Rank.ACE) {
        this.acesRescuingTwos++;
      }

      const turn = this.presentedTurn();
      if (
        challengerWon &&
        turn &&
        this.comparison.isSpecialAceVsTwoRule(reinforcement, turn.opponentCard) &&
        reinforcement.rank === Rank.TWO
      ) {
        this.acesDefeatedByTwo++;
      }

      if (turn) {
        this.eventBus.emit({
          type: 'challenge_resolved',
          turnNumber: this.turnsPlayed,
          challenger: PlayerType.PLAYER,
          reinforcementCard: reinforcement,
          originalWinnerCard: turn.opponentCard,
          originalBeatenCard: turn.playerCard,
          comparison: result.result,
          winner: result.winner,
          challengerWon,
          message: result.message,
          savedTwo,
        });
        this.speakReaction(
          this.reactions.forChallengeResolution(
            {
              challenger: PlayerType.PLAYER,
              originalBeatenCard: turn.playerCard,
              reinforcementCard: reinforcement,
              originalWinnerCard: turn.opponentCard,
              challengerWon,
            },
            this.opponentCommander(),
          ),
        );
      }

      if (result.winner) {
        await this.playComparisonSkirmish(result.winner, version);
      } else {
        await this.sequencer.pause(420, version, 650);
      }
      await this.continueFromResult(result, version);
    } catch (error) {
      this.handleSequenceError(error);
    }
  }

  private async continueFromResult(result: TurnResult, version: number): Promise<void> {
    if (result.terminalOutcome === GameOutcome.TIE) {
      await this.playTerminalTie(result, version);
      return;
    }

    if (result.canChallenge) {
      if (!this.campaignProgression.canHumanReinforce(this.gameState.playerCardCount())) {
        const concession = this.turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
        this.announce('Reserves exhausted. The position must be conceded.');
        this.eventBus.emit({
          type: 'challenge_conceded',
          turnNumber: this.turnsPlayed,
          loser: PlayerType.PLAYER,
          winner: PlayerType.OPPONENT,
          message: 'Reserves exhausted. The position must be conceded.',
        });
        await this.sequencer.pause(350, version);
        await this.playOrdinarySettlement(concession, version);
        return;
      }

      this.phase.set(PresentationState.PLAYER_CHALLENGE_DECISION);
      this.announce('Your card is beaten. Reinforcement would replace it in the next clash.');
      this.eventBus.emit({
        type: 'challenge_offered',
        turnNumber: this.turnsPlayed,
        defender: PlayerType.PLAYER,
      });
      await this.tutorial.triggerStep(TutorialStep.FIRST_REINFORCEMENT);
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
      defender: PlayerType.OPPONENT,
    });

    for (let dots = 1; dots <= 3; dots++) {
      this.announce(`Reinforce ${'.'.repeat(dots)}`, 'routine');
      await this.sequencer.pause(230, version);
    }

    if (!result.opponentChallenge) {
      this.announce('Opponent concedes.');
      this.eventBus.emit({
        type: 'challenge_conceded',
        turnNumber: this.turnsPlayed,
        loser: PlayerType.OPPONENT,
        winner: PlayerType.PLAYER,
        message: 'Opponent concedes.',
      });
      const concessionReaction = this.reactions.forConcession(this.opponentCommander().id);
      if (concessionReaction) {
        this.speakReaction(concessionReaction);
      }
      await this.sequencer.pause(300, version);
      await this.playOrdinarySettlement(result, version);
      return;
    }

    this.announce('Opponent challenges.');
    await this.sequencer.pause(260, version);
    this.holdFinalBadgeIfDepletedBy(PlayerType.OPPONENT, 1);
    const reinforcement = this.gameState.beginChallenge(PlayerType.OPPONENT);
    if (!reinforcement) {
      const concession = this.turnResolution.resolveChallengeConcession(PlayerType.OPPONENT);
      await this.playOrdinarySettlement(concession, version);
      return;
    }

    if (this.gameState.opponentCardCount() <= 3) {
      const desperateReaction = this.reactions.forDesperateRescue(this.opponentCommander().id);
      if (desperateReaction) {
        this.speakReaction(desperateReaction);
      }
    }


    this.syncPresentedTurn();
    const turnBeforeReveal = this.presentedTurn();
    if (turnBeforeReveal) this.primeComparison(turnBeforeReveal.playerCard, reinforcement);
    this.phase.set(PresentationState.CHALLENGE_DRAW);
    this.announce('Opponent sends reinforcement.');
    this.sound.playCardDraw();
    await this.sequencer.pause(380, version);
    this.sound.playCardFlip();
    this.phase.set(PresentationState.CHALLENGE_CLASH);
    this.eventBus.emit({
      type: 'challenge_accepted',
      turnNumber: this.turnsPlayed,
      challenger: PlayerType.OPPONENT,
      reinforcementCard: reinforcement,
    });
    await this.sequencer.pause(480, version);
    const challengeResult = this.turnResolution.resolveChallenge(PlayerType.OPPONENT);
    this.withholdBoneyard(challengeResult);
    const comparisonTurn = this.presentedTurn();
    if (comparisonTurn) {
      this.resolveComparison(
        comparisonTurn.playerCard,
        reinforcement,
        challengeResult.result,
        this.comparison.isSpecialAceVsTwoRule(comparisonTurn.playerCard, reinforcement),
      );
      this.playComparisonResolutionSound(challengeResult.result);
    }
    this.announce(challengeResult.message);

    const activeTurn = this.presentedTurn();
    if (
      challengeResult.winner === PlayerType.PLAYER &&
      activeTurn &&
      this.comparison.isSpecialAceVsTwoRule(activeTurn.playerCard, reinforcement) &&
      activeTurn.playerCard.rank === Rank.TWO
    ) {
      this.acesDefeatedByTwo++;
    }

    const turn = this.presentedTurn();
    if (turn) {
      this.eventBus.emit({
        type: 'challenge_resolved',
        turnNumber: this.turnsPlayed,
        challenger: PlayerType.OPPONENT,
        reinforcementCard: reinforcement,
        originalWinnerCard: turn.playerCard,
        originalBeatenCard: turn.opponentCard,
        comparison: challengeResult.result,
        winner: challengeResult.winner,
      challengerWon: challengeResult.winner === PlayerType.OPPONENT,
        message: challengeResult.message,
        savedTwo: false,
      });
      this.speakReaction(
        this.reactions.forChallengeResolution(
          {
            challenger: PlayerType.OPPONENT,
            originalBeatenCard: turn.opponentCard,
            reinforcementCard: reinforcement,
            originalWinnerCard: turn.playerCard,
            challengerWon: challengeResult.winner === PlayerType.OPPONENT,
          },
          this.opponentCommander(),
        ),
      );
    }

    if (challengeResult.winner) {
      await this.playComparisonSkirmish(challengeResult.winner, version);
    } else {
      await this.sequencer.pause(420, version, 650);
    }
    await this.continueFromResult(challengeResult, version);
  }

  private async setupBattle(version: number): Promise<void> {
    this.phase.set(PresentationState.BATTLE_SETUP);
    this.comparisonPresentationSignal.set(null);
    const existingLayers = this.gameState.currentState.activeTurn?.battleLayers.length ?? 0;
    if (existingLayers === 0) {
      this.battlesCount++;
      await this.tutorial.triggerStep(TutorialStep.FIRST_BATTLE);
    }
    this.deepestBattleLayer = Math.max(this.deepestBattleLayer, existingLayers + 1);

    this.announce(battleAnnouncementFor(existingLayers + 1));
    this.sound.playClash();
    await this.sequencer.pause(470, version);

    this.holdFinalBadgeIfDepletedBy(PlayerType.PLAYER, 3);
    this.holdFinalBadgeIfDepletedBy(PlayerType.OPPONENT, 3);
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
      layerRound: layer.round,
    });

    this.syncPresentedTurn();
    this.sound.playCardDraw();
    await this.sequencer.pause(520, version);
    this.phase.set(PresentationState.PLAYER_TARGET_SELECTION);
    this.announce(battleTargetInstruction());
    this.sequencer.end(version);
  }

  private async playBattleSelection(selectedOpponentCard: Card): Promise<void> {
    const version = this.sequencer.begin();
    try {
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
        targetIndex: newest.opponentCards.findIndex((c) => c.id === selectedOpponentCard.id),
      });

      this.phase.set(PresentationState.OPPONENT_TARGET_SELECTION);
      this.announce('The foe chooses yours.');

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
        targetIndex: selectedIndex,
      });

      const result = this.turnResolution.resolveBattleSelection(
        selectedOpponentCard.id,
        selectedPlayerCard.id,
      );
      const selection = result.battleSelection;
      if (!selection) {
        throw new Error('Battle resolution did not return its authoritative champion selection');
      }
      // From this point onward every presentation-facing selection mirrors the
      // resolver's immutable physical-card account, never pre-resolution UI state.
      this.selectedOpponentCard.set(selection.opponentCard);
      this.selectedPlayerCard.set(selection.playerCard);
      this.primeComparison(selection.playerCard, selection.opponentCard);
      this.syncPresentedTurn();
      this.pendingHumanTargetId.set(null);
      this.phase.set(PresentationState.BATTLE_REVEAL);
      this.announce('Champions revealed.');
      this.sound.playCardFlip();
      await this.sequencer.pause(560, version);
      this.sound.playClash();

      this.resolveComparison(
        selection.playerCard,
        selection.opponentCard,
        selection.comparison,
        selection.specialRule,
      );
      this.playComparisonResolutionSound(selection.comparison, true);
      this.announce(result.message);
      if (selection.specialRule && selection.winner === PlayerType.PLAYER) {
        this.acesDefeatedByTwo++;
      }

      this.eventBus.emit({
        type: 'battle_cards_revealed',
        turnNumber: this.turnsPlayed,
        layerRound: selection.layerRound,
        playerChosenCard: selection.playerCard,
        opponentChosenCard: selection.opponentCard,
        comparison: selection.comparison,
        winner: selection.winner,
        specialRule: selection.specialRule,
        message: result.message,
        selection,
      });

      if (selection.winner) {
        await this.playComparisonSkirmish(selection.winner, version);
      } else {
        await this.sequencer.pause(500, version, 650);
      }

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
          layerRound: newest.round,
        });
        this.phase.set(PresentationState.BATTLE_TIE);
        await this.sequencer.pause(520, version);
        this.selectedOpponentCard.set(null);
        this.selectedPlayerCard.set(null);
        this.opponentPointer.set(null);
        this.comparisonPresentationSignal.set(null);
        await this.setupBattle(version);
        return;
      }

      await this.playBattleSettlement(result, version);
    } catch (error) {
      this.handleSequenceError(error);
    }
  }

  private async playBattleSettlement(result: TurnResult, version: number): Promise<void> {
    const outcome = result.battleOutcome;
    if (!outcome) throw new Error('A decisive Battle must provide an authoritative outcome');
    const { winner, loser, casualties } = outcome;
    this.phase.set(PresentationState.CASUALTY_REVEAL);

    const lostAce = casualties.some((c) => c.rank === Rank.ACE);
    const lostTwo = casualties.some((c) => c.rank === Rank.TWO);
    if (loser === PlayerType.PLAYER) {
      this.largestBattleLoss = Math.max(this.largestBattleLoss, casualties.length);
      if (lostAce) this.acesLostInBattles++;
      if (lostAce && lostTwo) this.aceAndTwoLostInSameBattle++;
    } else {
      this.largestBattleVictory = Math.max(this.largestBattleVictory, casualties.length);
    }

    if (casualties.length > 0) {
      this.revealedCasualtyIds.set(casualties.map((card) => card.id));
      this.announce(casualtyProgress(casualties.length, casualties.length));
      this.sound.playCardFlip();

      casualties.forEach((card, index) => {
        this.eventBus.emit({
          type: 'casualty_revealed',
          turnNumber: this.turnsPlayed,
          card,
          casualtyIndex: index + 1,
          totalCasualties: casualties.length,
          loser,
          source: result.settlementAttribution?.source,
          decisiveCard: result.settlementAttribution?.decisiveCard,
        });
      });

      const containsMajor = casualties.some(
        (card) => card.rank === Rank.ACE || card.rank === Rank.TWO,
      );
      await this.sequencer.pause(containsMajor ? 440 : 360, version);
    }

    // A casualty-specific quip is safe only after every losing card is public.
    const career = this.authService.userStats();
    const reaction = this.reactions.forBattleLoss(
      loser,
      casualties,
      {
        decisiveCard: result.settlementAttribution?.decisiveCard,
        battleDepth: outcome.battleDepth,
        winnerBattleStreak:
          winner === PlayerType.PLAYER
            ? career.currentBattleWinStreak + 1
            : career.currentBattleLossStreak + 1,
      },
      this.opponentCommander(),
    );
    this.speakReaction(reaction);

    this.eventBus.emit({
      type: 'battle_resolved',
      turnNumber: this.turnsPlayed,
      outcome: this.publicBattleResolution(outcome),
    });

    const winningIds = outcome.winningCards.map((card) => card.id);
    this.returningHomeIds.set(winningIds);
    this.phase.set(PresentationState.RETURN_WINNER_CARDS);
    this.announce(hiddenCardsReturn(outcome.hiddenWinnerCards.length));
    await this.sequencer.pause(380, version);

    this.withheldBoneyardIds.set(casualties.map((card) => card.id));
    this.turnResolution.finalizeBattle(outcome, result.nextPhase === GamePhase.GAME_OVER);
    this.eventBus.emit({
      type: 'cards_returned',
      turnNumber: this.turnsPlayed,
      winner,
      publicCount: outcome.publicWinnerCards.length,
      hiddenCount: outcome.hiddenWinnerCards.length,
    });
    this.movingToBoneyardIds.set(casualties.map((card) => card.id));
    this.phase.set(PresentationState.SEND_LOSER_CARDS_TO_BONEYARD);
    this.announce(cardsToBoneyard(casualties.length));
    this.sound.playBoneyard();
    await this.tutorial.triggerStep(TutorialStep.FIRST_BATTLE_RESOLUTION);
    await this.sequencer.pause(420, version);
    this.eventBus.emit({
      type: 'cards_sent_to_boneyard',
      turnNumber: this.turnsPlayed,
      cards: casualties,
    });
    this.emitSettlementAttribution(result);
    await this.playDeckDefeatPop(loser, version);
    this.withheldBoneyardIds.set([]);
    this.clearPresentedCards();
    await this.finishTurn(version, true);
  }

  private async playComparisonSkirmish(
    winner: PlayerType,
    version: number,
  ): Promise<void> {
    const scene = this.battleAnimationService.request(winner);
    try {
      await this.sequencer.pause(
        scene ? SKIRMISH_ANIMATION_BASE_DURATION_MS : 500,
        version,
        scene?.motion === 'reduced' ? 280 : 650,
        scene?.motion === 'full' ? SKIRMISH_ANIMATION_FAST_MIN_DURATION_MS : 0,
      );
    } finally {
      this.battleAnimationService.clear(scene?.id);
    }
  }

  private async playOrdinarySettlement(result: TurnResult, version: number): Promise<void> {
    this.withholdBoneyard(result);
    const winner = result.winner;
    const loser =
      winner === PlayerType.PLAYER
        ? PlayerType.OPPONENT
        : winner === PlayerType.OPPONENT
          ? PlayerType.PLAYER
          : null;
    if (winner) {
      const winningIds = this.cardsOwnedBy(winner).map((card) => card.id);
      this.returningHomeIds.set(winningIds);
      this.phase.set(PresentationState.RETURN_WINNER_CARDS);
      await this.sequencer.pause(360, version);
      this.eventBus.emit({
        type: 'cards_returned',
        turnNumber: this.turnsPlayed,
        winner,
        publicCount: result.cardsKept.length,
        hiddenCount: 0,
      });
    }
    if (loser && result.cardsLost.length > 0) {
      this.revealedCasualtyIds.set(result.cardsLost.map((card) => card.id));
      this.announce(
        casualtyProgress(result.cardsLost.length, result.cardsLost.length),
        'routine',
      );
      result.cardsLost.forEach((card, index) => {
        this.eventBus.emit({
          type: 'casualty_revealed',
          turnNumber: this.turnsPlayed,
          card,
          casualtyIndex: index + 1,
          totalCasualties: result.cardsLost.length,
          loser,
          source: result.settlementAttribution?.source,
          decisiveCard: result.settlementAttribution?.decisiveCard,
        });
      });
      await this.sequencer.pause(360, version);
    }
    this.movingToBoneyardIds.set(result.cardsLost.map((card) => card.id));
    this.phase.set(PresentationState.SEND_LOSER_CARDS_TO_BONEYARD);
    this.announce(cardsToBoneyard(result.cardsLost.length), 'routine');
    this.sound.playBoneyard();
    await this.sequencer.pause(420, version);
    this.eventBus.emit({
      type: 'cards_sent_to_boneyard',
      turnNumber: this.turnsPlayed,
      cards: result.cardsLost,
    });
    this.emitSettlementAttribution(result);
    if (loser) await this.playDeckDefeatPop(loser, version);
    this.withheldBoneyardIds.set([]);
    this.clearPresentedCards();
    await this.finishTurn(version);
  }

  private async finishTurn(version: number, releaseBattleAchievements = false): Promise<void> {
    if (this.gameState.currentPhase === GamePhase.GAME_OVER) {
      this.finishAtGameOver();
      if (releaseBattleAchievements) {
        this.eventBus.emit({ type: 'battle_presentation_complete', turnNumber: this.turnsPlayed });
      }
      this.sequencer.end(version);
      return;
    }
    this.phase.set(PresentationState.TURN_COMPLETE);
    this.announce('The field is clear.', 'routine');
    await this.sequencer.pause(170, version);
    this.phase.set(PresentationState.READY);
    this.announce('Draw when ready.', 'routine');
    if (this.turnsPlayed === 1) {
      const contextReaction = this.reactions.forContext(this.opponentCommander().id);
      if (contextReaction) {
        this.speakReaction(contextReaction);
      }
    }
    if (releaseBattleAchievements) {
      this.eventBus.emit({ type: 'battle_presentation_complete', turnNumber: this.turnsPlayed });
    }
    this.sequencer.end(version);
  }

  /**
   * Keep every status available to the table API and assistive technology,
   * while reserving the visible stack for semantically significant beats.
   */
  private announce(
    text: string,
    prominence: BattlefieldMessageProminence = 'significant',
  ): void {
    this.gameMessage.set(text);
    if (prominence === 'routine') return;

    const current = this.battlefieldMessagesSignal();
    if (current[0]?.text === text) return;

    const message: BattlefieldMessage = { id: ++this.messageCounter, text };
    this.battlefieldMessagesSignal.set([message, ...current].slice(0, 4));

    setTimeout(() => {
      this.battlefieldMessagesSignal.update((messages) =>
        messages.filter((candidate) => candidate.id !== message.id),
      );
    }, 5200);
  }

  private reactionTimeout: ReturnType<typeof setTimeout> | null = null;

  private speakReaction(reaction: TableReaction | null): void {
    if (!reaction) return;
    const current = this.reaction();
    if (current?.authored && !reaction.authored) return;
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
    this.reaction.set(reaction);
    this.eventBus.emit({
      type: 'quip_spoken',
      turnNumber: this.turnsPlayed,
      speaker: reaction.speaker,
      message: reaction.message,
      category: reaction.category,
    });
    this.reactionTimeout = setTimeout(() => {
      if (this.reaction() === reaction) {
        this.reaction.set(null);
      }
    }, reaction.authored ? 7500 : 5500);
  }


  private emitSettlementAttribution(result: TurnResult): void {
    if (!result.settlementAttribution) return;
    this.eventBus.emit({
      type: 'settlement_resolved',
      turnNumber: this.turnsPlayed,
      attribution: result.settlementAttribution,
    });
  }

  /** Strip every still-hidden winner identity before publishing a Battle event. */
  private publicBattleResolution(outcome: BattleOutcome): PublicBattleResolution {
    const selection = outcome.battleSelection;
    const casualties = Object.freeze([...outcome.casualties]);
    return Object.freeze({
      winner: outcome.winner,
      loser: outcome.loser,
      battleDepth: outcome.battleDepth,
      selection,
      selectedPlayerChampion: selection?.playerCard ?? null,
      selectedOpponentChampion: selection?.opponentCard ?? null,
      casualties,
      casualtyIds: Object.freeze(casualties.map((card) => card.id)),
      hiddenWinnerCount: outcome.hiddenWinnerCards.length,
      publicWinnerCount: outcome.publicWinnerCards.length,
      playerCardsAtStakeCount: outcome.playerCardsAtStake.length,
      opponentCardsAtStakeCount: outcome.opponentCardsAtStake.length,
      finalPlayerDeckCount: outcome.finalPlayerDeckCount,
      finalOpponentDeckCount: outcome.finalOpponentDeckCount,
      finalBoneyardCount: outcome.finalBoneyardCount,
    });
  }

  private primeComparison(playerCard: Card, opponentCard: Card): void {
    this.comparisonPresentationSignal.set({
      player: this.comparisonView(playerCard, opponentCard, 'ready', playerCard.value, 0, false),
      opponent: this.comparisonView(opponentCard, playerCard, 'ready', opponentCard.value, 0, false),
      resolved: false,
    });
  }

  private resolveComparison(
    playerCard: Card,
    opponentCard: Card,
    result: ComparisonResult,
    specialOverride: boolean,
  ): void {
    if (result === ComparisonResult.TIE) {
      this.comparisonPresentationSignal.set({
        player: this.comparisonView(
          playerCard,
          opponentCard,
          'tie',
          0,
          -playerCard.value,
          specialOverride,
        ),
        opponent: this.comparisonView(
          opponentCard,
          playerCard,
          'tie',
          0,
          -opponentCard.value,
          specialOverride,
        ),
        resolved: true,
      });
      return;
    }

    const playerWon = result === ComparisonResult.PLAYER_WINS;
    const winner = playerWon ? playerCard : opponentCard;
    const loser = playerWon ? opponentCard : playerCard;
    // The 2/A override is categorical, not arithmetic: retain the winner's
    // truthful base value and strike the losing Ace directly to zero.
    const winnerRemainder = specialOverride
      ? winner.value
      : Math.max(1, winner.value - loser.value);
    const winnerDamage = specialOverride ? 0 : -loser.value;
    const loserDamage = specialOverride ? -loser.value : -winner.value;
    const playerView = playerWon
      ? this.comparisonView(
          playerCard,
          opponentCard,
          'winner',
          winnerRemainder,
          winnerDamage,
          specialOverride,
        )
      : this.comparisonView(playerCard, opponentCard, 'defeated', 0, loserDamage, specialOverride);
    const opponentView = playerWon
      ? this.comparisonView(opponentCard, playerCard, 'defeated', 0, loserDamage, specialOverride)
      : this.comparisonView(
          opponentCard,
          playerCard,
          'winner',
          winnerRemainder,
          winnerDamage,
          specialOverride,
        );

    this.comparisonPresentationSignal.set({
      player: playerView,
      opponent: opponentView,
      resolved: true,
    });
  }

  private comparisonView(
    card: Card,
    opposingCard: Card,
    state: ComparisonStrengthView['state'],
    current: number,
    damage: number,
    specialOverride: boolean,
  ): ComparisonStrengthView {
    return {
      cardId: card.id,
      base: card.value,
      current,
      damage,
      state,
      specialOverride,
      opposingBase: opposingCard.value,
      opposingRank: opposingCard.rank === Rank.ACE ? 'Ace' : opposingCard.rank,
    };
  }

  private playComparisonResolutionSound(result: ComparisonResult, isBattle = false): void {
    if (result === ComparisonResult.TIE) return;

    if (isBattle) {
      if (result === ComparisonResult.PLAYER_WINS) {
        this.sound.playBattleVictory();
      } else {
        this.sound.playBattleDefeat();
      }
      return;
    }

    if (result === ComparisonResult.PLAYER_WINS) {
      this.sound.playPositiveResolution();
    } else {
      this.sound.playNegativeResolution();
    }
  }

  private async playDeckDefeatPop(owner: PlayerType, version: number): Promise<void> {
    const cardsRemaining =
      owner === PlayerType.PLAYER
        ? this.gameState.playerCardCount()
        : this.gameState.opponentCardCount();
    if (cardsRemaining !== 0) return;

    this.deckDefeatPopOwnerSignal.set(owner);
    this.phase.set(PresentationState.DECK_DEFEAT_POP);
    this.announce('The final reserve is lost.');
    await this.sequencer.pause(300, version);
    this.deckDefeatPopOwnerSignal.set(null);
    if (owner === PlayerType.PLAYER) {
      this.holdPlayerFinalBadgeSignal.set(false);
    } else {
      this.holdOpponentFinalBadgeSignal.set(false);
    }
  }

  private finishAtGameOver(): void {
    if (this.phase() === PresentationState.GAME_OVER) return;
    const outcome = this.gameState.currentState.outcome ?? GameOutcome.TIE;
    this.phase.set(PresentationState.GAME_OVER);
    this.holdPlayerFinalBadgeSignal.set(false);
    this.holdOpponentFinalBadgeSignal.set(false);

    const isComeback =
      outcome === GameOutcome.PLAYER_WIN &&
      this.maxDeficitExperienced >= MODEST_COMEBACK_DEFICIT_THRESHOLD;
    const durationMs = Math.max(1000, Date.now() - this.gameStartTime);
    const pCardsRemaining = this.gameState.playerCardCount();
    const oCardsRemaining = this.gameState.opponentCardCount();

    const warDifferential = pCardsRemaining - oCardsRemaining;
    const isTotalWar = this.campaignProgression.isTotalWar();
    const warIndex = this.campaignProgression.campaignWarIndex();
    const runningCampaignDiff = this.campaignProgression.runningCampaignDifferential() + warDifferential;

    let transition: NarrativeTransitionRecord | undefined;
    let resolutionLine: AuthoredDialogueRecord | undefined;
    let nextCommanderIdentity: CommanderIdentity | undefined;

    if (this.narrativeResolver) {
      const mode = this.campaignProgression.activeCampaignMode();
      const placement =
        warIndex === 1 ? 'after_war_1' : warIndex === 2 ? 'after_war_2' : 'campaign_complete';
      const trans = this.narrativeResolver.transitionFor(mode, placement);
      if (trans) transition = trans;

      const res = this.narrativeResolver.dialogueFor({
        commanderId: this.opponentCommander().id,
        mode,
        warIndex,
        event: 'resolution',
        chapterCompleted: this.campaignProgression.isChapterCompleted(mode),
      });
      if (res) resolutionLine = res;

      if (warIndex < 3) {
        const sched = this.campaignProgression.currentCampaign().commanderSchedule;
        const nextId = sched ? sched[warIndex as 0 | 1 | 2] : null;
        if (nextId) {
          nextCommanderIdentity = getCommanderIdentity(nextId);
        }
      }
    }

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
      maxDeficit: this.maxDeficitExperienced,
      campaignMode: this.campaignProgression.activeCampaignMode(),
      warDifferential,
      runningCampaignDifferential: runningCampaignDiff,
      warIndex,
      commanderIdentity: this.opponentCommanderIdentity(),
      transition,
      resolutionLine,
      nextCommanderIdentity,
    };
    this.gameSummarySignal.set(summary);

    const resultReaction = this.reactions.forResult(this.opponentCommander().id, outcome);
    if (resultReaction) {
      this.speakReaction(resultReaction);
    }

    // Record long-term stats
    this.authService.recordGameResult({
      outcome:
        outcome === GameOutcome.PLAYER_WIN
          ? 'player_win'
          : outcome === GameOutcome.OPPONENT_WIN
            ? 'opponent_win'
            : 'tie',
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
      acesRescuedByChallenge: this.acesRescuedByChallenge,
      acesRescuingTwos: this.acesRescuingTwos,
      acesLostInBattles: this.acesLostInBattles,
      aceAndTwoLostInSameBattle: this.aceAndTwoLostInSameBattle,
      maxDeficitExperienced: this.maxDeficitExperienced,
      isComeback,
    });

    // Preserve the stable War id before telemetry closes its active context.
    const resolvedWarId = this.currentWarId || this.telemetry.currentWarContext()?.warId || '';

    const survivingPlayerCardIds =
      outcome === GameOutcome.PLAYER_WIN
        ? this.gameState.currentPlayerDeck.toArray().map((c) => c.id)
        : [];

    // Emit game_resolved
    this.eventBus.emit({
      type: 'game_resolved',
      turnNumber: this.turnsPlayed,
      outcome,
      turns: this.turnsPlayed,
      playerCardsRemaining: pCardsRemaining,
      opponentCardsRemaining: oCardsRemaining,
      maxDeficitExperienced: this.maxDeficitExperienced,
      isComeback,
      battlesCount: this.battlesCount,
      playerReinforcementsSent: this.playerChallengesCount,
      playerDeckColor: this.gameState.currentPlayerDeckColor,
      survivingPlayerCardIds,
    });

    if (resolvedWarId) {
      this.campaignProgression.recordResolvedWar({
        warId: resolvedWarId,
        outcome,
        playerCardsRemaining: pCardsRemaining,
        opponentCardsRemaining: oCardsRemaining,
        playerDeckColor: this.gameState.currentPlayerDeckColor,
      });
      this.currentWarId = '';
    }

    if (isTotalWar) {
      const signedWar = `${warDifferential >= 0 ? '+' : ''}${warDifferential}`;
      const signedCamp = `${runningCampaignDiff >= 0 ? '+' : ''}${runningCampaignDiff}`;
      if (warIndex < 3) {
        this.announce(`War ${warIndex} complete · War Diff: ${signedWar} · Campaign: ${signedCamp}`);
        if (warDifferential > 0) {
          this.sound.playVictory();
        } else if (warDifferential < 0) {
          this.sound.playDefeat();
        }
      } else {
        const finalMsg =
          runningCampaignDiff > 0
            ? `Total War Campaign Victory · Final Diff: ${signedCamp}`
            : runningCampaignDiff < 0
              ? `Total War Campaign Defeat · Final Diff: ${signedCamp}`
              : `Total War Campaign Draw · Final Diff: ${signedCamp}`;
        this.announce(finalMsg);
        if (runningCampaignDiff > 0) {
          this.sound.playVictory();
        } else if (runningCampaignDiff < 0) {
          this.sound.playDefeat();
        }
      }
    } else {
      if (outcome === GameOutcome.TIE) {
        this.announce('The war ends in a true tie.');
      } else if (outcome === GameOutcome.PLAYER_WIN) {
        this.announce('The war is won.');
        this.sound.playVictory();
      } else {
        this.announce('The war is lost.');
        this.sound.playDefeat();
      }
    }
    void this.tutorial.triggerStep(TutorialStep.FIRST_GAME_CONCLUSION);
  }

  private async playTerminalTie(result: TurnResult, version: number): Promise<void> {
    this.phase.set(PresentationState.BATTLE_TIE);
    this.announce(result.message);
    this.sound.playClash();
    await this.sequencer.pause(600, version, 650);
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
      ? [
          turn.playerCard,
          ...(turn.playerChallengeCard ? [turn.playerChallengeCard] : []),
          ...turn.battleLayers.flatMap((layer) => layer.playerCards),
        ]
      : [
          turn.opponentCard,
          ...(turn.opponentChallengeCard ? [turn.opponentChallengeCard] : []),
          ...turn.battleLayers.flatMap((layer) => layer.opponentCards),
        ];
  }

  private clearPresentedCards(): void {
    this.battleAnimationService.clear();
    this.presentedTurn.set(null);
    this.revealedCasualtyIds.set([]);
    this.movingToBoneyardIds.set([]);
    this.returningHomeIds.set([]);
    this.pendingHumanTargetId.set(null);
    this.selectedOpponentCard.set(null);
    this.selectedPlayerCard.set(null);
    this.opponentPointer.set(null);
    this.comparisonPresentationSignal.set(null);
    this.holdPlayerFinalBadgeSignal.set(false);
    this.holdOpponentFinalBadgeSignal.set(false);
  }

  private holdFinalBadgeIfDepletedBy(owner: PlayerType, drawCount: number): void {
    const count =
      owner === PlayerType.PLAYER
        ? this.gameState.playerCardCount()
        : this.gameState.opponentCardCount();
    if (count !== drawCount) return;
    if (owner === PlayerType.PLAYER) {
      this.holdPlayerFinalBadgeSignal.set(true);
    } else {
      this.holdOpponentFinalBadgeSignal.set(true);
    }
  }

  private isBattlePresentationPhase(): boolean {
    switch (this.phase()) {
      case PresentationState.BATTLE_SETUP:
      case PresentationState.PLAYER_TARGET_SELECTION:
      case PresentationState.OPPONENT_TARGET_SELECTION:
      case PresentationState.BATTLE_REVEAL:
      case PresentationState.BATTLE_TIE:
      case PresentationState.CASUALTY_REVEAL:
      case PresentationState.RETURN_WINNER_CARDS:
      case PresentationState.SEND_LOSER_CARDS_TO_BONEYARD:
      case PresentationState.DECK_DEFEAT_POP:
      case PresentationState.TURN_COMPLETE:
        return true;
      default:
        return false;
    }
  }

  private recentEventCategory():
    | 'clash'
    | 'challenge'
    | 'battle'
    | 'settlement'
    | 'presentation' {
    switch (this.phase()) {
      case PresentationState.DRAWING:
      case PresentationState.CLASH_REVEAL:
      case PresentationState.CLASH_RESOLUTION:
        return 'clash';
      case PresentationState.PLAYER_CHALLENGE_DECISION:
      case PresentationState.OPPONENT_CONSIDERING_CHALLENGE:
      case PresentationState.CHALLENGE_DRAW:
      case PresentationState.CHALLENGE_CLASH:
        return 'challenge';
      case PresentationState.BATTLE_SETUP:
      case PresentationState.PLAYER_TARGET_SELECTION:
      case PresentationState.OPPONENT_TARGET_SELECTION:
      case PresentationState.BATTLE_REVEAL:
      case PresentationState.BATTLE_TIE:
        return 'battle';
      case PresentationState.CASUALTY_REVEAL:
      case PresentationState.RETURN_WINNER_CARDS:
      case PresentationState.SEND_LOSER_CARDS_TO_BONEYARD:
      case PresentationState.DECK_DEFEAT_POP:
        return 'settlement';
      default:
        return 'presentation';
    }
  }

  private withholdBoneyard(result: TurnResult): void {
    if (result.cardsLost.length > 0) {
      this.withheldBoneyardIds.set(result.cardsLost.map((card) => card.id));
    }
  }

  private cardView(
    card: Card,
    owner: PlayerType,
    publicIds: ReadonlySet<string>,
    casualtyIds: ReadonlySet<string>,
    selectedId: string | null,
    eligible: boolean,
  ): TableCardView {
    const isPublic = publicIds.has(card.id) || casualtyIds.has(card.id);
    return {
      id: card.id,
      card: isPublic ? card : null,
      owner,
      faceDown: !isPublic,
      selected: selectedId === card.id,
      eligible,
      casualty: casualtyIds.has(card.id),
      casualtyEmphasis: casualtyIds.has(card.id) ? casualtyEmphasisFor(card) : null,
    };
  }

  private handleSequenceError(error: unknown): void {
    if (error instanceof PresentationSequenceCancelled) return;
    this.recoverFromError(error);
  }

  private recoverFromError(error: unknown): void {
    console.error('Game flow error:', error);
    this.sequencer.cancel();
    this.battleAnimationService.clear();
    this.announce('The table was reset after an invalid game state.');
    this.replaceGame(false);
  }

  /**
   * Directly sets presentation state for deterministic testing / store screenshot generation.
   */
  loadFixtureState(state: {
    readonly phase: PresentationState;
    readonly message: string;
    readonly battlefieldMessages?: readonly BattlefieldMessage[];
    readonly presentedTurn?: ActiveTurn | null;
    readonly comparisonPresentation?: ComparisonPresentation | null;
    readonly gameSummary?: CurrentGameSummary | null;
    readonly reaction?: TableReaction | null;
    readonly turnsPlayed?: number;
    readonly pendingHumanTargetId?: string | null;
    readonly commander?: OpponentCommander | OpponentCommanderId | null;
  }): void {
    this.sequencer.cancel();
    this.phase.set(state.phase);
    this.gameMessage.set(state.message);
    this.battlefieldMessagesSignal.set(
      state.battlefieldMessages ?? [{ id: ++this.messageCounter, text: state.message }]
    );
    this.presentedTurn.set(state.presentedTurn ?? null);
    this.comparisonPresentationSignal.set(state.comparisonPresentation ?? null);
    this.gameSummarySignal.set(state.gameSummary ?? null);
    this.reaction.set(state.reaction ?? null);
    this.turnsPlayed = state.turnsPlayed ?? 1;
    this.pendingHumanTargetId.set(state.pendingHumanTargetId ?? null);
    if (state.commander !== undefined) {
      this.fixtureCommanderSignal.set(
        state.commander
          ? typeof state.commander === 'string'
            ? getCommander(state.commander)
            : state.commander
          : null
      );
    }
  }
}
