import { Injectable, computed, inject, signal } from '@angular/core';
import { ACHIEVEMENTS, AchievementDefinition } from '../core/models/achievement.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { Rank } from '../core/models/card.model';
import { AuthService } from '../core/services/auth.service';
import { PlatformAchievementsService } from '../core/services/platform-achievements.service';
import { GameEvent, GameEventBusService } from './game-event-bus.service';
import { SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD } from './game-controller.service';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly authService = inject(AuthService);
  private readonly platformAchievements = inject(PlatformAchievementsService);

  readonly allAchievements = signal<readonly AchievementDefinition[]>(ACHIEVEMENTS);
  readonly latestUnlock = signal<AchievementDefinition | null>(null);

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.eventBus.events$.subscribe(event => this.evaluateEvent(event));
    
    // Reconcile existing unlocks with native platform on startup
    const existing = this.authService.activeProfile().statistics.unlockedAchievements || [];
    if (existing.length > 0) {
      this.platformAchievements.reconcileUnlockedAchievements(existing);
    }
    this.reconcileResolvedGameMilestones();
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

    // Sync with native platform (safe no-op on web)
    this.platformAchievements.unlockAchievement(id);

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

      case 'cards_sent_to_boneyard':
        if (event.cards.length > 0) {
          this.unlock('war.first_casualty', event.turnNumber);
        }
        break;

      case 'challenge_resolved':
        if (event.challenger === PlayerType.PLAYER && event.challengerWon) {
          this.unlock('war.first_rescue', event.turnNumber);
        }
        // NOT TODAY: Successfully challenge to save a 2
        if (event.challenger === PlayerType.PLAYER && event.challengerWon && event.savedTwo) {
          this.unlock('war.not_today', event.turnNumber);
        }
        if (
          event.winner === PlayerType.PLAYER &&
          ((event.reinforcementCard.rank === Rank.TWO && event.originalWinnerCard.rank === Rank.ACE) ||
            (event.originalWinnerCard.rank === Rank.TWO && event.reinforcementCard.rank === Rank.ACE))
        ) {
          this.unlock('war.assassin', event.turnNumber);
        }
        break;

      case 'battle_layer_added':
      case 'battle_started':
        if (event.type === 'battle_started') {
          this.unlock('war.first_battle', event.turnNumber);
        }
        // DOWN THE RABBIT HOLE: Reach Battle 3 (stable ID retains "layer")
        if (event.layerRound >= 3) {
          this.unlock('war.battle_layer_3', event.turnNumber);
        }
        // HOW DEEP DOES THIS GO?: Reach Battle 4 (stable ID retains "layer")
        if (event.layerRound >= 4) {
          this.unlock('war.battle_layer_4', event.turnNumber);
        }
        break;

      case 'battle_cards_revealed':
        if (event.specialRule && event.winner === PlayerType.PLAYER) {
          this.unlock('war.assassin', event.turnNumber);
        }
        break;

      case 'battle_resolved':
        // MASSACRE: Defeat at least 10 opponent cards in one Battle
        if (event.winner === PlayerType.PLAYER) {
          this.unlock('war.first_battle_win', event.turnNumber);
        }
        if (event.winner === PlayerType.PLAYER && event.layerDepth >= 3) {
          this.unlock('war.deep_battle_win', event.turnNumber);
        }
        if (event.winner === PlayerType.PLAYER && event.totalCardsAtStake >= 10) {
          this.unlock('war.massacre', event.turnNumber);
        }
        // ROYAL DISASTER: Lose both an Ace and a 2 in the same Battle
        if (event.loser === PlayerType.PLAYER && event.lostAceAndTwo) {
          this.unlock('war.royal_disaster', event.turnNumber);
        }
        // Depth check on resolution as well
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
          this.unlock('war.first_win', event.turns);
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
          if (event.playerReinforcementsSent === 0) {
            this.unlock('war.no_reinforcements_win', event.turns);
          }
        } else if (event.outcome === GameOutcome.OPPONENT_WIN) {
          this.unlock('war.first_defeat', event.turns);
        }

        if (event.turns >= 40) {
          this.unlock('war.marathon', event.turns);
        }

        if (event.battlesCount >= 5) {
          this.unlock('war.five_battles_game', event.turns);
        }

        if (totalResolvedGames >= 10) {
          this.unlock('profile.campaigner', event.turns);
        }

        // VETERAN: Complete 25 resolved games
        if (totalResolvedGames >= 25) {
          this.unlock('profile.veteran', event.turns);
        }
        // CENTURION: Complete 100 resolved games
        if (totalResolvedGames >= 100) {
          this.unlock('profile.centurion', event.turns);
        }
        this.syncIncrementalProgress(totalResolvedGames);
        break;
      }
    }
  }

  private reconcileResolvedGameMilestones(): void {
    const resolvedGames = this.authService.activeProfile().statistics.gamesPlayed || 0;
    if (resolvedGames >= 10) this.unlock('profile.campaigner');
    if (resolvedGames >= 25) this.unlock('profile.veteran');
    if (resolvedGames >= 100) this.unlock('profile.centurion');
    this.syncIncrementalProgress(resolvedGames);
  }

  private syncIncrementalProgress(resolvedGames: number): void {
    this.platformAchievements.setAchievementSteps('profile.veteran', resolvedGames);
    this.platformAchievements.setAchievementSteps('profile.centurion', resolvedGames);
  }
}
