import { Injectable, inject } from '@angular/core';
import { Card } from '../models/card.model';
import { OpponentCommander, OpponentCommanderId } from '../models/commander.model';
import {
  BattleOutcome,
  BattleSelectionOutcome,
  GameOutcome,
  GamePhase,
  PlayerType,
  SettlementAttribution,
  SettlementSource,
} from '../models/game-state.model';
import { GameStateService } from './game-state.service';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';
import { OpponentAIService } from './opponent-ai.service';

export interface TurnResult {
  readonly winner: PlayerType | null;
  readonly result: ComparisonResult;
  readonly message: string;
  readonly cardsLost: readonly Card[];
  /** Only cards whose identities are public are returned here. */
  readonly cardsKept: readonly Card[];
  readonly nextPhase: GamePhase;
  readonly canChallenge: boolean;
  readonly opponentChallenge: boolean;
  readonly opponentConsidered: boolean;
  /** Decisive Battles carry one complete, immutable settlement account. */
  readonly battleOutcome: BattleOutcome | null;
  /** Decisive Battles are presented before their cards are physically settled. */
  readonly pendingBattleSettlement: boolean;
  readonly terminalOutcome: GameOutcome | null;
  /** The exact selected cards and comparison used for this Battle resolution. */
  readonly battleSelection: BattleSelectionOutcome | null;
  /** The decisive physical card responsible for actual Boneyard casualties. */
  readonly settlementAttribution: SettlementAttribution | null;
}

@Injectable({ providedIn: 'root' })
export class TurnResolutionService {
  private readonly gameState = inject(GameStateService);
  private readonly comparison = inject(CardComparisonService);
  private readonly opponentAI = inject(OpponentAIService);

  resolveTurn(
    playerCard: Card,
    opponentCard: Card,
    commander?: OpponentCommander | OpponentCommanderId
  ): TurnResult {
    this.requireCurrentCards(playerCard, opponentCard);
    const result = this.comparison.compareCards(playerCard, opponentCard);
    const special = this.comparison.isSpecialAceVsTwoRule(playerCard, opponentCard);

    if (result === ComparisonResult.TIE) return this.enterBattle('Cards tie. Battle.');

    if (result === ComparisonResult.PLAYER_WINS) {
      const canOpponentChallenge = !special && this.gameState.currentOpponentDeck.count > 0;
      const opponentChallenges =
        canOpponentChallenge &&
        this.opponentAI.shouldChallenge(opponentCard, {
          opposingCard: playerCard,
          ownDeckCount: this.gameState.currentOpponentDeck.count,
          ownCardPool: this.gameState.assignedCardPool(PlayerType.OPPONENT),
          publicCards: this.publicInformation(),
          commander,
        });

      if (canOpponentChallenge) {
        // A legal response remains unresolved until its decision is publicly
        // disclosed. Keep both AI branches physically identical here: no
        // cards return home and no casualty enters the Boneyard yet.
        this.gameState.setPhase(GamePhase.CHALLENGE);
        return this.result({
          winner: null,
          comparison: result,
          message: 'Your card holds. Opponent is considering reinforcement.',
          nextPhase: GamePhase.CHALLENGE,
          opponentChallenge: opponentChallenges,
          opponentConsidered: true,
          cardsKept: [playerCard, opponentCard],
        });
      }
      return this.settle(PlayerType.PLAYER, result, 'Your card survives.', {
        source: 'clash',
        decisiveCard: playerCard,
      });
    }

    if (!special && this.gameState.currentPlayerDeck.count > 0) {
      this.gameState.setPhase(GamePhase.CHALLENGE);
      this.gameState.setChallengeAvailable(true);
      return this.result({
        winner: null,
        comparison: result,
        message: 'Your card is beaten. Send reinforcement?',
        nextPhase: GamePhase.CHALLENGE,
        canChallenge: true,
        cardsKept: [playerCard, opponentCard],
      });
    }
    return this.settle(PlayerType.OPPONENT, result, 'Opponent card survives.', {
      source: 'clash',
      decisiveCard: opponentCard,
    });
  }

  resolveChallengeConcession(loser: PlayerType): TurnResult {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn) throw new Error('No active turn for challenge concession');
    const winner = loser === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    const comparison =
      winner === PlayerType.PLAYER ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS;
    return this.settle(
      winner,
      comparison,
      loser === PlayerType.PLAYER
        ? 'You concede. Your card goes to the Boneyard.'
        : 'Opponent concedes. Their card goes to the Boneyard.',
      {
        source: 'challenge',
        decisiveCard: winner === PlayerType.PLAYER ? turn.playerCard : turn.opponentCard,
      },
    );
  }

  resolveChallenge(challenger: PlayerType): TurnResult {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn) throw new Error('No active turn for challenge resolution');
    const challengeCard =
      challenger === PlayerType.PLAYER ? turn.playerChallengeCard : turn.opponentChallengeCard;
    if (!challengeCard) throw new Error('The challenger has not played a reinforcement');

    const result =
      challenger === PlayerType.PLAYER
        ? this.comparison.compareCards(challengeCard, turn.opponentCard)
        : this.comparison.compareCards(turn.playerCard, challengeCard);

    if (result === ComparisonResult.TIE) {
      return this.enterBattle('Reinforcement ties. Everything stays on the table.');
    }

    const challengerWon =
      challenger === PlayerType.PLAYER
        ? result === ComparisonResult.PLAYER_WINS
        : result === ComparisonResult.OPPONENT_WINS;
    const winner = challengerWon
      ? challenger
      : challenger === PlayerType.PLAYER
        ? PlayerType.OPPONENT
        : PlayerType.PLAYER;
    const originalWinnerCard =
      challenger === PlayerType.PLAYER ? turn.opponentCard : turn.playerCard;
    return this.settle(
      winner,
      result,
      challengerWon
        ? challenger === PlayerType.PLAYER
          ? 'Card rescued. Both cards survive.'
          : 'Opponent rescues their card.'
        : challenger === PlayerType.PLAYER
          ? 'Both are now lost.'
          : 'Both opponent cards are now lost. You hold.',
      {
        source: 'challenge',
        decisiveCard: challengerWon ? challengeCard : originalWinnerCard,
      },
    );
  }

  resolveBattleSelection(
    opponentCardIdChosenByPlayer: string,
    playerCardIdChosenByOpponent: string,
  ): TurnResult {
    const selected = this.gameState.selectNewestBattleTargets(
      opponentCardIdChosenByPlayer,
      playerCardIdChosenByOpponent,
    );
    const comparison = this.comparison.compareCards(selected.playerCard, selected.opponentCard);
    const selection = this.createBattleSelection(selected.playerCard, selected.opponentCard, comparison);
    if (comparison === ComparisonResult.TIE) {
      if (!this.gameState.canDealBattleLayer()) {
        return this.resolveAttrition(selection);
      }
      this.gameState.setPhase(GamePhase.BATTLE);
      return this.result({
        winner: null,
        comparison,
        message: 'Still tied. The stake grows.',
        nextPhase: GamePhase.BATTLE,
        cardsKept: [selected.playerCard, selected.opponentCard],
        battleSelection: selection,
      });
    }

    const winner =
      comparison === ComparisonResult.PLAYER_WINS ? PlayerType.PLAYER : PlayerType.OPPONENT;
    const preview = this.gameState.previewBattleSettlement(winner, selection);
    return this.resultFromPreview(
      preview,
      comparison,
      winner === PlayerType.PLAYER ? 'You win the Battle.' : 'Opponent wins the Battle.',
    );
  }

  finalizeBattle(outcome: BattleOutcome, gameOverAfterSettlement = false): GamePhase {
    this.gameState.settleActiveTurn(outcome.winner, outcome);
    if (gameOverAfterSettlement) {
      this.gameState.endGame(
        outcome.winner === PlayerType.PLAYER ? GameOutcome.PLAYER_WIN : GameOutcome.OPPONENT_WIN,
      );
    }
    return this.gameState.currentPhase;
  }

  checkWinConditions(): boolean {
    return this.gameState.checkGameEndConditions();
  }

  private enterBattle(message: string): TurnResult {
    if (!this.gameState.canDealBattleLayer()) return this.resolveAttrition();
    this.gameState.setPhase(GamePhase.BATTLE);
    return this.result({
      winner: null,
      comparison: ComparisonResult.TIE,
      message,
      nextPhase: GamePhase.BATTLE,
      cardsKept: this.publicInformationOnTable(),
    });
  }

  private resolveAttrition(battleSelection: BattleSelectionOutcome | null = null): TurnResult {
    const turn = this.gameState.currentState.activeTurn;
    const playerRemaining = this.gameState.playerCardCount();
    const opponentRemaining = this.gameState.opponentCardCount();
    const outcome = this.gameState.determineAttritionOutcome();
    const explanation = this.attritionExplanation(playerRemaining, opponentRemaining);
    if (outcome === GameOutcome.TIE) {
      this.gameState.endGame(GameOutcome.TIE);
      return this.result({
        winner: null,
        comparison: ComparisonResult.TIE,
        message: explanation,
        nextPhase: GamePhase.GAME_OVER,
        cardsKept: this.publicInformationOnTable(),
        terminalOutcome: GameOutcome.TIE,
        battleSelection,
      });
    }

    const winner = outcome === GameOutcome.PLAYER_WIN ? PlayerType.PLAYER : PlayerType.OPPONENT;
    if (turn && turn.battleLayers.length > 0) {
      const preview = this.gameState.previewBattleSettlement(winner, battleSelection);
      return this.resultFromPreview(
        preview,
        ComparisonResult.TIE,
        explanation,
        GamePhase.GAME_OVER,
        outcome,
      );
    }
    const stakesBeforeSettlement = {
      player: this.gameState.getStake(PlayerType.PLAYER),
      opponent: this.gameState.getStake(PlayerType.OPPONENT),
    };
    this.gameState.settleAttrition();
    const losingCards =
      winner === PlayerType.PLAYER
        ? stakesBeforeSettlement.opponent
        : stakesBeforeSettlement.player;
    return this.result({
      winner,
      comparison: ComparisonResult.TIE,
      message: explanation,
      nextPhase: GamePhase.GAME_OVER,
      cardsLost: losingCards,
      terminalOutcome: outcome,
    });
  }

  private attritionExplanation(playerRemaining: number, opponentRemaining: number): string {
    const playerCanContinue = playerRemaining >= 3;
    const opponentCanContinue = opponentRemaining >= 3;

    if (playerCanContinue && !opponentCanContinue) {
      return `Opponent overrun — they needed 3 cards to continue the Battle, but only had ${opponentRemaining}.`;
    }
    if (!playerCanContinue && opponentCanContinue) {
      return `Overrun — you needed 3 cards to continue the Battle, but only had ${playerRemaining}.`;
    }
    if (playerRemaining > opponentRemaining) {
      return `Opponent outnumbered — neither side could continue. You had ${playerRemaining} cards remaining to their ${opponentRemaining}.`;
    }
    if (opponentRemaining > playerRemaining) {
      return `Outnumbered — neither side could continue. Opponent had ${opponentRemaining} cards remaining to your ${playerRemaining}.`;
    }
    return `Neither side could continue. Both had ${playerRemaining} cards remaining. The war ends in a true tie.`;
  }

  private settle(
    winner: PlayerType,
    comparison: ComparisonResult,
    message: string,
    options: {
      readonly opponentConsidered?: boolean;
      readonly source?: SettlementSource;
      readonly decisiveCard?: Card;
    } = {},
  ): TurnResult {
    const preview = this.gameState.settleActiveTurn(winner);
    const settlementAttribution =
      options.source && options.decisiveCard
        ? this.createSettlementAttribution(
            options.source,
            winner,
            options.decisiveCard,
            preview.casualties,
            0,
          )
        : null;
    return this.result({
      winner,
      comparison,
      message,
      nextPhase: this.gameState.currentPhase,
      cardsLost: preview.casualties,
      cardsKept: preview.publicWinnerCards,
      opponentConsidered: options.opponentConsidered,
      terminalOutcome: this.gameState.currentState.outcome,
      settlementAttribution,
    });
  }

  private resultFromPreview(
    outcome: BattleOutcome,
    comparison: ComparisonResult,
    message: string,
    nextPhase = GamePhase.NORMAL,
    terminalOutcome: GameOutcome | null = null,
  ): TurnResult {
    return this.result({
      winner: outcome.winner,
      comparison,
      message,
      nextPhase,
      cardsLost: outcome.casualties,
      cardsKept: outcome.publicWinnerCards,
      battleOutcome: outcome,
      pendingBattleSettlement: true,
      terminalOutcome,
      battleSelection: outcome.battleSelection,
      settlementAttribution: this.attributionForBattle(outcome),
    });
  }

  private result(options: {
    winner: PlayerType | null;
    comparison: ComparisonResult;
    message: string;
    nextPhase: GamePhase;
    cardsLost?: readonly Card[];
    cardsKept?: readonly Card[];
    canChallenge?: boolean;
    opponentChallenge?: boolean;
    opponentConsidered?: boolean;
    battleOutcome?: BattleOutcome | null;
    pendingBattleSettlement?: boolean;
    terminalOutcome?: GameOutcome | null;
    battleSelection?: BattleSelectionOutcome | null;
    settlementAttribution?: SettlementAttribution | null;
  }): TurnResult {
    this.gameState.setLastResult(options.comparison);
    return {
      winner: options.winner,
      result: options.comparison,
      message: options.message,
      cardsLost: options.cardsLost ?? [],
      cardsKept: options.cardsKept ?? [],
      nextPhase: options.nextPhase,
      canChallenge: options.canChallenge ?? false,
      opponentChallenge: options.opponentChallenge ?? false,
      opponentConsidered: options.opponentConsidered ?? false,
      battleOutcome: options.battleOutcome ?? null,
      pendingBattleSettlement: options.pendingBattleSettlement ?? false,
      terminalOutcome: options.terminalOutcome ?? null,
      battleSelection: options.battleSelection ?? null,
      settlementAttribution: options.settlementAttribution ?? null,
    };
  }

  private createBattleSelection(
    playerCard: Card,
    opponentCard: Card,
    comparison: ComparisonResult,
  ): BattleSelectionOutcome {
    const winner =
      comparison === ComparisonResult.PLAYER_WINS
        ? PlayerType.PLAYER
        : comparison === ComparisonResult.OPPONENT_WINS
          ? PlayerType.OPPONENT
          : null;
    const layerRound = this.gameState.currentState.activeTurn?.battleLayers.at(-1)?.round;
    if (!layerRound) throw new Error('Battle selection requires an active Battle layer');
    return Object.freeze({
      layerRound,
      playerCard,
      opponentCard,
      playerCardId: playerCard.id,
      opponentCardId: opponentCard.id,
      comparison,
      winner,
      specialRule: this.comparison.isSpecialAceVsTwoRule(playerCard, opponentCard),
    });
  }

  private attributionForBattle(outcome: BattleOutcome): SettlementAttribution | null {
    const selection = outcome.battleSelection;
    if (!selection || selection.winner !== outcome.winner) return null;
    const decisiveCard =
      outcome.winner === PlayerType.PLAYER ? selection.playerCard : selection.opponentCard;
    return this.createSettlementAttribution(
      'battle',
      outcome.winner,
      decisiveCard,
      outcome.casualties,
      outcome.battleDepth,
    );
  }

  private createSettlementAttribution(
    source: SettlementSource,
    winner: PlayerType,
    decisiveCard: Card,
    casualties: readonly Card[],
    battleDepth: number,
  ): SettlementAttribution {
    return Object.freeze({
      source,
      winner,
      loser: winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER,
      decisiveCard,
      casualties: Object.freeze([...casualties]),
      battleDepth,
    });
  }

  private publicInformation(): readonly Card[] {
    return [...this.gameState.currentDiscardPile, ...this.publicInformationOnTable()];
  }

  private publicInformationOnTable(): readonly Card[] {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn) return [];
    const publicIds = new Set(turn.publicCardIds);
    return [
      ...this.gameState.getStake(PlayerType.PLAYER),
      ...this.gameState.getStake(PlayerType.OPPONENT),
    ].filter((card) => publicIds.has(card.id));
  }

  private requireCurrentCards(playerCard: Card, opponentCard: Card): void {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn || turn.playerCard.id !== playerCard.id || turn.opponentCard.id !== opponentCard.id) {
      throw new Error('Turn resolution must use the active cards currently on the table');
    }
  }
}
