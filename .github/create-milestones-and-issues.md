# GitHub Milestones and Issues Creation Guide

This guide provides instructions for creating the GitHub milestones and issues based on the development milestones documentation.

## Overview

Based on the `development-milestones.md` file, you need to create:
- **7 Milestones** representing major development phases
- **27 Issues** with detailed acceptance criteria

## Quick Setup Using GitHub CLI

If you have GitHub CLI installed, you can use the provided script to create everything automatically:

```bash
# Run the automated creation script
chmod +x .github/scripts/create-github-milestones.sh
.github/scripts/create-github-milestones.sh
```

## Manual Creation Instructions

### Step 1: Create Milestones

Navigate to your repository → Issues → Milestones → New milestone

Create these 7 milestones in order:

#### Milestone 1: Foundation & Setup
- **Title**: Foundation & Setup
- **Description**: Establish solid project foundation with basic navigation and PWA capabilities
- **Due Date**: (Optional - suggest 2 weeks from start)

#### Milestone 2: Core Game Engine
- **Title**: Core Game Engine
- **Description**: Implement the fundamental game logic and data structures
- **Due Date**: (Optional - suggest 4 weeks from start)

#### Milestone 3: Basic UI Components
- **Title**: Basic UI Components
- **Description**: Create the core visual components for the game interface
- **Due Date**: (Optional - suggest 6 weeks from start)

#### Milestone 4: Game Mechanics Implementation
- **Title**: Game Mechanics Implementation
- **Description**: Connect the game engine to the UI and implement core gameplay
- **Due Date**: (Optional - suggest 8 weeks from start)

#### Milestone 5: Visual Polish & Animations
- **Title**: Visual Polish & Animations
- **Description**: Add animations and visual effects to enhance the gaming experience
- **Due Date**: (Optional - suggest 10 weeks from start)

#### Milestone 6: Settings & Customization
- **Title**: Settings & Customization
- **Description**: Implement player customization options and game settings
- **Due Date**: (Optional - suggest 12 weeks from start)

#### Milestone 7: Testing & Polish
- **Title**: Testing & Polish
- **Description**: Ensure application quality through comprehensive testing and final polish
- **Due Date**: (Optional - suggest 14 weeks from start)

### Step 2: Create Issues

For each milestone, create the associated issues. Navigate to Issues → New issue

## Issue Templates

### Milestone 1 Issues

#### Issue 1.1: Project Infrastructure Setup
- **Title**: Project Infrastructure Setup
- **Labels**: enhancement, milestone-1
- **Milestone**: Foundation & Setup
- **Body**:
```markdown
## User Story
As a developer, I want a properly configured Angular project with PWA capabilities so that the application can be installed on devices

## Acceptance Criteria
- [ ] Angular CLI project is properly configured
- [ ] PWA service worker is functional
- [ ] Application can be installed on supported devices
- [ ] Build process generates optimized production builds

## Status
✅ COMPLETED (Basic setup exists)
```

#### Issue 1.2: Basic Routing and Navigation
- **Title**: Basic Routing and Navigation
- **Labels**: enhancement, milestone-1
- **Milestone**: Foundation & Setup
- **Body**:
```markdown
## User Story
As a player, I want intuitive navigation between game and settings so that I can access different parts of the application

## Acceptance Criteria
- [ ] Route structure supports game view and settings view
- [ ] Navigation between views is seamless
- [ ] Browser back/forward buttons work correctly
- [ ] Default route loads the game view

## Status
🔄 IN PROGRESS (Basic routing exists, needs settings route)
```

#### Issue 1.3: Theme System Implementation
- **Title**: Theme System Implementation
- **Labels**: enhancement, milestone-1
- **Milestone**: Foundation & Setup
- **Body**:
```markdown
## User Story
As a player, I want to toggle between light and dark themes so that I can personalize my visual experience

## Acceptance Criteria
- [ ] Light and dark theme CSS is properly defined
- [ ] Theme toggle persists across sessions
- [ ] All components respect the selected theme
- [ ] Smooth transitions between themes

## Status
🔄 IN PROGRESS (Basic toggle exists, needs persistence and full theming)
```

#### Issue 1.4: Responsive Layout Foundation
- **Title**: Responsive Layout Foundation
- **Labels**: enhancement, milestone-1
- **Milestone**: Foundation & Setup
- **Body**:
```markdown
## User Story
As a player, I want the game to work properly on desktop, tablet, and mobile so that I can play anywhere

## Acceptance Criteria
- [ ] Application layout adapts to different screen sizes
- [ ] Touch interactions work on mobile devices
- [ ] Game remains playable on smallest supported screen size
- [ ] No horizontal scrolling on any supported device

## Status
❌ NOT STARTED
```

### Milestone 2 Issues

#### Issue 2.1: Card and Deck Models
- **Title**: Card and Deck Models
- **Labels**: enhancement, milestone-2
- **Milestone**: Core Game Engine
- **Body**:
```markdown
## User Story
As a developer, I want well-defined card and deck data structures so that game logic can be implemented reliably

## Acceptance Criteria
- [ ] Card interface/class with suit, rank, and value properties
- [ ] Deck class with shuffle, draw, and management methods
- [ ] Support for red (player) and black (opponent) deck separation
- [ ] Proper TypeScript typing for all card-related data

## Status
❌ NOT STARTED
```

#### Issue 2.2: Game State Management
- **Title**: Game State Management
- **Labels**: enhancement, milestone-2
- **Milestone**: Core Game Engine
- **Body**:
```markdown
## User Story
As a developer, I want centralized game state management so that the game can track turns, cards, and player status

## Acceptance Criteria
- [ ] Game state service using Angular signals or RxJS
- [ ] Track player and opponent card counts
- [ ] Track current turn number
- [ ] Track game phase (normal, challenge, battle)
- [ ] State is immutable and changes are trackable

## Status
❌ NOT STARTED
```

#### Issue 2.3: Card Comparison Logic
- **Title**: Card Comparison Logic
- **Labels**: enhancement, milestone-2
- **Milestone**: Core Game Engine
- **Body**:
```markdown
## User Story
As a developer, I want robust card comparison logic so that game rules are enforced correctly

## Acceptance Criteria
- [ ] Standard card ranking (A > K > Q > J > 10... > 2)
- [ ] Special rule: 2 beats Ace
- [ ] Equal value detection for battles
- [ ] Unit tests covering all comparison scenarios

## Status
❌ NOT STARTED
```

#### Issue 2.4: Turn Resolution Engine
- **Title**: Turn Resolution Engine
- **Labels**: enhancement, milestone-2
- **Milestone**: Core Game Engine
- **Body**:
```markdown
## User Story
As a developer, I want a turn resolution system so that game outcomes are processed correctly

## Acceptance Criteria
- [ ] Normal win/loss processing
- [ ] Challenge mechanism implementation
- [ ] Battle mechanism implementation
- [ ] Card redistribution logic
- [ ] Win/loss condition checking

## Status
❌ NOT STARTED
```

## Continue for All Milestones

Follow the same pattern for Milestones 3-7 using the detailed information in `development-milestones.md`.

## Labels to Create

Create these labels for better organization:
- `milestone-1` through `milestone-7` (one for each milestone)
- `enhancement` (for new features)
- `bug` (for bug fixes)
- `documentation` (for docs)
- `priority-high`, `priority-medium`, `priority-low` (for prioritization)

## Notes

- All acceptance criteria should be turned into GitHub checkboxes using `- [ ]`
- Update issue status as work progresses
- Reference the original `development-milestones.md` for complete details
- Consider adding time estimates to issues for better planning