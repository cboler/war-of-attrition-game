import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  untracked,
  viewChildren,
} from '@angular/core';
import { DeckColor, PlayerType } from '../../../core/models/game-state.model';
import { BattleAnimationScene } from '../../../services/battle-animation.service';
import {
  SKIRMISH_UNIT_HEIGHT_U,
  SkirmishCue,
  SkirmishPose,
  SkirmishUnit,
  skirmishPoseAt,
  skirmishUnitPx,
} from '../../../services/skirmish-plan';

interface UnitView {
  readonly key: string;
  readonly unit: SkirmishUnit;
  readonly classes: string;
}

interface FlashView {
  readonly key: string;
  readonly cue: SkirmishCue;
  readonly classes: string;
}

/** Real-time length of one running stride, whatever the scene speed. */
const STRIDE_MS = 130;
const FLASH_KINDS: readonly SkirmishCue['kind'][] = ['clash', 'tink', 'crash'];

/**
 * Renders a skirmish plan as individual soldiers.
 *
 * The plan owns the choreography; this component only turns each soldier's
 * track into one Web Animations timeline on the compositor. Nothing here is
 * gameplay-bearing: the scene is decoration for a result that is already public.
 */
@Component({
  selector: 'app-battle-animation',
  templateUrl: './battle-animation.component.html',
  styleUrl: './battle-animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleAnimationComponent {
  readonly scene = input.required<BattleAnimationScene>();
  protected readonly player = PlayerType;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly unitElements = viewChildren<ElementRef<HTMLElement>>('unit');
  private readonly shadowElements = viewChildren<ElementRef<HTMLElement>>('shadow');
  private readonly flashElements = viewChildren<ElementRef<HTMLElement>>('flash');
  private playedSceneId: number | null = null;

  protected readonly units = computed<UnitView[]>(() => {
    const scene = this.scene();
    return scene.plan.units.map((unit) => {
      const color = unit.side === PlayerType.PLAYER ? scene.playerColor : scene.opponentColor;
      return {
        key: `${scene.id}:${unit.id}`,
        unit,
        classes: [
          unit.side === PlayerType.PLAYER ? 'player-unit' : 'opponent-unit',
          unit.side === scene.winner ? 'winner' : 'loser',
          color === DeckColor.RED ? 'red-army' : 'steel-army',
          `role-${unit.role}`,
          `row-${unit.row}`,
          `fate-${unit.fate}`,
        ].join(' '),
      };
    });
  });

  protected readonly flashes = computed<FlashView[]>(() => {
    const scene = this.scene();
    return scene.plan.cues
      .filter((cue) => FLASH_KINDS.includes(cue.kind))
      .map((cue, index) => ({ key: `${scene.id}:${index}`, cue, classes: `flash-${cue.kind}` }));
  });

  constructor() {
    afterRenderEffect(() => {
      const scene = this.scene();
      const units = this.unitElements();
      const shadows = this.shadowElements();
      const flashes = this.flashElements();
      untracked(() => this.play(scene, units, shadows, flashes));
    });
  }

  private play(
    scene: BattleAnimationScene,
    units: readonly ElementRef<HTMLElement>[],
    shadows: readonly ElementRef<HTMLElement>[],
    flashes: readonly ElementRef<HTMLElement>[],
  ): void {
    if (scene.id === this.playedSceneId || units.length !== scene.plan.units.length) return;
    this.playedSceneId = scene.id;
    const host = this.host.nativeElement;
    const u = skirmishUnitPx(host.clientWidth);
    host.style.setProperty('--skirmish-u', `${u}px`);

    scene.plan.units.forEach((unit, index) => {
      const element = units[index].nativeElement;
      const shadow = shadows[index]?.nativeElement;
      if (scene.motion === 'reduced' || typeof element.animate !== 'function') {
        const pose = skirmishPoseAt(unit.frames, scene.plan.stillAt);
        element.style.transform = poseTransform(pose, unit, u);
        element.style.opacity = `${pose.opacity}`;
        if (shadow) {
          shadow.style.transform = shadowTransform(pose, unit, u);
          shadow.style.opacity = `${shadowOpacity(pose, unit)}`;
        }
        return;
      }
      this.animateUnit(element, shadow, unit, scene.durationMs, u);
    });

    if (scene.motion === 'reduced') return;
    const cues = this.flashes();
    flashes.forEach((ref, index) => {
      const view = cues[index];
      if (view && typeof ref.nativeElement.animate === 'function') {
        animateFlash(ref.nativeElement, view.cue, scene.durationMs);
      }
    });
  }

  private animateUnit(
    element: HTMLElement,
    shadow: HTMLElement | undefined,
    unit: SkirmishUnit,
    duration: number,
    u: number,
  ): void {
    const timing: KeyframeAnimationOptions = { duration, fill: 'both', easing: 'linear' };
    element.animate(
      unit.frames.map((frame) => ({
        offset: frame.at,
        transform: poseTransform(frame, unit, u),
        opacity: frame.opacity,
        easing: frame.easing ?? 'linear',
      })),
      timing,
    );
    shadow?.animate(
      unit.frames.map((frame) => ({
        offset: frame.at,
        transform: shadowTransform(frame, unit, u),
        opacity: shadowOpacity(frame, unit),
        easing: frame.easing ?? 'linear',
      })),
      timing,
    );

    const sprite = element.querySelector<SVGElement>('.soldier');
    const legs = element.querySelectorAll<SVGElement>('.leg');
    for (const run of unit.runs) {
      const strides = Math.max(2, Math.round(((run.to - run.from) * duration) / STRIDE_MS));
      const stride: KeyframeAnimationOptions = {
        delay: run.from * duration,
        duration: ((run.to - run.from) * duration) / strides,
        iterations: strides,
        direction: 'alternate',
        easing: 'ease-in-out',
      };
      legs.forEach((leg, index) => {
        const swing = index % 2 === 0 ? 28 : -28;
        leg.animate(
          [{ transform: `rotate(${swing}deg)` }, { transform: `rotate(${-swing}deg)` }],
          stride,
        );
      });
      sprite?.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${-0.1 * u * unit.scale}px)` }],
        stride,
      );
    }

    const arm = element.querySelector<SVGElement>('.arm');
    if (arm) arm.animate(armKeyframes(unit), timing);
  }
}

/**
 * One transform carries the whole pose so each soldier costs a single
 * compositor animation. The origin is the feet; the spin detours through the
 * body centre and back. Every frame uses the same function list, so the
 * browser interpolates channel by channel instead of falling back to matrices.
 */
function poseTransform(pose: SkirmishPose, unit: SkirmishUnit, u: number): string {
  const centre = round((SKIRMISH_UNIT_HEIGHT_U * unit.scale * u) / 2);
  return (
    `translate(${round(pose.x * u)}px, ${round(pose.y * u)}px) ` +
    `rotate(${pose.tilt}deg) scale(${pose.scaleX}, ${pose.scaleY}) ` +
    `translateY(${-centre}px) rotate(${pose.spin}deg) translateY(${centre}px) ` +
    `scaleX(${pose.facing})`
  );
}

function groundOf(unit: SkirmishUnit): number {
  return unit.frames[0]?.y ?? 0;
}

/** The shadow stays on the ground and shrinks as its soldier leaves it. */
function shadowTransform(pose: SkirmishPose, unit: SkirmishUnit, u: number): string {
  const ground = groundOf(unit);
  const height = Math.max(0, ground - pose.y);
  const size = round(1 / (1 + height * 0.3));
  return `translate(${round(pose.x * u)}px, ${round(ground * u)}px) scale(${size})`;
}

function shadowOpacity(pose: SkirmishPose, unit: SkirmishUnit): number {
  const height = Math.max(0, groundOf(unit) - pose.y);
  return round(pose.opacity / (1 + height * 0.45));
}

function armKeyframes(unit: SkirmishUnit): Keyframe[] {
  if (unit.role === 'bearer') {
    // The standard sways rather than strikes.
    return [0, 0.2, 0.4, 0.6, 0.8, 1].map((offset, index) => ({
      offset,
      transform: `rotate(${index % 2 === 0 ? -5 : 7}deg)`,
      easing: 'ease-in-out',
    }));
  }
  const marks: { at: number; angle: number }[] = [{ at: 0, angle: 0 }];
  const mark = (at: number, angle: number) =>
    marks.push({ at: Math.max(0, Math.min(1, at)), angle });
  for (const strike of unit.strikes) {
    mark(strike - 0.05, -42);
    mark(strike, 74);
    mark(strike + 0.06, 0);
  }
  if (unit.raise) {
    // The giant hauls the blade back over a shoulder; everyone else points it at the sky.
    const lifted = unit.role === 'giant' ? -62 : -22;
    const { from, to } = unit.raise;
    mark(from, 0);
    mark(from + 0.035, lifted);
    mark(Math.max(from + 0.035, to - 0.03), lifted);
    mark(to, to >= 1 ? lifted : 0);
  }
  marks.sort((a, b) => a.at - b.at);
  marks.push({ at: 1, angle: marks[marks.length - 1].angle });
  return marks.map((entry) => ({ offset: entry.at, transform: `rotate(${entry.angle}deg)` }));
}

function animateFlash(element: HTMLElement, cue: SkirmishCue, duration: number): void {
  const at = Math.min(0.94, cue.at);
  const hidden = 'translate(-50%, 50%) scale(0.2) rotate(-12deg)';
  element.animate(
    [
      { offset: 0, opacity: 0, transform: hidden },
      { offset: at, opacity: 0, transform: hidden },
      { offset: at + 0.02, opacity: 1, transform: 'translate(-50%, 50%) scale(1.1) rotate(8deg)' },
      { offset: Math.min(0.98, at + 0.07), opacity: 0.7, transform: 'translate(-50%, 50%) scale(0.8) rotate(-4deg)' },
      { offset: Math.min(0.99, at + 0.13), opacity: 0, transform: 'translate(-50%, 50%) scale(0.5) rotate(0deg)' },
      { offset: 1, opacity: 0, transform: hidden },
    ],
    { duration, fill: 'both', easing: 'linear' },
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
