# Implementation Guidelines by Milestone

This document provides specific implementation guidance for each development milestone.

## Milestone 1: Foundation & Setup

### Issue 1.2: Basic Routing and Navigation
**Implementation Notes:**
- Add settings route to `app.routes.ts`
- Create settings component with basic structure
- Add navigation between game and settings views
- Ensure proper route guards if needed

### Issue 1.3: Theme System Implementation  
**Implementation Notes:**
- Extend existing theme toggle to persist selection
- Use localStorage or sessionStorage for persistence
- Create comprehensive light/dark theme CSS variables
- Apply theme to all Angular Material components
- Ensure theme toggle works across route changes

### Issue 1.4: Responsive Layout Foundation
**Implementation Notes:**
- Use Angular Flex Layout or CSS Grid/Flexbox
- Define breakpoints for mobile, tablet, desktop
- Test layout on various screen sizes
- Ensure touch-friendly interactions on mobile
- No horizontal scrolling on any device

## Milestone 2: Core Game Engine

### Implementation Architecture
```
src/app/
├── models/
│   ├── card.model.ts        # Card interface/class
│   ├── deck.model.ts        # Deck class with shuffle/draw
│   └── game-state.model.ts  # Game state interfaces
├── services/
│   ├── game-engine.service.ts    # Core game logic
│   ├── card-comparison.service.ts # Card comparison rules
│   └── game-state.service.ts     # State management
└── enums/
    ├── suit.enum.ts         # Card suits
    ├── rank.enum.ts         # Card ranks
    └── game-phase.enum.ts   # Game phases
```

### Issue 2.1: Card and Deck Models
**Key Requirements:**
- Card: suit, rank, value, color properties
- Deck: shuffle(), draw(), addCard(), count properties
- Separate red/black deck initialization
- Immutable card objects

**Example Structure:**
```typescript
interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
  readonly color: 'red' | 'black';
  readonly id: string;
}

class Deck {
  private cards = signal<Card[]>([]);
  
  shuffle(): void
  draw(): Card | null
  addCard(card: Card): void
  count = computed(() => this.cards().length)
}
```

### Issue 2.2: Game State Management
**Signal-Based State:**
```typescript
interface GameState {
  playerDeck: Card[];
  opponentDeck: Card[];
  playerActiveCards: Card[];
  opponentActiveCards: Card[];
  discardPile: Card[];
  currentTurn: number;
  gamePhase: GamePhase;
  winner: 'player' | 'opponent' | null;
}
```

## Milestone 3: Basic UI Components

### Component Structure
```
src/app/
├── components/
│   ├── game-board/          # Main game layout
│   ├── card/               # Individual card display
│   ├── health-bar/         # Health/card count bar
│   ├── deck/               # Deck representation
│   └── action-indicator/   # Blue glow effects
```

### Issue 3.1: Game Board Layout
**CSS Grid Layout:**
```scss
.game-board {
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  grid-template-columns: 1fr auto 1fr;
  height: 100vh;
  background: #0f5132; // Solitaire green
}

.opponent-area { grid-row: 1; }
.central-table { grid-row: 2; }
.player-area { grid-row: 3; }
```

### Issue 3.2: Card Component
**Features:**
- Displays rank and suit clearly
- Face-down state with backing pattern
- Hover effects for interactive cards
- Proper aspect ratio (2.5:3.5)
- Responsive sizing

### Issue 3.3: Health Bar Component
**Color Coding:**
- Green: 75-100% (19-26 cards)
- Yellow: 50-74% (13-18 cards)  
- Orange: 25-49% (7-12 cards)
- Red: 1-24% (1-6 cards)

**Animation Requirements:**
- Smooth transitions between colors
- "In danger" highlighting during turns
- Flash and "falling away" animation for damage

## Milestone 4: Game Mechanics Implementation

### Issue 4.1: Basic Turn Flow
**State Flow:**
1. Player clicks deck (if their turn)
2. Draw cards for both players
3. Compare card values
4. Determine winner
5. Apply resolution
6. Check win conditions
7. Prepare next turn

### Issue 4.2: Challenge System
**Implementation:**
- Trigger when player loses normal comparison
- Present challenge option with visual cue
- Draw additional card for challenger
- Compare new card vs original winner
- Redistribute all cards based on outcome

### Issue 4.3: Battle System
**Complex Logic:**
- Trigger on equal card values
- Each player places 3 cards face-down
- Player selects from opponent's face-down cards
- AI selects from player's face-down cards
- Compare selected cards
- Handle recursive battles (if selected cards also tie)
- Redistribute all battle cards to winner

### Issue 4.4: Game End Conditions
**Win/Loss Detection:**
- Player reaches 0 cards → Player loses
- Opponent reaches 0 cards → Player wins
- Insufficient cards for battle → Immediate loss
- Display clear win/loss message
- Provide "Play Again" option

## Milestone 5: Visual Polish & Animations

### Animation Library
Consider using Angular Animations API or a lightweight library like Animate.css.

### Key Animations:
1. **Card Draw**: Slide from deck to table
2. **Card Flip**: Reveal face-up card
3. **Card Clash**: Battle animation
4. **Card Discard**: Animate to discard pile
5. **Health Bar**: Damage and danger states

### Performance Considerations:
- Use CSS transforms for animations
- Leverage GPU acceleration
- Avoid layout-triggering properties
- Keep animations under 300ms for responsiveness

## Milestone 6: Settings & Customization

### Settings Service
```typescript
interface AppSettings {
  cardBacking: string;
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'light' | 'dark' | 'auto';
}
```

### Card Backing System
- Store backing options as CSS classes or image URLs
- Preview functionality in settings
- Apply only to player's cards
- Persist selection across games

## Milestone 7: Testing & Polish

### Testing Strategy
- **Unit Tests**: Game logic, services, pure functions
- **Component Tests**: UI components, user interactions  
- **Integration Tests**: Game flow, state management
- **E2E Tests**: Full game scenarios

### Performance Targets
- Initial load: <2 seconds
- Animation framerate: 60fps
- Memory usage: <50MB on mobile
- Bundle size: <500KB gzipped

### Accessibility Requirements
- Keyboard navigation for all interactions
- Screen reader support for game state
- High contrast mode compatibility
- ARIA labels for game elements
- Focus management during animations

## Development Tips

1. **Start Simple**: Implement basic functionality before adding polish
2. **Test Early**: Write tests as you implement features
3. **Mobile First**: Design for mobile, enhance for desktop
4. **Performance**: Profile regularly, optimize animations
5. **User Experience**: Prioritize clear feedback and intuitive interactions

Remember: Always reference `war-of-attrition-requirements.md` for the complete and authoritative requirements specification.