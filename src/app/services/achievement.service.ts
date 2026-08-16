import { Injectable, computed, inject, signal } from '@angular/core';
import { ACHIEVEMENTS, AchievementDefinition, UnlockedAchievement } from '../core/models/achievement.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { AuthService } from '../core/services/auth.service';
import { GameEvent, GameEventBusService } from './game-event-bus.service';
import { SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD } from './game-controller.service';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly authService = inject(AuthService);

  readonly allAchievements = signal<readonly AchievementDefinition[]>(ACHIEVEMENTS);
  readonly latestUnlock = signal<AchievementDefinition | null>(null);

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.eventBus.events$.subscribe(event => this.evaluateEvent(event));
  }

  isUnlocked(id: string): boolean {
    const unlocked = this.authService.activeProfile().statistics.unlockedAchievements || [];
    return unlocked.includes(id);
  }

  unlock(id: string, turnNumber = 0): boolean {
    if (this.isUnlocked(id)) return false;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return false;

    // Persist unlock
    this.authService.unlockAchievement(id);

    // Show toast banner
    this.latestUnlock.set(def);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.latestUnlock.set(null);
    }, 4500);

    // Publish event for Story Book
    this.eventBus.emit({
      type: 'achievement_unlocked',
      turnNumber,
      achievementId: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon
    });

    return true;
  }

  dismissToast(): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.latestUnlock.set(null);
  }

  private evaluateEvent(event: GameEvent): void {
    switch (event.type) {
      case 'clash_resolved':
        // ASSASSIN: Defeat an Ace with a 2
        if (event.specialRule && event.winner === PlayerType.PLAYER) {
          this.unlock('war.assassin', event.turnNumber);
        }
        break;

      case 'challenge_resolved':
        // NOT TODAY: Successfully challenge to save a 2
        if (event.challenger === PlayerType.PLAYER && event.challengerWon && event.savedTwo) {
          this.unlock('war.not_today', event.turnNumber);
        }
        break;

      case 'battle_layer_added':
      case 'battle_started':
        // DOWN THE RABBIT HOLE: Reach Battle Layer 3
        if (event.layerRound >= 3) {
          this.unlock('war.battle_layer_3', event.turnNumber);
        }
        // HOW DEEP DOES THIS GO?: Reach Battle Layer 4
        if (event.layerRound >= 4) {
          this.unlock('war.battle_layer_4', event.turnNumber);
        }
        break;

      case 'battle_resolved':
        // MASSACRE: Defeat at least 10 opponent cards in one Battle
        if (event.winner === PlayerType.PLAYER && event.revealedCasualties.length >= 10) {
          this.unlock('war.massacre', event.turnNumber);
        }
        // ROYAL DISASTER: Lose both an Ace and a 2 in the same Battle
        if (event.loser === PlayerType.PLAYER && event.lostAceAndTwo) {
          this.unlock('war.royal_disaster', event.turnNumber);
        }
        // Layer check on resolution as well
        if (event.layerDepth >= 3) {
          this.unlock('war.battle_layer_3', event.turnNumber);
        }
        if (event.layerDepth >= 4) {
          this.unlock('war.battle_layer_4', event.turnNumber);
        }
        break;

      case 'game_resolved': {
        const stats = this.authService.activeProfile().statistics;
        const totalResolvedGames = stats.gamesPlayed; // updated after resolution

        if (event.outcome === GameOutcome.PLAYER_WIN) {
          // PYRRHIC VICTORY: Win with exactly 1 card remaining
          if (event.playerCardsRemaining === 1) {
            this.unlock('war.pyrrhic_victory', event.turns);
          }
          // UNTOUCHABLE: Win with at least 20 cards remaining
          if (event.playerCardsRemaining >= 20) {
            this.unlock('war.untouchable', event.turns);
          }
          // NEVER TELL ME THE ODDS: Win after trailing by at least 15 cards
          if (event.maxDeficitExperienced >= SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD) {
            this.unlock('war.comeback_15', event.turns);
          }
        }

        // MARATHON: Resolve a game lasting at least 100 turns
        if (event.turns >= 100) {
          this.unlock('war.marathon', event.turns);
        }

        // VETERAN: Complete 25 resolved games
        if (totalResolvedGames >= 25) {
          this.unlock('profile.veteran', event.turns);
        }
        // CENTURION: Complete 100 resolved games
        if (totalResolvedGames >= 100) {
          this.unlock('profile.centurion', event.turns);
        }
        break;
      }
    }
  }
}
