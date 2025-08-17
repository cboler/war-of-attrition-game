#!/usr/bin/env bash
set -euo pipefail

REPO="cboler/war-of-attrition-game"
DRY_RUN="${DRY_RUN:-false}"

echo "📝 Creating ALL GitHub Issues for War of Attrition Game"
echo "Repo: $REPO"
echo "DRY_RUN: $DRY_RUN"
echo "=========================================="

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' not found in PATH." >&2
    exit 1
  fi
}
need_cmd gh

# Milestone titles (source of truth)
M1="Foundation & Setup"
M2="Core Game Engine"
M3="Basic UI Components"
M4="Game Mechanics Implementation"
M5="Visual Polish & Animations"
M6="Settings & Customization"
M7="Testing & Polish"

# Validate milestones exist by title
echo "🔍 Validating milestone titles..."
missing=()
for mt in "$M1" "$M2" "$M3" "$M4" "$M5" "$M6" "$M7"; do
  if ! gh api repos/$REPO/milestones --jq ".[] | select(.title==\"$mt\") | .title" | grep -Fqx "$mt"; then
    missing+=("$mt")
  fi
done
if (( ${#missing[@]} )); then
  echo "❌ These milestone titles were not found: ${missing[*]}" >&2
  echo "   Check that they exist exactly as spelled." >&2
  exit 1
fi
echo "✅ All milestone titles verified."

# Helper: check if an issue with this exact title already exists (open or closed)
issue_exists() {
  local title="$1"
  # gh issue list only searches open by default; include --state all
  gh issue list --repo "$REPO" --state all --search "\"$title\" in:title" --json title --jq ".[] | select(.title==\"$title\") | .title" | grep -Fqx "$title"
}

create_issue () {
  local title="$1"
  local milestone_title="$2"
  local body="$3"
  shift 3
  local labels=("$@")

  echo "→ $title (milestone: $milestone_title)"

  if issue_exists "$title"; then
    echo "  ⚠ Skipping (issue already exists)"
    return 0
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  (DRY_RUN) Labels: ${labels[*]}"
    return 0
  fi

  local label_args=()
  for l in "${labels[@]}"; do
    label_args+=(--label "$l")
  done

  if ! gh issue create \
      --repo "$REPO" \
      --title "$title" \
      --milestone "$milestone_title" \
      "${label_args[@]}" \
      --body "$body" >/dev/null; then
    echo "  ❌ Failed creating: $title" >&2
    exit 1
  fi
  echo "  ✔ Created"
}

echo "📋 Milestone 1 ($M1)"
create_issue "Project Infrastructure Setup" "$M1" "## User Story
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
  enhancement milestone-1

create_issue "Basic Routing and Navigation" "$M1" "## User Story
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
  enhancement milestone-1 priority-high

create_issue "Theme System Implementation" "$M1" "## User Story
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
  enhancement milestone-1 priority-high

create_issue "Responsive Layout Foundation" "$M1" "## User Story
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
  enhancement milestone-1 priority-high

echo "📋 Milestone 2 ($M2)"
create_issue "Card and Deck Models" "$M2" "## User Story
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
  enhancement milestone-2 priority-high

create_issue "Game State Management" "$M2" "## User Story
As a developer, I want centralized game state management so that the game can track turns, cards, and player status
..." \
  enhancement milestone-2 priority-high

create_issue "Card Comparison Logic" "$M2" "## User Story
As a developer, I want robust card comparison logic so that game rules are enforced correctly
..." \
  enhancement milestone-2 priority-high

create_issue "Turn Resolution Engine" "$M2" "## User Story
As a developer, I want a turn resolution system so that game outcomes are processed correctly
..." \
  enhancement milestone-2 priority-high

echo "📋 Milestone 3 ($M3)"
create_issue "Game Board Layout" "$M3" "## User Story
As a player, I want a clear game board layout so that I can understand the game state at a glance
..." \
  enhancement milestone-3 priority-high

create_issue "Card Component" "$M3" "## User Story
As a player, I want visually appealing card representations so that the game feels polished
..." \
  enhancement milestone-3 priority-high

create_issue "Health Bar Component" "$M3" "## User Story
As a player, I want to see health bars representing card counts so that I can quickly assess the game state
..." \
  enhancement milestone-3 priority-medium

create_issue "Player Action Indicators" "$M3" "## User Story
As a player, I want clear visual cues for required actions so that I know what to do next
..." \
  enhancement milestone-3 priority-medium

echo "📋 Milestone 4 ($M4)"
create_issue "Basic Turn Flow" "$M4" "## User Story
As a player, I want to click my deck to start turns so that the game progresses at my pace
..." \
  enhancement milestone-4 priority-high

create_issue "Challenge System" "$M4" "## User Story
As a player, when I lose a turn, I want the option to challenge so I have a chance to save my card
..." \
  enhancement milestone-4 priority-high

create_issue "Battle System" "$M4" "## User Story
As a player, I want engaging battle mechanics when cards tie so that the game feels dynamic
..." \
  enhancement milestone-4 priority-high

create_issue "Game End Conditions" "$M4" "## User Story
As a player, I want the game to clearly declare victory or defeat so I know when the game is over
..." \
  enhancement milestone-4 priority-high

echo "📋 Milestone 5 ($M5)"
create_issue "Card Animation System" "$M5" "## User Story
As a player, I want to see cards animate as they move so that the game feels lively and engaging
..." \
  enhancement milestone-5 priority-medium

create_issue "Battle Clash Animations" "$M5" "## User Story
As a player, I want exciting battle animations so that conflicts feel impactful
..." \
  enhancement milestone-5 priority-medium

create_issue "Health Bar Animations" "$M5" "## User Story
As a player, I want to see health changes animate so that damage is clear and impactful
..." \
  enhancement milestone-5 priority-low

create_issue "Visual Feedback System" "$M5" "## User Story
As a player, I want clear visual feedback for all my actions so that I understand what's happening
..." \
  enhancement milestone-5 priority-low

echo "📋 Milestone 6 ($M6)"
create_issue "Settings Menu Implementation" "$M6" "## User Story
As a player, I want access to a settings menu so that I can customize my experience
..." \
  enhancement milestone-6 priority-medium

create_issue "Card Backing Customization" "$M6" "## User Story
As a player, I want to choose my card backing design so that I can personalize my cards
..." \
  enhancement milestone-6 priority-low

create_issue "Discard Pile Viewer" "$M6" "## User Story
As a player, I want to view the discard pile so that I can see which cards are out of play
..." \
  enhancement milestone-6 priority-low

create_issue "Game Statistics" "$M6" "## User Story
As a player, I want to see game statistics so that I can track my performance
..." \
  enhancement milestone-6 priority-low

echo "📋 Milestone 7 ($M7)"
create_issue "Unit Testing Suite" "$M7" "## User Story
As a developer, I want comprehensive unit tests so that game logic is reliable
..." \
  enhancement milestone-7 priority-high

create_issue "Integration Testing" "$M7" "## User Story
As a developer, I want integration tests so that component interactions work correctly
..." \
  enhancement milestone-7 priority-medium

create_issue "Performance Optimization" "$M7" "## User Story
As a player, I want the game to run smoothly so that my experience is not hindered by lag
..." \
  enhancement milestone-7 priority-medium

create_issue "Accessibility & Final Polish" "$M7" "## User Story
As a player with accessibility needs, I want the game to be fully accessible so that I can play regardless of my abilities
..." \
  enhancement milestone-7 priority-high

echo "✅ Finished (DRY_RUN=$DRY_RUN)"
echo "🔗 https://github.com/$REPO/issues"