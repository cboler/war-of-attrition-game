import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparisonStrengthComponent } from './comparison-strength.component';
import { SettingsService } from '../../../core/services/settings.service';

describe('ComparisonStrengthComponent', () => {
  let fixture: ComponentFixture<ComparisonStrengthComponent>;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComparisonStrengthComponent] }).compileComponents();
    fixture = TestBed.createComponent(ComparisonStrengthComponent);
    settingsService = TestBed.inject(SettingsService);
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
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-12');
    expect(fixture.nativeElement.querySelector('.strength-base')).toBeNull();
  });

  it('labels the categorical 2-defeats-Ace override without changing the base value in accessibility', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'ace',
      base: 14,
      current: 0,
      damage: -14,
      state: 'defeated',
      specialOverride: true,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.special-rule').textContent.trim()).toBe('2 defeats Ace');
    expect(fixture.nativeElement.querySelector('[role="status"]').getAttribute('aria-label')).toContain(
      'special rule: 2 defeats Ace',
    );
    expect(fixture.nativeElement.querySelector('[role="status"]').getAttribute('aria-label')).toContain(
      'Comparison power 14; defeated at zero',
    );
  });

  it('presents a winning Ace with its non-zero remainder statically when animations are disabled', () => {
    settingsService.setAutoPlayAnimations(false);
    fixture.componentRef.setInput('view', {
      cardId: 'ace-winner',
      base: 14,
      current: 6,
      damage: -8,
      state: 'winner',
      specialOverride: false,
    });
    fixture.detectChanges();

    const presentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(presentation.classList).toContain('motion-disabled');
    expect(presentation.classList).toContain('is-winner');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('6');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-8');
    expect(presentation.getAttribute('aria-label')).toContain('Comparison power 14; winner with 6 remaining');
  });

  it('presents a winning 6 vs 2 with temporary remainder 4 and does not finish at zero', () => {
    settingsService.setAutoPlayAnimations(false);
    fixture.componentRef.setInput('view', {
      cardId: 'six-winner',
      base: 6,
      current: 4,
      damage: -2,
      state: 'winner',
      specialOverride: false,
    });
    fixture.detectChanges();

    const presentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(presentation.classList).toContain('is-winner');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('4');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-2');
    expect(presentation.getAttribute('aria-label')).toContain('Comparison power 6; winner with 4 remaining');
  });

  it('renders authoritative current value in DOM text for ready state without denominator', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'card-ready',
      base: 10,
      current: 10,
      damage: 0,
      state: 'ready',
      specialOverride: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('10');
    expect(fixture.nativeElement.querySelector('.strength-base')).toBeNull();
    expect(fixture.nativeElement.querySelector('.damage-number')).toBeNull();
  });
});
