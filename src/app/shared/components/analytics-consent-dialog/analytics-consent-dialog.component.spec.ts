import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AnalyticsConsentDialogComponent } from './analytics-consent-dialog.component';

describe('AnalyticsConsentDialogComponent', () => {
  let fixture: ComponentFixture<AnalyticsConsentDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AnalyticsConsentDialogComponent>>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [AnalyticsConsentDialogComponent, NoopAnimationsModule],
      providers: [provideRouter([]), { provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();
    fixture = TestBed.createComponent(AnalyticsConsentDialogComponent);
    fixture.detectChanges();
  });

  it('presents a clear accessible choice with no preselected or dismiss-to-grant control', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#analytics-consent-title')?.textContent).toContain(
      'Help improve Attrition',
    );
    expect(root.querySelector('#analytics-consent-description')?.textContent).toContain(
      'anonymous gameplay and app-usage statistics',
    );
    expect(root.querySelector('input')).toBeNull();

    (root.querySelector('.consent-decline') as HTMLButtonElement).click();
    expect(dialogRef.close).toHaveBeenCalledWith('denied');

    (root.querySelector('.consent-share') as HTMLButtonElement).click();
    expect(dialogRef.close).toHaveBeenCalledWith('granted');
  });
});
