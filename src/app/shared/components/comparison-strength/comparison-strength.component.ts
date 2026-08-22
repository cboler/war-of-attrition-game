import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

export type ComparisonStrengthState = 'ready' | 'winner' | 'defeated' | 'tie';

export interface ComparisonStrengthView {
  readonly cardId: string;
  readonly base: number;
  readonly current: number;
  readonly damage: number;
  readonly state: ComparisonStrengthState;
  readonly specialOverride: boolean;
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
      [style.--comparison-strength]="view().current"
      [attr.aria-label]="accessibleSummary()"
      role="status"
    >
      <span class="strength-label">Power</span>
      <strong class="strength-value" aria-hidden="true"></strong>
      <span class="strength-base" aria-hidden="true">/ {{ view().base }}</span>
      @if (view().damage < 0) {
        <span class="damage-number" aria-hidden="true">{{ view().damage }}</span>
      }
      @if (view().specialOverride) {
        <span class="special-rule">2 defeats Ace</span>
      }
    </div>
  `,
  styleUrl: './comparison-strength.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonStrengthComponent {
  protected readonly settings = inject(SettingsService);
  readonly view = input.required<ComparisonStrengthView>();

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
}
