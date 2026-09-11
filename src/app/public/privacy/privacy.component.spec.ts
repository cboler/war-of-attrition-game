import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PrivacyComponent } from './privacy.component';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create Privacy Policy component and render public policy without authentication', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('Privacy Policy');
    expect(compiled.textContent).toContain('War of Attrition');
    expect(compiled.textContent).toContain('contains no advertising SDK');
    expect(compiled.textContent).toContain('displays no ads');
    expect(compiled.textContent).toContain('When that verified connection is unavailable');
    expect(compiled.textContent).toContain('completed-War Game Stats');
    expect(compiled.textContent).not.toContain('Leaderboards');
    expect(compiled.textContent).toContain('Hall of Valor service history');
    expect(compiled.textContent).toContain('Campaign progression, dossiers, tokens');
    expect(compiled.textContent).not.toContain('Reset Career Records');
  });
});
