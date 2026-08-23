import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

export type ComparisonStrengthState = 'ready' | 'winner' | 'defeated' | 'tie';

export interface ComparisonStrengthView {
  readonly cardId: string;
  readonly base: number;
  readonly current: number;
  readonly damage: number;
  readonly state: ComparisonStrengthState;
  readonly specialOverride: boolean;
  /** Revealed comparison facts only; hidden Battle cards are never represented here. */
  readonly opposingBase?: number;
  readonly opposingRank?: string;
}

@Component({
  selector: 'app-comparison-strength',
  template: `
    <div
      class="comparison-strength"
      [class.is-ready]="view().state === 'ready'"
      [class.is-winner]="view().state === 'winner'"
      [class.is-defeated]="view().state === 'defeated'"
      [class.is-tie]="view().state === 'tie'"
      [class.is-special]="view().specialOverride"
      [class.motion-disabled]="!settings.autoPlayAnimations()"
      (mouseenter)="setInspectorHovered(true)"
      (mouseleave)="setInspectorHovered(false)"
    >
      <button
        type="button"
        class="power-badge"
        [attr.aria-label]="accessibleSummary()"
        [attr.aria-describedby]="inspectorVisible() ? inspectorId() : null"
        [attr.aria-expanded]="inspectorVisible()"
        (click)="toggleInspector()"
        (focus)="setInspectorFocused(true)"
        (blur)="setInspectorFocused(false)"
      >
        <span class="strength-label">Power</span>
        <strong class="strength-value" aria-hidden="true">
          <span class="strength-value-text">{{ view().current }}</span>
        </strong>
        @if (view().damage < 0) {
          <span class="damage-number" aria-hidden="true">{{ view().damage }}</span>
        }
      </button>

      @if (inspectorVisible()) {
        <section class="power-inspector" [id]="inspectorId()" role="tooltip">
          @if (view().specialOverride) {
            <p><span>Base Power:</span> {{ view().base }}</p>
            <p><span>Opponent:</span> {{ view().opposingRank }} ({{ view().opposingBase }})</p>
            <p class="inspector-rule">Special Rule</p>
            <p>2 defeats Ace</p>
            <p>Normal Power comparison is overridden.</p>
          } @else if (view().state === 'ready') {
            <p><span>Base Power:</span> {{ view().base }}</p>
            <p>Awaiting comparison</p>
          } @else if (view().state === 'tie') {
            <p>{{ view().base }} vs {{ view().opposingBase }}</p>
            <p>Equal Power -> Battle</p>
          } @else if (view().state === 'winner') {
            <p><span>Base Power:</span> {{ view().base }}</p>
            <p><span>Opposing Power:</span> {{ view().opposingBase }}</p>
            <p>{{ view().base }} - {{ view().opposingBase }} = {{ view().current }} remaining</p>
          } @else {
            <p><span>Base Power:</span> {{ view().base }}</p>
            <p><span>Opposing Power:</span> {{ view().opposingBase }}</p>
            <p>{{ view().base }} - {{ view().opposingBase }} -> defeated</p>
          }
        </section>
      }
    </div>
  `,
  styleUrl: './comparison-strength.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeInspector()',
  },
})
export class ComparisonStrengthComponent {
  protected readonly settings = inject(SettingsService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  readonly view = input.required<ComparisonStrengthView>();
  protected readonly inspectorHovered = signal(false);
  protected readonly inspectorFocused = signal(false);
  protected readonly inspectorPinned = signal(false);
  protected readonly inspectorVisible = computed(
    () => this.inspectorHovered() || this.inspectorFocused() || this.inspectorPinned(),
  );
  protected readonly inspectorId = computed(() => `power-inspector-${this.view().cardId}`);

  protected readonly accessibleSummary = computed(() => {
    const value = this.view();
    const outcome =
      value.state === 'defeated'
        ? 'defeated at zero'
        : value.state === 'winner'
          ? `winner with ${value.current} remaining`
          : value.state === 'tie'
            ? 'tied at zero'
            : `ready at ${value.current}`;
    return `Comparison power ${value.base}; ${outcome}${value.specialOverride ? '; special rule: 2 defeats Ace' : ''}.`;
  });

  protected setInspectorHovered(hovered: boolean): void {
    this.inspectorHovered.set(hovered);
  }

  protected setInspectorFocused(focused: boolean): void {
    this.inspectorFocused.set(focused);
  }

  protected toggleInspector(): void {
    this.inspectorPinned.update((pinned) => !pinned);
  }

  protected closeInspector(): void {
    this.inspectorPinned.set(false);
    this.inspectorFocused.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (target && !this.hostElement.nativeElement.contains(target as Node)) {
      this.inspectorPinned.set(false);
    }
  }
}
