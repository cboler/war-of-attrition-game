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

  it('renders authoritative current value in DOM text for ready state without denominator', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'card-ready-7',
      base: 7,
      current: 7,
      damage: 0,
      state: 'ready',
      specialOverride: false,
    });
    fixture.detectChanges();

    const presentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(presentation.classList).toContain('is-ready');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 7; ready at 7');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('7');
    expect(fixture.nativeElement.querySelector('.strength-base')).toBeNull();
    expect(fixture.nativeElement.querySelector('.damage-number')).toBeNull();
    expect(fixture.nativeElement.querySelector('.special-rule')).toBeNull();
  });

  it('presents normal mode 7 vs 2 winner remainder 5 and loser 0 directly in DOM text', () => {
    // Winner 7 vs 2
    fixture.componentRef.setInput('view', {
      cardId: 'winner-7',
      base: 7,
      current: 5,
      damage: -2,
      state: 'winner',
      specialOverride: false,
    });
    fixture.detectChanges();

    const winnerPresentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(winnerPresentation.classList).toContain('is-winner');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 7; winner with 5 remaining');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('5');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-2');

    // Loser 2 vs 7
    fixture.componentRef.setInput('view', {
      cardId: 'loser-2',
      base: 2,
      current: 0,
      damage: -7,
      state: 'defeated',
      specialOverride: false,
    });
    fixture.detectChanges();

    const loserPresentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(loserPresentation.classList).toContain('is-defeated');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 2; defeated at zero');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-7');
  });

  it('presents normal mode Ace vs 8 winner remainder 6 and loser 0 directly in DOM text', () => {
    // Winner Ace (base 14) vs 8
    fixture.componentRef.setInput('view', {
      cardId: 'ace-winner',
      base: 14,
      current: 6,
      damage: -8,
      state: 'winner',
      specialOverride: false,
    });
    fixture.detectChanges();

    const acePresentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(acePresentation.classList).toContain('is-winner');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 14; winner with 6 remaining');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('6');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-8');

    // Loser 8 vs Ace
    fixture.componentRef.setInput('view', {
      cardId: 'eight-loser',
      base: 8,
      current: 0,
      damage: -14,
      state: 'defeated',
      specialOverride: false,
    });
    fixture.detectChanges();

    const eightPresentation = fixture.nativeElement.querySelector('.comparison-strength');
    expect(eightPresentation.classList).toContain('is-defeated');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 8; defeated at zero');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-14');
  });

  it('presents normal mode King vs Queen winner remainder 1 and loser 0', () => {
    // King (13) vs Queen (12)
    fixture.componentRef.setInput('view', {
      cardId: 'king-winner',
      base: 13,
      current: 1,
      damage: -12,
      state: 'winner',
      specialOverride: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.comparison-strength').classList).toContain('is-winner');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('1');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-12');

    // Queen loser
    fixture.componentRef.setInput('view', {
      cardId: 'queen-loser',
      base: 12,
      current: 0,
      damage: -13,
      state: 'defeated',
      specialOverride: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.comparison-strength').classList).toContain('is-defeated');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-13');
  });

  it('presents 2 defeats Ace special override correctly with winner power 2 and losing Ace power 0', () => {
    // Winner 2
    fixture.componentRef.setInput('view', {
      cardId: 'two-assassin',
      base: 2,
      current: 2,
      damage: 0,
      state: 'winner',
      specialOverride: true,
    });
    fixture.detectChanges();

    const twoPres = fixture.nativeElement.querySelector('.comparison-strength');
    expect(twoPres.classList).toContain('is-winner');
    expect(twoPres.classList).toContain('is-special');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('2');
    expect(fixture.nativeElement.querySelector('.special-rule')).toBeNull();
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('special rule: 2 defeats Ace');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('winner with 2 remaining');

    // Defeated Ace
    fixture.componentRef.setInput('view', {
      cardId: 'ace-assassinated',
      base: 14,
      current: 0,
      damage: -14,
      state: 'defeated',
      specialOverride: true,
    });
    fixture.detectChanges();

    const acePres = fixture.nativeElement.querySelector('.comparison-strength');
    expect(acePres.classList).toContain('is-defeated');
    expect(acePres.classList).toContain('is-special');
    expect(fixture.nativeElement.querySelector('.strength-value-text').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.damage-number').textContent.trim()).toBe('-14');
    expect(fixture.nativeElement.querySelector('.special-rule')).toBeNull();
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('special rule: 2 defeats Ace');
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 14; defeated at zero');
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
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 14; winner with 6 remaining');
  });

  it('presents a winning 6 vs 2 with temporary remainder 4 and does not finish at zero when animations disabled', () => {
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
    expect(fixture.nativeElement.querySelector('.power-badge').getAttribute('aria-label')).toContain('Comparison power 6; winner with 4 remaining');
  });

  it('renders .strength-value-text visibly in normal motion mode without pseudo-element counter dependency', () => {
    settingsService.setAutoPlayAnimations(true);
    fixture.componentRef.setInput('view', {
      cardId: 'normal-card-7',
      base: 7,
      current: 7,
      damage: 0,
      state: 'ready',
      specialOverride: false,
    });
    fixture.detectChanges();

    const textEl = fixture.nativeElement.querySelector('.strength-value-text') as HTMLElement;
    expect(textEl).not.toBeNull();
    expect(textEl.textContent?.trim()).toBe('7');
    const computedDisplay = window.getComputedStyle(textEl).display;
    expect(computedDisplay).not.toBe('none');

    const valueEl = fixture.nativeElement.querySelector('.strength-value') as HTMLElement;
    const afterPseudo = window.getComputedStyle(valueEl, '::after');
    expect(afterPseudo.content === 'none' || afterPseudo.content === '""' || afterPseudo.content === '').toBeTrue();
  });

  it('explains normal Power math on keyboard focus and hides it on blur', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'winner-7',
      base: 7,
      current: 5,
      damage: -2,
      state: 'winner',
      specialOverride: false,
      opposingBase: 2,
      opposingRank: '2',
    });
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.power-badge') as HTMLButtonElement;
    badge.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    const inspector = fixture.nativeElement.querySelector('.power-inspector') as HTMLElement;
    expect(badge.getAttribute('aria-expanded')).toBe('true');
    expect(badge.getAttribute('aria-describedby')).toBe(inspector.id);
    expect(inspector.textContent).toContain('Base Power: 7');
    expect(inspector.textContent).toContain('Opposing Power: 2');
    expect(inspector.textContent).toContain('7 - 2 = 5 remaining');

    badge.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.power-inspector')).toBeNull();
  });

  it('pins special and tie explanations on tap, then closes them with Escape or an outside click', () => {
    fixture.componentRef.setInput('view', {
      cardId: 'two-assassin',
      base: 2,
      current: 2,
      damage: 0,
      state: 'winner',
      specialOverride: true,
      opposingBase: 14,
      opposingRank: 'Ace',
    });
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.power-badge') as HTMLButtonElement;
    badge.click();
    fixture.detectChanges();
    const inspector = fixture.nativeElement.querySelector('.power-inspector') as HTMLElement;
    expect(inspector.textContent).toContain('Opponent: Ace (14)');
    expect(inspector.textContent).toContain('Special Rule');
    expect(inspector.textContent).toContain('2 defeats Ace');
    expect(inspector.textContent).toContain('Normal Power comparison is overridden.');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.power-inspector')).toBeNull();

    fixture.componentRef.setInput('view', {
      cardId: 'tie-8',
      base: 8,
      current: 0,
      damage: -8,
      state: 'tie',
      specialOverride: false,
      opposingBase: 8,
      opposingRank: '8',
    });
    fixture.detectChanges();
    badge.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.power-inspector').textContent).toContain('8 vs 8');
    expect(fixture.nativeElement.querySelector('.power-inspector').textContent).toContain(
      'Equal Power -> Battle',
    );

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.power-inspector')).toBeNull();
  });
});
