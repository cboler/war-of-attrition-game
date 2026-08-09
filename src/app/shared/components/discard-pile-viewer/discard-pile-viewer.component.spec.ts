import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscardPileViewerComponent, DiscardPileData } from './discard-pile-viewer.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Suit, Rank, CardImpl, Card } from '../../../core/models/card.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DiscardPileViewerComponent', () => {
  let component: DiscardPileViewerComponent;
  let fixture: ComponentFixture<DiscardPileViewerComponent>;
  const mockDialogRef = { close: jasmine.createSpy('close') };

  const testCards: Card[] = [
    new CardImpl(Suit.HEARTS, Rank.ACE),
    new CardImpl(Suit.SPADES, Rank.KING)
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscardPileViewerComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { discardedCards: testCards } as DiscardPileData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscardPileViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DiscardPileViewerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should list discarded cards in reverse order', () => {
    const cardInfos = component.discardedCardInfos();
    expect(cardInfos.length).toBe(2);
    expect(cardInfos[0].card.suit).toBe(Suit.SPADES);
    expect(cardInfos[1].card.suit).toBe(Suit.HEARTS);
  });

  it('should close dialog when close is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
