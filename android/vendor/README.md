# Vendor Android Browser Helper Artifact

## Provenance & Purpose

This local Maven repository contains a temporary, immutable build of **Android Browser Helper** (`androidbrowserhelper`), created to unblock War of Attrition's Google Play Games achievements and Game Stats bridge over TWA `postMessage` prior to Open Testing.

- **Upstream Repository**: [GoogleChrome/android-browser-helper](https://github.com/GoogleChrome/android-browser-helper)
- **Upstream Pull Request**: [#584 (Expose CustomTabsSession on TwaLauncher and LauncherActivity)](https://github.com/GoogleChrome/android-browser-helper/pull/584)
- **PR Author Starting Commit**: `febadb4dcdd7a66fb4d17175b67c012f245c8610` (branch `dnikolaev:expose-customtabs-session`)
- **Fork Repository**: [cboler/android-browser-helper](https://github.com/cboler/android-browser-helper)
- **Fork Branch**: `woa/customtabs-session-hook`
- **Patched Hook Commit**: `fde4c5c0501db287e534a5ca55080b818ac04069`
- **Published Release Commit**: `94fb27b1cbc91f55130a8f3cba090f98ee282791`
- **Immutable Tag**: `woa-abh-2.7.3-session-1`
- **Upstream Lineage**: Android Browser Helper 2.7.3 (incorporating compileSdk 36, targetSdk 31, and `androidx.browser:browser:1.10.0`)

## Upstream Maintainer Specification

Based on the Google maintainer's feedback on PR #584 (August 25, 2026):
1. Retained public `TwaLauncher#getSession()`.
2. Added protected hook to `LauncherActivity`:
   ```java
   protected void onCustomTabsSessionAvailable(@NonNull CustomTabsSession session)
   ```
3. Invoked automatically by the existing `TwaLauncher.launch()` completion callback once the session is guaranteed to exist, before `finish()`.
4. Default implementation in `LauncherActivity` is a no-op, preserving existing behavior for all callers.

## Removal Condition

This vendor artifact must be replaced with the official release of `com.google.androidbrowserhelper:androidbrowserhelper` as soon as Google merges PR #584 and publishes the update to Maven Central / Google Maven.

## Upstream Status (checked 2026-10-22)

- PR #584 is **open and unmerged**. Its last activity is the maintainer's 2026-08-25 comment approving the protected `LauncherActivity` hook plus the existing `TwaLauncher.launch()` completion callback. The author had not pushed that revision.
- Android Browser Helper **2.7.4** shipped on 2026-10-02 without the hook, so the vendored build cannot be dropped yet. 2.7.4 does bring a minSdk 24 floor (already ours), shortcut and notification changes, and inbound Intent validation in `LauncherActivity`.
- The vendored hook is exactly the shape the maintainer asked for, so `MainActivity` will not need code changes when an official release includes it: only the dependency line in `app/build.gradle` and the `vendor/` repository change.

### Ways forward

1. **Offer the finished hook upstream (recommended).** Comment on #584 offering the fork commit, or open a superseding PR with the hook (credit the original author; the CLA must be signed and the commit must carry no AI co-author trailer, which is what blocked #584's CLA check before).
2. **Rebase the fork onto 2.7.4** to pick up the upstream fixes while waiting. Low risk: the patch touches two files.
3. **Avoid the patch entirely** by replacing `LauncherActivity` with the pattern from the official `twa-post-message` demo (bind `CustomTabsClient` directly, create the session, launch with `TrustedWebActivityIntentBuilder`). That uses only public APIs but re-implements splash, fallback, and site-settings handling, so it is a larger change than waiting.

The postMessage reliability problems seen on devices are mostly Chromium-side (page-ready timing, and the Chrome 150–152 reload regression in android-browser-helper#602) and are independent of this patch. `TwaPostMessageManager` now re-requests the channel per document, retries unanswered requests, and re-opens the channel after failed sends.

## License Notice

Android Browser Helper is licensed under the Apache License, Version 2.0.

```
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
