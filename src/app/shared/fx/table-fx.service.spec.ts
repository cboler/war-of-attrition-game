import { TestBed } from '@angular/core/testing';
import { SettingsService } from '../../core/services/settings.service';
import { TableFxService } from './table-fx.service';

describe('TableFxService', () => {
  let service: TableFxService;
  let settings: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableFxService);
    settings = TestBed.inject(SettingsService);
  });

  it('stays out of automated runs so tests and store screenshots remain deterministic', () => {
    expect(service.isSupported()).toBeFalse();
  });

  it('falls back to the CSS table without loading the engine when unsupported', async () => {
    const canvas = document.createElement('canvas');

    await expectAsync(service.attachBackdrop(canvas)).toBeResolvedTo(null);
    await expectAsync(service.attachOverlay(canvas)).toBeResolvedTo(null);
    expect(service.backdropLive()).toBeFalse();
    expect(service.overlayLive()).toBeFalse();
    expect(() => service.detachBackdrop()).not.toThrow();
    expect(() => service.detachOverlay()).not.toThrow();
  });

  it('holds a still table whenever animations are switched off', () => {
    settings.setAutoPlayAnimations(false);
    expect(service.motion()).toBe('static');

    settings.setAutoPlayAnimations(true);
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    expect(service.motion()).toBe(reduced ? 'static' : 'full');
  });
});
