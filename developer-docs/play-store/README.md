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
* **HOW TO VERIFY:** Copy the SHA-256 fingerprint into your [`owner-values.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/play-store/owner-values.md).

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

### 5. Create Achievements in Play Console
* **WHERE:** Play Console → **Play Games Services** → **Setup and management** → **Achievements**
* **ACTION:** Create all 12 achievements listed in [`achievements-manifest.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/play-store/achievements-manifest.md).
* **VALUE COMES FROM:** [`developer-docs/play-store/achievements-manifest.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/play-store/achievements-manifest.md).
* **WHEN:** Before publishing Play Games project for testing.
* **HOW TO VERIFY:** Copy generated `CgkI...` achievement IDs into [`src/app/core/models/play-achievements-map.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/core/models/play-achievements-map.ts).

### 6. Publish Digital Asset Links on Root Domain
* **WHERE:** `https://cboler.github.io/.well-known/assetlinks.json`
* **ACTION:** Deploy `assetlinks.json` containing the Play App Signing SHA-256 fingerprint to your root user repository.
* **VALUE COMES FROM:** [`developer-docs/play-store/assetlinks-guide.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/play-store/assetlinks-guide.md).
* **WHEN:** Before testing on device.
* **HOW TO VERIFY:** Check via browser at `https://cboler.github.io/.well-known/assetlinks.json` and ensure Chrome opens the app without browser URL bar.

### 7. Fill Out App Content (Privacy, Data Safety, Target Audience)
* **WHERE:** Play Console → **Policy and programs** → **App content**
* **ACTION:**
  - **Privacy Policy URL:** `https://cboler.github.io/war-of-attrition-game/privacy/`
  - **Data Safety:** Complete questionnaire using [`data-safety.md`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/developer-docs/play-store/data-safety.md).
  - **Target Audience:** 13+ (or Everyone).
  - **Ads:** Select "No, my app does not contain ads".
* **WHEN:** Before creating internal release.
* **HOW TO VERIFY:** All policy declarations show "Completed" in Play Console.

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
