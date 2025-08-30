# Application Services - Agent Documentation

## Purpose
This directory contains high-level application services that orchestrate user interactions, manage game flow, and provide application-wide functionality. These services sit above the core game engine and handle user interface concerns, progress tracking, and demonstration features.

## Key Services

### `game-controller.service.ts`
**Purpose**: High-level game flow orchestration and UI state management

**Key Features**:
- **Game Flow Control**: Manages player actions and game state transitions
- **UI State Management**: Controls game messages, prompts, and interactive elements
- **Action Coordination**: Coordinates between user actions and core game services
- **Challenge System**: Manages challenge prompts and card display
- **Battle System**: Orchestrates battle phase UI and card selection

**Signals**:
- `gameMessage`: Current game status message for UI display
- `challengeAvailable`: Whether player can challenge
- `showChallenge`: Whether to show challenge prompt UI
- `challengeCard`: Current challenge card being displayed
- `battleCards`: Player's battle cards for selection
- `battlePhase`: Current battle phase (setup, selection, resolution)
- `canPlayerAct`: Whether player can take actions

**Key Methods**:
- `startGame()`: Initialize new game and reset all state
- `handlePlayerDeckClick()`: Process player's deck click action
- `handleChallenge()`: Process challenge accept/decline
- `handleBattleCardSelection()`: Process battle card selection
- `updateGameMessage()`: Update UI message based on game state

**Design Notes**:
- Acts as a facade for complex game interactions
- Manages UI state separate from core game logic
- Provides simplified API for components
- Handles timing and animation coordination

### `progress.service.ts`
**Purpose**: Centralized development progress tracking and reporting

**Key Features**:
- **Progress Data Management**: Single source of truth for development status
- **Milestone Tracking**: Detailed milestone and task tracking
- **Test Metrics**: Integration with test results and coverage
- **Demo Integration**: Generates demo logs with progress information
- **Live Progress Display**: Provides data for in-app progress display

**Data Structure**:
```typescript
interface ProgressData {
  project: { name, version, type };
  currentMilestone: { number, name, status, emoji };
  milestones: Array<{ number, name, status, progress, items }>;
  testMetrics: { totalTests, passingTests, coverage };
  nextSteps: { immediate, priority };
  features: { implemented, nextMilestone };
}
```

**Methods**:
- `getProgressData()`: Returns complete progress information
- `getCurrentMilestone()`: Gets current milestone details
- `getMilestones()`: Returns all milestone information
- `getCompletedMilestone(number)`: Gets specific completed milestone
- `getImplementedFeatures()`: Lists all implemented features
- `getTestMetrics()`: Returns current test metrics
- `generateDemoLog()`: Creates demo log with progress data

**Design Notes**:
- Centralizes all progress tracking to ensure consistency
- Eliminates outdated progress information in multiple locations
- Provides structured data for documentation and reporting
- Integrates with demo system for live progress display

### `game-demo.service.ts`
**Purpose**: Demonstration and simulation functionality

**Key Features**:
- **Game Simulation**: Runs automated game demonstrations
- **Progress Integration**: Shows current development status in demos
- **Feature Showcase**: Demonstrates implemented game features
- **Development Validation**: Validates game logic through automated play

**Demo Features**:
- Automated game progression
- Feature demonstration mode
- Progress reporting integration
- Development milestone validation

**Methods**:
- `runGameDemo()`: Execute complete game demonstration
- `runFeatureDemo()`: Demonstrate specific game features
- `generateProgressReport()`: Create progress-integrated demo log

## Service Architecture

### Layer Hierarchy
```
Application Services (this directory)
├── GameControllerService (UI orchestration)
├── ProgressService (development tracking)
└── GameDemoService (demonstration)
    │
    └── Core Services (../core/services)
        ├── GameStateService
        ├── TurnResolutionService
        ├── CardComparisonService
        └── OpponentAIService
```

### Dependency Flow
- **GameControllerService**: Depends on all core services for game logic
- **ProgressService**: Independent service providing development data
- **GameDemoService**: Uses ProgressService and core game services

### Signal Integration
- Application services use signals for UI state management
- Coordinate with core service signals for complete reactivity
- Provide computed properties for complex UI derivations
- Enable automatic UI updates without manual change detection

## Usage Guidelines

### For Game Component Development
1. **Use GameControllerService**: Primary interface for game actions
2. **Subscribe to Signals**: Use service signals for UI state binding
3. **Action Methods**: Call service methods for user interactions
4. **State Queries**: Use service getters for current state information

### For Progress Tracking
1. **Update ProgressService**: Modify progress data as features are completed
2. **Document Milestones**: Ensure milestone progress reflects actual implementation
3. **Test Integration**: Update test metrics when adding/removing tests
4. **Feature Documentation**: Update implemented features list

### For Demonstration
1. **Demo Integration**: Use GameDemoService for feature demonstrations
2. **Progress Display**: Leverage ProgressService for live status
3. **Validation**: Use demos to validate game logic implementation

## Integration Points

### Component Integration
- **Game Component**: Primary consumer of GameControllerService
- **Settings Component**: May use ProgressService for development info
- **Demo Mode**: Components can toggle demo mode through services

### Core Service Integration
- GameControllerService orchestrates core services for user actions
- Maintains separation between UI concerns and game logic
- Provides error handling and user feedback for core service operations

### Testing Integration
- Application services are fully tested with comprehensive coverage
- Mock core services for isolated application service testing
- Integration tests verify service coordination

## Performance Considerations
- Services use signal-based reactivity for optimal performance
- Lazy loading of demo and progress data when needed
- Efficient state management with minimal unnecessary computations
- OnPush compatible patterns for optimal change detection

## Future Extensibility
- GameControllerService can be extended for new UI features
- ProgressService supports additional milestone and feature tracking
- Demo service can incorporate new demonstration modes
- Architecture supports additional application-level services

## Error Handling
- Services provide error states and recovery mechanisms
- User-friendly error messages for UI display
- Graceful degradation when core services encounter issues
- Comprehensive error logging for development debugging