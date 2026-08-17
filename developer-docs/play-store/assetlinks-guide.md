# Digital Asset Links (assetlinks.json) Guide

Trusted Web Activities (TWA) require Digital Asset Links verification to prove that the Android application and the website belong to the same developer. When verified, the app opens as a native standalone app with full-screen rendering and no browser address bar.

---

## 1. File Location Requirement

> [!IMPORTANT]
> The game is hosted at:  
> `https://cboler.github.io/war-of-attrition-game/`
> 
> However, Google Chrome and Digital Asset Links **MUST** read the verification file from the **root domain**:  
> `https://cboler.github.io/.well-known/assetlinks.json`

If your GitHub user page repository (`cboler.github.io`) is separate from `war-of-attrition-game`, you must commit the generated `assetlinks.json` into the root `.well-known/` folder of that repository.

---

## 2. Content of `assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cboler.warofattrition",
      "sha256_cert_fingerprints": [
        "PASTE_PLAY_APP_SIGNING_SHA256_FINGERPRINT_HERE",
        "PASTE_LOCAL_UPLOAD_KEY_SHA256_FINGERPRINT_HERE"
      ]
    }
  },
  {
    "relation": ["delegate_permission/common.use_as_origin"],
    "target": {
      "namespace": "web",
      "site": "https://cboler.github.io"
    }
  }
]
```

---

## 3. How to Obtain Fingerprints

1. **Play App Signing Fingerprint (Production / Internal Testing):**
   - Play Console → Select **War of Attrition** → **Release** → **Setup** → **App integrity** → **App Signing**.
   - Copy **SHA-256 certificate fingerprint**.
2. **Local Upload Key Fingerprint (For local debug builds):**
   - Run: `keytool -list -v -keystore android.keystore -alias android` (or your debug keystore).
   - Copy **SHA-256**.

---

## 4. Verification

After deploying to GitHub Pages, verify your setup using Google's Asset Links API:
```bash
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://cboler.github.io&relation=delegate_permission/common.handle_all_urls"
```
Or use the Google Asset Statement Tester:  
`https://assetlinks.googleapis.com/v1/statements:list?source.web.site=https://cboler.github.io&relation=delegate_permission/common.handle_all_urls`
