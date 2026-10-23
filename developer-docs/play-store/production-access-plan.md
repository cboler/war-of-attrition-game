# Production Access Plan

How to get War of Attrition from closed testing to a public Play listing. Written 2026-10-22 after two "test more" decisions.

## 1. The gate

Personal developer accounts created after 13 November 2023 must pass a closed test before publishing:

- At least **12 testers opted in continuously for the 14 days** before you apply. A tester who leaves and rejoins restarts their own 14 days.
- Then apply for production access and answer a questionnaire. Review usually takes up to 7 days.
- **Open testing is locked too.** Google's page says it "becomes available after you gain production access". There is no open-testing step before the gate; passing it unlocks open testing and production together.

Google lists the reasons for a "test more" decision: fewer than 12 opted-in testers, **insufficient tester engagement**, or policy and quality problems. With 12 testers in place, the two rejections were almost certainly about engagement or the questionnaire. Google publishes no numeric engagement threshold.

Source: [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465).

## 2. About the paid "guaranteed" tester services

Recommendation: **don't use them.**

- Nobody outside Google can guarantee approval; there is no published threshold to meet.
- The questionnaire asks how testers were recruited, whether they used the features, and whether their use resembled real production use. Pooled testers who install and open an app briefly match what the "insufficient engagement" outcome describes. Answering the questionnaire inaccurately to cover that is misrepresentation to Google.
- The asset at risk is the developer account. A terminated account cannot simply be replaced, and the game, its package name, and the Play Games project are tied to it.
- Free tester exchanges (subreddits and Discord groups where developers test each other's apps) give real people on real devices. They are a reasonable top-up to friends and family, as long as the questionnaire describes them honestly.

## 3. Why the Android app was rebuilt (4.4.1)

Up to 4.4.0 the Android app was a Trusted Web Activity, where the screen the player sees belongs to **Chrome**, not to `com.cboler.warofattrition`.

**Measured on a Pixel 9 Pro (Android 17, Chrome 156) on 2026-10-22:** across about 14 minutes of the TWA on screen over 6 launches, Android's usage statistics credited `com.cboler.warofattrition` with **0 seconds used and 12 seconds visible**; every gameplay second was recorded as `com.android.chrome`. A WebView build of the same game was credited with all of its on-screen time (1:18 of ~80 seconds, and 4:11 over a longer test session).

Google does not say whether its production-access review uses this per-package signal, and several (vendor) write-ups claim TWAs are rejected more often for exactly this reason. Rather than guess, 4.4.1 ships as a WebView app, so testers' play now counts toward the app wherever Google looks. Details: [`webview-vs-twa.md`](./webview-vs-twa.md).

## 4. Before starting the next 14-day window

1. **Ship 4.4.1** (the WebView app). Tell existing testers in the release notes that their earlier progress was stored in Chrome and starts fresh in this version.
2. **Check Play Games on a Play-installed build** using the log walkthrough in [`README.md`](./README.md#log-walkthrough): page connected, signed in, profile shows the Play Games name, `war.first_casualty` synced.
3. Confirm the Play Console achievement edits from [`achievements-manifest.md`](./achievements-manifest.md) are published to testers.
4. Fill the placeholders in [`owner-values.md`](./owner-values.md) (Play App Signing SHA-1 and SHA-256, the testing opt-in link).
5. Large screens: the activity is locked to portrait. Android 16 ignores fixed orientation on large screens, so check the layout on a tablet or foldable before reviewers do.

## 5. Running the test so it reads as real use

- **Recruit 15–20, not 12.** Some testers drift; the count must still be 12 on the day you apply.
- **Give testers something to do.** Send a short brief: finish the tutorial, win one War, play a Total War Campaign, sign in to Play Games, report one bug or confusion. Spread the asks across the two weeks so play is not all on day one.
- **Collect feedback in one place** (Play's private feedback, a form, or a group chat) and keep it.
- **Ship at least one update during the window** that answers feedback, with release notes saying what changed. The questionnaire asks what you changed because of testing.
- **Keep evidence from GA4.** Android-app sessions start on a URL carrying `?twa=1`, so filtering GA4 by landing page containing `twa=1` should isolate them. Record Wars completed, sessions per tester-device, and days active across the window. (Telemetry does not yet tag TWA sessions explicitly; adding that would be a small additive change if the landing-page filter proves unreliable.)

## 6. Questionnaire notes

Answer in your own words; these are the points worth covering.

- **Recruiting:** who the testers were (friends, family, colleagues, tester-exchange communities) and how you reached them.
- **Feature coverage:** tutorial, single Wars, Total War Campaigns, reinforcements and multi-layer Battles, Field Manual, profile and card backs, achievements, Play Games sign-in.
- **Production-like use:** the GA4 numbers from section 5; note any difference (for example, testers playing more Campaigns than a typical player would).
- **Feedback and changes:** list the concrete fixes shipped during testing with their version numbers (the back-gesture fix, Play Games bridge reliability, the desktop Challenge prompt layout fix, anything testers report).
- **Readiness:** the automated test suites (800+ web unit tests, native bridge tests) and device checks, and that the core game has no network dependency once loaded.

## 7. After approval

Open testing becomes available. A short open test before production costs nothing and gives real-world crash and vitals data from strangers' devices; it is also where the store listing in [`store-listing.md`](./store-listing.md) gets its first readers.
