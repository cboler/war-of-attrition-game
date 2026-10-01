import { TableAmbience } from './table-ambience';
import { SoundCue, TableAudioEngine, renderTableAudio } from './table-audio-engine';

/** Loudest sample across both channels between two moments. */
function peak(buffer: AudioBuffer, from = 0, to = buffer.duration): number {
  const start = Math.floor(from * buffer.sampleRate);
  const end = Math.min(buffer.length, Math.floor(to * buffer.sampleRate));
  let loudest = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = start; i < end; i++) loudest = Math.max(loudest, Math.abs(data[i]));
  }
  return loudest;
}

function rms(buffer: AudioBuffer, from = 0, to = buffer.duration): number {
  const data = buffer.getChannelData(0);
  const start = Math.floor(from * buffer.sampleRate);
  const end = Math.min(buffer.length, Math.floor(to * buffer.sampleRate));
  let sum = 0;
  for (let i = start; i < end; i++) sum += data[i] * data[i];
  return Math.sqrt(sum / Math.max(1, end - start));
}

/** Zero crossings per second while the sound is audible: a cheap brightness measure. */
function brightness(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0);
  let crossings = 0;
  let audible = 0;
  for (let i = 1; i < data.length; i++) {
    if (Math.abs(data[i]) < 0.002) continue;
    audible++;
    if (data[i] >= 0 !== data[i - 1] >= 0) crossings++;
  }
  return (crossings / Math.max(1, audible)) * buffer.sampleRate;
}

function hasOnlyFiniteSamples(buffer: AudioBuffer): boolean {
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) if (!Number.isFinite(data[i])) return false;
  return true;
}

describe('TableAudioEngine', () => {
  const cues: Record<string, { seconds: number; play: (engine: TableAudioEngine, when: number) => void }> = {
    cardDraw: { seconds: 0.5, play: (engine, when) => engine.cardDraw(when) },
    cardFlip: { seconds: 0.5, play: (engine, when) => engine.cardFlip(when) },
    cardLand: { seconds: 0.5, play: (engine, when) => engine.cardLand(when) },
    boneyard: { seconds: 0.7, play: (engine, when) => engine.boneyard(when) },
    clash: { seconds: 1, play: (engine, when) => engine.clash(when) },
    battleCall: { seconds: 2.5, play: (engine, when) => engine.battleCall(when, 3) },
    resolvePositive: { seconds: 1, play: (engine, when) => engine.resolvePositive(when) },
    resolveNegative: { seconds: 1, play: (engine, when) => engine.resolveNegative(when) },
    battleVictory: { seconds: 1.6, play: (engine, when) => engine.battleVictory(when) },
    battleDefeat: { seconds: 1.6, play: (engine, when) => engine.battleDefeat(when) },
    victory: { seconds: 3, play: (engine, when) => engine.victory(when) },
    defeat: { seconds: 4, play: (engine, when) => engine.defeat(when) },
  };

  for (const [name, cue] of Object.entries(cues)) {
    it(`renders ${name} as audible, finite, unclipped sound`, async () => {
      const buffer = await renderTableAudio(cue.seconds, cue.play);

      expect(hasOnlyFiniteSamples(buffer)).toBeTrue();
      expect(peak(buffer)).toBeGreaterThan(0.02);
      expect(peak(buffer)).toBeLessThan(1);
    });
  }

  it('starts each cue at the moment it was asked for', async () => {
    const buffer = await renderTableAudio(0.8, (engine) => engine.cardLand(0.4));

    expect(peak(buffer, 0, 0.39)).toBeLessThan(0.001);
    expect(peak(buffer, 0.4, 0.5)).toBeGreaterThan(0.02);
  });

  it('voices steel far brighter than a shield or a drum', async () => {
    const steel = await renderTableAudio(0.8, (engine, when) => engine.steel(when));
    const thud = await renderTableAudio(0.8, (engine, when) => engine.thud(when));
    const drum = await renderTableAudio(1.2, (engine, when) => engine.drum(when));

    expect(brightness(steel)).toBeGreaterThan(brightness(thud) * 3);
    expect(brightness(steel)).toBeGreaterThan(brightness(drum) * 3);
  });

  it('never repeats a strike exactly', async () => {
    const first = await renderTableAudio(0.4, (engine, when) => engine.steel(when));
    const second = await renderTableAudio(0.4, (engine, when) => engine.steel(when));

    expect(Array.from(first.getChannelData(0).slice(2000, 2400))).not.toEqual(
      Array.from(second.getChannelData(0).slice(2000, 2400)),
    );
  });

  it('pans a voice toward its side of the field', async () => {
    const buffer = await renderTableAudio(0.5, (engine, when) => engine.thud(when, {}, { pan: 0.9, reverb: 0 }));
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    let leftEnergy = 0;
    let rightEnergy = 0;
    for (let i = 0; i < left.length; i++) {
      leftEnergy += left[i] * left[i];
      rightEnergy += right[i] * right[i];
    }

    expect(rightEnergy).toBeGreaterThan(leftEnergy * 4);
  });

  describe('skirmish', () => {
    const seconds = 1.4;
    const score: SoundCue[] = [
      { at: 0, kind: 'charge', x: -5, weight: 0.7 },
      { at: 0, kind: 'charge', x: 5, weight: 0.7 },
      { at: 0.36, kind: 'clash', x: 0, weight: 1 },
      { at: 0.42, kind: 'launch', x: 0.8, weight: 0.9 },
      { at: 0.5, kind: 'launch', x: 1.6, weight: 0.9 },
      { at: 0.7, kind: 'land', x: 5, weight: 0.7 },
      { at: 0.82, kind: 'cheer', x: -0.6, weight: 0.9 },
    ];

    it('builds through the charge and peaks at the clash', async () => {
      const buffer = await renderTableAudio(seconds + 1, (engine, when) =>
        engine.skirmish(score, when, seconds, engine.createGroup()),
      );
      const clashAt = 0.02 + 0.36 * seconds;

      expect(peak(buffer)).toBeLessThan(1);
      expect(rms(buffer, 0.05, 0.2)).toBeGreaterThan(0.001);
      expect(rms(buffer, clashAt, clashAt + 0.15)).toBeGreaterThan(rms(buffer, 0.05, 0.2) * 2);
      // The cheer arrives after the fighting has thinned out.
      expect(rms(buffer, 0.02 + 0.82 * seconds, 0.02 + 0.82 * seconds + 0.3)).toBeGreaterThan(0.005);
    });

    it('goes quiet when a skipped scene releases its voices', async () => {
      const sampleRate = 44100;
      const ctx = new OfflineAudioContext(2, sampleRate * 2, sampleRate);
      const engine = new TableAudioEngine(ctx);
      const group = engine.createGroup();
      engine.skirmish(score, 0.02, seconds, group);
      // Skip a quarter of a second in: the clash has not happened yet.
      void ctx.suspend(0.25).then(() => {
        group.release(0.02 + seconds);
        void ctx.resume();
      });
      const buffer = await ctx.startRendering();

      expect(peak(buffer, 0.05, 0.25)).toBeGreaterThan(0.005);
      // Only the room's tail of what had already sounded is left; an unskipped clash is 20x louder.
      expect(peak(buffer, 0.5, 2)).toBeLessThan(0.01);
    });

    it('lets the tails ring out when the scene has already run its length', async () => {
      const sampleRate = 44100;
      const ctx = new OfflineAudioContext(2, sampleRate * 2, sampleRate);
      const engine = new TableAudioEngine(ctx);
      const group = engine.createGroup();
      engine.skirmish(score, 0.02, seconds, group);
      void ctx.suspend(0.02 + seconds).then(() => {
        group.release(0.02 + seconds);
        void ctx.resume();
      });
      const buffer = await ctx.startRendering();

      expect(peak(buffer, 0.02 + seconds + 0.02, 0.02 + seconds + 0.2)).toBeGreaterThan(0.002);
    });

    it('gives the giant-killer scene one exposed strike before the crash', async () => {
      const giant: SoundCue[] = [
        { at: 0.09, kind: 'stomp', x: 6, weight: 0.7 },
        { at: 0.18, kind: 'stomp', x: 4, weight: 0.9 },
        { at: 0.27, kind: 'stomp', x: 2, weight: 1.1 },
        { at: 0.32, kind: 'windup', x: 2, weight: 1 },
        { at: 0.49, kind: 'tink', x: 1, weight: 1 },
        { at: 0.67, kind: 'creak', x: 2, weight: 1 },
        { at: 0.8, kind: 'crash', x: 3, weight: 1.6 },
      ];
      const length = 2.24;
      const buffer = await renderTableAudio(length + 1, (engine, when) =>
        engine.skirmish(giant, when, length, engine.createGroup()),
      );
      const at = (fraction: number) => 0.02 + fraction * length;

      expect(peak(buffer)).toBeLessThan(1);
      expect(peak(buffer, at(0.49), at(0.49) + 0.1)).toBeGreaterThan(0.02);
      expect(rms(buffer, at(0.8), at(0.8) + 0.3)).toBeGreaterThan(rms(buffer, at(0.49), at(0.49) + 0.3));
    });
  });

  describe('ambience', () => {
    const render = (tension: number, depth: number) =>
      renderTableAudio(6, (engine) => {
        const ambience = new TableAmbience(engine);
        ambience.setTension(tension, depth);
        ambience.start();
        ambience.preroll(6);
      });

    it('keeps a quiet bed at rest and grows louder with every Battle layer', async () => {
      const rest = await render(0, 0);
      const first = await render(0.38, 1);
      const third = await render(0.86, 3);

      expect(rms(rest, 2, 6)).toBeGreaterThan(0.0005);
      expect(peak(rest)).toBeLessThan(0.2);
      expect(rms(first, 2, 6)).toBeGreaterThan(rms(rest, 2, 6) * 1.5);
      expect(rms(third, 2, 6)).toBeGreaterThan(rms(first, 2, 6) * 1.5);
      expect(peak(third)).toBeLessThan(1);
    });

    it('fades in rather than switching on', async () => {
      const rest = await render(0.62, 2);

      expect(rms(rest, 0, 0.2)).toBeLessThan(rms(rest, 3, 3.5));
    });
  });
});
