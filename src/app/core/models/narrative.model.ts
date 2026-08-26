import { OpponentCommanderId } from './commander.model';
import { CampaignModeId, CampaignWarIndex } from './campaign-chapter.model';

export type NarrativeGameplayEvent =
  | 'introduction'
  | 'context'
  | 'special_clash'
  | 'narrow_clash'
  | 'rescue'
  | 'failed_rescue'
  | 'battle_ace_lost'
  | 'battle_two_lost'
  | 'deep_battle'
  | 'large_battle_loss'
  | 'concession'
  | 'desperate_rescue'
  | 'contextual'
  | 'result'
  | 'resolution';

export type NarrativeReplayAvailability = 'first_play' | 'replay' | 'any';

export interface AuthoredDialogueRecord {
  readonly id: string;
  readonly commanderId: OpponentCommanderId;
  readonly mode?: CampaignModeId;
  readonly warIndex?: CampaignWarIndex;
  readonly event: NarrativeGameplayEvent;
  readonly text: string;
  readonly availability: NarrativeReplayAvailability;
  readonly revealIds?: readonly string[];
}


export type NarrativeTransitionPlacement =
  | 'orders'
  | 'after_war_1'
  | 'after_war_2'
  | 'campaign_complete';

export interface NarrativeTransitionRecord {
  readonly id: string;
  readonly mode: CampaignModeId;
  readonly placement: NarrativeTransitionPlacement;
  readonly title: string;
  readonly text: string;
  readonly revealIds: readonly string[];
}

export type DossierSection =
  | 'Overview'
  | 'Background'
  | 'Known Associations'
  | 'Mont-Rouge Record'
  | 'Campaign Notes'
  | 'Archived Statement';

export type DossierEvidence =
  | 'documented'
  | 'attributed interpretation'
  | 'prophetic metaphor'
  | 'public record';

export interface NarrativeSourceLink {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

export interface CommanderDossierRecord {
  readonly id: string;
  readonly commanderId: OpponentCommanderId;
  readonly unlock: {
    readonly mode: CampaignModeId;
    readonly completedWars: 0 | 1 | 2 | 3;
  };
  readonly section: DossierSection;
  readonly text: string;
  readonly evidence: DossierEvidence;
  readonly revealIds: readonly string[];
  readonly source?: NarrativeSourceLink;
  readonly relationship: 'new' | 'annotate' | 'supplement';
  readonly relatedRecordId?: string;
}
