# GitHub Milestones and Issues Automation

This directory contains automation scripts for creating GitHub milestones and issues based on the development milestones documentation.

## Quick Start

### Prerequisites

1. **GitHub CLI installed**: [Install GitHub CLI](https://cli.github.com/)
2. **Authenticated with GitHub**: Run `gh auth login`
3. **Repository access**: Ensure you have admin/write access to the repository

### Option 1: Complete Automation (Recommended)

Run the complete setup script to create everything at once:

```bash
# From repository root
./github/scripts/create-github-milestones.sh
./github/scripts/create-all-issues.sh
```

This will create:
- ✅ 7 GitHub Milestones with due dates
- ✅ 27 GitHub Issues with detailed acceptance criteria
- ✅ Organized labels for better project management

### Option 2: Step-by-Step Creation

1. **Create milestones first**:
```bash
./github/scripts/create-github-milestones.sh
```

2. **Then create all issues**:
```bash
./github/scripts/create-all-issues.sh
```

### Option 3: Manual Creation

Follow the detailed instructions in [`create-milestones-and-issues.md`](../create-milestones-and-issues.md) for manual creation via GitHub web interface.

## What Gets Created

### 7 Development Milestones
1. **Foundation & Setup** - Basic infrastructure and navigation
2. **Core Game Engine** - Game logic and data structures  
3. **Basic UI Components** - Visual game components
4. **Game Mechanics Implementation** - Interactive gameplay
5. **Visual Polish & Animations** - Enhanced user experience
6. **Settings & Customization** - Player personalization
7. **Testing & Polish** - Quality assurance and accessibility

### 27 Detailed Issues
Each issue includes:
- 📝 User story explaining the feature
- ✅ Detailed acceptance criteria as checkboxes
- 🏷️ Appropriate labels for organization
- 🎯 Assigned to correct milestone
- 📋 Implementation notes and guidance
- 🔄 Current status (completed/in-progress/not-started)

### Organizational Labels
- `milestone-1` through `milestone-7` (milestone tracking)
- `enhancement` (new features)
- `priority-high`, `priority-medium`, `priority-low` (prioritization)
- Additional standard labels as needed

## Project Structure After Creation

```
GitHub Repository
├── Milestones (7 total)
│   ├── Foundation & Setup (4 issues)
│   ├── Core Game Engine (4 issues)
│   ├── Basic UI Components (4 issues)
│   ├── Game Mechanics Implementation (4 issues)
│   ├── Visual Polish & Animations (4 issues)
│   ├── Settings & Customization (4 issues)
│   └── Testing & Polish (4 issues)
│
├── Issues (27 total)
│   ├── [Each with detailed acceptance criteria]
│   ├── [Properly labeled and categorized]
│   └── [Assigned to appropriate milestone]
│
└── Labels
    ├── Milestone labels (milestone-1 to milestone-7)
    ├── Priority labels (high/medium/low)
    └── Type labels (enhancement, etc.)
```

## Current Development Status

Based on the analysis in `current-development-status.md`, the project is currently in **Milestone 1** with:

- ✅ **Issue 1.1**: Project Infrastructure Setup (COMPLETED)
- 🔄 **Issue 1.2**: Basic Routing and Navigation (IN PROGRESS)
- 🔄 **Issue 1.3**: Theme System Implementation (IN PROGRESS)  
- ❌ **Issue 1.4**: Responsive Layout Foundation (NOT STARTED)

## Development Workflow

1. **Start with Milestone 1** - Complete remaining foundation items
2. **Progress sequentially** - Each milestone builds on the previous
3. **Use GitHub Projects** - Create project board from milestones
4. **Track progress** - Update issue checkboxes as work is completed
5. **Review regularly** - Use milestones to track overall progress

## Customization

### Modifying Due Dates
Edit the date calculations in `create-github-milestones.sh`:
```bash
# Currently set to 2-week intervals
MILESTONE1_DUE=$(date -d "today + 2 weeks" +"%Y-%m-%d")
MILESTONE2_DUE=$(date -d "today + 4 weeks" +"%Y-%m-%d")
# ... etc
```

### Adding/Modifying Issues
To add new issues or modify existing ones:
1. Edit `create-all-issues.sh`
2. Follow the existing pattern for issue creation
3. Ensure proper labeling and milestone assignment

### Custom Labels
Modify the label creation section in the scripts to add project-specific labels.

## Troubleshooting

### Script Fails with Authentication Error
```bash
gh auth login
gh auth status
```

### Issues Already Exist
The scripts will continue if milestones/issues already exist. Existing items won't be duplicated.

### Missing Milestone Numbers
If milestones aren't found, ensure they were created successfully first:
```bash
gh api repos/cboler/war-of-attrition-game/milestones
```

## Integration with Development

### VS Code Integration
Install the GitHub Pull Requests and Issues extension to manage issues directly from your editor.

### Project Boards
Create a GitHub Project board and link it to the milestones for Kanban-style workflow management.

### CI Integration
Issues can be automatically closed by commit messages:
```bash
git commit -m "Implement responsive layout foundation

Closes #4"
```

## Next Steps

After creating milestones and issues:

1. **Review and prioritize** the issues based on current project needs
2. **Create a GitHub Project board** for better visual workflow management
3. **Start with Milestone 1** incomplete items
4. **Update issue progress** as development progresses
5. **Use milestone reviews** to assess project progress

## Support

- 📚 Reference: [`development-milestones.md`](../development-milestones.md) for complete details
- 📋 Manual instructions: [`create-milestones-and-issues.md`](../create-milestones-and-issues.md)
- 🎯 Original requirements: [`war-of-attrition-requirements.md`](../war-of-attrition-requirements.md)