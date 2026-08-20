import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PlayerType } from '../core/models/game-state.model';
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
import { CardComponent } from '../shared/components/card/card.component';
import { CardTableComponent } from '../shared/components/card-table/card-table.component';
import { PlayerSeatComponent } from '../shared/components/player-seat/player-seat.component';
import { StoryBookDrawerComponent } from '../shared/components/story-book-drawer/story-book-drawer.component';
import { TutorialOverlayComponent } from '../shared/components/tutorial-overlay/tutorial-overlay.component';

@Component({
  selector: 'app-table-game',
  imports: [
    CommonModule,
    MatIconModule,
    CardComponent,
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
  protected readonly state = PresentationState;
  protected readonly player = PlayerType;
  protected readonly boneyardOpen = signal(false);
  protected readonly storyBookOpen = signal(false);

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

  protected readonly boneyardThicknessClass = computed(() => {
    const count = this.controller.visibleBoneyardCount();
    if (count === 0) return 'boneyard-0';
    if (count <= 4) return 'boneyard-single';
    if (count <= 14) return 'boneyard-small';
    if (count <= 24) return 'boneyard-substantial';
    return 'boneyard-heavy';
  });

  ngOnInit(): void {
    this.controller.ensureGameStarted();
  }

  protected draw(): void {
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
    if (element?.closest('button, a, details, summary, .achievement-toast, .story-book-drawer, .boneyard-drawer, .tutorial-overlay')) return;
    this.advancePresentation();
  }

  protected restart(): void {
    this.boneyardOpen.set(false);
    this.storyBookOpen.set(false);
    this.controller.startNewGame();
  }

  protected toggleBoneyard(): void {
    this.boneyardOpen.update(open => !open);
  }

  protected toggleStoryBook(): void {
    this.storyBookOpen.update(open => !open);
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

  protected cardGlow(owner: PlayerType): 'green' | 'red' | 'blue' | null {
    const result = this.gameState.currentState.lastResult;
    if (result === 'tie') return 'blue';
    if (result === 'player_wins') return owner === PlayerType.PLAYER ? 'green' : 'red';
    if (result === 'opponent_wins') return owner === PlayerType.OPPONENT ? 'green' : 'red';
    return null;
  }
}
