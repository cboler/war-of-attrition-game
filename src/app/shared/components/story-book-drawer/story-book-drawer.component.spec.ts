import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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

  it('should create and display empty state when no entries exist in mission log', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.empty-state p')?.textContent).toContain('The mission log is clean');
  });

  it('should render curated timeline entries when added', () => {
    storyBook.addEntry({
      turnNumber: 1,
      type: 'clash',
      eyebrow: 'TURN 1 · SPECIAL FEAT',
      text: '2♥ assassinated A♠!',
      badge: 'victory'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.story-node').length).toBe(1);
    expect(compiled.querySelector('.node-text')?.textContent).toContain('2♥ assassinated A♠');
  });

  it('should switch to Rules of Engagement tab and render rule cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rulesTabBtn = compiled.querySelector('#tab-rules') as HTMLButtonElement;
    expect(rulesTabBtn).toBeTruthy();

    rulesTabBtn.click();
    fixture.detectChanges();

    expect(compiled.querySelector('#panel-rules')).toBeTruthy();
    const ruleCards = compiled.querySelectorAll('.rule-card');
    expect(ruleCards.length).toBeGreaterThanOrEqual(5);
  });

  it('should emit closed event on escape key', () => {
    spyOn(component.closed, 'emit');
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(escapeEvent);
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should trap focus inside the dialog when Tab is pressed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const closeBtn = compiled.querySelector('.close-button') as HTMLButtonElement;
    const doneBtn = compiled.querySelector('.done-btn') as HTMLButtonElement;

    expect(closeBtn).toBeTruthy();
    expect(doneBtn).toBeTruthy();

    // Focus last element and press Tab -> should wrap to first element
    doneBtn.focus();
    expect(document.activeElement).toBe(doneBtn);

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, cancelable: true });
    spyOn(tabEvent, 'preventDefault');
    component.handleKeyDown(tabEvent);
    expect(tabEvent.preventDefault).toHaveBeenCalled();

    // Focus first element and press Shift+Tab -> should wrap to last element
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
    spyOn(shiftTabEvent, 'preventDefault');
    component.handleKeyDown(shiftTabEvent);
    expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
  });

  it('should restore focus to the previously focused element on destroy', fakeAsync(() => {
    const launcherBtn = document.createElement('button');
    document.body.appendChild(launcherBtn);
    launcherBtn.focus();
    expect(document.activeElement).toBe(launcherBtn);

    const testFixture = TestBed.createComponent(StoryBookDrawerComponent);
    testFixture.detectChanges();
    tick();

    testFixture.destroy();
    expect(document.activeElement).toBe(launcherBtn);
    document.body.removeChild(launcherBtn);
  }));
});
