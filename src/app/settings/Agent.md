# Settings Component

## Purpose

The Settings component provides the routed preferences screen for player controls and game behavior. The application uses a fixed dark presentation; it does not expose a light/dark theme preference.

## Preferences

- Deck handedness
- Animation speed and automatic animation playback
- Sound effects
- Tutorial guidance and tutorial-progress reset
- Reset all preferences to defaults

The current turn and useful card/reference details are canonical presentation behavior, not player preferences.

When a match is active, the screen also offers restart and abandon actions after confirmation.

## Dependencies

- `SettingsService` persists preferences and exposes signal-backed values.
- `GameControllerService` identifies and resets active matches.
- `TutorialService` resets tutorial progress.
- `MatDialog` presents destructive-action confirmations.
- `Router` returns the player to the table after a restart or abandon action.

## Implementation Notes

Keep preference controls bound directly to `SettingsService` signals and setter methods. Add a focused service test whenever a persisted preference is added or changed.
