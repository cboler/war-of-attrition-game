import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PlayerType } from '../core/models/game-state.model';
import { Card } from '../core/models/card.model';
import { OpponentCommanderId } from '../core/models/commander.model';
import { GameStateService } from '../core/services/game-state.service';
import { SettingsService } from '../core/services/settings.service';
import { AchievementService } from '../services/achievement.service';
import { TutorialService } from '../services/tutorial.service';
import {
  GameControllerService,
  PresentationState,
  TableCardView,
  battleAnnouncementFor
} from '../services/game-controller.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../core/services/auth.service';
import { StoryBookService } from '../services/story-book.service';
import { ScreenshotStateLoader } from '../core/services/screenshot-state-loader';
import { CardComponent } from '../shared/components/card/card.component';
import { ComparisonStrengthComponent } from '../shared/components/comparison-strength/comparison-strength.component';
import { GameOverSummaryComponent } from '../shared/components/game-over-summary/game-over-summary.component';
import { CardTableComponent } from '../shared/components/card-table/card-table.component';
import { PlayerSeatComponent } from '../shared/components/player-seat/player-seat.component';
import { StoryBookDrawerComponent } from '../shared/components/story-book-drawer/story-book-drawer.component';
import { TutorialOverlayComponent } from '../shared/components/tutorial-overlay/tutorial-overlay.component';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { CampaignOrdersDialogComponent } from '../shared/components/campaign-orders-dialog/campaign-orders-dialog.component';

@Component({
  selector: 'app-table-game',
  imports: [
    CommonModule,
    MatIconModule,
    CardComponent,
    ComparisonStrengthComponent,
    GameOverSummaryComponent,
    CardTableComponent,
    PlayerSeatComponent,
    StoryBookDrawerComponent,
    TutorialOverlayComponent
  ],
  templateUrl: './table-game.html',
  styleUrl: './table-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableGame implements OnInit {
  protected readonly controller = inject(GameControllerService);
  protected readonly gameState = inject(GameStateService);
  protected readonly settings = inject(SettingsService);
  protected readonly achievements = inject(AchievementService);
  protected readonly tutorial = inject(TutorialService);
  protected readonly auth = inject(AuthService);
  protected readonly storyBook = inject(StoryBookService);
  protected readonly progression = inject(CampaignProgressionService);
  protected readonly dialog = inject(MatDialog);
  protected readonly state = PresentationState;
  protected readonly player = PlayerType;
  protected readonly boneyardOpen = signal(false);
  protected readonly storyBookOpen = signal(false);
  protected readonly manualReferenceCard = signal<Card | null>(null);
  protected readonly dossierTargetCommander = signal<OpponentCommanderId | null>(null);

  protected readonly opponentThinking = computed(() =>
    this.controller.presentationState() === PresentationState.OPPONENT_CONSIDERING_CHALLENGE ||
    this.controller.presentationState() === PresentationState.OPPONENT_TARGET_SELECTION
  );
  protected readonly battleActive = computed(() => this.controller.battleLayers().length > 0);
  protected readonly activeCardsFaceDown = computed(() =>
    this.controller.presentationState() === PresentationState.DRAWING
  );
  protected readonly challengeCardsFaceDown = computed(() =>
    this.controller.presentationState() === PresentationState.CHALLENGE_DRAW
  );
  protected readonly opponentQuip = computed(() =>
    this.controller.tableReaction()?.speaker === PlayerType.OPPONENT
      ? this.controller.tableReaction()?.message ?? null
      : null
  );
  protected readonly playerQuip = computed(() =>
    this.controller.tableReaction()?.speaker === PlayerType.PLAYER
      ? this.controller.tableReaction()?.message ?? null
      : null
  );
  protected readonly newestBattleRound = computed(() => this.controller.battleLayers().length);
  protected readonly battleAnnouncement = computed(() => {
    const round = this.newestBattleRound();
    return battleAnnouncementFor(round);
  });

  protected readonly isFogOfWarActive = computed(() => this.controller.isFogOfWarActive());

  protected readonly playerReserves = computed(() => {
    if (!this.progression.isLimitedReserves()) return null;
    const remaining = this.progression.remainingReserves() ?? 0;
    const max = this.progression.initialReserves() ?? 5;
    return { remaining, max };
  });

  protected readonly playerTotalWarDiff = computed(() => {
    if (!this.progression.isTotalWar()) return null;
    return this.progression.runningCampaignDifferential();
  });

  protected readonly boneyardThicknessClass = computed(() => {
    const count = this.controller.visibleBoneyardCount();
    if (count === 0) return 'boneyard-0';
    if (count <= 4) return 'boneyard-single';
    if (count <= 14) return 'boneyard-small';
    if (count <= 24) return 'boneyard-substantial';
    return 'boneyard-heavy';
  });

  ngOnInit(): void {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = searchParams?.get('scene') || searchParams?.get('screenshot_scene');
    if (sceneParam) {
      ScreenshotStateLoader.loadScene(sceneParam, {
        controller: this.controller,
        gameState: this.gameState,
        settings: this.settings,
        auth: this.auth,
        storyBook: this.storyBook,
        dialog: this.dialog,
        boneyardOpen: this.boneyardOpen,
        storyBookOpen: this.storyBookOpen,
        manualReferenceCard: this.manualReferenceCard
      });
      return;
    }

    this.controller.ensureGameStarted();
    if (!this.progression.ordersSelected() && this.progression.campaignWarIndex() === 1) {
      this.openCampaignOrdersDialog();
    }
  }

  protected openCampaignOrdersDialog(): void {
    const dialogRef = this.dialog.open(CampaignOrdersDialogComponent, {
      panelClass: 'themed-dialog-panel',
      disableClose: true,
      autoFocus: true,
      width: '94vw',
      maxWidth: '580px'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.controller.ensureGameStarted();
      this.controller.speakIntroduction();
    });

  }

  protected draw(): void {
    if (!this.progression.ordersSelected() && this.progression.campaignWarIndex() === 1) {
      this.openCampaignOrdersDialog();
      return;
    }
    this.controller.playerDrawCard();
  }

  protected chooseChallenge(accept: boolean): void {
    this.controller.handleChallenge(accept);
  }

  protected chooseTarget(view: TableCardView): void {
    this.controller.selectBattleCard(view.id);
  }

  protected advancePresentation(): void {
    this.controller.advancePresentation();
  }

  protected onTableClick(event: MouseEvent): void {
    const element = event.target as HTMLElement | null;
    if (
      element?.closest(
        'button, a, details, summary, .achievement-toast, .story-book-drawer, .drawer-backdrop, .boneyard-drawer, .tutorial-overlay',
      )
    )
      return;
    this.advancePresentation();
  }

  protected restart(): void {
    this.boneyardOpen.set(false);
    this.storyBookOpen.set(false);
    this.manualReferenceCard.set(null);
    this.controller.startNewGame();
    if (!this.progression.ordersSelected() && this.progression.campaignWarIndex() === 1) {
      this.openCampaignOrdersDialog();
    }
  }

  protected toggleBoneyard(): void {
    if (this.isFogOfWarActive()) return;
    this.boneyardOpen.update(open => !open);
  }

  protected toggleStoryBook(): void {
    if (this.storyBookOpen()) {
      this.closeStoryBook();
      return;
    }
    this.manualReferenceCard.set(null);
    this.dossierTargetCommander.set(null);
    this.storyBookOpen.set(true);
  }

  protected openCommanderDossier(commanderId?: OpponentCommanderId): void {
    this.manualReferenceCard.set(null);
    this.dossierTargetCommander.set(commanderId ?? this.controller.opponentCommanderIdentity().commanderId);
    this.storyBookOpen.set(true);
  }

  protected closeStoryBook(): void {
    this.storyBookOpen.set(false);
    this.manualReferenceCard.set(null);
    this.dossierTargetCommander.set(null);
  }

  protected openBoneyardReference(card: Card): void {
    if (this.isFogOfWarActive()) return;
    this.dossierTargetCommander.set(null);
    this.manualReferenceCard.set(card);
    this.storyBookOpen.set(true);
  }

  protected cardAccessibleName(card: Card): string {
    return `${card.rank} of ${card.suit}`;
  }

  protected isReturning(id: string): boolean {
    return this.controller.cardsReturningHome().includes(id);
  }

  protected isGoingToBoneyard(id: string): boolean {
    return this.controller.cardsMovingToBoneyard().includes(id);
  }

  protected battleQuakeLevel(level: number): boolean {
    return this.newestBattleRound() === level && this.settings.autoPlayAnimations();
  }

  protected cardGlow(cardId: string): 'green' | 'red' | 'blue' | null {
    const strength = this.controller.comparisonStrengthFor(cardId);
    if (!strength || strength.state === 'ready') return null;
    if (strength.state === 'winner') return 'green';
    if (strength.state === 'defeated') return 'red';
    return 'blue';
  }
}
