import {
  CANONICAL_CARD_IDS,
  compareDecoratedCards,
  createDefaultCardServiceRecord,
  createDefaultHallOfValor,
  isDecoratedCard,
  isValidCanonicalCardId,
  normalizeCardServiceRecord,
  normalizeHallOfValor
} from './hall-of-valor.model';

describe('Hall of Valor Model', () => {
  it('should enumerate all 52 canonical card identities', () => {
    expect(CANONICAL_CARD_IDS.length).toBe(52);
    expect(isValidCanonicalCardId('hearts-A')).toBeTrue();
    expect(isValidCanonicalCardId('diamonds-2')).toBeTrue();
    expect(isValidCanonicalCardId('clubs-K')).toBeTrue();
    expect(isValidCanonicalCardId('spades-7')).toBeTrue();
    expect(isValidCanonicalCardId('joker-1')).toBeFalse();
    expect(isValidCanonicalCardId(null)).toBeFalse();
  });

  it('should create default empty hall of valor', () => {
    const hall = createDefaultHallOfValor();
    expect(hall.records).toEqual({});
  });

  it('should create default card service record with zeroed counters', () => {
    const record = createDefaultCardServiceRecord('hearts-A');
    expect(record.cardId).toBe('hearts-A');
    expect(record.confirmedCasualties).toBe(0);
    expect(record.aceAssassinations).toBe(0);
    expect(record.reinforcementRescues).toBe(0);
    expect(record.timesRescued).toBe(0);
    expect(record.battleLayersSurvived).toBe(0);
    expect(record.victoriousWarsSurvived).toBe(0);
    expect(record.juggernautCitations).toBe(0);
    expect(record.notableLosses).toEqual({});
    expect(isDecoratedCard(record)).toBeFalse();
  });

  it('should identify decorated cards correctly', () => {
    const fresh = createDefaultCardServiceRecord('diamonds-2');
    expect(isDecoratedCard(fresh)).toBeFalse();

    const withKill = { ...fresh, confirmedCasualties: 1 };
    expect(isDecoratedCard(withKill)).toBeTrue();

    const withRival = { ...fresh, notableLosses: { 'spades-A': 1 } };
    expect(isDecoratedCard(withRival)).toBeTrue();
  });

  it('should sort decorated cards in strict priority order', () => {
    const base = createDefaultCardServiceRecord('clubs-2');
    const juggernautCard = { ...base, cardId: 'hearts-K', juggernautCitations: 1, confirmedCasualties: 5 };
    const assassinCard = { ...base, cardId: 'diamonds-2', aceAssassinations: 2, confirmedCasualties: 10 };
    const killCard = { ...base, cardId: 'spades-A', confirmedCasualties: 15 };
    const rescueCard = { ...base, cardId: 'clubs-10', reinforcementRescues: 4 };
    const warSurvivorCard = { ...base, cardId: 'hearts-Q', victoriousWarsSurvived: 3 };
    const battleSurvivorCard = { ...base, cardId: 'spades-J', battleLayersSurvived: 2 };

    const unsorted = [
      warSurvivorCard,
      killCard,
      juggernautCard,
      battleSurvivorCard,
      rescueCard,
      assassinCard
    ];

    const sorted = [...unsorted].sort(compareDecoratedCards);
    expect(sorted.map(c => c.cardId)).toEqual([
      'hearts-K', // juggernautCitations: 1
      'diamonds-2', // aceAssassinations: 2
      'spades-A', // confirmedCasualties: 15
      'clubs-10', // reinforcementRescues: 4
      'hearts-Q', // victoriousWarsSurvived: 3
      'spades-J' // battleLayersSurvived: 2
    ]);
  });

  it('should normalize malformed or partial stored data safely', () => {
    const malformed = {
      records: {
        'hearts-A': {
          confirmedCasualties: 4.8,
          aceAssassinations: -1,
          reinforcementRescues: 'invalid',
          juggernautCitations: 1,
          notableLosses: {
            'spades-K': 2,
            'invalid-card': 5,
            'clubs-Q': -3
          }
        },
        'invalid-card-id': {
          confirmedCasualties: 10
        },
        'diamonds-2': {
          confirmedCasualties: 0
        }
      }
    };

    const normalized = normalizeHallOfValor(malformed);
    expect(Object.keys(normalized.records)).toEqual(['hearts-A']);
    const record = normalized.records['hearts-A'];
    expect(record.confirmedCasualties).toBe(4);
    expect(record.aceAssassinations).toBe(0);
    expect(record.reinforcementRescues).toBe(0);
    expect(record.juggernautCitations).toBe(1);
    expect(record.notableLosses).toEqual({ 'spades-K': 2 });
  });

  it('should handle null/undefined/primitive inputs gracefully in normalizeHallOfValor', () => {
    expect(normalizeHallOfValor(null)).toEqual({ records: {} });
    expect(normalizeHallOfValor(undefined)).toEqual({ records: {} });
    expect(normalizeHallOfValor('string-data')).toEqual({ records: {} });
    expect(normalizeHallOfValor(123)).toEqual({ records: {} });
    expect(normalizeHallOfValor([])).toEqual({ records: {} });
  });
});
