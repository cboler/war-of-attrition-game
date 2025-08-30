# War of Attrition Game - Copilot Agent Instructions

## Repository Overview

This repository contains the **War of Attrition** card game - a Progressive Web Application (PWA) built with Angular 20 and Angular Material. The project implements a sophisticated two-player card game with comprehensive game logic, animations, and responsive design. The application is deployed to GitHub Pages from the `/docs` directory.

**Key Project Details**:
- **Language**: TypeScript (Angular 20.1.6)
- **Framework**: Angular with Angular Material UI
- **Type**: Progressive Web Application (PWA)
- **Architecture**: Signal-based reactive state management with standalone components
- **Deployment**: GitHub Pages (hosted from `/docs`)
- **Current Status**: Milestone 5 of 7 (Visual Polish & Animations) - 50% complete
- **Test Coverage**: 159 tests passing (comprehensive coverage)

## Build and Development Commands

**ALWAYS run `npm install` before any other commands**. The project uses Node.js and npm for dependency management.

### Essential Commands
```bash
# Install dependencies (REQUIRED first step)
npm install

# Development server (http://localhost:4200/)
npm start
# OR
ng serve

# Production build (outputs to /docs directory for GitHub Pages)
npm run build
# This runs: ng build --base-href /war-of-attrition-game/ && npm run move-build-files

# Run tests (use headless mode in CI/headless environments)
npm test -- --watch=false --browsers=ChromeHeadless
# For development with watch mode (requires display)
npm test

# Lint code
ng lint
```

### Build Timing and Warnings
- **Build time**: ~7-8 seconds for production build
- **Test time**: ~1 minute for all 159 tests
- **Expected warnings**: Bundle size warnings (bundle exceeds 500KB budget) - these are non-blocking
- **Bundle size**: Total ~659KB (acceptable for this feature-rich application)

### Common Issues and Solutions
1. **Chrome browser tests fail**: Use `--browsers=ChromeHeadless` flag for headless environments
2. **Build warnings about bundle size**: These are warnings only, build succeeds
3. **Module not found errors**: Run `npm install` first

## Project Architecture and File Structure

### Core Directory Structure
```
/
├── .github/instructions/          # Complete project documentation
│   ├── README.md                  # Central documentation hub
│   ├── war-of-attrition-requirements.md  # IMMUTABLE requirements (NEVER modify)
│   ├── progress-data.json         # Current development status
│   └── copilot-instructions.md    # This file
├── docs/                          # Production build output (GitHub Pages)
├── src/app/                       # Main application source
│   ├── core/                      # Core game engine
│   │   ├── models/               # TypeScript models (Card, Deck, GameState)
│   │   └── services/             # Game logic services
│   ├── shared/components/         # Reusable UI components
│   ├── game/                      # Main game component
│   ├── settings/                  # Settings component
│   └── services/                  # Application-level services
├── angular.json                   # Angular CLI configuration
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

### Key Configuration Files
- **angular.json**: Build configuration, asset paths, budget warnings
- **karma.conf.js**: Test runner configuration
- **tsconfig.json**: TypeScript compiler options (strict mode enabled)
- **ngsw-config.json**: Service worker configuration for PWA
- **.github/workflows/**: GitHub Actions (if present)

### Service Architecture (Critical for Understanding Code Changes)
```
Application Layer (src/app/services/)
├── GameControllerService     # UI orchestration
├── ProgressService          # Development tracking
└── GameDemoService          # Demo functionality

Core Engine Layer (src/app/core/services/)
├── GameStateService         # Central state management (Angular signals)
├── TurnResolutionService    # Game flow orchestration
├── CardComparisonService    # Game rules implementation
├── OpponentAIService        # AI decision making
└── SettingsService          # User preferences
```

## Development Guidelines

### Angular-Specific Patterns
- **Standalone Components**: All new components should be standalone (no NgModule)
- **Signal-Based State**: Use Angular signals for all reactive state (`signal()`, `computed()`)
- **OnPush Change Detection**: All components use OnPush for performance
- **Modern Control Flow**: Use `@if`, `@for`, `@switch` instead of structural directives

### Code Style and Standards
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Immutable Data**: Game models are immutable by design
- **Service Injection**: Use Angular's dependency injection, avoid direct imports
- **Testing**: Maintain comprehensive test coverage (currently 159 tests)

### Critical Files for Agent Understanding
1. **src/app/core/models/**: Understand Card, Deck, and GameState interfaces
2. **src/app/core/services/game-state.service.ts**: Central state management
3. **src/app/services/progress.service.ts**: Current development status
4. **.github/instructions/war-of-attrition-requirements.md**: Game rules (NEVER modify)

## Documentation Structure

### Agent.md Files
Each subdirectory in `src/app/` contains an `Agent.md` file with detailed information:
- **Purpose**: What the directory contains
- **Design Patterns**: How components/services are structured
- **Integration Points**: How they connect to other parts of the system
- **Usage Guidelines**: Best practices for modifications

### Central Documentation
- **.github/instructions/README.md**: Project overview and current status
- **progress-data.json**: Single source of truth for development progress
- **war-of-attrition-requirements.md**: Immutable game requirements

## Validation and Testing

### Pre-Change Validation
1. **Always** run `npm install` first
2. **Always** run `npm run build` to verify build succeeds
3. **Always** run `npm test -- --watch=false --browsers=ChromeHeadless` to verify tests pass
4. Check that no new TypeScript errors are introduced

### Post-Change Validation
1. Verify the application starts: `npm start`
2. Test core functionality manually if game logic changes
3. Ensure build warnings haven't increased significantly
4. Verify responsive design on mobile viewport

### Critical Success Patterns
- **Tests must pass**: 159 tests should remain passing
- **Build must succeed**: May have warnings but must complete
- **Type safety**: No TypeScript errors allowed
- **Signal patterns**: Use Angular signals for all state management

## Common Development Scenarios

### Adding New Features
1. Update progress in `progress-data.json` if completing milestones
2. Add tests alongside implementation
3. Use existing service patterns for consistency
4. Follow Angular standalone component patterns

### Modifying Game Logic
1. **NEVER** modify `war-of-attrition-requirements.md`
2. Changes typically go in `src/app/core/services/`
3. Update corresponding tests
4. Ensure game state remains immutable

### UI/Component Changes
1. Components are in `src/app/shared/components/`
2. Use Angular Material components when possible
3. Maintain responsive design patterns
4. Test accessibility features

## Trust These Instructions

These instructions are based on comprehensive repository analysis and testing. Only search for additional information if:
- These instructions are incomplete for your specific task
- You encounter errors not described here
- You need to understand specific game logic details

The repository is well-documented with Agent.md files in each directory providing detailed implementation guidance.