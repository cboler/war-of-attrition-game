import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerType } from '../../../core/models/game-state.model';
import { BattleAnimationScene } from '../../../services/battle-animation.service';

@Component({
  selector: 'app-battle-animation',
  templateUrl: './battle-animation.component.html',
  styleUrl: './battle-animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleAnimationComponent {
  readonly scene = input.required<BattleAnimationScene>();
  protected readonly player = PlayerType;
  protected readonly units = [0, 1, 2, 3, 4] as const;
}
