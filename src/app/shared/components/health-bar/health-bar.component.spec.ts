import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthBarComponent } from './health-bar.component';

describe('HealthBarComponent', () => {
  let component: HealthBarComponent;
  let fixture: ComponentFixture<HealthBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate correct health percentage', () => {
    fixture.componentRef.setInput('current', 13);
    fixture.componentRef.setInput('maximum', 26);
    fixture.detectChanges();

    expect(component['healthPercentage']()).toBe(50);
  });

  it('should handle zero maximum correctly', () => {
    fixture.componentRef.setInput('current', 10);
    fixture.componentRef.setInput('maximum', 0);
    fixture.detectChanges();

    expect(component['healthPercentage']()).toBe(0);
  });

  it('should calculate correct danger percentage', () => {
    fixture.componentRef.setInput('inDanger', 5);
    fixture.componentRef.setInput('maximum', 20);
    fixture.detectChanges();

    expect(component['dangerPercentage']()).toBe(25);
  });

  it('should cap danger percentage at 100%', () => {
    fixture.componentRef.setInput('inDanger', 30);
    fixture.componentRef.setInput('maximum', 20);
    fixture.detectChanges();

    expect(component['dangerPercentage']()).toBe(100);
  });

  describe('health color calculation', () => {
    it('should return green for health >= 75%', () => {
      fixture.componentRef.setInput('current', 20);
      fixture.componentRef.setInput('maximum', 26);
      fixture.detectChanges();

      expect(component['healthColor']()).toBe('green');
    });

    it('should return yellow for health >= 50% and < 75%', () => {
      fixture.componentRef.setInput('current', 15);
      fixture.componentRef.setInput('maximum', 26);
      fixture.detectChanges();

      expect(component['healthColor']()).toBe('yellow');
    });

    it('should return orange for health >= 25% and < 50%', () => {
      fixture.componentRef.setInput('current', 8);
      fixture.componentRef.setInput('maximum', 26);
      fixture.detectChanges();

      expect(component['healthColor']()).toBe('orange');
    });

    it('should return red for health < 25%', () => {
      fixture.componentRef.setInput('current', 5);
      fixture.componentRef.setInput('maximum', 26);
      fixture.detectChanges();

      expect(component['healthColor']()).toBe('red');
    });
  });

  it('should display correct label and count', () => {
    fixture.componentRef.setInput('label', 'Opponent');
    fixture.componentRef.setInput('current', 15);
    fixture.componentRef.setInput('maximum', 26);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.health-bar-label span').textContent).toBe('Opponent');
    expect(compiled.querySelector('.card-count').textContent).toBe('15/26');
  });

  it('should apply correct CSS classes based on health color', () => {
    fixture.componentRef.setInput('current', 20);
    fixture.componentRef.setInput('maximum', 26);
    fixture.detectChanges();

    const healthFill = fixture.nativeElement.querySelector('.health-bar-fill');
    expect(healthFill.classList.contains('green')).toBe(true);
  });

  it('should show damage animation when triggered', () => {
    fixture.componentRef.setInput('showDamageAnimation', true);
    fixture.detectChanges();

    const healthFill = fixture.nativeElement.querySelector('.health-bar-fill');
    expect(healthFill.classList.contains('damage-animation')).toBe(true);
  });

  it('should show danger indicator when cards are in danger', () => {
    fixture.componentRef.setInput('inDanger', 3);
    fixture.componentRef.setInput('maximum', 26);
    fixture.detectChanges();

    const dangerElement = fixture.nativeElement.querySelector('.health-bar-danger');
    expect(dangerElement).toBeTruthy();
  });

  it('should not show danger indicator when no cards are in danger', () => {
    fixture.componentRef.setInput('inDanger', 0);
    fixture.detectChanges();

    const dangerElement = fixture.nativeElement.querySelector('.health-bar-danger');
    expect(dangerElement).toBeNull();
  });
});