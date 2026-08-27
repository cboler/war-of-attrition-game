import { TestBed } from '@angular/core/testing';
import { PlayerType } from '../core/models/game-state.model';
import { SettingsService } from '../core/services/settings.service';
import { BattleAnimationService } from './battle-animation.service';

describe('BattleAnimationService', () => {
  let service: BattleAnimationService;
  let settings: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
    settings.setAutoPlayAnimations(true);
    settings.setBattleAnimationsEnabled(true);
    service = TestBed.inject(BattleAnimationService);
  });

  afterEach(() => localStorage.clear());

  it('orients the player and opponent from an authoritative winner', () => {
    const scene = service.request(PlayerType.PLAYER);

    expect(scene).toEqual(
      jasmine.objectContaining({
        winner: PlayerType.PLAYER,
        loser: PlayerType.OPPONENT,
        motion: 'full',
      }),
    );
    expect(service.scene()).toBe(scene);
  });

  it('does not create a scene when Battle animations are disabled', () => {
    settings.setBattleAnimationsEnabled(false);

    expect(service.request(PlayerType.OPPONENT)).toBeNull();
    expect(service.scene()).toBeNull();
  });

  it('does not create a scene when global animation playback is disabled', () => {
    settings.setAutoPlayAnimations(false);

    expect(service.request(PlayerType.OPPONENT)).toBeNull();
    expect(service.scene()).toBeNull();
  });

  it('requests the static outcome variant for reduced-motion users', () => {
    spyOn(globalThis, 'matchMedia').and.callFake(
      (query: string) =>
        ({ matches: query === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    );

    expect(service.request(PlayerType.OPPONENT)?.motion).toBe('reduced');
  });

  it('clears only the scene that completed', () => {
    const first = service.request(PlayerType.PLAYER)!;
    const second = service.request(PlayerType.OPPONENT)!;

    service.clear(first.id);
    expect(service.scene()).toBe(second);

    service.clear(second.id);
    expect(service.scene()).toBeNull();
  });
});
