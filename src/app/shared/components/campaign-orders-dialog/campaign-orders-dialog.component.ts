import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { CampaignModeId } from '../../../core/models/progression.model';

export interface CampaignOrderOption {
  readonly id: CampaignModeId;
  readonly title: string;
  readonly tag: string;
  readonly description: string;
  readonly ruleSummary: string;
  readonly reinforcementPolicy: string;
}

export const CAMPAIGN_ORDER_OPTIONS: readonly CampaignOrderOption[] = [
  {
    id: 'standard',
    title: 'Standard Campaign',
    tag: 'Classic Attrition',
    description: 'Traditional War of Attrition rules across a three-War series.',
    ruleSummary: 'Reinforcement opportunities are limited only by the cards in your physical deck.',
    reinforcementPolicy: 'Deck Count Only'
  },
  {
    id: 'limited_reserves',
    title: 'Limited Reserves',
    tag: 'Alternate Rules · 5 Reserves',
    description: 'A strict strategic constraint testing long-range resource management.',
    ruleSummary: 'You begin with exactly 5 reinforcements for the entire Three-War Campaign. Used reserves do not return between Wars.',
    reinforcementPolicy: '5 Reserves (Entire Campaign)'
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
  private readonly dialogRef = inject(MatDialogRef<CampaignOrdersDialogComponent>);

  readonly commander = this.progression.currentCommander;
  readonly options = CAMPAIGN_ORDER_OPTIONS;
  readonly selectedMode = signal<CampaignModeId>('standard');

  selectMode(mode: CampaignModeId): void {
    this.selectedMode.set(mode);
  }

  confirmOrders(): void {
    const success = this.progression.selectCampaignOrders(this.selectedMode());
    if (success) {
      this.dialogRef.close(this.selectedMode());
    }
  }
}
