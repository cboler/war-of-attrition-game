import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-indicator"
         [class.visible]="visible()"
         [class.type-click]="type() === 'click'"
         [class.type-select]="type() === 'select'"
         [class.type-challenge]="type() === 'challenge'">
      
      <div class="indicator-content">
        @if (type() === 'click') {
          <div class="click-icon">👆</div>
          <div class="action-text">{{ message() || 'Click to continue' }}</div>
        }
        
        @if (type() === 'select') {
          <div class="select-icon">👈</div>
          <div class="action-text">{{ message() || 'Select a card' }}</div>
        }
        
        @if (type() === 'challenge') {
          <div class="challenge-icon">⚔️</div>
          <div class="action-text">{{ message() || 'Challenge available!' }}</div>
        }
      </div>
      
      <div class="glow-effect"></div>
    </div>
  `,
  styleUrl: './action-indicator.component.scss'
})
export class ActionIndicatorComponent {
  visible = input<boolean>(false);
  type = input<'click' | 'select' | 'challenge'>('click');
  message = input<string | null>(null);
}