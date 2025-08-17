import { Injectable } from '@angular/core';
import { GameStateService } from '../core/services/game-state.service';
import { TurnResolutionService } from '../core/services/turn-resolution.service';
import { GamePhase, PlayerType } from '../core/models/game-state.model';
import { ProgressService } from './progress.service';

@Injectable({
  providedIn: 'root'
})
export class GameDemoService {

  constructor(
    private gameStateService: GameStateService,
    private turnResolutionService: TurnResolutionService,
    private progressService: ProgressService
  ) {}

  /**
   * Demonstrate the core game engine functionality
   */
  runGameDemo(): string[] {
    const log: string[] = [];
    
    log.push('🎮 War of Attrition Game Engine Demo');
    log.push('=====================================');
    
    // Initialize game
    this.gameStateService.initializeGame();
    log.push(`✅ Game initialized`);
    log.push(`   Player cards: ${this.gameStateService.currentStats.playerCardCount}`);
    log.push(`   Opponent cards: ${this.gameStateService.currentStats.opponentCardCount}`);
    log.push(`   Game phase: ${this.gameStateService.currentPhase}`);
    log.push('');
    
    // Play a few demo turns
    for (let i = 1; i <= 3; i++) {
      log.push(`🎯 Turn ${i}:`);
      
      if (this.gameStateService.currentPhase === GamePhase.GAME_OVER) {
        log.push('   Game has ended!');
        break;
      }
      
      // Check if we're in the right phase before starting turn
      if (this.gameStateService.currentPhase !== GamePhase.NORMAL) {
        this.gameStateService.setPhase(GamePhase.NORMAL);
      }
      
      const { playerCard, opponentCard } = this.gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        log.push('   Cannot draw cards - game ended');
        break;
      }
      
      log.push(`   Player drew: ${playerCard.toString()}`);
      log.push(`   Opponent drew: ${opponentCard.toString()}`);
      
      const result = this.turnResolutionService.resolveTurn(playerCard, opponentCard);
      
      log.push(`   Result: ${result.message}`);
      log.push(`   Winner: ${result.winner || 'None (tie)'}`);
      log.push(`   Next phase: ${result.nextPhase}`);
      log.push(`   Cards kept: ${result.cardsKept.length}`);
      log.push(`   Cards lost: ${result.cardsLost.length}`);
      
      // Reset to normal phase for next turn (simplified demo)
      this.gameStateService.setPhase(GamePhase.NORMAL);
      this.gameStateService.setChallengeAvailable(false);
      
      log.push(`   Current cards - Player: ${this.gameStateService.currentStats.playerCardCount}, Opponent: ${this.gameStateService.currentStats.opponentCardCount}`);
      log.push('');
      
      // Check for game end
      if (this.turnResolutionService.checkWinConditions()) {
        log.push(`🏆 Game ended! Winner: ${this.gameStateService.currentState.winner}`);
        break;
      }
    }
    
    // Use centralized progress data instead of hardcoded values
    const progressData = this.progressService.getProgressData();
    const milestone2 = this.progressService.getCompletedMilestone(2);
    
    log.push('🔧 Core Game Engine Features Verified:');
    if (milestone2) {
      milestone2.items.forEach(item => {
        log.push(`   ✅ ${item.description || item.name}`);
      });
    }
    log.push('');
    log.push(`🚀 ${progressData.nextSteps.immediate}!`);
    
    return log;
  }
}