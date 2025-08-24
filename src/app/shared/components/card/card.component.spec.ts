import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { Card, CardImpl, Suit, Rank } from '../../../core/models/card.model';
import { SettingsService } from '../../../core/services/settings.service';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('card display', () => {
    it('should display card face when not face down', () => {
      const testCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.componentRef.setInput('faceDown', false);
      fixture.detectChanges();

      const cardFace = fixture.nativeElement.querySelector('.card-face');
      const cardBack = fixture.nativeElement.querySelector('.card-back');
      
      expect(cardFace).toBeTruthy();
      expect(cardBack).toBeNull();
    });

    it('should display card back when face down', () => {
      const testCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.componentRef.setInput('faceDown', true);
      fixture.detectChanges();

      const cardFace = fixture.nativeElement.querySelector('.card-face');
      const cardBack = fixture.nativeElement.querySelector('.card-back');
      
      expect(cardFace).toBeNull();
      expect(cardBack).toBeTruthy();
    });

    it('should display correct rank and suit for ace of hearts', () => {
      const testCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.componentRef.setInput('faceDown', false);
      fixture.detectChanges();

      const ranks = fixture.nativeElement.querySelectorAll('.rank');
      const suits = fixture.nativeElement.querySelectorAll('.suit');
      
      expect(ranks[0].textContent).toBe('A');
      expect(suits[0].textContent).toBe('♥');
    });

    it('should display correct suit symbols', () => {
      const heartCard = new CardImpl(Suit.HEARTS, Rank.KING);
      fixture.componentRef.setInput('card', heartCard);
      fixture.detectChanges();
      expect(component['displaySuit']()).toBe('♥');

      const diamondCard = new CardImpl(Suit.DIAMONDS, Rank.QUEEN);
      fixture.componentRef.setInput('card', diamondCard);
      fixture.detectChanges();
      expect(component['displaySuit']()).toBe('♦');

      const clubCard = new CardImpl(Suit.CLUBS, Rank.JACK);
      fixture.componentRef.setInput('card', clubCard);
      fixture.detectChanges();
      expect(component['displaySuit']()).toBe('♣');

      const spadeCard = new CardImpl(Suit.SPADES, Rank.TEN);
      fixture.componentRef.setInput('card', spadeCard);
      fixture.detectChanges();
      expect(component['displaySuit']()).toBe('♠');
    });
  });

  describe('color classification', () => {
    it('should classify hearts as red', () => {
      const testCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.detectChanges();

      expect(component['isRed']()).toBe(true);
      expect(fixture.nativeElement.querySelector('.card').classList.contains('red-card')).toBe(true);
    });

    it('should classify diamonds as red', () => {
      const testCard = new CardImpl(Suit.DIAMONDS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.detectChanges();

      expect(component['isRed']()).toBe(true);
      expect(fixture.nativeElement.querySelector('.card').classList.contains('red-card')).toBe(true);
    });

    it('should classify clubs as black', () => {
      const testCard = new CardImpl(Suit.CLUBS, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.detectChanges();

      expect(component['isRed']()).toBe(false);
      expect(fixture.nativeElement.querySelector('.card').classList.contains('black-card')).toBe(true);
    });

    it('should classify spades as black', () => {
      const testCard = new CardImpl(Suit.SPADES, Rank.ACE);
      fixture.componentRef.setInput('card', testCard);
      fixture.detectChanges();

      expect(component['isRed']()).toBe(false);
      expect(fixture.nativeElement.querySelector('.card').classList.contains('black-card')).toBe(true);
    });
  });

  describe('glow effects', () => {
    it('should apply green glow class', () => {
      fixture.componentRef.setInput('glow', 'green');
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.card');
      expect(card.classList.contains('glowing')).toBe(true);
      expect(card.classList.contains('glow-green')).toBe(true);
    });

    it('should apply red glow class', () => {
      fixture.componentRef.setInput('glow', 'red');
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.card');
      expect(card.classList.contains('glowing')).toBe(true);
      expect(card.classList.contains('glow-red')).toBe(true);
    });

    it('should apply blue glow class', () => {
      fixture.componentRef.setInput('glow', 'blue');
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.card');
      expect(card.classList.contains('glowing')).toBe(true);
      expect(card.classList.contains('glow-blue')).toBe(true);
    });
  });

  describe('animation states', () => {
    it('should apply slide-in animation class', () => {
      fixture.componentRef.setInput('animationState', 'slide-in');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.card').classList.contains('animate-slide-in')).toBe(true);
    });

    it('should apply flip animation class', () => {
      fixture.componentRef.setInput('animationState', 'flip');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.card').classList.contains('animate-flip')).toBe(true);
    });

    it('should apply clash-win animation class', () => {
      fixture.componentRef.setInput('animationState', 'clash-win');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.card').classList.contains('animate-clash-win')).toBe(true);
    });

    it('should apply clash-lose animation class', () => {
      fixture.componentRef.setInput('animationState', 'clash-lose');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.card').classList.contains('animate-clash-lose')).toBe(true);
    });
  });

  describe('clickable behavior', () => {
    it('should emit cardClicked when clickable and clicked', () => {
      spyOn(component.cardClicked, 'emit');
      
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.card');
      card.click();

      expect(component.cardClicked.emit).toHaveBeenCalled();
    });

    it('should not emit cardClicked when not clickable', () => {
      spyOn(component.cardClicked, 'emit');
      
      fixture.componentRef.setInput('clickable', false);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.card');
      card.click();

      expect(component.cardClicked.emit).not.toHaveBeenCalled();
    });

    it('should apply clickable class when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.card').classList.contains('clickable')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null card gracefully', () => {
      fixture.componentRef.setInput('card', null);
      fixture.detectChanges();

      expect(component['displayRank']()).toBe('');
      expect(component['displaySuit']()).toBe('');
      expect(component['isRed']()).toBe(false);
    });

    it('should handle face down with pattern', () => {
      fixture.componentRef.setInput('faceDown', true);
      fixture.detectChanges();

      const pattern = fixture.nativeElement.querySelector('.card-pattern');
      expect(pattern).toBeTruthy();
    });
  });

  describe('card backing integration', () => {
    it('should apply selected card backing pattern to face-down cards', () => {
      fixture.componentRef.setInput('faceDown', true);
      fixture.detectChanges();

      const cardBack = fixture.nativeElement.querySelector('.card-back');
      expect(cardBack).toBeTruthy();
      
      // Check that cardBackingPattern computed property returns a pattern
      const pattern = component['cardBackingPattern']();
      expect(pattern).toBeTruthy();
      expect(typeof pattern).toBe('string');
    });

    it('should not apply card backing to face-up cards', () => {
      fixture.componentRef.setInput('faceDown', false);
      fixture.detectChanges();

      const cardBack = fixture.nativeElement.querySelector('.card-back');
      const cardFace = fixture.nativeElement.querySelector('.card-face');
      
      expect(cardBack).toBeNull();
      expect(cardFace).toBeTruthy();
    });

    it('should update card backing pattern when settings change', () => {
      // Set the card to be face down
      fixture.componentRef.setInput('faceDown', true);
      fixture.detectChanges();

      // Get initial pattern (should be gray by default)
      const initialPattern = component['cardBackingPattern']();
      expect(initialPattern).toContain('linear-gradient');
      expect(initialPattern).toContain('#616161'); // Gray pattern (this is the actual default)

      // Change to red backing
      settingsService.setCardBacking('classic-red');
      fixture.detectChanges();

      // Pattern should update to red
      const updatedPattern = component['cardBackingPattern']();
      expect(updatedPattern).toContain('linear-gradient');
      expect(updatedPattern).toContain('#c62828'); // Red pattern
      expect(updatedPattern).not.toContain('#616161'); // Should not contain gray anymore

      // Verify the DOM element also gets updated
      const cardBack = fixture.nativeElement.querySelector('.card-back');
      // Check for RGB equivalent of #c62828 or the hex value in the style attribute
      expect(cardBack.style.background.includes('rgb(198, 40, 40)') || cardBack.getAttribute('style').includes('#c62828')).toBe(true);
    });

    it('should apply different card backing options correctly', () => {
      fixture.componentRef.setInput('faceDown', true);
      
      // Test each available card backing option
      const backingOptions = settingsService.cardBackingOptions();
      
      for (const option of backingOptions) {
        settingsService.setCardBacking(option.id);
        fixture.detectChanges();
        
        const pattern = component['cardBackingPattern']();
        expect(pattern).toBe(option.pattern);
        
        const cardBack = fixture.nativeElement.querySelector('.card-back');
        expect(cardBack.getAttribute('style')).toContain(option.pattern);
      }
    });
  });
});