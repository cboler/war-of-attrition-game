# Trusted Web Activity Digital Asset Links

The Android package launches `https://cboler.github.io/war-of-attrition-game/`, but Digital Asset Links verification is scoped to the origin. Chrome therefore reads this exact root URL:

`https://cboler.github.io/.well-known/assetlinks.json`

The `war-of-attrition-game` project Pages output cannot publish that root path. Deploy the following file from the separate `cboler.github.io` user-site repository. A copy under `/war-of-attrition-game/.well-known/` is ineffective and is intentionally not shipped by this repository.

## Copy-ready root file

Replace the fingerprint token with the Play App Signing **SHA-256** fingerprint from Play Console → App integrity. Keep the upload/local certificate only if a build signed by it also needs TWA verification.

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
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

## Fingerprints are not interchangeable

- The Play Games Services Android OAuth credential is registered with the applicable signing certificate **SHA-1** and package `com.cboler.warofattrition`.
- TWA Digital Asset Links uses certificate **SHA-256** values in the root `assetlinks.json`.
- The upload-key fingerprint already recorded in `owner-values.md` is not a substitute for the Play App Signing fingerprint used on Play-installed builds.

## Verification

After root deployment:

1. Open `https://cboler.github.io/.well-known/assetlinks.json` directly and confirm it returns JSON without a redirect.
2. Query `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://cboler.github.io&relation=delegate_permission/common.handle_all_urls`.
3. Install the Play-signed build and confirm the game opens without Custom Tab browser chrome.

The Android-side reciprocal statement is already configured through the manifest's `asset_statements` metadata for `https://cboler.github.io`.
