# Google Play Internal Testing Setup & Owner Guide

This guide details the exact steps to configure Google Play Console, link your existing Google Cloud project, build release bundles, and launch the game for **Google Play Internal Testing**.

---

## 📋 Prerequisites & Toolchain Requirements

To build Android APKs and App Bundles (`.aab`) locally:

1. **Java Development Kit (JDK):** JDK 17 (e.g. OpenJDK 17 or Temurin 17).
2. **Android SDK:** Android SDK Command-line Tools / Android Studio with SDK Platform 36 and Build-Tools 36.0.0 installed.
3. **Environment Variables:**
   - `JAVA_HOME` pointing to JDK 17 installation.
   - `ANDROID_HOME` pointing to Android SDK directory.
   - Add `$JAVA_HOME/bin` and `$ANDROID_HOME/platform-tools` to system `PATH`.
4. **Node & NPM:** Node 20+ and npm 10+.

---

## 🚀 Building Android Artifacts

The release-candidate AAB is produced by `.github/workflows/build-android-bundle.yml`. Run it manually or push a `v*` tag. With no version inputs, the workflow reads the authoritative version name from `package.json` and derives its packed numeric version code. Any manually supplied or tag-derived version name must match `package.json` exactly or the job fails before Gradle runs, preventing the Android and hosted identities from silently diverging. The workflow publishes `app-release-aab` as its artifact and passes the configured `PLAY_GAMES_PROJECT_ID` repository variable, falling back to the supplied numeric ID `334487063631`.

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

## Native Play Games bridge status

Local achievements and career stats are fully operational and canonical. Native Play synchronization, achievements UI, and Game Stats submission are connected via an origin-verified bidirectional Custom Tabs `postMessage` channel.

### Temporary Android Browser Helper Dependency Note
To unblock Google Play Games achievements and Game Stats bridge before Open Testing:
- **Why the fork exists:** Android Browser Helper official releases up through 2.7.3 kept `TwaLauncher.mSession` private and lacked any callback or hook exposing `CustomTabsSession` on `LauncherActivity`, making it impossible for a clean TWA launcher to establish `requestPostMessageChannel()` without reflection or parallel service bindings.
- **Upstream PR:** [`GoogleChrome/android-browser-helper#584`](https://github.com/GoogleChrome/android-browser-helper/pull/584) (*"Expose CustomTabsSession on TwaLauncher and LauncherActivity"*).
- **Starting PR branch:** `dnikolaev/expose-customtabs-session` (base commit `febadb4dcdd7a66fb4d17175b67c012f245c8610`).
- **Our fork commit & tag:** Fork repository `cboler/android-browser-helper`, commit `94fb27b686e0821d3f9ad7817fc109a15eb89e68`, immutable release tag `woa-abh-2.7.3-session-1`.
- **Implementation details:** Implemented the August 25, 2026 Google maintainer specification by providing a protected hook `onCustomTabsSessionAvailable(@NonNull CustomTabsSession session)` on `LauncherActivity` called from `TwaLauncher.launch()`'s completion callback, alongside the public `TwaLauncher.getSession()` accessor.
- **Session lifetime requirement:** ABH 2.7.3 normally finishes and destroys `LauncherActivity` immediately after launching the TWA. `MainActivity` defers only that finish until Chrome reports `onMessageChannelReady`, preserving the callback binder while `PostMessageService` is bound and then releasing the launcher normally.
- **Checked-in vendor repository:** Published to `android/vendor/m2repository/` as `com.google.androidbrowserhelper:androidbrowserhelper:2.7.3-session-1` with full POM/transitive metadata, sources, and javadocs under Apache 2.0.
- **Open Testing readiness workaround:** This temporary dependency unblocks bidirectional communication (`requestPostMessageChannel`) between `MainActivity` and `TwaPostMessageService` (`VerifiedTwaTransport`).
- **Removal condition:** Migrate back to the first official Android Browser Helper release containing #584 once published to Google Maven / Maven Central.

### PostMessage Transport & Bridge Integration
1. Native `PostMessageService` is declared in `AndroidManifest.xml`.
2. `MainActivity` establishes a postMessage channel for `https://cboler.github.io` once both `CustomTabsSession` and `NAVIGATION_FINISHED` arrive; a rejected or exceptional channel request is contained instead of terminating the app and remains eligible for retry.
3. Native bridge routing is managed by `TwaPostMessageManager`, which routes incoming requests to `PlayGamesBridge` and `PlayGameStatsBridge` while buffering outbound responses until the channel handshake is complete.
4. Angular registers `VerifiedTwaTransport` via `TwaPostMessageService` upon receiving the transferred `MessagePort`.
5. Digital Asset Links on `https://cboler.github.io/.well-known/assetlinks.json` grant `delegate_permission/common.use_as_origin`.

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
* **ACTION:** Verify all 27 achievements listed in [`achievements-manifest.md`](./achievements-manifest.md), including Veteran at 25 incremental steps and Centurion at 100 incremental steps.
* **VALUE COMES FROM:** [`achievements-manifest.md`](./achievements-manifest.md).
* **WHEN:** Before publishing Play Games project for testing.
* **HOW TO VERIFY:** Confirm the Play IDs match `src/app/core/models/play-achievements-map.ts` exactly; all 27 supplied IDs are checked in. Update the existing Marathon and War Tested metadata as noted in the manifest.

### 6. Publish Digital Asset Links on Root Domain
* **WHERE:** `https://cboler.github.io/.well-known/assetlinks.json`
* **ACTION:** Deploy `assetlinks.json` containing the Play App Signing SHA-256 fingerprint to your root user repository.
* **VALUE COMES FROM:** [`developer-docs/play-store/assetlinks-guide.md`](./assetlinks-guide.md).
* **WHEN:** Before testing on device.
* **HOW TO VERIFY:** Check via browser at `https://cboler.github.io/.well-known/assetlinks.json` and ensure Chrome opens the app without browser URL bar.

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
