#!/bin/bash

# Complete GitHub Issues Creation Script
# This script creates ALL 27 issues from development-milestones.md

set -e

echo "📝 Creating ALL GitHub Issues for War of Attrition Game"
echo "====================================================="

# Repository info
REPO="cboler/war-of-attrition-game"

# Get milestone numbers
echo "🔍 Getting milestone numbers..."
M1=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Foundation & Setup") | .number')
M2=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Core Game Engine") | .number')
M3=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Basic UI Components") | .number')
M4=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Game Mechanics Implementation") | .number')
M5=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Visual Polish & Animations") | .number')
M6=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Settings & Customization") | .number')
M7=$(gh api repos/$REPO/milestones | jq '.[] | select(.title=="Testing & Polish") | .number')

echo "📋 Creating Milestone 1 issues (Foundation & Setup)..."

# Milestone 1 Issues
gh issue create \
  --title "Project Infrastructure Setup" \
  --body "## User Story
As a developer, I want a properly configured Angular project with PWA capabilities so that the application can be installed on devices

## Acceptance Criteria
- [x] Angular CLI project is properly configured
- [x] PWA service worker is functional
- [x] Application can be installed on supported devices
- [x] Build process generates optimized production builds

## Status
✅ COMPLETED (Basic setup exists)

## Implementation Notes
Basic Angular/PWA setup is already in place. This issue can be closed as completed." \
  --label "enhancement,milestone-1" \
  --milestone $M1 \
  --repo $REPO

gh issue create \
  --title "Basic Routing and Navigation" \
  --body "## User Story
As a player, I want intuitive navigation between game and settings so that I can access different parts of the application

## Acceptance Criteria
- [ ] Route structure supports game view and settings view
- [ ] Navigation between views is seamless
- [ ] Browser back/forward buttons work correctly
- [ ] Default route loads the game view

## Status
🔄 IN PROGRESS (Basic routing exists, needs settings route)

## Implementation Notes
- Basic routing is in place
- Need to add settings route and component
- Add navigation components/links" \
  --label "enhancement,milestone-1,priority-high" \
  --milestone $M1 \
  --repo $REPO

gh issue create \
  --title "Theme System Implementation" \
  --body "## User Story
As a player, I want to toggle between light and dark themes so that I can personalize my visual experience

## Acceptance Criteria
- [ ] Light and dark theme CSS is properly defined
- [ ] Theme toggle persists across sessions
- [ ] All components respect the selected theme
- [ ] Smooth transitions between themes

## Status
🔄 IN PROGRESS (Basic toggle exists, needs persistence and full theming)

## Implementation Notes
- Basic theme toggle is implemented
- Need to add theme persistence using localStorage
- Ensure all components respect theme variables" \
  --label "enhancement,milestone-1,priority-high" \
  --milestone $M1 \
  --repo $REPO

gh issue create \
  --title "Responsive Layout Foundation" \
  --body "## User Story
As a player, I want the game to work properly on desktop, tablet, and mobile so that I can play anywhere

## Acceptance Criteria
- [ ] Application layout adapts to different screen sizes
- [ ] Touch interactions work on mobile devices
- [ ] Game remains playable on smallest supported screen size
- [ ] No horizontal scrolling on any supported device

## Status
❌ NOT STARTED

## Implementation Notes
- Use Angular Flex Layout or CSS Grid
- Test on common device sizes (320px, 768px, 1024px, 1440px)
- Ensure card components scale appropriately" \
  --label "enhancement,milestone-1,priority-high" \
  --milestone $M1 \
  --repo $REPO

echo "📋 Creating Milestone 2 issues (Core Game Engine)..."

# Milestone 2 Issues
gh issue create \
  --title "Card and Deck Models" \
  --body "## User Story
As a developer, I want well-defined card and deck data structures so that game logic can be implemented reliably

## Acceptance Criteria
- [ ] Card interface/class with suit, rank, and value properties
- [ ] Deck class with shuffle, draw, and management methods
- [ ] Support for red (player) and black (opponent) deck separation
- [ ] Proper TypeScript typing for all card-related data

## Status
❌ NOT STARTED

## Implementation Notes
- Create Card interface with Suit, Rank, Value
- Implement Deck class with standard 52-card deck
- Separate into red (Hearts/Diamonds) and black (Clubs/Spades)
- Add shuffle algorithm (Fisher-Yates)" \
  --label "enhancement,milestone-2,priority-high" \
  --milestone $M2 \
  --repo $REPO

gh issue create \
  --title "Game State Management" \
  --body "## User Story
As a developer, I want centralized game state management so that the game can track turns, cards, and player status

## Acceptance Criteria
- [ ] Game state service using Angular signals or RxJS
- [ ] Track player and opponent card counts
- [ ] Track current turn number
- [ ] Track game phase (normal, challenge, battle)
- [ ] State is immutable and changes are trackable

## Status
❌ NOT STARTED

## Implementation Notes
- Use Angular Signals for reactive state management
- Implement GameState interface
- Create GameStateService with methods for state updates
- Ensure state immutability" \
  --label "enhancement,milestone-2,priority-high" \
  --milestone $M2 \
  --repo $REPO

gh issue create \
  --title "Card Comparison Logic" \
  --body "## User Story
As a developer, I want robust card comparison logic so that game rules are enforced correctly

## Acceptance Criteria
- [ ] Standard card ranking (A > K > Q > J > 10... > 2)
- [ ] Special rule: 2 beats Ace
- [ ] Equal value detection for battles
- [ ] Unit tests covering all comparison scenarios

## Status
❌ NOT STARTED

## Implementation Notes
- Create compareCards function
- Handle special case: 2 beats Ace
- Return win/loss/tie results
- Comprehensive unit tests required" \
  --label "enhancement,milestone-2,priority-high" \
  --milestone $M2 \
  --repo $REPO

gh issue create \
  --title "Turn Resolution Engine" \
  --body "## User Story
As a developer, I want a turn resolution system so that game outcomes are processed correctly

## Acceptance Criteria
- [ ] Normal win/loss processing
- [ ] Challenge mechanism implementation
- [ ] Battle mechanism implementation
- [ ] Card redistribution logic
- [ ] Win/loss condition checking

## Status
❌ NOT STARTED

## Implementation Notes
- Create TurnResolutionService
- Handle normal turns, challenges, and battles
- Implement card redistribution rules
- Check win/loss conditions after each turn" \
  --label "enhancement,milestone-2,priority-high" \
  --milestone $M2 \
  --repo $REPO

echo "📋 Creating Milestone 3 issues (Basic UI Components)..."

# Milestone 3 Issues
gh issue create \
  --title "Game Board Layout" \
  --body "## User Story
As a player, I want a clear game board layout so that I can understand the game state at a glance

## Acceptance Criteria
- [ ] Head-to-head layout with player at bottom, opponent at top
- [ ] Central \"table\" area for active cards
- [ ] Designated areas for each player's deck
- [ ] Layout works on all supported screen sizes

## Status
❌ NOT STARTED

## Implementation Notes
- Create GameBoardComponent
- Use CSS Grid for layout structure
- Player area at bottom, opponent at top
- Central table for card comparisons" \
  --label "enhancement,milestone-3,priority-high" \
  --milestone $M3 \
  --repo $REPO

gh issue create \
  --title "Card Component" \
  --body "## User Story
As a player, I want visually appealing card representations so that the game feels polished

## Acceptance Criteria
- [ ] Card component displays rank and suit clearly
- [ ] Face-down card shows backing design
- [ ] Cards are properly sized for different screen sizes
- [ ] Hover effects for interactive cards

## Status
❌ NOT STARTED

## Implementation Notes
- Create CardComponent with input properties
- Support both face-up and face-down states
- Responsive sizing using CSS clamp()
- Add hover states for interactive cards" \
  --label "enhancement,milestone-3,priority-high" \
  --milestone $M3 \
  --repo $REPO

gh issue create \
  --title "Health Bar Component" \
  --body "## User Story
As a player, I want to see health bars representing card counts so that I can quickly assess the game state

## Acceptance Criteria
- [ ] Health bar shows current card count out of maximum
- [ ] Color changes based on percentage (Green > Yellow > Orange > Red)
- [ ] \"In danger\" highlighting when cards are at risk
- [ ] Smooth animations for health changes

## Status
❌ NOT STARTED

## Implementation Notes
- Create HealthBarComponent
- Color thresholds: >75% green, >50% yellow, >25% orange, ≤25% red
- CSS transitions for smooth color changes
- Warning indicator for low health" \
  --label "enhancement,milestone-3,priority-medium" \
  --milestone $M3 \
  --repo $REPO

gh issue create \
  --title "Player Action Indicators" \
  --body "## User Story
As a player, I want clear visual cues for required actions so that I know what to do next

## Acceptance Criteria
- [ ] Blue glow effect for interactive elements
- [ ] Visual indicators for challenge opportunities
- [ ] Clear feedback for completed actions
- [ ] Accessibility considerations for visual cues

## Status
❌ NOT STARTED

## Implementation Notes
- CSS animations for blue glow effect
- Visual indicators for clickable elements
- ARIA attributes for accessibility
- Color-blind friendly indicators" \
  --label "enhancement,milestone-3,priority-medium" \
  --milestone $M3 \
  --repo $REPO

echo "📋 Creating Milestone 4 issues (Game Mechanics Implementation)..."

# Milestone 4 Issues
gh issue create \
  --title "Basic Turn Flow" \
  --body "## User Story
As a player, I want to click my deck to start turns so that the game progresses at my pace

## Acceptance Criteria
- [ ] Clicking deck draws cards for both players
- [ ] Cards are compared automatically
- [ ] Turn results are displayed clearly
- [ ] Game progresses to next turn seamlessly

## Status
❌ NOT STARTED

## Implementation Notes
- Connect deck click to turn logic
- Display drawn cards on table
- Show comparison result
- Update game state after turn resolution" \
  --label "enhancement,milestone-4,priority-high" \
  --milestone $M4 \
  --repo $REPO

gh issue create \
  --title "Challenge System" \
  --body "## User Story
As a player, when I lose a turn, I want the option to challenge so I have a chance to save my card

## Acceptance Criteria
- [ ] Challenge option appears after normal loss
- [ ] Challenge draws additional card
- [ ] Challenge outcome properly resolved
- [ ] All cards properly redistributed based on outcome

## Status
❌ NOT STARTED

## Implementation Notes
- Show challenge button after player loss
- Implement challenge logic in turn resolution
- Handle challenge card drawing
- Update UI for challenge flow" \
  --label "enhancement,milestone-4,priority-high" \
  --milestone $M4 \
  --repo $REPO

gh issue create \
  --title "Battle System" \
  --body "## User Story
As a player, I want engaging battle mechanics when cards tie so that the game feels dynamic

## Acceptance Criteria
- [ ] Battle triggers on equal card values
- [ ] Both players place 3 cards face-down
- [ ] Player selects from opponent's face-down cards
- [ ] AI selects from player's face-down cards
- [ ] Battle resolution handles all edge cases

## Status
❌ NOT STARTED

## Implementation Notes
- Trigger battle on card tie
- Implement face-down card placement
- Create card selection UI for player
- Add AI logic for opponent selection
- Handle insufficient cards scenario" \
  --label "enhancement,milestone-4,priority-high" \
  --milestone $M4 \
  --repo $REPO

gh issue create \
  --title "Game End Conditions" \
  --body "## User Story
As a player, I want the game to clearly declare victory or defeat so I know when the game is over

## Acceptance Criteria
- [ ] Game ends when player reaches 0 cards
- [ ] Game ends when opponent reaches 0 cards
- [ ] Insufficient cards for battle triggers loss
- [ ] Clear win/loss messaging
- [ ] Option to start new game

## Status
❌ NOT STARTED

## Implementation Notes
- Check card counts after each turn
- Display game over modal/dialog
- Show win/loss message
- Add 'New Game' button to restart" \
  --label "enhancement,milestone-4,priority-high" \
  --milestone $M4 \
  --repo $REPO

echo "📋 Creating Milestone 5 issues (Visual Polish & Animations)..."

# Milestone 5 Issues
gh issue create \
  --title "Card Animation System" \
  --body "## User Story
As a player, I want to see cards animate as they move so that the game feels lively and engaging

## Acceptance Criteria
- [ ] Cards slide from deck to table smoothly
- [ ] Card flip animation when revealing
- [ ] Cards animate to discard when lost
- [ ] Proper timing and easing for all animations

## Status
❌ NOT STARTED

## Implementation Notes
- Use Angular Animations API
- Create slide, flip, and discard animations
- Coordinate animation timing
- Add easing functions for smooth motion" \
  --label "enhancement,milestone-5,priority-medium" \
  --milestone $M5 \
  --repo $REPO

gh issue create \
  --title "Battle Clash Animations" \
  --body "## User Story
As a player, I want exciting battle animations so that conflicts feel impactful

## Acceptance Criteria
- [ ] Cards animate clashing during battle comparisons
- [ ] Winning card glows green, losing card glows red
- [ ] Lost cards animate falling off-screen
- [ ] Face-down cards reveal animation during discard

## Status
❌ NOT STARTED

## Implementation Notes
- Create clash animation for card battles
- Add glow effects for win/loss states
- Implement falling card animation
- Face-down to face-up reveal animation" \
  --label "enhancement,milestone-5,priority-medium" \
  --milestone $M5 \
  --repo $REPO

gh issue create \
  --title "Health Bar Animations" \
  --body "## User Story
As a player, I want to see health changes animate so that damage is clear and impactful

## Acceptance Criteria
- [ ] \"In danger\" highlighting during active turns
- [ ] Damage animation with flash effect
- [ ] Smooth health bar transitions
- [ ] Health changes are clearly visible

## Status
❌ NOT STARTED

## Implementation Notes
- Pulse/flash animation for health changes
- Smooth CSS transitions for bar updates
- Warning animation for low health
- Color transition animations" \
  --label "enhancement,milestone-5,priority-low" \
  --milestone $M5 \
  --repo $REPO

gh issue create \
  --title "Visual Feedback System" \
  --body "## User Story
As a player, I want clear visual feedback for all my actions so that I understand what's happening

## Acceptance Criteria
- [ ] Winning/losing cards have distinct visual states
- [ ] Action confirmations with visual effects
- [ ] Smooth transitions between game states
- [ ] Consistent visual language throughout

## Status
❌ NOT STARTED

## Implementation Notes
- Define visual states for all card conditions
- Add confirmation animations for actions
- Create transition animations between game phases
- Establish consistent animation library" \
  --label "enhancement,milestone-5,priority-low" \
  --milestone $M5 \
  --repo $REPO

echo "📋 Creating Milestone 6 issues (Settings & Customization)..."

# Milestone 6 Issues
gh issue create \
  --title "Settings Menu Implementation" \
  --body "## User Story
As a player, I want access to a settings menu so that I can customize my experience

## Acceptance Criteria
- [ ] Settings accessible from main game view
- [ ] Settings persist across sessions
- [ ] Settings are organized logically
- [ ] Settings can be reset to defaults

## Status
❌ NOT STARTED

## Implementation Notes
- Create SettingsComponent
- Use localStorage for persistence
- Organize settings into categories
- Add reset functionality" \
  --label "enhancement,milestone-6,priority-medium" \
  --milestone $M6 \
  --repo $REPO

gh issue create \
  --title "Card Backing Customization" \
  --body "## User Story
As a player, I want to choose my card backing design so that I can personalize my cards

## Acceptance Criteria
- [ ] Multiple card backing options available
- [ ] Preview of backing designs
- [ ] Selection persists across games
- [ ] Backing applies to player's cards only

## Status
❌ NOT STARTED

## Implementation Notes
- Create card backing assets
- Add backing selection UI
- Preview functionality
- Apply only to player's face-down cards" \
  --label "enhancement,milestone-6,priority-low" \
  --milestone $M6 \
  --repo $REPO

gh issue create \
  --title "Discard Pile Viewer" \
  --body "## User Story
As a player, I want to view the discard pile so that I can see which cards are out of play

## Acceptance Criteria
- [ ] Button/link to access discard pile
- [ ] Scrollable carousel view of discarded cards
- [ ] Clear indication of which player lost each card
- [ ] Easy to close and return to game

## Status
❌ NOT STARTED

## Implementation Notes
- Create DiscarPileComponent
- Implement card carousel/list view
- Color coding for player vs opponent cards
- Modal or overlay presentation" \
  --label "enhancement,milestone-6,priority-low" \
  --milestone $M6 \
  --repo $REPO

gh issue create \
  --title "Game Statistics" \
  --body "## User Story
As a player, I want to see game statistics so that I can track my performance

## Acceptance Criteria
- [ ] Turn counter displayed during game
- [ ] Games won/lost tracking
- [ ] Game duration tracking
- [ ] Statistics persist across sessions

## Status
❌ NOT STARTED

## Implementation Notes
- Track statistics in service
- Display current game stats
- Store historical data in localStorage
- Add statistics viewing component" \
  --label "enhancement,milestone-6,priority-low" \
  --milestone $M6 \
  --repo $REPO

echo "📋 Creating Milestone 7 issues (Testing & Polish)..."

# Milestone 7 Issues
gh issue create \
  --title "Unit Testing Suite" \
  --body "## User Story
As a developer, I want comprehensive unit tests so that game logic is reliable

## Acceptance Criteria
- [ ] All core game logic has unit tests
- [ ] All components have basic tests
- [ ] Edge cases are covered
- [ ] Tests run successfully in CI

## Status
❌ NOT STARTED

## Implementation Notes
- Create tests for card comparison logic
- Test game state management
- Component testing with Angular Testing Utilities
- Achieve 80%+ code coverage" \
  --label "enhancement,milestone-7,priority-high" \
  --milestone $M7 \
  --repo $REPO

gh issue create \
  --title "Integration Testing" \
  --body "## User Story
As a developer, I want integration tests so that component interactions work correctly

## Acceptance Criteria
- [ ] Game flow integration tests
- [ ] UI interaction tests
- [ ] State management integration tests
- [ ] Cross-component communication tests

## Status
❌ NOT STARTED

## Implementation Notes
- Test complete game flows
- Use Angular Testing Library for UI tests
- Test service-component integration
- E2E testing with Cypress or Playwright" \
  --label "enhancement,milestone-7,priority-medium" \
  --milestone $M7 \
  --repo $REPO

gh issue create \
  --title "Performance Optimization" \
  --body "## User Story
As a player, I want the game to run smoothly so that my experience is not hindered by lag

## Acceptance Criteria
- [ ] Animations run at 60fps
- [ ] Game loads quickly on all devices
- [ ] Memory usage is optimized
- [ ] Bundle size is minimized

## Status
❌ NOT STARTED

## Implementation Notes
- Profile animation performance
- Optimize bundle with tree shaking
- Implement lazy loading where appropriate
- Monitor memory usage patterns" \
  --label "enhancement,milestone-7,priority-medium" \
  --milestone $M7 \
  --repo $REPO

gh issue create \
  --title "Accessibility & Final Polish" \
  --body "## User Story
As a player with accessibility needs, I want the game to be fully accessible so that I can play regardless of my abilities

## Acceptance Criteria
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] WCAG 2.1 AA compliance

## Status
❌ NOT STARTED

## Implementation Notes
- Add ARIA labels and roles
- Implement keyboard navigation
- Test with screen readers
- High contrast theme option
- Focus management for modals/dialogs" \
  --label "enhancement,milestone-7,priority-high" \
  --milestone $M7 \
  --repo $REPO

echo "✅ Successfully created all 27 GitHub issues!"
echo ""
echo "📊 Summary:"
echo "   • Milestone 1: 4 issues (Foundation & Setup)"
echo "   • Milestone 2: 4 issues (Core Game Engine)"
echo "   • Milestone 3: 4 issues (Basic UI Components)"
echo "   • Milestone 4: 4 issues (Game Mechanics Implementation)"
echo "   • Milestone 5: 4 issues (Visual Polish & Animations)"
echo "   • Milestone 6: 4 issues (Settings & Customization)"
echo "   • Milestone 7: 4 issues (Testing & Polish)"
echo "   • Total: 28 issues created"
echo ""
echo "🔗 View all issues at: https://github.com/$REPO/issues"
echo "🎯 View milestones at: https://github.com/$REPO/milestones"