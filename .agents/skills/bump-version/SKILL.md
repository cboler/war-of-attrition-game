---
name: bump-version
description: >-
  Procedure for bumping or incrementing the application version name and Android version code across all web, Android, and CI configurations in War of Attrition.
---

# Bumping Version Number Runbook

When bumping or incrementing the version of **War of Attrition**, follow this exact synchronized procedure to ensure Android App Bundle (AAB) CI builds, web hosting, and unit tests stay in 100% lockstep.

## 1. Packed Version Code Formula

Android Play Console requires an integer `versionCode` that strictly increments with every release. The project uses the semver-packed formula:

$$\text{versionCode} = \text{MAJOR} \times 10000 + \text{MINOR} \times 100 + \text{PATCH}$$

*Examples:*
- `4.2.1` $\rightarrow$ `40201`
- `4.2.2` $\rightarrow$ `40202`
- `4.2.3` $\rightarrow$ `40203`
- `4.3.0` $\rightarrow$ `40300`

---

## 2. Synchronized Files Inventory (11 Locations)

Update the version name (`X.Y.Z`) and packed version code (`XYYZZ`) across the following files:

| # | File | Field / Target | Example (`4.2.3` / `40203`) |
|---|------|----------------|-----------------------------|
| 1 | [`package.json`](../../package.json) | `"version"` | `"4.2.3"` |
| 2 | [`package-lock.json`](../../package-lock.json) | `"version"` (root & `packages[""]`) | `"4.2.3"` |
| 3 | [`src/environments/environment.prod.ts`](../../src/environments/environment.prod.ts) | `appVersion` | `"4.2.3"` |
| 4 | [`src/environments/environment.ts`](../../src/environments/environment.ts) | `appVersion` | `"4.2.3-dev"` |
| 5 | [`android/app/build.gradle`](../../android/app/build.gradle) | `twaManifest.versionCode` & `versionName` | `40203`, `'4.2.3'` |
| 6 | [`android/twa-manifest.json`](../../android/twa-manifest.json) | `appVersionCode` & `appVersionName` | `40203`, `"4.2.3"` |
| 7 | [`.github/workflows/build-android-bundle.yml`](../../.github/workflows/build-android-bundle.yml) | Input description placeholders | `e.g. 40203`, `e.g. 4.2.3` |
| 8 | [`scripts/verify-version-match.js`](../../scripts/verify-version-match.js) | Error message example | `...such as 4.2.3.` |
| 9 | [`scripts/verify-version-match.spec.js`](../../scripts/verify-version-match.spec.js) | Test assertions | `assert.equal(readPackageVersion(), '4.2.3');` and test cases |
| 10 | [`src/app/public/support/support.component.spec.ts`](../../src/app/public/support/support.component.spec.ts) | Expected production version | `expect(productionEnvironment.appVersion).toBe('4.2.3');` |
| 11 | [`.github/instructions/current-development-status.md`](../../.github/instructions/current-development-status.md) | Project state release identity | `version identity **4.2.3**` |

---

## 3. Automated Validation

After editing, run:
```bash
npm run test:version
```
or
```bash
node --test scripts/verify-version-match.spec.js
```

Ensure unit test assertions pass and [`verify-version-match.js`](../../scripts/verify-version-match.js) verifies that the Android version name matches `package.json`.

---

## 4. GitHub Actions CI Behavior

In [`.github/workflows/build-android-bundle.yml`](../../.github/workflows/build-android-bundle.yml):
- If `version_name` and `version_code` inputs are omitted, the workflow automatically reads `package.json` and calculates the packed version code.
- Because `package.json` and `build.gradle` are kept in sync, **no manual overrides are required** when triggering the workflow.
