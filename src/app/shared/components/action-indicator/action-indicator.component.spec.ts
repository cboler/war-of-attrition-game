import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionIndicatorComponent } from './action-indicator.component';

describe('ActionIndicatorComponent', () => {
  let component: ActionIndicatorComponent;
  let fixture: ComponentFixture<ActionIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionIndicatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply visible class when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('.action-indicator');
    expect(indicator.classList.contains('visible')).toBe(true);
  });

  it('should not apply visible class when visible is false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('.action-indicator');
    expect(indicator.classList.contains('visible')).toBe(false);
  });

  describe('click type', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'click');
      fixture.detectChanges();
    });

    it('should apply correct CSS class for click type', () => {
      const indicator = fixture.nativeElement.querySelector('.action-indicator');
      expect(indicator.classList.contains('type-click')).toBe(true);
    });

    it('should display click icon and default message', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.click-icon').textContent).toBe('👆');
      expect(compiled.querySelector('.action-text').textContent).toBe('Click to continue');
    });

    it('should display custom message when provided', () => {
      fixture.componentRef.setInput('message', 'Click your deck');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.action-text').textContent).toBe('Click your deck');
    });
  });

  describe('select type', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'select');
      fixture.detectChanges();
    });

    it('should apply correct CSS class for select type', () => {
      const indicator = fixture.nativeElement.querySelector('.action-indicator');
      expect(indicator.classList.contains('type-select')).toBe(true);
    });

    it('should display select icon and default message', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.select-icon').textContent).toBe('👈');
      expect(compiled.querySelector('.action-text').textContent).toBe('Select a card');
    });

    it('should display custom message when provided', () => {
      fixture.componentRef.setInput('message', 'Choose from opponent cards');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.action-text').textContent).toBe('Choose from opponent cards');
    });
  });

  describe('challenge type', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'challenge');
      fixture.detectChanges();
    });

    it('should apply correct CSS class for challenge type', () => {
      const indicator = fixture.nativeElement.querySelector('.action-indicator');
      expect(indicator.classList.contains('type-challenge')).toBe(true);
    });

    it('should display challenge icon and default message', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.challenge-icon').textContent).toBe('⚔️');
      expect(compiled.querySelector('.action-text').textContent).toBe('Challenge available!');
    });

    it('should display custom message when provided', () => {
      fixture.componentRef.setInput('message', 'Challenge the opponent?');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.action-text').textContent).toBe('Challenge the opponent?');
    });
  });

  it('should have glow effect element', () => {
    const glowEffect = fixture.nativeElement.querySelector('.glow-effect');
    expect(glowEffect).toBeTruthy();
  });

  it('should only show one type at a time', () => {
    fixture.componentRef.setInput('type', 'click');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.click-icon')).toBeTruthy();
    expect(compiled.querySelector('.select-icon')).toBeNull();
    expect(compiled.querySelector('.challenge-icon')).toBeNull();
  });
});