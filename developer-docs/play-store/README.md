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

## Native Play Games bridge status

Local achievements and career stats are fully operational and canonical. Native Play synchronization, achievements UI, and Game Stats submission are connected via an origin-verified bidirectional Custom Tabs `postMessage` channel.

### Temporary Android Browser Helper Dependency Note

**Upstream status (checked 2026-10-22):** PR #584 is still open and unmerged. The Google maintainer agreed the protected-hook design on 2026-08-25, but the PR author has not pushed it, and Android Browser Helper 2.7.4 (released 2026-10-02) does not include it. Keep the vendored build until an official release ships the hook. See [`android/vendor/README.md`](../../android/vendor/README.md) for the options.

To unblock Google Play Games achievements and Game Stats bridge before Open Testing:
- **Why the fork exists:** Android Browser Helper official releases up through 2.7.3 kept `TwaLauncher.mSession` private and lacked any callback or hook exposing `CustomTabsSession` on `LauncherActivity`, making it impossible for a clean TWA launcher to establish `requestPostMessageChannel()` without reflection or parallel service bindings.
- **Upstream PR:** [`GoogleChrome/android-browser-helper#584`](https://github.com/GoogleChrome/android-browser-helper/pull/584) (*"Expose CustomTabsSession on TwaLauncher and LauncherActivity"*).
- **Starting PR branch:** `dnikolaev/expose-customtabs-session` (base commit `febadb4dcdd7a66fb4d17175b67c012f245c8610`).
- **Our fork commit & tag:** Fork repository `cboler/android-browser-helper`, commit `94fb27b1cbc91f55130a8f3cba090f98ee282791`, immutable release tag `woa-abh-2.7.3-session-1`.
- **Implementation details:** Implemented the August 25, 2026 Google maintainer specification by providing a protected hook `onCustomTabsSessionAvailable(@NonNull CustomTabsSession session)` on `LauncherActivity` called from `TwaLauncher.launch()`'s completion callback, alongside the public `TwaLauncher.getSession()` accessor.
- **Session lifetime requirement:** ABH 2.7.3 normally finishes and destroys `LauncherActivity` immediately after launching the TWA. `MainActivity` defers that finish for the whole TWA session, because `PlayGamesBridge` needs a live Activity and the Custom Tabs callback binder must stay alive. When the user leaves the TWA (back past the first page), `MainActivity` resumes, sets `exitingAfterTwa`, and finishes normally.
- **Checked-in vendor repository:** Published to `android/vendor/m2repository/` as `com.google.androidbrowserhelper:androidbrowserhelper:2.7.3-session-1` with full POM/transitive metadata, sources, and javadocs under Apache 2.0.
- **Open Testing readiness workaround:** This temporary dependency unblocks bidirectional communication (`requestPostMessageChannel`) between `MainActivity` and `TwaPostMessageService` (`VerifiedTwaTransport`).
- **Removal condition:** Migrate back to the first official Android Browser Helper release containing #584 once published to Google Maven / Maven Central.
- **Not a Bubblewrap project any more:** `android/` started from Bubblewrap but now carries custom Java. Do not run `bubblewrap update` or `bubblewrap build`; they would regenerate the project and drop the bridge. Bubblewrap has no Play Games feature, so `features.playGames` in `twa-manifest.json` is ignored metadata.

### PostMessage Transport & Bridge Integration
1. Native `PostMessageService` is declared in `AndroidManifest.xml`.
2. `MainActivity` retains its Activity context during the TWA session to keep `PlayGamesBridge` and Google Play Games Services v2 clients alive and responsive to Tasks.
3. `MainActivity` requests a postMessage channel for `https://cboler.github.io` once `CustomTabsSession` is available, navigation has finished, and a one-second settle delay has passed (Chromium can finish navigation before the page can receive the port).
   - **Every document gets its own channel.** A reload, a service-worker update, or any full navigation gives the page a new document with no port. Each `NAVIGATION_FINISHED` after a channel exists resets it and requests a new one after the settle delay. The web side treats a new port as a fresh connection and re-sends `PLAY_GAMES_INIT`, so queued unlocks flush again.
   - **Unanswered requests are retried.** If `onMessageChannelReady` does not arrive within 3 seconds, the request is repeated, up to 4 attempts per document.
   - **Failed sends re-open the channel.** If `postMessage` returns anything other than success (Chrome 150–152 returned `-3` after reloads, [android-browser-helper#602](https://github.com/GoogleChrome/android-browser-helper/issues/602)), the message is kept and the channel is re-requested within the same attempt budget.
   - Local achievements and stats never depend on the channel; Play sync simply waits.
4. Native bridge routing is managed by `TwaPostMessageManager`, which routes incoming requests to `PlayGamesBridge` and `PlayGameStatsBridge` while buffering outbound responses until the channel handshake is complete.
5. Angular registers `VerifiedTwaTransport` via `TwaPostMessageService` upon receiving the transferred `MessagePort`.
6. Digital Asset Links on `https://cboler.github.io/.well-known/assetlinks.json` grant `delegate_permission/common.use_as_origin`.

### 🔍 ADB Diagnostic Observability & Pixel Validation Procedure

To monitor the live integration across all asynchronous boundaries, run:

```bash
# Clear logcat buffers
adb logcat -c

# Filter to all bridge tags
adb logcat -s MainActivity TwaPostMessageManager PlayGamesBridge
```

#### Expected Log Sequence for Canary Validation (`war.first_casualty` / First Casualty)

1. **Activity & Session Setup**:
   ```text
   MainActivity: onCustomTabsSessionAvailable hook invoked with session
   MainActivity: Navigation finished in TWA
   ```
2. **Channel Handshake**:
   ```text
   TwaPostMessageManager: Requesting postMessage channel for target origin: https://cboler.github.io (attempt 1/4, ...)
   TwaPostMessageManager: requestPostMessageChannel(https://cboler.github.io) returned: true
   MainActivity: Relationship validation for origin https://cboler.github.io (relation=1): result=true
   TwaPostMessageManager: onMessageChannelReady callback received: Transferred MessagePort ready in browser
   ```
3. **Web Connection & Play Games Authentication**:
   ```text
   TwaPostMessageManager: onPostMessage received: {"version":"v1","type":"PLAY_GAMES_INIT"}
   PlayGamesBridge: Initializing Google Play Games SDK v2...
   PlayGamesBridge: Play Games isAuthenticated result: true
   PlayGamesBridge: Sending message to web: {"version":"v1","type":"PLAY_GAMES_SIGNED_IN"}
   ```
4. **Achievement Unlock (First Casualty Canary)**:
   When the first card is sent to the Boneyard during gameplay:
   ```text
   TwaPostMessageManager: onPostMessage received: {"version":"v1","type":"UNLOCK_ACHIEVEMENT","internalAchievementId":"war.first_casualty","playGamesAchievementId":"CgkIz5juh94JEAIQDA"}
   PlayGamesBridge: Calling AchievementsClient.unlockImmediate for war.first_casualty (CgkIz5juh94JEAIQDA)
   PlayGamesBridge: Successfully synced achievement in Google Play Games: war.first_casualty (CgkIz5juh94JEAIQDA) via unlockImmediate
   PlayGamesBridge: Sending message to web: {"version":"v1","type":"ACHIEVEMENT_SYNCED","internalAchievementId":"war.first_casualty","playGamesAchievementId":"CgkIz5juh94JEAIQDA"}
   ```
5. **If Failure Occurs**:
   The logs clearly categorize the failure:
   - `Sign-in required (statusCode=4)`
   - `Network/transient failure (statusCode=7)`
   - `Developer/configuration error (statusCode=10 - check package name/SHA-1 in Play Console)`
   - `API unavailable/not connected (statusCode=17)`
6. **Reload recovery check**: Force a reload mid-session. With the phone on USB debugging, open `chrome://inspect` on the desktop, find the TWA page, and click **Reload**; a deployed web update applying itself does the same. Expect `New document loaded; the previous postMessage channel is stale and will be re-requested`, then a fresh `onMessageChannelReady`. An unlock earned after the reload should still reach Play.
7. **If the channel never opens**: `postMessage channel not established after 4 attempts` means Chrome refused or ignored every request. Check that the installed build came from Play (see *Which builds can verify* below) and that `use_as_origin` is in the root `assetlinks.json`.

#### Which builds can verify

Only a build whose signing certificate SHA-256 is listed in the root `assetlinks.json` gets a verified origin, a full-screen TWA, and a postMessage channel. The upload key (`E6:4C:7F:…`, see `owner-values.md`) is **not** in that file, and debug builds use the `com.cboler.warofattrition.debug` package. A locally built or CI-downloaded AAB installed with `bundletool` will therefore open with a URL bar and no Play Games sync. Test Play Games only on a build installed from a Play testing track.


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

---

## 10. Known Issues & Backlog (Target: Next AAB Release)

### Android Back Gesture / App Freeze on Loading Screen

> **Status (2026-10-22): fixed in 4.4.1 and verified on a Pixel 9 Pro (Android 17, Chrome 156)** with a locally signed build: Back from the first page finishes `MainActivity` and returns to the launcher. Reload recovery was verified on the same device (a DevTools reload produced a fresh set of channel attempts). `onResume()` now sets `exitingAfterTwa` before calling `finish()`, and `finish()` no longer defers once that flag is set. A second path to the same freeze was also fixed: the Play Games v2 sign-in UI never calls `onActivityResult`, so `isHandlingInternalActivityResult` stayed `true` after a manual sign-in and blocked the exit. `PlayGamesBridge` now clears it when the sign-in task completes.

- **Observed Behavior**: In the Android TWA app, performing the system back gesture (swiping from the screen edge) or pressing the hardware/nav-bar Back button while at the root game screen leaves the app permanently frozen on the initial launcher splash/loading screen (`Theme.WarOfAttrition`). The app does not exit, cannot be recovered via further back actions, and requires a force-stop/restart.
- **Root Cause**:
  In [`MainActivity.java`](../../android/app/src/main/java/com/cboler/warofattrition/MainActivity.java), `MainActivity` defers launcher finishing via `finish()` while `twaLaunched` is true so that `PlayGamesBridge` retains a valid Activity context while the TWA is running in the foreground. When the user initiates a back action that exhausts browser history, the Custom Tab finishes, bringing `MainActivity` to the foreground in `onResume()`. `onResume()` correctly detects TWA exit (`twaLaunched && !isHandlingInternalActivityResult`) and calls `finish()`. However, `finish()` intercepts its own invocation: because `twaLaunched` is still `true`, it logs `"Deferring LauncherActivity finish: TWA is actively running"` and returns without calling `super.finish()`. Consequently, `MainActivity` is trapped in the foreground on the splash background and ignores all subsequent back events.
- **Remediation Plan for Next AAB**:
  1. In `MainActivity.onResume()`: Explicitly reset `twaLaunched = false;` before calling `finish()` (or call `super.finish()` directly on TWA exit).
  2. In `MainActivity.finish()`: Ensure that an explicit exit flag or `!twaLaunched` allows `super.finish()` to execute cleanly to close the app task back to the Android launcher.
  3. Rebuild signed AAB (`./gradlew bundleRelease`) and bump version identity across `package.json`, `android/twa-manifest.json`, and environment configs.
