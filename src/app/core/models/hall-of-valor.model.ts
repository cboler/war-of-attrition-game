import { Rank, Suit } from './card.model';

export interface CardServiceRecord {
  readonly cardId: string;
  readonly confirmedCasualties: number;
  readonly aceAssassinations: number;
  readonly reinforcementRescues: number;
  readonly timesRescued: number;
  readonly battleLayersSurvived: number;
  readonly victoriousWarsSurvived: number;
  readonly juggernautCitations: number;
  readonly notableLosses: Readonly<Record<string, number>>;
  readonly lastServedAt?: string;
}

export interface HallOfValorState {
  readonly records: Readonly<Record<string, CardServiceRecord>>;
}

export const CANONICAL_CARD_IDS: readonly string[] = Object.freeze(
  Object.values(Suit).flatMap(suit =>
    Object.values(Rank).map(rank => `${suit}-${rank}`)
  )
);

export function isValidCanonicalCardId(id: unknown): id is string {
  return typeof id === 'string' && CANONICAL_CARD_IDS.includes(id);
}

export function createDefaultCardServiceRecord(cardId: string): CardServiceRecord {
  return {
    cardId,
    confirmedCasualties: 0,
    aceAssassinations: 0,
    reinforcementRescues: 0,
    timesRescued: 0,
    battleLayersSurvived: 0,
    victoriousWarsSurvived: 0,
    juggernautCitations: 0,
    notableLosses: Object.freeze({})
  };
}

export function createDefaultHallOfValor(): HallOfValorState {
  return {
    records: Object.freeze({})
  };
}

export function isDecoratedCard(record: CardServiceRecord): boolean {
  if (!record) return false;
  return (
    record.confirmedCasualties > 0 ||
    record.aceAssassinations > 0 ||
    record.reinforcementRescues > 0 ||
    record.timesRescued > 0 ||
    record.battleLayersSurvived > 0 ||
    record.victoriousWarsSurvived > 0 ||
    record.juggernautCitations > 0 ||
    Object.keys(record.notableLosses || {}).length > 0
  );
}

/**
 * Deterministic "Most Decorated" comparator prioritizing major battlefield honors:
 * 1. Juggernaut Citations
 * 2. Ace Assassinations
 * 3. Confirmed Casualties
 * 4. Reinforcement Rescues
 * 5. Victorious Wars Survived
 * 6. Battle Layers Survived
 * 7. Times Rescued
 * 8. Alphabetical canonical card ID for stability
 */
export function compareDecoratedCards(a: CardServiceRecord, b: CardServiceRecord): number {
  if (b.juggernautCitations !== a.juggernautCitations) {
    return b.juggernautCitations - a.juggernautCitations;
  }
  if (b.aceAssassinations !== a.aceAssassinations) {
    return b.aceAssassinations - a.aceAssassinations;
  }
  if (b.confirmedCasualties !== a.confirmedCasualties) {
    return b.confirmedCasualties - a.confirmedCasualties;
  }
  if (b.reinforcementRescues !== a.reinforcementRescues) {
    return b.reinforcementRescues - a.reinforcementRescues;
  }
  if (b.victoriousWarsSurvived !== a.victoriousWarsSurvived) {
    return b.victoriousWarsSurvived - a.victoriousWarsSurvived;
  }
  if (b.battleLayersSurvived !== a.battleLayersSurvived) {
    return b.battleLayersSurvived - a.battleLayersSurvived;
  }
  if (b.timesRescued !== a.timesRescued) {
    return b.timesRescued - a.timesRescued;
  }
  return a.cardId.localeCompare(b.cardId);
}

export function normalizeCardServiceRecord(
  cardId: string,
  value: unknown
): CardServiceRecord | null {
  if (!isValidCanonicalCardId(cardId) || !isRecord(value)) {
    return null;
  }

  const notableLosses = normalizeNotableLosses(value['notableLosses']);
  const lastServedAt = normalizeIsoDate(value['lastServedAt']);

  const record: CardServiceRecord = {
    cardId,
    confirmedCasualties: nonNegativeInteger(value['confirmedCasualties']),
    aceAssassinations: nonNegativeInteger(value['aceAssassinations']),
    reinforcementRescues: nonNegativeInteger(value['reinforcementRescues']),
    timesRescued: nonNegativeInteger(value['timesRescued']),
    battleLayersSurvived: nonNegativeInteger(value['battleLayersSurvived']),
    victoriousWarsSurvived: nonNegativeInteger(value['victoriousWarsSurvived']),
    juggernautCitations: nonNegativeInteger(value['juggernautCitations']),
    notableLosses: Object.freeze(notableLosses),
    ...(lastServedAt ? { lastServedAt } : {})
  };

  return isDecoratedCard(record) ? record : null;
}

export function normalizeHallOfValor(value: unknown): HallOfValorState {
  if (!isRecord(value)) {
    return createDefaultHallOfValor();
  }

  const rawRecords = isRecord(value['records']) ? value['records'] : value;
  if (!isRecord(rawRecords)) {
    return createDefaultHallOfValor();
  }

  const normalizedRecords: Record<string, CardServiceRecord> = {};
  for (const [key, candidate] of Object.entries(rawRecords)) {
    if (isValidCanonicalCardId(key)) {
      const record = normalizeCardServiceRecord(key, candidate);
      if (record) {
        normalizedRecords[key] = record;
      }
    }
  }

  return {
    records: Object.freeze(normalizedRecords)
  };
}

function normalizeNotableLosses(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const normalized: Record<string, number> = {};
  for (const [rivalCardId, count] of Object.entries(value)) {
    if (isValidCanonicalCardId(rivalCardId)) {
      const parsedCount = nonNegativeInteger(count);
      if (parsedCount > 0) {
        normalized[rivalCardId] = parsedCount;
      }
    }
  }
  return normalized;
}

function normalizeIsoDate(value: unknown): string | undefined {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return value;
  }
  return undefined;
}

function finiteInteger(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0;
}

function nonNegativeInteger(value: unknown): number {
  return Math.max(0, finiteInteger(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
