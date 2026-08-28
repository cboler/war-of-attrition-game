import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerType } from '../../../core/models/game-state.model';
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

  it('renders five symbolic soldiers per side and marks the losing army', () => {
    const element = render({
      id: 1,
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
      motion: 'full',
    });

    expect(element.querySelectorAll('.player-army .soldier').length).toBe(5);
    expect(element.querySelectorAll('.opponent-army .soldier').length).toBe(5);
    expect(element.querySelector('.player-army')?.classList.contains('winner')).toBeTrue();
    expect(element.querySelector('.opponent-army')?.classList.contains('loser')).toBeTrue();
    expect(element.querySelector('.opponent-army .formation-facing')).not.toBeNull();
  });

  it('marks steel as winner and red as loser for an opponent victory', () => {
    const element = render({
      id: 2,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      motion: 'full',
    });

    expect(element.querySelector('.player-army')?.classList.contains('loser')).toBeTrue();
    expect(element.querySelector('.opponent-army')?.classList.contains('winner')).toBeTrue();
    expect(element.querySelector('.player-army .formation-facing')).not.toBeNull();
    expect(element.querySelector('.opponent-army .formation-facing')).not.toBeNull();
  });

  it('renders the reduced-motion static result class', () => {
    const element = render({
      id: 3,
      winner: PlayerType.OPPONENT,
      loser: PlayerType.PLAYER,
      motion: 'reduced',
    });

    expect(element.querySelector('.battle-animation')?.classList.contains('reduced-motion'))
      .toBeTrue();
    expect(element.querySelector('.player-army')?.classList.contains('loser')).toBeTrue();
    expect(element.querySelector('.opponent-army')?.classList.contains('winner')).toBeTrue();
  });
});
