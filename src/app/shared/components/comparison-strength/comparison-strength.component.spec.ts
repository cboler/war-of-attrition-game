import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparisonStrengthComponent } from './comparison-strength.component';

describe('ComparisonStrengthComponent', () => {
  let fixture: ComponentFixture<ComparisonStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComparisonStrengthComponent] }).compileComponents();
    fixture = TestBed.createComponent(ComparisonStrengthComponent);
  });

  it('presents a resolved losing value as zero with an accessible outcome', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'loser',
      base: 10,
      current: 0,
      damage: -12,
      state: 'defeated',
      specialOverride: false,
    });
    fixture.detectChanges();

    const presentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(presentation.classList).toContain('is-defeated');
    expect(presentation.getAttribute('aria-label')).toContain('Comparison power 10; defeated at zero');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-12');
  });

  it('labels the categorical 2-defeats-Ace override without changing the base value', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'ace',
      base: 14,
      current: 0,
      damage: -14,
      state: 'defeated',
      specialOverride: true,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.strength-base').textContent.trim()).toBe('/ 14');
    expect(fixture.nativeElement.querySelector('.special-rule').textContent.trim()).toBe('2 defeats Ace');
    expect(fixture.nativeElement.querySelector('[role="status"]').getAttribute('aria-label')).toContain(
      'special rule: 2 defeats Ace',
    );
  });
});
