# Shared Components - Agent Documentation

## Purpose
This directory contains reusable UI components that are shared across the War of Attrition game application. These components implement the game's visual elements with comprehensive styling, animations, and accessibility features. All components are standalone Angular components using signals and modern Angular patterns.

## Key Components

### `card/` - Card Component
**Purpose**: Visual representation of playing cards with full animation support

**Key Features**:
- **Card Display**: Shows suit symbols, rank, and proper card styling
- **Face Up/Down States**: Supports both visible and hidden card states
- **Animation Support**: Slide-in, flip, clash, and fall-away animations
- **Interactive States**: Clickable cards with hover and selection effects
- **Glow Effects**: Blue, green, and red glow for different game states
- **Accessibility**: Full ARIA support and keyboard navigation

**Inputs**:
- `card`: Card model with suit, rank, and value
- `faceDown`: Boolean for face-down display
- `glow`: Glow color ('blue', 'green', 'red', or null)
- `clickable`: Whether card can be clicked
- `animationState`: Current animation ('slide-in', 'flip', 'clash-win', etc.)
- `fromPosition`: Animation origin ('deck', 'hand', 'battle')

**Outputs**:
- `cardClick`: Emitted when card is clicked

**Styling**:
- Red cards: Hearts/Diamonds with red symbols
- Black cards: Clubs/Spades with black symbols
- Card backing patterns: Multiple backing designs via Settings
- Responsive sizing: Scales appropriately on mobile devices
- Animation classes: CSS animations for smooth transitions

**Design Notes**:
- Uses computed properties for derived display values
- Integrates with SettingsService for card backing preferences
- Supports full accessibility with screen readers
- Optimized for mobile touch interactions

### `health-bar/` - Health Bar Component
**Purpose**: Visual health/card count indicator with color-coded status

**Key Features**:
- **Card Count Display**: Shows current cards vs. maximum cards
- **Color Coding**: Green → Yellow → Orange → Red based on card count
- **Danger Indication**: Special highlighting for cards at risk
- **Damage Animation**: Visual feedback when cards are lost
- **Responsive Design**: Adapts to different screen sizes

**Inputs**:
- `label`: Display label (e.g., "Player", "Opponent")
- `current`: Current card count
- `maximum`: Maximum possible cards (usually 26)
- `inDanger`: Number of cards currently at risk
- `showDamageAnimation`: Trigger for damage animation

**Color Thresholds**:
- **Green**: 75-100% of maximum cards (19-26 cards)
- **Yellow**: 50-74% of maximum cards (13-18 cards)
- **Orange**: 25-49% of maximum cards (7-12 cards)
- **Red**: 0-24% of maximum cards (0-6 cards)

**Design Notes**:
- Uses computed properties for automatic color calculation
- Smooth transitions between color states
- Danger zone highlighting for cards in battle/challenge
- Accessible text contrast ratios maintained

### `game-board/` - Game Board Component
**Purpose**: Main game layout and visual structure

**Key Features**:
- **Head-to-Head Layout**: Player on bottom, opponent on top
- **Central Table Area**: Active card display area
- **Responsive Grid**: Adapts to mobile and desktop layouts
- **"Solitaire Green" Background**: Classic card game aesthetic
- **Component Integration**: Hosts other game components

**Layout Structure**:
- **Top Section**: Opponent health bar and deck area
- **Center Section**: Active cards and game messages
- **Bottom Section**: Player health bar and deck area
- **Battle Area**: Special layout for battle card selection

**Design Notes**:
- CSS Grid layout for responsive design
- Mobile-first approach with desktop enhancements
- Integrates all other game components
- Maintains classic card game visual feel

### `action-indicator/` - Action Indicator Component
**Purpose**: Visual cues for required player actions

**Key Features**:
- **Blue Glow Effect**: Indicates where player should click
- **Pulsing Animation**: Draws attention to required actions
- **Context-Sensitive**: Shows appropriate indicators based on game state
- **Accessibility**: Screen reader announcements for required actions

**States**:
- Deck click required
- Challenge decision needed
- Battle card selection required
- Game over actions

### `discard-pile-viewer/` - Discard Pile Viewer Component
**Purpose**: Display and browse discarded cards

**Key Features**:
- **Card Gallery**: Grid view of all discarded cards
- **Sorting Options**: Sort by suit, rank, or discard order
- **Search/Filter**: Find specific cards in the discard pile
- **Statistics**: Count by suit and rank
- **Modal Interface**: Overlay display without disrupting game

**Integration**:
- Connects to GameStateService for discard pile data
- Updates automatically as cards are discarded
- Provides game statistics and analysis

## Component Architecture

### Standalone Components
All components are standalone Angular components:
- No NgModule dependencies
- Direct import of required dependencies
- Tree-shakable and independently testable
- Modern Angular architecture

### Signal Integration
Components use Angular signals for reactivity:
- Input signals for component properties
- Computed signals for derived values
- Automatic UI updates when dependencies change
- OnPush change detection compatibility

### Styling Approach
- **Component Scoped**: Each component has its own SCSS file
- **Design System**: Consistent colors, spacing, and typography
- **Responsive Design**: Mobile-first with desktop enhancements
- **Animations**: CSS animations with GPU acceleration
- **Theme Support**: Light and dark theme compatibility

## Usage Guidelines

### For Component Development
1. **Use Input Signals**: All component inputs should use input() signals
2. **Computed Properties**: Use computed() for derived display values
3. **Event Emitters**: Use output() for component events
4. **Accessibility**: Include ARIA attributes and keyboard navigation
5. **Responsive Design**: Test on mobile and desktop sizes

### For Game Integration
1. **Card Component**: Use for all card displays throughout the game
2. **Health Bar**: Include in all game views for status display
3. **Game Board**: Primary container for game layout
4. **Action Indicators**: Guide player actions throughout game flow

### For Testing
1. **Component Tests**: Each component has comprehensive test coverage
2. **Visual Testing**: Test all visual states and animations
3. **Accessibility Testing**: Verify screen reader compatibility
4. **Responsive Testing**: Test on multiple screen sizes

## Dependencies
- **Angular**: Standalone components using modern Angular features
- **Angular Material**: Some components use Material Design elements
- **Core Models**: Components import Card and other game models
- **Settings Service**: Card component integrates with settings for backing patterns

## Integration Points
- **Game Component**: Primary consumer of all shared components
- **Settings Component**: Configuration for component preferences
- **Core Services**: Components bind to service signals for data
- **Animation System**: Components support game-wide animation coordination

## Performance Considerations
- **OnPush Change Detection**: All components optimized for OnPush
- **CSS Animations**: Hardware-accelerated animations for smooth performance
- **Lazy Loading**: Components only render when needed
- **Signal Efficiency**: Automatic optimization of signal-based reactivity

## Future Extensibility
- Component system supports easy addition of new game elements
- Animation system can be extended for new visual effects
- Accessibility features can be enhanced for better support
- Mobile optimizations can be improved for touch interactions

## Accessibility Features
- **Screen Reader Support**: All components provide proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **High Contrast**: Support for high contrast themes
- **Reduced Motion**: Respects user's reduced motion preferences
- **Focus Management**: Proper focus order and visual focus indicators