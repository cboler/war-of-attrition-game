/**
 * Procedural sound for the card table, built on raw Web Audio.
 *
 * Nothing here plays a recording. Each voice imitates how its source makes
 * sound: paper and crowds are noise shaped by resonant filters, steel is a
 * handful of inharmonic partials that ring out at different rates, drums and
 * falls are a pitched thump under a burst of low noise. Small random
 * differences on every call keep repeats from sounding stamped out.
 *
 * The engine takes any BaseAudioContext, so the same voices render through an
 * OfflineAudioContext for tests and tuning.
 */

export type NoiseColor = 'white' | 'pink' | 'brown';
export type AudioBus = 'sfx' | 'ambience';
export type Vowel = 'a' | 'o' | 'e';

export interface VoiceMix {
  readonly gain?: number;
  /** -1 (left) to 1 (right). */
  readonly pan?: number;
  /** Share of the voice sent to the room reverb. */
  readonly reverb?: number;
  readonly bus?: AudioBus;
  readonly group?: VoiceGroup;
}

/** A timed sound event from the skirmish choreography. */
export interface SoundCue {
  readonly at: number;
  readonly kind: string;
  /** Position in soldier widths from the middle of the field. */
  readonly x: number;
  readonly weight: number;
}

/** A set of voices that can be silenced together, e.g. when a scene is skipped. */
export class VoiceGroup {
  private readonly sources = new Set<AudioScheduledSourceNode>();

  constructor(
    private readonly ctx: BaseAudioContext,
    readonly input: GainNode,
    readonly wet: GainNode,
  ) {}

  track(source: AudioScheduledSourceNode): void {
    this.sources.add(source);
    source.addEventListener('ended', () => this.sources.delete(source), { once: true });
  }

  /** Cuts whatever has not played yet. Past `endsAt` the tails are left to ring out. */
  release(endsAt = Number.POSITIVE_INFINITY): void {
    const now = this.ctx.currentTime;
    const sources = [...this.sources];
    this.sources.clear();
    if (now >= endsAt - 0.06) return;
    for (const node of [this.input, this.wet]) {
      node.gain.cancelScheduledValues(now);
      node.gain.setValueAtTime(node.gain.value, now);
      node.gain.linearRampToValueAtTime(0, now + 0.07);
    }
    for (const source of sources) {
      try {
        source.stop(now + 0.09);
      } catch {
        // Already finished.
      }
    }
  }
}

const SILENT = 0.0001;
/** Cards are on felt at arm's length: close and nearly dry. */
const CARD_REVERB = 0.04;
const STEEL_PARTIALS = [
  { ratio: 1, level: 1, ring: 0.2 },
  { ratio: 1.52, level: 0.7, ring: 0.16 },
  { ratio: 2.11, level: 0.55, ring: 0.12 },
  { ratio: 2.93, level: 0.4, ring: 0.09 },
  { ratio: 3.71, level: 0.28, ring: 0.06 },
  { ratio: 4.63, level: 0.18, ring: 0.04 },
] as const;
const CHIME_PARTIALS = [
  { ratio: 1, level: 1, ring: 1 },
  { ratio: 2.76, level: 0.42, ring: 0.6 },
  { ratio: 5.4, level: 0.2, ring: 0.35 },
  { ratio: 8.93, level: 0.08, ring: 0.2 },
] as const;
const FORMANTS: Record<Vowel, readonly { freq: number; level: number }[]> = {
  a: [
    { freq: 780, level: 1 },
    { freq: 1180, level: 0.7 },
    { freq: 2600, level: 0.3 },
  ],
  o: [
    { freq: 460, level: 1 },
    { freq: 820, level: 0.55 },
    { freq: 2500, level: 0.14 },
  ],
  e: [
    { freq: 520, level: 1 },
    { freq: 1800, level: 0.55 },
    { freq: 2550, level: 0.3 },
  ],
};

export class TableAudioEngine {
  private readonly master: GainNode;
  private readonly buses: Record<AudioBus, GainNode>;
  private readonly reverbs: Record<AudioBus, AudioNode>;
  private readonly noise: Record<NoiseColor, AudioBuffer>;
  private readonly driveCurve: Float32Array<ArrayBuffer>;

  constructor(
    readonly ctx: BaseAudioContext,
    private readonly random: () => number = Math.random,
  ) {
    // A fast, steep compressor as a safety limiter: a busy skirmish must never clip.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    limiter.connect(this.master);
    this.master.connect(ctx.destination);

    this.buses = { sfx: ctx.createGain(), ambience: ctx.createGain() };
    this.buses.sfx.connect(limiter);
    this.buses.ambience.connect(limiter);

    // Soft clipping adds the upper harmonics that let a small speaker imply a low note.
    this.driveCurve = new Float32Array(1024);
    for (let i = 0; i < this.driveCurve.length; i++) {
      this.driveCurve[i] = Math.tanh(3 * ((i / (this.driveCurve.length - 1)) * 2 - 1));
    }

    this.noise = {
      white: this.noiseBuffer('white'),
      pink: this.noiseBuffer('pink'),
      brown: this.noiseBuffer('brown'),
    };
    const impulse = this.roomImpulse();
    this.reverbs = { sfx: this.room(impulse, 'sfx'), ambience: this.room(impulse, 'ambience') };
  }

  get now(): number {
    return this.ctx.currentTime;
  }

  /** Entry point for voices on a bus, for layers that manage their own nodes. */
  busInput(bus: AudioBus): AudioNode {
    return this.buses[bus];
  }

  setBusVolume(bus: AudioBus, volume: number): void {
    this.buses[bus].gain.setTargetAtTime(clamp(volume, 0, 1.5), this.ctx.currentTime, 0.05);
  }

  setMuted(muted: boolean): void {
    this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.03);
  }

  /** `dry` reroutes the group's direct sound, e.g. through a shared filter. */
  createGroup(bus: AudioBus = 'sfx', dry?: AudioNode): VoiceGroup {
    const input = this.ctx.createGain();
    const wet = this.ctx.createGain();
    input.connect(dry ?? this.buses[bus]);
    wet.connect(this.reverbs[bus]);
    return new VoiceGroup(this.ctx, input, wet);
  }

  rand(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  chance(probability: number): boolean {
    return this.random() < probability;
  }

  /** A looping noise source that the caller filters, connects and owns. */
  noiseSource(color: NoiseColor): AudioBufferSourceNode {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noise[color];
    source.loop = true;
    return source;
  }

  /* ---------------------------------------------------------------------- */
  /* Cards                                                                  */
  /* ---------------------------------------------------------------------- */

  /** A card sliding off the deck: friction hiss that brightens, then the edge letting go. */
  cardDraw(when: number, source: VoiceMix = {}): void {
    const mix = { reverb: CARD_REVERB, ...source };
    this.slide(when, { duration: 0.13, from: this.rand(1500, 1900), to: this.rand(3800, 4600) }, mix, 0.42);
    this.burst(when + 0.11, 'white', { duration: 0.008, attack: 0.001 }, [this.filter('highpass', 3600)], mix, 0.16);
  }

  /** A flip: air moving under the card, then the snap as it lands face up. */
  cardFlip(when: number, source: VoiceMix = {}): void {
    const mix = { reverb: CARD_REVERB, ...source };
    this.slide(when, { duration: 0.075, from: 1300, to: this.rand(2900, 3500), q: 1.2 }, mix, 0.2);
    const snap = when + 0.072;
    this.burst(
      snap,
      'white',
      { duration: 0.024, attack: 0.001 },
      [this.filter('highpass', 2200), this.filter('lowpass', 8200)],
      mix,
      0.42,
    );
    this.tone(snap, { type: 'sine', from: this.rand(320, 360), to: 170, duration: 0.04 }, mix, 0.12);
  }

  /** A card settling on felt: mostly a soft low pat. */
  cardLand(when: number, source: VoiceMix = {}): void {
    const mix = { reverb: CARD_REVERB, ...source };
    this.burst(when, 'pink', { duration: 0.045, attack: 0.002 }, [this.filter('lowpass', this.rand(2200, 2800))], mix, 1.7);
    this.tone(when, { type: 'sine', from: 150, to: 90, duration: 0.04, drive: true }, mix, 0.14);
    this.burst(when, 'white', { duration: 0.005, attack: 0.001 }, [this.filter('highpass', 4000)], mix, 0.14);
  }

  /** Cards swept to the Boneyard: two overlapping slides and the pile taking them. */
  boneyard(when: number, source: VoiceMix = {}): void {
    const mix = { reverb: CARD_REVERB, ...source };
    this.slide(when, { duration: 0.2, from: 700, to: 1500 }, mix, 0.26);
    this.slide(when + 0.06, { duration: 0.17, from: 900, to: 1900 }, mix, 0.2);
    this.cardLand(when + 0.2, { ...mix, gain: (mix.gain ?? 1) * 0.7 });
  }

  /* ---------------------------------------------------------------------- */
  /* Steel, wood and bodies                                                 */
  /* ---------------------------------------------------------------------- */

  /** One blade struck: inharmonic partials that die away from the top down. */
  steel(
    when: number,
    shape: { pitch?: number; ring?: number } = {},
    mix: VoiceMix = {},
  ): void {
    const base = this.rand(950, 1650) * (shape.pitch ?? 1);
    const ring = shape.ring ?? 1;
    const out = this.port(mix, 0.3, 0.22);
    for (const partial of STEEL_PARTIALS) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = Math.min(16000, base * partial.ratio * this.rand(0.996, 1.004));
      const env = this.ctx.createGain();
      this.strike(env.gain, when, partial.level, 0.0015, partial.ring * ring * this.rand(0.8, 1.2));
      osc.connect(env);
      env.connect(out);
      this.run(osc, when, partial.ring * ring * 1.3 + 0.03, mix);
    }
    this.burst(
      when,
      'white',
      { duration: 0.02, attack: 0.001 },
      [this.filter('bandpass', Math.min(12000, base * 1.2), 0.7)],
      { ...mix, reverb: 0 },
      0.18,
    );
  }

  /** Blades meeting: a few strikes a few milliseconds apart, plus the shields behind them. */
  clash(when: number, weight = 1, mix: VoiceMix = {}): void {
    const gain = mix.gain ?? 1;
    const blades = weight > 1.1 ? 4 : 3;
    for (let i = 0; i < blades; i++) {
      this.steel(
        when + i * this.rand(0.008, 0.022),
        { pitch: this.rand(0.75, 1.25), ring: this.rand(0.8, 1.3) },
        { ...mix, gain: gain * weight * this.rand(0.5, 0.8), pan: (mix.pan ?? 0) + this.rand(-0.25, 0.25) },
      );
    }
    this.thud(when, { pitch: this.rand(0.9, 1.1) }, { ...mix, gain: gain * weight * 0.5 });
    this.thud(when + this.rand(0.02, 0.05), { pitch: this.rand(1.05, 1.3) }, { ...mix, gain: gain * weight * 0.32 });
  }

  /** A shield or a wooden haft taking a blow. */
  thud(when: number, shape: { pitch?: number } = {}, mix: VoiceMix = {}): void {
    const pitch = shape.pitch ?? 1;
    this.tone(when, { type: 'sine', from: 165 * pitch, to: 78 * pitch, duration: 0.11, glide: 0.07, drive: true }, mix, 0.5);
    // The knock a small speaker can actually reproduce lives above the fundamental.
    this.tone(when, { type: 'triangle', from: 430 * pitch, to: 190 * pitch, duration: 0.1, glide: 0.06 }, mix, 0.5);
    this.burst(when, 'pink', { duration: 0.09, attack: 0.002 }, [this.filter('lowpass', 1500 * pitch)], mix, 2.2);
    this.burst(when, 'white', { duration: 0.04, attack: 0.001 }, [this.filter('bandpass', 620 * pitch, 2.5)], mix, 0.9);
  }

  /** A body meeting the ground. */
  thump(when: number, mix: VoiceMix = {}): void {
    this.burst(when, 'brown', { duration: 0.14, attack: 0.003 }, [this.filter('lowpass', 240)], mix, 1);
    this.burst(when, 'pink', { duration: 0.09, attack: 0.003 }, [this.filter('bandpass', 480, 0.7)], mix, 2.4);
    this.tone(when, { type: 'sine', from: 74, to: 42, duration: 0.13, drive: true }, mix, 0.5);
  }

  /** Something very large arriving: a sub drop under a wall of low noise. */
  boom(when: number, shape: { duration?: number } = {}, mix: VoiceMix = {}): void {
    const duration = shape.duration ?? 0.6;
    this.tone(when, { type: 'sine', from: 58, to: 27, duration, glide: duration * 0.7, attack: 0.004, drive: true }, mix, 0.85);
    const lowpass = this.filter('lowpass', 320);
    lowpass.frequency.setValueAtTime(320, when);
    lowpass.frequency.exponentialRampToValueAtTime(90, when + duration * 0.8);
    this.burst(when, 'brown', { duration: duration * 0.8, attack: 0.004 }, [lowpass], mix, 0.95);
    this.tone(when, { type: 'triangle', from: 124, to: 56, duration: duration * 0.6, glide: duration * 0.4, drive: true }, mix, 0.4);
    this.burst(when, 'pink', { duration: Math.min(0.3, duration * 0.5), attack: 0.003 }, [this.filter('bandpass', 520, 0.8)], mix, 2.6);
    this.thud(when, { pitch: 0.7 }, { ...mix, gain: (mix.gain ?? 1) * 0.6 });
  }

  /** Air displaced by something moving fast. */
  whoosh(
    when: number,
    shape: { duration?: number; from?: number; peak?: number; to?: number } = {},
    mix: VoiceMix = {},
  ): void {
    const duration = shape.duration ?? 0.28;
    const band = this.filter('bandpass', shape.from ?? 500, 1.4);
    band.frequency.setValueAtTime(shape.from ?? 500, when);
    band.frequency.exponentialRampToValueAtTime(shape.peak ?? 2400, when + duration * 0.45);
    band.frequency.exponentialRampToValueAtTime(shape.to ?? 700, when + duration);
    this.burst(when, 'white', { duration, attack: duration * 0.45 }, [band], mix, 0.5);
  }

  /** A falling tree of a man: a slow groan that sinks as he goes over. */
  creak(when: number, duration: number, mix: VoiceMix = {}): void {
    const out = this.port(mix, 0.7, 0.2);
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(64, when);
    osc.frequency.exponentialRampToValueAtTime(34, when + duration);
    const band = this.filter('bandpass', 420, 3);
    band.frequency.setValueAtTime(520, when);
    band.frequency.exponentialRampToValueAtTime(240, when + duration);
    // A fast wobble in level reads as timber fibres letting go one by one.
    const flutter = this.ctx.createGain();
    flutter.gain.value = 0.6;
    const wobble = this.ctx.createOscillator();
    wobble.frequency.setValueAtTime(11, when);
    wobble.frequency.linearRampToValueAtTime(22, when + duration);
    const depth = this.ctx.createGain();
    depth.gain.value = 0.4;
    wobble.connect(depth);
    depth.connect(flutter.gain);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(SILENT, when);
    env.gain.linearRampToValueAtTime(0.5, when + duration * 0.3);
    env.gain.linearRampToValueAtTime(1, when + duration * 0.95);
    env.gain.linearRampToValueAtTime(SILENT, when + duration + 0.03);
    osc.connect(band);
    band.connect(flutter);
    flutter.connect(env);
    env.connect(out);
    this.run(osc, when, duration + 0.04, mix);
    this.run(wobble, when, duration + 0.04, mix);
    this.whoosh(when + duration * 0.35, { duration: duration * 0.65, from: 900, peak: 600, to: 180 }, {
      ...mix,
      gain: (mix.gain ?? 1) * 0.5,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Voices                                                                 */
  /* ---------------------------------------------------------------------- */

  /** One soldier's shout: a buzzy source pushed through three vowel resonances. */
  shout(
    when: number,
    shape: { pitch?: number; duration?: number; vowel?: Vowel; rise?: number } = {},
    mix: VoiceMix = {},
  ): void {
    const duration = shape.duration ?? 0.16;
    const base = this.rand(135, 165) * (shape.pitch ?? 1);
    const rise = shape.rise ?? 1.15;
    const out = this.port(mix, 1.1, 0.3);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(SILENT, when);
    env.gain.linearRampToValueAtTime(1, when + 0.014);
    env.gain.setValueAtTime(1, when + duration * 0.55);
    env.gain.exponentialRampToValueAtTime(SILENT, when + duration);
    env.connect(out);
    const bank = this.formants(shape.vowel ?? 'a', 7, 1.1, env);
    for (const detune of [-9, 8]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.detune.value = detune;
      osc.frequency.setValueAtTime(base * 0.9, when);
      osc.frequency.linearRampToValueAtTime(base * rise, when + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(base * 0.8, when + duration);
      osc.connect(bank);
      this.run(osc, when, duration + 0.02, mix);
    }
    const breath = this.noiseSource('pink');
    const breathLevel = this.ctx.createGain();
    breathLevel.gain.value = 0.5;
    breath.connect(breathLevel);
    breathLevel.connect(bank);
    this.run(breath, when, duration + 0.02, mix, true);
  }

  /** Many voices at once: shaped noise carries the mass, a few pitched voices give it throats. */
  crowd(
    when: number,
    shape: {
      duration: number;
      attack?: number;
      release?: number;
      voices?: number;
      bright?: number;
      lift?: number;
    },
    mix: VoiceMix = {},
  ): void {
    const { duration } = shape;
    const attack = Math.min(duration * 0.95, shape.attack ?? 0.05);
    const release = Math.min(duration - attack, shape.release ?? 0.2);
    const out = this.port(mix, 0.9, 0.3);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(SILENT, when);
    env.gain.linearRampToValueAtTime(1, when + attack);
    env.gain.setValueAtTime(1, when + duration - release);
    env.gain.linearRampToValueAtTime(SILENT, when + duration);
    env.connect(out);
    const bank = this.formants('a', 2.6, 0.9, env, shape.bright ?? 1);
    const mass = this.noiseSource('pink');
    mass.connect(bank);
    this.run(mass, when, duration + 0.02, mix, true);
    const lift = shape.lift ?? 1;
    for (let i = 0; i < (shape.voices ?? 4); i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      const pitch = this.rand(105, 235);
      osc.frequency.setValueAtTime(pitch, when);
      osc.frequency.linearRampToValueAtTime(pitch * lift * this.rand(0.94, 1.08), when + duration);
      const level = this.ctx.createGain();
      level.gain.value = 0.16;
      osc.connect(level);
      level.connect(bank);
      this.run(osc, when, duration + 0.02, mix);
    }
  }

  /** Many boots: one low noise source gated into a run of uneven footfalls. */
  stampede(when: number, shape: { duration: number; rate?: number }, mix: VoiceMix = {}): void {
    const { duration } = shape;
    const out = this.port(mix, 1, 0.1);
    const gate = this.ctx.createGain();
    gate.gain.setValueAtTime(SILENT, when);
    const spacing = 1 / (shape.rate ?? 22);
    for (let t = 0; t + spacing < duration; t += spacing * this.rand(0.8, 1.25)) {
      const swell = 0.35 + 0.65 * (t / duration);
      gate.gain.setValueAtTime(swell * this.rand(0.5, 1), when + t);
      gate.gain.exponentialRampToValueAtTime(0.02, when + t + spacing * 0.75);
    }
    gate.gain.setValueAtTime(SILENT, when + duration);
    const source = this.noiseSource('brown');
    const lowpass = this.filter('lowpass', 620);
    source.connect(lowpass);
    lowpass.connect(gate);
    gate.connect(out);
    this.run(source, when, duration + 0.02, mix, true);
  }

  /* ---------------------------------------------------------------------- */
  /* Drums, horns and chimes                                                */
  /* ---------------------------------------------------------------------- */

  /** A skin war drum: the head drops in pitch as it relaxes after the stick. */
  drum(when: number, shape: { pitch?: number } = {}, mix: VoiceMix = {}): void {
    const pitch = shape.pitch ?? 1;
    const wet = { reverb: 0.35, ...mix };
    this.tone(when, { type: 'sine', from: 118 * pitch, to: 64 * pitch, duration: 0.42, glide: 0.16, drive: true }, wet, 0.7);
    this.tone(when, { type: 'triangle', from: 236 * pitch, to: 128 * pitch, duration: 0.26, glide: 0.1, drive: true }, wet, 0.42);
    this.tone(when, { type: 'triangle', from: 372 * pitch, to: 206 * pitch, duration: 0.14, glide: 0.08 }, wet, 0.28);
    // The slap of the skin is what survives a phone speaker.
    this.burst(when, 'pink', { duration: 0.08, attack: 0.001 }, [this.filter('bandpass', 620 * pitch, 0.8)], wet, 2.4);
    this.burst(when, 'white', { duration: 0.014, attack: 0.001 }, [this.filter('lowpass', 1400)], wet, 0.32);
  }

  /** A war horn: detuned saws under a lowpass that opens as the player leans in. */
  horn(
    when: number,
    shape: { freq: number; duration: number; bright?: number; scoop?: number },
    mix: VoiceMix = {},
  ): void {
    const { freq, duration } = shape;
    const bright = shape.bright ?? 1;
    const end = when + duration;
    const out = this.port(mix, 0.11, 0.4);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(SILENT, when);
    env.gain.linearRampToValueAtTime(1, when + 0.07);
    env.gain.setValueAtTime(1, Math.max(when + 0.08, end - 0.18));
    env.gain.linearRampToValueAtTime(SILENT, end);
    const lowpass = this.filter('lowpass', 260, 1.2);
    lowpass.frequency.setValueAtTime(260, when);
    lowpass.frequency.exponentialRampToValueAtTime(1400 * bright + freq * 3, when + 0.1);
    lowpass.frequency.exponentialRampToValueAtTime(900 * bright + freq * 2, end);
    lowpass.connect(env);
    env.connect(out);
    // Players scoop up into the note; vibrato only arrives once it has settled.
    const scoop = Math.pow(2, (shape.scoop ?? -70) / 1200);
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.value = 5.2;
    const depth = this.ctx.createGain();
    depth.gain.setValueAtTime(0, when);
    depth.gain.setValueAtTime(0, when + Math.min(0.2, duration * 0.5));
    depth.gain.linearRampToValueAtTime(freq * 0.004, end);
    vibrato.connect(depth);
    this.run(vibrato, when, duration + 0.02, mix);
    const voices: readonly { type: OscillatorType; ratio: number; detune: number; level: number }[] = [
      { type: 'sawtooth', ratio: 1, detune: 5, level: 1 },
      { type: 'sawtooth', ratio: 1, detune: -6, level: 1 },
      { type: 'square', ratio: 0.5, detune: 0, level: 0.3 },
    ];
    for (const voice of voices) {
      const osc = this.ctx.createOscillator();
      osc.type = voice.type;
      osc.detune.value = voice.detune;
      osc.frequency.setValueAtTime(freq * voice.ratio * scoop, when);
      osc.frequency.exponentialRampToValueAtTime(freq * voice.ratio, when + 0.09);
      depth.connect(osc.frequency);
      const level = this.ctx.createGain();
      level.gain.value = voice.level;
      osc.connect(level);
      level.connect(lowpass);
      this.run(osc, when, duration + 0.02, mix);
    }
  }

  /** A small bright bell for good news. */
  chime(when: number, shape: { freq: number; decay?: number }, mix: VoiceMix = {}): void {
    const decay = shape.decay ?? 0.5;
    const out = this.port(mix, 0.28, 0.35);
    for (const partial of CHIME_PARTIALS) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = Math.min(16000, shape.freq * partial.ratio);
      const env = this.ctx.createGain();
      this.strike(env.gain, when, partial.level, 0.002, decay * partial.ring);
      osc.connect(env);
      env.connect(out);
      this.run(osc, when, decay * partial.ring + 0.03, mix);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Table cues                                                             */
  /* ---------------------------------------------------------------------- */

  /** A good ordinary result: two small bells stepping up. */
  resolvePositive(when: number): void {
    this.chime(when, { freq: 659.25, decay: 0.32 }, { gain: 0.55 });
    this.chime(when + 0.08, { freq: 987.77, decay: 0.42 }, { gain: 0.6 });
  }

  /** A bad ordinary result: a dull knock and a tone that sags. */
  resolveNegative(when: number): void {
    this.thud(when, { pitch: 0.8 }, { gain: 0.5 });
    this.tone(when + 0.01, { type: 'triangle', from: 330, to: 233, duration: 0.24, glide: 0.2, attack: 0.01 }, { reverb: 0.25 }, 0.34);
    this.tone(when + 0.01, { type: 'sawtooth', from: 165, to: 116.5, duration: 0.2, glide: 0.2, attack: 0.01 }, { reverb: 0.25 }, 0.08);
  }

  /** A Battle won: a rising horn call over two drum strokes. */
  battleVictory(when: number): void {
    this.drum(when, {}, { gain: 0.55 });
    this.horn(when, { freq: 196, duration: 0.2 }, { gain: 0.65 });
    this.horn(when + 0.13, { freq: 261.63, duration: 0.2 }, { gain: 0.7 });
    this.horn(when + 0.26, { freq: 329.63, duration: 0.5, bright: 1.2 }, { gain: 0.8 });
    this.drum(when + 0.26, { pitch: 1.1 }, { gain: 0.6 });
    this.chime(when + 0.3, { freq: 1046.5, decay: 0.6 }, { gain: 0.5 });
  }

  /** A Battle lost: the horn drops a third and the drum goes slack. */
  battleDefeat(when: number): void {
    this.drum(when, { pitch: 0.8 }, { gain: 0.6 });
    this.horn(when, { freq: 164.81, duration: 0.34, bright: 0.7, scoop: 0 }, { gain: 0.8 });
    this.horn(when + 0.28, { freq: 130.81, duration: 0.6, bright: 0.6, scoop: 40 }, { gain: 0.8 });
    this.drum(when + 0.3, { pitch: 0.72 }, { gain: 0.5 });
  }

  /** The call to a Battle. Each deeper layer adds a horn and a harder drum figure. */
  battleCall(when: number, depth: number): void {
    const layers = Math.max(1, Math.min(3, depth));
    const strokes = layers === 1 ? [0] : layers === 2 ? [0, 0.16] : [0, 0.1, 0.2, 0.32];
    strokes.forEach((offset, index) => {
      this.drum(when + offset, { pitch: 1 + (layers - 1) * 0.04 }, { gain: 0.4 + 0.3 * ((index + 1) / strokes.length) });
    });
    const call = when + strokes[strokes.length - 1] + 0.04;
    const length = 0.6 + layers * 0.15;
    const notes = [146.83, 220, 293.66].slice(0, layers);
    notes.forEach((freq, index) => {
      this.horn(call + index * 0.03, { freq, duration: length, bright: 0.8 + layers * 0.15 }, { gain: 0.9 - layers * 0.1 });
    });
    if (layers >= 3) {
      this.crowd(call, { duration: length, attack: length * 0.5, release: 0.3, voices: 5 }, { gain: 0.22, reverb: 0.5 });
    }
  }

  /** The war won: a short fanfare, a held chord, and the camp answering. */
  victory(when: number): void {
    const call: readonly [number, number, number][] = [
      [0, 261.63, 0.18],
      [0.18, 261.63, 0.18],
      [0.36, 392, 0.22],
      [0.58, 329.63, 0.22],
    ];
    for (const [offset, freq, duration] of call) this.horn(when + offset, { freq, duration, bright: 1.2 }, { gain: 0.7 });
    for (const offset of [0, 0.36, 0.68, 0.74, 0.8]) this.drum(when + offset, {}, { gain: offset === 0.8 ? 0.65 : 0.45 });
    for (const freq of [261.63, 329.63, 392, 523.25]) {
      this.horn(when + 0.8, { freq, duration: 1.15, bright: 1.3 }, { gain: 0.42 });
    }
    this.crowd(when + 0.8, { duration: 1.3, attack: 0.06, release: 0.8, voices: 6, bright: 1.25, lift: 1.12 }, { gain: 0.3, reverb: 0.5 });
    [1318.5, 1568, 2093].forEach((freq, index) => {
      this.chime(when + 0.86 + index * 0.1, { freq, decay: 0.7 }, { gain: 0.4, pan: (index - 1) * 0.4 });
    });
  }

  /** The war lost: three low, slow horn steps down and a wind that outlasts them. */
  defeat(when: number): void {
    const steps: readonly [number, number, number, number][] = [
      [0, 110, 164.81, 0.95],
      [0.7, 98, 146.83, 0.95],
      [1.4, 87.31, 130.81, 1.5],
    ];
    steps.forEach(([offset, low, high, duration], index) => {
      const gain = 0.9 - index * 0.12;
      this.horn(when + offset, { freq: low, duration, bright: 0.5, scoop: 30 }, { gain, reverb: 0.5 });
      this.horn(when + offset, { freq: high, duration, bright: 0.45, scoop: 30 }, { gain: gain * 0.7, reverb: 0.5 });
      this.drum(when + offset, { pitch: 0.75 }, { gain: 0.55 - index * 0.08 });
    });
    const band = this.filter('bandpass', 380, 0.9);
    band.frequency.setValueAtTime(320, when);
    band.frequency.linearRampToValueAtTime(520, when + 1.6);
    band.frequency.linearRampToValueAtTime(300, when + 3);
    this.burst(when, 'pink', { duration: 3, attack: 1.2 }, [band], { reverb: 0.4 }, 0.16);
  }

  /* ---------------------------------------------------------------------- */
  /* Skirmish                                                               */
  /* ---------------------------------------------------------------------- */

  /** Schedules the sound of a whole skirmish from its choreography cues. */
  skirmish(cues: readonly SoundCue[], when: number, seconds: number, group: VoiceGroup): void {
    const impact = cues.find((cue) => cue.kind === 'clash' || cue.kind === 'crash');
    const charge = Math.max(0.2, (impact?.at ?? 0.36) * seconds);
    for (const cue of cues) {
      const at = when + cue.at * seconds;
      const mix: VoiceMix = { group, pan: clamp(cue.x / 7, -1, 1) * 0.6 };
      this.skirmishCue(cue, at, charge, seconds, mix);
    }
  }

  private skirmishCue(cue: SoundCue, at: number, charge: number, seconds: number, mix: VoiceMix): void {
    const weight = cue.weight;
    // Many voices overlap at the clash, so each one is mixed well under full level.
    const level = (gain: number): VoiceMix => ({ ...mix, gain: gain * 0.7 });
    switch (cue.kind) {
      case 'charge':
        this.stampede(at, { duration: charge }, level(0.5 * weight));
        this.crowd(at, { duration: charge + 0.03, attack: charge * 0.92, release: 0.05, voices: 3, lift: 1.25 }, level(0.26 * weight));
        break;
      case 'clash':
        this.clash(at, weight, level(1));
        this.boom(at, { duration: 0.28 }, level(0.22 * weight));
        break;
      case 'launch':
        this.thud(at, { pitch: this.rand(1, 1.25) }, level(0.6 * weight));
        if (this.chance(0.5)) this.steel(at, { pitch: this.rand(0.8, 1.2), ring: 0.8 }, level(0.5 * weight));
        this.whoosh(at + 0.02, { duration: this.rand(0.2, 0.3) }, level(0.2 * weight));
        if (this.chance(0.6)) {
          this.shout(at + 0.03, { pitch: this.rand(1.2, 1.7), duration: this.rand(0.12, 0.2), rise: 1.3 }, level(0.2));
        }
        break;
      case 'fall':
        this.thump(at, level(0.5 * weight));
        if (this.chance(0.5)) this.shout(at - 0.04, { pitch: this.rand(0.8, 1), vowel: 'o', duration: 0.14, rise: 1 }, level(0.15));
        break;
      case 'land':
        this.thump(at, level(0.6 * weight));
        break;
      case 'flee':
        this.shout(at, { pitch: this.rand(1.6, 1.9), vowel: 'e', duration: 0.22, rise: 1.4 }, level(0.16));
        this.stampede(at + 0.06, { duration: 0.28, rate: 16 }, level(0.22));
        break;
      case 'cheer':
        this.crowd(at, { duration: 0.5, attack: 0.03, release: 0.3, voices: 5, bright: 1.3, lift: 1.2 }, level(0.34 * weight));
        break;
      case 'stomp':
        this.boom(at, { duration: 0.36 }, level(0.5 * weight));
        this.thump(at, level(0.5 * weight));
        break;
      case 'windup':
        this.shout(at, { pitch: 0.5, vowel: 'o', duration: Math.min(0.5, seconds * 0.16), rise: 1.12 }, level(0.3));
        this.whoosh(at + 0.05, { duration: Math.min(0.5, seconds * 0.15), from: 200, peak: 900, to: 700 }, level(0.2));
        break;
      case 'tink':
        // The whole joke: one small, clean, very long note.
        this.steel(at, { pitch: 1.75, ring: 2.6 }, { ...mix, gain: 0.8, reverb: 0.5 });
        break;
      case 'creak': {
        const fall = Math.max(0.15, charge - cue.at * seconds);
        this.creak(at, fall, level(0.8));
        break;
      }
      case 'crash':
        this.boom(at, { duration: 0.8 }, level(1));
        for (let i = 0; i < 3; i++) this.thud(at + i * this.rand(0.02, 0.05), { pitch: this.rand(0.7, 1) }, level(0.6));
        for (let i = 0; i < 4; i++) {
          this.steel(at + this.rand(0.01, 0.24), { pitch: this.rand(0.55, 0.9), ring: 0.9 }, level(this.rand(0.3, 0.5)));
        }
        break;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Building blocks                                                        */
  /* ---------------------------------------------------------------------- */

  filter(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const node = this.ctx.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = q;
    return node;
  }

  /** A burst of filtered noise with a fast rise and an exponential tail. */
  burst(
    when: number,
    color: NoiseColor,
    shape: { duration: number; attack: number },
    filters: readonly AudioNode[],
    mix: VoiceMix,
    level: number,
  ): void {
    const out = this.port(mix, level, 0.12);
    const env = this.ctx.createGain();
    this.strike(env.gain, when, 1, shape.attack, Math.max(0.005, shape.duration - shape.attack));
    const source = this.noiseSource(color);
    let tail: AudioNode = source;
    for (const node of filters) {
      tail.connect(node);
      tail = node;
    }
    tail.connect(env);
    env.connect(out);
    this.run(source, when, shape.duration + 0.02, mix, true);
  }

  /** A pitched body: one oscillator that glides and decays. */
  private tone(
    when: number,
    shape: {
      type: OscillatorType;
      from: number;
      to: number;
      duration: number;
      glide?: number;
      attack?: number;
      /** Overdrive the oscillator so a low note carries harmonics. */
      drive?: boolean;
    },
    mix: VoiceMix,
    level: number,
  ): void {
    const out = this.port(mix, level, 0.12);
    const osc = this.ctx.createOscillator();
    osc.type = shape.type;
    osc.frequency.setValueAtTime(shape.from, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, shape.to), when + (shape.glide ?? shape.duration));
    const env = this.ctx.createGain();
    const attack = shape.attack ?? 0.002;
    this.strike(env.gain, when, 1, attack, Math.max(0.005, shape.duration - attack));
    if (shape.drive) {
      const shaper = this.ctx.createWaveShaper();
      shaper.curve = this.driveCurve;
      osc.connect(shaper);
      shaper.connect(env);
    } else {
      osc.connect(env);
    }
    env.connect(out);
    this.run(osc, when, shape.duration + 0.02, mix);
  }

  /** Paper on paper: noise through a band that slides upward as the card speeds up. */
  private slide(
    when: number,
    shape: { duration: number; from: number; to: number; q?: number },
    mix: VoiceMix,
    level: number,
  ): void {
    const band = this.filter('bandpass', shape.from, shape.q ?? 0.9);
    band.frequency.setValueAtTime(shape.from, when);
    band.frequency.exponentialRampToValueAtTime(shape.to, when + shape.duration);
    this.burst(
      when,
      'pink',
      { duration: shape.duration, attack: shape.duration * 0.35 },
      [this.filter('highpass', 700), band],
      mix,
      level * 3,
    );
  }

  /** Three parallel resonances that turn a buzz or a hiss into a vowel. */
  private formants(vowel: Vowel, q: number, gain: number, out: AudioNode, bright = 1): GainNode {
    const input = this.ctx.createGain();
    for (const formant of FORMANTS[vowel]) {
      const band = this.filter('bandpass', formant.freq * bright, q);
      const level = this.ctx.createGain();
      level.gain.value = formant.level * gain;
      input.connect(band);
      band.connect(level);
      level.connect(out);
    }
    return input;
  }

  private strike(param: AudioParam, when: number, peak: number, attack: number, decay: number): void {
    param.setValueAtTime(SILENT, when);
    param.linearRampToValueAtTime(peak, when + attack);
    param.exponentialRampToValueAtTime(SILENT, when + attack + decay);
  }

  /** The output stage of one voice: level, pan, bus and reverb send. */
  private port(mix: VoiceMix, level: number, reverb: number): GainNode {
    const input = this.ctx.createGain();
    input.gain.value = level * (mix.gain ?? 1);
    let tail: AudioNode = input;
    if (mix.pan && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = clamp(mix.pan, -1, 1);
      input.connect(panner);
      tail = panner;
    }
    const bus = mix.bus ?? 'sfx';
    tail.connect(mix.group?.input ?? this.buses[bus]);
    const send = mix.reverb ?? reverb;
    if (send > 0) {
      const wet = this.ctx.createGain();
      wet.gain.value = send;
      tail.connect(wet);
      wet.connect(mix.group?.wet ?? this.reverbs[bus]);
    }
    return input;
  }

  private run(
    source: AudioScheduledSourceNode,
    when: number,
    duration: number,
    mix: VoiceMix,
    noise = false,
  ): void {
    const start = Math.max(when, this.ctx.currentTime);
    if (noise) {
      const buffer = (source as AudioBufferSourceNode).buffer;
      (source as AudioBufferSourceNode).start(start, this.random() * ((buffer?.duration ?? 1) - 0.1));
    } else {
      source.start(start);
    }
    source.stop(start + duration);
    mix.group?.track(source);
  }

  private room(impulse: AudioBuffer, bus: AudioBus): AudioNode {
    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    const level = this.ctx.createGain();
    level.gain.value = 0.7;
    convolver.connect(level);
    level.connect(this.buses[bus]);
    return convolver;
  }

  /** A short dark hall: decaying noise that loses its top end as it fades. */
  private roomImpulse(): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * 1.4);
    const predelay = Math.floor(rate * 0.012);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let held = 0;
      for (let i = predelay; i < length; i++) {
        const t = (i - predelay) / (length - predelay);
        const smoothing = 0.55 - 0.45 * t;
        held += (this.random() * 2 - 1 - held) * smoothing;
        data[i] = held * Math.pow(1 - t, 2.4);
      }
    }
    return buffer;
  }

  private noiseBuffer(color: NoiseColor): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * 2);
    const buffer = this.ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    if (color === 'white') {
      for (let i = 0; i < length; i++) data[i] = this.random() * 2 - 1;
    } else if (color === 'pink') {
      // Paul Kellet's economy pink filter.
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = this.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
      }
    } else {
      let last = 0;
      for (let i = 0; i < length; i++) {
        last = (last + 0.02 * (this.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.5;
      }
    }
    return buffer;
  }
}

/** Renders voices through an offline context, for tests and for tuning in development. */
export async function renderTableAudio(
  seconds: number,
  build: (engine: TableAudioEngine, when: number) => void,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
  build(new TableAudioEngine(ctx), 0.02);
  return ctx.startRendering();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
