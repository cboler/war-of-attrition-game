import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryBookDrawerComponent } from './story-book-drawer.component';
import { StoryBookService } from '../../../services/story-book.service';
import { GameEventBusService } from '../../../services/game-event-bus.service';

describe('StoryBookDrawerComponent', () => {
  let component: StoryBookDrawerComponent;
  let fixture: ComponentFixture<StoryBookDrawerComponent>;
  let storyBook: StoryBookService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryBookDrawerComponent],
      providers: [StoryBookService, GameEventBusService]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryBookDrawerComponent);
    component = fixture.componentInstance;
    storyBook = TestBed.inject(StoryBookService);
    fixture.detectChanges();
  });

  it('should create and display empty state when no entries exist', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.empty-state p')?.textContent).toContain('The story has just begun');
  });

  it('should render timeline entries when added', () => {
    storyBook.addEntry({
      turnNumber: 1,
      type: 'clash',
      text: 'A♥ defeated K♠.',
      badge: 'victory'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.story-node').length).toBe(1);
    expect(compiled.querySelector('.node-text')?.textContent).toContain('A♥ defeated K♠');
  });

  it('should emit closed event on escape key', () => {
    spyOn(component.closed, 'emit');
    component.onEscape();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
