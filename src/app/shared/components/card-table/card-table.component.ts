import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card-table" aria-label="Card table">
      <div class="rail rail-top"><ng-content select="[table-seat-top]" /></div>
      <div class="rail rail-left"><ng-content select="[table-seat-left]" /></div>
      <div class="table-center"><ng-content select="[table-center]" /></div>
      <div class="rail rail-right"><ng-content select="[table-seat-right]" /></div>
      <div class="rail rail-bottom"><ng-content select="[table-seat-bottom]" /></div>
    </section>
  `,
  styleUrl: './card-table.component.scss'
})
export class CardTableComponent {}
