import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { GamePhase, PlayerType, ActiveTurn } from '../models/game-state.model';
import { GameStateService } from './game-state.service';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';

export interface TurnResult {
  winner: PlayerType | null;
  result: ComparisonResult;
  message: string;
  cardsLost: Card[];
  cardsKept: Card[];
  nextPhase: GamePhase;
  canChallenge: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TurnResolutionService {

  constructor(
    private gameStateService: GameStateService,
    private cardComparisonService: CardComparisonService
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
    
    // Winner keeps their card, loser's card goes to discard
    if (winner === PlayerType.PLAYER) {
      this.gameStateService.returnCardsToPlayerDeck([playerCard]);
    } else {
      this.gameStateService.returnCardsToOpponentDeck([opponentCard]);
    }
    
    this.gameStateService.addToDiscardPile(loserCards);
    
    const canChallenge = winner === PlayerType.OPPONENT; // Player can challenge when they lose
    
    return {
      winner,
      result: winner === PlayerType.PLAYER ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS,
      message: winner === PlayerType.PLAYER ? 'You win this turn!' : 'Opponent wins this turn!',
      cardsLost: loserCards,
      cardsKept: winnerCards,
      nextPhase: canChallenge ? GamePhase.CHALLENGE : GamePhase.NORMAL,
      canChallenge
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
      // Challenge successful - player keeps both cards, opponent's card needs to be removed from their deck and discarded
      this.gameStateService.returnCardsToPlayerDeck([originalPlayerCard, challengeCard]);
      
      // Remove opponent's card from their deck (it was added during initial turn resolution) and discard it
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      this.gameStateService.addToDiscardPile([originalOpponentCard]);
      
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: 'Challenge successful! You keep your cards.',
        cardsLost: [originalOpponentCard],
        cardsKept: [originalPlayerCard, challengeCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else {
      // Challenge failed - player loses both cards, opponent already has their card from initial turn
      this.gameStateService.addToDiscardPile([originalPlayerCard, challengeCard]);
      // Note: originalOpponentCard was already returned to opponent deck during initial turn resolution
      
      return {
        winner: PlayerType.OPPONENT,
        result: result === ComparisonResult.TIE ? ComparisonResult.TIE : ComparisonResult.OPPONENT_WINS,
        message: result === ComparisonResult.TIE ? 
          'Challenge ties! You lose your cards.' : 
          'Challenge failed! You lose your cards.',
        cardsLost: [originalPlayerCard, challengeCard],
        cardsKept: [originalOpponentCard],
        nextPhase: result === ComparisonResult.TIE ? GamePhase.BATTLE : GamePhase.NORMAL,
        canChallenge: false
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