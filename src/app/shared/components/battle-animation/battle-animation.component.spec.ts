import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckColor, PlayerType } from '../../../core/models/game-state.model';
import { BattleAnimationScene } from '../../../services/battle-animation.service';
import { SkirmishVariant, buildSkirmishPlan } from '../../../services/skirmish-plan';
import { BattleAnimationComponent } from './battle-animation.component';

describe('BattleAnimationComponent', () => {
  let fixture: ComponentFixture<BattleAnimationComponent>;
  let sceneId = 0;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleAnimationComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BattleAnimationComponent);
  });

  function scene(overrides: {
    winner: PlayerType;
    playerColor?: DeckColor;
    motion?: 'full' | 'reduced';
    variant?: SkirmishVariant;
    margin?: number;
  }): BattleAnimationScene {
    const playerColor = overrides.playerColor ?? DeckColor.RED;
    const variant = overrides.variant ?? 'standard';
    return {
      id: ++sceneId,
      winner: overrides.winner,
      loser: overrides.winner === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER,
      playerColor,
      opponentColor: playerColor === DeckColor.RED ? DeckColor.BLACK : DeckColor.RED,
      motion: overrides.motion ?? 'full',
      variant,
      durationMs: 1400,
      plan: buildSkirmishPlan({
        winner: overrides.winner,
        variant,
        margin: overrides.margin ?? 0.6,
        seed: 17,
      }),
    };
  }

  function render(input: BattleAnimationScene): HTMLElement {
    fixture.componentRef.setInput('scene', input);
    fixture.detectChanges();
    TestBed.tick();
    return fixture.nativeElement as HTMLElement;
  }

  function poseKeyframes(element: Element): ComputedKeyframe[] {
    const animation = element
      .getAnimations()
      .find((entry) => (entry.effect as KeyframeEffect).target === element);
    return (animation?.effect as KeyframeEffect | undefined)?.getKeyframes() ?? [];
  }

  it('renders one soldier per unit in the plan, in each army colour', () => {
    const input = scene({ winner: PlayerType.PLAYER });
    const element = render(input);

    expect(element.querySelectorAll('.unit').length).toBe(input.plan.units.length);
    expect(element.querySelectorAll('.player-unit').length).toBe(7);
    expect(element.querySelectorAll('.opponent-unit').length).toBe(7);
    expect(element.querySelectorAll('.player-unit.red-army.winner').length).toBe(7);
    expect(element.querySelectorAll('.opponent-unit.steel-army.loser').length).toBe(7);
    expect(element.querySelectorAll('.role-bearer .flag').length).toBe(2);
    expect(element.querySelector('.battle-animation')?.classList).toContain('player-victory');
  });

  it('keeps army colours attached to the randomized deck assignment', () => {
    const element = render(scene({ winner: PlayerType.OPPONENT, playerColor: DeckColor.BLACK }));

    expect(element.querySelectorAll('.player-unit.steel-army.loser').length).toBe(7);
    expect(element.querySelectorAll('.opponent-unit.red-army.winner').length).toBe(7);
    expect(element.querySelector('.battle-animation')?.classList).toContain('opponent-victory');
  });

  it('gives every soldier its own motion: the player charges right, the opponent left', () => {
    const element = render(scene({ winner: PlayerType.PLAYER }));
    const startX = (unit: Element): number => {
      const transform = poseKeyframes(unit)[0]?.['transform']?.toString() ?? '';
      return Number(/translate\((-?[\d.]+)px/.exec(transform)?.[1]);
    };

    for (const unit of Array.from(element.querySelectorAll('.player-unit'))) {
      expect(startX(unit)).toBeLessThan(0);
    }
    for (const unit of Array.from(element.querySelectorAll('.opponent-unit'))) {
      expect(startX(unit)).toBeGreaterThan(0);
    }
    const tracks = Array.from(element.querySelectorAll('.unit')).map((unit) =>
      poseKeyframes(unit).map((frame) => frame['transform']).join('|'),
    );
    expect(new Set(tracks).size).toBe(tracks.length);
  });

  it('spins launched losers through the air while the winners stay upright', () => {
    const element = render(scene({ winner: PlayerType.PLAYER, margin: 1 }));
    const spins = (unit: Element): number[] =>
      poseKeyframes(unit).map((frame) => {
        const rotations = [...(frame['transform']?.toString() ?? '').matchAll(/rotate\((-?[\d.]+)deg\)/g)];
        return Math.abs(Number(rotations[1]?.[1] ?? 0));
      });

    const launched = element.querySelector('.loser.fate-launch')!;
    const winner = element.querySelector('.winner.fate-press')!;
    expect(Math.max(...spins(launched))).toBeGreaterThanOrEqual(360);
    expect(Math.max(...spins(winner))).toBe(0);
  });

  it('runs the whole scene for the duration the controller waits on', () => {
    const element = render(scene({ winner: PlayerType.OPPONENT }));
    const timing = element.querySelector('.unit')!.getAnimations()[0].effect!.getComputedTiming();

    expect(timing.duration).toBe(1400);
    expect(timing.fill).toBe('both');
  });

  it('marks the clash with a flash for tables without the WebGL overlay', () => {
    const element = render(scene({ winner: PlayerType.PLAYER }));

    expect(element.querySelectorAll('.impact.flash-clash').length).toBe(1);
  });

  it('stages a Two felling an Ace with a crowned giant and a lone hero', () => {
    const element = render(scene({ winner: PlayerType.PLAYER, variant: 'giant-killer' }));

    expect(element.querySelector('.battle-animation')?.classList).toContain('giant-killer');
    expect(element.querySelectorAll('.role-giant.loser .crown').length).toBe(1);
    expect(element.querySelector('.role-giant .emblem')?.textContent).toBe('A');
    expect(element.querySelectorAll('.role-hero.winner').length).toBe(1);
    expect(element.querySelectorAll('.impact.flash-tink').length).toBe(1);
    expect(element.querySelectorAll('.impact.flash-crash').length).toBe(1);
  });

  it('poses a still outcome instead of animating for reduced motion', () => {
    const element = render(scene({ winner: PlayerType.OPPONENT, motion: 'reduced' }));
    const units = Array.from(element.querySelectorAll<HTMLElement>('.unit'));

    expect(element.querySelector('.battle-animation')?.classList).toContain('reduced-motion');
    expect(units.every((unit) => unit.getAnimations({ subtree: true }).length === 0)).toBeTrue();
    expect(units.every((unit) => unit.style.transform.startsWith('translate('))).toBeTrue();
    // The winners are standing in view; the routed side is partly gone.
    expect(element.querySelector<HTMLElement>('.winner')!.style.opacity).toBe('1');
  });
});
