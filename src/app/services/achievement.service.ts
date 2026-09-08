import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ACHIEVEMENTS, AchievementDefinition, AchievementClassification } from '../core/models/achievement.model';
import {
  ComparisonResult,
  DeckColor,
  GameOutcome,
  PlayerType,
  SettlementAttribution,
} from '../core/models/game-state.model';
import { Card, Rank } from '../core/models/card.model';
import { AuthService } from '../core/services/auth.service';
import { GameStatistics } from '../core/models/settings.model';
import { PlatformAchievementsService } from '../core/services/platform-achievements.service';
import { GameEvent, GameEventBusService } from './game-event-bus.service';
import { SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD } from './game-controller.service';

export interface AchievementProgress {
  readonly currentBattleWinStreak: number;
  readonly bestBattleWinStreak: number;
  readonly currentBattleLossStreak: number;
  readonly bestBattleLossStreak: number;
  readonly juggernautOccurrences: number;
  readonly juggernautCardIds: readonly string[];
}

type AchievementProgressPersistence = AuthService & {
  updateStatistics?: (
    updates: Partial<GameStatistics> & Partial<AchievementProgress>,
  ) => GameStatistics | void;
  recordAchievementProgress?: (progress: AchievementProgress) => GameStatistics | void;
};

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly authService = inject(AuthService);
  private readonly platformAchievements = inject(PlatformAchievementsService);

  readonly allAchievements = signal<readonly AchievementDefinition[]>(ACHIEVEMENTS);
  readonly latestUnlock = signal<AchievementDefinition | null>(null);
  private readonly battleWinStreak = signal(0);
  private readonly bestBattleWinStreak = signal(0);
  private readonly battleLossStreak = signal(0);
  private readonly bestBattleLossStreak = signal(0);
  private readonly juggernautOccurrences = signal(0);
  private readonly historicJuggernautCardIds = signal<readonly string[]>([]);

  /** Domain state exposed for persistence/profile adapters without leaking mutable collections. */
  readonly achievementProgress = computed<AchievementProgress>(() => ({
    currentBattleWinStreak: this.battleWinStreak(),
    bestBattleWinStreak: this.bestBattleWinStreak(),
    currentBattleLossStreak: this.battleLossStreak(),
    bestBattleLossStreak: this.bestBattleLossStreak(),
    juggernautOccurrences: this.juggernautOccurrences(),
    juggernautCardIds: [...this.historicJuggernautCardIds()],
  }));

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private battlePresentationActive = false;
  private readonly deferredBattleToasts: AchievementDefinition[] = [];
  private readonly toastQueue: AchievementDefinition[] = [];
  private currentPlayerDeckColor: DeckColor | null = null;
  private consecutiveTieComparisons = 0;
  private readonly publicBoneyardCards = new Map<string, Card>();
  private readonly casualtiesByDecisiveCard = new Map<string, Set<string>>();
  private readonly juggernautsThisWar = new Set<string>();
  private readonly anomaliesObservedThisWar = new Set<string>();
  private lastStandardQualifiedThisWar = false;
  private readonly twinAssassinsPairs = new Set<string>();
  private readonly observedDepthsInCurrentBattle = new Set<number>();
  private progressProfileId: string | null = null;

  constructor() {
    this.hydrateAchievementProgress();
    effect(() => {
      const profile = this.authService.activeProfile();
      untracked(() => {
        if (profile.id !== this.progressProfileId) {
          this.currentPlayerDeckColor = null;
          this.publicBoneyardCards.clear();
          this.casualtiesByDecisiveCard.clear();
          this.juggernautsThisWar.clear();
          this.consecutiveTieComparisons = 0;
          this.anomaliesObservedThisWar.clear();
          this.lastStandardQualifiedThisWar = false;
          this.twinAssassinsPairs.clear();
          this.observedDepthsInCurrentBattle.clear();
        }
        // Rehydrate for same-profile statistic resets as well as profile
        // switches. Setting identical signal values is inert, while a reset
        // must immediately clear persisted Battle/Juggernaut records.
        this.hydrateAchievementProgress();
      });
    });
    this.eventBus.events$.subscribe((event) => this.evaluateEvent(event));

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

  getAnomaliesObservedThisWar(): number {
    return Math.min(5, this.anomaliesObservedThisWar.size);
  }

  observe(id: string, turnNumber = 0): void {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;

    if (def.classification === 'anomaly') {
      this.anomaliesObservedThisWar.add(def.id);
    }

    const shouldRepeatObserve =
      def.classification === 'prestige' ||
      def.classification === 'anomaly' ||
      def.id === 'war.wrong_tool_for_job';

    if (shouldRepeatObserve) {
      this.eventBus.emit({
        type: 'achievement_observed',
        turnNumber,
        achievementId: def.id,
        classification: def.classification,
      });
    }

    this.unlock(id, turnNumber);
  }

  unlock(id: string, turnNumber = 0): boolean {
    if (this.isUnlocked(id)) return false;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return false;

    // Persist unlock
    this.authService.unlockAchievement(id);

    // Sync with native platform (safe no-op on web)
    this.platformAchievements.unlockAchievement(id);

    // Battle choices must never compete with achievement banners. Persist and
    // sync immediately, but wait to notify until the table is stable.
    if (this.battlePresentationActive) {
      this.deferredBattleToasts.push(def);
    } else {
      this.enqueueToast(def);
    }

    // Publish event for Story Book
    this.eventBus.emit({
      type: 'achievement_unlocked',
      turnNumber,
      achievementId: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      classification: def.classification,
    });

    return true;
  }

  dismissToast(): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.latestUnlock.set(null);
    this.showNextToast();
  }

  private evaluateEvent(event: GameEvent): void {
    switch (event.type) {
      case 'war_started':
        this.currentPlayerDeckColor = event.playerDeckColor;
        this.publicBoneyardCards.clear();
        this.casualtiesByDecisiveCard.clear();
        this.juggernautsThisWar.clear();
        this.battlePresentationActive = false;
        this.deferredBattleToasts.length = 0;
        this.consecutiveTieComparisons = 0;
        this.anomaliesObservedThisWar.clear();
        this.lastStandardQualifiedThisWar = false;
        this.twinAssassinsPairs.clear();
        this.observedDepthsInCurrentBattle.clear();
        break;

      case 'clash_resolved':
        this.evaluateTieComparison(event.comparison, event.turnNumber);
        // ASSASSIN: Defeat an Ace with a 2
        if (event.specialRule && event.winner === PlayerType.PLAYER) {
          this.unlock('war.assassin', event.turnNumber);
          if (event.playerCard.rank === Rank.TWO && event.opponentCard.rank === Rank.ACE) {
            this.recordTwoOverAce(event.playerCard, event.opponentCard, event.turnNumber);
          }
        }
        break;

      case 'cards_sent_to_boneyard':
        if (event.cards.length > 0) {
          this.unlock('war.first_casualty', event.turnNumber);
        }
        event.cards.forEach((card) => this.publicBoneyardCards.set(card.id, card));
        this.evaluateGraveIntelligence(event.turnNumber);
        break;

      case 'settlement_resolved':
        this.evaluateJuggernaut(event.attribution, event.turnNumber);
        this.evaluateCrippled(event.attribution, event.turnNumber);
        if (
          event.playerCardsRemaining === 1 &&
          event.opponentCardsRemaining !== undefined &&
          event.opponentCardsRemaining >= 15
        ) {
          this.lastStandardQualifiedThisWar = true;
        }
        break;

      case 'challenge_resolved':
        this.evaluateTieComparison(event.comparison, event.turnNumber);
        if (event.challenger === PlayerType.PLAYER && event.challengerWon) {
          this.unlock('war.first_rescue', event.turnNumber);
        }
        // NOT TODAY: Successfully challenge to save a 2
        if (event.challenger === PlayerType.PLAYER && event.challengerWon && event.savedTwo) {
          this.unlock('war.not_today', event.turnNumber);
        }
        if (
          event.challenger === PlayerType.PLAYER &&
          event.challengerWon &&
          event.originalBeatenCard?.rank === Rank.TWO &&
          event.reinforcementCard.rank === Rank.ACE
        ) {
          this.unlock('war.cavalry_came', event.turnNumber);
        }
        if (
          event.winner === PlayerType.PLAYER &&
          ((event.reinforcementCard.rank === Rank.TWO &&
            event.originalWinnerCard.rank === Rank.ACE) ||
            (event.originalWinnerCard.rank === Rank.TWO &&
              event.reinforcementCard.rank === Rank.ACE))
        ) {
          this.unlock('war.assassin', event.turnNumber);
          const humanCard = event.challenger === PlayerType.PLAYER
            ? event.reinforcementCard
            : event.originalWinnerCard;
          const opponentCard = event.challenger === PlayerType.PLAYER
            ? event.originalWinnerCard
            : event.reinforcementCard;
          if (humanCard.rank === Rank.TWO && opponentCard.rank === Rank.ACE) {
            this.recordTwoOverAce(humanCard, opponentCard, event.turnNumber);
          }
        }
        // DEUCE EX MACHINA: Player reveals a 2 as reinforcement against an opponent Ace and defeats it
        if (
          event.challenger === PlayerType.PLAYER &&
          event.challengerWon &&
          event.reinforcementCard.rank === Rank.TWO &&
          event.originalWinnerCard.rank === Rank.ACE
        ) {
          this.unlock('war.deuce_ex_machina', event.turnNumber);
        }
        // SNATCHED FROM THE JAWS OF VICTORY: Player was winning with Ace, opponent reinforces with 2 and defeats it
        if (
          event.challenger === PlayerType.OPPONENT &&
          event.challengerWon &&
          event.reinforcementCard.rank === Rank.TWO &&
          event.originalWinnerCard.rank === Rank.ACE
        ) {
          this.unlock('war.snatched_from_jaws_of_victory', event.turnNumber);
        }
        // WRONG TOOL FOR THE JOB: human player sends a 2 as reinforcement during Challenge and loses outright to 3, 4, or 5
        if (
          event.challenger === PlayerType.PLAYER &&
          event.reinforcementCard.rank === Rank.TWO &&
          !event.challengerWon &&
          !event.escalatedToBattle &&
          [Rank.THREE, Rank.FOUR, Rank.FIVE].includes(event.originalWinnerCard.rank) &&
          (event.winner === PlayerType.OPPONENT || event.comparison === ComparisonResult.OPPONENT_WINS)
        ) {
          this.observe('war.wrong_tool_for_job', event.turnNumber);
        }
        break;

      case 'battle_layer_added':
      case 'battle_started':
        this.battlePresentationActive = true;
        if (event.type === 'battle_started') {
          this.unlock('war.first_battle', event.turnNumber);
          this.observedDepthsInCurrentBattle.clear();
        }
        // DOWN THE RABBIT HOLE: Reach Battle 3
        if (event.layerRound >= 3 && !this.observedDepthsInCurrentBattle.has(3)) {
          this.observedDepthsInCurrentBattle.add(3);
          this.unlock('war.battle_layer_3', event.turnNumber);
        }
        // HOW DEEP DOES THIS GO?: Reach Battle 4
        if (event.layerRound >= 4 && !this.observedDepthsInCurrentBattle.has(4)) {
          this.observedDepthsInCurrentBattle.add(4);
          this.observe('war.battle_layer_4', event.turnNumber);
        }
        // THE ABYSS ANSWERS: Reach Battle 6
        if (event.layerRound >= 6 && !this.observedDepthsInCurrentBattle.has(6)) {
          this.observedDepthsInCurrentBattle.add(6);
          this.observe('war.battle_layer_6', event.turnNumber);
        }
        break;

      case 'battle_cards_revealed':
        this.evaluateTieComparison(event.comparison, event.turnNumber);
        if (
          event.selection.specialRule &&
          event.selection.winner === PlayerType.PLAYER
        ) {
          this.unlock('war.assassin', event.turnNumber);
          this.observe('war.battle_assassin', event.turnNumber);
          if (
            event.selection.playerCard.rank === Rank.TWO &&
            event.selection.opponentCard.rank === Rank.ACE
          ) {
            this.recordTwoOverAce(
              event.selection.playerCard,
              event.selection.opponentCard,
              event.turnNumber
            );
          }
        }
        break;

      case 'battle_resolved': {
        const outcome = event.outcome;
        this.updateBattleStreaks(outcome.winner, event.turnNumber);
        if (outcome.winner === PlayerType.PLAYER) {
          this.unlock('war.first_battle_win', event.turnNumber);
        }
        if (outcome.winner === PlayerType.PLAYER && outcome.battleDepth >= 3) {
          this.observe('war.deep_battle_win', event.turnNumber);
        }
        // MASSACRE: Defeat at least 14 opponent cards in one Battle (retuned from 10)
        if (outcome.winner === PlayerType.PLAYER && outcome.casualties.length >= 14) {
          this.observe('war.massacre', event.turnNumber);
        }
        // ROYAL DISASTER: Lose both an Ace and a 2 in the same Battle
        if (
          outcome.loser === PlayerType.PLAYER &&
          outcome.casualties.some((card) => card.rank === Rank.ACE) &&
          outcome.casualties.some((card) => card.rank === Rank.TWO)
        ) {
          this.unlock('war.royal_disaster', event.turnNumber);
        }
        // Depth checks on resolution as well
        if (outcome.battleDepth >= 3 && !this.observedDepthsInCurrentBattle.has(3)) {
          this.observedDepthsInCurrentBattle.add(3);
          this.unlock('war.battle_layer_3', event.turnNumber);
        }
        if (outcome.battleDepth >= 4 && !this.observedDepthsInCurrentBattle.has(4)) {
          this.observedDepthsInCurrentBattle.add(4);
          this.observe('war.battle_layer_4', event.turnNumber);
        }
        if (outcome.battleDepth >= 6 && !this.observedDepthsInCurrentBattle.has(6)) {
          this.observedDepthsInCurrentBattle.add(6);
          this.observe('war.battle_layer_6', event.turnNumber);
        }
        break;
      }

      case 'battle_presentation_complete':
        this.battlePresentationActive = false;
        while (this.deferredBattleToasts.length > 0) {
          const achievement = this.deferredBattleToasts.shift();
          if (achievement) this.enqueueToast(achievement);
        }
        break;

      case 'game_resolved': {
        const stats = this.authService.activeProfile().statistics;
        const totalResolvedGames = stats.gamesPlayed; // updated after resolution

        if (event.outcome === GameOutcome.PLAYER_WIN) {
          this.unlock('war.first_win', event.turns);
          // PYRRHIC VICTORY: Win with exactly 1 card remaining
          if (event.playerCardsRemaining === 1) {
            this.observe('war.pyrrhic_victory', event.turns);
          }
          // UNTOUCHABLE: Win with at least 18 cards remaining (retuned from 20)
          if (event.playerCardsRemaining >= 18) {
            this.observe('war.untouchable', event.turns);
          }
          // NEVER TELL ME THE ODDS: Win after trailing by at least 15 cards
          if (event.maxDeficitExperienced >= SIGNIFICANT_COMEBACK_DEFICIT_THRESHOLD) {
            this.observe('war.comeback_15', event.turns);
          }
          // NOT A SCRATCH: Win a War without losing a single card (26 cards remaining)
          if (event.playerCardsRemaining === 26) {
            this.observe('war.perfect_victory', event.turns);
          }
          // THE LAST STANDARD: 1 card vs >= 15 settled state followed by win
          if (this.lastStandardQualifiedThisWar) {
            this.observe('war.last_standard', event.turns);
          }
          // AGAINST ARITHMETIC: Win after trailing by at least 20 cards
          if (event.maxDeficitExperienced >= 20) {
            this.observe('war.comeback_20', event.turns);
          }
          if (event.playerReinforcementsSent === 0) {
            this.unlock('war.no_reinforcements_win', event.turns);
          }
        } else if (event.outcome === GameOutcome.OPPONENT_WIN) {
          this.unlock('war.first_defeat', event.turns);
        }

        if (event.turns >= 42) {
          this.observe('war.marathon', event.turns);
        }

        if (event.turns === 51) {
          this.observe('war.turn_51', event.turns);
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

  private evaluateJuggernaut(attribution: SettlementAttribution, turnNumber: number): void {
    if (attribution.winner !== PlayerType.PLAYER || !this.isJuggernautRank(attribution.decisiveCard.rank)) {
      return;
    }

    const cardId = attribution.decisiveCard.id;
    const creditedCasualties = this.casualtiesByDecisiveCard.get(cardId) ?? new Set<string>();
    attribution.casualties.forEach((card) => creditedCasualties.add(card.id));
    this.casualtiesByDecisiveCard.set(cardId, creditedCasualties);

    if (creditedCasualties.size < 3 || this.juggernautsThisWar.has(cardId)) return;

    this.juggernautsThisWar.add(cardId);
    this.juggernautOccurrences.update((count) => count + 1);
    if (!this.historicJuggernautCardIds().includes(cardId)) {
      this.historicJuggernautCardIds.update((ids) => [...ids, cardId]);
    }
    this.persistAchievementProgress();
    this.unlock('war.juggernaut', turnNumber);
  }

  private evaluateCrippled(attribution: SettlementAttribution, turnNumber: number): void {
    if (attribution.winner !== PlayerType.OPPONENT || !this.currentPlayerDeckColor) return;

    const playerIsRed = this.currentPlayerDeckColor === DeckColor.RED;
    const lostPlayerTwoIds = new Set(
      attribution.casualties
        .filter((card) => card.isRed === playerIsRed && card.rank === Rank.TWO)
        .map((card) => card.id),
    );
    if (lostPlayerTwoIds.size === 2) {
      this.unlock('war.crippled', turnNumber);
    }
  }

  private evaluateTieComparison(comparison: string, turnNumber: number): void {
    if (comparison !== 'tie') {
      this.consecutiveTieComparisons = 0;
      return;
    }

    this.consecutiveTieComparisons++;
    if (this.consecutiveTieComparisons >= 3) {
      this.unlock('war.neverending_stalemate', turnNumber);
    }
  }

  private updateBattleStreaks(winner: PlayerType, turnNumber: number): void {
    if (winner === PlayerType.PLAYER) {
      this.battleWinStreak.update((streak) => streak + 1);
      this.bestBattleWinStreak.update((best) => Math.max(best, this.battleWinStreak()));
      this.battleLossStreak.set(0);
      if (this.battleWinStreak() >= 5) this.unlock('war.expert_strategist', turnNumber);
    } else {
      this.battleLossStreak.update((streak) => streak + 1);
      this.bestBattleLossStreak.update((best) => Math.max(best, this.battleLossStreak()));
      this.battleWinStreak.set(0);
      if (this.battleLossStreak() >= 5) this.unlock('war.poor_strategy', turnNumber);
    }
    this.persistAchievementProgress();
  }

  private evaluateGraveIntelligence(turnNumber: number): void {
    if (!this.currentPlayerDeckColor) return;

    const playerIsRed = this.currentPlayerDeckColor === DeckColor.RED;
    const publicCasualties = [...this.publicBoneyardCards.values()];
    const lostPlayerTwoIds = new Set(
      publicCasualties
        .filter((card) => card.isRed === playerIsRed && card.rank === Rank.TWO)
        .map((card) => card.id),
    );
    const bothPlayerTwosLost = lostPlayerTwoIds.size === 2;
    const neitherOpponentAceLost = !publicCasualties.some(
      (card) => card.isRed !== playerIsRed && card.rank === Rank.ACE,
    );
    if (bothPlayerTwosLost && neitherOpponentAceLost) {
      this.unlock('war.grave_intelligence', turnNumber);
    }
  }

  private isJuggernautRank(rank: Rank): boolean {
    return [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK].includes(rank);
  }

  private hydrateAchievementProgress(): void {
    const profile = this.authService.activeProfile();
    const statistics = profile.statistics as GameStatistics &
      Partial<AchievementProgress>;
    this.progressProfileId = profile.id;
    this.battleWinStreak.set(statistics.currentBattleWinStreak ?? 0);
    this.bestBattleWinStreak.set(statistics.bestBattleWinStreak ?? 0);
    this.battleLossStreak.set(statistics.currentBattleLossStreak ?? 0);
    this.bestBattleLossStreak.set(statistics.bestBattleLossStreak ?? 0);
    this.juggernautOccurrences.set(statistics.juggernautOccurrences ?? 0);
    this.historicJuggernautCardIds.set([...(statistics.juggernautCardIds ?? [])]);
  }

  /**
   * Persistence adapter seam. Newer AuthService implementations may expose the
   * purpose-built method; the generic statistics patch remains backwards compatible.
   */
  private persistAchievementProgress(): void {
    const persistence = this.authService as AchievementProgressPersistence;
    const progress = this.achievementProgress();
    if (persistence.recordAchievementProgress) {
      persistence.recordAchievementProgress(progress);
      return;
    }
    persistence.updateStatistics?.(progress);
  }

  private syncIncrementalProgress(resolvedGames: number): void {
    this.platformAchievements.setAchievementSteps('profile.veteran', resolvedGames);
    this.platformAchievements.setAchievementSteps('profile.centurion', resolvedGames);
  }

  private enqueueToast(definition: AchievementDefinition): void {
    this.toastQueue.push(definition);
    this.showNextToast();
  }

  private showNextToast(): void {
    if (this.latestUnlock() || this.toastQueue.length === 0) return;
    const next = this.toastQueue.shift();
    if (!next) return;
    this.latestUnlock.set(next);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.latestUnlock.set(null);
      this.showNextToast();
    }, 4500);
  }

  private recordTwoOverAce(playerTwo: Card, opponentAce: Card, turnNumber: number): void {
    if (!this.isPlayerOwned(playerTwo) || !this.isOpponentOwned(opponentAce)) {
      return;
    }
    this.twinAssassinsPairs.add(`${playerTwo.id}:${opponentAce.id}`);
    if (this.hasTwinAssassinsPairing()) {
      this.observe('war.twin_assassins', turnNumber);
    }
  }

  private isPlayerOwned(card: Card): boolean {
    if (!this.currentPlayerDeckColor) return true;
    return card.isRed === (this.currentPlayerDeckColor === DeckColor.RED);
  }

  private isOpponentOwned(card: Card): boolean {
    if (!this.currentPlayerDeckColor) return true;
    return card.isRed !== (this.currentPlayerDeckColor === DeckColor.RED);
  }

  private hasTwinAssassinsPairing(): boolean {
    const pairs = Array.from(this.twinAssassinsPairs).map((p) => p.split(':'));
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i][0] !== pairs[j][0] && pairs[i][1] !== pairs[j][1]) {
          return true;
        }
      }
    }
    return false;
  }
}
