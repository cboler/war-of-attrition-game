/**
 * Every application-owned web-storage key must be registered here so local
 * deletion remains scoped and never clears unrelated same-origin data.
 */
export const APP_LOCAL_STORAGE_KEYS = {
  activeProfileId: 'war-of-attrition-active-profile-id',
  profiles: 'war-of-attrition-profiles',
  settings: 'war-of-attrition-settings',
  tutorialProgress: 'war-of-attrition-tutorial-progress',
  telemetryConsent: 'war-of-attrition-telemetry-consent'
} as const;

export const APP_SESSION_STORAGE_KEYS: readonly string[] = [];
