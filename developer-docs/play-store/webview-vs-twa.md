# WebView Wrapper vs Trusted Web Activity

Evaluation and spike, 2026-10-22. Device: Pixel 9 Pro, Android 17, Chrome 156, Android System WebView 155.

> **Decision: adopted in 4.4.1** (the first release after the evaluation; no TWA 4.4.1 was published). What shipped is described in [`README.md`](./README.md#android-app-and-play-games-bridge). The sections below are the evaluation as written.

## Recommendation: go

Switch the Play wrapper from a Trusted Web Activity to an in-app WebView. The spike showed the two problems that have dogged the Android build (play time not credited to the app, and an unreliable Play Games bridge) both disappear, and the game ran without visible problems in the WebView. The costs are real but bounded: Google sign-in has to be replaced on Android, testers' existing progress does not carry over, and the wrapper takes on a little more of its own housekeeping. Estimated effort is **two to three days**, plus a Play-signed device check.

Switching does not restart the closed test: the package name, developer account and testing track stay the same, and testers simply receive an update.

## What was measured

| | TWA (4.4.1) | WebView (spike) |
| --- | --- | --- |
| Play time Android credits to the app | **0 s used, 12 s visible** over ~14 min on screen (6 launches); the rest went to `com.android.chrome` | **1:18 used, 1:18 visible** over ~80 s on screen: all of it |
| Play Games bridge | Chrome Custom Tabs postMessage. Needs the vendored Android Browser Helper fork (upstream #584 still unmerged), `use_as_origin` asset links, a Play-signed build, a one-second settle delay, retries, and has hit Chrome-version bugs (Chrome 150–152 reload regression) | `WebViewCompat.addWebMessageListener`, origin-restricted to `https://cboler.github.io`. **Connected on the first message** with a debug-signed build: hello → `TWA_PORT_READY` → buffered `PLAY_GAMES_READY` delivered → `PLAY_GAMES_INIT` / `GAME_STATS_INIT` round trip |
| Gameplay and effects | Works | Works: tutorial, commander dialogue, challenge, power comparison with WebGL glow, casualty, local achievement unlock. No WebGL or console errors in logcat |
| URL bar | Appears whenever verification fails (any non-Play-signed build) | Never |
| Lifecycle | `MainActivity` must stay alive under Chrome's activity; caused the back-gesture freeze | One ordinary activity; Back goes back in the page, then closes |

Play Games **sign-in** itself was not proven end to end in either wrapper: the debug signing key is not registered with Play Games, so `isAuthenticated()` returned false in both. That needs a Play-signed build (or registering the debug SHA-1, see below).

## What a WebView costs

1. **Google sign-in is blocked.** Google refuses OAuth inside embedded WebViews (`disallowed_useragent`, enforced since September 2021). Attrition's Google sign-in is local only: it fills the profile's name and avatar and has no server behind it (`AuthService.handleGoogleCredentialResponse`). On Android, replace it with the Play Games player: `PlayGames.getPlayersClient(activity).getCurrentPlayer()` gives a display name and avatar. The avatar is a `content://` image URI, so native code must load it (`ImageManager`) and pass a data URL over the bridge. The web side hides the Google button when `window.AttritionNative` is present.
2. **Storage moves.** TWA progress lives in Chrome's storage for `cboler.github.io`; the WebView has its own. The spike started as a brand-new player. With only closed testers so far, the simplest path is a fresh start announced in the release notes. If progress must carry over, add a profile export/import (copy a code in the TWA build, paste it in the WebView build): about half a day.
3. **Edge-to-edge insets.** With `targetSdk 36` the page draws under the status bar (the spike's "ATTRITION" header overlapped the clock). Apply window insets to the WebView, or use `viewport-fit=cover` with `env(safe-area-inset-*)` in CSS.
4. **Housekeeping Chrome did for free:** a splash screen (`androidx.core:core-splashscreen`), opening outside links (Google privacy policy, Play Terms) in a Custom Tab via `shouldOverrideUrlLoading`, and `onPause`/`onResume` forwarding (already in the spike).
5. **Engine.** Android System WebView is Chromium and updates through Play, but it can lag Chrome by a version (155 vs 156 here). Service workers, WebGL, Web Audio and `localStorage` are supported. Performance on older or low-end phones was not measured.

## Policy

Google Play's "webview spam" guidance targets apps that are thin wrappers driving traffic to a website. A complete game the developer owns, with Play Games achievements and stats, is not that. A TWA is also a website wrapper as far as that policy is concerned, so switching does not add policy risk.

## Effort estimate

| Step | Estimate |
| --- | --- |
| Promote `WebViewActivity` to `src/main`; remove `MainActivity`'s TWA code, the ABH vendor repository, `PostMessageService`, asset-statements metadata and the site-settings activity | 0.5 day |
| Insets, splash screen, external links, lifecycle and Back polish | 0.5 day |
| Play Games player identity in place of Google sign-in on Android (native `PlayersClient` + bridge message + web UI switch) | 0.5–1 day |
| Optional profile export/import for existing testers | 0.5 day |
| Tests, offline check (airplane mode), and a Play-signed internal-track check of sign-in, achievements and Game Stats | 0.5 day |

`TwaPostMessageManager`'s routing and buffering carry over unchanged; it would be worth renaming it (for example `NativeBridgeRouter`) once the TWA is gone.

## Faster Play Games testing either way

Registering the local debug key's SHA-1 for the `com.cboler.warofattrition.debug` package (Google Cloud → Credentials → Android OAuth client, linked in Play Console → Play Games Services → Configuration) lets debug builds sign in to Play Games. With the WebView bridge that would make the whole achievements path testable from Android Studio, without a Play release each time.

## What shipped in 4.4.1

- `MainActivity` is the WebView host (bridge, splash, insets, Custom Tabs for outside links, offline page, renderer-crash recovery, deep links). `GameUrlPolicy` decides where each URL opens.
- `NativeBridgeRouter` replaced `TwaPostMessageManager`: it connects on each page's hello and buffers replies between pages.
- `PlayGamesBridge` sends `PLAY_GAMES_PLAYER` (name, avatar) after sign-in; `AuthService.applyPlayGamesIdentity` shows it on the guest profile without overriding a typed name. The Google button is hidden in the app.
- Removed: the TWA launcher, `PostMessageService`, the vendored Android Browser Helper build (`android/vendor/`), `twa-manifest.json`, and the asset-statements metadata.
- Not built: profile export/import for TWA-era testers (their Chrome-stored progress does not carry over).

Sources: [Google's 2021 announcement on OAuth in embedded webviews](https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html), [Access native APIs with JavaScript bridge](https://developer.android.com/develop/ui/views/layout/webapps/native-api-access-jsbridge), [Android Developers Blog on webview spam and minimum functionality](https://android-developers.googleblog.com/2020/10/developer-tips-and-guides-common-policy.html).
