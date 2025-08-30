# Core Services - Agent Documentation

## Purpose
This directory contains the core game logic services that implement the War of Attrition card game engine. These services handle all game mechanics, rules enforcement, and state management using Angular's dependency injection and signals for reactive state management.

## Key Services

### `card-comparison.service.ts`
**Purpose**: Implements card comparison logic with game-specific rules

**Key Features**:
- `ComparisonResult` enum: PLAYER_WINS, OPPONENT_WINS, TIE
- `compareCards()`: Main comparison method implementing game rules
- Special rule implementation: 2 beats Ace (only exception to standard ranking)
- Standard value-based comparison for all other matchups

**Design Notes**:
- Centralized card comparison logic ensures consistent rule enforcement
- Handles the unique Ace vs 2 rule that defines the game's strategy
- Pure comparison logic with no side effects
- Returns enum values for type-safe result handling

**Tests**: Comprehensive test coverage in `card-comparison.service.spec.ts` covering all edge cases and special rules

### `game-state.service.ts`
**Purpose**: Central game state management using Angular signals

**Key Features**:
- **Signal-based State**: All game state managed through Angular signals for reactivity
- **Deck Management**: Separate red/black decks for player/opponent
- **Turn Tracking**: Turn counter, active turn state, and phase management
- **Computed Values**: Reactive card counts and game statistics
- **Public API**: Methods for state updates and queries

**Signals**:
- `playerDeck`, `opponentDeck`: Deck states with automatic shuffling
- `gamePhase`: Current phase (SETUP, NORMAL, CHALLENGE, BATTLE, GAME_OVER)
- `activeTurn`: Current turn state with cards and battle data
- `discardPile`: All discarded cards
- `winner`, `canChallenge`, `lastResult`: Game status indicators

**Methods**:
- `startNewGame()`: Initialize fresh game state
- `drawCards()`: Draw cards for both players
- `updateGamePhase()`: Phase transition management
- `addToDiscardPile()`: Discard card management
- State query methods for components

**Design Notes**:
- Uses Angular signals for automatic UI updates
- Immutable state updates through signal methods
- Computed properties for derived state
- Complete game state encapsulation

### `turn-resolution.service.ts`
**Purpose**: Orchestrates turn resolution and game flow

**Key Features**:
- `TurnResult` interface: Complete turn outcome data
- `resolveTurn()`: Main turn resolution with all possible outcomes
- `resolveChallenge()`: Challenge system implementation
- `resolveBattle()`: Battle mechanics with card selection
- `determineWinner()`: End-game condition checking

**Turn Flow**:
1. **Normal Turn**: Compare cards, determine winner, handle outcomes
2. **Challenge Phase**: Allow losing player to challenge with additional card
3. **Battle Phase**: Handle tied cards with 3-card face-down selection
4. **Resolution**: Update decks, discard pile, and game state

**Integration**:
- Uses `CardComparisonService` for all card comparisons
- Uses `OpponentAIService` for AI decision making
- Updates `GameStateService` with turn outcomes
- Returns complete `TurnResult` for UI updates

**Design Notes**:
- Handles all game flow complexity in a single service
- Maintains game rule integrity through service composition
- Provides detailed turn results for UI feedback
- Supports all game phases including nested battles

### `opponent-ai.service.ts`
**Purpose**: AI decision making for opponent actions

**Key Features**:
- `shouldChallenge()`: AI challenge decision logic
- `selectBattleCard()`: AI battle card selection
- Configurable difficulty and strategy patterns
- Realistic timing simulation for better UX

**AI Strategy**:
- Challenge decisions based on card strength and deck status
- Battle card selection with strategic considerations
- Randomization to prevent predictable patterns
- Adaptive difficulty based on game state

### `settings.service.ts`
**Purpose**: Application settings and user preferences management

**Key Features**:
- Theme persistence (light/dark mode)
- Game configuration options
- Settings import/export functionality
- Local storage integration
- Settings validation and migration

**Settings Categories**:
- **UI Preferences**: Theme, animations, sound
- **Game Options**: Difficulty, speed, auto-actions
- **Accessibility**: High contrast, reduced motion
- **Data Management**: Export/import game statistics

## Service Architecture

### Dependency Flow
```
TurnResolutionService (orchestrator)
├── CardComparisonService (rules)
├── OpponentAIService (AI decisions)
└── GameStateService (state management)
```

### Signal Integration
- All services use Angular signals for reactive state management
- Computed properties automatically update when dependencies change
- Services emit state changes that trigger UI updates
- No manual change detection required

### Testing Strategy
- **Unit Tests**: Each service thoroughly tested in isolation
- **Integration Tests**: Service interactions tested together
- **Mock Services**: Clean separation allows easy mocking
- **Test Coverage**: 159 tests currently passing with comprehensive coverage

## Usage Guidelines

### For Game Logic Development
1. **State Updates**: Always use GameStateService methods, never direct signal mutation
2. **Card Comparisons**: Use CardComparisonService for all card value decisions
3. **Turn Flow**: Use TurnResolutionService for complex game flow logic
4. **AI Behavior**: Configure OpponentAIService for AI decision making

### For Component Integration
1. **Subscribe to Signals**: Use computed() to derive UI state from service signals
2. **Action Methods**: Call service methods for game actions (draw, challenge, etc.)
3. **Error Handling**: Services provide error states for UI feedback
4. **Performance**: Services use OnPush change detection compatible patterns

### For Testing
1. **Service Mocking**: Each service can be independently mocked
2. **State Testing**: Use service methods to set up test scenarios
3. **Integration Testing**: Verify service interactions in realistic scenarios
4. **Edge Cases**: Services handle all edge cases (empty decks, invalid states)

## Dependencies
- **Models**: All services depend on core models for type safety
- **Angular**: Uses Angular's dependency injection and signals
- **External**: No external dependencies (pure Angular services)

## Integration Points
- **Components**: All game components depend on these services
- **State Management**: Central source of truth for all game state
- **Testing**: Comprehensive test suite validates all service interactions
- **UI Updates**: Signal-based reactivity drives automatic UI updates

## Performance Considerations
- Signal-based architecture ensures optimal change detection
- Services use OnPush compatible patterns
- Computed values are cached and only recalculated when dependencies change
- No memory leaks through proper signal lifecycle management

## Future Extensibility
- Service architecture supports easy addition of new game features
- AI service can be enhanced with more sophisticated strategies
- Settings service supports new configuration options
- State service can be extended for new game phases or mechanics