import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';
import { SettingsService } from './settings.service';

describe('SoundService', () => {
  let service: SoundService;
  let settingsService: SettingsService;

  const cues = (): void => {
    service.playCardDraw();
    service.playCardFlip();
    service.playCardLand();
    service.playBoneyard();
    service.playClash();
    service.playBattleCall(2);
    service.playPositiveResolution();
    service.playNegativeResolution();
    service.playBattleVictory();
    service.playBattleDefeat();
    service.playVictory();
    service.playDefeat();
  };
  const ambienceRunning = (): boolean =>
    !!(service as unknown as { ambience: { running: boolean } | null }).ambience?.running;
  const tap = (): void => {
    window.dispatchEvent(new Event('pointerdown'));
    TestBed.tick();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [SoundService, SettingsService]
    });
    service = TestBed.inject(SoundService);
    settingsService = TestBed.inject(SettingsService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play sound effects without error when sound is enabled', async () => {
    settingsService.setSoundEnabled(true);
    await service.whenReady();
    const getAudioContext = spyOn<any>(service, 'getAudioContext').and.callThrough();

    expect(cues).not.toThrow();
    expect(getAudioContext).toHaveBeenCalled();
  });

  it('skips cues rather than queueing them while the synthesis code is still loading', () => {
    settingsService.setSoundEnabled(true);
    const getAudioContext = spyOn<any>(service, 'getAudioContext').and.callThrough();

    expect(cues).not.toThrow();
    expect(getAudioContext).not.toHaveBeenCalled();
  });

  it('should silently skip audio when sound is disabled', () => {
    settingsService.setSoundEnabled(false);
    const getAudioContext = spyOn<any>(service, 'getAudioContext').and.callThrough();

    expect(cues).not.toThrow();
    expect(getAudioContext).not.toHaveBeenCalled();
  });

  it('plays a skirmish from its cues and hands back a way to silence it', async () => {
    settingsService.setSoundEnabled(true);
    await service.whenReady();
    const createGroup = spyOn(
      (service as unknown as { runtime: { TableAudioEngine: { prototype: { createGroup(): unknown } } } }).runtime
        .TableAudioEngine.prototype,
      'createGroup',
    ).and.callThrough();
    const silence = service.playSkirmish(
      [
        { at: 0, kind: 'charge', x: -5, weight: 0.7 },
        { at: 0.36, kind: 'clash', x: 0, weight: 1 },
        { at: 0.5, kind: 'launch', x: 1, weight: 1 },
        { at: 0.82, kind: 'cheer', x: -1, weight: 1 },
      ],
      1400,
    );

    expect(createGroup).toHaveBeenCalledTimes(1);
    expect(silence).toEqual(jasmine.any(Function));
    expect(() => {
      silence();
      silence();
    }).not.toThrow();
  });

  it('does not touch audio for a skirmish when sound is disabled', () => {
    settingsService.setSoundEnabled(false);
    const getAudioContext = spyOn<any>(service, 'getAudioContext').and.callThrough();

    expect(() => service.playSkirmish([{ at: 0.36, kind: 'clash', x: 0, weight: 1 }], 1400)()).not.toThrow();
    expect(getAudioContext).not.toHaveBeenCalled();
  });

  it('settles rejected context transitions instead of leaking unhandled rejections', async () => {
    // A resume still pending when the context closes rejects; so can suspend() and close().
    class RejectingAudioContext {
      state = 'suspended';
      resume = () => Promise.reject(new DOMException('closed before resume', 'InvalidStateError'));
      suspend = () => Promise.reject(new DOMException('closed', 'InvalidStateError'));
      close = () => Promise.reject(new DOMException('already closed', 'InvalidStateError'));
    }
    const original = window.AudioContext;
    (window as { AudioContext: unknown }).AudioContext = RejectingAudioContext;
    const leaked: unknown[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => {
      leaked.push(event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    try {
      settingsService.setSoundEnabled(true);
      TestBed.tick();
      service.enterTable();
      tap(); // creates the context and resumes it
      document.dispatchEvent(new Event('visibilitychange')); // resumes again
      settingsService.setSoundEnabled(false);
      TestBed.tick(); // suspends
      TestBed.resetTestingModule(); // tears the service down and closes the context
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(leaked).toEqual([]);
    } finally {
      window.removeEventListener('unhandledrejection', onUnhandled);
      (window as { AudioContext: unknown }).AudioContext = original;
    }
  });

  describe('ambience', () => {
    it('waits for a tap or key press before starting at the table', async () => {
      service.enterTable();
      await service.whenReady();
      TestBed.tick();
      expect(ambienceRunning()).toBeFalse();

      tap();
      expect(ambienceRunning()).toBeTrue();
    });

    it('stays silent away from the table', async () => {
      await service.whenReady();
      tap();
      expect(ambienceRunning()).toBeFalse();

      service.enterTable();
      expect(ambienceRunning()).toBeTrue();
      service.leaveTable();
      expect(ambienceRunning()).toBeFalse();
    });

    it('starts once the synthesis code arrives if the player tapped first', async () => {
      service.enterTable();
      tap();
      expect(ambienceRunning()).toBeFalse();

      await service.whenReady();
      expect(ambienceRunning()).toBeTrue();
    });

    it('follows the sound toggle and the ambience volume', async () => {
      service.enterTable();
      await service.whenReady();
      tap();
      expect(ambienceRunning()).toBeTrue();

      settingsService.setAmbienceVolume(0);
      TestBed.tick();
      expect(ambienceRunning()).toBeFalse();

      settingsService.setAmbienceVolume(40);
      TestBed.tick();
      expect(ambienceRunning()).toBeTrue();

      settingsService.setSoundEnabled(false);
      TestBed.tick();
      expect(ambienceRunning()).toBeFalse();
    });

    it('raises the tension of the bed with each Battle layer', async () => {
      service.enterTable();
      await service.whenReady();
      tap();
      const ambience = (service as unknown as { ambience: { setTension: (t: number, d: number) => void } })
        .ambience;
      const setTension = spyOn(ambience, 'setTension').and.callThrough();

      service.setBattleDepth(1);
      service.setBattleDepth(3);
      service.setBattleDepth(0);

      const tensions = setTension.calls.allArgs().map(([tension]) => tension);
      expect(tensions[0]).toBeGreaterThan(0);
      expect(tensions[1]).toBeGreaterThan(tensions[0]);
      expect(tensions[2]).toBe(0);
      expect(setTension.calls.allArgs().map(([, depth]) => depth)).toEqual([1, 3, 0]);
    });
  });
});
