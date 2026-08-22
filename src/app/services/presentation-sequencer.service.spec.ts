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

  it('advances only the current beat and never collapses later gameplay presentation', fakeAsync(() => {
    const version = service.begin();
    void service.pause(1000, version);
    service.advance();
    tick(16);
    flushMicrotasks();

    let completed = false;
    void service.pause(1000, version).then(() => completed = true);
    expect(completed).toBeFalse();
    expect(service.waiting()).toBeTrue();

    tick(1149);
    expect(completed).toBeFalse();
    tick(1);
    expect(completed).toBeTrue();
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
