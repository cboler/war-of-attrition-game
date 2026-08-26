import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CampaignOrdersDialogComponent } from './campaign-orders-dialog.component';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { AuthService } from '../../../core/services/auth.service';

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

    fixture = TestBed.createComponent(CampaignOrdersDialogComponent);
    component = fixture.componentInstance;
    progressionService = TestBed.inject(CampaignProgressionService);
    authService = TestBed.inject(AuthService);
    authService.updateActiveProfileProgression(p => ({
      ...p,
      unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war']
    }));
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create CampaignOrdersDialogComponent', () => {
    expect(component).toBeTruthy();
    expect(component.selectedMode()).toBe('standard');
  });

  it('should render all campaign order options', () => {
    const cards = fixture.nativeElement.querySelectorAll('.order-card');
    expect(cards.length).toBe(4);
    expect(cards[0].textContent).toContain('Standard Campaign');
    expect(cards[1].textContent).toContain('Limited Reserves');
    expect(cards[2].textContent).toContain('Fog of War');
    expect(cards[3].textContent).toContain('Total War');
  });

  it('should allow selecting Limited Reserves mode', () => {
    const cards = fixture.nativeElement.querySelectorAll('.order-card');
    cards[1].click();
    fixture.detectChanges();

    expect(component.selectedMode()).toBe('limited_reserves');
    expect(cards[1].classList).toContain('selected');
  });

  it('should allow selecting Fog of War mode', () => {
    const cards = fixture.nativeElement.querySelectorAll('.order-card');
    cards[2].click();
    fixture.detectChanges();

    expect(component.selectedMode()).toBe('fog_of_war');
    expect(cards[2].classList).toContain('selected');
  });

  it('should allow selecting Total War mode', () => {
    const cards = fixture.nativeElement.querySelectorAll('.order-card');
    cards[3].click();
    fixture.detectChanges();

    expect(component.selectedMode()).toBe('total_war');
    expect(cards[3].classList).toContain('selected');
  });

  it('should confirm orders and close dialog with selected mode', () => {
    const selectSpy = spyOn(progressionService, 'selectCampaignOrders').and.callThrough();

    component.selectMode('fog_of_war');
    component.confirmOrders();

    expect(selectSpy).toHaveBeenCalledWith('fog_of_war');
    expect(dialogRefSpy.close).toHaveBeenCalledWith('fog_of_war');
    expect(progressionService.activeCampaignMode()).toBe('fog_of_war');
    expect(progressionService.isFogOfWar()).toBeTrue();
  });
});
