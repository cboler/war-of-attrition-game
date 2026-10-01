import { TestBed } from '@angular/core/testing';
import { DeckColor, PlayerType } from '../core/models/game-state.model';
import { SettingsService } from '../core/services/settings.service';
import { BattleAnimationService, GIANT_KILLER_DURATION_SCALE } from './battle-animation.service';

describe('BattleAnimationService', () => {
  let service: BattleAnimationService;
  let settings: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
    settings.setAutoPlayAnimations(true);
    service = TestBed.inject(BattleAnimationService);
  });

  afterEach(() => localStorage.clear());

  it('orients the player and opponent from an authoritative winner', () => {
    const scene = service.request(PlayerType.PLAYER, DeckColor.RED);

    expect(scene).toEqual(
      jasmine.objectContaining({
        winner: PlayerType.PLAYER,
        loser: PlayerType.OPPONENT,
        playerColor: DeckColor.RED,
        opponentColor: DeckColor.BLACK,
        motion: 'full',
      }),
    );
    expect(service.scene()).toBe(scene);
  });

  it('does not create a scene when global animation playback is disabled', () => {
    settings.setAutoPlayAnimations(false);

    expect(service.request(PlayerType.OPPONENT, DeckColor.RED)).toBeNull();
    expect(service.scene()).toBeNull();
  });

  it('requests the static outcome variant for reduced-motion users', () => {
    spyOn(globalThis, 'matchMedia').and.callFake(
      (query: string) =>
        ({ matches: query === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    );

    expect(service.request(PlayerType.OPPONENT, DeckColor.RED)?.motion).toBe('reduced');
  });

  it('maps the randomized deck assignment onto the owner-based motion', () => {
    const scene = service.request(PlayerType.OPPONENT, DeckColor.BLACK);

    expect(scene).toEqual(
      jasmine.objectContaining({
        winner: PlayerType.OPPONENT,
        loser: PlayerType.PLAYER,
        playerColor: DeckColor.BLACK,
        opponentColor: DeckColor.RED,
      }),
    );
  });

  it('plans a standard skirmish whose length follows the animation speed', () => {
    const lengths = (['slow', 'normal', 'fast'] as const).map((speed) => {
      settings.setAnimationSpeed(speed);
      return service.request(PlayerType.PLAYER, DeckColor.RED)!.durationMs;
    });

    expect(lengths).toEqual([1830, 1400, 1050]);
  });

  it('carries the choreography for the authoritative winner', () => {
    const scene = service.request(PlayerType.OPPONENT, DeckColor.RED, { margin: 1, depth: 2 })!;

    expect(scene.variant).toBe('standard');
    expect(scene.plan.winner).toBe(PlayerType.OPPONENT);
    expect(scene.plan.loser).toBe(PlayerType.PLAYER);
    // A Battle fields nine soldiers a side.
    expect(scene.plan.units.length).toBe(18);
  });

  it('gives a Two felling an Ace its own longer scene', () => {
    const standard = service.request(PlayerType.PLAYER, DeckColor.RED)!;
    const scene = service.request(PlayerType.PLAYER, DeckColor.RED, { giantKiller: true })!;

    expect(scene.variant).toBe('giant-killer');
    expect(scene.plan.variant).toBe('giant-killer');
    expect(scene.durationMs).toBe(Math.round(standard.durationMs * GIANT_KILLER_DURATION_SCALE));
  });

  it('builds a fresh, different skirmish every time', () => {
    const first = service.request(PlayerType.PLAYER, DeckColor.RED, { margin: 0.6 })!;
    const second = service.request(PlayerType.PLAYER, DeckColor.RED, { margin: 0.6 })!;

    expect(second.plan.units).not.toEqual(first.plan.units);
  });

  it('clears only the scene that completed', () => {
    const first = service.request(PlayerType.PLAYER, DeckColor.RED)!;
    const second = service.request(PlayerType.OPPONENT, DeckColor.BLACK)!;

    service.clear(first.id);
    expect(service.scene()).toBe(second);

    service.clear(second.id);
    expect(service.scene()).toBeNull();
  });
});
