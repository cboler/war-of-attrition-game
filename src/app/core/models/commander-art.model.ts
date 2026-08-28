import { COMMANDER_IDS, OpponentCommanderId } from './commander.model';

export const COMMANDER_EXPRESSIONS = [
  'calm',
  'smug',
  'determined',
  'angry',
  'sad',
  'surprised',
] as const;

export type CommanderExpression = (typeof COMMANDER_EXPRESSIONS)[number];

export interface CommanderArt {
  readonly portraits: Readonly<Record<CommanderExpression, string>>;
  readonly crest: string;
}

function commanderArt(commanderId: OpponentCommanderId): CommanderArt {
  const basePath = `assets/commanders/${commanderId}`;
  return {
    portraits: {
      calm: `${basePath}/calm.jpg`,
      smug: `${basePath}/smug.jpg`,
      determined: `${basePath}/determined.jpg`,
      angry: `${basePath}/angry.jpg`,
      sad: `${basePath}/sad.jpg`,
      surprised: `${basePath}/surprised.jpg`,
    },
    crest: `${basePath}/crest.jpg`,
  };
}

export const COMMANDER_ART: Readonly<Record<OpponentCommanderId, CommanderArt>> = Object.freeze(
  Object.fromEntries(COMMANDER_IDS.map((commanderId) => [commanderId, commanderArt(commanderId)])),
) as Readonly<Record<OpponentCommanderId, CommanderArt>>;

export function getCommanderPortrait(
  commanderId: OpponentCommanderId,
  expression: CommanderExpression = 'calm',
): string {
  return COMMANDER_ART[commanderId].portraits[expression];
}

export function getCommanderCrest(commanderId: OpponentCommanderId): string {
  return COMMANDER_ART[commanderId].crest;
}
