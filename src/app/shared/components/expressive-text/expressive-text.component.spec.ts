import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExpressiveTextComponent } from './expressive-text.component';

describe('ExpressiveTextComponent', () => {
  let fixture: ComponentFixture<ExpressiveTextComponent>;
  let component: ExpressiveTextComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressiveTextComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressiveTextComponent);
    component = fixture.componentInstance;
  });

  it('renders complete text immediately when animate is false', () => {
    fixture.componentRef.setInput('text', 'Hello *world*!');
    fixture.componentRef.setInput('animate', false);
    fixture.detectChanges();

    const sr = fixture.nativeElement.querySelector('[role="status"]');
    expect(sr.textContent.trim()).toBe('Hello world!');

    const visible = fixture.nativeElement.querySelector('.expressive-text-content');
    expect(visible.textContent.trim()).toBe('Hello world!');

    const italic = visible.querySelector('.dialogue-italic');
    expect(italic).toBeTruthy();
    expect(italic.textContent).toBe('world');
  });

  it('renders complete text immediately when motionDisabled is true even if animate is true', () => {
    fixture.componentRef.setInput('text', '**Charge!**');
    fixture.componentRef.setInput('animate', true);
    fixture.componentRef.setInput('motionDisabled', true);
    fixture.detectChanges();

    const visible = fixture.nativeElement.querySelector('.expressive-text-content');
    expect(visible.textContent.trim()).toBe('Charge!');

    const bold = visible.querySelector('.dialogue-bold');
    expect(bold).toBeTruthy();
    expect(bold.textContent).toBe('Charge!');
  });

  it('animates character by character when animate is true and motion is enabled', fakeAsync(() => {
    fixture.componentRef.setInput('text', 'Hi.');
    fixture.componentRef.setInput('animate', true);
    fixture.componentRef.setInput('motionDisabled', false);
    fixture.componentRef.setInput('commanderId', 'analyst'); // fast 24ms
    fixture.detectChanges();

    const visible = fixture.nativeElement.querySelector('.expressive-text-content');
    // Initially 0 or 1 char
    tick(25);
    fixture.detectChanges();
    expect(visible.textContent.length).toBeGreaterThanOrEqual(1);

    // After full duration
    tick(500);
    fixture.detectChanges();
    expect(visible.textContent.trim()).toBe('Hi.');
  }));

  it('fast-forwards on click during animation', fakeAsync(() => {
    fixture.componentRef.setInput('text', 'A much longer sentence for testing typewriter.');
    fixture.componentRef.setInput('animate', true);
    fixture.componentRef.setInput('motionDisabled', false);
    fixture.detectChanges();

    tick(40);
    fixture.detectChanges();
    const visible = fixture.nativeElement.querySelector('.expressive-text-content');
    expect(visible.textContent.length).toBeLessThan('A much longer sentence for testing typewriter.'.length);

    // Simulate click
    visible.click();
    fixture.detectChanges();

    expect(visible.textContent.trim()).toBe('A much longer sentence for testing typewriter.');
  }));

  it('emits dismissed on click when already complete', () => {
    fixture.componentRef.setInput('text', 'Ready.');
    fixture.componentRef.setInput('animate', false);
    fixture.detectChanges();

    const dismissedSpy = jasmine.createSpy('dismissed');
    component.dismissed.subscribe(dismissedSpy);

    const visible = fixture.nativeElement.querySelector('.expressive-text-content');
    visible.click();

    expect(dismissedSpy).toHaveBeenCalled();
  });
});
