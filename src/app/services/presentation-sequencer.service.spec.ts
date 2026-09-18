import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { SettingsService } from '../core/services/settings.service';
import { PresentationSequenceCancelled, PresentationSequencerService } from './presentation-sequencer.service';

describe('PresentationSequencerService', () => {
  let service: PresentationSequencerService;
  let settings: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentationSequencerService);
    settings = TestBed.inject(SettingsService);
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
  });

  afterEach(() => settings.resetSettings());

  it('allows a timed beat to be advanced without treating it as game input', fakeAsync(() => {
    const version = service.begin();
    let completed = false;
    void service.pause(1000, version).then(() => completed = true);
    expect(service.waiting()).toBeTrue();

    expect(service.advance()).toBeTrue();
    tick(16);
    flushMicrotasks();
    expect(completed).toBeTrue();
    expect(service.waiting()).toBeFalse();
  }));

  it('fast-forwards subsequent beats in the active sequence until the sequence ends', fakeAsync(() => {
    const version = service.begin();
    let firstCompleted = false;
    void service.pause(1000, version).then(() => firstCompleted = true);
    expect(service.waiting()).toBeTrue();

    expect(service.advance()).toBeTrue();
    expect(service.fastForwarding()).toBeTrue();
    tick(16);
    flushMicrotasks();
    expect(firstCompleted).toBeTrue();

    // Subsequent pauses in the same sequence version resolve immediately without waiting.
    let secondCompleted = false;
    void service.pause(1000, version).then(() => secondCompleted = true);
    flushMicrotasks();
    expect(secondCompleted).toBeTrue();
    expect(service.waiting()).toBeFalse();

    // Ending the sequence resets fastForwarding.
    service.end(version);
    expect(service.fastForwarding()).toBeFalse();

    // Next sequence starts timed again.
    const nextVersion = service.begin();
    let nextCompleted = false;
    void service.pause(1000, nextVersion).then(() => nextCompleted = true);
    expect(nextCompleted).toBeFalse();
    expect(service.waiting()).toBeTrue();

    tick(1149);
    expect(nextCompleted).toBeFalse();
    tick(1);
    expect(nextCompleted).toBeTrue();
  }));

  it('ignores an extra advance when no visual beat is waiting', fakeAsync(() => {
    const version = service.begin();
    let completed = false;
    void service.pause(1000, version).then(() => completed = true);

    expect(service.advance()).toBeTrue();
    expect(service.advance()).toBeFalse();
    tick(16);
    flushMicrotasks();

    expect(completed).toBeTrue();
  }));

  it('collapses waits when animation playback is disabled', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const version = service.begin();
    let completed = false;
    void service.pause(1000, version).then(() => completed = true);
    flushMicrotasks();
    expect(completed).toBeTrue();
    tick(1000);
  }));

  it('can retain a skippable static result long enough to read when motion is disabled', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const version = service.begin();
    let completed = false;
    void service.pause(1000, version, 600).then(() => completed = true);

    expect(service.waiting()).toBeTrue();
    tick(599);
    expect(completed).toBeFalse();
    tick(1);
    expect(completed).toBeTrue();
  }));

  it('applies the skirmish minimum only when Fast scaling would make it unreadable', fakeAsync(() => {
    const cases = [
      { speed: 'fast' as const, expected: 720 },
      { speed: 'normal' as const, expected: 920 },
      { speed: 'slow' as const, expected: 1200 },
    ];

    for (const testCase of cases) {
      settings.setAnimationSpeed(testCase.speed);
      const version = service.begin();
      let completed = false;
      void service.pause(800, version, 280, 720).then(() => completed = true);

      tick(testCase.expected - 1);
      expect(completed).withContext(testCase.speed).toBeFalse();
      tick(1);
      flushMicrotasks();
      expect(completed).withContext(testCase.speed).toBeTrue();
    }
  }));

  it('cancels an obsolete wait instead of allowing its callback to continue', fakeAsync(() => {
    const version = service.begin();
    let cancelled = false;
    void service.pause(1000, version).catch(error => cancelled = error instanceof PresentationSequenceCancelled);

    service.cancel();
    flushMicrotasks();

    expect(cancelled).toBeTrue();
    expect(service.waiting()).toBeFalse();
  }));
});
