import { Injectable, computed, inject } from '@angular/core';
import { OpponentCommanderId } from '../core/models/commander.model';
import {
  CAMPAIGN_CHAPTER_ORDER,
  CampaignModeId,
  CampaignWarIndex
} from '../core/models/campaign-chapter.model';
import {
  AuthoredDialogueRecord,
  CommanderDossierRecord,
  NarrativeGameplayEvent,
  NarrativeTransitionPlacement,
  NarrativeTransitionRecord
} from '../core/models/narrative.model';
import { CampaignProgression } from '../core/models/progression.model';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import {
  CHAPTER_ONE_DIALOGUE,
  CHAPTER_ONE_DOSSIERS,
  CHAPTER_ONE_TRANSITIONS
} from './chapter-one-narrative.data';
import {
  CHAPTER_TWO_DIALOGUE,
  CHAPTER_TWO_DOSSIERS,
  CHAPTER_TWO_TRANSITIONS
} from './chapter-two-narrative.data';
import {
  CHAPTER_THREE_DIALOGUE,
  CHAPTER_THREE_DOSSIERS,
  CHAPTER_THREE_TRANSITIONS
} from './chapter-three-narrative.data';
import {
  CHAPTER_FOUR_DIALOGUE,
  CHAPTER_FOUR_DOSSIERS,
  CHAPTER_FOUR_TRANSITIONS
} from './chapter-four-narrative.data';
import { EVERGREEN_DIALOGUE } from './evergreen-narrative.data';

export const ALL_EVERGREEN_DIALOGUE: readonly AuthoredDialogueRecord[] = EVERGREEN_DIALOGUE;

export const ALL_AUTHORED_DIALOGUE: readonly AuthoredDialogueRecord[] = [
  ...CHAPTER_ONE_DIALOGUE,
  ...CHAPTER_TWO_DIALOGUE,
  ...CHAPTER_THREE_DIALOGUE,
  ...CHAPTER_FOUR_DIALOGUE,
  ...EVERGREEN_DIALOGUE
];


export const ALL_NARRATIVE_TRANSITIONS: readonly NarrativeTransitionRecord[] = [
  ...CHAPTER_ONE_TRANSITIONS,
  ...CHAPTER_TWO_TRANSITIONS,
  ...CHAPTER_THREE_TRANSITIONS,
  ...CHAPTER_FOUR_TRANSITIONS
];

export const ALL_COMMANDER_DOSSIERS: readonly CommanderDossierRecord[] = [
  ...CHAPTER_ONE_DOSSIERS,
  ...CHAPTER_TWO_DOSSIERS,
  ...CHAPTER_THREE_DOSSIERS,
  ...CHAPTER_FOUR_DOSSIERS
];

export interface NarrativeDialogueContext {
  readonly commanderId: OpponentCommanderId;
  readonly mode: CampaignModeId;
  readonly warIndex: CampaignWarIndex;
  readonly event: NarrativeGameplayEvent;
  readonly chapterCompleted: boolean;
  readonly excludeIds?: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class NarrativeResolverService {
  private readonly progression = inject(CampaignProgressionService);

  readonly currentDossier = computed(() =>
    this.dossierFor(this.progression.currentCommanderId(), this.progression.progression())
  );

  currentDialogue(event: NarrativeGameplayEvent): AuthoredDialogueRecord | null {
    const mode = this.progression.activeCampaignMode();
    return this.dialogueFor({
      commanderId: this.progression.currentCommanderId(),
      mode,
      warIndex: this.progression.campaignWarIndex(),
      event,
      chapterCompleted: this.progression.isChapterCompleted(mode)
    });
  }

  dialogueFor(context: NarrativeDialogueContext): AuthoredDialogueRecord | null {
    const excluded = new Set(context.excludeIds ?? []);
    const encounterLine = ALL_AUTHORED_DIALOGUE.find(record =>
      record.commanderId === context.commanderId &&
      record.mode === context.mode &&
      record.warIndex === context.warIndex &&
      record.event === context.event &&
      !excluded.has(record.id) &&
      this.isReplaySafe(record, context.chapterCompleted)
    );
    if (encounterLine) return encounterLine;

    const evergreenLine = ALL_AUTHORED_DIALOGUE.find(record =>
      record.commanderId === context.commanderId &&
      record.mode === undefined &&
      record.event === context.event &&
      !excluded.has(record.id) &&
      this.isReplaySafe(record, context.chapterCompleted)
    );
    return evergreenLine ?? null;
  }


  transitionFor(
    mode: CampaignModeId,
    placement: NarrativeTransitionPlacement
  ): NarrativeTransitionRecord | null {
    return ALL_NARRATIVE_TRANSITIONS.find(record =>
      record.mode === mode && record.placement === placement
    ) ?? null;
  }

  dossierFor(
    commanderId: OpponentCommanderId,
    progression: CampaignProgression = this.progression.progression()
  ): readonly CommanderDossierRecord[] {
    return ALL_COMMANDER_DOSSIERS.filter(record =>
      record.commanderId === commanderId && this.isDossierRecordUnlocked(record, progression)
    );
  }

  private isReplaySafe(record: AuthoredDialogueRecord, chapterCompleted: boolean): boolean {
    if (record.availability === 'any') return true;
    return chapterCompleted
      ? record.availability === 'replay'
      : record.availability === 'first_play';
  }

  private isDossierRecordUnlocked(
    record: CommanderDossierRecord,
    progression: CampaignProgression
  ): boolean {
    const completedCampaign =
      progression.completedChapterModes.includes(record.unlock.mode) ||
      progression.recentCampaigns.some(campaign => campaign.mode === record.unlock.mode);
    if (completedCampaign) return true;

    const active = progression.currentCampaign;
    const activeIndex = CAMPAIGN_CHAPTER_ORDER.indexOf(active.mode);
    const recordIndex = CAMPAIGN_CHAPTER_ORDER.indexOf(record.unlock.mode);

    if (activeIndex > recordIndex) return true;

    if (active.mode === record.unlock.mode) {
      if (record.unlock.completedWars === 0) {
        return active.mode === 'standard' || active.ordersSelected || active.wars.length > 0;
      }
      return active.wars.length >= record.unlock.completedWars;
    }

    return false;
  }
}
