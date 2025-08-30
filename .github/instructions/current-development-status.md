# War of Attrition Game Development Instructions

## Project Overview

This is the **War of Attrition** card game - a Progressive Web Application built with Angular and Angular Material. The project implements a two-player head-to-head card game following the comprehensive requirements in `war-of-attrition-requirements.md`.

**⚠️ IMPORTANT**: The `war-of-attrition-requirements.md` file is the single source of truth and should NEVER be modified. All development should reference this document.

## Current Development Status

**📋 Progress Tracking**: All development progress is now centrally managed in `progress-data.json` and accessed via the `ProgressService`. This ensures consistency across all progress reporting.

The project has completed **Milestones 1-4** and is currently in **Milestone 5: Visual Polish & Animations** (50% complete).

> **Note**: For detailed progress information, milestone breakdowns, and current status, refer to:
> - **Central Progress Data**: `.github/instructions/progress-data.json`
> - **Progress Service**: `src/app/services/progress.service.ts`
> - **Live Progress Display**: Available in the running application

### ✅ Milestone 1: Foundation & Setup (COMPLETED)
- ✅ Basic Angular/PWA setup complete 
- ✅ Theme toggle implemented with persistence
- ✅ Routing structure (Game and Settings routes)
- ✅ Responsive layout foundation

### ✅ Milestone 2: Core Game Engine (COMPLETED)
- ✅ **Card and Deck Models**: Complete card interface and deck class with red/black separation
- ✅ **Game State Management**: Angular signals-based state management service
- ✅ **Card Comparison Logic**: Full implementation including special Ace vs 2 rule
- ✅ **Turn Resolution Engine**: Complete turn, challenge, and battle resolution logic
- ✅ **Comprehensive Test Suite**: 159 passing tests covering all game logic

### ✅ Milestone 3: Basic UI Components (COMPLETED)
- ✅ **Game Board Layout**: Complete responsive game board implementation
- ✅ **Card Component**: Full card display with animations and interactions
- ✅ **Health Bar Component**: Color-coded health bars with damage animations
- ✅ **Player Action Indicators**: Blue glow and visual cues for required actions

### ✅ Milestone 4: Game Mechanics Implementation (COMPLETED)
- ✅ **Basic Turn Flow**: Complete turn-by-turn gameplay
- ✅ **Challenge System**: Accept/decline challenge functionality
- ✅ **Battle System**: Battle card selection and resolution
- ✅ **Game End Conditions**: Win/lose detection and game completion

### 🔄 Milestone 5: Visual Polish & Animations (50% COMPLETE)
**Completed**:
- ✅ **Material Icons Implementation**: Navigation and theme toggle icons
- ✅ **Enhanced Theme Toggle**: Lightbulb metaphor with lit/unlit states

**In Progress**:
- 🔄 **Card Animations**: Slide-in, flip, clash animations
- 🔄 **Visual Effects**: Battle clash effects and health damage animations
- 🔄 **Enhanced UI Polish**: Refined visual feedback system

### 🎯 Next: Milestone 6: Settings & Customization
Ready to implement:
- Advanced settings menu enhancements
- Multiple card backing options
- Game statistics and analytics
- Settings import/export functionality

See `development-milestones.md` for complete milestone and issue breakdown.

## Development Priorities

1. **Complete Milestone 1** - Finish foundation setup
2. **Begin Milestone 2** - Core game engine development  
3. **Follow milestone order** - Each milestone builds on the previous

## Game Requirements Summary

Reference the full `war-of-attrition-requirements.md` for complete details. Key points:

### Core Game Mechanics
- Two-player card game using standard 52-card deck
- Red cards (Hearts/Diamonds) for Player, Black cards (Clubs/Spades) for Opponent
- Special rule: 2 beats Ace (only exception to standard ranking)
- Turn flow: click deck → draw cards → compare → resolve → repeat
- Challenge system when losing
- Battle system when cards tie

### UI Requirements
- Head-to-head layout (Player bottom, Opponent top)
- Health bars with color coding (Green→Yellow→Orange→Red)
- Central "table" area for active cards
- Blue glow for required player actions
- Card animations (slide, flip, clash)
- "Solitaire green" background
- Multiple card backing options

### Technical Requirements
- Angular with Angular Material
- Progressive Web App (PWA)
- Fully responsive design
- Standalone components preferred
- Signals for state management

## File Structure

```
src/app/
├── app.ts                    # Main app component with theme toggle
├── app.routes.ts            # Routing configuration
├── game/                    # Game components
├── settings/                # Settings components  
├── core/                    # Core game logic
│   ├── models/              # Data models (Card, Deck, GameState)
│   └── services/            # Game logic services
└── shared/                  # Shared components/services (future)
```

## Code Standards

Use modern Angular best practices:
- Standalone components (default)
- Signal-based state management
- Function-based inputs/outputs
- OnPush change detection
- Native control flow (@if, @for, @switch)
- TypeScript strict mode
- Single responsibility principle

## Build & Development

```bash
npm install           # Install dependencies
npm start            # Development server
npm run build        # Production build to /docs
npm test             # Unit tests
```

The application is deployed to GitHub Pages from the `/docs` directory.

## Next Steps

**Milestone 5 is 50% COMPLETE!** 🎉

Significant progress has been made on Visual Polish & Animations:
- ✅ Material Icons integration with navigation and theme controls
- ✅ Enhanced theme toggle with lightbulb metaphor (lit/unlit states)
- ✅ Local Material Icons font integration for offline functionality

**Current focus for completing Milestone 5:**
1. **Card Animations**: Implement slide-in, flip, and clash animations
2. **Visual Effects**: Add battle clash effects and damage animations
3. **Enhanced UI Polish**: Refine visual feedback system

**Ready to proceed to Milestone 6: Settings & Customization:**
1. Expand settings menu with advanced options
2. Implement multiple card backing patterns
3. Add game statistics and analytics
4. Create settings import/export functionality

All development should continue to follow the milestones outlined in `development-milestones.md` and requirements in `war-of-attrition-requirements.md`.