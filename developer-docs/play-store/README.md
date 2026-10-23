# Google Play Internal Testing Setup & Owner Guide

This guide details the exact steps to configure Google Play Console, link your existing Google Cloud project, build release bundles, and launch the game for **Google Play Internal Testing**.

For getting from closed testing to production access (and why open testing is locked until then), see [`production-access-plan.md`](./production-access-plan.md).

---

## 📋 Prerequisites & Toolchain Requirements

To build Android APKs and App Bundles (`.aab`) locally:

1. **Java Development Kit (JDK):** JDK 17 (e.g. OpenJDK 17 or Temurin 17).
2. **Android SDK:** Android SDK Command-line Tools / Android Studio with SDK Platform 36 and Build-Tools 36.0.0 installed.
3. **Environment Variables:**
   - `JAVA_HOME` pointing to JDK 17 installation.
   - `ANDROID_HOME` pointing to Android SDK directory.
   - Add `$JAVA_HOME/bin` and `$ANDROID_HOME/platform-tools` to system `PATH`.
4. **Node & NPM:** Node 22 or 24 LTS and npm 10+ (CI uses Node 24).

---

## 🚀 Building Android Artifacts

The release-candidate AAB is produced by `.github/workflows/build-android-bundle.yml`. Run it manually (Actions → Build Android App Bundle → Run workflow) or publish a GitHub release whose tag is `v` plus the `package.json` version (for example `v4.4.0`); tags such as `v1.1.1b` fail the version check by design. With no version inputs, the workflow reads the authoritative version name from `package.json` and derives its packed numeric version code. Any manually supplied or tag-derived version name must match `package.json` exactly or the job fails before Gradle runs, preventing the Android and hosted identities from silently diverging. The workflow runs the Android unit tests before bundling, then publishes the AAB and its R8 `mapping.txt` together in the `app-release-aab` artifact and passes the configured `PLAY_GAMES_PROJECT_ID` repository variable, falling back to the supplied numeric ID `334487063631`. The AAB also embeds that mapping under `BUNDLE-METADATA`; the separate copy is retained for crash deobfuscation and release diagnostics. This Java-only wrapper currently packages no native libraries, so there is no native debug-symbol archive to upload.

### 1. Build Angular PWA Production Assets
```bash
npm install
npm run build:prod
```
*Output:* Production web files generated in `docs/` with `404.html` SPA routing fallback.

### 2. Generate Local Android Test APK
From the `android/` directory:
```bash
cd android
./gradlew assembleDebug
```
*(On Windows PowerShell: `.\gradlew.bat assembleDebug`)*

*Output APK:*  
`android/app/build/outputs/apk/debug/app-debug.apk`

*Install on connected phone / emulator via ADB:*
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 3. Generate Release Android App Bundle (`.aab`) for Google Play
Set your signing environment variables:
```bash
# Windows PowerShell
$env:WAR_UPLOAD_KEYSTORE_PATH="C:\path\to\your\release-upload.keystore"
$env:WAR_UPLOAD_KEY_ALIAS="your-key-alias"
$env:WAR_UPLOAD_KEYSTORE_PASSWORD="your-keystore-password"
$env:WAR_UPLOAD_KEY_PASSWORD="your-key-password"

cd android
.\gradlew.bat bundleRelease
```

*Output AAB:*  
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Android app and Play Games bridge

Since 4.4.1 the Android app hosts the game in an **in-app WebView** (`MainActivity`) instead of a Trusted Web Activity. It still loads the hosted PWA (`https://cboler.github.io/war-of-attrition-game/?twa=1`; the `twa` parameter is kept so GA4 landing-page filters keep working), so web deploys reach players immediately. Why the switch, and what was measured, is in [`webview-vs-twa.md`](./webview-vs-twa.md). Local achievements and career stats remain canonical and never depend on the bridge.

### What the native layer does

1. **Bridge.** `MainActivity` injects `window.AttritionNative` with `WebViewCompat.addWebMessageListener`, restricted to `https://cboler.github.io` (debug builds also allow a localhost dev server). `TwaPostMessageService` in the web app says hello (`TWA_PORT_HANDSHAKE`) over it on every page load and retries up to three times if no `TWA_PORT_READY` comes back. Message names keep their TWA-era spelling; they are the shared protocol.
2. **Routing.** `NativeBridgeRouter` routes page messages to `PlayGamesBridge` (sign-in, achievements) and `PlayGameStatsBridge` (Game Stats), and buffers native replies (up to 50) whenever no page is connected: before the first hello, after a navigation, or after a renderer crash.
3. **Identity.** Google blocks web sign-in inside WebViews, so the app hides "Sign in with Google". When Play Games signs in, `PlayGamesBridge` sends `PLAY_GAMES_PLAYER` (display name, then a 96 px PNG avatar as a data URL). `AuthService.applyPlayGamesIdentity` shows them on the local guest profile; a name the player typed themselves is never overwritten. Nothing leaves the device and no player ID is sent.
4. **Housekeeping.** Splash screen until the first paint (max 4 s); edge-to-edge with system-bar insets; links to other sites open in a Chrome Custom Tab; `javascript:`, `file:`, `intent:` and `content:` navigations are blocked (`GameUrlPolicy`); a themed offline page with a retry button if the first load fails; the WebView is rebuilt if its renderer crashes or is reclaimed; Back goes back in the page, then closes the app.
5. **Deep links.** `https://cboler.github.io/war-of-attrition-game/...` links open in the app (`autoVerify`, backed by `handle_all_urls` in the root `assetlinks.json`).

The project started from Bubblewrap but no longer has any TWA code; do not run Bubblewrap against `android/`.

### Testing on a phone

Debug builds (`com.cboler.warofattrition.debug`) can load a local dev server, which lets you test web and native changes together before deploying:

```bash
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:4205 tcp:4205
adb shell am start -n com.cboler.warofattrition.debug/com.cboler.warofattrition.MainActivity --es url http://localhost:4205/
```

Serve the web app with the `attrition-dev-device` launch configuration (`ng serve --host 127.0.0.1 --port 4205`); the default dev server listens only on IPv6, which `adb reverse` cannot reach. Debug builds also enable WebView remote debugging (`chrome://inspect`). Release builds always load the hosted game and ignore the `url` extra.

Play Games **sign-in** works only for a signing certificate whose SHA-1 is registered with the Play Games project: the Play App Signing key for Play installs, and optionally the local debug key for debug builds (Google Cloud → Credentials → Android OAuth client for the `.debug` package, then add it under Play Console → Play Games Services → Configuration → Credentials).

### Log walkthrough

```bash
adb logcat -c
adb logcat -s MainActivity NativeBridgeRouter PlayGamesBridge PlayGameStatsBridge
```

Expected on a Play-installed build with a signed-in tester:

```text
MainActivity: Loading https://cboler.github.io/war-of-attrition-game/?twa=1
PlayGamesBridge: Initializing Google Play Games SDK v2...
NativeBridgeRouter: Page connected; delivering N buffered responses
NativeBridgeRouter: Routing to PlayGamesBridge: PLAY_GAMES_INIT
PlayGamesBridge: Play Games isAuthenticated result: true (task.isSuccessful=true)
PlayGamesBridge: Sending message to web: {"version":"v1","type":"PLAY_GAMES_SIGNED_IN"}
NativeBridgeRouter: Routing to PlayGameStatsBridge: GAME_STATS_INIT
```

When the first card goes to the Boneyard:

```text
NativeBridgeRouter: Routing to PlayGamesBridge: UNLOCK_ACHIEVEMENT
PlayGamesBridge: Calling AchievementsClient.unlockImmediate for war.first_casualty (CgkIz5juh94JEAIQDA)
PlayGamesBridge: Successfully synced achievement in Google Play Games: war.first_casualty (CgkIz5juh94JEAIQDA) via unlockImmediate
```

Failures are categorised in the log: `Sign-in required (statusCode=4)`, `Network/transient failure (statusCode=7)`, `Developer/configuration error (statusCode=10 - check package name/SHA-1 in Play Console)`, `API unavailable/not connected (statusCode=17)`. A reload shows `Page gone; buffering native responses until the next page says hello` followed by a new `Page connected`; a renderer crash shows `WebView renderer gone (crashed=true); rebuilding`.

### Verified on a device (2026-10-22)

Pixel 9 Pro, Android 17, Android System WebView 155, debug build against a local server: splash and insets; bridge connects on the first hello; `PLAY_GAMES_INIT` and `GAME_STATS_INIT` round trips; the Play Games sign-in sheet opens from the profile's Connect button and a cancel is reported back cleanly; outside links open in a Custom Tab; reload reconnects; a forced renderer crash rebuilds the WebView without killing the app; the offline page; Back from the first page closes the app; Android credited the app with its foreground time (4:11 over the session). Not yet verified: a signed-in Play Games session (needs a registered signing key), and a Play-installed release.


## 🎯 Step-by-Step Manual Owner Checklist

Follow these actions in order:

### 1. Confirm Android Package ID
* **WHERE:** Google Play Console & Google Cloud Console
* **ACTION:** Verify that the package identity is `com.cboler.warofattrition`.
* **VALUE:** `com.cboler.warofattrition`
* **WHEN:** Before uploading your first AAB.
* **HOW TO VERIFY:** Check that `android/app/build.gradle` and `AndroidManifest.xml` have `applicationId 'com.cboler.warofattrition'`.

### 2. Configure Google Play App Signing
* **WHERE:** Play Console → Select **War of Attrition** → **Release** → **Setup** → **App integrity** → **App Signing**
* **ACTION:** Opt-in to Google Play App Signing (let Google manage and sign release keys).
* **VALUE SOURCE:** Play Console creates the production signing certificate and presents the **SHA-256 certificate fingerprint**.
* **WHEN:** Initial release setup.
* **HOW TO VERIFY:** Copy the SHA-256 fingerprint into your [`owner-values.md`](./owner-values.md).

### 3. Create Android OAuth Client ID in Existing Google Cloud Project
* **WHERE:** Google Cloud Console (`console.cloud.google.com`) → Select your existing project → **APIs & Services** → **Credentials**
* **ACTION:** Click **Create Credentials** → **OAuth client ID** → Application type: **Android**.
* **VALUE:** 
  - Package name: `com.cboler.warofattrition`
  - SHA-1 Certificate Fingerprint: Your upload key SHA-1 (and Play App Signing SHA-1).
* **VALUE COMES FROM:** `keytool -list -v -keystore release.keystore` and Play App Signing page.
* **WHEN:** Before connecting Play Games Services.
* **HOW TO VERIFY:** Android OAuth client ID is listed alongside your existing Web OAuth client ID.

### 4. Link Existing Cloud Project to Play Games Services
* **WHERE:** Play Console → **Play Games Services** → **Setup and management** → **Configuration**
* **ACTION:** Select **"Yes, my game already uses Google APIs"** and select your existing Google Cloud Project.
* **VALUE COMES FROM:** Existing Google Cloud Project list.
* **WHEN:** Initial Play Games setup.
* **HOW TO VERIFY:** Status changes to "Linked to Cloud Project".

### 5. Verify Achievements in Play Console
* **WHERE:** Play Console → **Play Games Services** → **Setup and management** → **Achievements**
* **ACTION:** Verify all 29 mapped achievements listed in [`achievements-manifest.md`](./achievements-manifest.md), including Veteran at 25 incremental steps and Centurion at 100 incremental steps.
* **VALUE COMES FROM:** [`achievements-manifest.md`](./achievements-manifest.md).
* **WHEN:** Before publishing Play Games project for testing.
* **HOW TO VERIFY:** Confirm the Play IDs match `src/app/core/models/play-achievements-map.ts` exactly; all 29 supplied IDs are checked in. Update the existing Marathon and War Tested metadata as noted in the manifest.

### 6. Publish Digital Asset Links on Root Domain
* **WHERE:** `https://cboler.github.io/.well-known/assetlinks.json`
* **ACTION:** Keep `assetlinks.json` listing the Play App Signing SHA-256 fingerprint with `delegate_permission/common.handle_all_urls`. Since the WebView switch this only verifies that links to the game open in the app; the game and the Play Games bridge work without it.
* **VALUE COMES FROM:** [`developer-docs/play-store/assetlinks-guide.md`](./assetlinks-guide.md).
* **WHEN:** Before release.
* **HOW TO VERIFY:** `adb shell pm get-app-links com.cboler.warofattrition` on a Play-installed build shows `cboler.github.io: verified`.

### 7. Fill Out App Content (Privacy, Data Safety, Target Audience)
* **WHERE:** Play Console → **Policy and programs** → **App content**
* **ACTION:**
  - **Privacy Policy URL:** `https://cboler.github.io/war-of-attrition-game/privacy/`
  - **Data Safety:** Complete questionnaire using [`data-safety.md`](./data-safety.md).
  - **Target Audience:** 13+ (or Everyone).
  - **Ads:** Select **No**. The Android wrapper contains no advertising SDK, ad manifest metadata, ad unit identifiers, or ad runtime behavior.
* **WHEN:** Before creating internal release.
* **HOW TO VERIFY:** All policy declarations show "Completed" in Play Console, and the release artifact contains no advertising SDK classes or resources.

### 8. Upload AAB to Internal Testing Track
* **WHERE:** Play Console → **Testing** → **Internal testing**
* **ACTION:** Click **Create new release** → Upload `app-release.aab` → Set release notes → Click **Save** & **Review release** → **Start rollout to Internal testing**.
* **VALUE COMES FROM:** `android/app/build/outputs/bundle/release/app-release.aab`.
* **WHEN:** Ready to test on Android device.
* **HOW TO VERIFY:** Release status shows "Active" on the Internal testing track.

### 9. Add Tester Email Accounts & Install
* **WHERE:** Play Console → **Internal testing** → **Testers** tab
* **ACTION:** Add your Google email address to an internal tester email list. Copy the **Join on Android** opt-in URL.
* **WHEN:** After rolling out release.
* **HOW TO VERIFY:** Open opt-in URL on Android device, accept invite, and download the game from Google Play.

---

## 10. Known Issues & Backlog

### Resolved: Back gesture froze the app on the splash screen (TWA builds up to 4.4.0)

The TWA launcher deferred its own `finish()` to keep the Play Games bridge alive, so Back from the first page left the app stuck on the splash background until force-stopped. A fix for the TWA launcher was verified on a Pixel 9 Pro, then made moot in 4.4.1 by the switch to a single WebView activity, where Back goes back in the page and then closes the app (also verified on device).
