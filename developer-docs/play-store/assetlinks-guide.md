# Digital Asset Links

**Since 4.4.1 (WebView app):** this file only verifies that `https://cboler.github.io/war-of-attrition-game/...` links open in the app (`handle_all_urls`, checked by Android for the manifest's `autoVerify` intent filter). The game and the Play Games bridge no longer depend on it. `use_as_origin` was needed only by the Trusted Web Activity's postMessage channel; it is harmless to keep.

Verification is scoped to the origin, so Android reads this exact root URL:

`https://cboler.github.io/.well-known/assetlinks.json`

The `war-of-attrition-game` project Pages output cannot publish that root path. Deploy the following file from the separate `cboler.github.io` user-site repository. This repository also ships a copy at `/war-of-attrition-game/.well-known/assetlinks.json` (from `public/.well-known/`); Chrome never reads it, so it is only a reference copy and must be kept in step with the root file by hand.

**Current state (checked 2026-10-22):** the root file is live, lists three SHA-256 fingerprints, and grants both relations. Google's checker reports `"linked": true` for `use_as_origin` with the first fingerprint (`7A:9B:…`). The upload-key fingerprint is not listed, which is fine for Play-installed builds but means sideloaded builds do not verify.

## Copy-ready root file

Replace the fingerprint token with the Play App Signing **SHA-256** fingerprint from Play Console → App integrity. Keep the upload/local certificate only if a build signed by it also needs TWA verification.

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.use_as_origin"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cboler.warofattrition",
      "sha256_cert_fingerprints": [
        "PASTE_PLAY_APP_SIGNING_SHA256_HERE"
      ]
    }
  }
]
```

`handle_all_urls` lets game links open in the app. (`use_as_origin` mattered only for the TWA builds up to 4.4.0.)

## Fingerprints are not interchangeable

- The Play Games Services Android OAuth credential is registered with the applicable signing certificate **SHA-1** and package `com.cboler.warofattrition`.
- Digital Asset Links uses certificate **SHA-256** values in the root `assetlinks.json`.
- The upload-key fingerprint already recorded in `owner-values.md` is not a substitute for the Play App Signing fingerprint used on Play-installed builds.

## Verification

After root deployment:

1. Open `https://cboler.github.io/.well-known/assetlinks.json` directly and confirm it returns JSON without a redirect.
2. Query `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://cboler.github.io&relation=delegate_permission/common.handle_all_urls`, then repeat with `relation=delegate_permission/common.use_as_origin`. For a yes/no answer per certificate, use `https://digitalassetlinks.googleapis.com/v1/assetlinks:check?source.web.site=https://cboler.github.io&relation=delegate_permission/common.use_as_origin&target.android_app.package_name=com.cboler.warofattrition&target.android_app.certificate.sha256_fingerprint=<SHA256>`.
3. Install the Play-signed build and confirm the game opens without Custom Tab browser chrome.

The Android-side reciprocal statement is already configured through the manifest's `asset_statements` metadata for `https://cboler.github.io`.
