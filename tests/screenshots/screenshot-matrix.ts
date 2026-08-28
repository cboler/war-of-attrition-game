export type DeviceCategory = 'phone' | 'tablet-7in' | 'tablet-10in';

export interface ScreenshotTarget {
  readonly id: string;
  readonly filename: string;
  readonly scene: string;
  readonly deviceCategory: DeviceCategory;
  readonly layoutDescription: string;
  readonly sceneDescription: string;
  readonly responsiveBreakpoint: string;
  readonly cssViewport: { width: number; height: number };
  readonly deviceScaleFactor: number;
  readonly outputDimensions: { width: number; height: number };
  readonly recommendedOrder: number;
  readonly suggestedAltText: string;
  readonly expectedSelectors: readonly string[];
}

export const SCREENSHOT_TARGETS: readonly ScreenshotTarget[] = [
  // -------------------------------------------------------------
  // PHONE PORTRAIT (1080 x 1920, 9:16)
  // -------------------------------------------------------------
  {
    id: 'phone-01-clash',
    filename: '01-active-clash.png',
    scene: 'clash',
    deviceCategory: 'phone',
    layoutDescription: 'Phone Portrait (Handheld Mobile)',
    sceneDescription: 'Active card clash duel with comparison power badges and tactical feedback',
    responsiveBreakpoint: 'max-width: 620px',
    cssViewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1080, height: 1920 },
    recommendedOrder: 1,
    suggestedAltText: 'War of Attrition mobile clash showing high-card comparison and power badges.',
    expectedSelectors: ['.playfield', '.stakes', '.active-card-shell', '.rail-top .quip'],
  },
  {
    id: 'phone-02-challenge',
    filename: '02-tactical-challenge.png',
    scene: 'challenge',
    deviceCategory: 'phone',
    layoutDescription: 'Phone Portrait (Handheld Mobile)',
    sceneDescription: 'Tactical reinforcement decision with Challenge and Concede action buttons',
    responsiveBreakpoint: 'max-width: 620px',
    cssViewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1080, height: 1920 },
    recommendedOrder: 2,
    suggestedAltText: 'Tactical challenge decision prompt with Challenge and Concede thumb actions.',
    expectedSelectors: ['.playfield', '.thumb-action-region', '.player-callout', 'button.thumb-action.primary'],
  },
  {
    id: 'phone-03-battle',
    filename: '03-deadlock-battle.png',
    scene: 'battle',
    deviceCategory: 'phone',
    layoutDescription: 'Phone Portrait (Handheld Mobile)',
    sceneDescription: 'Multi-layer deadlock Battle with 3 committed cards per side and foe targeting',
    responsiveBreakpoint: 'max-width: 620px',
    cssViewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1080, height: 1920 },
    recommendedOrder: 3,
    suggestedAltText: 'Multi-layer deadlock battle with 3 committed cards and champion selector.',
    expectedSelectors: ['.battle-layers', '.opponent-layers', '.target-pointer', '.stakes.in-battle'],
  },
  {
    id: 'phone-04-manual',
    filename: '04-field-manual.png',
    scene: 'manual',
    deviceCategory: 'phone',
    layoutDescription: 'Phone Portrait (Handheld Mobile)',
    sceneDescription: 'Field Manual drawer open displaying tactical Rules of Engagement and battle chronicle',
    responsiveBreakpoint: 'max-width: 620px',
    cssViewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1080, height: 1920 },
    recommendedOrder: 4,
    suggestedAltText: 'Field Manual drawer with Rules of Engagement and tactical battle chronicle.',
    expectedSelectors: ['app-story-book-drawer', '.story-book-drawer', '.drawer-content'],
  },
  {
    id: 'phone-05-profile',
    filename: '05-commander-profile.png',
    scene: 'profile',
    deviceCategory: 'phone',
    layoutDescription: 'Phone Portrait (Handheld Mobile)',
    sceneDescription: 'Commander profile modal displaying career statistics and unlocked achievements',
    responsiveBreakpoint: 'max-width: 620px',
    cssViewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1080, height: 1920 },
    recommendedOrder: 5,
    suggestedAltText: 'Commander profile dialog with career win rate, stats, and achievements.',
    expectedSelectors: ['app-profile-dialog', '.profile-dialog-container', '.dialog-tabs'],
  },

  // -------------------------------------------------------------
  // 7-INCH TABLET PORTRAIT (1200 x 1920, 10:16)
  // -------------------------------------------------------------
  {
    id: 'tablet7-01-battle',
    filename: '01-deadlock-battle.png',
    scene: 'battle',
    deviceCategory: 'tablet-7in',
    layoutDescription: '7-inch Tablet Portrait (Intermediate Band)',
    sceneDescription: 'Intermediate tablet battle layout with expanded side stakes and utility hub',
    responsiveBreakpoint: '620px - 820px',
    cssViewport: { width: 600, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1200, height: 1920 },
    recommendedOrder: 1,
    suggestedAltText: '7-inch tablet layout displaying multi-layer battle and cards at stake.',
    expectedSelectors: ['.battle-layers', '.stakes.in-battle', '.table-utility-hub'],
  },
  {
    id: 'tablet7-02-boneyard',
    filename: '02-boneyard-casualties.png',
    scene: 'boneyard',
    deviceCategory: 'tablet-7in',
    layoutDescription: '7-inch Tablet Portrait (Intermediate Band)',
    sceneDescription: 'Boneyard casualty drawer open showing public discard grid and fan stack',
    responsiveBreakpoint: '620px - 820px',
    cssViewport: { width: 600, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1200, height: 1920 },
    recommendedOrder: 2,
    suggestedAltText: 'Public Boneyard casualty drawer on a 7-inch tablet display.',
    expectedSelectors: ['.boneyard-drawer', '.boneyard-grid', '.boneyard.has-cards'],
  },
  {
    id: 'tablet7-03-victory',
    filename: '03-war-victory.png',
    scene: 'victory',
    deviceCategory: 'tablet-7in',
    layoutDescription: '7-inch Tablet Portrait (Intermediate Band)',
    sceneDescription: 'War victory summary card with match metrics and rematch actions',
    responsiveBreakpoint: '620px - 820px',
    cssViewport: { width: 600, height: 960 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 1200, height: 1920 },
    recommendedOrder: 3,
    suggestedAltText: 'Victory resolution screen showing battle metrics and rematch action.',
    expectedSelectors: ['app-game-over-summary', '.game-over', '.game-over-stats', 'button.game-over-btn.primary'],
  },

  // -------------------------------------------------------------
  // 10-INCH TABLET / DESKTOP (2560 x 1600, 16:10)
  // -------------------------------------------------------------
  {
    id: 'tablet10-01-clash',
    filename: '01-tabletop-clash.png',
    scene: 'clash',
    deviceCategory: 'tablet-10in',
    layoutDescription: '10-inch Tablet / Desktop Tabletop (Widescreen Grid)',
    sceneDescription: 'Spacious tabletop grid layout with active clash, quip, and utility hub',
    responsiveBreakpoint: 'min-width: 1100px (Desktop Tabletop Grid)',
    cssViewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 2560, height: 1600 },
    recommendedOrder: 1,
    suggestedAltText: '10-inch widescreen tabletop view of War of Attrition card combat.',
    expectedSelectors: ['.table-page', '.playfield', '.table-utility-hub', '.stakes'],
  },
  {
    id: 'tablet10-02-battle',
    filename: '02-multi-layer-battle.png',
    scene: 'battle',
    deviceCategory: 'tablet-10in',
    layoutDescription: '10-inch Tablet / Desktop Tabletop (Widescreen Grid)',
    sceneDescription: 'Widescreen multi-layer deadlock battle with full cards at stake and target pointer',
    responsiveBreakpoint: 'min-width: 1100px (Desktop Tabletop Grid)',
    cssViewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 2560, height: 1600 },
    recommendedOrder: 2,
    suggestedAltText: 'Tabletop multi-layer battle deadlock on a large tablet display.',
    expectedSelectors: ['.battle-layers', '.stakes.in-battle', '.target-pointer'],
  },
  {
    id: 'tablet10-03-manual',
    filename: '03-field-manual.png',
    scene: 'manual',
    deviceCategory: 'tablet-10in',
    layoutDescription: '10-inch Tablet / Desktop Tabletop (Widescreen Grid)',
    sceneDescription: 'Tabletop Field Manual drawer open alongside the active game table',
    responsiveBreakpoint: 'min-width: 1100px (Desktop Tabletop Grid)',
    cssViewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    outputDimensions: { width: 2560, height: 1600 },
    recommendedOrder: 3,
    suggestedAltText: 'Widescreen Field Manual tactical guide open on the card tabletop.',
    expectedSelectors: ['app-story-book-drawer', '.story-book-drawer', '.drawer-content'],
  },
];
