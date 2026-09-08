import { Injectable, inject } from '@angular/core';
import { GameEventBusService } from './game-event-bus.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { PlatformGameStatsService } from '../core/services/platform-game-stats.service';
import { AuthService } from '../core/services/auth.service';
import { AchievementService } from './achievement.service';
import {
  GameEvent,
  TurnStartedEvent,
  ClashResolvedEvent,
  ChallengeResolvedEvent,
  BattleStartedEvent,
  BattleLayerAddedEvent,
  BattleCardsRevealedEvent,
  GameResolvedEvent
} from '../core/models/game-events.model';
import {
  ComparisonResult,
  GameOutcome,
  PlayerType
} from '../core/models/game-state.model';
import { Rank } from '../core/models/card.model';
import {
  calculateWarMargin,
  serializeCampaignModifiers
} from '../core/models/progression.model';
import {
  GameStatsCommanderId,
  GameStatsCampaignKind,
  GameStatsCampaignMode,
  GameStatsCampaignModifiers,
  GameStatsOutcome,
  validateWarCompletedPayload
} from '../core/models/game-stats.model';
import { environment } from '../../environments/environment';

interface FrozenWarContext {
  readonly commander_id: GameStatsCommanderId;
  readonly campaign_kind: GameStatsCampaignKind;
  readonly campaign_mode: GameStatsCampaignMode;
  readonly campaign_modifiers: GameStatsCampaignModifiers;
  readonly campaign_war_index: 1 | 2 | 3;
  readonly reserves_at_war_start?: number;
  readonly ruleset_version: string;
  readonly app_version: string;
}

@Injectable({ providedIn: 'root' })
export class GameStatsProjectionService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly campaignProgression = inject(CampaignProgressionService);
  private readonly platformGameStats = inject(PlatformGameStatsService);
  private readonly authService = inject(AuthService);
  private readonly achievementService = inject(AchievementService);

  private currentWarId: string | null = null;
  private frozenContext: FrozenWarContext | null = null;
  private isEligible = false;
  private hasEmittedForCurrentWar = false;
  private profileIdAtStart: string | null = null;

  // In-memory per-War accumulators
  private deepestBattle = 0;
  private successfulReinforcements = 0;
  private acesFelledByTwos = 0;

  constructor() {
    this.eventBus.events$.subscribe(event => this.handleGameEvent(event));
  }

  /**
   * Integration point wired from Controller beginWarWhenOrdersReady().
   * Resets accumulators and sets the active War correlation ID.
   */
  beginWar(warId: string): void {
    this.currentWarId = warId;
    this.frozenContext = null;
    this.isEligible = false;
    this.hasEmittedForCurrentWar = false;
    this.profileIdAtStart = this.authService.activeProfile().id;
    this.deepestBattle = 0;
    this.successfulReinforcements = 0;
    this.acesFelledByTwos = 0;
  }

  getCurrentWarId(): string | null {
    return this.currentWarId;
  }

  getDeepestBattle(): number {
    return this.deepestBattle;
  }

  getSuccessfulReinforcements(): number {
    return this.successfulReinforcements;
  }

  getAcesFelledByTwos(): number {
    return this.acesFelledByTwos;
  }

  isCurrentWarEligible(): boolean {
    return this.isEligible;
  }

  private handleGameEvent(event: GameEvent): void {
    switch (event.type) {
      case 'turn_started':
        this.onTurnStarted(event);
        break;

      case 'battle_started':
      case 'battle_layer_added':
        this.onBattleLayer(event);
        break;

      case 'challenge_resolved':
        this.onChallengeResolved(event);
        break;

      case 'clash_resolved':
        this.onClashResolved(event);
        break;

      case 'battle_cards_revealed':
        this.onBattleCardsRevealed(event);
        break;

      case 'game_resolved':
        this.onGameResolved(event);
        break;

      case 'game_abandoned':
        this.resetState();
        break;
    }
  }

  private onTurnStarted(_event: TurnStartedEvent): void {
    if (!this.currentWarId || this.frozenContext !== null) {
      return;
    }

    // Require orders to be selected before freezing context
    const ordersReady =
      this.campaignProgression.ordersSelected() ||
      this.campaignProgression.campaignWarIndex() > 1;

    if (!ordersReady) {
      return;
    }

    const currentCommanderId = this.campaignProgression.currentCommanderId() as GameStatsCommanderId;
    const isCustom = this.campaignProgression.isAllChaptersCompleted();
    const mode = this.campaignProgression.activeCampaignMode() as GameStatsCampaignMode;
    const rawModifiers = this.campaignProgression.activeCampaignModifiers();
    const serializedModifiers = serializeCampaignModifiers(rawModifiers) as GameStatsCampaignModifiers;
    const warIndex = this.campaignProgression.campaignWarIndex() as 1 | 2 | 3;
    const hasLimitedReserves = serializedModifiers.includes('limited_reserves');
    const startingReserves = hasLimitedReserves
      ? (this.campaignProgression.remainingReserves() ?? 0)
      : undefined;

    this.frozenContext = {
      commander_id: currentCommanderId,
      campaign_kind: isCustom ? 'custom' : 'story',
      campaign_mode: mode,
      campaign_modifiers: serializedModifiers,
      campaign_war_index: warIndex,
      ...(startingReserves !== undefined ? { reserves_at_war_start: startingReserves } : {}),
      ruleset_version: environment.rulesetVersion,
      app_version: environment.appVersion
    };

    // Lock eligibility at the first turn boundary
    const isProfileSame = this.authService.activeProfile().id === this.profileIdAtStart;
    this.isEligible = isProfileSame && this.platformGameStats.canRecordGameStats();
  }

  private onBattleLayer(event: BattleStartedEvent | BattleLayerAddedEvent): void {
    if (event.layerRound > this.deepestBattle) {
      this.deepestBattle = event.layerRound;
    }
  }

  private onChallengeResolved(event: ChallengeResolvedEvent): void {
    // 1. Successful reinforcement counter: human challenger won outright
    if (event.challenger === PlayerType.PLAYER && event.comparison === ComparisonResult.PLAYER_WINS) {
      this.successfulReinforcements++;
    }

    // 2. Two-over-Ace counter: orient cards by challenger
    // Human challenger uses reinforcementCard vs opponent's originalWinnerCard
    // Opponent challenger uses originalWinnerCard (human) vs opponent's reinforcementCard
    const humanCard = event.challenger === PlayerType.PLAYER
      ? event.reinforcementCard
      : event.originalWinnerCard;
    const opponentCard = event.challenger === PlayerType.PLAYER
      ? event.originalWinnerCard
      : event.reinforcementCard;

    if (
      event.comparison === ComparisonResult.PLAYER_WINS &&
      humanCard.rank === Rank.TWO &&
      opponentCard.rank === Rank.ACE
    ) {
      this.acesFelledByTwos++;
    }
  }

  private onClashResolved(event: ClashResolvedEvent): void {
    if (
      event.comparison === ComparisonResult.PLAYER_WINS &&
      event.specialRule &&
      event.playerCard.rank === Rank.TWO &&
      event.opponentCard.rank === Rank.ACE
    ) {
      this.acesFelledByTwos++;
    }
  }

  private onBattleCardsRevealed(event: BattleCardsRevealedEvent): void {
    const sel = event.selection;
    if (
      sel &&
      sel.comparison === ComparisonResult.PLAYER_WINS &&
      sel.specialRule &&
      sel.playerCard.rank === Rank.TWO &&
      sel.opponentCard.rank === Rank.ACE
    ) {
      this.acesFelledByTwos++;
    }
  }

  private onGameResolved(event: GameResolvedEvent): void {
    if (!this.currentWarId || this.hasEmittedForCurrentWar) {
      return;
    }

    // Must be eligible, non-abandoned, with frozen context and matching profile
    const profileMatch = this.authService.activeProfile().id === this.profileIdAtStart;
    if (!this.isEligible || !this.frozenContext || !profileMatch) {
      this.hasEmittedForCurrentWar = true;
      return;
    }

    const outcome: GameStatsOutcome =
      event.outcome === GameOutcome.PLAYER_WIN
        ? 'player_win'
        : event.outcome === GameOutcome.OPPONENT_WIN
          ? 'opponent_win'
          : 'tie';

    const playerWin = outcome === 'player_win' ? 1 : 0;
    const comebackDeficit =
      outcome === 'player_win' && event.maxDeficitExperienced >= 3
        ? event.maxDeficitExperienced
        : 0;

    const warMargin = calculateWarMargin({
      warId: this.currentWarId,
      outcome: event.outcome,
      playerCardsRemaining: event.playerCardsRemaining,
      opponentCardsRemaining: event.opponentCardsRemaining
    });

    const candidate = {
      stats_schema_version: 1,
      ruleset_version: this.frozenContext.ruleset_version,
      app_version: this.frozenContext.app_version,
      commander_id: this.frozenContext.commander_id,
      campaign_kind: this.frozenContext.campaign_kind,
      campaign_mode: this.frozenContext.campaign_mode,
      campaign_modifiers: this.frozenContext.campaign_modifiers,
      campaign_war_index: this.frozenContext.campaign_war_index,
      ...(this.frozenContext.reserves_at_war_start !== undefined
        ? { reserves_at_war_start: this.frozenContext.reserves_at_war_start }
        : {}),
      outcome,
      player_win: playerWin,
      turns: event.turns,
      comeback_deficit: comebackDeficit,
      battles: event.battlesCount,
      deepest_battle: this.deepestBattle,
      reinforcements_sent: event.playerReinforcementsSent,
      successful_reinforcements: this.successfulReinforcements,
      aces_felled_by_twos: this.acesFelledByTwos,
      war_margin: warMargin,
      anomalies_observed: this.achievementService.getAnomaliesObservedThisWar()
    };

    const validation = validateWarCompletedPayload(candidate);
    if (!validation.valid) {
      console.warn('Game Stats war_completed payload validation failed:', validation.error);
      this.hasEmittedForCurrentWar = true;
      return;
    }

    this.platformGameStats.recordWarCompleted(this.currentWarId, validation.data);
    this.hasEmittedForCurrentWar = true;
  }

  private resetState(): void {
    this.currentWarId = null;
    this.frozenContext = null;
    this.isEligible = false;
    this.hasEmittedForCurrentWar = false;
    this.profileIdAtStart = null;
    this.deepestBattle = 0;
    this.successfulReinforcements = 0;
    this.acesFelledByTwos = 0;
  }
}
