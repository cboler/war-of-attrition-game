import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RuleDemoComponent } from './rule-demo.component';
import { GameEventBusService } from '../../../services/game-event-bus.service';
import { GameStateService } from '../../../core/services/game-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { SoundService } from '../../../core/services/sound.service';

describe('RuleDemoComponent', () => {
  let fixture: ComponentFixture<RuleDemoComponent>;
  let component: RuleDemoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleDemoComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RuleDemoComponent);
    fixture.componentRef.setInput('rule', 'ranks');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('plays deterministic frames and can skip to the static result', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.demo-narration')?.textContent).toContain('truthful base value');

    (root.querySelector('.skip-control') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.frameIndex()).toBe(1);
    expect(root.querySelector('.special-rule')?.textContent).toContain('2 defeats Ace');
    expect(root.querySelector('.demo-narration')?.textContent).toContain('exception');
  });

  it('replays from the first frame after reaching the result', () => {
    component.skip();
    component.replay();
    fixture.detectChanges();
    expect(component.frameIndex()).toBe(0);
  });

  it('plays tutorial cues while sound effects are enabled', fakeAsync(() => {
    const sound = TestBed.inject(SoundService);
    const draw = spyOn(sound, 'playCardDraw');
    const positiveResolution = spyOn(sound, 'playPositiveResolution');

    component.replay();
    tick(950);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(positiveResolution).toHaveBeenCalledTimes(1);
  }));

  it('does not play tutorial cues while sound effects are disabled', fakeAsync(() => {
    const settings = TestBed.inject(SettingsService);
    const sound = TestBed.inject(SoundService);
    const draw = spyOn(sound, 'playCardDraw');
    const positiveResolution = spyOn(sound, 'playPositiveResolution');
    settings.setSoundEnabled(false);

    component.replay();
    tick(950);

    expect(draw).not.toHaveBeenCalled();
    expect(positiveResolution).not.toHaveBeenCalled();
  }));

  it('emits closed and never publishes a gameplay event', fakeAsync(() => {
    const eventBus = TestBed.inject(GameEventBusService);
    const emitSpy = spyOn(eventBus, 'emit');
    const closeSpy = spyOn(component.closed, 'emit');

    component.replay();
    tick(950);
    component.close();

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).not.toHaveBeenCalled();
  }));

  it('does not mutate the live decks, profile statistics, or progression', fakeAsync(() => {
    const gameState = TestBed.inject(GameStateService);
    const auth = TestBed.inject(AuthService);
    const before = {
      playerIds: gameState.currentPlayerDeck.toArray().map(card => card.id),
      opponentIds: gameState.currentOpponentDeck.toArray().map(card => card.id),
      statistics: JSON.stringify(auth.userStats()),
      progression: JSON.stringify(auth.activeProfile().progression)
    };

    component.replay();
    tick(950);
    component.skip();
    component.close();

    expect(gameState.currentPlayerDeck.toArray().map(card => card.id)).toEqual(before.playerIds);
    expect(gameState.currentOpponentDeck.toArray().map(card => card.id)).toEqual(before.opponentIds);
    expect(JSON.stringify(auth.userStats())).toBe(before.statistics);
    expect(JSON.stringify(auth.activeProfile().progression)).toBe(before.progression);
  }));
});
