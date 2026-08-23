# AdMob Configuration & Monetization Architecture Notes

This document describes the status, experimental architecture, and configuration of the Google Mobile Ads (AdMob) scaffold for the **War of Attrition** Android application (Trusted Web Activity / Bubblewrap wrapper).

---

## 1. Monetization Status: Intentionally Deferred

- **Monetization is Deferred**: The game is currently an ad-free experience. Monetization decisions are intentionally deferred pending future UX evaluation.
- **Default Disabled (`ADS_ENABLED = false`)**: The native advertisement bridge is disabled by default in `android/app/build.gradle`.
- **100% Ad-Free Web / PWA**: The Angular application, PWA, and GitHub Pages web builds (`docs/`) are completely ad-free. No web ad SDKs, scripts, or ad DOM containers exist in the web codebase.
- **No Production Ads in Release Readiness**: Enabling production ads is explicitly out of scope for the current Google Play release-readiness milestone.

---

## 2. Architecture & Technical Debt Assessment

### Experimental TWA Overlay Scaffold
The existing implementation in `android/` (`AdMobBannerBridge.java`, `MainActivity.java`) represents an **experimental technical scaffold**, not a production-ready monetization architecture:

1. **Trusted Web Activity Constraint**: In a TWA, the game viewport is rendered via Custom Tabs / Chrome runtime. Layering native Android Views (such as an `AdView` banner) over or above the TWA surface creates complex viewport sizing, gesture-handling, and responsive reflow issues.
2. **Ergonomic Impact**: War of Attrition is an intensive card battle game requiring precise thumb reaches to the deck, stakes, drawers, and action buttons. A top-anchored or bottom-anchored banner risks obscuring tactical game elements across diverse device aspect ratios.
3. **Conclusion**: The current native banner overlay scaffold should **not** be considered production-ready. Any future monetization strategy must undergo a fresh design review before activation.

---

## 3. Test Credentials & Build Configuration

The Android application is configured exclusively with Google's official AdMob test identifiers:

| Identifier Key | Value in Repository (`android/app/build.gradle`) | Purpose |
|---|---|---|
| **Test Application ID** | `ca-app-pub-3940256099942544~3347511713` | Google official test app ID |
| **Test Banner Ad Unit ID** | `ca-app-pub-3940256099942544/6300978111` | Google official test banner ad unit ID |

### Gradle Implementation Details
- In `android/app/build.gradle`:
  ```groovy
  def resolveAdsEnabled() {
      def envVal = System.getenv("ADS_ENABLED")
      if (envVal != null && !envVal.trim().isEmpty()) {
          return Boolean.parseBoolean(envVal.trim())
      }
      def propVal = project.findProperty("ADS_ENABLED")
      if (propVal != null && !propVal.toString().trim().isEmpty()) {
          return Boolean.parseBoolean(propVal.toString().trim())
      }
      return false
  }
  ```
- The build script sets `resValue "bool", "ads_enabled", resolveAdsEnabled().toString()`.
- **Note on Environment Variables**: While `ADS_ENABLED` is dynamically evaluated, the test ad IDs (`admob_app_id` and `admob_banner_ad_unit_id`) are currently hardcoded as test strings in `build.gradle`. If production monetization is ever pursued in the future, `build.gradle` must be refactored to read production ad unit IDs from secure environment variables.

---

## 4. `app-ads.txt` Reference (Future Requirement)

If advertising is ever enabled in production in the future:
1. Google Play and IAB standards require hosting an `app-ads.txt` file at the root of the registered developer domain (`https://cboler.github.io/app-ads.txt`):
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
2. The publisher ID must match the verified Google AdMob account.
