# Viksit Gujarat @2047 — PowerBI → React Rebuild
## Master Brief for Claude Project Setup

Paste the sections below into a new **Claude Project**: put "1. Project Instructions" into the Project's custom instructions box, and attach the files listed in "2. Knowledge Base" to Project Knowledge. Everything else is your own roadmap/reference.

---

## 0. One-paragraph summary (for your own sanity check)

You have a Power BI dashboard ("VIKSIT GUJARAT @ 2047", built by GRIT) whose **look and feel** you want to recreate — KPI cards, filter bar, donut/bar/line charts, color-coded status system — as an **open-source React web app**, in a **2-day window**. The screenshots are a style/layout reference only; the actual content will be driven by a real Excel dataset (110 "Macro Goals" across 3 pillars and 11 themes, tracked toward 2030/2047 targets), which doesn't share exact numbers with the screenshots and doesn't need to. You're deciding whether to stand up Postgres or ship on static JSON, and considering doing the build in both Claude (chat/Code) and Antigravity (Google's agentic IDE) — so this brief needs to be tool-agnostic and complete enough that either agent can pick it up cold.

---

## 1. Project Instructions (paste into Claude Project custom instructions)

```
You are helping me rebuild a Power BI dashboard called "VIKSIT GUJARAT @ 2047" as an
open-source React web application. This is a government-style KPI tracking dashboard
for Gujarat's state development goals (GRIT — Gujarat Rajya Institution for
Transformation), tracking progress of "Macro Goals" toward 2030 and 2047 targets.

DEADLINE: 2 days total. Bias every decision toward shipping over gold-plating.
Prefer static JSON data over a live database unless I explicitly ask you to wire up
Postgres. Prefer a single well-structured React app (Vite, not Next.js, unless I say
otherwise) over a multi-service architecture.

DATA: The source data is an Excel workbook with 3 sheets — mg_master_final,
mg_target_summary, mg_cagr_final — described in full in the attached data dictionary.
Treat that data dictionary as ground truth for column names, types, values, and
status categories. Do NOT invent columns or statuses that aren't in it. Build every
chart and KPI off the real numbers in this data — don't try to match the specific
numbers shown in the reference screenshots (122 goals, an "Advanced" status bucket,
etc.) since those come from a different/live export and are not what we're rendering.

UI/UX: Two reference screenshots are attached — they are a LOOK-AND-FEEL reference
only, not a literal spec to match. I like their layout structure, KPI card style,
filter bar placement, chart types, color-coded status system, and overall
information density, and want the new app to feel structurally similar. But:
- Any specific numbers, labels, or filter options in the screenshots that don't have
  a matching column in the real data (e.g. District/Department filter, an "Advanced"
  status, "Best Practices" text panel) should just be adapted or dropped to fit what
  the real data actually supports — no need to flag these as mismatches or chase down
  the exact source, just build sensibly around what's real.
- Visual polish, exact colors, fonts, spacing, and componentization are all yours to
  decide — this is a fresh, open-source implementation inspired by the screenshots,
  not a pixel clone.

WORKING STYLE:
- Work in small, verifiable increments: data layer → layout shell → one working chart
  → rest of charts → filters → detail page → polish.
- After each increment, tell me what's done and what to check, don't just keep going
  silently through the whole app.
- Show me your file/folder structure before generating a large number of files.
- If you're unsure whether to use Postgres or static JSON at any point, default to
  static JSON — it's the correct choice for a 2-day timeline and a read-only public
  dashboard. Only revisit this if I say the data needs to be editable at runtime.
- Call out any place where you're guessing at a business rule (e.g. how "gap %" or
  a status bucket is computed) rather than silently assuming.
```

---

## 2. Knowledge base — what to attach to the Claude Project

Attach these 3 files to Project Knowledge:

1. **The data dictionary** (Section 3 below — save as `DATA_DICTIONARY.md`)
2. **The original Excel file** — `Viksit_Theme_Macro_Goal_data.xlsx` (or export each sheet to CSV, which is more token-efficient: `mg_master_final.csv`, `mg_target_summary.csv`, `mg_cagr_final.csv`)
3. **The two UI screenshots** (overview dashboard + macro goal detail page)

Optional but helpful: a `UI_SPEC.md` with Section 4 below, so the visual spec survives even in a chat where the images scroll out of the context window.

---

## 3. Data Dictionary (ground truth — verified against the actual file)

I opened the workbook directly rather than guessing from the screenshots. Here's exactly what's in it. **Note: the numbers in the screenshot (122 macro goals, an "Advanced" status bucket, district/department filters) do not all match this extract (110 goals, 4 status buckets, no district column) — see the "Known Gaps" note at the end. Flag this to whoever built the PowerBI version, or ask if there's a more complete export.**

### Sheet 1: `mg_master_final` (110 rows × 13 columns)
The master list of Macro Goals with baseline/target values and computed status. This is your primary table for the overview dashboard (KPI cards, pillar/theme bar charts, status donuts, at-risk table).

| Column | Type | Notes |
|---|---|---|
| `pillar` | string (3 values) | `Thriving Economy - Earning Well` (49), `Empowered Citizen - Living Well` (41), `Key Enablers` (20) |
| `themes` | string (11 values) | e.g. `Agriculture, Irrigation and Rural Development` (38), `Human Capital: Education and Skilling` (16), `Nari Shakti: Women-led Development` (11), etc. |
| `mg_code` | string | short unique ID per macro goal, e.g. `HM3`, `AIRM5` — **primary key**, joins to the other two sheets |
| `macro_goal` | string | full human-readable goal name/description |
| `direction` | string (2 values) | `UP` (87 rows — higher is better) or `DOWN` (23 rows — lower is better, e.g. mortality rates). **This flips how "gap" and "on track" should be interpreted and how charts should be drawn.** |
| `baseline` | float | starting value |
| `target_2030` | float | target value by 2030 |
| `target_2047` | float | target value by 2047 |
| `sort_order` | int | display ordering hint |
| `target_2030_to_baseline_gap` | float | precomputed gap ratio vs 2030 target (already calculated — don't recompute unless asked) |
| `target_2047_to_baseline_gap` | float | precomputed gap ratio vs 2047 target |
| `status_against_target_2030` | string (4 values) | `On Track (gap ≤ 25%)` [46], `Slightly Off Track (gap ≤ 50%)` [27], `Critical (gap > 75%)` [25], `At Risk (gap ≤ 75%)` [12] |
| `status_against_target_2047` | string (4 values) | `Critical (gap > 75%)` [45], `On Track (gap ≤ 25%)` [27], `Slightly Off Track (gap ≤ 50%)` [20], `At Risk (gap ≤ 75%)` [18] |

No nulls anywhere in this sheet. Status strings are already bucketed for you — treat them as an enum, don't re-derive thresholds unless the "Advanced" bucket needs to be added (see Known Gaps).

### Sheet 2: `mg_target_summary` (79 rows × 10 columns)
CAGR (compound annual growth rate) analysis per goal — this is what powers the "Analysis M-Goal" detail page (image 2): the "Target 2030 / Current CAGR / Required CAGR / Target Achievement as per Current CAGR" table.

| Column | Type | Notes |
|---|---|---|
| `mg_code` | string | joins to `mg_master_final.mg_code` (only 79 of the 110 goals have CAGR analysis — not every goal has this level of detail) |
| `macro_goal` | string | goal name (denormalized, matches sheet 1) |
| `direction` | string | `UP` / `DOWN`, same meaning as sheet 1 |
| `current_cagr` | float | CAGR as a **decimal fraction** (e.g. `0.0176` = 1.76%, `-0.1299` = -12.99%) — the screenshot displays these as percentages, so multiply by 100 for display |
| `recommended_cagr_2030` | float | CAGR required to hit the 2030 target, same decimal-fraction format |
| `recommended_cagr_2047` | float | CAGR required to hit the 2047 target |
| `target_2030` | float | duplicate of sheet 1's value |
| `target_2047` | float | duplicate of sheet 1's value |
| `target_2030_achievement` | string | a fiscal-year label like `"2029-30"` — the *projected* year the 2030 target gets hit at current CAGR (can be later or earlier than 2030 itself) |
| `target_2047_achievement` | string | same, for the 2047 target |

No nulls. This is a smaller, specialized table — use it only on the detail/analysis page, not the overview.

### Sheet 3: `mg_cagr_final` (1000 rows × 9 columns)
The time-series trend data — powers the line chart in image 2 ("Trend Analysis for Target 2030/2047") and the overview page's "Macro Goals Trend (All Years)" chart.

| Column | Type | Notes |
|---|---|---|
| `mg_code` | string | joins to the other two sheets |
| `fy_numeric` | int | fiscal year as a number, range **2014–2040** |
| `fy_label` | string | fiscal year as a label, e.g. `"2013-14"` |
| `value` | float | the metric's value in that year |
| `status` | string (2 values) | `Actual` (760 rows — historical/observed data) or `Current_2030` (240 rows — **projected/extrapolated** data based on current trend, shown as the blue "Current Trend" line in image 2 vs. the orange "Required Trend" you'd need to compute from baseline→target) |
| `status_group` | string (2 values) | same split, labeled `Actual` / `Current CAGR` — use whichever of `status`/`status_group` reads more cleanly in your code, they're redundant |
| `pillar`, `themes`, `macro_goal` | string | denormalized copies of sheet 1's fields, included for convenience so you don't always need a join |

79 unique `mg_code` values here (matches sheet 2, not sheet 1 — so trend/CAGR detail pages only exist for a subset of the 110 total goals). Each goal has between ~11 and ~21 yearly data points, spanning a mix of historical years and future years out to 2026–2040 depending on the goal.

**Important derived logic you'll need to build yourself (not in the data):** the screenshot's orange "Required Trend" line isn't in the file — it's a straight/implied path from `baseline` (sheet 1) to `target_2030`/`target_2047` (sheet 1) across the intervening years. Compute it client-side: linear interpolation between (baseline year, baseline value) and (target year, target value) is the simplest faithful approach; ask if GRIT used a different curve (e.g. CAGR-based rather than linear) before assuming.

### Adapting the reference screenshots to the real data
The screenshots are a style/layout reference, not a literal spec — the numbers shown there (122 goals, a 5th "Advanced" status bucket, etc.) come from a live/different export and won't match what you build. Build off the real data (110 goals, 4 status buckets) and adapt the following spots accordingly, without needing to chase down or explain the discrepancy each time:
- **Status buckets**: use the real 4 — On Track, Slightly Off Track, At Risk, Critical — instead of the 5 shown in the screenshot. Drop "Advanced" from the summary cards/legend/donuts, or repurpose one of its slots for something the real data supports.
- **District/Department filter**: no matching column exists in any sheet — just omit this filter from the FilterBar.
- **"Best Practices / Initiatives by Government of Gujarat" panel** (image 2, bottom-left): no matching data — either omit this panel for v1, or leave it as a static placeholder card with a "coming soon" note, whichever looks better in the layout.
- **"Data as on" / "Last refreshed" header fields**: these implied a live PowerBI connection — hardcode a static build/data date instead of faking a live refresh.
- Treat any other screenshot detail that doesn't map cleanly to a real column the same way: take the visual idea, build it with what the data actually has.

---

## 4. UI/UX Spec (style & layout reference — not a literal spec)

The two screenshots are a Power BI dashboard whose look and feel you like; the structure below describes that layout so it's easy to build toward, but every number, label, and filter option should come from the real data dictionary in Section 3, not from the screenshot itself.

### Page 1 — Overview Dashboard
Layout, top to bottom:
1. **Header bar**: logo(s) + title "VIKSIT GUJARAT @ 2047" + subtitle "Gujarat Rajya Institution for Transformation (GRIT)", right-aligned: data-as-on date, download button, last-refreshed timestamp. *(Static in v1 — no live refresh.)*
2. **Filter row**: dropdowns for Pillar, Theme, Macro Goal, District/Department (flag as unavailable per Known Gaps), MG Status (2030), MG Status (2047), plus a "Reset Filters" button. All filters should cross-filter every chart below them.
3. **5 KPI cards**: Total Pillars, Total Themes, Total Macro Goals, Near Achievement Goals 2030, Near Achievement Goals 2047. Each is a big number + icon + label.
4. **3-column summary row**:
   - Left: "Macro Goals Status Summary" — 5 status cards (On Track / Advanced / Slightly Off Track / At Risk / Critical) each with count + percentage, color-coded (green/blue/amber/orange/red).
   - Middle: donut chart "Progress Toward 2030 Target" with legend + center total.
   - Right: donut chart "Progress Toward 2047 Target", same style.
5. **3-column chart row**:
   - Left: vertical bar chart "Number of Macro Goals by Pillars" (3 bars).
   - Middle: grid of colored tiles "Number of Macro Goals by Theme" (11 tiles, each a colored card with theme name + count — not a traditional chart, more like a tile grid, colors vary per theme).
   - Right: table "Top 10 Macro Goals at Risk / Critical" — columns: Macro Goal, Pillar, Gap %, Status (status as a colored badge/pill).
6. **Full-width line chart**: "Macro Goals Trend (All Years)" — 5 lines (On Track / Advanced / Slightly Off Track / At Risk / Critical / Behind), x-axis is time (monthly ticks from Jan 2023–Apr 2025 in the screenshot, though your real data may support a longer range), y-axis is count of goals in each bucket at that point in time. *(Note: this requires a status-over-time dataset which isn't directly in the 3 sheets as given — you may need to bucket `mg_cagr_final` rows by year and re-derive status per year, or treat this chart as lower priority if the data doesn't cleanly support it.)*
7. **Footer note**: "Percentages may not add up to 100% due to rounding" + source attribution.

Color coding used throughout (keep consistent app-wide):
- On Track → green
- Advanced → blue
- Slightly Off Track → amber/yellow
- At Risk → orange
- Critical/Behind → red

### Page 2 — Macro Goal Detail / Analysis
Reached by clicking a macro goal (e.g. from the at-risk table or a goal picker).
1. **Tabs**: "Best Studies" / "Analysis M-Goal" (active).
2. **Header**: "Macro Goal: {goal name}" + a "View Detailed Analysis" button + home icon (returns to overview) + a reset/eraser icon (clears selection).
3. **Left column**: "Select Macro Goal" — searchable radio-button list of all goal names (this is effectively the goal picker/filter for this page), plus below it "Total Macro Goals Incorporated: {N}".
4. **Left-bottom panel**: "Macro Goals - Baseline Value, Target (2030 and 2047)" — a scrollable table of ALL goals with Baseline/Target 2030/Target 2047 columns, current selection highlighted.
5. **Center-top**: toggle buttons "2030" / "2047" switching the chart below between the two target horizons; line chart "Trend Analysis for Target {year}" with two series — "Current Trend" (blue, from `mg_cagr_final` where `status = Current_2030`, i.e. the extrapolation) and "Required Trend" (orange, the linear/interpolated path from baseline to target — computed client-side, see Data Dictionary note).
6. **Center-bottom**: "Analysis" table — Target {year} / Current CAGR / Required CAGR / Target Achievement as per Current CAGR — pulled directly from `mg_target_summary`, formatted as percentages.
7. **Bottom-left**: "Best Practices / Initiatives by Government of Gujarat" — free text panel (out of scope for v1, see Known Gaps).
8. **Two more empty panel placeholders** in the screenshot (bottom-middle, bottom-right, top-right) — likely additional detail widgets not fully visible in this capture; treat as "reserve this layout slot" rather than guessing content.

---

## 5. Tech Stack Recommendation (given the 2-day constraint)

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **React + Vite** (not Next.js) | No SSR/routing complexity needed for a dashboard; Vite gives instant dev server + fast builds. |
| Routing | **react-router-dom**, 2 routes (`/` overview, `/goal/:mgCode` detail) | Matches the 2-page structure exactly. |
| Charts | **Recharts** | Covers donuts, bar charts, multi-line time series, tables — all chart types you need, with a gentle API. |
| Styling | **Tailwind CSS** | Fast to hand-build KPI cards/status pills/color system without writing custom CSS from scratch. |
| State/filters | **React Context or Zustand** for cross-filter state (pillar/theme/status selections shared across all charts) | Avoids prop-drilling filters through every chart component. |
| Data layer | **Static JSON files, generated once from the Excel**, imported directly into the app (see Section 6) | See decision rationale below. |
| Icons | **lucide-react** | Matches the icon style in the screenshots (trophy, target, etc.). |

### The Postgres question — direct recommendation: **skip it for v1**

You floated moving the Excel data into Postgres "for easy calculation." Given 2 days:

- **All the heavy calculation is already done** in the Excel (gap %, status buckets, CAGR, achievement years). You're not computing aggregates live — you're filtering and rendering already-computed rows. That's exactly what a static JSON array + client-side `.filter()` does well, with zero infra.
- A real Postgres setup costs you: schema design, a backend API (Express/Fastify or similar) to serve it, CORS/auth if any, hosting/connection-string management, and a migration script — realistically **a half-day to a full day** of your 2 days, for a dataset that's under 1MB and read-only.
- "Open source" and "easy to run" cut in favor of static data too — anyone cloning the repo can `npm install && npm run dev` with zero database setup.
- **When Postgres would be worth it**: if this needs to become a live, editable admin tool where someone updates macro goal values over time and multiple dashboards read from one source of truth. That's a real v2 feature, not a v1-in-2-days feature.

**Recommended data path instead:**
1. Convert the 3 Excel sheets to 3 JSON files (or one combined JSON) using a one-time Python/Node script.
2. Pre-join what's convenient (e.g. attach `mg_target_summary` and relevant `mg_cagr_final` rows onto each `mg_master_final` record by `mg_code`) so components don't need runtime joins.
3. Import the JSON directly in React (`import data from './data/macroGoals.json'`) or `fetch()` it from `/public` — both are instant, no server needed.
4. If you later want Postgres, this JSON becomes your seed data — no work is wasted.

---

## 6. Suggested Project Structure

```
viksit-gujarat-dashboard/
├── public/
│   └── data/
│       ├── macroGoals.json        # from mg_master_final, joined with target_summary
│       └── trendData.json         # from mg_cagr_final, keyed by mg_code
├── scripts/
│   └── convert_excel_to_json.py   # one-time ETL, re-runnable if source data updates
├── src/
│   ├── components/
│   │   ├── layout/         (Header, FilterBar, Footer)
│   │   ├── kpi/            (KpiCard, StatusSummaryCard)
│   │   ├── charts/         (DonutChart, PillarBarChart, ThemeTileGrid,
│   │   │                    AtRiskTable, TrendLineChart, GoalTrendChart)
│   │   └── shared/         (StatusBadge, Dropdown)
│   ├── pages/
│   │   ├── OverviewDashboard.jsx
│   │   └── MacroGoalDetail.jsx
│   ├── context/            (FilterContext or a zustand store)
│   ├── utils/              (statusColors.js, gapCalculations.js, linearInterpolate.js)
│   ├── data/               (loaders that import/fetch the JSON)
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── README.md               # setup instructions — important for "open source"
```

---

## 7. 2-Day Roadmap

**Day 1 — Data + Skeleton + Core Charts**
- Hour 1: Scaffold Vite + Tailwind + Recharts + react-router. Write `convert_excel_to_json.py`, produce clean JSON, sanity-check row counts match this brief (110 / 79 / 1000).
- Hour 2: Build layout shell — Header, FilterBar (non-functional stub), Footer, routing between the two pages.
- Hour 3–4: Build the 5 KPI cards + Macro Goals Status Summary panel (real counts from JSON, no filtering yet).
- Hour 5–6: Build both donut charts (2030/2047 progress) and the pillar bar chart.
- Hour 7–8: Build the Theme tile grid and the Top-10 At-Risk table.

**Day 2 — Filters, Detail Page, Trend Chart, Polish**
- Hour 1–3: Wire up real filter state (pillar/theme/status dropdowns) so all Day-1 charts cross-filter correctly. This is the highest-risk item — test it thoroughly.
- Hour 4–5: Build the Macro Goal Detail page: goal picker list, baseline/target table, CAGR analysis table.
- Hour 6: Build the trend line chart (Current vs. Required trend) with the 2030/2047 toggle and the linear-interpolation utility for "Required Trend."
- Hour 7: Attempt the "Macro Goals Trend (All Years)" full-width chart on the overview page if time allows; otherwise mark as a known gap in the README (this needs status-over-time bucketing that isn't a direct data field — don't burn hours forcing it if behind schedule).
- Hour 8: Polish pass — color consistency, responsive check, write the README (setup steps, data-refresh instructions, known gaps from Section 3), push to GitHub.

**If you fall behind:** cut in this order — (1) full-width trend-over-time chart, (2) detail-page "Best Studies" tab / best-practices panel, (3) any filter without a clean matching column (e.g. District/Department, already omitted per Section 4). Never cut the filter wiring or the two donut charts — those are the dashboard's core value.

---

## 8. On using Claude vs. Antigravity

This brief is written to be pasted whole into either tool's context, so you can genuinely run them in parallel or fall back from one to the other:
- **Claude Project** (this doc as instructions + attached data/screenshots): best for iterating conversationally on component code, reasoning about the data-dictionary gaps, and writing the ETL script.
- **Claude Code** (if available to you): best for actually scaffolding the repo, running the ETL script, and doing the file-by-file build in your own filesystem with full read/write/test loop.
- **Antigravity**: same brief applies — attach the same 3 files (data dictionary, Excel/CSVs, screenshots) as its equivalent of project context, and it can drive the agentic build loop similarly.

Whichever you start in, keep this brief as the single source of truth so the other tool can pick up mid-build without re-deriving the data model from scratch.
