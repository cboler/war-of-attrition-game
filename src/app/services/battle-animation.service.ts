import { Injectable, inject, signal } from '@angular/core';
import { DeckColor, PlayerType } from '../core/models/game-state.model';
import { SettingsService } from '../core/services/settings.service';
import { SkirmishPlan, SkirmishVariant, buildSkirmishPlan } from './skirmish-plan';

export type BattleAnimationMotion = 'full' | 'reduced';

/** Public facts about the decided comparison that shape its skirmish. */
export interface SkirmishContext {
  /** A Two beat an Ace. */
  readonly giantKiller?: boolean;
  /** 0 = the narrowest win, 1 = a rout. */
  readonly margin?: number;
  /** Battle depth of the comparison; 0 outside a Battle. */
  readonly depth?: number;
}

export interface BattleAnimationScene {
  readonly id: number;
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly playerColor: DeckColor;
  readonly opponentColor: DeckColor;
  readonly motion: BattleAnimationMotion;
  readonly variant: SkirmishVariant;
  readonly durationMs: number;
  readonly plan: SkirmishPlan;
}

/** Length of a standard skirmish at each animation speed. */
export const SKIRMISH_DURATION_MS = { slow: 1830, normal: 1400, fast: 1050 } as const;
/** A Two felling an Ace is rare enough to earn a longer beat. */
export const GIANT_KILLER_DURATION_SCALE = 1.6;

@Injectable({ providedIn: 'root' })
export class BattleAnimationService {
  private readonly settings = inject(SettingsService);
  private readonly sceneSignal = signal<BattleAnimationScene | null>(null);
  private sceneId = 0;

  readonly scene = this.sceneSignal.asReadonly();

  request(
    winner: PlayerType,
    playerColor: DeckColor,
    context: SkirmishContext = {},
  ): BattleAnimationScene | null {
    if (
      !this.settings.autoPlayAnimations() ||
      (winner !== PlayerType.PLAYER && winner !== PlayerType.OPPONENT)
    ) {
      this.sceneSignal.set(null);
      return null;
    }

    const variant: SkirmishVariant = context.giantKiller ? 'giant-killer' : 'standard';
    const base = SKIRMISH_DURATION_MS[this.settings.animationSpeed()] ?? SKIRMISH_DURATION_MS.normal;
    const scene: BattleAnimationScene = {
      id: ++this.sceneId,
      winner,
      loser: winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER,
      playerColor,
      opponentColor: playerColor === DeckColor.RED ? DeckColor.BLACK : DeckColor.RED,
      motion: this.prefersReducedMotion() ? 'reduced' : 'full',
      variant,
      durationMs: Math.round(base * (variant === 'giant-killer' ? GIANT_KILLER_DURATION_SCALE : 1)),
      plan: buildSkirmishPlan({
        winner,
        variant,
        margin: context.margin,
        depth: context.depth,
        seed: Math.floor(Math.random() * 0xffffffff),
      }),
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
