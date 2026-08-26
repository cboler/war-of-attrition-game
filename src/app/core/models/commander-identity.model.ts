import { OpponentCommanderId } from './commander.model';

export interface CommanderIdentity {
  readonly commanderId: OpponentCommanderId;
  readonly name: string;
  readonly title: string;
  readonly faction: string;
  readonly publicSummary: string;
}

export const COMMANDER_IDENTITIES: Readonly<Record<OpponentCommanderId, CommanderIdentity>> = {
  quartermaster: {
    commanderId: 'quartermaster',
    name: 'Marcel de Brie',
    title: 'French Master Affineur',
    faction: 'French Delegation',
    publicSummary:
      'Exacting cellar steward, formidable reserve planner, and defender of French provenance.'
  },
  analyst: {
    commanderId: 'analyst',
    name: 'Matthias von Greyerz',
    title: 'Swiss Standards Analyst',
    faction: 'Swiss Delegation',
    publicSummary:
      'Procedural master cheesemaker known for severe tolerances and exact public accounting.'
  },
  attritionist: {
    commanderId: 'attritionist',
    name: 'Bastien de Herve',
    title: 'Belgian Tyromancer',
    faction: 'No Reliable Affiliation',
    publicSummary:
      'Rind-seer of poor official reliability and a disturbingly strong predictive record.'
  },
  gambler: {
    commanderId: 'gambler',
    name: 'Sir Edmund Gloucester',
    title: 'English Artisan-Adventurer',
    faction: 'French-Aligned Adviser',
    publicSummary:
      'Dry-humored campaign adviser with excellent nerve and an appetite for uncertain odds.'
  },
  'cornered-general': {
    commanderId: 'cornered-general',
    name: 'Lorenzo di Taleggio',
    title: 'Italian Merchant-Prince',
    faction: 'Swiss-Aligned Adviser',
    publicSummary:
      "Alpine strategist who notices tomorrow's threat early—sometimes before tomorrow agrees."
  }
};

export function getCommanderIdentity(id: OpponentCommanderId): CommanderIdentity {
  return COMMANDER_IDENTITIES[id];
}
