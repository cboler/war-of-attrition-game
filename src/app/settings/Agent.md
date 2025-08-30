# Settings Component - Agent Documentation

## Purpose
The Settings component provides a comprehensive user interface for configuring game preferences, visual options, and application settings. It serves as a central hub for user customization and includes advanced features like settings import/export, theme management, and accessibility options.

## Component Architecture

### Component Structure
```typescript
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule, 
    MatButtonModule, 
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings
```

### Key Features
- **Tabbed Interface**: Organized settings categories for easy navigation
- **Real-time Preview**: Changes applied immediately with visual feedback
- **Import/Export**: Settings backup and sharing functionality
- **Accessibility Options**: Visual and interaction accessibility settings
- **Theme Management**: Light/dark mode with system preference detection
- **Game Customization**: Card backing patterns and gameplay options

## Settings Categories

### 1. Theme & Appearance
**Purpose**: Visual customization and theme preferences

**Options**:
- **Theme Mode**: Light, Dark, or System Auto
- **Card Backing Pattern**: Multiple visual patterns for card backs
- **Animation Settings**: Enable/disable animations and effects
- **Color Preferences**: Custom color schemes and contrast options

**Implementation**:
```typescript
// Theme toggle integration
onThemeChange(theme: 'light' | 'dark' | 'auto') {
  this.settingsService.updateTheme(theme);
}

// Card backing selection
onCardBackingChange(pattern: string) {
  this.settingsService.updateCardBacking(pattern);
}
```

### 2. Game Options
**Purpose**: Gameplay behavior and difficulty settings

**Options**:
- **Animation Speed**: Control card animation timing
- **Auto-actions**: Automatic opponent moves and timing
- **Difficulty Level**: AI opponent difficulty settings
- **Sound Effects**: Audio feedback enable/disable

**Features**:
- Real-time preview of animation speeds
- AI difficulty with visible strategy changes
- Sound effect testing buttons

### 3. Accessibility
**Purpose**: Accessibility and usability enhancements

**Options**:
- **High Contrast Mode**: Enhanced visual contrast
- **Reduced Motion**: Minimize animations for motion sensitivity
- **Large Text**: Increased font sizes throughout app
- **Screen Reader Enhancements**: Additional ARIA labels and announcements
- **Keyboard Navigation**: Enhanced keyboard shortcuts

**Implementation**:
```typescript
// Accessibility options
onHighContrastToggle(enabled: boolean) {
  this.settingsService.updateAccessibility('highContrast', enabled);
}

onReducedMotionToggle(enabled: boolean) {
  this.settingsService.updateAccessibility('reducedMotion', enabled);
}
```

### 4. Data Management
**Purpose**: Settings backup, restore, and data management

**Features**:
- **Export Settings**: Download settings as JSON file
- **Import Settings**: Upload and restore settings from file
- **Reset to Defaults**: Restore all settings to initial values
- **Settings Validation**: Verify imported settings integrity

**Methods**:
```typescript
// Export settings to file
onExportSettings(): void {
  const settings = this.settingsService.exportSettings();
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'war-of-attrition-settings.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Import settings from file
onImportSettings(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        this.settingsService.importSettings(settings);
        this.showSuccessMessage('Settings imported successfully');
      } catch (error) {
        this.showErrorMessage('Invalid settings file');
      }
    };
    reader.readAsText(file);
  }
}
```

## Service Integration

### SettingsService Integration
The component deeply integrates with SettingsService:

```typescript
constructor(
  public settingsService: SettingsService,
  private dialog: MatDialog,
  private snackBar: MatSnackBar
) {}

// Direct binding to service signals
get currentTheme() {
  return this.settingsService.currentTheme();
}

get cardBackingPattern() {
  return this.settingsService.cardBacking();
}

get accessibilityOptions() {
  return this.settingsService.accessibilitySettings();
}
```

### Real-time Updates
Settings changes are applied immediately:
- Theme changes reflect instantly across the app
- Card backing changes show preview in real-time
- Animation settings affect immediate visual feedback
- Accessibility changes apply without page refresh

## User Experience Features

### Dialog Integration
Settings uses Material dialogs for confirmations:

```typescript
// Confirmation dialogs for destructive actions
showConfirmDialog(title: string, message: string): Observable<boolean> {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: { title, message }
  });
  
  return dialogRef.afterClosed();
}

// Reset settings with confirmation
onResetSettings(): void {
  this.showConfirmDialog(
    'Reset Settings',
    'Are you sure you want to reset all settings to default values? This action cannot be undone.'
  ).subscribe(result => {
    if (result) {
      this.settingsService.resetSettings();
      this.showSuccessMessage('Settings reset to defaults');
    }
  });
}
```

### Snackbar Notifications
User feedback through Material snackbars:

```typescript
// Success notifications
showSuccessMessage(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
    panelClass: ['success-snackbar']
  });
}

// Error notifications
showErrorMessage(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000,
    panelClass: ['error-snackbar']
  });
}
```

## Template Structure

### Tabbed Interface
```html
<mat-tab-group class="settings-tabs">
  <!-- Theme & Appearance Tab -->
  <mat-tab label="Theme & Appearance">
    <div class="settings-section">
      <mat-card class="setting-card">
        <mat-card-header>
          <mat-card-title>Theme Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Theme toggle controls -->
          <mat-slide-toggle 
            [checked]="settingsService.isDarkMode()"
            (change)="onThemeToggle($event.checked)">
            Dark Mode
          </mat-slide-toggle>
          
          <!-- Card backing selection -->
          <mat-form-field>
            <mat-label>Card Backing Pattern</mat-label>
            <mat-select 
              [value]="settingsService.cardBacking()"
              (selectionChange)="onCardBackingChange($event.value)">
              <mat-option value="classic">Classic Blue</mat-option>
              <mat-option value="red">Red Pattern</mat-option>
              <mat-option value="green">Green Pattern</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>
    </div>
  </mat-tab>

  <!-- Game Options Tab -->
  <mat-tab label="Game Options">
    <!-- Game configuration controls -->
  </mat-tab>

  <!-- Accessibility Tab -->
  <mat-tab label="Accessibility">
    <!-- Accessibility options -->
  </mat-tab>

  <!-- Data Management Tab -->
  <mat-tab label="Data Management">
    <!-- Import/Export controls -->
  </mat-tab>
</mat-tab-group>
```

### Responsive Design
The settings interface adapts to different screen sizes:
- Mobile: Single column layout with full-width cards
- Tablet: Two-column layout for better space utilization
- Desktop: Three-column layout with expanded controls

## Styling and Theming

### Component Styling
```scss
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
}

.settings-tabs {
  .mat-tab-body-content {
    padding: 24px 0;
  }
}

.setting-card {
  margin-bottom: 24px;
  
  .mat-card-header {
    padding-bottom: 16px;
  }
  
  .mat-card-content {
    .mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
  }
}
```

### Theme Integration
Settings component respects and controls the app-wide theme:
- Inherits current theme colors
- Provides theme switching controls
- Updates theme across entire application
- Maintains theme persistence

## Data Validation and Error Handling

### Settings Validation
```typescript
// Validate imported settings structure
validateSettings(settings: any): boolean {
  const requiredFields = ['theme', 'cardBacking', 'accessibility'];
  return requiredFields.every(field => settings.hasOwnProperty(field));
}

// Handle validation errors
onImportSettings(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        if (!this.validateSettings(settings)) {
          throw new Error('Invalid settings structure');
        }
        
        this.settingsService.importSettings(settings);
        this.showSuccessMessage('Settings imported successfully');
      } catch (error) {
        console.error('Settings import error:', error);
        this.showErrorMessage('Invalid settings file format');
      }
    };
    reader.readAsText(file);
  }
}
```

### Error Recovery
- Invalid settings revert to previous values
- Import errors show clear user feedback
- Validation prevents corrupted settings
- Automatic fallback to default values when needed

## Accessibility Features

### Screen Reader Support
- Comprehensive ARIA labels for all controls
- Form field descriptions and help text
- Live announcements for setting changes
- Logical tab order throughout interface

### Keyboard Navigation
- Full keyboard accessibility for all controls
- Tab navigation through all interactive elements
- Enter/Space activation for buttons and toggles
- Escape key to close dialogs

### Visual Accessibility
- High contrast mode affects settings interface
- Scalable text throughout the component
- Color-blind friendly indicators and feedback
- Focus indicators for keyboard navigation

## Testing Integration

### Component Testing
The Settings component includes comprehensive tests:
- Unit tests for all setting change methods
- Integration tests with SettingsService
- Dialog interaction testing
- Import/export functionality testing

### User Interaction Testing
- Theme switching validation
- Settings persistence verification
- Import/export file handling
- Error condition handling

## Performance Considerations

### Optimization Strategies
- OnPush change detection for optimal performance
- Lazy loading of large setting categories
- Efficient file handling for import/export
- Minimal DOM updates during setting changes

### Memory Management
- Proper cleanup of file readers
- Dialog reference cleanup
- Subscription management for service updates
- Efficient theme application

## Integration Points

### Application Integration
- Routes from main app navigation
- Integrates with app-wide theme system
- Shares settings with all other components
- Provides configuration for game component

### Service Dependencies
- **SettingsService**: Primary integration for all settings
- **MatDialog**: For confirmation dialogs
- **MatSnackBar**: For user feedback notifications
- **Router**: For navigation back to game

## Future Extensibility

### Planned Enhancements
- Cloud settings synchronization
- User profile management
- Advanced game statistics configuration
- Social sharing preferences

### Architecture Support
- Component structure supports easy addition of new setting categories
- Service integration allows for complex setting types
- Validation system supports custom setting validators
- Import/export system can handle extended setting schemas