import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StoryBookDrawerComponent } from './story-book-drawer.component';
import { StoryBookService } from '../../../services/story-book.service';
import { GameEventBusService } from '../../../services/game-event-bus.service';
import { Card, Rank, Suit } from '../../../core/models/card.model';
import { HallOfValorService } from '../../../services/hall-of-valor.service';
import { AuthService } from '../../../core/services/auth.service';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { GameStateService } from '../../../core/services/game-state.service';
import { GamePhase } from '../../../core/models/game-state.model';
import { UiTelemetryService } from '../../../services/ui-telemetry.service';

describe('StoryBookDrawerComponent', () => {
  let component: StoryBookDrawerComponent;
  let fixture: ComponentFixture<StoryBookDrawerComponent>;
  let storyBook: StoryBookService;
  let authService: AuthService;
  let progressionService: CampaignProgressionService;
  let gameState: GameStateService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StoryBookDrawerComponent],
      providers: [
        StoryBookService,
        HallOfValorService,
        AuthService,
        GameEventBusService,
        CampaignProgressionService,
        GameStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryBookDrawerComponent);
    component = fixture.componentInstance;
    storyBook = TestBed.inject(StoryBookService);
    authService = TestBed.inject(AuthService);
    progressionService = TestBed.inject(CampaignProgressionService);
    gameState = TestBed.inject(GameStateService);
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

  it('maps Rules demos and commander dossiers to stable semantic identifiers', () => {
    const uiTelemetry = TestBed.inject(UiTelemetryService);
    const open = spyOn(uiTelemetry, 'openSurface').and.callThrough();
    const compiled = fixture.nativeElement as HTMLElement;

    (compiled.querySelector('#tab-rules') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(open).toHaveBeenCalledWith(
      { surface: 'rules', sourceSurface: 'field_manual' },
      'field_manual.active_tab',
    );

    (compiled.querySelector('[data-rule-demo-id="reinforcement"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(open).toHaveBeenCalledWith(
      {
        surface: 'rules',
        subsurface: 'rule_demo',
        sourceSurface: 'field_manual',
        ruleId: 'reinforcement',
      },
      'field_manual.active_tab',
    );

    component.selectDossierCommander('quartermaster');
    (compiled.querySelector('#tab-dossier') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(open).toHaveBeenCalledWith(
      {
        surface: 'field_manual',
        subsurface: 'commander_dossier',
        sourceSurface: 'field_manual',
        commanderId: 'quartermaster',
        manualEntryType: 'commander_dossier',
      },
      'field_manual.active_tab',
    );
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

    // ArrowRight moves from rules -> dossier
    const rulesTab = compiled.querySelector('#tab-rules') as HTMLButtonElement;
    rulesTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('dossier');

    // End moves to last tab (dossier)
    valorTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    fixture.detectChanges();
    expect(component['activeTab']()).toBe('dossier');

    // Home moves to first tab (chronicle)
    const dossierTab = compiled.querySelector('#tab-dossier') as HTMLButtonElement;
    dossierTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
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

  describe('Chronicle combat math display & interaction', () => {
    const cardKing: Card = { id: 'c-k', suit: Suit.CLUBS, rank: Rank.KING, value: 13, isRed: false };
    const cardEight: Card = { id: 'c-8', suit: Suit.DIAMONDS, rank: Rank.EIGHT, value: 8, isRed: true };
    const cardTwo: Card = { id: 'c-2', suit: Suit.HEARTS, rank: Rank.TWO, value: 2, isRed: true };
    const cardAce: Card = { id: 'c-a', suit: Suit.SPADES, rank: Rank.ACE, value: 14, isRed: false };

    it('renders combat math trigger and toggles breakdown on click/tap', () => {
      const uiTelemetry = TestBed.inject(UiTelemetryService);
      const open = spyOn(uiTelemetry, 'openSurface').and.callThrough();
      storyBook.addEntry({
        turnNumber: 3,
        type: 'challenge',
        eyebrow: 'TURN 3 · RESOLUTION',
        text: 'Card rescued. K♣ defeated 8♦.',
        badge: 'victory',
        comparison: {
          card: cardKing,
          opposingCard: cardEight,
          base: 13,
          opposingBase: 8,
          opposingRank: '8',
          state: 'winner',
          current: 5,
          damage: -8,
          specialOverride: false,
          formulaText: '13 − 8 = 5 remaining',
        },
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const trigger = compiled.querySelector('.combat-math-trigger') as HTMLButtonElement;
      expect(trigger).toBeTruthy();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(trigger.textContent).toContain('13 − 8 = 5 remaining');

      // Click to toggle expansion
      trigger.click();
      fixture.detectChanges();

      expect(open).toHaveBeenCalledWith(
        {
          surface: 'chronicle',
          subsurface: 'entry_detail',
          sourceSurface: 'chronicle',
          chronicleEntry: 'challenge',
        },
        'field_manual.chronicle_entry.story-entry-1',
      );
      expect(JSON.stringify(open.calls.mostRecent().args)).not.toContain('Card rescued');

      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const breakdown = compiled.querySelector('.combat-math-breakdown') as HTMLElement;
      expect(breakdown).toBeTruthy();
      expect(breakdown.textContent).toContain('Base Power:');
      expect(breakdown.textContent).toContain('13');
      expect(breakdown.textContent).toContain('Opposing Power:');
      expect(breakdown.textContent).toContain('8');
      expect(breakdown.textContent).toContain('13 − 8 = 5 remaining');

      // Click again to collapse
      trigger.click();
      fixture.detectChanges();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('displays 2 vs Ace assassination special rule breakdown correctly', () => {
      storyBook.addEntry({
        turnNumber: 4,
        type: 'clash',
        eyebrow: 'TURN 4 · SPECIAL FEAT',
        text: '2♥ assassinated A♠!',
        badge: 'victory',
        comparison: {
          card: cardTwo,
          opposingCard: cardAce,
          base: 2,
          opposingBase: 14,
          opposingRank: 'Ace',
          state: 'winner',
          current: 2,
          damage: 0,
          specialOverride: true,
          formulaText: '2 defeats Ace · Assassination Rule',
        },
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const breakdown = compiled.querySelector('.combat-math-breakdown') as HTMLElement;
      expect(breakdown).toBeTruthy();
      expect(breakdown.textContent).toContain('2 defeats Ace');
      expect(breakdown.textContent).toContain('Special Rule');
      expect(breakdown.textContent).toContain('Assassination Rule');
    });

    it('renders old or legacy entries without comparison metadata normally', () => {
      storyBook.addEntry({
        turnNumber: 1,
        type: 'quip',
        eyebrow: 'REACTION',
        text: 'A legacy entry without comparison math',
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelectorAll('.story-node').length).toBe(1);
      expect(compiled.querySelector('.node-combat-math')).toBeNull();
    });
  });

  describe('Fog of War Chronicle and Hall of Valor sealing', () => {
    it('redacts Chronicle narrative text, suppresses combat math and casualty strips during active War, and reveals upon GAME_OVER', () => {
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war']
      }));
      progressionService.selectCampaignOrders('fog_of_war');
      gameState.setPhase(GamePhase.NORMAL);
      fixture.detectChanges();

      expect(component.isFogOfWarActive()).toBeTrue();

      const cardSeven: Card = { id: 'spades-7', suit: Suit.SPADES, rank: Rank.SEVEN, value: 7, isRed: false };
      const cardKing: Card = { id: 'hearts-K', suit: Suit.HEARTS, rank: Rank.KING, value: 13, isRed: true };

      // Add a clash entry with comparison metadata
      storyBook.addEntry({
        turnNumber: 1,
        type: 'clash',
        eyebrow: 'TURN 1 · SPECIAL FEAT',
        text: 'K♥ defeated 7♠',
        badge: 'victory',
        comparison: {
          card: cardKing,
          opposingCard: cardSeven,
          base: 13,
          opposingBase: 7,
          opposingRank: '7',
          state: 'winner',
          current: 6,
          damage: 0,
          specialOverride: false,
          formulaText: '13 − 7 = 6',
        }
      });

      // Add a casualty entry with cards
      storyBook.addEntry({
        turnNumber: 2,
        type: 'casualty',
        eyebrow: 'BATTLE CASUALTIES',
        text: '4 casualties sent to Boneyard',
        badge: 'defeat',
        cards: [cardSeven, cardKing]
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nodes = compiled.querySelectorAll('.story-node');
      expect(nodes.length).toBe(2);

      // Node 1: Redacted text, sanitized eyebrow, and suppressed combat math button
      expect(nodes[0].classList).toContain('fog-sealed');
      expect(nodes[0].querySelector('.node-text')?.textContent).toContain('Comparison resolved under Fog of War.');
      expect(nodes[0].querySelector('.node-eyebrow')?.textContent).toBe('TURN 1 · CLASH');
      expect(nodes[0].querySelector('.combat-math-trigger')).toBeNull();

      // Node 2: Redacted casualty text and hidden casualty card strip
      expect(nodes[1].classList).toContain('fog-sealed');
      expect(nodes[1].querySelector('.node-text')?.textContent).toContain('Casualties surrendered to the sealed Boneyard.');
      expect(nodes[1].querySelector('.casualties-strip')).toBeNull();

      // Check Hall of Valor tab while Fog is active: sealed state displayed
      (compiled.querySelector('#tab-valor') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(compiled.querySelector('#panel-valor')).toBeTruthy();
      expect(compiled.querySelector('.fog-sealed-state')).toBeTruthy();
      expect(compiled.querySelector('#panel-valor')?.textContent).toContain('Field Records Sealed');
      expect(compiled.querySelector('#panel-valor')?.textContent).toContain('Hall of Valor service records are sealed');

      // Now War concludes (GAME_OVER)
      gameState.setPhase(GamePhase.GAME_OVER);
      fixture.detectChanges();

      expect(component.isFogOfWarActive()).toBeFalse();

      // Hall of Valor unsealed (empty state since no decorated cards)
      expect(compiled.querySelector('.fog-sealed-state')).toBeNull();
      expect(compiled.querySelector('#panel-valor')?.textContent).toContain('The Hall of Valor is empty');

      // Switch back to Chronicle tab: truth revealed!
      (compiled.querySelector('#tab-chronicle') as HTMLButtonElement).click();
      fixture.detectChanges();

      const unsealedNodes = compiled.querySelectorAll('.story-node');
      expect(unsealedNodes[0].classList).not.toContain('fog-sealed');
      expect(unsealedNodes[0].querySelector('.node-text')?.textContent).toContain('K♥ defeated 7♠');
      expect(unsealedNodes[0].querySelector('.node-eyebrow')?.textContent).toBe('TURN 1 · SPECIAL FEAT');
      expect(unsealedNodes[0].querySelector('.combat-math-trigger')).toBeTruthy();

      expect(unsealedNodes[1].classList).not.toContain('fog-sealed');
      expect(unsealedNodes[1].querySelector('.node-text')?.textContent).toContain('4 casualties sent to Boneyard');
      expect(unsealedNodes[1].querySelector('.casualties-strip')).toBeTruthy();
    });
  });

  describe('Commander Dossier Tab', () => {
    it('should render commander dossier tab with unlocked records and safe source links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const dossierTab = compiled.querySelector('#tab-dossier') as HTMLButtonElement;
      expect(dossierTab).toBeTruthy();

      dossierTab.click();
      fixture.detectChanges();

      const panel = compiled.querySelector('#panel-dossier');
      expect(panel).toBeTruthy();
      expect(panel?.textContent).toContain('Marcel de Brie');
      expect(panel?.textContent).toContain('French Master Affineur');
      expect(panel?.textContent).toContain('French Delegation');

      const recordCards = panel?.querySelectorAll('.dossier-record-card');
      expect(recordCards?.length).toBeGreaterThanOrEqual(1);

      const firstRecord = recordCards?.[0];
      expect(firstRecord?.querySelector('.record-section')?.textContent).toContain('Overview');
      expect(firstRecord?.querySelector('.evidence-badge')?.textContent).toContain('documented');

      const sourceLink = firstRecord?.querySelector('.dossier-source-link') as HTMLAnchorElement | null;
      if (sourceLink) {
        expect(sourceLink.getAttribute('target')).toBe('_blank');
        expect(sourceLink.getAttribute('rel')).toBe('noopener noreferrer');
        expect(sourceLink.href).toContain('gruyere-france.fr');
      }
    });

    it('should open dossier tab when targetCommanderId input is set', () => {
      fixture.componentRef.setInput('targetCommanderId', 'analyst');
      fixture.detectChanges();

      expect(component['activeTab']()).toBe('dossier');
      expect(component['selectedCommanderId']()).toBe('analyst');

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#panel-dossier')?.textContent).toContain('Matthias von Greyerz');
    });

    it('renders canonical Calm portraits and keyboard-operable crest switchers', fakeAsync(() => {
      authService.updateActiveProfileProgression((progression) => ({
        ...progression,
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war'],
        completedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war'],
      }));
      const compiled = fixture.nativeElement as HTMLElement;
      (compiled.querySelector('#tab-dossier') as HTMLButtonElement).click();
      fixture.detectChanges();

      const chips = compiled.querySelectorAll<HTMLButtonElement>('.commander-chip');
      expect(chips.length).toBe(5);
      for (const chip of Array.from(chips)) {
        expect(chip.getAttribute('role')).toBe('tab');
        expect(chip.textContent?.trim()).toBeTruthy();
        const crest = chip.querySelector('img.commander-crest') as HTMLImageElement;
        expect(crest.src).toContain('/assets/commanders/');
        expect(crest.src).toContain('/crest.jpg');
        expect(crest.alt).toBe('');
      }

      const portrait = compiled.querySelector('.dossier-portrait') as HTMLImageElement;
      expect(portrait.src).toContain('/assets/commanders/quartermaster/calm.jpg');
      expect(portrait.alt).toBe('');
      expect(chips[0].id).toBe('commander-tab-quartermaster');
      expect(chips[0].getAttribute('aria-controls')).toBe('commander-dossier-quartermaster');
      expect(compiled.querySelector('.dossier-header-card')?.getAttribute('aria-labelledby'))
        .toBe('commander-tab-quartermaster');

      chips[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
      tick();

      expect(component['selectedCommanderId']()).toBe('analyst');
      const analystChip = compiled.querySelector(
        '[data-commander-id="analyst"]',
      ) as HTMLButtonElement;
      expect(analystChip.getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(analystChip);
      expect((compiled.querySelector('.dossier-portrait') as HTMLImageElement).src)
        .toContain('/assets/commanders/analyst/calm.jpg');
    }));
  });
});
