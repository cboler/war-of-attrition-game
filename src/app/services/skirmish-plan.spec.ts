import { PlayerType } from '../core/models/game-state.model';
import {
  SkirmishPlan,
  SkirmishUnit,
  buildSkirmishPlan,
  skirmishPoseAt,
  skirmishUnitPx,
} from './skirmish-plan';

describe('skirmish plan', () => {
  const unitsOf = (plan: SkirmishPlan, side: PlayerType): SkirmishUnit[] =>
    plan.units.filter((unit) => unit.side === side);
  const fates = (plan: SkirmishPlan, side: PlayerType): string[] =>
    unitsOf(plan, side).map((unit) => unit.fate);
  const count = (values: readonly string[], value: string): number =>
    values.filter((entry) => entry === value).length;

  it('replays exactly from its seed and varies between seeds', () => {
    const request = { winner: PlayerType.PLAYER, seed: 42, margin: 0.5 };

    expect(buildSkirmishPlan(request)).toEqual(buildSkirmishPlan(request));
    expect(buildSkirmishPlan({ ...request, seed: 43 })).not.toEqual(buildSkirmishPlan(request));
  });

  it('gives every soldier a well-formed track for the Web Animations API', () => {
    const plans = [
      buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 1, margin: 0 }),
      buildSkirmishPlan({ winner: PlayerType.OPPONENT, seed: 2, margin: 1, depth: 3 }),
      buildSkirmishPlan({ winner: PlayerType.OPPONENT, seed: 3, variant: 'giant-killer' }),
    ];

    for (const plan of plans) {
      for (const unit of plan.units) {
        expect(unit.frames[0].at).toBe(0);
        expect(unit.frames[unit.frames.length - 1].at).toBe(1);
        unit.frames.forEach((frame, index) => {
          const previous = unit.frames[index - 1]?.at ?? 0;
          expect(frame.at).toBeGreaterThanOrEqual(previous);
          expect(frame.at).toBeLessThanOrEqual(1);
          for (const value of [frame.x, frame.y, frame.tilt, frame.spin, frame.scaleX, frame.scaleY]) {
            expect(Number.isFinite(value)).toBeTrue();
          }
          expect(frame.opacity).toBeGreaterThanOrEqual(0);
          expect(frame.opacity).toBeLessThanOrEqual(1);
        });
        // Everyone enters unseen and has left by the end of the beat.
        expect(unit.frames[0].opacity).toBe(0);
        expect(unit.frames[unit.frames.length - 1].opacity).toBe(0);
      }
    }
  });

  it('brings the player in from the left and the opponent from the right', () => {
    const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 7 });

    for (const unit of unitsOf(plan, PlayerType.PLAYER)) {
      expect(unit.frames[0].x).toBeLessThan(-6);
      expect(unit.frames[0].facing).toBe(1);
    }
    for (const unit of unitsOf(plan, PlayerType.OPPONENT)) {
      expect(unit.frames[0].x).toBeGreaterThan(6);
      expect(unit.frames[0].facing).toBe(-1);
    }
    // At the clash the two front ranks stand either side of the centre line.
    const playerFront = Math.max(
      ...unitsOf(plan, PlayerType.PLAYER).map((unit) => skirmishPoseAt(unit.frames, plan.impactAt).x),
    );
    const opponentFront = Math.min(
      ...unitsOf(plan, PlayerType.OPPONENT).map((unit) => skirmishPoseAt(unit.frames, plan.impactAt).x),
    );
    expect(playerFront).toBeLessThan(0);
    expect(opponentFront).toBeGreaterThan(0);
    expect(opponentFront - playerFront).toBeLessThan(2);
  });

  it('fields two ranks with one standard bearer per army, and more men in a Battle', () => {
    const clash = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 5 });
    const battle = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 5, depth: 2 });

    for (const side of [PlayerType.PLAYER, PlayerType.OPPONENT]) {
      const army = unitsOf(clash, side);
      expect(army.length).toBe(7);
      expect(army.filter((unit) => unit.row === 'near').length).toBe(4);
      expect(army.filter((unit) => unit.row === 'far').length).toBe(3);
      expect(army.filter((unit) => unit.role === 'bearer').length).toBe(1);
      expect(unitsOf(battle, side).length).toBe(9);
    }
  });

  it('launches more of the losing line as the margin widens', () => {
    const launched = (margin: number) =>
      count(fates(buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 11, margin }), PlayerType.OPPONENT), 'launch');

    expect(launched(0)).toBe(2);
    expect(launched(0.5)).toBeGreaterThan(launched(0));
    expect(launched(1)).toBeGreaterThan(launched(0.5));
    expect(launched(1)).toBe(6);
  });

  it('makes a narrow win cost the victor and lets the loser withdraw in order', () => {
    const narrow = buildSkirmishPlan({ winner: PlayerType.OPPONENT, seed: 9, margin: 0 });
    const decisive = buildSkirmishPlan({ winner: PlayerType.OPPONENT, seed: 9, margin: 0.8 });

    expect(count(fates(narrow, PlayerType.OPPONENT), 'fall')).toBe(1);
    expect(count(fates(narrow, PlayerType.PLAYER), 'retreat')).toBeGreaterThan(0);
    expect(count(fates(narrow, PlayerType.PLAYER), 'flee')).toBe(0);
    expect(fates(decisive, PlayerType.OPPONENT).every((fate) => fate === 'press')).toBeTrue();
    expect(count(fates(decisive, PlayerType.PLAYER), 'retreat')).toBe(0);
  });

  it('throws each launched soldier up and back toward their own side', () => {
    const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 21, margin: 1 });
    const launched = unitsOf(plan, PlayerType.OPPONENT).filter((unit) => unit.fate === 'launch');

    expect(launched.length).toBeGreaterThan(0);
    for (const unit of launched) {
      const ground = unit.frames[0].y;
      const engaged = skirmishPoseAt(unit.frames, plan.impactAt).x;
      expect(Math.min(...unit.frames.map((frame) => frame.y))).toBeLessThan(ground - 1.5);
      expect(Math.max(...unit.frames.map((frame) => frame.x))).toBeGreaterThan(engaged + 3);
      expect(Math.max(...unit.frames.map((frame) => Math.abs(frame.spin)))).toBeGreaterThanOrEqual(360);
    }
  });

  it('times a cue to every blow so effects and sound land with the soldiers', () => {
    const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 31, margin: 0.7 });
    const kinds = plan.cues.map((cue) => cue.kind);
    const launches = plan.cues.filter((cue) => cue.kind === 'launch');

    expect(plan.cues.map((cue) => cue.at)).toEqual([...plan.cues.map((cue) => cue.at)].sort((a, b) => a - b));
    expect(count(kinds, 'charge')).toBe(2);
    expect(count(kinds, 'clash')).toBe(1);
    expect(count(kinds, 'cheer')).toBe(1);
    expect(launches.length).toBe(count(fates(plan, PlayerType.OPPONENT), 'launch'));
    for (const cue of launches) {
      expect(cue.side).toBe(PlayerType.OPPONENT);
      expect(cue.at).toBeGreaterThan(plan.impactAt);
    }
    expect(plan.cues.find((cue) => cue.kind === 'cheer')?.side).toBe(PlayerType.PLAYER);
  });

  describe('giant killer', () => {
    it('stages one small hero against a crowned giant and his escort', () => {
      const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 3, variant: 'giant-killer' });
      const winners = unitsOf(plan, PlayerType.PLAYER);
      const losers = unitsOf(plan, PlayerType.OPPONENT);
      const giant = losers.find((unit) => unit.role === 'giant')!;
      const hero = winners[0];

      expect(plan.variant).toBe('giant-killer');
      expect(winners.length).toBe(1);
      expect(hero.role).toBe('hero');
      expect(giant.scale).toBeGreaterThan(hero.scale * 2.5);
      expect(losers.filter((unit) => unit.role === 'soldier').length).toBe(4);
    });

    it('fells the giant backward only after the hero has struck', () => {
      const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 3, variant: 'giant-killer' });
      const giant = plan.units.find((unit) => unit.role === 'giant')!;
      const hero = plan.units.find((unit) => unit.role === 'hero')!;
      const tink = plan.cues.find((cue) => cue.kind === 'tink')!;
      const crash = plan.cues.find((cue) => cue.kind === 'crash')!;

      expect(plan.cues.filter((cue) => cue.kind === 'stomp').length).toBe(3);
      expect(tink.at).toBeLessThan(crash.at);
      expect(tink.side).toBe(PlayerType.PLAYER);
      // The hero is airborne at head height when the blow lands.
      expect(skirmishPoseAt(hero.frames, tink.at).y).toBeLessThan(-2);
      expect(Math.abs(skirmishPoseAt(giant.frames, tink.at).tilt)).toBeLessThan(15);
      // The opponent's giant stands on the right and falls away to the right.
      expect(skirmishPoseAt(giant.frames, crash.at).tilt).toBe(90);
      expect(skirmishPoseAt(hero.frames, plan.stillAt).y).toBe(0);
    });

    it('mirrors the scene when the opponent holds the Two', () => {
      const plan = buildSkirmishPlan({ winner: PlayerType.OPPONENT, seed: 3, variant: 'giant-killer' });
      const giant = plan.units.find((unit) => unit.role === 'giant')!;
      const hero = plan.units.find((unit) => unit.role === 'hero')!;
      const crash = plan.cues.find((cue) => cue.kind === 'crash')!;

      expect(giant.side).toBe(PlayerType.PLAYER);
      expect(hero.side).toBe(PlayerType.OPPONENT);
      expect(skirmishPoseAt(giant.frames, 0.3).x).toBeLessThan(0);
      expect(skirmishPoseAt(giant.frames, crash.at).tilt).toBe(-90);
    });

    it('sends the escort flying when the giant lands on it, bar the one who ran', () => {
      const plan = buildSkirmishPlan({ winner: PlayerType.PLAYER, seed: 3, variant: 'giant-killer' });
      const escort = plan.units.filter((unit) => unit.role === 'soldier').map((unit) => unit.fate);
      const crash = plan.cues.find((cue) => cue.kind === 'crash')!;

      expect(count(escort, 'launch')).toBe(3);
      expect(count(escort, 'flee')).toBe(1);
      for (const cue of plan.cues.filter((entry) => entry.kind === 'launch')) {
        expect(cue.at).toBeGreaterThanOrEqual(crash.at);
      }
    });
  });

  it('interpolates a pose between frames', () => {
    const frames = [
      { at: 0, x: 0, y: 0, tilt: 0, spin: 0, scaleX: 1, scaleY: 1, opacity: 0, facing: 1 },
      { at: 0.5, x: 4, y: -2, tilt: 90, spin: 360, scaleX: 1, scaleY: 1, opacity: 1, facing: -1 },
      { at: 1, x: 4, y: 0, tilt: 90, spin: 360, scaleX: 1, scaleY: 1, opacity: 1, facing: -1 },
    ];

    expect(skirmishPoseAt(frames, 0.25)).toEqual(
      jasmine.objectContaining({ x: 2, y: -1, tilt: 45, spin: 180, opacity: 0.5, facing: -1 }),
    );
    expect(skirmishPoseAt(frames, 0.75).y).toBe(-1);
    expect(skirmishPoseAt(frames, 2)).toBe(frames[2]);
  });

  it('sizes soldiers to the table and stays within sane bounds', () => {
    expect(skirmishUnitPx(375)).toBe(25);
    expect(skirmishUnitPx(1600)).toBe(40);
    expect(skirmishUnitPx(120)).toBe(18);
    expect(skirmishUnitPx(0)).toBe(25);
  });
});
