import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { CampaignModifierId, CampaignModeId } from '../../../core/models/progression.model';
import { getScriptedChapterModifiers } from '../../../core/models/campaign-chapter.model';
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
  readonly modifiers: readonly CampaignModifierId[];
}

type CampaignModifierOption = Omit<CampaignOrderOption, 'id'> & {
  readonly id: CampaignModifierId;
};

export const CAMPAIGN_ORDER_OPTIONS: readonly CampaignOrderOption[] = [
  {
    id: 'standard',
    chapterNumber: 1,
    chapterTitle: 'The Accord',
    title: 'Standard Campaign',
    tag: 'Chapter I · Classic Attrition',
    description: 'Traditional War of Attrition rules across a three-War series.',
    ruleSummary: 'Reinforcement opportunities are limited only by the cards in your physical deck.',
    reinforcementPolicy: 'Deck Count Only',
    modifiers: []
  },
  {
    id: 'limited_reserves',
    chapterNumber: 2,
    chapterTitle: 'The Closing Passes',
    title: 'Limited Reserves',
    tag: 'Chapter II · 5 Reserves',
    description: 'A strict strategic constraint testing long-range resource management.',
    ruleSummary: 'You begin with exactly 5 reinforcements for the entire Three-War Campaign. Used reserves do not return between Wars.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves']
  },
  {
    id: 'fog_of_war',
    chapterNumber: 3,
    chapterTitle: 'The Blind Wheel',
    title: 'Fog of War',
    tag: 'Chapter III · Imperfect Information',
    description: 'Five reserves now operate under imperfect information. The Boneyard stays sealed until each War ends.',
    ruleSummary: 'Limited Reserves remains active. Casualties and past clashes are also sealed from inspection while fighting continues.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves', 'fog_of_war']
  },
  {
    id: 'total_war',
    chapterNumber: 4,
    chapterTitle: 'The War of Attrition',
    title: 'Total War',
    tag: 'Chapter IV · Cumulative Differential',
    description: 'All three constraints converge: scarce reserves, sealed casualties, and a cumulative Campaign differential.',
    ruleSummary: 'Limited Reserves and Fog of War remain active. Every War also contributes its signed card margin to the final Campaign result.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves', 'fog_of_war', 'total_war']
  }
];

const MODIFIER_OPTIONS = CAMPAIGN_ORDER_OPTIONS.slice(1) as readonly CampaignModifierOption[];

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
  readonly modifierOptions = MODIFIER_OPTIONS;

  readonly selectedMode = signal<CampaignModeId>(this.progression.activeCampaignMode());
  readonly selectedModifiers = signal<readonly CampaignModifierId[]>(
    this.progression.activeCampaignModifiers()
  );
  readonly scriptedOption = computed(() =>
    CAMPAIGN_ORDER_OPTIONS.find(option => option.id === this.selectedMode()) ??
      CAMPAIGN_ORDER_OPTIONS[0]
  );
  readonly scriptedModifiers = computed(() =>
    getScriptedChapterModifiers(this.selectedMode())
  );

  readonly chapterFraming = computed<NarrativeTransitionRecord | null>(() => {
    if (!this.narrativeResolver || this.isReplay()) return null;
    return this.narrativeResolver.transitionFor(this.selectedMode(), 'orders') ??
      this.narrativeResolver.transitionFor('standard', 'orders');
  });

  isModifierEnabled(modifier: CampaignModifierId): boolean {
    return this.selectedModifiers().includes(modifier);
  }

  toggleModifier(modifier: CampaignModifierId): void {
    if (!this.isReplay()) return;
    const selected = new Set(this.selectedModifiers());
    if (selected.has(modifier)) {
      selected.delete(modifier);
    } else {
      selected.add(modifier);
    }
    this.selectedModifiers.set(
      this.modifierOptions
        .map(option => option.id)
        .filter(candidate => selected.has(candidate))
    );
  }

  confirmOrders(): void {
    const success = this.progression.selectCampaignOrders(
      this.selectedMode(),
      this.isReplay() ? this.selectedModifiers() : this.scriptedModifiers()
    );
    if (success) {
      this.dialogRef.close({
        mode: this.selectedMode(),
        modifiers: this.progression.activeCampaignModifiers()
      });
    }
  }
}
