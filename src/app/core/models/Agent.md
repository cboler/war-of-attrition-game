# Core Models - Agent Documentation

## Purpose
This directory contains the core data models and TypeScript interfaces that define the fundamental data structures for the War of Attrition card game. These models form the foundation of the game's type system and ensure type safety throughout the application.

## Key Files

### `card.model.ts`
**Purpose**: Defines the card system with complete type safety

**Key Components**:
- `Suit` enum: HEARTS, DIAMONDS, CLUBS, SPADES
- `Rank` enum: ACE through TWO (with proper string values)
- `Card` interface: Immutable card contract with id, suit, rank, value, isRed
- `CardImpl` class: Implementation of Card interface with automatic value calculation

**Design Notes**:
- Cards are immutable by design (readonly properties)
- Automatic value calculation: ACE=14, KING=13, QUEEN=12, JACK=11, numbered cards by face value
- Color determination: Hearts/Diamonds are red, Clubs/Spades are black
- Unique ID generation: `${suit}-${rank}` format

**Tests**: Comprehensive tests in `card.model.spec.ts` covering value calculation, color determination, and immutability

### `deck.model.ts`
**Purpose**: Deck management with shuffling and color-specific deck creation

**Key Components**:
- `Deck` class: Main deck implementation with standard 52-card initialization
- `createRedDeck()`: Static method creating Hearts/Diamonds deck (26 cards)
- `createBlackDeck()`: Static method creating Clubs/Spades deck (26 cards)
- Shuffle, draw, peek, and utility methods

**Design Notes**:
- Supports both full standard deck and color-specific decks for game setup
- Immutable card operations (cards are never modified, only moved)
- Proper shuffling algorithm implementation
- Card counting and deck status methods

**Tests**: Comprehensive deck operations testing in `deck.model.spec.ts`

### `game-state.model.ts`
**Purpose**: Central game state management interfaces

**Key Components**:
- `GamePhase` enum: SETUP, NORMAL, CHALLENGE, BATTLE, GAME_OVER
- `PlayerType` enum: PLAYER, OPPONENT
- `GameStats` interface: Turn counting and card counts
- `ActiveTurn` interface: Current turn state with cards and battle data
- `GameState` interface: Complete game state container

**Design Notes**:
- Supports all game phases including complex battle states
- Tracks both active cards and battle card selections
- Provides turn-by-turn statistics
- Designed for Angular signals integration

### `settings.model.ts`
**Purpose**: Application settings and user preferences

**Key Components**:
- Theme settings (light/dark mode)
- Game configuration options
- User preference storage interfaces

## Usage Guidelines

### For New Features
1. **Always use the Card interface**: Never create raw card objects
2. **Leverage type safety**: Use enums for suits, ranks, and game phases
3. **Maintain immutability**: Cards and core data should never be mutated
4. **Follow the data flow**: GameState → ActiveTurn → Cards

### For Game Logic
1. **Card comparisons**: Use the card's `value` property for numeric comparisons
2. **Color checking**: Use the `isRed` property rather than checking suits manually
3. **Phase transitions**: Always use the GamePhase enum values
4. **State updates**: Update game state through service methods, not direct mutation

### Testing
- All models have comprehensive test coverage
- Tests verify immutability, proper value calculation, and edge cases
- Use existing test patterns when adding new model features

## Dependencies
- No external dependencies (pure TypeScript)
- Models are imported by services and components throughout the application
- Core foundation for the entire game engine

## Integration Points
- **Services**: All game logic services depend on these models
- **Components**: UI components use these models for data binding
- **Tests**: Test utilities and mocks are built around these interfaces
- **State Management**: Angular signals are typed using these interfaces

## Future Considerations
- Models are designed to be extensible for new game features
- Type-safe approach ensures any model changes will be caught at compile time
- Immutable design supports undo/redo functionality if needed
- Clear separation enables easy testing and mocking