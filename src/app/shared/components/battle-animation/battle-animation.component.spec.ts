import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckColor, PlayerType } from '../../../core/models/game-state.model';
import { BattleAnimationScene } from '../../../services/battle-animation.service';
import { BattleAnimationComponent } from './battle-animation.component';

describe('BattleAnimationComponent', () => {
  let fixture: ComponentFixture<BattleAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleAnimationComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BattleAnimationComponent);
  });

  function render(scene: BattleAnimationScene): HTMLElement {
    fixture.componentRef.setInput('scene', scene);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function motionTransforms(element: Element): readonly string[] {
    const effect = element.getAnimations()[0]?.effect as KeyframeEffect | null;
    return effect?.getKeyframes().map((frame) => frame['transform']?.toString() ?? '') ?? [];
  }

  it('renders a red player victory as a forward press against a steel retreat', () => {
    const element = render({
      id: 1,
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      playerColor: DeckColor.RED,
      opponentColor: DeckColor.BLACK,
      motion: 'full',
    });

    const playerArmy = element.querySelector('.player-army')!;
    const opponentArmy = element.querySelector('.opponent-army')!;

    expect(element.querySelectorAll('.player-army .soldier').length).toBe(5);
    expect(element.querySelectorAll('.opponent-army .soldier').length).toBe(5);
    expect(playerArmy.classList).toContain('red-army');
    expect(playerArmy.classList).toContain('winner');
    expect(opponentArmy.classList).toContain('steel-army');
    expect(opponentArmy.classList).toContain('loser');
    expect(element.querySelector('.opponent-army .formation-facing')).not.toBeNull();
    expect(getComputedStyle(playerArmy).zIndex).toBe('2');
    expect(getComputedStyle(opponentArmy).zIndex).toBe('1');
    expect(motionTransforms(playerArmy)).toContain('translate(30%, -50%)');
    expect(motionTransforms(opponentArmy)).toContain(
      'translate(58%, -45%) rotate(7deg)',
    );
  });

  it('renders a steel opponent victory as a forward press against a red retreat', () => {
    const element = render({
      id: 2,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      playerColor: DeckColor.RED,
      opponentColor: DeckColor.BLACK,
      motion: 'full',
    });

    const playerArmy = element.querySelector('.player-army')!;
    const opponentArmy = element.querySelector('.opponent-army')!;

    expect(playerArmy.classList).toContain('red-army');
    expect(playerArmy.classList).toContain('loser');
    expect(opponentArmy.classList).toContain('steel-army');
    expect(opponentArmy.classList).toContain('winner');
    expect(element.querySelector('.player-army .formation-facing')).not.toBeNull();
    expect(element.querySelector('.opponent-army .formation-facing')).not.toBeNull();
    expect(getComputedStyle(playerArmy).zIndex).toBe('1');
    expect(getComputedStyle(opponentArmy).zIndex).toBe('2');
    expect(motionTransforms(playerArmy)).toContain(
      'translate(-58%, -45%) rotate(-7deg)',
    );
    expect(motionTransforms(opponentArmy)).toContain('translate(-30%, -50%)');
  });

  it('keeps formation colors attached to the randomized deck assignment', () => {
    const element = render({
      id: 3,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      playerColor: DeckColor.BLACK,
      opponentColor: DeckColor.RED,
      motion: 'full',
    });

    expect(element.querySelector('.player-army')?.classList).toContain('steel-army');
    expect(element.querySelector('.player-army')?.classList).toContain('loser');
    expect(element.querySelector('.opponent-army')?.classList).toContain('red-army');
    expect(element.querySelector('.opponent-army')?.classList).toContain('winner');
  });

  it('renders the reduced-motion static result class', () => {
    const element = render({
      id: 4,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      playerColor: DeckColor.RED,
      opponentColor: DeckColor.BLACK,
      motion: 'reduced',
    });

    expect(element.querySelector('.battle-animation')?.classList.contains('reduced-motion'))
      .toBeTrue();
    expect(element.querySelector('.player-army')?.classList.contains('loser')).toBeTrue();
    expect(element.querySelector('.opponent-army')?.classList.contains('winner')).toBeTrue();
  });
});
