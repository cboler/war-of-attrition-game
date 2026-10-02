import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TermsComponent } from './terms.component';

describe('TermsComponent', () => {
  let fixture: ComponentFixture<TermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    fixture.detectChanges();
  });

  it('renders the public EULA with as-is warranty disclaimer and GPL carve-out', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('End User License Agreement');
    expect(compiled.textContent).toContain('"AS IS" AND "AS AVAILABLE"');
    expect(compiled.textContent).toContain('IMPLIED WARRANTIES OF MERCHANTABILITY');
    expect(compiled.textContent).toContain('GNU General Public License');
    expect(compiled.textContent).toContain('the GPL controls');
  });
});
