import { TableAudioEngine, VoiceGroup, VoiceMix, Vowel } from './table-audio-engine';

/** How far ahead of the clock events are committed, and how often we look. */
const HORIZON_SECONDS = 0.5;
const TICK_MS = 200;
/** Seconds between war-drum bars at Battle depth 1, 2, 3 and 4+. */
const DRUM_BAR_SECONDS = [1.7, 1.35, 1.05, 0.85] as const;
const VOWELS: readonly Vowel[] = ['a', 'o', 'e'];
const CROWD_LEVEL = 0.16;

interface Bed {
  readonly source: AudioBufferSourceNode;
  readonly level: GainNode;
}

/**
 * The room the game is played in, and the war outside it.
 *
 * At rest this is a quiet tent: air, a little wind and the lamp ticking. Each
 * Battle layer raises `tension`, and the din of a fight builds over that bed:
 * a crowd roar, low rumble, distant steel and shouts scattered at random, and
 * a war drum whose figure tightens with depth. Everything is scheduled a
 * short way ahead of the audio clock, so density follows tension within a beat.
 */
export class TableAmbience {
  private timer: ReturnType<typeof setInterval> | null = null;
  private output: GainNode | null = null;
  private distance: BiquadFilterNode | null = null;
  private events: VoiceGroup | null = null;
  private beds: { room: Bed; wind: Bed; crowd: Bed; rumble: Bed } | null = null;
  private windBand: BiquadFilterNode | null = null;
  private tension = 0;
  private depth = 0;
  private next = { crackle: 0, steel: 0, thud: 0, shout: 0, drum: 0, surge: 0, gust: 0 };

  constructor(private readonly engine: TableAudioEngine) {}

  get running(): boolean {
    return this.output !== null;
  }

  start(): void {
    if (this.output) return;
    const { ctx } = this.engine;
    const now = ctx.currentTime;
    this.output = ctx.createGain();
    this.output.gain.setValueAtTime(0.0001, now);
    this.output.gain.linearRampToValueAtTime(1, now + 1.5);
    // Everything in the bed is heard through canvas: far away and dull.
    this.distance = this.engine.filter('lowpass', 2200, 0.5);
    this.distance.connect(this.output);
    this.output.connect(this.engine.busInput('ambience'));
    this.events = this.engine.createGroup('ambience', this.distance);

    const crowdIn = ctx.createGain();
    for (const formant of [
      { freq: 520, q: 1.4, level: 1 },
      { freq: 1100, q: 1.6, level: 0.7 },
      { freq: 2300, q: 2, level: 0.3 },
    ]) {
      const band = this.engine.filter('bandpass', formant.freq, formant.q);
      const level = ctx.createGain();
      level.gain.value = formant.level;
      crowdIn.connect(band);
      band.connect(level);
      level.connect(this.distance);
    }
    this.windBand = this.engine.filter('bandpass', 420, 0.8);
    this.windBand.connect(this.distance);
    const roomTone = this.engine.filter('lowpass', 380);
    roomTone.connect(this.distance);
    const rumbleTone = this.engine.filter('lowpass', 110);
    rumbleTone.connect(this.distance);

    this.beds = {
      room: this.bed('brown', roomTone, now),
      wind: this.bed('pink', this.windBand, now),
      crowd: this.bed('pink', crowdIn, now),
      rumble: this.bed('brown', rumbleTone, now),
    };
    this.next = {
      crackle: now + 0.4,
      steel: now + 1,
      thud: now + 1,
      shout: now + 1.5,
      drum: now + 0.6,
      surge: now,
      gust: now,
    };
    this.applyTension(0.2);
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  /** Commits every event for the next `seconds` at once, for offline rendering. */
  preroll(seconds: number): void {
    const now = this.engine.ctx.currentTime;
    this.pump(now, now + seconds);
  }

  stop(): void {
    if (!this.output || !this.beds) return;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const now = this.engine.ctx.currentTime;
    const output = this.output;
    output.gain.cancelScheduledValues(now);
    output.gain.setValueAtTime(output.gain.value, now);
    output.gain.linearRampToValueAtTime(0, now + 0.4);
    for (const bed of Object.values(this.beds)) {
      try {
        bed.source.stop(now + 0.45);
      } catch {
        // Already stopped.
      }
    }
    this.events?.release();
    setTimeout(() => output.disconnect(), 600);
    this.output = null;
    this.distance = null;
    this.events = null;
    this.windBand = null;
    this.beds = null;
  }

  /** 0 = quiet table, 1 = the deepest Battle. `depth` picks the drum figure. */
  setTension(tension: number, depth: number): void {
    this.tension = Math.max(0, Math.min(1, tension));
    this.depth = Math.max(0, Math.floor(depth));
    if (this.output) this.applyTension(1.1);
  }

  private bed(color: 'pink' | 'brown', into: AudioNode, now: number): Bed {
    const source = this.engine.noiseSource(color);
    const level = this.engine.ctx.createGain();
    level.gain.value = 0;
    source.connect(level);
    level.connect(into);
    source.start(now, Math.random() * 1.5);
    return { source, level };
  }

  private applyTension(timeConstant: number): void {
    if (!this.beds || !this.distance) return;
    const now = this.engine.ctx.currentTime;
    const t = this.tension;
    this.beds.room.level.gain.setTargetAtTime(0.05, now, timeConstant);
    this.beds.wind.level.gain.setTargetAtTime(0.02 + t * 0.06, now, timeConstant);
    this.beds.crowd.level.gain.setTargetAtTime(t * CROWD_LEVEL, now, timeConstant);
    this.beds.rumble.level.gain.setTargetAtTime(t * 0.14, now, timeConstant);
    // The fight gets closer as it deepens, so more of its top end arrives.
    this.distance.frequency.setTargetAtTime(2200 + t * 2800, now, timeConstant);
  }

  private tick(): void {
    const { ctx } = this.engine;
    // A suspended clock (hidden tab) must not pile up events for later.
    if (ctx.state !== 'running') return;
    this.pump(ctx.currentTime, ctx.currentTime + HORIZON_SECONDS);
  }

  private pump(now: number, until: number): void {
    const { engine } = this;
    const group = this.events;
    if (!this.beds || !group) return;
    const t = this.tension;
    const far = (gain: number, reverb: number): VoiceMix => ({
      group,
      gain,
      reverb,
      pan: engine.rand(-0.8, 0.8),
    });

    // The lamp: sparse dry ticks that never stop.
    this.every('crackle', now, until, 2.2 + t * 2, (at) => {
      const size = Math.pow(engine.rand(0.15, 1), 2);
      engine.burst(
        at,
        'white',
        { duration: engine.rand(0.004, 0.012), attack: 0.001 },
        [engine.filter('bandpass', engine.rand(1800, 5200), 2)],
        { group, pan: engine.rand(-0.4, 0.4), reverb: 0.1 },
        0.2 * size,
      );
    });

    // Wind leans on the canvas in slow gusts.
    while (this.next.gust < until) {
      const at = Math.max(now, this.next.gust);
      this.windBand?.frequency.setTargetAtTime(engine.rand(260, 640), at, 1.6);
      this.next.gust = at + engine.rand(2.5, 5);
    }

    if (t <= 0) return;

    // A crowd never holds one level: it surges.
    while (this.next.surge < until) {
      const at = Math.max(now, this.next.surge);
      this.beds.crowd.level.gain.setTargetAtTime(t * CROWD_LEVEL * engine.rand(0.6, 1.5), at, 0.35);
      this.next.surge = at + engine.rand(0.5, 1.3);
    }

    this.every('steel', now, until, 4.5 * t * t, (at) => {
      engine.steel(at, { pitch: engine.rand(0.7, 1.2), ring: 0.7 }, far(engine.rand(0.12, 0.3), 0.6));
    });
    this.every('thud', now, until, 1.6 * t, (at) => {
      engine.thud(at, { pitch: engine.rand(0.8, 1.2) }, far(engine.rand(0.1, 0.2), 0.5));
    });
    this.every('shout', now, until, 0.55 * t, (at) => {
      engine.shout(
        at,
        {
          pitch: engine.rand(0.7, 1.5),
          duration: engine.rand(0.15, 0.4),
          vowel: VOWELS[Math.floor(engine.rand(0, VOWELS.length))],
          rise: engine.rand(1, 1.3),
        },
        far(engine.rand(0.06, 0.13), 0.7),
      );
    });

    if (this.depth > 0) this.drums(group, now, until, t);
  }

  /** One bar of the war drum per pass; the figure fills in as the Battle deepens. */
  private drums(group: VoiceGroup, now: number, until: number, tension: number): void {
    const { engine } = this;
    const bar = DRUM_BAR_SECONDS[Math.min(this.depth, DRUM_BAR_SECONDS.length) - 1];
    const figure =
      this.depth === 1 ? [0] : this.depth === 2 ? [0, 0.22] : this.depth === 3 ? [0, 0.25, 0.5] : [0, 0.25, 0.5, 0.75];
    if (this.next.drum < now) this.next.drum = now + 0.05;
    while (this.next.drum < until) {
      figure.forEach((offset, index) => {
        engine.drum(
          this.next.drum + offset * bar,
          { pitch: index === 0 ? 0.9 : 0.98 },
          { group, gain: (index === 0 ? 0.13 : 0.08) * (0.6 + tension * 0.5), reverb: 0.5 },
        );
      });
      this.next.drum += bar;
    }
  }

  /** Runs `fire` at random moments averaging `rate` per second, up to the horizon. */
  private every(
    stream: 'crackle' | 'steel' | 'thud' | 'shout',
    now: number,
    until: number,
    rate: number,
    fire: (at: number) => void,
  ): void {
    if (rate <= 0) return;
    if (this.next[stream] < now) this.next[stream] = now + this.wait(rate);
    while (this.next[stream] < until) {
      fire(this.next[stream]);
      this.next[stream] += this.wait(rate);
    }
  }

  /** Exponential gap, floored so two events never land on the same instant. */
  private wait(rate: number): number {
    return Math.max(0.03, -Math.log(1 - this.engine.rand(0, 0.999)) / rate);
  }
}
