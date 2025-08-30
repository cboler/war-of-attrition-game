# Game Component - Agent Documentation

## Purpose
The Game component is the main game interface that orchestrates the complete War of Attrition game experience. It manages the game board, handles user interactions, coordinates with game services, and provides both real gameplay and demonstration modes.

## Component Architecture

### Component Structure
```typescript
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    GameBoardComponent,
    CardComponent
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit
```

### Key Features
- **Dual Mode Operation**: Supports both real gameplay and demo mode
- **Complete Game Flow**: Manages all game phases from setup to completion
- **Real-time UI Updates**: Uses Angular signals for reactive UI updates
- **Progress Integration**: Displays development progress alongside gameplay
- **Animation Coordination**: Manages card animations and visual effects
- **Accessibility**: Full keyboard navigation and screen reader support

## Game State Management

### Signal-Based State
The component uses Angular signals for reactive state management:

```typescript
// Core Game State
protected gameStats = signal<GameStats>(initialStats);
protected gameState = signal<GameState>(initialState);
protected gameMessage = signal<string>('Click your deck to begin!');

// Interactive State
protected challengeAvailable = signal<boolean>(false);
protected canPlayerAct = signal<boolean>(true);
protected showChallengePrompt = signal<boolean>(false);
protected challengeCard = signal<Card | null>(null);

// Animation State
protected playerCardAnimation = signal<AnimationType | null>(null);
protected opponentCardAnimation = signal<AnimationType | null>(null);
protected playerHealthDamageAnimation = signal<boolean>(false);
protected opponentHealthDamageAnimation = signal<boolean>(false);

// Battle State
protected battleCards = signal<Card[]>([]);
protected opponentBattleCards = signal<Card[]>([]);
protected battlePhase = signal<'setup' | 'selection' | 'resolution'>('setup');
protected showBattleUI = signal<boolean>(false);
```

### Computed Properties
Reactive UI values derived from service state:

```typescript
// Card counts from GameStateService
protected playerCardCount = computed(() => this.gameStateService.playerCardCount());
protected opponentCardCount = computed(() => this.gameStateService.opponentCardCount());
protected discardedCardCount = computed(() => this.gameStateService.discardedCardCount());

// Game phase and status
protected currentPhase = computed(() => this.gameStateService.currentPhase());
protected gameWinner = computed(() => this.gameStateService.winner());
protected isGameOver = computed(() => this.gameStateService.isGameOver());
```

## Service Integration

### Core Service Dependencies
- **GameStateService**: Central game state and data management
- **GameControllerService**: High-level game flow orchestration
- **TurnResolutionService**: Turn logic and game rules enforcement
- **ProgressService**: Development progress tracking and demo integration
- **SettingsService**: User preferences and game configuration

### Service Method Usage
```typescript
// Game actions
handlePlayerDeckClick() {
  this.gameControllerService.handleDeckClick();
}

handleChallengeDecision(accept: boolean) {
  this.gameControllerService.handleChallenge(accept);
}

handleBattleCardSelection(card: Card) {
  this.gameControllerService.handleBattleCardSelection(card);
}

// State queries
getCurrentCards() {
  return this.gameStateService.getCurrentTurnCards();
}
```

## Game Flow Management

### Turn Phases
1. **Setup Phase**: Initialize decks and prepare game
2. **Normal Phase**: Standard card comparison
3. **Challenge Phase**: Handle challenge decisions
4. **Battle Phase**: Manage battle card selection
5. **Resolution Phase**: Apply turn results and update state
6. **Game Over Phase**: Handle win conditions and cleanup

### User Interaction Flow
```typescript
Player Action → Component Method → GameControllerService → Core Services → State Update → UI Refresh
```

### Animation Coordination
The component manages complex animation sequences:
- Card slide animations from deck to play area
- Card flip animations for reveals
- Battle clash animations for dramatic effect
- Health bar damage animations
- Card fall-away animations for discarded cards

## Demo Mode Integration

### Dual Mode Operation
```typescript
protected showOldDemo = signal<boolean>(false);
protected showGameBoard = signal<boolean>(true);

ngOnInit(): void {
  if (this.showOldDemo()) {
    this.runDemo();
  }
}

runDemo(): void {
  const log = this.gameDemoService.runGameDemo();
  this.demoLog.set(log);
}
```

### Progress Display
The component integrates with ProgressService to show:
- Current development milestone
- Completed features list
- Test metrics and coverage
- Next development priorities

## UI Template Structure

### Game Board Layout
```html
<div class="game-container">
  <!-- Demo Mode Toggle -->
  <div class="demo-controls" *ngIf="!isProduction">
    <button (click)="toggleDemo()">Toggle Demo</button>
  </div>

  <!-- Main Game Board -->
  <app-game-board 
    *ngIf="showGameBoard()"
    [playerCardCount]="playerCardCount()"
    [opponentCardCount]="opponentCardCount()"
    [gameMessage]="gameMessage()"
    [canPlayerAct]="canPlayerAct()"
    (playerDeckClick)="handlePlayerDeckClick()">
    
    <!-- Active Cards Display -->
    <div class="active-cards">
      <app-card 
        *ngIf="currentPlayerCard()"
        [card]="currentPlayerCard()!"
        [animationState]="playerCardAnimation()"
        [glow]="getPlayerCardGlow()">
      </app-card>
      
      <app-card 
        *ngIf="currentOpponentCard()"
        [card]="currentOpponentCard()!"
        [animationState]="opponentCardAnimation()"
        [glow]="getOpponentCardGlow()">
      </app-card>
    </div>

    <!-- Challenge UI -->
    <div class="challenge-section" *ngIf="showChallengePrompt()">
      <div class="challenge-prompt">
        <p>{{ getChallengeMessage() }}</p>
        <div class="challenge-actions">
          <button (click)="handleChallengeDecision(true)">Accept Challenge</button>
          <button (click)="handleChallengeDecision(false)">Decline</button>
        </div>
      </div>
    </div>

    <!-- Battle UI -->
    <div class="battle-section" *ngIf="showBattleUI()">
      <!-- Battle card selection interface -->
    </div>
    
  </app-game-board>

  <!-- Demo Log Display -->
  <div class="demo-log" *ngIf="showOldDemo()">
    <div *ngFor="let entry of demoLog()">{{ entry }}</div>
  </div>
</div>
```

## Styling and Animations

### Component Styling
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Theme Integration**: Light and dark theme support
- **Animation Classes**: CSS classes for smooth card animations
- **Material Design**: Angular Material components with custom styling

### Animation Management
```scss
.card {
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &.animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }
  
  &.animate-flip {
    animation: flip 0.4s ease-in-out;
  }
  
  &.animate-clash-win {
    animation: clashWin 0.6s ease-out;
  }
}

@keyframes slideIn {
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## Error Handling and Recovery

### Error States
- Invalid game state detection
- Service communication failures
- Animation timing issues
- User interaction conflicts

### Recovery Mechanisms
```typescript
handleGameError(error: any) {
  console.error('Game error:', error);
  this.gameMessage.set('Game error occurred. Restarting...');
  this.restartGame();
}

restartGame() {
  this.gameStateService.startNewGame();
  this.resetAnimations();
  this.gameMessage.set('Click your deck to begin!');
}
```

## Testing Integration

### Component Testing
- Unit tests for all component methods
- Integration tests with service mocks
- UI interaction testing
- Animation state testing

### Test Coverage
The component is part of the comprehensive test suite with 159 passing tests covering:
- Game flow scenarios
- User interaction patterns
- Error conditions
- Edge cases

## Performance Considerations

### Optimization Strategies
- **OnPush Change Detection**: Component uses OnPush for optimal performance
- **Signal-Based Reactivity**: Automatic optimization of UI updates
- **Animation Efficiency**: GPU-accelerated CSS animations
- **Memory Management**: Proper cleanup of subscriptions and timers

### Mobile Performance
- Touch-optimized interactions
- Reduced animation complexity on mobile
- Efficient image loading for card graphics
- Responsive layout optimization

## Accessibility Features

### Screen Reader Support
- Comprehensive ARIA labels for all game elements
- Live regions for game state announcements
- Descriptive alt text for visual elements

### Keyboard Navigation
- Full keyboard accessibility for all interactions
- Logical tab order through game elements
- Keyboard shortcuts for common actions

### Visual Accessibility
- High contrast mode support
- Scalable text and interface elements
- Color-blind friendly card indicators
- Reduced motion preferences honored

## Integration Points

### Parent Application
- Routes from main app routing
- Integrates with app-wide theme system
- Shares navigation with settings component

### External Services
- Uses game services for all game logic
- Integrates with progress tracking
- Connects to settings for user preferences

## Future Extensibility

### Planned Enhancements
- Enhanced animation system with more visual effects
- Tournament mode with multiple games
- Statistics tracking and analysis
- Social features and sharing

### Architecture Support
- Component architecture supports easy feature additions
- Service-based design enables clean integration
- Signal-based state management supports complex features
- Modular design allows independent component updates