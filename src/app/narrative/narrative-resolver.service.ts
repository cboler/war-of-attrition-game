import { Injectable, computed, inject } from '@angular/core';
import { OpponentCommanderId } from '../core/models/commander.model';
import {
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
    return CHAPTER_ONE_DIALOGUE.find(record =>
      record.commanderId === context.commanderId &&
      record.mode === context.mode &&
      record.warIndex === context.warIndex &&
      record.event === context.event &&
      !excluded.has(record.id) &&
      this.isReplaySafe(record, context.chapterCompleted)
    ) ?? null;
  }

  transitionFor(
    mode: CampaignModeId,
    placement: NarrativeTransitionPlacement
  ): NarrativeTransitionRecord | null {
    return CHAPTER_ONE_TRANSITIONS.find(record =>
      record.mode === mode && record.placement === placement
    ) ?? null;
  }

  dossierFor(
    commanderId: OpponentCommanderId,
    progression: CampaignProgression = this.progression.progression()
  ): readonly CommanderDossierRecord[] {
    return CHAPTER_ONE_DOSSIERS.filter(record =>
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
    const completedCampaign = progression.recentCampaigns.some(
      campaign => campaign.mode === record.unlock.mode
    );
    if (completedCampaign) return true;

    const active = progression.currentCampaign;
    return active.mode === record.unlock.mode && active.wars.length >= record.unlock.completedWars;
  }
}
