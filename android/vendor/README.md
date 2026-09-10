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
