import { TableFxEngine } from './table-fx-engine';

function webGlAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

describe('TableFxEngine', () => {
  let engine: TableFxEngine | null = null;
  let errors: string[];

  beforeEach(() => {
    errors = [];
    spyOn(console, 'error').and.callFake((...args: unknown[]) => errors.push(args.map(String).join(' ')));
  });

  afterEach(() => {
    engine?.dispose();
    engine = null;
  });

  it('compiles every table shader and plays each effect without GL errors', () => {
    if (!webGlAvailable()) {
      pending('WebGL is not available in this browser.');
      return;
    }
    engine = new TableFxEngine({ tier: 'low', motion: 'full' });
    const backdrop = document.createElement('canvas');
    const overlay = document.createElement('canvas');

    expect(engine.attachBackdrop(backdrop)).toBeTrue();
    expect(engine.attachOverlay(overlay)).toBeTrue();
    engine.resizeBackdrop(320, 480, 1);
    engine.resizeOverlay(320, 480, 1);

    const center = { x: 160, y: 240 };
    engine.setTension(1);
    engine.setOutcome('victory');
    engine.pulseBackdrop(center, 1);
    engine.sparks(center, { color: '#ff5f45', secondary: '#ffd38a', direction: { x: 0, y: -1 } });
    engine.ring(center, { color: '#ffd27a', radius: 120 });
    engine.flash(center, 90, '#fff0c2');
    engine.dust(center);
    engine.embers(center, { color: '#ff8a3d' });
    engine.trail(center, { x: 300, y: 60 }, { color: '#ff8a3d', duration: 0.4 });
    engine.confettiBurst(center, 20);
    engine.ashfall(320, 20);
    engine.starburst(center, '#c9a2ff');

    // Force a synchronous frame through both renderers so shader programs link now.
    engine.resizeBackdrop(320, 480, 1);
    (engine as unknown as { overlayTick: () => void }).overlayTick();

    expect(errors.filter((message) => message.includes('THREE'))).toEqual([]);
  });

  it('ignores effect requests while motion is static', () => {
    if (!webGlAvailable()) {
      pending('WebGL is not available in this browser.');
      return;
    }
    engine = new TableFxEngine({ tier: 'low', motion: 'static' });
    expect(engine.attachOverlay(document.createElement('canvas'))).toBeTrue();
    engine.resizeOverlay(200, 200, 1);
    const scheduled = jasmine.createSpy('scheduled');

    engine.after(0, scheduled);
    engine.sparks({ x: 100, y: 100 }, { color: '#ffffff' });

    expect(scheduled).not.toHaveBeenCalled();
    expect(errors).toEqual([]);
  });
});
