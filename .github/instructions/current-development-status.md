# War of Attrition Game Development Instructions

## Project Overview

This is the **War of Attrition** card game - a Progressive Web Application built with Angular and Angular Material. The project implements a two-player head-to-head card game following the comprehensive requirements in `war-of-attrition-requirements.md`.

**⚠️ IMPORTANT**: The `war-of-attrition-requirements.md` file is the single source of truth and should NEVER be modified. All development should reference this document.

## Current Development Status

The project is currently in **Milestone 1: Foundation & Setup** with partial completion:
- ✅ Basic Angular/PWA setup complete 
- 🔄 Basic theme toggle implemented (needs persistence)
- 🔄 Basic routing structure (needs settings route)
- ❌ Responsive layout not yet implemented

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
├── shared/                  # Shared components/services
├── models/                  # Data models (Card, Deck, GameState)
└── services/               # Game logic services
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

Focus on completing Milestone 1 items:
1. Add settings route and navigation
2. Implement theme persistence
3. Create responsive layout foundation
4. Then proceed to Milestone 2: Core Game Engine

All development should follow the milestones outlined in `development-milestones.md` and requirements in `war-of-attrition-requirements.md`.