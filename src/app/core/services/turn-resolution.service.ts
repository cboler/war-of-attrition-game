import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { GamePhase, PlayerType, ActiveTurn } from '../models/game-state.model';
import { GameStateService } from './game-state.service';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';
import { OpponentAIService } from './opponent-ai.service';

export interface TurnResult {
  winner: PlayerType | null;
  result: ComparisonResult;
  message: string;
  cardsLost: Card[];
  cardsKept: Card[];
  nextPhase: GamePhase;
  canChallenge: boolean;
  opponentChallenge?: boolean; // New field to indicate if opponent wants to challenge
}

@Injectable({
  providedIn: 'root'
})
export class TurnResolutionService {

  constructor(
    private gameStateService: GameStateService,
    private cardComparisonService: CardComparisonService,
    private opponentAIService: OpponentAIService
  ) {}

  resolveTurn(playerCard: Card, opponentCard: Card): TurnResult {
    const result = this.cardComparisonService.compareCards(playerCard, opponentCard);
    
    switch (result) {
      case ComparisonResult.PLAYER_WINS:
        return this.resolveNormalWin(playerCard, opponentCard, PlayerType.PLAYER);
      
      case ComparisonResult.OPPONENT_WINS:
        return this.resolveNormalLoss(playerCard, opponentCard, PlayerType.OPPONENT);
      
      case ComparisonResult.TIE:
        return this.resolveTie(playerCard, opponentCard);
    }
  }

  private resolveNormalWin(playerCard: Card, opponentCard: Card, winner: PlayerType): TurnResult {
    const winnerCards = winner === PlayerType.PLAYER ? [playerCard] : [opponentCard];
    const loserCards = winner === PlayerType.PLAYER ? [opponentCard] : [playerCard];
    
    // Check if the loser should challenge
    let canChallenge = false;
    let opponentChallenge = false;
    let message = '';
    
    if (winner === PlayerType.OPPONENT) {
      // Player lost - they can challenge
      canChallenge = true;
      message = 'Opponent wins this turn!';
    } else {
      // Opponent lost - check if AI wants to challenge
      opponentChallenge = this.opponentAIService.shouldChallenge(opponentCard);
      if (opponentChallenge) {
        // Don't process cards yet - let game controller handle opponent challenge
        message = 'You win this turn, but opponent challenges!';
        return {
          winner: null, // No winner yet due to challenge
          result: ComparisonResult.PLAYER_WINS,
          message,
          cardsLost: [],
          cardsKept: [playerCard, opponentCard], // Hold cards for challenge resolution
          nextPhase: GamePhase.CHALLENGE,
          canChallenge: false, // Player can't challenge, but opponent is challenging
          opponentChallenge: true
        };
      } else {
        message = 'You win this turn!';
      }
    }
    
    // Winner keeps their card, loser's card goes to discard
    if (winner === PlayerType.PLAYER) {
      this.gameStateService.returnCardsToPlayerDeck([playerCard]);
    } else {
      this.gameStateService.returnCardsToOpponentDeck([opponentCard]);
    }
    
    this.gameStateService.addToDiscardPile(loserCards);
    
    return {
      winner,
      result: winner === PlayerType.PLAYER ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS,
      message,
      cardsLost: loserCards,
      cardsKept: winnerCards,
      nextPhase: canChallenge ? GamePhase.CHALLENGE : GamePhase.NORMAL,
      canChallenge,
      opponentChallenge: false
    };
  }

  private resolveNormalLoss(playerCard: Card, opponentCard: Card, winner: PlayerType): TurnResult {
    return this.resolveNormalWin(playerCard, opponentCard, winner);
  }

  private resolveTie(playerCard: Card, opponentCard: Card): TurnResult {
    // Check if both players have enough cards for battle
    if (!this.gameStateService.currentPlayerDeck.hasMinimumForBattle || 
        !this.gameStateService.currentOpponentDeck.hasMinimumForBattle) {
      // Can't conduct battle, game ends
      this.gameStateService.endGame();
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: 'Battle cannot be conducted - insufficient cards. Game ends.',
        cardsLost: [playerCard, opponentCard],
        cardsKept: [],
        nextPhase: GamePhase.GAME_OVER,
        canChallenge: false
      };
    }

    // Start battle
    return {
      winner: null,
      result: ComparisonResult.TIE,
      message: 'Cards tie! Preparing for battle...',
      cardsLost: [],
      cardsKept: [playerCard, opponentCard], // These cards are held for battle
      nextPhase: GamePhase.BATTLE,
      canChallenge: false
    };
  }

  resolveChallenge(originalPlayerCard: Card, originalOpponentCard: Card, challengeCard: Card): TurnResult {
    const result = this.cardComparisonService.compareCards(challengeCard, originalOpponentCard);
    
    if (result === ComparisonResult.PLAYER_WINS) {
      // Challenge successful - opponent loses original card, player keeps both cards
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      this.gameStateService.addToDiscardPile([originalOpponentCard]);
      this.gameStateService.returnCardsToPlayerDeck([originalPlayerCard, challengeCard]);
      
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: 'Challenge successful! You keep your cards.',
        cardsLost: [originalOpponentCard],
        cardsKept: [originalPlayerCard, challengeCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else if (result === ComparisonResult.TIE) {
      // Challenge ties - enter Battle with all cards on table preserved/staked
      // Remove opponent's card from deck (it was added during initial turn resolution) so it stays on the table for battle
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: 'Challenge ties! Battle initiated with all cards staked.',
        cardsLost: [],
        cardsKept: [originalPlayerCard, challengeCard, originalOpponentCard],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false
      };
    } else {
      // Challenge failed - player loses both cards, opponent already has their card from initial turn
      this.gameStateService.addToDiscardPile([originalPlayerCard, challengeCard]);
      
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: 'Challenge failed! You lose your cards.',
        cardsLost: [originalPlayerCard, challengeCard],
        cardsKept: [originalOpponentCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    }
  }

  /**
   * Resolve opponent challenge
   * @param originalPlayerCard Player's original card from the turn
   * @param originalOpponentCard Opponent's original card from the turn  
   * @param opponentChallengeCard Opponent's challenge card (drawn automatically)
   */
  resolveOpponentChallenge(originalPlayerCard: Card, originalOpponentCard: Card, opponentChallengeCard: Card): TurnResult {
    const result = this.cardComparisonService.compareCards(opponentChallengeCard, originalPlayerCard);
    
    if (result === ComparisonResult.OPPONENT_WINS) {
      // Opponent challenge successful - player loses original card, opponent keeps both cards
      this.gameStateService.removeCardsFromPlayerDeck([originalPlayerCard]);
      this.gameStateService.addToDiscardPile([originalPlayerCard]);
      this.gameStateService.returnCardsToOpponentDeck([originalOpponentCard, opponentChallengeCard]);
      
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: 'Opponent challenge successful! Opponent keeps their cards.',
        cardsLost: [originalPlayerCard],
        cardsKept: [originalOpponentCard, opponentChallengeCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false,
        opponentChallenge: false
      };
    } else if (result === ComparisonResult.TIE) {
      // Opponent challenge ties - enter Battle with all active cards staked
      // Remove player's card from deck (it was added during initial turn resolution) so it stays on table for battle
      this.gameStateService.removeCardsFromPlayerDeck([originalPlayerCard]);
      
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: 'Opponent challenge ties! Battle initiated with all cards staked.',
        cardsLost: [],
        cardsKept: [originalPlayerCard, originalOpponentCard, opponentChallengeCard],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false,
        opponentChallenge: false
      };
    } else {
      // Opponent challenge failed - opponent loses both cards, player keeps their card
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      this.gameStateService.returnCardsToPlayerDeck([originalPlayerCard]);
      this.gameStateService.addToDiscardPile([originalOpponentCard, opponentChallengeCard]);
      
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: 'Opponent challenge failed! Opponent loses their cards.',
        cardsLost: [originalOpponentCard, opponentChallengeCard],
        cardsKept: [originalPlayerCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false,
        opponentChallenge: false
      };
    }
  }

  resolveBattle(
    originalPlayerCard: Card, 
    originalOpponentCard: Card,
    playerBattleCards: Card[], 
    opponentBattleCards: Card[],
    selectedPlayerCard: Card, 
    selectedOpponentCard: Card
  ): TurnResult {
    const result = this.cardComparisonService.compareCards(selectedPlayerCard, selectedOpponentCard);
    
    const allPlayerCards = [originalPlayerCard, ...playerBattleCards];
    const allOpponentCards = [originalOpponentCard, ...opponentBattleCards];
    
    if (result === ComparisonResult.PLAYER_WINS) {
      // Player wins battle - keeps all their cards, opponent's cards discarded
      this.gameStateService.returnCardsToPlayerDeck(allPlayerCards);
      this.gameStateService.addToDiscardPile(allOpponentCards);
      
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: 'You win the battle! All opponent cards discarded.',
        cardsLost: allOpponentCards,
        cardsKept: allPlayerCards,
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else if (result === ComparisonResult.OPPONENT_WINS) {
      // Opponent wins battle - keeps all their cards, player's cards discarded
      this.gameStateService.addToDiscardPile(allPlayerCards);
      this.gameStateService.returnCardsToOpponentDeck(allOpponentCards);
      
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: 'Opponent wins the battle! All your cards discarded.',
        cardsLost: allPlayerCards,
        cardsKept: allOpponentCards,
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else {
      // Another tie - need another battle if possible
      if (!this.gameStateService.currentPlayerDeck.hasMinimumForBattle || 
          !this.gameStateService.currentOpponentDeck.hasMinimumForBattle) {
        // Can't conduct another battle, game ends
        this.gameStateService.addToDiscardPile([...allPlayerCards, ...allOpponentCards]);
        this.gameStateService.endGame();
        
        return {
          winner: null,
          result: ComparisonResult.TIE,
          message: 'Another tie in battle, but insufficient cards for another battle. Game ends.',
          cardsLost: [...allPlayerCards, ...allOpponentCards],
          cardsKept: [],
          nextPhase: GamePhase.GAME_OVER,
          canChallenge: false
        };
      }
      
      // Continue battle with more cards
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: 'Battle ties again! Another battle required.',
        cardsLost: [],
        cardsKept: [...allPlayerCards, ...allOpponentCards],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false
      };
    }
  }

  checkWinConditions(): boolean {
    return this.gameStateService.checkGameEndConditions();
  }
}