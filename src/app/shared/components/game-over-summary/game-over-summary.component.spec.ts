import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameOverSummaryComponent } from './game-over-summary.component';
import { GameOutcome } from '../../../core/models/game-state.model';
import { CurrentGameSummary } from '../../../services/game-controller.service';

describe('GameOverSummaryComponent', () => {
  let component: GameOverSummaryComponent;
  let fixture: ComponentFixture<GameOverSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameOverSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GameOverSummaryComponent);
    component = fixture.componentInstance;
  });

  it('renders standard war resolution message and statistics', () => {
    fixture.componentRef.setInput('message', 'The war is won.');
    fixture.componentRef.setInput('summary', {
      outcome: GameOutcome.PLAYER_WIN,
      turns: 12,
      battlesCount: 3,
      deepestBattleLayer: 2,
      maxCardsAtStake: 8,
      largestBattleVictory: 8,
      largestBattleLoss: 0,
      playerChallengesCount: 2,
      playerChallengesWon: 1,
      playerCardsRemaining: 6,
      opponentCardsRemaining: 0,
      isComeback: false,
      maxDeficit: 0,
    } as CurrentGameSummary);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.game-over-eyebrow')?.textContent).toContain('WAR RESOLUTION');
    expect(compiled.querySelector('#game-over-title')?.textContent).toContain('The war is won.');
    expect(compiled.querySelectorAll('.stat-pill').length).toBe(4);
    expect(compiled.querySelector('.total-war-banner')).toBeNull();
  });

  it('renders Total War differential banner for War 1 or 2', () => {
    fixture.componentRef.setInput('message', 'War 1 complete · War Diff: +7 · Campaign: +7');
    fixture.componentRef.setInput('summary', {
      outcome: GameOutcome.PLAYER_WIN,
      turns: 10,
      battlesCount: 2,
      deepestBattleLayer: 1,
      maxCardsAtStake: 6,
      largestBattleVictory: 6,
      largestBattleLoss: 0,
      playerChallengesCount: 0,
      playerChallengesWon: 0,
      playerCardsRemaining: 7,
      opponentCardsRemaining: 0,
      isComeback: false,
      maxDeficit: 0,
      campaignMode: 'total_war',
      warDifferential: 7,
      runningCampaignDifferential: 7,
      warIndex: 1,
    } as CurrentGameSummary);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.game-over-eyebrow')?.textContent).toContain('TOTAL WAR · WAR 1 OF 3');
    expect(compiled.querySelector('.total-war-banner')).toBeTruthy();
    expect(compiled.querySelector('.war-diff .diff-value')?.textContent).toContain('+7');
    expect(compiled.querySelector('.campaign-diff .diff-value')?.textContent).toContain('+7');
  });

  it('renders Total War final campaign conclusion for War 3', () => {
    fixture.componentRef.setInput('message', 'Total War Campaign Victory · Final Diff: +11');
    fixture.componentRef.setInput('summary', {
      outcome: GameOutcome.PLAYER_WIN,
      turns: 15,
      battlesCount: 4,
      deepestBattleLayer: 1,
      maxCardsAtStake: 8,
      largestBattleVictory: 8,
      largestBattleLoss: 0,
      playerChallengesCount: 1,
      playerChallengesWon: 1,
      playerCardsRemaining: 5,
      opponentCardsRemaining: 0,
      isComeback: false,
      maxDeficit: 0,
      campaignMode: 'total_war',
      warDifferential: 5,
      runningCampaignDifferential: 11,
      warIndex: 3,
    } as CurrentGameSummary);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.game-over-eyebrow')?.textContent).toContain('TOTAL WAR · WAR 3 OF 3');
    expect(compiled.querySelector('#game-over-title')?.textContent).toContain('Total War Campaign Victory');
    expect(compiled.querySelector('.total-war-banner.final')).toBeTruthy();
    expect(compiled.querySelector('.campaign-diff .diff-value')?.textContent).toContain('+11');
  });

  it('emits manualRequested and replayRequested events', () => {
    spyOn(component.manualRequested, 'emit');
    spyOn(component.replayRequested, 'emit');

    fixture.componentRef.setInput('message', 'The war is won.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const secondaryBtn = compiled.querySelector('.game-over-btn.secondary') as HTMLButtonElement;
    const primaryBtn = compiled.querySelector('.game-over-btn.primary') as HTMLButtonElement;

    secondaryBtn.click();
    expect(component.manualRequested.emit).toHaveBeenCalled();

    primaryBtn.click();
    expect(component.replayRequested.emit).toHaveBeenCalled();
  });
});
