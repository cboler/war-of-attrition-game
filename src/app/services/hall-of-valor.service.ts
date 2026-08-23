import { Injectable, computed, inject, signal } from '@angular/core';
import { Card, Rank } from '../core/models/card.model';
import {
  DeckColor,
  GameOutcome,
  PlayerType,
  SettlementAttribution
} from '../core/models/game-state.model';
import {
  CardServiceRecord,
  HallOfValorState,
  JUGGERNAUT_CITATION_THRESHOLD,
  compareDecoratedCards,
  createDefaultCardServiceRecord,
  isDecoratedCard,
  isValidCanonicalCardId
} from '../core/models/hall-of-valor.model';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { GameEvent, GameEventBusService } from './game-event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class HallOfValorService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly authService = inject(AuthService);
  private readonly campaignProgression = inject(CampaignProgressionService, { optional: true });

  private currentPlayerDeckColor: DeckColor | null = null;
  private readonly cardStreaksThisWar = new Map<string, number>();
  private readonly juggernautsAwardedThisWar = new Set<string>();

  /** Current profile's raw Hall of Valor state */
  readonly rawState = computed<HallOfValorState>(() => this.authService.hallOfValor());

  /** All recorded cards */
  readonly records = computed<Readonly<Record<string, CardServiceRecord>>>(
    () => this.rawState().records
  );

  /** Decorated cards sorted in priority order ("Most Decorated") */
  readonly decoratedCards = computed<readonly CardServiceRecord[]>(() => {
    const list = Object.values(this.records()).filter(isDecoratedCard);
    return list.sort(compareDecoratedCards);
  });

  /** Total number of decorated cards in career */
  readonly totalDecoratedCards = computed<number>(() => this.decoratedCards().length);

  constructor() {
    this.eventBus.events$.subscribe(event => this.handleGameEvent(event));
  }

  getRecord(cardId: string): CardServiceRecord | null {
    if (!isValidCanonicalCardId(cardId)) return null;
    return this.records()[cardId] || null;
  }

  hasDecorations(cardId: string): boolean {
    const record = this.getRecord(cardId);
    return !!record && isDecoratedCard(record);
  }

  private handleGameEvent(event: GameEvent): void {
    switch (event.type) {
      case 'war_started':
        this.currentPlayerDeckColor = event.playerDeckColor;
        this.cardStreaksThisWar.clear();
        this.juggernautsAwardedThisWar.clear();
        break;

      case 'settlement_resolved':
        this.evaluateSettlement(event.attribution, event.turnNumber);
        break;

      case 'challenge_resolved':
        if (event.challenger === PlayerType.PLAYER && event.challengerWon) {
          this.mutateCard(event.reinforcementCard.id, r => ({
            ...r,
            reinforcementRescues: r.reinforcementRescues + 1
          }));
          if (event.originalBeatenCard) {
            this.mutateCard(event.originalBeatenCard.id, r => ({
              ...r,
              timesRescued: r.timesRescued + 1
            }));
          }
        }
        break;

      case 'battle_cards_revealed':
        // Legal public champion for this battle layer receives participation credit
        if (event.selection?.playerCard) {
          this.mutateCard(event.selection.playerCard.id, r => ({
            ...r,
            battleLayersSurvived: r.battleLayersSurvived + 1
          }));
        }
        break;

      case 'game_resolved':
        if (event.outcome === GameOutcome.PLAYER_WIN && event.survivingPlayerCardIds) {
          const now = new Date().toISOString();
          this.authService.updateActiveProfileHallOfValor((current: HallOfValorState) => {
            const nextRecords = { ...current.records };
            for (const cardId of event.survivingPlayerCardIds || []) {
              if (isValidCanonicalCardId(cardId)) {
                const existing = nextRecords[cardId] || createDefaultCardServiceRecord(cardId);
                nextRecords[cardId] = {
                  ...existing,
                  victoriousWarsSurvived: existing.victoriousWarsSurvived + 1,
                  lastServedAt: now
                };
              }
            }
            return { records: nextRecords };
          });
        }
        this.cardStreaksThisWar.clear();
        this.juggernautsAwardedThisWar.clear();
        break;

      case 'game_abandoned':
        this.cardStreaksThisWar.clear();
        this.juggernautsAwardedThisWar.clear();
        break;
    }
  }

  private evaluateSettlement(attribution: SettlementAttribution, turnNumber: number): void {
    if (attribution.winner === PlayerType.PLAYER) {
      const decisive = attribution.decisiveCard;
      const casualtiesCount = attribution.casualties.length;

      let aceKills = 0;
      if (decisive.rank === Rank.TWO) {
        aceKills = attribution.casualties.filter(c => c.rank === Rank.ACE).length;
      }

      // Update decisive card record
      this.mutateCard(decisive.id, r => ({
        ...r,
        confirmedCasualties: r.confirmedCasualties + casualtiesCount,
        aceAssassinations: r.aceAssassinations + aceKills
      }));

      // Streak & Juggernaut Citation tracking
      const cardId = decisive.id;
      const currentStreak = (this.cardStreaksThisWar.get(cardId) || 0) + 1;
      this.cardStreaksThisWar.set(cardId, currentStreak);

      if (currentStreak >= JUGGERNAUT_CITATION_THRESHOLD && !this.juggernautsAwardedThisWar.has(cardId)) {
        this.juggernautsAwardedThisWar.add(cardId);
        this.mutateCard(cardId, r => ({
          ...r,
          juggernautCitations: r.juggernautCitations + 1
        }));

        const commanderId = this.campaignProgression?.currentCampaign()?.commanderId;
        this.eventBus.emit({
          type: 'valor_citation_awarded',
          turnNumber,
          card: decisive,
          cardId,
          citation: 'juggernaut',
          citationName: 'Juggernaut Citation',
          description: `${decisive.rank} of ${decisive.suit} recorded ${JUGGERNAUT_CITATION_THRESHOLD} consecutive decisive victories in this War.`,
          ...(commanderId ? { commanderId } : {})
        });
      }
    } else if (attribution.winner === PlayerType.OPPONENT) {
      // Opponent won: player casualty cards suffered defeat against the rival decisive card
      const rivalCard = attribution.decisiveCard;
      const isPlayerRed = this.currentPlayerDeckColor === DeckColor.RED;

      for (const casualty of attribution.casualties) {
        // Only player cards suffer player casualty distinctions
        const isCasualtyPlayerCard =
          this.currentPlayerDeckColor === null || casualty.isRed === isPlayerRed;

        if (isCasualtyPlayerCard) {
          // Reset per-war streak upon defeat
          this.cardStreaksThisWar.set(casualty.id, 0);

          // Record rival defeat count
          if (rivalCard && isValidCanonicalCardId(rivalCard.id)) {
            this.mutateCard(casualty.id, r => {
              const currentRivals = { ...(r.notableLosses || {}) };
              currentRivals[rivalCard.id] = (currentRivals[rivalCard.id] || 0) + 1;
              return {
                ...r,
                notableLosses: currentRivals
              };
            });
          }
        }
      }
    }
  }

  private mutateCard(
    cardId: string,
    updater: (current: CardServiceRecord) => CardServiceRecord
  ): void {
    if (!isValidCanonicalCardId(cardId)) return;
    const now = new Date().toISOString();
    this.authService.updateActiveProfileHallOfValor((current: HallOfValorState) => {
      const existing = current.records[cardId] || createDefaultCardServiceRecord(cardId);
      const updated = {
        ...updater(existing),
        lastServedAt: now
      };
      return {
        records: {
          ...current.records,
          [cardId]: updated
        }
      };
    });
  }
}
