import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpponentCommanderId } from '../core/models/commander.model';
import { GameEvent } from '../core/models/game-events.model';
import {
  GAME_TELEMETRY_SCHEMA_VERSION,
  TelemetryEnvelope,
  WarTelemetryContext
} from '../core/models/telemetry.model';
import { CampaignModeId, DeckColor, createProgressionId } from '../core/models/progression.model';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { GameEventBusService } from './game-event-bus.service';
import { mapGameEventToTelemetry, mapProgressionEventToTelemetry } from './game-telemetry.mapper';
import {
  GAME_TELEMETRY_CONFIG,
  GAME_TELEMETRY_TRANSPORT,
  TelemetryTransport
} from './telemetry-transport.service';
import { TelemetryConsentService } from './telemetry-consent.service';

export interface BeginWarTelemetryInput {
  readonly warId?: string;
  readonly campaignId?: string;
  readonly campaignWarIndex?: 1 | 2 | 3;
  readonly playerDeckColor?: DeckColor;
  readonly commanderId?: OpponentCommanderId;
  readonly campaignMode?: CampaignModeId;
  readonly startType?: 'new' | 'restart' | 'resume';
}

/**
 * Application-level telemetry facade. It consumes typed domain events and is
 * the only gameplay layer that knows about the analytics transport.
 */
@Injectable({ providedIn: 'root' })
export class GameTelemetryService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly progressionService = inject(CampaignProgressionService);
  private readonly transport: TelemetryTransport = inject(GAME_TELEMETRY_TRANSPORT);
  private readonly config = inject(GAME_TELEMETRY_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consent = inject(TelemetryConsentService);
  private readonly warContextSignal = signal<WarTelemetryContext | null>(null);
  private eventSequence = 0;
  private collectCurrentWar = false;

  readonly currentWarContext = this.warContextSignal.asReadonly();

  constructor() {
    this.eventBus.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.onGameEvent(event));
    this.progressionService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (!this.consent.canCollectAnalytics()) return;
        if (event.type === 'campaign_resolved' && !this.collectCurrentWar) return;
        const record = mapProgressionEventToTelemetry(
          event,
          this.versionFields(),
          this.nextSequence()
        );
        this.transport.send(record);
      });
  }

  /**
   * Integration point for the authoritative new-War transaction. Calling this
   * once records the stable assigned color and emits the canonical War start.
   */
  beginWar(input: BeginWarTelemetryInput = {}): WarTelemetryContext {
    const existing = this.warContextSignal();
    const requestedWarId = normalizeContextId(input.warId);
    if (existing && requestedWarId && existing.warId === requestedWarId) {
      return existing;
    }

    const activeCampaign = this.progressionService.currentCampaign();
    const context: WarTelemetryContext = {
      warId: requestedWarId || createProgressionId('war'),
      campaignId: normalizeContextId(input.campaignId) || activeCampaign.campaignId,
      campaignWarIndex: input.campaignWarIndex ?? this.progressionService.campaignWarIndex(),
      playerDeckColor: input.playerDeckColor ?? 'unknown',
      commanderId: input.commanderId ?? this.progressionService.currentCommanderId(),
      campaignMode: input.campaignMode ?? activeCampaign.mode
    };
    this.warContextSignal.set(context);
    this.eventSequence = 0;
    // Consent granted after a War starts applies at the next War boundary, so
    // no partial War can appear without its canonical start record.
    this.collectCurrentWar = this.consent.canCollectAnalytics();
    if (this.collectCurrentWar) {
      this.transport.send({
        name: 'war_started',
        parameters: {
          ...this.commonEnvelope(context, this.nextSequence()),
          player_deck_color: context.playerDeckColor,
          start_type: input.startType ?? 'new'
        }
      });
    }
    return context;
  }

  endWarContext(): void {
    this.warContextSignal.set(null);
    this.eventSequence = 0;
    this.collectCurrentWar = false;
  }

  private onGameEvent(event: GameEvent): void {
    const context = this.warContextSignal();
    if (!context) return;
    if (!this.consent.canCollectAnalytics()) {
      this.collectCurrentWar = false;
    }
    if (!this.collectCurrentWar) {
      if (event.type === 'game_resolved' || event.type === 'game_abandoned') {
        this.deferWarContextClose(context.warId);
      }
      return;
    }
    const record = mapGameEventToTelemetry(event, {
      ...context,
      ...this.versionFields(),
      eventSeq: this.nextSequence()
    });
    if (record) this.transport.send(record);

    if (event.type === 'game_resolved' || event.type === 'game_abandoned') {
      this.deferWarContextClose(context.warId);
    }
  }

  private deferWarContextClose(resolvedWarId: string): void {
    queueMicrotask(() => {
      if (this.warContextSignal()?.warId === resolvedWarId) {
        this.endWarContext();
      }
    });
  }

  private versionFields(): Pick<
    TelemetryEnvelope,
    'schemaVersion' | 'appVersion' | 'rulesetVersion'
  > {
    return {
      schemaVersion: GAME_TELEMETRY_SCHEMA_VERSION,
      appVersion: this.config.appVersion,
      rulesetVersion: this.config.rulesetVersion
    };
  }

  private commonEnvelope(context: WarTelemetryContext, eventSeq: number) {
    return {
      schema_version: GAME_TELEMETRY_SCHEMA_VERSION,
      ruleset_version: this.config.rulesetVersion,
      app_version: this.config.appVersion,
      war_id: context.warId,
      campaign_id: context.campaignId,
      campaign_war_index: context.campaignWarIndex,
      campaign_mode: context.campaignMode ?? 'standard',
      ...(context.commanderId ? { commander_id: context.commanderId } : {}),
      event_seq: eventSeq
    };
  }

  private nextSequence(): number {
    this.eventSequence += 1;
    return this.eventSequence;
  }
}

function normalizeContextId(value: string | undefined): string {
  return value?.trim().slice(0, 100) ?? '';
}
