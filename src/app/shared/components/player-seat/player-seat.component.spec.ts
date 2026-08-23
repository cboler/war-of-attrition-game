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

  it('renders optional title when provided', () => {
    fixture.componentRef.setInput('name', 'The Quartermaster');
    fixture.componentRef.setInput('title', 'Conservative Logistics');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.seat-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Conservative Logistics');
  });
});
