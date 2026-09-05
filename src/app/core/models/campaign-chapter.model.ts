import { COMMANDER_IDS, OpponentCommanderId } from './commander.model';

export type CampaignModeId = 'standard' | 'limited_reserves' | 'fog_of_war' | 'total_war';
export type CampaignModifierId = Exclude<CampaignModeId, 'standard'>;
export type CampaignWarIndex = 1 | 2 | 3;
export type CampaignCommanderSchedule = readonly [
  OpponentCommanderId,
  OpponentCommanderId,
  OpponentCommanderId
];

export interface CampaignChapterDefinition {
  readonly mode: CampaignModeId;
  readonly chapter: 1 | 2 | 3 | 4;
  readonly title: string;
  readonly shortTitle: string;
  readonly premise: string;
  readonly commanderIds: CampaignCommanderSchedule;
}

export const CAMPAIGN_CHAPTER_ORDER: readonly CampaignModeId[] = [
  'standard',
  'limited_reserves',
  'fog_of_war',
  'total_war'
];

export const CAMPAIGN_MODIFIER_ORDER: readonly CampaignModifierId[] = [
  'limited_reserves',
  'fog_of_war',
  'total_war'
];

/** Mechanical rules accumulated by each mandatory Chapter in the first story traversal. */
export const SCRIPTED_CHAPTER_MODIFIERS: Readonly<
  Record<CampaignModeId, readonly CampaignModifierId[]>
> = {
  standard: [],
  limited_reserves: ['limited_reserves'],
  fog_of_war: ['limited_reserves', 'fog_of_war'],
  total_war: ['limited_reserves', 'fog_of_war', 'total_war']
};

export const CAMPAIGN_CHAPTERS: Readonly<Record<CampaignModeId, CampaignChapterDefinition>> = {
  standard: {
    mode: 'standard',
    chapter: 1,
    title: 'The Accord',
    shortTitle: 'Chapter I',
    premise:
      'Two traditions brought two Witness Wheels to Mont-Rouge. The French wheel opened its eyes. The Swiss wheel was never meant to.',
    commanderIds: ['quartermaster', 'analyst', 'attritionist']
  },
  limited_reserves: {
    mode: 'limited_reserves',
    chapter: 2,
    title: 'The Closing Passes',
    shortTitle: 'Chapter II',
    premise: 'Five reserves. Three Wars. Winter does not return what command spends.',
    commanderIds: ['gambler', 'cornered-general', 'quartermaster']
  },
  fog_of_war: {
    mode: 'fog_of_war',
    chapter: 3,
    title: 'The Blind Wheel',
    shortTitle: 'Chapter III',
    premise:
      "The Boneyard will be sealed while each War is active. Mont-Rouge's record has been sealed by certainty for much longer.",
    commanderIds: ['analyst', 'quartermaster', 'attritionist']
  },
  total_war: {
    mode: 'total_war',
    chapter: 4,
    title: 'The War of Attrition',
    shortTitle: 'Chapter IV',
    premise:
      'No War stands alone. Every margin enters the final account; so did every choice that brought the armies here.',
    commanderIds: ['gambler', 'cornered-general', 'analyst']
  }
};

export function isCampaignModeId(value: unknown): value is CampaignModeId {
  return CAMPAIGN_CHAPTER_ORDER.includes(value as CampaignModeId);
}

export function isCampaignModifierId(value: unknown): value is CampaignModifierId {
  return CAMPAIGN_MODIFIER_ORDER.includes(value as CampaignModifierId);
}

export function getScriptedChapterModifiers(
  mode: CampaignModeId
): readonly CampaignModifierId[] {
  return [...SCRIPTED_CHAPTER_MODIFIERS[mode]];
}

export function getCampaignChapter(mode: CampaignModeId): CampaignChapterDefinition {
  return CAMPAIGN_CHAPTERS[mode];
}

export function getAuthoredCommanderSchedule(mode: CampaignModeId): CampaignCommanderSchedule {
  return [...CAMPAIGN_CHAPTERS[mode].commanderIds] as unknown as CampaignCommanderSchedule;
}

export function getAuthoredCommanderId(
  mode: CampaignModeId,
  warIndex: CampaignWarIndex
): OpponentCommanderId {
  return CAMPAIGN_CHAPTERS[mode].commanderIds[warIndex - 1];
}

export function nextCampaignChapter(mode: CampaignModeId): CampaignModeId | null {
  const index = CAMPAIGN_CHAPTER_ORDER.indexOf(mode);
  return index >= 0 && index < CAMPAIGN_CHAPTER_ORDER.length - 1
    ? CAMPAIGN_CHAPTER_ORDER[index + 1]
    : null;
}

export function chapterPrerequisitesThrough(mode: CampaignModeId): readonly CampaignModeId[] {
  const index = CAMPAIGN_CHAPTER_ORDER.indexOf(mode);
  return index < 0 ? ['standard'] : CAMPAIGN_CHAPTER_ORDER.slice(0, index + 1);
}

/**
 * Generates a randomized 3-War schedule of 3 distinct commanders chosen from all 5 permanent commanders.
 * Used exclusively for post-story replay (after all four canonical chapters have been completed).
 */
export function generateReplayCommanderSchedule(
  randomFn: () => number = Math.random
): CampaignCommanderSchedule {
  const pool = [...COMMANDER_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1], pool[2]] as unknown as CampaignCommanderSchedule;
}
