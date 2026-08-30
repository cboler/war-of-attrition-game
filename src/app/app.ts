import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { SettingsService } from './core/services/settings.service';
import { ProfileDialogComponent } from './shared/components/profile-dialog/profile-dialog.component';
import { GameTelemetryService } from './services/game-telemetry.service';
import { AnalyticsConsentPromptService } from './services/analytics-consent-prompt.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--app-viewport-height.px]': 'viewportHeight()',
  },
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private dialog = inject(MatDialog);
  // Eager construction is required because GameEventBusService is non-replaying.
  private readonly gameTelemetry = inject(GameTelemetryService);
  // The post-War consent invitation also observes the non-replaying game bus.
  private readonly analyticsConsentPrompt = inject(AnalyticsConsentPromptService);

  protected readonly title = signal('ATTRITION');
  protected readonly activeProfile = this.authService.activeProfile;
  protected readonly deckHand = this.settingsService.deckHand;
  protected readonly profileButtonLabel = computed(
    () => `Open profile for ${this.activeProfile().name}; career records, achievements, and settings`
  );
  protected readonly viewportHeight = signal(this.measureViewportHeight());
  private resizeObserver: ResizeObserver | null = null;
  private settleFrame: number | null = null;
  private readonly syncViewportHeight = () => {
    this.viewportHeight.set(this.measureViewportHeight());
  };

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', this.syncViewportHeight, { passive: true });
    window.addEventListener('orientationchange', this.syncViewportHeight, { passive: true });
    window.addEventListener('pageshow', this.syncViewportHeight, { passive: true });
    window.visualViewport?.addEventListener('resize', this.syncViewportHeight, { passive: true });
    document.addEventListener('visibilitychange', this.syncViewportHeight, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.syncViewportHeight);
      this.resizeObserver.observe(document.documentElement);
    }

    // Chromium/TWA can publish its final visual viewport after Angular's first
    // layout. One post-layout measurement makes first entry match later redraws.
    this.settleFrame = window.requestAnimationFrame(this.syncViewportHeight);
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', this.syncViewportHeight);
    window.removeEventListener('orientationchange', this.syncViewportHeight);
    window.removeEventListener('pageshow', this.syncViewportHeight);
    window.visualViewport?.removeEventListener('resize', this.syncViewportHeight);
    document.removeEventListener('visibilitychange', this.syncViewportHeight);
    this.resizeObserver?.disconnect();
    if (this.settleFrame !== null) window.cancelAnimationFrame(this.settleFrame);
  }

  protected openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100dvh - 20px)',
      closeOnNavigation: true,
      panelClass: 'glass-dialog-panel'
    });
  }

  private measureViewportHeight(): number {
    if (typeof window === 'undefined') return 0;
    const visualHeight = window.visualViewport?.height;
    const measured = visualHeight && visualHeight > 0 ? visualHeight : window.innerHeight;
    return Math.max(1, Math.round(measured));
  }
}
