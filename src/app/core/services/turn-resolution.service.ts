import { Injectable, inject } from '@angular/core';
import { Card } from '../models/card.model';
import { GamePhase, PlayerType } from '../models/game-state.model';
import { BattleSettlementPreview, GameStateService } from './game-state.service';
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
  readonly casualtyRevealCards: readonly Card[];
  readonly hiddenWinnerCardCount: number;
  /** Decisive Battles are presented before their cards are physically settled. */
  readonly pendingBattleSettlement: boolean;
}

@Injectable({ providedIn: 'root' })
export class TurnResolutionService {
  private readonly gameState = inject(GameStateService);
  private readonly comparison = inject(CardComparisonService);
  private readonly opponentAI = inject(OpponentAIService);

  resolveTurn(playerCard: Card, opponentCard: Card): TurnResult {
    this.requireCurrentCards(playerCard, opponentCard);
    const result = this.comparison.compareCards(playerCard, opponentCard);
    const special = this.comparison.isSpecialAceVsTwoRule(playerCard, opponentCard);

    if (result === ComparisonResult.TIE) return this.enterBattle('Cards tie. Battle.');

    if (result === ComparisonResult.PLAYER_WINS) {
      const canOpponentChallenge = !special && this.gameState.currentOpponentDeck.count > 0;
      const opponentChallenges = canOpponentChallenge && this.opponentAI.shouldChallenge(
        opponentCard,
        {
          opposingCard: playerCard,
          ownDeck: this.gameState.currentOpponentDeck.toArray(),
          publicCards: this.publicInformation()
        }
      );
      if (opponentChallenges) {
        this.gameState.setPhase(GamePhase.CHALLENGE);
        return this.result({
          winner: null,
          comparison: result,
          message: 'Your card holds. Opponent is considering reinforcement.',
          nextPhase: GamePhase.CHALLENGE,
          opponentChallenge: true,
          opponentConsidered: true,
          cardsKept: [playerCard, opponentCard]
        });
      }
      return this.settle(PlayerType.PLAYER, result, 'Your card survives.', true);
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
        cardsKept: [playerCard, opponentCard]
      });
    }
    return this.settle(PlayerType.OPPONENT, result, 'Opponent card survives.');
  }

  resolveChallengeConcession(loser: PlayerType): TurnResult {
    const winner = loser === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    const comparison = winner === PlayerType.PLAYER
      ? ComparisonResult.PLAYER_WINS
      : ComparisonResult.OPPONENT_WINS;
    return this.settle(winner, comparison, loser === PlayerType.PLAYER
      ? 'You concede. Your card goes to the Boneyard.'
      : 'Opponent concedes. Their card goes to the Boneyard.');
  }

  resolveChallenge(challenger: PlayerType): TurnResult {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn) throw new Error('No active turn for challenge resolution');
    const challengeCard = challenger === PlayerType.PLAYER
      ? turn.playerChallengeCard
      : turn.opponentChallengeCard;
    if (!challengeCard) throw new Error('The challenger has not played a reinforcement');

    const result = challenger === PlayerType.PLAYER
      ? this.comparison.compareCards(challengeCard, turn.opponentCard)
      : this.comparison.compareCards(turn.playerCard, challengeCard);

    if (result === ComparisonResult.TIE) {
      return this.enterBattle('Reinforcement ties. Everything stays on the table.');
    }

    const challengerWon = challenger === PlayerType.PLAYER
      ? result === ComparisonResult.PLAYER_WINS
      : result === ComparisonResult.OPPONENT_WINS;
    const winner = challengerWon
      ? challenger
      : challenger === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
    return this.settle(
      winner,
      result,
      challengerWon
        ? challenger === PlayerType.PLAYER
          ? 'Reinforcement holds. You save both cards.'
          : 'Opponent reinforcement holds.'
        : challenger === PlayerType.PLAYER
          ? 'Reinforcement falls. Both of your cards are lost.'
          : 'Opponent reinforcement falls. You hold.'
    );
  }

  resolveBattleSelection(
    opponentCardIdChosenByPlayer: string,
    playerCardIdChosenByOpponent: string
  ): TurnResult {
    const selected = this.gameState.selectNewestBattleTargets(
      opponentCardIdChosenByPlayer,
      playerCardIdChosenByOpponent
    );
    const comparison = this.comparison.compareCards(selected.playerCard, selected.opponentCard);
    if (comparison === ComparisonResult.TIE) {
      if (!this.gameState.canDealBattleLayer()) {
        return this.resolveAttrition('Battle ties, but there are not three more cards to stake.');
      }
      this.gameState.setPhase(GamePhase.BATTLE);
      return this.result({
        winner: null,
        comparison,
        message: 'Still tied. The stake grows.',
        nextPhase: GamePhase.BATTLE,
        cardsKept: [selected.playerCard, selected.opponentCard]
      });
    }

    const winner = comparison === ComparisonResult.PLAYER_WINS
      ? PlayerType.PLAYER
      : PlayerType.OPPONENT;
    const preview = this.gameState.previewBattleSettlement(winner);
    return this.resultFromPreview(
      preview,
      comparison,
      winner === PlayerType.PLAYER ? 'You win the Battle.' : 'Opponent wins the Battle.'
    );
  }

  finalizeBattle(winner: PlayerType, gameOverAfterSettlement = false): GamePhase {
    this.gameState.settleActiveTurn(winner);
    if (gameOverAfterSettlement) this.gameState.endGame(winner);
    return this.gameState.currentPhase;
  }

  checkWinConditions(): boolean {
    return this.gameState.checkGameEndConditions();
  }

  private enterBattle(message: string): TurnResult {
    if (!this.gameState.canDealBattleLayer()) return this.resolveAttrition(message);
    this.gameState.setPhase(GamePhase.BATTLE);
    return this.result({
      winner: null,
      comparison: ComparisonResult.TIE,
      message,
      nextPhase: GamePhase.BATTLE,
      cardsKept: this.publicInformationOnTable()
    });
  }

  private resolveAttrition(message: string): TurnResult {
    const turn = this.gameState.currentState.activeTurn;
    if (turn && turn.battleLayers.length > 0) {
      const winner = this.gameState.determineAttritionWinner();
      const preview = this.gameState.previewBattleSettlement(winner);
      return this.resultFromPreview(
        preview,
        ComparisonResult.TIE,
        `${message} ${winner === PlayerType.PLAYER ? 'You win' : 'Opponent wins'} by attrition.`,
        GamePhase.GAME_OVER
      );
    }
    const stakesBeforeSettlement = {
      player: this.gameState.getStake(PlayerType.PLAYER),
      opponent: this.gameState.getStake(PlayerType.OPPONENT)
    };
    const winner = this.gameState.settleAttritionLoss();
    const losingCards = winner === PlayerType.PLAYER
      ? stakesBeforeSettlement.opponent
      : stakesBeforeSettlement.player;
    return this.result({
      winner,
      comparison: ComparisonResult.TIE,
      message: `${message} ${winner === PlayerType.PLAYER ? 'You win' : 'Opponent wins'} by attrition.`,
      nextPhase: GamePhase.GAME_OVER,
      cardsLost: losingCards
    });
  }

  private settle(
    winner: PlayerType,
    comparison: ComparisonResult,
    message: string,
    opponentConsidered = false
  ): TurnResult {
    const preview = this.gameState.settleActiveTurn(winner);
    return this.result({
      winner,
      comparison,
      message,
      nextPhase: this.gameState.currentPhase,
      cardsLost: preview.losingCards,
      cardsKept: preview.publicWinnerCards,
      opponentConsidered
    });
  }

  private resultFromPreview(
    preview: BattleSettlementPreview,
    comparison: ComparisonResult,
    message: string,
    nextPhase = GamePhase.NORMAL
  ): TurnResult {
    return this.result({
      winner: preview.winner,
      comparison,
      message,
      nextPhase,
      cardsLost: preview.losingCards,
      cardsKept: preview.publicWinnerCards,
      casualtyRevealCards: preview.casualtyRevealCards,
      hiddenWinnerCardCount: preview.hiddenWinnerCardCount,
      pendingBattleSettlement: true
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
    casualtyRevealCards?: readonly Card[];
    hiddenWinnerCardCount?: number;
    pendingBattleSettlement?: boolean;
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
      casualtyRevealCards: options.casualtyRevealCards ?? [],
      hiddenWinnerCardCount: options.hiddenWinnerCardCount ?? 0,
      pendingBattleSettlement: options.pendingBattleSettlement ?? false
    };
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
      ...this.gameState.getStake(PlayerType.OPPONENT)
    ].filter(card => publicIds.has(card.id));
  }

  private requireCurrentCards(playerCard: Card, opponentCard: Card): void {
    const turn = this.gameState.currentState.activeTurn;
    if (!turn || turn.playerCard.id !== playerCard.id || turn.opponentCard.id !== opponentCard.id) {
      throw new Error('Turn resolution must use the active cards currently on the table');
    }
  }
}
