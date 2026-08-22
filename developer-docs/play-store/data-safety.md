# Google Play Console Data Safety Form Guide

Use this factual breakdown to complete the **Data Safety** questionnaire in Google Play Console.

---

## 1. Overview & Data Collection Summary

* **Does your app collect or share any of the required user data types?**  
  **Yes** (optional Google Account profile data and consent-gated pseudonymous gameplay telemetry when GA4 is configured).
* **Is all of the user data collected by your app encrypted in transit?**  
  **Yes** (All requests use HTTPS/TLS).
* **Do you provide a way for users to request that their data be deleted?**  
  **Yes** for application-owned local data (in-app one-click deletion and `/delete-account`). The button cannot delete historical Google Analytics exports or Google Play account records; apply the relevant Google retention/deletion controls separately.

---

## 2. Detailed Data Type Inventory

### Category: Personal Info

#### Name (Optional)
* **Collected?** Yes (when player signs in via Google Identity Services, or edits Commander name locally).
* **Shared?** No.
* **Processed ephemerally?** No (stored locally on device in browser/app storage).
* **Required or optional?** Optional (Default guest player is named "Card Commander").
* **Purposes:** App functionality, Account management, Personalization.

#### Email Address (Optional)
* **Collected?** Yes (when player chooses to sign in via Google OAuth).
* **Shared?** No.
* **Processed ephemerally?** No (stored in local storage on device).
* **Required or optional?** Optional.
* **Purposes:** Account management, App functionality.

---

### Category: App Activity

#### Gameplay & App Interactions
* **Collected?** Yes (local career state; when analytics is configured and consent is granted, pseudonymous War outcomes, public comparisons, challenge/Battle summaries, Campaign summaries, and cosmetic unlocks are transmitted to Google Analytics).
* **Shared?** Google Analytics processes configured telemetry as a service provider; verify the current Play Console definition of collection/sharing when completing the form.
* **Syncing:** Synchronized to Google Play Games Services if connected on Android.
* **Required or optional?** Required for game state and career statistics.
* **Purposes:** App functionality and analytics.

---

### Category: Device or Other Identifiers

#### User IDs & Device IDs
* **Collected?** Yes (Google Account Sub ID locally when Google Sign-In is used; Google Analytics may process pseudonymous online/device identifiers when consented).
* **Shared?** The app never sends the Google subject/profile ID in gameplay events. Google Analytics identifier handling must be declared according to the configured property and current Play definitions.
* **Purposes:** Account management and analytics.

---

## 3. Play Console Data Safety Questionnaire Answers

| Question | Answer | Details |
| :--- | :--- | :--- |
| **Data collection & security** | Yes | Data encrypted in transit via HTTPS |
| **Account creation** | Yes | Google Sign-in or Local Guest Account |
| **Deletion request URL** | `https://cboler.github.io/war-of-attrition-game/delete-account/` | Direct URL for users to request/execute data deletion |
| **Target Audience / Age** | Everyone (13+) | Casual strategic card game |
| **Advertising / Ads** | **OWNER ACTION REQUIRED** | Android source initializes a Google Mobile Ads banner, while existing store declarations say no ads. Disable it in the shipped build or update Ads/Data Safety/consent declarations before testing. |
| **Financial / Purchase Info** | **No** | App has no payments or real money transactions |
| **Location Data** | **No** | App does not access precise or coarse location |
| **Health / Fitness** | **No** | Not applicable |
| **Contacts / SMS / Photos** | **No** | No access to device storage/contacts/SMS |
