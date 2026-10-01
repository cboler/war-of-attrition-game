/**
 * Choreography for the skirmish that plays after a decided comparison.
 *
 * A plan is pure data built once per scene from a seed: every soldier's motion
 * track plus the timed cues (clash, launches, landings) that the DOM animation,
 * the WebGL overlay and the sound layer all read. Keeping one plan is what lets
 * a spark and a thud land on the same frame as the soldier they belong to.
 *
 * Space is measured in soldier widths ("u"): x = 0 is the middle of the field
 * and grows to the right, y = 0 is the ground and grows downward (so a jump is
 * negative). Time is a 0..1 fraction of the scene duration. The player's army
 * always enters from the left and the opponent's from the right.
 */
import { PlayerType } from '../core/models/game-state.model';

export type SkirmishVariant = 'standard' | 'giant-killer';
export type SkirmishRole = 'soldier' | 'bearer' | 'giant' | 'hero';
export type SkirmishRow = 'near' | 'far';
export type SkirmishFate =
  | 'press'
  | 'fall'
  | 'launch'
  | 'retreat'
  | 'flee'
  | 'topple'
  | 'triumph';
export type SkirmishCueKind =
  | 'charge'
  | 'clash'
  | 'launch'
  | 'fall'
  | 'land'
  | 'flee'
  | 'cheer'
  | 'stomp'
  | 'windup'
  | 'tink'
  | 'creak'
  | 'crash';

export interface SkirmishPose {
  readonly x: number;
  readonly y: number;
  /** Degrees about the feet. Positive leans toward +x. */
  readonly tilt: number;
  /** Degrees about the body centre. Positive is clockwise. */
  readonly spin: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly opacity: number;
  /** 1 faces +x, -1 faces -x. */
  readonly facing: number;
}

export interface SkirmishFrame extends SkirmishPose {
  readonly at: number;
  /** CSS easing for the segment that starts at this frame. */
  readonly easing?: string;
}

export interface SkirmishWindow {
  readonly from: number;
  readonly to: number;
}

export interface SkirmishUnit {
  readonly id: string;
  readonly side: PlayerType;
  readonly role: SkirmishRole;
  readonly row: SkirmishRow;
  readonly fate: SkirmishFate;
  readonly scale: number;
  /** Paint order; higher is in front. */
  readonly layer: number;
  readonly frames: readonly SkirmishFrame[];
  /** Spans in which the legs run. */
  readonly runs: readonly SkirmishWindow[];
  /** Moments the weapon comes down. */
  readonly strikes: readonly number[];
  /** Span in which the weapon is held high (wind-up or cheer). */
  readonly raise: SkirmishWindow | null;
}

export interface SkirmishCue {
  readonly at: number;
  readonly kind: SkirmishCueKind;
  readonly x: number;
  /** Height above the ground in u (negative is up). */
  readonly y: number;
  /** Rough loudness and size, around 1. */
  readonly weight: number;
  /** The army the cue belongs to, when it has one. */
  readonly side: PlayerType | null;
}

export interface SkirmishPlan {
  readonly variant: SkirmishVariant;
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly units: readonly SkirmishUnit[];
  readonly cues: readonly SkirmishCue[];
  /** The moment the lines meet (or the giant lands). */
  readonly impactAt: number;
  /** A representative moment for the reduced-motion still. */
  readonly stillAt: number;
}

export interface SkirmishRequest {
  readonly winner: PlayerType;
  readonly seed: number;
  readonly variant?: SkirmishVariant;
  /** 0 = the narrowest win, 1 = a rout. */
  readonly margin?: number;
  /** Battle depth of the comparison; 0 outside a Battle. */
  readonly depth?: number;
}

/** Soldier widths across the field at the narrowest supported table. */
export const SKIRMISH_FIELD_WIDTH_U = 15;
/** The ground line sits this far above the bottom edge of the stage. */
export const SKIRMISH_GROUND_INSET_U = 0.5;
/** Soldier height in u (the sprite is 34 x 42). */
export const SKIRMISH_UNIT_HEIGHT_U = 42 / 34;

const CLASH_AT = 0.36;
const STRIKER_COUNT = 3;
const FAR_ROW_Y = -0.5;
const GIANT_SCALE = 2.5;
const HERO_SCALE = 0.84;
const ENTRY_TRAVEL = 7.6;

/** Size of one soldier width for a stage of the given pixel width. */
export function skirmishUnitPx(stageWidth: number): number {
  if (!Number.isFinite(stageWidth) || stageWidth <= 0) return 25;
  return Math.max(18, Math.min(40, stageWidth / SKIRMISH_FIELD_WIDTH_U));
}

export function buildSkirmishPlan(request: SkirmishRequest): SkirmishPlan {
  const random = mulberry32(request.seed);
  return request.variant === 'giant-killer'
    ? buildGiantKiller(request, random)
    : buildStandard(request, random);
}

/** Linear pose lookup, used for the reduced-motion still and by tests. */
export function skirmishPoseAt(frames: readonly SkirmishFrame[], at: number): SkirmishPose {
  if (frames.length === 0) return REST;
  if (at <= frames[0].at) return frames[0];
  for (let i = 1; i < frames.length; i++) {
    const next = frames[i];
    if (at > next.at) continue;
    const previous = frames[i - 1];
    const span = next.at - previous.at;
    const k = span <= 0 ? 1 : (at - previous.at) / span;
    return {
      x: mix(previous.x, next.x, k),
      y: mix(previous.y, next.y, k),
      tilt: mix(previous.tilt, next.tilt, k),
      spin: mix(previous.spin, next.spin, k),
      scaleX: mix(previous.scaleX, next.scaleX, k),
      scaleY: mix(previous.scaleY, next.scaleY, k),
      opacity: mix(previous.opacity, next.opacity, k),
      facing: k < 0.5 ? previous.facing : next.facing,
    };
  }
  return frames[frames.length - 1];
}

/* ------------------------------------------------------------------------ */
/* Standard clash                                                            */
/* ------------------------------------------------------------------------ */

interface Slot {
  readonly row: SkirmishRow;
  /** Distance from the centre line once the armies have met. */
  readonly distance: number;
  readonly bearer: boolean;
}

function buildStandard(request: SkirmishRequest, random: () => number): SkirmishPlan {
  const winner = request.winner;
  const loser = otherSide(winner);
  const margin = clamp01(request.margin ?? 0.5);
  const battle = (request.depth ?? 0) > 0;
  const slots = formation(battle);
  const units: SkirmishUnit[] = [];
  const cues: SkirmishCue[] = [
    cue(0, 'charge', -5, battle ? 1 : 0.7, PlayerType.PLAYER),
    cue(0, 'charge', 5, battle ? 1 : 0.7, PlayerType.OPPONENT),
    cue(CLASH_AT, 'clash', 0, (battle ? 1.25 : 0.85) + margin * 0.25, null),
  ];

  const loserFates = fatesForLosers(slots.length, margin, battle);
  const launchCount = loserFates.filter((fate) => fate === 'launch').length;
  const launchStep = Math.min(0.045, 0.22 / Math.max(1, launchCount));
  const hitTimes: number[] = [];

  // Losers first: the winners' strikes are timed off the blows that land.
  let launchOrder = 0;
  slots.forEach((slot, line) => {
    const fate = loserFates[line];
    const hitAt = CLASH_AT + 0.045 + launchOrder * launchStep + random() * 0.015;
    if (fate === 'launch') {
      hitTimes.push(hitAt);
      launchOrder++;
    }
    units.push(loserUnit(loser, slot, line, fate, hitAt, margin, random, cues));
  });

  // The front of the winning line shares out the blows that send losers flying.
  const winnerFates = fatesForWinners(slots.length, margin, battle);
  const strikers = Math.min(STRIKER_COUNT, slots.length);
  slots.forEach((slot, line) => {
    const strikes = line < strikers ? hitTimes.filter((_, index) => index % strikers === line) : [];
    units.push(winnerUnit(winner, slot, line, winnerFates[line], strikes, margin, random, cues));
  });

  cues.push(cue(0.82, 'cheer', -dirOf(winner) * 0.6, 0.7 + margin * 0.3, winner));
  return {
    variant: 'standard',
    winner,
    loser,
    units,
    cues: sortCues(cues),
    impactAt: CLASH_AT,
    stillAt: 0.76,
  };
}

function formation(battle: boolean): Slot[] {
  const near = battle ? 5 : 4;
  const far = battle ? 4 : 3;
  const slots: Slot[] = [];
  for (let i = 0; i < near; i++) slots.push({ row: 'near', distance: 0.55 + i * 0.92, bearer: false });
  for (let i = 0; i < far; i++) {
    slots.push({ row: 'far', distance: 1.02 + i * 0.92, bearer: i === far - 1 });
  }
  return slots.sort((a, b) => a.distance - b.distance);
}

function fatesForLosers(count: number, margin: number, battle: boolean): SkirmishFate[] {
  const launches = Math.max(
    1,
    Math.min(count - 1, Math.round(1.6 + margin * (count - 3)) + (battle ? 1 : 0)),
  );
  return Array.from({ length: count }, (_, line): SkirmishFate => {
    if (line < launches) return 'launch';
    if (battle) return line === count - 1 ? 'flee' : 'fall';
    if (margin < 0.35) return 'retreat';
    if (line === count - 1) return 'flee';
    return (line - launches) % 2 === 0 ? 'fall' : 'flee';
  });
}

function fatesForWinners(count: number, margin: number, battle: boolean): SkirmishFate[] {
  // A narrow win costs the victor too: the front of the line trades blows.
  const traded = margin < 0.2 ? (battle ? 2 : 1) : 0;
  return Array.from({ length: count }, (_, line): SkirmishFate => (line < traded ? 'fall' : 'press'));
}

function charge(side: PlayerType, slot: Slot, line: number, random: () => number): {
  track: Track;
  home: number;
  arrive: number;
  baseY: number;
} {
  const dir = dirOf(side);
  const home = -dir * slot.distance;
  const baseY = slot.row === 'far' ? FAR_ROW_Y : 0;
  const arrive = CLASH_AT + line * 0.011 + random() * 0.008;
  const start = home - dir * (ENTRY_TRAVEL + random() * 0.6);
  const track = new Track({ ...REST, x: start, y: baseY, opacity: 0, facing: dir });
  track.to(0.07, { x: mix(start, home, 0.13), opacity: 1 });
  track.to(arrive, { x: home, tilt: dir * 5 });
  return { track, home, arrive, baseY };
}

function winnerUnit(
  side: PlayerType,
  slot: Slot,
  line: number,
  fate: SkirmishFate,
  strikes: readonly number[],
  margin: number,
  random: () => number,
  cues: SkirmishCue[],
): SkirmishUnit {
  const dir = dirOf(side);
  const { track, home, arrive, baseY } = charge(side, slot, line, random);
  let raise: SkirmishWindow | null = null;

  if (fate === 'fall') {
    const back = -dir;
    track.to(arrive + 0.03, { x: home + back * 0.2, tilt: back * 18, y: baseY - 0.3 }, 'ease-out');
    track.to(arrive + 0.12, { x: home + back * 0.6, tilt: back * 92, y: baseY }, 'ease-in');
    track.to(arrive + 0.15, { tilt: back * 86 });
    track.to(arrive + 0.18, { tilt: back * 90 });
    cues.push(cue(arrive + 0.12, 'fall', home + back * 0.6, 0.6, side));
    track.to(0.9, {});
    track.to(1, { opacity: 0 });
  } else {
    // Shield-to-shield recoil, then the line pushes through the gap it made.
    track.to(arrive + 0.03, { x: home - dir * 0.2, tilt: -dir * 7 }, 'ease-out');
    const pressFrom = CLASH_AT + 0.09 + line * 0.014;
    const advance = 0.8 + margin * 1.3 + random() * 0.5;
    track.to(pressFrom, { x: home - dir * 0.08, tilt: dir * 4 });
    track.to(pressFrom + 0.24, { x: home + dir * advance, tilt: dir * 3 }, 'ease-out');
    const hop = 0.8 + random() * 0.02;
    track.to(hop, { tilt: 0 });
    track.to(hop + 0.035, { y: baseY - 0.42, scaleY: 1.06 }, 'ease-out');
    track.to(hop + 0.07, { y: baseY, scaleY: 0.94 }, 'ease-in');
    track.to(hop + 0.1, { y: baseY - 0.28, scaleY: 1.04 }, 'ease-out');
    track.to(hop + 0.13, { y: baseY, scaleY: 1 }, 'ease-in');
    track.to(1, { opacity: 0 });
    raise = { from: hop - 0.02, to: 1 };
  }

  return {
    id: unitId(side, line),
    side,
    role: slot.bearer ? 'bearer' : 'soldier',
    row: slot.row,
    fate,
    scale: slot.row === 'far' ? 0.9 : 1,
    layer: slot.row === 'far' ? 2 : 6,
    frames: track.done(),
    runs: [{ from: 0, to: arrive }],
    strikes: fate === 'fall' ? [] : [arrive, ...strikes],
    raise,
  };
}

function loserUnit(
  side: PlayerType,
  slot: Slot,
  line: number,
  fate: SkirmishFate,
  hitAt: number,
  margin: number,
  random: () => number,
  cues: SkirmishCue[],
): SkirmishUnit {
  const dir = dirOf(side);
  const back = -dir;
  const { track, home, arrive, baseY } = charge(side, slot, line, random);
  const runs: SkirmishWindow[] = [{ from: 0, to: arrive }];
  let layer = slot.row === 'far' ? 1 : 5;

  track.to(arrive + 0.03, { x: home + back * 0.22, tilt: back * 9 }, 'ease-out');

  if (fate === 'launch') {
    layer = 9;
    const weight = 0.65 + margin * 0.35 + random() * 0.2;
    track.to(hitAt, { tilt: back * 4 });
    // One held frame of squash sells the blow before the body leaves the ground.
    track.to(hitAt + 0.012, { scaleX: 1.18, scaleY: 0.8, tilt: back * 14 });
    cues.push(cue(hitAt, 'launch', home + back * 0.2, weight, side, baseY - 0.6));
    const duration = 0.26 + random() * 0.08;
    const distance = 4.2 + random() * 3.4 + margin * 1.2;
    const height = 1.7 + random() * 1.6 + margin * 0.9;
    const lands = hitAt + duration + 0.09 < 0.9 && distance < 6.2;
    const turns = lands ? 1 + Math.floor(random() * 2) : 1.5 + random();
    const from = hitAt + 0.012;
    if (lands) {
      flight(track, from, duration, {
        dx: back * distance,
        height,
        spin: back * (turns * 360 + 90),
        baseY,
      });
      const landAt = from + duration;
      const landX = home + back * (0.22 + distance);
      cues.push(cue(landAt, 'land', landX, weight * 0.8, side));
      track.to(landAt + 0.035, { x: landX + back * 0.3, y: baseY - 0.32 }, 'ease-out');
      track.to(landAt + 0.07, { x: landX + back * 0.55, y: baseY }, 'ease-in');
      track.to(0.92, {});
      track.to(1, { opacity: 0 });
    } else {
      flight(track, from, duration, {
        dx: back * distance,
        height,
        spin: back * turns * 360,
        baseY,
        until: 0.78,
        fadeFrom: 0.46,
      });
      track.to(1, {});
    }
  } else if (fate === 'fall') {
    const fallAt = Math.max(arrive + 0.04, CLASH_AT + 0.05 + random() * 0.12);
    track.to(fallAt, { tilt: back * 6 });
    track.to(fallAt + 0.04, { x: home + back * 0.5, y: baseY - 0.34, tilt: back * 30 }, 'ease-out');
    track.to(fallAt + 0.1, { x: home + back * 0.9, y: baseY, tilt: back * 94 }, 'ease-in');
    track.to(fallAt + 0.13, { tilt: back * 87 });
    track.to(fallAt + 0.16, { tilt: back * 90 });
    cues.push(cue(fallAt + 0.1, 'fall', home + back * 0.9, 0.6, side));
    track.to(0.92, {});
    track.to(1, { opacity: 0 });
  } else if (fate === 'retreat') {
    // An orderly withdrawal: the line gives ground still facing the enemy.
    const from = CLASH_AT + 0.14 + line * 0.012;
    track.to(from, { tilt: back * 5 });
    track.to(from + 0.34, { x: home + back * (2.2 + random() * 0.8), tilt: back * 8 }, 'ease-in-out');
    track.to(0.9, { tilt: back * 3 });
    track.to(1, { opacity: 0 });
    runs.push({ from, to: from + 0.34 });
  } else {
    const fleeAt = Math.max(arrive + 0.05, CLASH_AT + 0.1 + random() * 0.1);
    track.to(fleeAt, { tilt: 0 });
    track.to(fleeAt + 0.03, { y: baseY - 0.5, scaleY: 1.1 }, 'ease-out');
    track.to(fleeAt + 0.06, { y: baseY, scaleY: 1, facing: back }, 'ease-in');
    const gone = Math.min(0.96, fleeAt + 0.36);
    track.to(mix(fleeAt + 0.06, gone, 0.7), { x: home + back * 5, tilt: back * 12 }, 'ease-in');
    track.to(gone, { x: home + back * 7.4, opacity: 0 });
    track.to(1, {});
    runs.push({ from: fleeAt + 0.06, to: gone });
    cues.push(cue(fleeAt, 'flee', home, 0.5, side));
  }

  return {
    id: unitId(side, line),
    side,
    role: slot.bearer ? 'bearer' : 'soldier',
    row: slot.row,
    fate,
    scale: slot.row === 'far' ? 0.9 : 1,
    layer,
    frames: track.done(),
    runs,
    strikes: [arrive],
    raise: null,
  };
}

/* ------------------------------------------------------------------------ */
/* Giant killer: a Two fells an Ace                                           */
/* ------------------------------------------------------------------------ */

const STOMPS = [0.09, 0.18, 0.27] as const;
const WINDUP_AT = 0.32;
const TINK_AT = 0.49;
const HITSTOP_END = 0.54;
const TOPPLE_AT = 0.67;
const CRASH_AT = 0.8;

function buildGiantKiller(request: SkirmishRequest, random: () => number): SkirmishPlan {
  const winner = request.winner;
  const loser = otherSide(winner);
  // g points from the centre toward the giant's own side of the field.
  const g = -dirOf(loser);
  const units: SkirmishUnit[] = [];
  const cues: SkirmishCue[] = [];
  const giantX = g * 1.7;
  const giantHead = -(GIANT_SCALE * SKIRMISH_UNIT_HEIGHT_U) * 0.76;

  /* The Ace: three ground-shaking steps, a wind-up, then timber. */
  const giant = new Track({ ...REST, x: g * 8.6, opacity: 0, facing: -g });
  giant.to(0.03, { opacity: 1 });
  const steps = [g * 6.3, g * 4, giantX];
  STOMPS.forEach((at, index) => {
    giant.to(at - 0.035, { y: -0.16, tilt: -g * 3 }, 'ease-in');
    giant.to(at, { x: steps[index], y: 0, tilt: 0, scaleY: 0.93, scaleX: 1.04 }, 'ease-in');
    giant.to(at + 0.03, { scaleY: 1, scaleX: 1 });
    cues.push(cue(at, 'stomp', steps[index], 0.7 + index * 0.2, loser));
  });
  giant.to(WINDUP_AT, {});
  giant.to(0.44, { tilt: g * 9 }, 'ease-out');
  cues.push(cue(WINDUP_AT, 'windup', giantX, 1, loser, giantHead));
  giant.to(TINK_AT, {});
  giant.to(TINK_AT + 0.008, { tilt: g * 11, scaleX: 0.97 });
  giant.to(HITSTOP_END, {});
  giant.to(0.575, { tilt: g * 2 }, 'ease-in-out');
  giant.to(0.61, { tilt: g * 13 }, 'ease-in-out');
  giant.to(0.64, { tilt: g * 6 }, 'ease-in-out');
  giant.to(TOPPLE_AT, { tilt: g * 15 }, 'ease-in-out');
  giant.to(CRASH_AT, { tilt: g * 90 }, 'cubic-bezier(0.6, 0, 0.92, 0.42)');
  giant.to(CRASH_AT + 0.03, { tilt: g * 84, y: -0.12 }, 'ease-out');
  giant.to(CRASH_AT + 0.06, { tilt: g * 90, y: 0 }, 'ease-in');
  giant.to(0.94, {});
  giant.to(1, { opacity: 0 });
  cues.push(cue(TOPPLE_AT, 'creak', giantX, 1, loser, giantHead));
  cues.push(cue(CRASH_AT, 'crash', g * 3.3, 1.6, loser));
  units.push({
    id: unitId(loser, 0),
    side: loser,
    role: 'giant',
    row: 'near',
    fate: 'topple',
    scale: GIANT_SCALE,
    layer: 7,
    frames: giant.done(),
    runs: [],
    strikes: [],
    raise: { from: WINDUP_AT, to: TOPPLE_AT + 0.04 },
  });

  /* The escort: they stand exactly where an Ace lands. */
  const escorts: readonly { row: SkirmishRow; x: number }[] = [
    { row: 'near', x: 3.7 },
    { row: 'far', x: 4.15 },
    { row: 'near', x: 4.6 },
    { row: 'far', x: 5.2 },
  ];
  escorts.forEach((escort, index) => {
    const baseY = escort.row === 'far' ? FAR_ROW_Y : 0;
    const home = g * escort.x;
    const arrive = 0.27 + index * 0.012;
    const track = new Track({ ...REST, x: home + g * 6.6, y: baseY, opacity: 0, facing: -g });
    track.to(0.05, { opacity: 1 });
    track.to(arrive, { x: home });
    // Everyone flinches at the tink.
    track.to(HITSTOP_END, {});
    track.to(HITSTOP_END + 0.02, { y: baseY - 0.24 }, 'ease-out');
    track.to(HITSTOP_END + 0.04, { y: baseY }, 'ease-in');
    const runs: SkirmishWindow[] = [{ from: 0, to: arrive }];
    const last = index === escorts.length - 1;
    let fate: SkirmishFate = 'launch';
    if (last) {
      // The one at the back sees where this is going.
      fate = 'flee';
      const fleeAt = TOPPLE_AT + 0.02;
      track.to(fleeAt, {});
      track.to(fleeAt + 0.02, { y: baseY - 0.45 }, 'ease-out');
      track.to(fleeAt + 0.04, { y: baseY, facing: g }, 'ease-in');
      track.to(0.9, { x: home + g * 5, tilt: g * 12 }, 'ease-in');
      track.to(0.95, { x: home + g * 6.4, opacity: 0 });
      track.to(1, {});
      runs.push({ from: fleeAt + 0.04, to: 0.95 });
      cues.push(cue(fleeAt, 'flee', home, 0.6, loser));
    } else {
      const hitAt = CRASH_AT + index * 0.012;
      track.to(TOPPLE_AT + 0.05, {});
      track.to(hitAt, { scaleY: 0.92, tilt: g * 4 });
      track.to(hitAt + 0.01, { scaleX: 1.2, scaleY: 0.78 });
      cues.push(cue(hitAt, 'launch', home, 0.9 + random() * 0.2, loser, baseY - 0.6));
      flight(track, hitAt + 0.01, 0.17, {
        dx: g * (2.6 + random() * 2.4),
        height: 3 + random() * 1.6,
        spin: g * (540 + random() * 360),
        baseY,
        until: 0.8,
        fadeFrom: 0.5,
      });
      track.to(1, {});
    }
    units.push({
      id: unitId(loser, index + 1),
      side: loser,
      role: 'soldier',
      row: escort.row,
      fate,
      scale: escort.row === 'far' ? 0.9 : 1,
      layer: fate === 'launch' ? 9 : escort.row === 'far' ? 1 : 5,
      frames: track.done(),
      runs,
      strikes: [],
      raise: null,
    });
  });

  /* The Two: one small soldier and one very well placed hit. */
  const heroHome = -g * 2;
  const hero = new Track({ ...REST, x: -g * 8.4, opacity: 0, facing: g });
  hero.to(0.04, { opacity: 1 });
  hero.to(0.22, { x: heroHome });
  // The third stomp lifts the hero clean off the ground.
  hero.to(STOMPS[2], {});
  hero.to(STOMPS[2] + 0.02, { y: -0.4 }, 'ease-out');
  hero.to(STOMPS[2] + 0.045, { y: 0 }, 'ease-in');
  hero.to(0.34, {});
  hero.to(0.43, { x: heroHome - g * 0.25, scaleY: 0.78, scaleX: 1.12 }, 'ease-out');
  const leapPeak = giantHead + 0.15;
  hero.to(0.45, { scaleY: 1.12, scaleX: 0.92, y: leapPeak * 0.45, x: heroHome + g * 0.9, spin: g * 120 });
  hero.to(TINK_AT, { scaleY: 1, scaleX: 1, y: leapPeak, x: g * 0.75, spin: g * 360 }, 'ease-out');
  hero.to(HITSTOP_END, {});
  flight(hero, HITSTOP_END, 0.09, {
    dx: -g * 1.6,
    height: 0.5,
    spin: 0,
    baseY: 0,
    fromY: leapPeak,
  });
  hero.to(0.655, { scaleY: 0.82, scaleX: 1.1 });
  hero.to(0.68, { scaleY: 1, scaleX: 1 });
  hero.to(0.76, { x: -g * 1.7 }, 'ease-out');
  hero.to(CRASH_AT, {});
  hero.to(CRASH_AT + 0.022, { y: -0.36 }, 'ease-out');
  hero.to(CRASH_AT + 0.048, { y: 0 }, 'ease-in');
  hero.to(0.87, {});
  hero.to(0.895, { y: -0.6, scaleY: 1.08 }, 'ease-out');
  hero.to(0.92, { y: 0, scaleY: 0.92 }, 'ease-in');
  hero.to(0.945, { y: -0.42, scaleY: 1.05 }, 'ease-out');
  hero.to(0.97, { y: 0, scaleY: 1 }, 'ease-in');
  hero.to(1, { opacity: 0 });
  cues.push(cue(TINK_AT, 'tink', g * 0.95, 1, winner, leapPeak));
  cues.push(cue(0.87, 'cheer', -g * 1.7, 0.6, winner, -1));
  units.push({
    id: unitId(winner, 0),
    side: winner,
    role: 'hero',
    row: 'near',
    fate: 'triumph',
    scale: HERO_SCALE,
    layer: 10,
    frames: hero.done(),
    runs: [{ from: 0, to: 0.22 }],
    strikes: [TINK_AT],
    raise: { from: 0.86, to: 1 },
  });

  return {
    variant: 'giant-killer',
    winner,
    loser,
    units,
    cues: sortCues(cues),
    impactAt: CRASH_AT,
    stillAt: 0.86,
  };
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

const REST: SkirmishPose = {
  x: 0,
  y: 0,
  tilt: 0,
  spin: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  facing: 1,
};

/** Builds a motion track, carrying every unspecified channel forward. */
class Track {
  private readonly frames: (SkirmishPose & { at: number; easing?: string })[];
  private pose: SkirmishPose;

  constructor(initial: SkirmishPose) {
    this.pose = initial;
    this.frames = [{ at: 0, ...initial }];
  }

  get current(): SkirmishPose {
    return this.pose;
  }

  /** Adds a frame; `easing` shapes the move that arrives at it. */
  to(at: number, change: Partial<SkirmishPose>, easing?: string): this {
    const last = this.frames[this.frames.length - 1];
    const time = Math.min(1, Math.max(last.at, at));
    this.pose = { ...this.pose, ...change };
    if (easing) last.easing = easing;
    this.frames.push({ at: time, ...this.pose });
    return this;
  }

  done(): SkirmishFrame[] {
    const last = this.frames[this.frames.length - 1];
    if (last.at < 1) this.frames.push({ at: 1, ...this.pose });
    return this.frames.map((frame) => ({
      ...frame,
      at: round(frame.at),
      x: round(frame.x),
      y: round(frame.y),
      tilt: round(frame.tilt),
      spin: round(frame.spin),
      scaleX: round(frame.scaleX),
      scaleY: round(frame.scaleY),
      opacity: round(frame.opacity),
    }));
  }
}

interface FlightOptions {
  readonly dx: number;
  readonly height: number;
  readonly spin: number;
  /** Ground level the arc returns to. */
  readonly baseY: number;
  /** Height the arc starts from when it is not the ground. */
  readonly fromY?: number;
  /** Portion of the arc to fly before leaving the scene (1 = land). */
  readonly until?: number;
  /** Arc fraction at which the body starts fading out. */
  readonly fadeFrom?: number;
}

/** Samples a ballistic arc into linear segments short enough to read as a curve. */
function flight(track: Track, from: number, duration: number, options: FlightOptions): void {
  const samples = 8;
  const until = options.until ?? 1;
  const start = track.current;
  const startY = options.fromY ?? options.baseY;
  for (let i = 1; i <= samples; i++) {
    const s = (i / samples) * until;
    const fade = options.fadeFrom === undefined
      ? 1
      : 1 - clamp01((s - options.fadeFrom) / Math.max(0.001, until - options.fadeFrom));
    track.to(from + duration * s, {
      x: start.x + options.dx * s,
      y: mix(startY, options.baseY, s) - 4 * options.height * s * (1 - s),
      spin: start.spin + options.spin * s,
      tilt: mix(start.tilt, 0, Math.min(1, s * 3)),
      scaleX: 1,
      scaleY: 1,
      opacity: fade,
    });
  }
}

function cue(
  at: number,
  kind: SkirmishCueKind,
  x: number,
  weight: number,
  side: PlayerType | null,
  y = 0,
): SkirmishCue {
  return { at: round(clamp01(at)), kind, x: round(x), y: round(y), weight: round(weight), side };
}

function sortCues(cues: SkirmishCue[]): SkirmishCue[] {
  return cues.sort((a, b) => a.at - b.at);
}

function unitId(side: PlayerType, index: number): string {
  return `${side}-${index}`;
}

function dirOf(side: PlayerType): number {
  return side === PlayerType.PLAYER ? 1 : -1;
}

function otherSide(side: PlayerType): PlayerType {
  return side === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
}

function mix(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/** Small seeded generator so a scene can be replayed exactly from its seed. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
