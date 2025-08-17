import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-bar-container">
      <div class="health-bar-label">
        <span>{{ label() }}</span>
        <span class="card-count">{{ current() }}/{{ maximum() }}</span>
      </div>
      
      <div class="health-bar-track">
        <div class="health-bar-fill" 
             [class.green]="healthColor() === 'green'"
             [class.yellow]="healthColor() === 'yellow'"
             [class.orange]="healthColor() === 'orange'"
             [class.red]="healthColor() === 'red'"
             [style.width.%]="healthPercentage()">
        </div>
        
        @if (inDanger() > 0) {
          <div class="health-bar-danger"
               [style.width.%]="dangerPercentage()"
               [style.right.%]="100 - healthPercentage()">
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './health-bar.component.scss'
})
export class HealthBarComponent {
  label = input<string>('Player');
  current = input<number>(26);
  maximum = input<number>(26);
  inDanger = input<number>(0); // Cards currently at risk

  protected healthPercentage = computed(() => {
    const max = this.maximum();
    const curr = this.current();
    return max > 0 ? (curr / max) * 100 : 0;
  });

  protected dangerPercentage = computed(() => {
    const max = this.maximum();
    const danger = this.inDanger();
    return max > 0 ? Math.min(100, (danger / max) * 100) : 0;
  });

  protected healthColor = computed(() => {
    const percentage = this.healthPercentage();
    
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  });
}