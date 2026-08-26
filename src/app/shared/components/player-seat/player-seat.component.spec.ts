import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerSeatComponent } from './player-seat.component';

describe('PlayerSeatComponent', () => {
  let fixture: ComponentFixture<PlayerSeatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PlayerSeatComponent] }).compileComponents();
    fixture = TestBed.createComponent(PlayerSeatComponent);
    fixture.componentRef.setInput('name', 'You');
  });

  it('makes low-deck urgency progressive and keeps the one badge visible', () => {
    fixture.componentRef.setInput('cardCount', 5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.deck').classList).toContain('urgency-5');

    fixture.componentRef.setInput('cardCount', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.deck').classList).toContain('urgency-1');
    expect(fixture.nativeElement.querySelector('.deck-count').textContent.trim()).toBe('1');
  });

  it('never renders a static zero badge', () => {
    fixture.componentRef.setInput('cardCount', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-deck')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.deck-count')).toBeNull();
  });

  it('pops the final one with lightweight fragments before removing the badge', () => {
    fixture.componentRef.setInput('cardCount', 0);
    fixture.componentRef.setInput('defeatPopping', true);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.deck-count');
    expect(badge.classList).toContain('defeat-pop');
    expect(badge.textContent.trim()).toBe('1');
    expect(fixture.nativeElement.querySelectorAll('.pop-fragments i').length).toBe(6);
  });

  it('renders optional title and faction when provided', () => {
    fixture.componentRef.setInput('name', 'Marcel de Brie');
    fixture.componentRef.setInput('title', 'French Master Affineur');
    fixture.componentRef.setInput('faction', 'French Delegation');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.seat-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('French Master Affineur');

    const factionEl = fixture.nativeElement.querySelector('.seat-faction');
    expect(factionEl).toBeTruthy();
    expect(factionEl.textContent.trim()).toBe('French Delegation');
  });

  it('renders identity button and emits dossierRequested when dossierAccessible is true', () => {
    fixture.componentRef.setInput('name', 'Marcel de Brie');
    fixture.componentRef.setInput('title', 'French Master Affineur');
    fixture.componentRef.setInput('dossierAccessible', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.identity-button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('View dossier for Marcel de Brie');

    let emitted = false;
    fixture.componentInstance.dossierRequested.subscribe(() => {
      emitted = true;
    });

    button.click();
    expect(emitted).toBeTrue();
  });

  it('renders plain non-interactive identity when dossierAccessible is false', () => {
    fixture.componentRef.setInput('name', 'You');
    fixture.componentRef.setInput('dossierAccessible', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.identity-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.identity-static')).toBeTruthy();
  });
});
