import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  output,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TutorialService } from '../../../services/tutorial.service';

@Component({
  selector: 'app-tutorial-overlay',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './tutorial-overlay.component.html',
  styleUrl: './tutorial-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialOverlayComponent implements AfterViewInit {
  protected readonly tutorialService = inject(TutorialService);

  @ViewChild('actionBtn') private actionBtn?: ElementRef<HTMLButtonElement>;

  acknowledged = output<void>();
  skipped = output<void>();

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.actionBtn?.nativeElement?.focus();
    }, 100);
  }

  protected onAcknowledge(): void {
    this.tutorialService.acknowledgePrompt();
    this.acknowledged.emit();
  }

  protected onPrev(): void {
    this.tutorialService.prevTourStep();
  }

  protected onSkip(): void {
    this.tutorialService.skipTutorial();
    this.skipped.emit();
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onAcknowledge();
    } else if (event.key === 'ArrowLeft' && this.tutorialService.activePrompt()?.hasPrev) {
      event.preventDefault();
      this.onPrev();
    }
  }
}
