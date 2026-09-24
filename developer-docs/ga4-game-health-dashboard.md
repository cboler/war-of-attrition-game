# GA4 Game Health Exploration & Dashboard Specification

Status: **Active GA4 telemetry exploration and game health dashboard specification.**  
Applies to: Gameplay telemetry schema `3`, UI engagement schema `1`, ruleset version `2026.09.1`.  
Related documents: [`telemetry-schema.md`](./telemetry-schema.md), [`opponent-commanders.md`](./opponent-commanders.md), [`google-play-game-stats-v1.md`](./google-play-game-stats-v1.md).

---

## 1. Overview & Operational Context

While Google Play Game Stats v1 integration is currently deferred in Android/TWA pending native channel verification ([`google-play-game-stats-v1.md`](./google-play-game-stats-v1.md)), Google Analytics 4 (GA4) telemetry is actively delivering rich, consent-gated gameplay and surface data across web, PWA, and TWA clients.

To monitor balance, AI commander behaviors, player win rates, and UI engagement without compromising user privacy, we established the **"Attrition - Game Health"** exploration in the primary GA4 property.

This document records the exact configuration, tab schemas, metric definitions, and data interpretation guidelines for this dashboard.

---

## 2. GA4 Exploration Metadata

- **Property Name:** Attrition
- **Measurement Stream:** Web stream (`G-...`)
- **Exploration Name:** `Attrition - Game Health`
- **Default Analysis Window:** Last 28 days (rolling active window, e.g. Aug 27 – Sep 23, 2026)
- **Technique:** Free-form
- **Available Segments:**
  - `US` (Geographic cohort)
  - `Direct traffic`
  - `Paid traffic`
  - `Mobile traffic`
  - `Tablet traffic`

---

## 3. Tab Configurations

The exploration consists of four targeted tabs, each answering specific design and operational questions.

### Tab 1: Commander Win Rates & Matchups (`Commander ...`)

Answers the core balance question: *How are human players performing against each of the five fair-play AI commanders?*

- **Technique:** Free-form
- **Visualization:** Table
- **Rows:** `Commander` (custom parameter registered as event dimension `commander` or derived from `commander_id`)
- **Columns:** `Outcome` (custom parameter `outcome`: values `player_win`, `opponent_win`, `tie`)
- **Values / Metrics:** `Event count` (and `% of row / % of total`)
- **Tab-Level Filter (CRITICAL):**
  - `Event name exactly matches war_resolved`

#### The 43.3% `(not set)` Anomaly Explained

In an un-filtered Free-form exploration tab evaluating `Commander` × `Outcome`, GA4 inspects *every single incoming event* in the stream. Because:
1. `outcome` is emitted only on terminal/resolution records (`war_resolved`, `reinforcement_resolved`, `settlement_resolved`), and
2. `commander_id` is emitted exclusively on War boundary records (`war_started`, `war_resolved`, `war_abandoned`) to preserve GA4's strict 25-parameter cap,

all intermediate turn, clash, battle, and UI events evaluate to `(not set)` for both dimensions. In the baseline 28-day window:
- Total events matched: **67**
- `(not set)` events: **29** (43.3% of all evaluated records)
- Clean, resolved commander encounters: **38** (56.7%)

Applying the tab-level filter `Event name exactly matches war_resolved` eliminates all 29 non-resolution records without altering data collection.

#### Current Baseline Distribution (Aug 27 – Sep 23, 2026)

From the 38 resolved commander Wars recorded in the 28-day baseline:

| Commander ID | In-Game Identity | Opponent Wins | Player Wins | Total Wars | Player Win Rate | Opponent Win Rate |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `quartermaster` | Marcel de Brie | 7 | 4 | 11 | 36.4% | 63.6% |
| `attritionist` | Bastien de Herve | 6 | 3 | 9 | 33.3% | 66.7% |
| `analyst` | Matthias von Greyerz | 1 | 6 | 7 | 85.7% | 14.3% |
| `gambler` | Sir Edmund Gloucester | 4 | 3 | 7 | 42.9% | 57.1% |
| `cornered-general` | Lorenzo di Taleggio | 3 | 1 | 4 | 25.0% | 75.0% |
| **Clean Totals** | *All 5 Commanders* | **21** | **17** | **38** | **44.7%** | **55.3%** |
| `(not set)` *(unfiltered noise)* | *Unfiltered stream events* | 0 | 0 | 29 | — | — |
| **Unfiltered Exploration Total** | *All events in view* | **21** | **17** | **67** | — | — |

**Key Gameplay Takeaway:**  
Human players hold an overall 44.7% win rate against the AI commanders. Matthias von Greyerz (`analyst`) is the most vulnerable to human play (85.7% player win rate), while Lorenzo di Taleggio (`cornered-general`) and Bastien de Herve (`attritionist`) pose the stiffest challenge.

---

### Tab 2: Wars & Campaign Dynamics (`W...`)

Answers questions about War length, completion rates, and astronomical anomalies:
- *How long do human wars last, and do any approach the 51-turn theoretical ceiling?*
- *Are anomalous deck orders occurring at expected Monte Carlo frequencies?*

- **Technique:** Free-form
- **Visualization:** Table / Bar chart
- **Rows:** `turn_number` (bucketed: 1–10, 11–20, 21–30, 31–40, 41–50, 51+)
- **Columns:** `outcome` (`player_win`, `opponent_win`)
- **Nested Dimension:** `anomalies_observed` (`0..5`)
- **Values / Metrics:** `Event count`, `Active users`
- **Tab-Level Filter:**
  - `Event name exactly matches war_resolved`

---

### Tab 3: Battles & Reinforcement Decisions (`B...`)

Answers questions regarding Challenge mechanics:
- *How frequently do human players challenge defeats?*
- *What percentage of ties escalate to Battle versus resolving by immediate attrition?*

- **Technique:** Free-form
- **Visualization:** Donut chart / Free-form table
- **Rows:** `challenger` (`player`, `opponent`)
- **Columns:** `outcome` (`success`, `failure`, `tie`)
- **Nested Metric / Dimension:** `escalated_to_battle` (`1` vs `0`)
- **Values / Metrics:** `Event count`
- **Tab-Level Filter:**
  - `Event name exactly matches reinforcement_resolved`

---

### Tab 4: Surface Views & Feature Engagement (`V...`)

Answers questions about player engagement with supporting lore and documentation:
- *Do players read the Chronicle, Field Manual, Rules, Dossiers, and Hall of Valor?*

- **Technique:** Free-form
- **Visualization:** Table / Horizontal bar
- **Rows:** `surface_id` (e.g. `chronicle`, `field_manual`, `rules`, `profile`, `achievements`, `settings`, `hall_of_valor`)
- **Values / Metrics:** `Event count`, `Active users`, `Sessions`
- **Tab-Level Filter:**
  - `Event name exactly matches surface_transition`

---

## 4. Maintenance & BigQuery Aggregation Path

1. **Do not create high-cardinality dimensions:** Keep custom dimensions limited to low-cardinality scalars (`outcome`, `commander`, `campaign_mode`, `surface_id`). High-cardinality IDs (`war_id`, `campaign_id`) must be analyzed through BigQuery export joins.
2. **BigQuery Export Schema:** Ensure GA4 streaming/daily exports are linked to the GCP BigQuery project. Normalized queries should join `war_started` (or `war_resolved`) on `war_id` to attribute intermediate turn events to their commander without exceeding GA4 client parameter limits.
3. **Public Reporting:** All external and blog reporting must present aggregated, thresholded metrics (minimum cohort size $N \ge 30$) to preserve player privacy.
