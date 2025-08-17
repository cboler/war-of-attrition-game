# War of Attrition - Development Milestones & Issues

This document outlines the development milestones and associated issues for the War of Attrition card game project. Each milestone represents a cohesive development phase with specific deliverables.

**📋 Progress Tracking**: Current milestone status and detailed progress information is centrally managed in `progress-data.json` and accessed via the `ProgressService`. This document provides the detailed breakdown and planning information.

> **For Current Status**: Refer to the central progress data in `.github/instructions/progress-data.json` or view the live progress in the running application.

## Milestone 1: Foundation & Setup 
**Goal**: Establish solid project foundation with basic navigation and PWA capabilities

### Issues for Milestone 1:

#### Issue 1.1: Project Infrastructure Setup
- **User Story**: As a developer, I want a properly configured Angular project with PWA capabilities so that the application can be installed on devices
- **Acceptance Criteria**:
  - Angular CLI project is properly configured
  - PWA service worker is functional
  - Application can be installed on supported devices
  - Build process generates optimized production builds
- **Status**: ✅ COMPLETED (Basic setup exists)

#### Issue 1.2: Basic Routing and Navigation
- **User Story**: As a player, I want intuitive navigation between game and settings so that I can access different parts of the application
- **Acceptance Criteria**:
  - Route structure supports game view and settings view
  - Navigation between views is seamless
  - Browser back/forward buttons work correctly
  - Default route loads the game view
- **Status**: 🔄 IN PROGRESS (Basic routing exists, needs settings route)

#### Issue 1.3: Theme System Implementation
- **User Story**: As a player, I want to toggle between light and dark themes so that I can personalize my visual experience
- **Acceptance Criteria**:
  - Light and dark theme CSS is properly defined
  - Theme toggle persists across sessions
  - All components respect the selected theme
  - Smooth transitions between themes
- **Status**: 🔄 IN PROGRESS (Basic toggle exists, needs persistence and full theming)

#### Issue 1.4: Responsive Layout Foundation
- **User Story**: As a player, I want the game to work properly on desktop, tablet, and mobile so that I can play anywhere
- **Acceptance Criteria**:
  - Application layout adapts to different screen sizes
  - Touch interactions work on mobile devices
  - Game remains playable on smallest supported screen size
  - No horizontal scrolling on any supported device
- **Status**: ❌ NOT STARTED

## Milestone 2: Core Game Engine
**Goal**: Implement the fundamental game logic and data structures

### Issues for Milestone 2:

#### Issue 2.1: Card and Deck Models
- **User Story**: As a developer, I want well-defined card and deck data structures so that game logic can be implemented reliably
- **Acceptance Criteria**:
  - Card interface/class with suit, rank, and value properties
  - Deck class with shuffle, draw, and management methods
  - Support for red (player) and black (opponent) deck separation
  - Proper TypeScript typing for all card-related data
- **Status**: ❌ NOT STARTED

#### Issue 2.2: Game State Management
- **User Story**: As a developer, I want centralized game state management so that the game can track turns, cards, and player status
- **Acceptance Criteria**:
  - Game state service using Angular signals or RxJS
  - Track player and opponent card counts
  - Track current turn number
  - Track game phase (normal, challenge, battle)
  - State is immutable and changes are trackable
- **Status**: ❌ NOT STARTED

#### Issue 2.3: Card Comparison Logic
- **User Story**: As a developer, I want robust card comparison logic so that game rules are enforced correctly
- **Acceptance Criteria**:
  - Standard card ranking (A > K > Q > J > 10... > 2)
  - Special rule: 2 beats Ace
  - Equal value detection for battles
  - Unit tests covering all comparison scenarios
- **Status**: ❌ NOT STARTED

#### Issue 2.4: Turn Resolution Engine
- **User Story**: As a developer, I want a turn resolution system so that game outcomes are processed correctly
- **Acceptance Criteria**:
  - Normal win/loss processing
  - Challenge mechanism implementation
  - Battle mechanism implementation
  - Card redistribution logic
  - Win/loss condition checking
- **Status**: ❌ NOT STARTED

## Milestone 3: Basic UI Components
**Goal**: Create the core visual components for the game interface

### Issues for Milestone 3:

#### Issue 3.1: Game Board Layout
- **User Story**: As a player, I want a clear game board layout so that I can understand the game state at a glance
- **Acceptance Criteria**:
  - Head-to-head layout with player at bottom, opponent at top
  - Central "table" area for active cards
  - Designated areas for each player's deck
  - Layout works on all supported screen sizes
- **Status**: ❌ NOT STARTED

#### Issue 3.2: Card Component
- **User Story**: As a player, I want visually appealing card representations so that the game feels polished
- **Acceptance Criteria**:
  - Card component displays rank and suit clearly
  - Face-down card shows backing design
  - Cards are properly sized for different screen sizes
  - Hover effects for interactive cards
- **Status**: ❌ NOT STARTED

#### Issue 3.3: Health Bar Component
- **User Story**: As a player, I want to see health bars representing card counts so that I can quickly assess the game state
- **Acceptance Criteria**:
  - Health bar shows current card count out of maximum
  - Color changes based on percentage (Green > Yellow > Orange > Red)
  - "In danger" highlighting when cards are at risk
  - Smooth animations for health changes
- **Status**: ❌ NOT STARTED

#### Issue 3.4: Player Action Indicators
- **User Story**: As a player, I want clear visual cues for required actions so that I know what to do next
- **Acceptance Criteria**:
  - Blue glow effect for interactive elements
  - Visual indicators for challenge opportunities
  - Clear feedback for completed actions
  - Accessibility considerations for visual cues
- **Status**: ❌ NOT STARTED

## Milestone 4: Game Mechanics Implementation
**Goal**: Connect the game engine to the UI and implement core gameplay

### Issues for Milestone 4:

#### Issue 4.1: Basic Turn Flow
- **User Story**: As a player, I want to click my deck to start turns so that the game progresses at my pace
- **Acceptance Criteria**:
  - Clicking deck draws cards for both players
  - Cards are compared automatically
  - Turn results are displayed clearly
  - Game progresses to next turn seamlessly
- **Status**: ❌ NOT STARTED

#### Issue 4.2: Challenge System
- **User Story**: As a player, when I lose a turn, I want the option to challenge so I have a chance to save my card
- **Acceptance Criteria**:
  - Challenge option appears after normal loss
  - Challenge draws additional card
  - Challenge outcome properly resolved
  - All cards properly redistributed based on outcome
- **Status**: ❌ NOT STARTED

#### Issue 4.3: Battle System
- **User Story**: As a player, I want engaging battle mechanics when cards tie so that the game feels dynamic
- **Acceptance Criteria**:
  - Battle triggers on equal card values
  - Both players place 3 cards face-down
  - Player selects from opponent's face-down cards
  - AI selects from player's face-down cards
  - Battle resolution handles all edge cases
- **Status**: ❌ NOT STARTED

#### Issue 4.4: Game End Conditions
- **User Story**: As a player, I want the game to clearly declare victory or defeat so I know when the game is over
- **Acceptance Criteria**:
  - Game ends when player reaches 0 cards
  - Game ends when opponent reaches 0 cards
  - Insufficient cards for battle triggers loss
  - Clear win/loss messaging
  - Option to start new game
- **Status**: ❌ NOT STARTED

## Milestone 5: Visual Polish & Animations
**Goal**: Add animations and visual effects to enhance the gaming experience

### Issues for Milestone 5:

#### Issue 5.1: Card Animation System
- **User Story**: As a player, I want to see cards animate as they move so that the game feels lively and engaging
- **Acceptance Criteria**:
  - Cards slide from deck to table smoothly
  - Card flip animation when revealing
  - Cards animate to discard when lost
  - Proper timing and easing for all animations
- **Status**: ❌ NOT STARTED

#### Issue 5.2: Battle Clash Animations
- **User Story**: As a player, I want exciting battle animations so that conflicts feel impactful
- **Acceptance Criteria**:
  - Cards animate clashing during battle comparisons
  - Winning card glows green, losing card glows red
  - Lost cards animate falling off-screen
  - Face-down cards reveal animation during discard
- **Status**: ❌ NOT STARTED

#### Issue 5.3: Health Bar Animations
- **User Story**: As a player, I want to see health changes animate so that damage is clear and impactful
- **Acceptance Criteria**:
  - "In danger" highlighting during active turns
  - Damage animation with flash effect
  - Smooth health bar transitions
  - Health changes are clearly visible
- **Status**: ❌ NOT STARTED

#### Issue 5.4: Visual Feedback System
- **User Story**: As a player, I want clear visual feedback for all my actions so that I understand what's happening
- **Acceptance Criteria**:
  - Winning/losing cards have distinct visual states
  - Action confirmations with visual effects
  - Smooth transitions between game states
  - Consistent visual language throughout
- **Status**: ❌ NOT STARTED

## Milestone 6: Settings & Customization
**Goal**: Implement player customization options and game settings

### Issues for Milestone 6:

#### Issue 6.1: Settings Menu Implementation
- **User Story**: As a player, I want access to a settings menu so that I can customize my experience
- **Acceptance Criteria**:
  - Settings accessible from main game view
  - Settings persist across sessions
  - Settings are organized logically
  - Settings can be reset to defaults
- **Status**: ❌ NOT STARTED

#### Issue 6.2: Card Backing Customization
- **User Story**: As a player, I want to choose my card backing design so that I can personalize my cards
- **Acceptance Criteria**:
  - Multiple card backing options available
  - Preview of backing designs
  - Selection persists across games
  - Backing applies to player's cards only
- **Status**: ❌ NOT STARTED

#### Issue 6.3: Discard Pile Viewer
- **User Story**: As a player, I want to view the discard pile so that I can see which cards are out of play
- **Acceptance Criteria**:
  - Button/link to access discard pile
  - Scrollable carousel view of discarded cards
  - Clear indication of which player lost each card
  - Easy to close and return to game
- **Status**: ❌ NOT STARTED

#### Issue 6.4: Game Statistics
- **User Story**: As a player, I want to see game statistics so that I can track my performance
- **Acceptance Criteria**:
  - Turn counter displayed during game
  - Games won/lost tracking
  - Game duration tracking
  - Statistics persist across sessions
- **Status**: ❌ NOT STARTED

## Milestone 7: Testing & Polish
**Goal**: Ensure application quality through comprehensive testing and final polish

### Issues for Milestone 7:

#### Issue 7.1: Unit Testing Suite
- **User Story**: As a developer, I want comprehensive unit tests so that game logic is reliable
- **Acceptance Criteria**:
  - All core game logic has unit tests
  - All components have basic tests
  - Edge cases are covered
  - Tests run successfully in CI
- **Status**: ❌ NOT STARTED

#### Issue 7.2: Integration Testing
- **User Story**: As a developer, I want integration tests so that component interactions work correctly
- **Acceptance Criteria**:
  - Game flow integration tests
  - UI interaction tests
  - State management integration tests
  - Cross-component communication tests
- **Status**: ❌ NOT STARTED

#### Issue 7.3: Performance Optimization
- **User Story**: As a player, I want the game to run smoothly so that my experience is not hindered by lag
- **Acceptance Criteria**:
  - Animations run at 60fps
  - Game loads quickly on all devices
  - Memory usage is optimized
  - Bundle size is minimized
- **Status**: ❌ NOT STARTED

#### Issue 7.4: Accessibility & Final Polish
- **User Story**: As a player with accessibility needs, I want the game to be fully accessible so that I can play regardless of my abilities
- **Acceptance Criteria**:
  - Keyboard navigation support
  - Screen reader compatibility
  - High contrast mode support
  - WCAG 2.1 AA compliance
- **Status**: ❌ NOT STARTED

## Current Development Status

Based on repository analysis, the project is currently in **Milestone 1** with partial completion:
- ✅ Basic Angular/PWA setup complete
- 🔄 Basic theme toggle implemented (needs persistence)
- 🔄 Basic routing structure (needs settings route)
- ❌ Responsive layout not yet implemented

**Next Priority**: Complete Milestone 1 remaining items, then proceed to Milestone 2 for core game engine development.