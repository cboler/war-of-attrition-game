import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardComponent } from './game-board.component';
import { SettingsService } from '../../../core/services/settings.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent, NoopAnimationsModule],
      providers: [SettingsService]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GameBoardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit playerDeckClicked when player deck is clicked', () => {
    spyOn(component.playerDeckClicked, 'emit');
    fixture.componentRef.setInput('canPlayerAct', true);
    fixture.detectChanges();

    component.onPlayerDeckClick();
    expect(component.playerDeckClicked.emit).toHaveBeenCalled();
  });

  it('should not emit playerDeckClicked when player cannot act', () => {
    spyOn(component.playerDeckClicked, 'emit');
    fixture.componentRef.setInput('canPlayerAct', false);
    fixture.detectChanges();

    component.onPlayerDeckClick();
    expect(component.playerDeckClicked.emit).not.toHaveBeenCalled();
  });
});
