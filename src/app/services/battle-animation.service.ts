import { Injectable, inject, signal } from '@angular/core';
import { PlayerType } from '../core/models/game-state.model';
import { SettingsService } from '../core/services/settings.service';

export type BattleAnimationMotion = 'full' | 'reduced';

export interface BattleAnimationScene {
  readonly id: number;
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly motion: BattleAnimationMotion;
}

@Injectable({ providedIn: 'root' })
export class BattleAnimationService {
  private readonly settings = inject(SettingsService);
  private readonly sceneSignal = signal<BattleAnimationScene | null>(null);
  private sceneId = 0;

  readonly scene = this.sceneSignal.asReadonly();

  request(winner: PlayerType): BattleAnimationScene | null {
    if (
      !this.settings.autoPlayAnimations() ||
      (winner !== PlayerType.PLAYER && winner !== PlayerType.OPPONENT)
    ) {
      this.sceneSignal.set(null);
      return null;
    }

    const scene: BattleAnimationScene = {
      id: ++this.sceneId,
      winner,
      loser: winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER,
      motion: this.prefersReducedMotion() ? 'reduced' : 'full',
    };
    this.sceneSignal.set(scene);
    return scene;
  }

  clear(sceneId?: number): void {
    if (sceneId !== undefined && this.sceneSignal()?.id !== sceneId) return;
    this.sceneSignal.set(null);
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
