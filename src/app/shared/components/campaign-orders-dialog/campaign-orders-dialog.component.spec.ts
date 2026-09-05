import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CampaignOrdersDialogComponent } from './campaign-orders-dialog.component';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { AuthService } from '../../../core/services/auth.service';
import { CAMPAIGN_CHAPTER_ORDER, getAuthoredCommanderSchedule } from '../../../core/models/campaign-chapter.model';

describe('CampaignOrdersDialogComponent', () => {
  let component: CampaignOrdersDialogComponent;
  let fixture: ComponentFixture<CampaignOrdersDialogComponent>;
  let progressionService: CampaignProgressionService;
  let authService: AuthService;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CampaignOrdersDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CampaignOrdersDialogComponent, NoopAnimationsModule],
      providers: [
        AuthService,
        CampaignProgressionService,
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    progressionService = TestBed.inject(CampaignProgressionService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  function createComponent(): void {
    fixture = TestBed.createComponent(CampaignOrdersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function enterCustomCampaign(modifiers: readonly ('limited_reserves' | 'fog_of_war' | 'total_war')[] = []): void {
    authService.updateActiveProfileProgression(previous => ({
      ...previous,
      unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER],
      completedChapterModes: [...CAMPAIGN_CHAPTER_ORDER],
      currentCampaign: {
        ...previous.currentCampaign,
        mode: 'standard',
        modifiers,
        ordersSelected: false,
        wars: [],
        commanderSchedule: getAuthoredCommanderSchedule('standard')
      }
    }));
  }

  it('renders the fresh scripted Chapter as mandatory Classic orders', () => {
    createComponent();

    const root = fixture.nativeElement as HTMLElement;
    expect(component.selectedMode()).toBe('standard');
    expect(component.isReplay()).toBeFalse();
    expect(root.querySelector('.scripted-order')?.textContent).toContain('The Accord');
    expect(root.querySelector('.scripted-order')?.textContent).toContain('Classic rules');
    expect(root.querySelectorAll('.modifier-toggle').length).toBe(0);
  });

  it('displays the cumulative modifier stack for a later scripted Chapter', () => {
    authService.updateActiveProfileProgression(previous => ({
      ...previous,
      unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war'],
      completedChapterModes: ['standard', 'limited_reserves'],
      currentCampaign: {
        ...previous.currentCampaign,
        mode: 'fog_of_war',
        modifiers: ['limited_reserves', 'fog_of_war'],
        commanderSchedule: getAuthoredCommanderSchedule('fog_of_war')
      }
    }));
    createComponent();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.modifier-chip') as NodeListOf<HTMLElement>
    ).map(chip => chip.textContent ?? '');
    expect(chips.some(text => text.includes('Limited Reserves'))).toBeTrue();
    expect(chips.some(text => text.includes('Fog of War'))).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.modifier-toggle').length).toBe(0);
  });

  it('confirms mandatory scripted orders without allowing a different Chapter', () => {
    createComponent();
    const selectSpy = spyOn(progressionService, 'selectCampaignOrders').and.callThrough();

    component.confirmOrders();

    expect(selectSpy).toHaveBeenCalledWith('standard', []);
    expect(progressionService.activeCampaignModifiers()).toEqual([]);
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('offers three independent modifier toggles after the story is complete', () => {
    enterCustomCampaign();
    createComponent();

    const toggles = fixture.nativeElement.querySelectorAll('.modifier-toggle');
    expect(component.isReplay()).toBeTrue();
    expect(toggles.length).toBe(3);
    expect(component.selectedModifiers()).toEqual([]);

    (toggles[0] as HTMLButtonElement).click();
    (toggles[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.selectedModifiers()).toEqual(['limited_reserves', 'fog_of_war']);
    expect((toggles[0] as HTMLButtonElement).getAttribute('aria-checked')).toBe('true');
    expect((toggles[1] as HTMLButtonElement).getAttribute('aria-checked')).toBe('true');
    expect((toggles[2] as HTMLButtonElement).getAttribute('aria-checked')).toBe('false');
  });

  it('starts a randomized custom Campaign with the selected modifier combination', () => {
    enterCustomCampaign();
    progressionService.setRandomSource(() => 0);
    createComponent();
    component.toggleModifier('limited_reserves');
    component.toggleModifier('total_war');

    component.confirmOrders();

    expect(progressionService.activeCampaignMode()).toBe('standard');
    expect(progressionService.activeCampaignModifiers()).toEqual([
      'limited_reserves',
      'total_war'
    ]);
    expect(progressionService.isLimitedReserves()).toBeTrue();
    expect(progressionService.isFogOfWar()).toBeFalse();
    expect(progressionService.isTotalWar()).toBeTrue();
    expect(new Set(progressionService.currentCampaign().commanderSchedule).size).toBe(3);
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      mode: 'standard',
      modifiers: ['limited_reserves', 'total_war']
    });
  });
});
