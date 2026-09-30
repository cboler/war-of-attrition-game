import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  isDevMode,
  untracked,
  viewChild,
} from '@angular/core';
import { DeckColor, GameOutcome, PlayerType } from '../../core/models/game-state.model';
import { GameStateService } from '../../core/services/game-state.service';
import { AchievementService } from '../../services/achievement.service';
import { BattleAnimationScene } from '../../services/battle-animation.service';
import { GameControllerService, PresentationState } from '../../services/game-controller.service';
import type { FxPoint, TableFxEngine } from './table-fx-engine';
import { TableFxService } from './table-fx.service';

interface ArmyPalette {
  readonly primary: string;
  readonly secondary: string;
}

const RED_ARMY: ArmyPalette = { primary: '#ff5f45', secondary: '#ffd38a' };
const STEEL_ARMY: ArmyPalette = { primary: '#8fd0ff', secondary: '#eef8ff' };
const GILT = '#ffd27a';
const EMBER = '#ff8a3d';
const GIANT_KILLER = '#c9a2ff';

/**
 * Presentation director for the WebGL overlay.
 *
 * It only observes public presentation signals that already drive the CSS
 * choreography, measures the DOM those signals produced, and asks the engine
 * for decoration. It never reads hidden state and never feeds back into play.
 */
@Component({
  selector: 'app-table-fx',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: 30;
      display: block;
      overflow: hidden;
      pointer-events: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class TableFxOverlayComponent {
  private readonly fx = inject(TableFxService);
  private readonly controller = inject(GameControllerService);
  private readonly gameState = inject(GameStateService);
  private readonly achievements = inject(AchievementService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private engine: TableFxEngine | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;
  private lastPhase: PresentationState | null = null;
  private lastDepth = 0;
  private lastClashKey = '';
  private lastSceneId = 0;

  constructor() {
    afterNextRender(() => void this.boot());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.resizeObserver?.disconnect();
      this.engine = null;
      this.fx.detachOverlay();
    });

    effect(() => {
      const phase = this.controller.presentationState();
      untracked(() => this.stage(() => this.onPhase(phase)));
    });
    effect(() => {
      const depth = this.controller.battleLayers().length;
      untracked(() => this.stage(() => this.onBattleDepth(depth)));
    });
    effect(() => {
      const scene = this.controller.battleAnimation();
      untracked(() => scene && this.stage(() => this.onSkirmish(scene)));
    });
    effect(() => {
      const owner = this.controller.deckDefeatPopOwner();
      untracked(() => owner && this.stage(() => this.onDeckDefeat(owner)));
    });
    effect(() => {
      const unlock = this.achievements.latestUnlock();
      untracked(() => unlock && this.stage(() => this.onAchievement()));
    });
  }

  private async boot(): Promise<void> {
    const engine = await this.fx.attachOverlay(this.canvas().nativeElement);
    if (!engine) return;
    if (this.destroyed) {
      this.fx.detachOverlay();
      return;
    }
    this.engine = engine;
    if (isDevMode()) {
      // Development-only handle for tuning effects from the console.
      (globalThis as { __attritionFx?: TableFxEngine }).__attritionFx = engine;
    }
    this.zone.runOutsideAngular(() => {
      const resize = () => {
        const rect = this.host.nativeElement.getBoundingClientRect();
        engine.resizeOverlay(rect.width, rect.height, window.devicePixelRatio || 1);
      };
      resize();
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.host.nativeElement);
    });
    this.syncMood();
  }

  /** Waits for Angular to paint the DOM the signal change produced, outside the zone. */
  private stage(run: () => void): void {
    if (!this.engine) return;
    this.zone.runOutsideAngular(() => requestAnimationFrame(() => this.engine && run()));
  }

  /* ------------------------------ handlers ------------------------------ */

  private onPhase(phase: PresentationState): void {
    const previous = this.lastPhase;
    this.lastPhase = phase;
    switch (phase) {
      case PresentationState.DRAWING:
        if (previous === PresentationState.GAME_OVER || previous === null) this.engine!.setOutcome(null);
        this.landingDust();
        break;
      case PresentationState.CLASH_RESOLUTION:
      case PresentationState.CHALLENGE_CLASH:
        this.activeClash(phase);
        break;
      case PresentationState.BATTLE_REVEAL:
        this.battleClash();
        break;
      case PresentationState.BATTLE_TIE:
        this.battleTie();
        break;
      case PresentationState.CASUALTY_REVEAL:
        this.casualtyFlares();
        break;
      case PresentationState.RETURN_WINNER_CARDS:
        this.returnTrails();
        break;
      case PresentationState.SEND_LOSER_CARDS_TO_BONEYARD:
        this.boneyardTrails();
        break;
      case PresentationState.GAME_OVER:
        this.finale();
        break;
      case PresentationState.READY:
        if (previous === PresentationState.GAME_OVER) this.engine!.setOutcome(null);
        this.syncMood();
        break;
    }
  }

  private onBattleDepth(depth: number): void {
    const engine = this.engine!;
    const previous = this.lastDepth;
    this.lastDepth = depth;
    engine.setTension(tensionFor(depth));
    if (depth <= previous || depth === 0) return;

    const entry = this.cssDuration('--battle-entry-duration', 598);
    engine.after(entry * 0.72, () => {
      const center = this.clashCenter();
      if (!center) return;
      const width = this.host.nativeElement.clientWidth;
      const heat = depth >= 3 ? '#ff5a2a' : depth === 2 ? EMBER : GILT;
      engine.shake(3 + depth * 2.5);
      engine.ring(center, { color: heat, radius: 170 + depth * 70, duration: 0.75, thickness: 0.045 });
      engine.ring(center, { color: '#fff1cf', radius: 90 + depth * 30, duration: 0.45, thickness: 0.08, delay: 70 });
      engine.dust(center, { count: 26 + depth * 8, spread: 260 + depth * 60, width: Math.min(width * 0.3, 160) });
      engine.sparks(center, { color: heat, secondary: '#ffe9b0', count: 30 + depth * 25, speed: 380 + depth * 90 });
      if (depth >= 3) {
        engine.embers({ x: center.x, y: center.y + 40 }, { color: '#ff6a2a', count: 60, width: width * 0.35, rise: 320 });
      }
      this.pulseBackdropAt(center, 0.7 + depth * 0.25);
    });
  }

  private onSkirmish(scene: BattleAnimationScene): void {
    if (scene.id === this.lastSceneId || scene.motion !== 'full') return;
    this.lastSceneId = scene.id;
    const engine = this.engine!;
    const stage = this.rectOf('app-battle-animation');
    if (!stage) return;
    const duration = this.cssDuration('--battle-animation-duration', 920);
    const center = { x: stage.x, y: stage.y };
    const halfWidth = stage.width / 2;
    const ground = stage.y + stage.height * 0.32;
    const winner = this.armyFor(scene.winner);

    engine.dust({ x: center.x - halfWidth * 0.75, y: ground }, { count: 10, spread: 70, width: 30 });
    engine.dust({ x: center.x + halfWidth * 0.75, y: ground }, { count: 10, spread: 70, width: 30 });
    engine.after(duration * 0.43, () => {
      engine.flash(center, 110, '#fff0c2', 0.25);
      engine.sparks(center, { color: winner.primary, secondary: winner.secondary, count: 70, speed: 460 });
      engine.ring(center, { color: winner.secondary, radius: 130, duration: 0.5, thickness: 0.05 });
      engine.shake(3);
      this.pulseBackdropAt(center, 0.6);
    });
    engine.after(duration * 0.6, () => {
      const loserSide = scene.loser === PlayerType.PLAYER ? -1 : 1;
      engine.dust({ x: center.x + loserSide * halfWidth * 0.35, y: ground }, { count: 16, spread: 110, width: 40 });
    });
  }

  private onDeckDefeat(owner: PlayerType): void {
    const deck = this.rectOf(this.deckSelector(owner));
    if (!deck) return;
    const engine = this.engine!;
    const palette = this.armyFor(owner);
    engine.flash(deck, 120, palette.primary, 0.35);
    engine.sparks(deck, { color: palette.primary, secondary: EMBER, count: 70, speed: 380 });
    engine.ring(deck, { color: palette.secondary, radius: 140, duration: 0.6 });
    engine.dust(deck, { count: 22, spread: 150 });
  }

  private onAchievement(): void {
    this.engine!.after(120, () => {
      const icon = this.rectOf('.achievement-toast .toast-icon') ?? this.rectOf('.achievement-toast');
      if (!icon) return;
      this.engine?.starburst(icon, GILT);
      this.engine?.confettiBurst(icon, 36);
    });
  }

  /* ------------------------------ vignettes ----------------------------- */

  private landingDust(): void {
    const deal = this.cssDuration('--deal-duration', 322);
    this.engine!.after(deal * 0.92, () => {
      for (const shell of this.all('.active-card-shell')) {
        const rect = shell.getBoundingClientRect();
        if (!rect.width) continue;
        const origin = this.local(rect.left + rect.width / 2, rect.bottom - 4);
        this.engine?.dust(origin, { count: 7, spread: 70, width: rect.width * 0.35, color: '#a89f86' });
      }
    });
  }

  private activeClash(phase: PresentationState): void {
    const key = [
      phase,
      this.controller.activePlayerCard()?.id,
      this.controller.activeOpponentCard()?.id,
      this.controller.playerChallengeCard()?.id,
      this.controller.opponentChallengeCard()?.id,
    ].join('|');
    if (key === this.lastClashKey) return;
    this.lastClashKey = key;
    const clash = this.cssDuration('--clash-duration', 345);
    this.engine!.after(clash * 0.5, () => {
      const center = this.clashCenter();
      if (center) this.impact(center, 1);
    });
  }

  private battleClash(): void {
    this.engine!.after(90, () => {
      const selected = this.all('.battle-card-shell.selected').map((element) => this.centerOf(element));
      const center = selected.length >= 2 ? midpoint(selected[0], selected[1]) : this.clashCenter();
      if (center) this.impact(center, 1.35);
    });
  }

  private battleTie(): void {
    const engine = this.engine!;
    engine.after(60, () => {
      const center = this.clashCenter();
      if (!center) return;
      const player = this.armyFor(PlayerType.PLAYER);
      const opponent = this.armyFor(PlayerType.OPPONENT);
      engine.flash(center, 160, '#dff3ff', 0.35);
      engine.sparks(center, { color: player.primary, secondary: player.secondary, direction: { x: 0, y: 1 }, count: 60, speed: 520 });
      engine.sparks(center, { color: opponent.primary, secondary: opponent.secondary, direction: { x: 0, y: -1 }, count: 60, speed: 520 });
      engine.ring(center, { color: '#cfe9ff', radius: 220, duration: 0.7, thickness: 0.04 });
      engine.shake(6);
      this.pulseBackdropAt(center, 1.1);
    });
  }

  private impact(center: FxPoint, weight: number): void {
    const engine = this.engine!;
    const comparison = this.controller.comparisonPresentation();
    const playerState = comparison?.player.state;
    const opponentState = comparison?.opponent.state;
    const special = !!(comparison?.player.specialOverride || comparison?.opponent.specialOverride);

    if (playerState === 'tie' || opponentState === 'tie') {
      engine.sparks(center, { color: '#e6f4ff', secondary: GILT, count: 70 * weight, speed: 480 });
      engine.ring(center, { color: '#e6f4ff', radius: 150 * weight, duration: 0.55 });
    } else {
      const winner = playerState === 'winner' ? PlayerType.PLAYER : opponentState === 'winner' ? PlayerType.OPPONENT : null;
      const palette = winner ? this.armyFor(winner) : { primary: GILT, secondary: '#fff4d6' };
      // The victor's sparks drive into the beaten card's half of the table.
      const direction = winner === PlayerType.PLAYER ? { x: 0, y: -1 } : winner === PlayerType.OPPONENT ? { x: 0, y: 1 } : undefined;
      engine.flash(center, 90 * weight, palette.secondary, 0.22);
      engine.sparks(center, {
        color: palette.primary,
        secondary: palette.secondary,
        direction,
        count: 55 * weight,
        speed: 470 * weight,
        spread: 1.25,
      });
      engine.ring(center, { color: palette.primary, radius: 120 * weight, duration: 0.5 });
    }
    if (special) {
      engine.starburst(center, GIANT_KILLER, '#f4e7ff');
      engine.shake(5);
    } else {
      engine.shake(1.5 * weight);
    }
    this.pulseBackdropAt(center, 0.55 * weight);
  }

  private casualtyFlares(): void {
    const engine = this.engine!;
    engine.after(80, () => {
      for (const element of this.all('.casualty-major')) {
        const at = this.centerOf(element);
        engine.flash(at, 120, '#ff4a3a', 0.4);
        engine.sparks(at, { color: '#ff4a3a', secondary: GILT, count: 50, speed: 360 });
        engine.ring(at, { color: '#ff7a5a', radius: 110, duration: 0.6 });
      }
      for (const element of this.all('.casualty-face')) {
        const at = this.centerOf(element);
        engine.flash(at, 80, GILT, 0.3);
        engine.embers(at, { color: GILT, count: 14, width: 24, rise: 120 });
      }
    });
  }

  private returnTrails(): void {
    const engine = this.engine!;
    const duration = this.cssDuration('--return-duration', 414) / 1000;
    this.all('.returning')
      .slice(0, 12)
      .forEach((element, index) => {
        const owner = element.closest('.player-stake') ? PlayerType.PLAYER : PlayerType.OPPONENT;
        const deck = this.rectOf(this.deckSelector(owner));
        if (!deck) return;
        engine.trail(this.centerOf(element), deck, {
          color: GILT,
          duration: duration * 1.5,
          delay: index * 35,
          arc: owner === PlayerType.PLAYER ? -30 : 30,
          arrivalPuff: false,
        });
      });
  }

  private boneyardTrails(): void {
    const engine = this.engine!;
    const boneyard = this.rectOf('.boneyard');
    if (!boneyard) return;
    const duration = this.cssDuration('--boneyard-duration', 483) / 1000;
    this.all('.to-boneyard')
      .slice(0, 14)
      .forEach((element, index) => {
        engine.trail(this.centerOf(element), boneyard, {
          color: EMBER,
          duration: duration * 1.55,
          delay: index * 45,
          arc: 70,
        });
      });
  }

  private finale(): void {
    const engine = this.engine!;
    const outcome = this.controller.currentGameSummary()?.outcome ?? null;
    const { clientWidth: width, clientHeight: height } = this.host.nativeElement;
    engine.setTension(0);
    if (outcome === GameOutcome.PLAYER_WIN) {
      engine.setOutcome('victory');
      engine.confettiBurst({ x: width * 0.15, y: height + 10 }, 110, { fromBelow: true });
      engine.confettiBurst({ x: width * 0.85, y: height + 10 }, 110, { fromBelow: true });
      [0, 420, 860, 1300].forEach((delay, index) => {
        engine.after(delay, () =>
          engine.starburst(
            { x: width * (0.22 + ((index * 0.37) % 0.6)), y: height * (0.18 + (index % 2) * 0.12) },
            index % 2 ? GILT : this.armyFor(PlayerType.PLAYER).primary,
          ),
        );
      });
    } else if (outcome === GameOutcome.OPPONENT_WIN) {
      engine.setOutcome('defeat');
      engine.ashfall(width, 180);
    } else if (outcome === GameOutcome.TIE) {
      engine.setOutcome('tie');
      engine.starburst({ x: width / 2, y: height * 0.3 }, '#dfe8f0', '#ffffff');
    }
  }

  /* ------------------------------ geometry ------------------------------ */

  private syncMood(): void {
    this.engine?.setTension(tensionFor(this.controller.battleLayers().length));
  }

  private get root(): HTMLElement {
    return this.host.nativeElement.parentElement ?? this.host.nativeElement;
  }

  private all(selector: string): HTMLElement[] {
    return Array.from(this.root.querySelectorAll<HTMLElement>(selector));
  }

  private local(clientX: number, clientY: number): FxPoint {
    const base = this.host.nativeElement.getBoundingClientRect();
    return { x: clientX - base.left, y: clientY - base.top };
  }

  private centerOf(element: Element): FxPoint {
    const rect = element.getBoundingClientRect();
    return this.local(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  private rectOf(selector: string): (FxPoint & { width: number; height: number }) | null {
    const element = this.root.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    if (!rect.width && !rect.height) return null;
    return { ...this.centerOf(element), width: rect.width, height: rect.height };
  }

  private clashCenter(): FxPoint | null {
    const opponent = this.root.querySelector('.opponent-stake .active-card-shell');
    const player = this.root.querySelector('.player-stake .active-card-shell');
    if (opponent && player && this.controller.activePlayerCard()) {
      return midpoint(this.centerOf(opponent), this.centerOf(player));
    }
    return this.rectOf('.clash-mark');
  }

  private pulseBackdropAt(point: FxPoint, strength: number): void {
    const backdrop = this.root.querySelector('app-table-backdrop');
    if (!backdrop) return;
    const overlay = this.host.nativeElement.getBoundingClientRect();
    const rect = backdrop.getBoundingClientRect();
    this.engine?.pulseBackdrop({ x: point.x + overlay.left - rect.left, y: point.y + overlay.top - rect.top }, strength);
  }

  private deckSelector(owner: PlayerType): string {
    return owner === PlayerType.PLAYER
      ? 'app-player-seat[position="bottom"] .deck'
      : 'app-player-seat[position="top"] .deck';
  }

  private armyFor(owner: PlayerType): ArmyPalette {
    const playerColor = this.gameState.currentPlayerDeckColor;
    const color = owner === PlayerType.PLAYER
      ? playerColor
      : playerColor === DeckColor.RED ? DeckColor.BLACK : DeckColor.RED;
    return color === DeckColor.RED ? RED_ARMY : STEEL_ARMY;
  }

  private cssDuration(name: string, fallbackMs: number): number {
    const raw = getComputedStyle(this.root).getPropertyValue(name).trim();
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) return fallbackMs;
    return raw.endsWith('ms') ? value : raw.endsWith('s') ? value * 1000 : value;
  }
}

function tensionFor(depth: number): number {
  return depth <= 0 ? 0 : Math.min(1, 0.38 + (depth - 1) * 0.24);
}

function midpoint(a: FxPoint, b: FxPoint): FxPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
