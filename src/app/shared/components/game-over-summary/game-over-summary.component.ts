import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { CurrentGameSummary } from '../../../services/game-controller.service';

@Component({
  selector: 'app-game-over-summary',
  imports: [MatIconModule],
  templateUrl: './game-over-summary.component.html',
  styleUrl: './game-over-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverSummaryComponent {
  readonly message = input.required<string>();
  readonly summary = input<CurrentGameSummary | null>(null);
  readonly manualRequested = output<void>();
  readonly replayRequested = output<void>();

  isTotalWar(): boolean {
    const summary = this.summary();
    return summary?.campaignModifiers?.includes('total_war') ?? summary?.campaignMode === 'total_war';
  }
}
