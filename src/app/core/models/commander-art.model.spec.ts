import {
  COMMANDER_ART,
  COMMANDER_EXPRESSIONS,
  getCommanderCrest,
  getCommanderPortrait,
} from './commander-art.model';
import { COMMANDER_IDS } from './commander.model';

describe('commander art mapping', () => {
  it('maps every permanent commander ID to all six portraits and one crest', () => {
    for (const commanderId of COMMANDER_IDS) {
      expect(Object.keys(COMMANDER_ART[commanderId].portraits).sort()).toEqual(
        [...COMMANDER_EXPRESSIONS].sort(),
      );
      expect(getCommanderPortrait(commanderId)).toBe(
        `assets/commanders/${commanderId}/calm.jpg`,
      );
      expect(getCommanderCrest(commanderId)).toBe(
        `assets/commanders/${commanderId}/crest.jpg`,
      );
    }
  });

  it('uses unique, local, traversal-free asset paths', () => {
    const paths = COMMANDER_IDS.flatMap((commanderId) => [
      getCommanderCrest(commanderId),
      ...COMMANDER_EXPRESSIONS.map((expression) =>
        getCommanderPortrait(commanderId, expression),
      ),
    ]);

    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path).toMatch(/^assets\/commanders\/[a-z-]+\/[a-z-]+\.jpg$/);
      expect(path).not.toContain('..');
      expect(path).not.toMatch(/^https?:/);
    }
  });
});
