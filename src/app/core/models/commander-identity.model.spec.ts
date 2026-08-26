import { COMMANDER_IDENTITIES, getCommanderIdentity } from './commander-identity.model';
import { COMMANDER_IDS } from './commander.model';

describe('CommanderIdentityModel', () => {
  it('maps all five AI strategy IDs to canonical fictional identities', () => {
    expect(COMMANDER_IDS).toEqual([
      'quartermaster',
      'gambler',
      'analyst',
      'attritionist',
      'cornered-general'
    ]);

    for (const id of COMMANDER_IDS) {
      const identity = getCommanderIdentity(id);
      expect(identity).toBeDefined();
      expect(identity.commanderId).toBe(id);
      expect(identity.name.length).toBeGreaterThan(0);
      expect(identity.title.length).toBeGreaterThan(0);
      expect(identity.faction.length).toBeGreaterThan(0);
      expect(identity.publicSummary.length).toBeGreaterThan(0);
    }
  });

  it('correctly provides Marcel de Brie for quartermaster', () => {
    const identity = getCommanderIdentity('quartermaster');
    expect(identity.name).toBe('Marcel de Brie');
    expect(identity.title).toBe('French Master Affineur');
    expect(identity.faction).toBe('French Delegation');
  });

  it('correctly provides Matthias von Greyerz for analyst', () => {
    const identity = getCommanderIdentity('analyst');
    expect(identity.name).toBe('Matthias von Greyerz');
    expect(identity.title).toBe('Swiss Standards Analyst');
    expect(identity.faction).toBe('Swiss Delegation');
  });

  it('correctly provides Bastien de Herve for attritionist', () => {
    const identity = getCommanderIdentity('attritionist');
    expect(identity.name).toBe('Bastien de Herve');
    expect(identity.title).toBe('Belgian Tyromancer');
    expect(identity.faction).toBe('No Reliable Affiliation');
  });

  it('correctly provides Sir Edmund Gloucester for gambler', () => {
    const identity = getCommanderIdentity('gambler');
    expect(identity.name).toBe('Sir Edmund Gloucester');
    expect(identity.title).toBe('English Artisan-Adventurer');
    expect(identity.faction).toBe('French-Aligned Adviser');
  });

  it('correctly provides Lorenzo di Taleggio for cornered-general', () => {
    const identity = getCommanderIdentity('cornered-general');
    expect(identity.name).toBe('Lorenzo di Taleggio');
    expect(identity.title).toBe('Italian Merchant-Prince');
    expect(identity.faction).toBe('Swiss-Aligned Adviser');
  });
});
