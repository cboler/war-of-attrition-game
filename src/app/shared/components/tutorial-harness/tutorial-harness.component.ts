import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterLink } from '@angular/router';
import { TutorialService } from '../../../services/tutorial.service';
import { TutorialStep } from '../../../core/models/tutorial.model';
import { TutorialOverlayComponent } from '../tutorial-overlay/tutorial-overlay.component';
import { CardComponent } from '../card/card.component';
import { CardImpl, Rank, Suit } from '../../../core/models/card.model';

@Component({
  selector: 'app-tutorial-harness',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    RouterLink,
    TutorialOverlayComponent,
    CardComponent
  ],
  templateUrl: './tutorial-harness.component.html',
  styleUrl: './tutorial-harness.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialHarnessComponent {
  protected readonly tutorialService = inject(TutorialService);
  protected readonly tutorialStep = TutorialStep;

  protected readonly activeStep = signal<TutorialStep>(TutorialStep.FIRST_TURN);
  protected readonly viewportMode = signal<'mobile' | 'compact' | 'responsive'>('mobile');

  // Sample cards for mock display
  protected readonly samplePlayerCard = new CardImpl(Suit.SPADES, Rank.ACE);
  protected readonly sampleOpponentCard = new CardImpl(Suit.HEARTS, Rank.TWO);
  protected readonly sampleReinforcementCard = new CardImpl(Suit.DIAMONDS, Rank.KING);

  constructor() {
    this.selectStep(TutorialStep.FIRST_TURN);
  }

  selectStep(step: TutorialStep): void {
    this.activeStep.set(step);
    this.tutorialService.forceStep(step);
  }

  setViewport(mode: 'mobile' | 'compact' | 'responsive'): void {
    this.viewportMode.set(mode);
  }

  resetTutorial(): void {
    this.tutorialService.resetTutorialProgress();
    this.selectStep(this.activeStep());
  }
}
