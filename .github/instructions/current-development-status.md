# War of Attrition Game Development Instructions

## Project Overview

This is the **War of Attrition** card game - a Progressive Web Application built with Angular and Angular Material. The project implements a two-player head-to-head card game following the comprehensive requirements in `war-of-attrition-requirements.md`.

**⚠️ IMPORTANT**: The `war-of-attrition-requirements.md` file is the single source of truth and should NEVER be modified. All development should reference this document.

## Current Development Status

**📋 Progress Tracking**: All development progress is now centrally managed in `progress-data.json` and accessed via the `ProgressService`. This ensures consistency across all progress reporting.

The project has completed **Milestone 2: Core Game Engine** and is ready to proceed to **Milestone 3: Basic UI Components**.

> **Note**: For detailed progress information, milestone breakdowns, and current status, refer to:
> - **Central Progress Data**: `.github/instructions/progress-data.json`
> - **Progress Service**: `src/app/services/progress.service.ts`
> - **Live Progress Display**: Available in the running application

### ✅ Milestone 1: Foundation & Setup (COMPLETED)
- ✅ Basic Angular/PWA setup complete 
- ✅ Theme toggle implemented with persistence
- ✅ Routing structure (Game and Settings routes)
- ⚠️  Responsive layout foundation (basic but can be enhanced in Milestone 3)

### ✅ Milestone 2: Core Game Engine (COMPLETED)
All items completed as tracked in the central progress data:
- ✅ **Card and Deck Models**: Complete card interface and deck class with red/black separation
- ✅ **Game State Management**: Angular signals-based state management service
- ✅ **Card Comparison Logic**: Full implementation including special Ace vs 2 rule
- ✅ **Turn Resolution Engine**: Complete turn, challenge, and battle resolution logic
- ✅ **Comprehensive Test Suite**: 60 passing tests covering all game logic

### 🎯 Next: Milestone 3: Basic UI Components
Ready to implement (as defined in central progress data):
- Game Board Layout
- Card Component 
- Health Bar Component
- Player Action Indicators

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

**Milestone 2 is COMPLETE!** 🎉

The core game engine is fully implemented with:
- Complete card and deck models with TypeScript typing
- Robust game state management using Angular signals  
- Card comparison logic implementing all game rules (including special Ace vs 2 rule)
- Full turn resolution engine handling normal turns, challenges, and battles
- Comprehensive test suite with 60 passing tests

**Ready to proceed to Milestone 3: Basic UI Components:**
1. Implement Game Board Layout component
2. Create Card Component with proper styling
3. Build Health Bar Component with color coding
4. Add Player Action Indicators

All development should follow the milestones outlined in `development-milestones.md` and requirements in `war-of-attrition-requirements.md`.