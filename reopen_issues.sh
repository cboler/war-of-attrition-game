#!/bin/bash
# GitHub Issues Reopening Script
# This script will reopen issues that were prematurely closed based on current development status

set -e

echo "🔄 Reopening GitHub issues based on current development status..."
echo ""
echo "Analysis:"
echo "- Milestones 1-4: COMPLETED ✅ (keep issues closed)"
echo "- Milestone 5: IN_PROGRESS 🔄 (50% complete - reopen remaining items)"  
echo "- Milestones 6-7: NOT_STARTED ❌ (reopen all items)"
echo ""

# Check if gh CLI is available and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Define repository
REPO="cboler/war-of-attrition-game"

# Milestone 5 - Visual Polish & Animations (IN_PROGRESS - 50% complete)
echo "🎨 Reopening Milestone 5 issues (Visual Polish & Animations)..."
gh issue reopen 19 --repo $REPO && echo "✅ Issue #19: Card Animation System"
gh issue reopen 20 --repo $REPO && echo "✅ Issue #20: Battle Clash Animations"  
gh issue reopen 21 --repo $REPO && echo "✅ Issue #21: Health Bar Animations"
gh issue reopen 22 --repo $REPO && echo "✅ Issue #22: Visual Feedback System"
echo ""

# Milestone 6 - Settings & Customization (NOT_STARTED)
echo "⚙️ Reopening Milestone 6 issues (Settings & Customization)..."
gh issue reopen 23 --repo $REPO && echo "✅ Issue #23: Settings Menu Implementation"
gh issue reopen 24 --repo $REPO && echo "✅ Issue #24: Card Backing Customization"
gh issue reopen 25 --repo $REPO && echo "✅ Issue #25: Discard Pile Viewer"
gh issue reopen 26 --repo $REPO && echo "✅ Issue #26: Game Statistics"
echo ""

# Milestone 7 - Testing & Polish (NOT_STARTED)
echo "🧪 Reopening Milestone 7 issues (Testing & Polish)..."
gh issue reopen 27 --repo $REPO && echo "✅ Issue #27: Unit Testing Suite"
gh issue reopen 28 --repo $REPO && echo "✅ Issue #28: Integration Testing"
gh issue reopen 29 --repo $REPO && echo "✅ Issue #29: Performance Optimization"
gh issue reopen 30 --repo $REPO && echo "✅ Issue #30: Accessibility & Final Polish"
echo ""

# Additional issues that need reopening based on bug reports
echo "🐛 Reopening additional issues based on bug reports..."
gh issue reopen 71 --repo $REPO && echo "✅ Issue #71: Settings are not fully implemented"
gh issue reopen 69 --repo $REPO && echo "✅ Issue #69: Opponent never challenges"
echo ""

echo "🎉 Successfully reopened 14 issues!"
echo ""
echo "Summary:"
echo "- Milestone 5 (IN_PROGRESS): 4 issues reopened"
echo "- Milestone 6 (NOT_STARTED): 4 issues reopened"
echo "- Milestone 7 (NOT_STARTED): 4 issues reopened"
echo "- Additional bug fixes: 2 issues reopened"
echo ""
echo "These issues now reflect the actual remaining work as documented in:"
echo "- .github/instructions/README.md" 
echo "- .github/instructions/progress-data.json"
echo "- .github/instructions/development-milestones.md"
