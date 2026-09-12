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

  it('renders a labelled identity button and emits the shared identity action', () => {
    fixture.componentRef.setInput('name', 'Marcel de Brie');
    fixture.componentRef.setInput('title', 'French Master Affineur');
    fixture.componentRef.setInput('identityInteractive', true);
    fixture.componentRef.setInput('identityAccessibleLabel', 'View dossier for Marcel de Brie');
    fixture.componentRef.setInput('identityActionIcon', 'assignment_ind');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.identity-button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('View dossier for Marcel de Brie');

    let emitted = false;
    fixture.componentInstance.identityActivated.subscribe(() => {
      emitted = true;
    });

    button.click();
    expect(emitted).toBeTrue();
  });

  it('renders plain non-interactive identity when no identity action is supplied', () => {
    fixture.componentRef.setInput('name', 'You');
    fixture.componentRef.setInput('identityInteractive', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.identity-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.identity-static')).toBeTruthy();
  });

  it('keeps draw activation separate from an opponent deck poke', () => {
    let draws = 0;
    let pokes = 0;
    fixture.componentInstance.deckActivated.subscribe(() => draws++);
    fixture.componentInstance.deckPoked.subscribe(() => pokes++);

    fixture.componentRef.setInput('deckInteractive', true);
    fixture.componentRef.setInput('deckPokeable', false);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.deck') as HTMLButtonElement).click();
    expect(draws).toBe(1);
    expect(pokes).toBe(0);

    fixture.componentRef.setInput('deckInteractive', false);
    fixture.componentRef.setInput('deckPokeable', true);
    fixture.detectChanges();
    const opponentDeck = fixture.nativeElement.querySelector('.deck') as HTMLButtonElement;
    expect(opponentDeck.disabled).toBeFalse();
    expect(opponentDeck.getAttribute('aria-label')).toContain('react to their deck');
    opponentDeck.click();

    expect(draws).toBe(1);
    expect(pokes).toBe(1);
  });

  it('binds is-bottom and handedness classes correctly for dominant-thumb mobile layout', () => {
    fixture.componentRef.setInput('position', 'bottom');
    fixture.componentRef.setInput('deckHand', 'right');
    fixture.detectChanges();

    const seat = fixture.nativeElement.querySelector('.seat');
    expect(seat.classList).toContain('is-bottom');
    expect(seat.classList).not.toContain('deck-left');

    fixture.componentRef.setInput('deckHand', 'left');
    fixture.detectChanges();
    expect(seat.classList).toContain('is-bottom');
    expect(seat.classList).toContain('deck-left');

    fixture.componentRef.setInput('position', 'top');
    fixture.detectChanges();
    expect(seat.classList).not.toContain('is-bottom');
    expect(seat.classList).not.toContain('deck-left');
  });
});
