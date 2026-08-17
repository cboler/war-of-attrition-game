# Google Play Console Data Safety Form Guide

Use this factual breakdown to complete the **Data Safety** questionnaire in Google Play Console.

---

## 1. Overview & Data Collection Summary

* **Does your app collect or share any of the required user data types?**  
  **Yes** (Basic Google Account profile for authentication, anonymous web telemetry).
* **Is all of the user data collected by your app encrypted in transit?**  
  **Yes** (All requests use HTTPS/TLS).
* **Do you provide a way for users to request that their data be deleted?**  
  **Yes** (In-app one-click deletion and public deletion page at `/delete-account`).

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
* **Collected?** Yes (match turns, wins/losses, battle depth, win streak, challenges won).
* **Shared?** No (Stored locally on device).
* **Syncing:** Synchronized to Google Play Games Services if connected on Android.
* **Required or optional?** Required for game state and career statistics.
* **Purposes:** App functionality, Analytics (local player stats).

---

### Category: Device or Other Identifiers

#### User IDs & Device IDs
* **Collected?** Yes (Google Account Sub ID when Google Sign-In is used).
* **Shared?** No.
* **Purposes:** Account management.

---

## 3. Play Console Data Safety Questionnaire Answers

| Question | Answer | Details |
| :--- | :--- | :--- |
| **Data collection & security** | Yes | Data encrypted in transit via HTTPS |
| **Account creation** | Yes | Google Sign-in or Local Guest Account |
| **Deletion request URL** | `https://cboler.github.io/war-of-attrition-game/#/delete-account` | Direct URL for users to request/execute data deletion |
| **Target Audience / Age** | Everyone (13+) | Casual strategic card game |
| **Advertising / Ads** | **No** | App contains zero advertisements |
| **Financial / Purchase Info** | **No** | App has no payments or real money transactions |
| **Location Data** | **No** | App does not access precise or coarse location |
| **Health / Fitness** | **No** | Not applicable |
| **Contacts / SMS / Photos** | **No** | No access to device storage/contacts/SMS |
