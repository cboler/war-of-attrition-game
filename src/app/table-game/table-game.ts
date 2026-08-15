import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayerType } from '../core/models/game-state.model';
import { GameStateService } from '../core/services/game-state.service';
import { SettingsService } from '../core/services/settings.service';
import {
  GameControllerService,
  PresentationState,
  TableCardView
} from '../services/game-controller.service';
import { CardComponent } from '../shared/components/card/card.component';
import { CardTableComponent } from '../shared/components/card-table/card-table.component';
import { PlayerSeatComponent } from '../shared/components/player-seat/player-seat.component';

@Component({
  selector: 'app-table-game',
  imports: [RouterLink, CardComponent, CardTableComponent, PlayerSeatComponent],
  templateUrl: './table-game.html',
  styleUrl: './table-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableGame implements OnInit {
  protected readonly controller = inject(GameControllerService);
  protected readonly gameState = inject(GameStateService);
  protected readonly settings = inject(SettingsService);
  protected readonly state = PresentationState;
  protected readonly player = PlayerType;
  protected readonly boneyardOpen = signal(false);

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

  ngOnInit(): void {
    this.controller.startNewGame();
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
    if (element?.closest('button, a, details, summary')) return;
    this.advancePresentation();
  }

  protected restart(): void {
    this.boneyardOpen.set(false);
    this.controller.startNewGame();
  }

  protected toggleSound(): void {
    this.settings.setSoundEnabled(!this.settings.soundEnabled());
  }

  protected toggleBoneyard(): void {
    this.boneyardOpen.update(open => !open);
  }

  protected isReturning(id: string): boolean {
    return this.controller.cardsReturningHome().includes(id);
  }

  protected isGoingToBoneyard(id: string): boolean {
    return this.controller.cardsMovingToBoneyard().includes(id);
  }

  protected cardGlow(owner: PlayerType): 'green' | 'red' | 'blue' | null {
    const result = this.gameState.currentState.lastResult;
    if (result === 'tie') return 'blue';
    if (result === 'player_wins') return owner === PlayerType.PLAYER ? 'green' : 'red';
    if (result === 'opponent_wins') return owner === PlayerType.OPPONENT ? 'green' : 'red';
    return null;
  }

}
