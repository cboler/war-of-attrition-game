# AdMob Configuration & Monetization Integration

This document outlines the AdMob integration for the **War of Attrition** Android application (Trusted Web Activity / Bubblewrap wrapper).

---

## 1. Architecture & Policy Compliance

- **Native Android Wrapper Only**: Advertisements are strictly integrated natively in `android/` via the Google Mobile Ads SDK (`play-services-ads`).
- **Ad-Free Web Application**: The Angular application, PWA, and GitHub Pages web builds (`docs/`) are 100% ad-free. No web ad SDKs, scripts, or ad DOM containers exist in the web code.
- **Top Anchored Banner**: A single small adaptive/standard banner is displayed at the top of the Android native frame.
- **Graceful Collapse**: If an advertisement fails to load (e.g. offline, ad inventory unavailable), the ad container collapses/hides to prevent blank space and protect player ergonomics.

---

## 2. Test Credentials (Active in Repository)

The repository is configured with Google's officially approved test IDs:

| Key | Identifier | Purpose |
|---|---|---|
| **Test Application ID** | `ca-app-pub-3940256099942544~3347511713` | Declared in `AndroidManifest.xml` via `@string/admob_app_id` |
| **Test Banner Ad Unit ID** | `ca-app-pub-3940256099942544/6300978111` | Loaded by `AdMobBannerBridge.java` via `@string/admob_banner_ad_unit_id` |

---

## 3. Transitioning to Production Credentials

When publishing production builds to Google Play:

1. Create an AdMob account and set up a new Android Application: `War of Attrition (com.cboler.warofattrition)`.
2. Create an **Anchored / Adaptive Banner Ad Unit**.
3. Provide your production IDs via Gradle build properties or environment variables during release build:
   - In `android/app/build.gradle`:
     ```groovy
     resValue "string", "admob_app_id", System.getenv("ADMOB_APP_ID") ?: "ca-app-pub-XXXXXXXXXX~YYYYYYYYYY"
     resValue "string", "admob_banner_ad_unit_id", System.getenv("ADMOB_BANNER_AD_UNIT_ID") ?: "ca-app-pub-XXXXXXXXXX/ZZZZZZZZZZ"
     ```

---

## 4. `app-ads.txt` Setup for Developer Website

To ensure ad revenue authorization and comply with Google Play / IAB standards:

1. Host an `app-ads.txt` file at the root of the developer website domain registered in Google Play Console (`https://cboler.github.io/app-ads.txt`):
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
2. Replace `pub-XXXXXXXXXXXXXXXX` with your verified Google AdMob publisher ID.
3. Validate crawling in the Google AdMob dashboard under **Apps > Manage Apps > app-ads.txt**.
