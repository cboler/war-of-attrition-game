import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { CampaignModeId } from '../../../core/models/progression.model';
import { CommanderIdentity } from '../../../core/models/commander-identity.model';
import { NarrativeTransitionRecord } from '../../../core/models/narrative.model';
import { NarrativeResolverService } from '../../../narrative/narrative-resolver.service';

export interface CampaignOrderOption {
  readonly id: CampaignModeId;
  readonly chapterNumber: number;
  readonly chapterTitle: string;
  readonly title: string;
  readonly tag: string;
  readonly description: string;
  readonly ruleSummary: string;
  readonly reinforcementPolicy: string;
}

export const CAMPAIGN_ORDER_OPTIONS: readonly CampaignOrderOption[] = [
  {
    id: 'standard',
    chapterNumber: 1,
    chapterTitle: 'The Accord',
    title: 'Standard Campaign',
    tag: 'Chapter I · Classic Attrition',
    description: 'Traditional War of Attrition rules across a three-War series.',
    ruleSummary: 'Reinforcement opportunities are limited only by the cards in your physical deck.',
    reinforcementPolicy: 'Deck Count Only'
  },
  {
    id: 'limited_reserves',
    chapterNumber: 2,
    chapterTitle: 'The Closing Passes',
    title: 'Limited Reserves',
    tag: 'Chapter II · 5 Reserves',
    description: 'A strict strategic constraint testing long-range resource management.',
    ruleSummary: 'You begin with exactly 5 reinforcements for the entire Three-War Campaign. Used reserves do not return between Wars.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)'
  },
  {
    id: 'fog_of_war',
    chapterNumber: 3,
    chapterTitle: 'The Blind Wheel',
    title: 'Fog of War',
    tag: 'Chapter III · Imperfect Information',
    description: 'The Boneyard is sealed during each War. Fallen cards cannot be reviewed until the fighting ends. Trust your memory.',
    ruleSummary: 'Casualties and past clashes are sealed from inspection while fighting continues. Fallen cards are revealed at War conclusion.',
    reinforcementPolicy: 'Deck Count Only'
  },
  {
    id: 'total_war',
    chapterNumber: 4,
    chapterTitle: 'The War of Attrition',
    title: 'Total War',
    tag: 'Chapter IV · Cumulative Differential',
    description: 'The Campaign is decided by cumulative card differential across all three Wars. Every card matters, even in defeat.',
    ruleSummary: 'Individual Wars contribute signed card margins. Final Campaign victory belongs to the commander with positive cumulative differential.',
    reinforcementPolicy: 'Deck Count Only'
  }
];

@Component({
  selector: 'app-campaign-orders-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './campaign-orders-dialog.component.html',
  styleUrl: './campaign-orders-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignOrdersDialogComponent {
  private readonly progression = inject(CampaignProgressionService);
  private readonly narrativeResolver = inject(NarrativeResolverService, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<CampaignOrdersDialogComponent>);

  readonly commanderIdentity = computed<CommanderIdentity>(() =>
    this.progression.currentCommanderIdentity()
  );

  readonly isReplay = computed<boolean>(() =>
    this.progression.isAllChaptersCompleted()
  );

  readonly options = CAMPAIGN_ORDER_OPTIONS;

  readonly selectedMode = signal<CampaignModeId>('standard');

  readonly chapterFraming = computed<NarrativeTransitionRecord | null>(() => {
    if (!this.narrativeResolver) return null;
    return this.narrativeResolver.transitionFor(this.selectedMode(), 'orders') ??
      this.narrativeResolver.transitionFor('standard', 'orders');
  });

  isModeUnlocked(mode: CampaignModeId): boolean {
    return this.progression.isChapterUnlocked(mode);
  }

  isModeCompleted(mode: CampaignModeId): boolean {
    return this.progression.isChapterCompleted(mode);
  }

  selectMode(mode: CampaignModeId): void {
    if (!this.isModeUnlocked(mode)) return;
    this.selectedMode.set(mode);
  }

  confirmOrders(): void {
    const success = this.progression.selectCampaignOrders(this.selectedMode());
    if (success) {
      this.dialogRef.close(this.selectedMode());
    }
  }
}
