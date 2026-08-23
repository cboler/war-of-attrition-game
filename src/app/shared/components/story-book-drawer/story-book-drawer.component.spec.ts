import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StoryBookDrawerComponent } from './story-book-drawer.component';
import { StoryBookService } from '../../../services/story-book.service';
import { GameEventBusService } from '../../../services/game-event-bus.service';
import { Card, Rank, Suit } from '../../../core/models/card.model';
import { HallOfValorService } from '../../../services/hall-of-valor.service';
import { AuthService } from '../../../core/services/auth.service';

describe('StoryBookDrawerComponent', () => {
  let component: StoryBookDrawerComponent;
  let fixture: ComponentFixture<StoryBookDrawerComponent>;
  let storyBook: StoryBookService;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StoryBookDrawerComponent],
      providers: [StoryBookService, HallOfValorService, AuthService, GameEventBusService]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryBookDrawerComponent);
    component = fixture.componentInstance;
    storyBook = TestBed.inject(StoryBookService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create and display the Chronicle empty state', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('#tab-chronicle')?.textContent).toContain('Chronicle');
    expect(compiled.querySelector('#tab-valor')?.textContent).toContain('Hall of Valor');
    expect(compiled.querySelector('#tab-rules')?.textContent).toContain('Rules of Engagement');
    expect(compiled.querySelector('.empty-state p')?.textContent).toContain('Chronicle is ready');
    expect(compiled.textContent).not.toContain('Mission Log');
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

  it('should render Hall of Valor empty state when no cards have records', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const valorTabBtn = compiled.querySelector('#tab-valor') as HTMLButtonElement;
    expect(valorTabBtn).toBeTruthy();

    valorTabBtn.click();
    fixture.detectChanges();

    expect(compiled.querySelector('#panel-valor')).toBeTruthy();
    expect(compiled.querySelector('#panel-valor')?.textContent).toContain('The Hall of Valor is empty');
  });

  it('should render decorated cards in Hall of Valor roll of honor and open detail view', () => {
    // Seed decorated card in active profile
    authService.updateActiveProfileHallOfValor(() => ({
      records: {
        'diamonds-2': {
          cardId: 'diamonds-2',
          confirmedCasualties: 8,
          aceAssassinations: 3,
          reinforcementRescues: 2,
          timesRescued: 1,
          battleLayersSurvived: 1,
          victoriousWarsSurvived: 4,
          juggernautCitations: 1,
          notableLosses: { 'spades-A': 2 }
        }
      }
    }));

    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('#tab-valor') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelector('.valor-overview')).toBeTruthy();
    expect(compiled.querySelector('.roll-count')?.textContent).toContain('1 DECORATED CARD');

    const cardEntry = compiled.querySelector('.valor-card-entry') as HTMLButtonElement;
    expect(cardEntry).toBeTruthy();
    expect(cardEntry.textContent).toContain('2 of Diamonds');
    expect(cardEntry.textContent).toContain('1 Juggernaut');
    expect(cardEntry.textContent).toContain('3 Ace Slayings');
    expect(cardEntry.textContent).toContain('8 Casualties');

    // Click card entry to open detail view
    cardEntry.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.valor-detail-view')).toBeTruthy();
    expect(compiled.querySelector('.detail-title-group h3')?.textContent).toContain('2 of Diamonds');
    expect(compiled.querySelector('.hero-citation-badge')?.textContent).toContain('1 Juggernaut Citation');
    expect(compiled.querySelector('.detail-rivals-section')?.textContent).toContain('Ace of Spades');
    expect(compiled.querySelector('.detail-rivals-section')?.textContent).toContain('Fell in battle 2 times');

    // Click back to roll of honor
    (compiled.querySelector('.valor-back-btn') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelector('.valor-detail-view')).toBeFalsy();
    expect(compiled.querySelector('.valor-overview')).toBeTruthy();
  });

  it('should display commemorated service record banner in Card Reference and link to Hall of Valor', () => {
    authService.updateActiveProfileHallOfValor(() => ({
      records: {
        'hearts-K': {
          cardId: 'hearts-K',
          confirmedCasualties: 12,
          aceAssassinations: 0,
          reinforcementRescues: 3,
          timesRescued: 0,
          battleLayersSurvived: 2,
          victoriousWarsSurvived: 5,
          juggernautCitations: 2,
          notableLosses: {}
        }
      }
    }));

    const referenceCard: Card = {
      id: 'hearts-K',
      suit: Suit.HEARTS,
      rank: Rank.KING,
      value: 13,
      isRed: true
    };

    const referenceFixture = TestBed.createComponent(StoryBookDrawerComponent);
    referenceFixture.componentRef.setInput('referenceCard', referenceCard);
    referenceFixture.detectChanges();

    const compiled = referenceFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#panel-reference')).toBeTruthy();
    const valorBanner = compiled.querySelector('.reference-valor-card');
    expect(valorBanner).toBeTruthy();
    expect(valorBanner?.textContent).toContain('SERVICE RECORD COMMEMORATED');
    expect(valorBanner?.textContent).toContain('2 Juggernaut Citations');
    expect(valorBanner?.textContent).toContain('12 Casualties');

    // Click View in Hall of Valor button
    const viewBtn = compiled.querySelector('.view-in-valor-btn') as HTMLButtonElement;
    expect(viewBtn).toBeTruthy();
    viewBtn.click();
    referenceFixture.detectChanges();

    expect(referenceFixture.componentInstance['activeTab']()).toBe('valor');
    expect(compiled.querySelector('.valor-detail-view')).toBeTruthy();

    referenceFixture.destroy();
  });

  it('should navigate tabs using arrow keys, Home, and End', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chronicleTab = compiled.querySelector('#tab-chronicle') as HTMLButtonElement;

    // ArrowRight moves from chronicle -> valor
    chronicleTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('valor');

    // ArrowRight moves from valor -> rules
    const valorTab = compiled.querySelector('#tab-valor') as HTMLButtonElement;
    valorTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('rules');

    // End moves to last tab (rules)
    valorTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('rules');

    // Home moves to first tab (chronicle)
    const rulesTab = compiled.querySelector('#tab-rules') as HTMLButtonElement;
    rulesTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('chronicle');
  });

  it('should render every corrected Rules entry as an actionable demonstration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rulesTabBtn = compiled.querySelector('#tab-rules') as HTMLButtonElement;
    expect(rulesTabBtn).toBeTruthy();

    rulesTabBtn.click();
    fixture.detectChanges();

    expect(compiled.querySelector('#panel-rules')).toBeTruthy();
    const ruleCards = compiled.querySelectorAll('.rule-card');
    expect(ruleCards.length).toBe(6);
    ruleCards.forEach(rule => expect(rule.tagName).toBe('BUTTON'));
    expect(compiled.querySelector('#panel-rules')?.textContent).toContain('surviving cards return to their owner');
    expect(compiled.querySelector('#panel-rules')?.textContent).toContain('a tie begins a Battle');
    expect(compiled.querySelector('#panel-rules')?.textContent).not.toContain('captures all cards at stake');
  });

  it('opens a deterministic Rule demo and returns focus to its launcher when closed', fakeAsync(() => {
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('#tab-rules') as HTMLButtonElement).click();
    fixture.detectChanges();

    const launcher = compiled.querySelector('.rule-card') as HTMLButtonElement;
    const launcherId = launcher.dataset['ruleDemoId'];
    launcher.focus();
    launcher.click();
    fixture.detectChanges();
    tick();

    expect(compiled.querySelector('app-rule-demo')).toBeTruthy();
    (compiled.querySelector('.demo-close') as HTMLButtonElement).click();
    fixture.detectChanges();
    tick();

    expect(compiled.querySelector('app-rule-demo')).toBeFalsy();
    const restoredLauncher = compiled.querySelector(
      `[data-rule-demo-id="${launcherId}"]`
    ) as HTMLButtonElement;
    expect(restoredLauncher).toBeTruthy();
    expect(restoredLauncher).not.toBe(launcher);
    expect(document.activeElement).toBe(restoredLauncher);
  }));

  it('opens directly to an exact-card reference without mutating gameplay events', () => {
    const referenceCard: Card = {
      id: 'boneyard-ace-spades',
      suit: Suit.SPADES,
      rank: Rank.ACE,
      value: 14,
      isRed: false,
    };
    const eventBus = TestBed.inject(GameEventBusService);
    const emitSpy = spyOn(eventBus, 'emit');
    const referenceFixture = TestBed.createComponent(StoryBookDrawerComponent);
    referenceFixture.componentRef.setInput('referenceCard', referenceCard);
    referenceFixture.detectChanges();

    const compiled = referenceFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#panel-reference')).toBeTruthy();
    expect(compiled.querySelector('.reference-heading')?.textContent).toContain('Ace of Spades');
    expect(compiled.querySelector('.reference-heading')?.textContent).toContain(referenceCard.id);
    expect(compiled.querySelector('.reference-guidance')?.textContent).toContain('loses to a 2');
    expect(emitSpy).not.toHaveBeenCalled();

    referenceFixture.destroy();
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
