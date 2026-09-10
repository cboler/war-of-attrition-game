import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SupportComponent } from './support.component';
import { environment as productionEnvironment } from '../../../environments/environment.prod';

describe('SupportComponent', () => {
  let component: SupportComponent;
  let fixture: ComponentFixture<SupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportComponent, NoopAnimationsModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create Support component and display direct support email and FAQ without auth', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('Player Support');
    expect(compiled.textContent).toContain('requiredcheese@gmail.com');
    expect(compiled.textContent).toContain(`Version: ${component.appVersion}`);
    expect(compiled.textContent).toContain('never forces a reload during an active War');
    expect(compiled.textContent).not.toContain('applies it on your next match');
  });

  it('builds the hosted Support version from the authoritative 4.2.6 release identity', () => {
    expect(productionEnvironment.appVersion).toBe('4.2.6');
  });
});
