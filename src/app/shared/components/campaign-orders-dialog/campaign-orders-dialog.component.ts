import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { CampaignModifierId, CampaignModeId } from '../../../core/models/progression.model';
import { getScriptedChapterModifiers } from '../../../core/models/campaign-chapter.model';
import { CommanderIdentity, getCommanderIdentity } from '../../../core/models/commander-identity.model';
import { COMMANDER_IDS, OpponentCommanderId } from '../../../core/models/commander.model';
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

export interface CustomRuleOption {
  readonly id: CampaignModifierId;
  readonly title: string;
  readonly description: string;
  readonly ruleSummary: string;
}

export const CAMPAIGN_ORDER_OPTIONS: readonly CampaignOrderOption[] = [
  {
    id: 'standard',
    chapterNumber: 1,
    chapterTitle: 'The Accord',
    title: 'Standard Campaign',
    tag: 'Chapter I · Classic Attrition',
    description: 'Classic rules across three Wars.',
    ruleSummary: 'You can reinforce as long as you have cards.',
    reinforcementPolicy: 'Deck Count Only',
    modifiers: []
  },
  {
    id: 'limited_reserves',
    chapterNumber: 2,
    chapterTitle: 'The Closing Passes',
    title: 'Limited Reserves',
    tag: 'Chapter II · 5 Reserves',
    description: 'Reinforcements are scarce. Spend them carefully.',
    ruleSummary: '5 reinforcements for the whole Campaign. Spent reserves don’t come back between Wars.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves']
  },
  {
    id: 'fog_of_war',
    chapterNumber: 3,
    chapterTitle: 'The Blind Wheel',
    title: 'Fog of War',
    tag: 'Chapter III · Imperfect Information',
    description: 'Five reserves, and now you fight blind: the Boneyard stays sealed until each War ends.',
    ruleSummary: 'Limited Reserves still applies. Casualties and past clashes stay hidden until the War ends.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves', 'fog_of_war']
  },
  {
    id: 'total_war',
    chapterNumber: 4,
    chapterTitle: 'The War of Attrition',
    title: 'Total War',
    tag: 'Chapter IV · Cumulative Differential',
    description: 'Everything at once: scarce reserves, sealed casualties, and every card counted.',
    ruleSummary: 'Limited Reserves and Fog of War still apply. Each War’s card margin adds to a Campaign total that decides the result.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)',
    modifiers: ['limited_reserves', 'fog_of_war', 'total_war']
  }
];

export const CUSTOM_CAMPAIGN_RULES: readonly CustomRuleOption[] = [
  {
    id: 'limited_reserves',
    title: 'Limited Reserves',
    description: 'Caps reinforcements for the whole Campaign.',
    ruleSummary: '5 reinforcements for the whole Campaign. Spent reserves don’t come back between Wars.'
  },
  {
    id: 'fog_of_war',
    title: 'Fog of War',
    description: 'Hides casualties until each War ends.',
    ruleSummary: 'The Boneyard, casualties and Hall of Valor stay sealed until the War ends.'
  },
  {
    id: 'total_war',
    title: 'Campaign Differential',
    description: "Each War's signed card margin contributes to the final Campaign result.",
    ruleSummary: 'Each War keeps its own result, but the combined card margin decides the Campaign.'
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

  readonly isReplay = computed<boolean>(() =>
    this.progression.isAllChaptersCompleted()
  );

  readonly availableCommanders = COMMANDER_IDS;
  readonly selectedCommanderId = signal<OpponentCommanderId>(
    this.progression.currentCommanderId()
  );
  readonly showCommanderPicker = signal<boolean>(false);

  readonly commanderIdentity = computed<CommanderIdentity>(() => {
    if (this.isReplay()) {
      return getCommanderIdentity(this.selectedCommanderId());
    }
    return this.progression.currentCommanderIdentity();
  });

  readonly options = CAMPAIGN_ORDER_OPTIONS;
  readonly customRules = CUSTOM_CAMPAIGN_RULES;
  readonly modifierOptions = CUSTOM_CAMPAIGN_RULES;

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
    const current = this.selectedModifiers();
    if (current.includes(modifier)) {
      this.selectedModifiers.set(current.filter(m => m !== modifier));
    } else {
      const order: CampaignModifierId[] = ['limited_reserves', 'fog_of_war', 'total_war'];
      const next = new Set([...current, modifier]);
      this.selectedModifiers.set(order.filter(m => next.has(m)));
    }
  }

  selectCommander(id: OpponentCommanderId): void {
    this.selectedCommanderId.set(id);
    this.showCommanderPicker.set(false);
  }

  toggleCommanderPicker(): void {
    this.showCommanderPicker.update(v => !v);
  }

  cycleCommander(): void {
    const all = this.availableCommanders;
    const currentIdx = all.indexOf(this.selectedCommanderId());
    const nextIdx = (currentIdx + 1) % all.length;
    this.selectedCommanderId.set(all[nextIdx]);
  }

  getCommanderInfo(id: OpponentCommanderId): CommanderIdentity {
    return getCommanderIdentity(id);
  }

  confirmOrders(): void {
    const success = this.isReplay()
      ? this.progression.selectCampaignOrders(
          this.selectedMode(),
          this.selectedModifiers(),
          this.selectedCommanderId()
        )
      : this.progression.selectCampaignOrders(
          this.selectedMode(),
          this.scriptedModifiers()
        );
    if (success) {
      this.dialogRef.close({
        mode: this.selectedMode(),
        modifiers: this.progression.activeCampaignModifiers()
      });
    }
  }
}

