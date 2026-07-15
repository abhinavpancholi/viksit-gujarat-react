# Viksit Gujarat @ 2047 Dashboard — Handoff to Antigravity

## How to use this file

Give Antigravity **this file + the attached project folder/zip**
(`viksit-gujarat-dashboard`). This file is the single source of truth: it
has the original brief, the verified data dictionary, the exact state of
the code as of this handoff, and the remaining roadmap. Antigravity should
be able to pick this up cold and keep building without re-deriving
anything from scratch or re-asking about data shape.

The project folder already contains a working scaffold, generated JSON
data, and a README — this file adds the *why* and the *what's next* on
top of that.

---

## 1. Project brief (unchanged from original)

You are rebuilding a Power BI dashboard called "VIKSIT GUJARAT @ 2047" as
an open-source React web application. It's a government-style KPI
tracking dashboard for Gujarat's state development goals (GRIT — Gujarat
Rajya Institution for Transformation), tracking progress of "Macro Goals"
toward 2030 and 2047 targets.

**Constraints that still apply:**
- Bias toward shipping over gold-plating.
- Static JSON data, not a live database (no Postgres unless explicitly requested).
- Single React app (Vite, not Next.js).
- Work in small, verifiable increments; don't silently generate the whole
  app in one shot — report what's done and what to check after each step.
- Call out any place you're guessing at a business rule rather than
  silently assuming (one such guess already made — see Section 5).

**Data**: 3 CSVs, already converted to 2 pre-joined JSON files (see
Section 3). Treat the data dictionary in Section 2 as ground truth for
column names/values/statuses — don't invent columns or statuses that
aren't in it.

**UI/UX**: Two reference screenshots (`macro_goal_blueprint.png` and
`macro_goal_page_2.png`, described fully in Section 4) are a
LOOK-AND-FEEL reference only — layout structure, KPI card style, filter
bar placement, chart types, color-coded status system, information
density. Not a pixel spec. Numbers/labels/filters in the screenshots that
don't map to a real column (122 goals, a 5th "Advanced" status bucket,
District/Department filter, "Best Practices" panel) should be adapted or
dropped without needing to flag each instance — this has already been
decided, see Section 6.

---

## 2. Data dictionary (verified against the actual CSVs)

### `mg_master_final.csv` (110 rows × 13 cols) — primary table, overview dashboard
| Column | Type | Notes |
|---|---|---|
| `pillar` | string (3) | Thriving Economy - Earning Well (49), Empowered Citizen - Living Well (41), Key Enablers (20) |
| `themes` | string (11) | e.g. Agriculture/Irrigation/Rural Development (38), Human Capital: Education and Skilling (16), etc. |
| `mg_code` | string | primary key, joins all 3 sheets |
| `macro_goal` | string | full goal name |
| `direction` | string (2) | `UP` (87, higher=better) / `DOWN` (23, lower=better) — flips gap/status interpretation |
| `baseline` | float | starting value |
| `target_2030`, `target_2047` | float | targets |
| `sort_order` | int | display order |
| `target_2030_to_baseline_gap`, `target_2047_to_baseline_gap` | float | precomputed, don't recompute |
| `status_against_target_2030`, `status_against_target_2047` | string (4 each) | On Track (gap ≤25%), Slightly Off Track (gap ≤50%), At Risk (gap ≤75%), Critical (gap >75%) — **only 4 buckets, no "Advanced"** |

No nulls. Verified counts: pillar/theme/direction/status distributions all match what's documented — see the project's original brief doc for the full breakdown if needed.

### `mg_target_summary.csv` (79 rows × 10 cols) — CAGR analysis, detail page only
| Column | Type | Notes |
|---|---|---|
| `mg_code` | string | joins to master; only 79 of 110 goals have this |
| `macro_goal`, `direction` | string | denormalized |
| `current_cagr`, `recommended_cagr_2030`, `recommended_cagr_2047` | float | **decimal fractions** (e.g. `-0.0571` = -5.71%) — multiply by 100 for display |
| `target_2030`, `target_2047` | float | duplicate of master |
| `target_2030_achievement`, `target_2047_achievement` | string | projected fiscal year to hit target at current CAGR, e.g. `"2029-30"` — can also be a non-date string like `"Critically Lagging"`, handle as free text |

### `mg_cagr_final.csv` (1000 rows × 9 cols) — time series, trend charts
| Column | Type | Notes |
|---|---|---|
| `mg_code` | string | joins other sheets; 79 unique codes (matches target_summary) |
| `fy_numeric` | int | 2014–2040 |
| `fy_label` | string | e.g. `"2013-14"` |
| `value` | float | metric value that year |
| `status` / `status_group` | string (2) | `Actual`/`Actual` (760 rows, historical) or `Current_2030`/`Current CAGR` (240 rows, projected) — redundant columns, use either |
| `pillar`, `themes`, `macro_goal` | string | denormalized copies |

**Known real-data quirk to be aware of**: not every mg_code with `Actual` history also has `Current_2030` projection rows — some goals have 0 projection points. Handle gracefully (don't render an empty line / don't crash), don't treat as a bug.

---

## 3. Current code state (what's already built)

The attached `viksit-gujarat-dashboard/` folder contains a working
checkpoint. Do not re-scaffold — extend this.

```
viksit-gujarat-dashboard/
├── public/
│   ├── data/
│   │   ├── macroGoals.json     ✅ generated — 110 records, camelCase keys,
│   │   │                          left-joined with CAGR data (cagr: null if
│   │   │                          hasCagrAnalysis is false)
│   │   └── trendData.json      ✅ generated — keyed by mg_code, each entry has
│   │                              { actual: [...], currentTrend: [...],
│   │                                requiredTrend: { target2030: [...], target2047: [...] } }
│   ├── favicon.svg, icons.svg  (Vite defaults, unused so far)
├── scripts/
│   ├── mg_master_final.csv, mg_target_summary.csv, mg_cagr_final.csv   (source data)
│   └── convert_csv_to_json.py  ✅ re-runnable ETL, validates row counts,
│                                   documents the linear-interpolation
│                                   assumption for requiredTrend
├── src/
│   ├── index.css               ✅ Tailwind v4 import + design tokens (see Section 6)
│   ├── App.jsx                 ⚠️ PLACEHOLDER ONLY — just a heading, replace this
│   └── main.jsx                default Vite entry, untouched
├── package.json                ✅ deps installed: react-router-dom, recharts,
│                                   lucide-react, zustand, tailwindcss v4 (+
│                                   @tailwindcss/vite plugin)
├── vite.config.js              ✅ configured with @tailwindcss/vite plugin
└── README.md                   ✅ setup instructions, known gaps, progress checklist
```

**Verified working**: `npm install && npm run dev` runs; `npm run build`
produces a clean production build. Tailwind v4 is wired via the Vite
plugin (no separate `tailwind.config.js`/`postcss.config.js` needed — v4
uses the `@theme` block directly in `index.css`).

**Not yet built**: everything past the data layer. `App.jsx` is a
one-line placeholder. No routing, no components, no charts.

---

## 4. UI/UX spec (layout reference from screenshots — attach the 2 screenshot images if Antigravity supports image context; otherwise this description should suffice)

### Page 1 — Overview Dashboard (route: `/`)
Top to bottom:
1. **Header**: logo(s) + title "VIKSIT GUJARAT @ 2047" + subtitle "Gujarat Rajya Institution for Transformation (GRIT)"; right-aligned static "data as on" date, download button, "last refreshed" timestamp (all hardcoded, no live refresh).
2. **Filter row**: Pillar, Theme, Macro Goal, MG Status (2030), MG Status (2047) dropdowns + "Reset Filters" button. All filters cross-filter every chart below. (District/Department filter omitted — no matching column.)
3. **5 KPI cards**: Total Pillars (3), Total Themes (11), Total Macro Goals (110), Near Achievement Goals 2030, Near Achievement Goals 2047 (define "near achievement" as On Track status — flag this as an assumption if you pick a different definition).
4. **3-column summary row**:
   - Left: Macro Goals Status Summary — 4 status cards (On Track / Slightly Off Track / At Risk / Critical) with count + percentage, color-coded green/amber/orange/red.
   - Middle: donut chart "Progress Toward 2030 Target" (4 slices, `status_against_target_2030`), legend + center total.
   - Right: donut chart "Progress Toward 2047 Target", same but `status_against_target_2047`.
5. **3-column chart row**:
   - Left: vertical bar chart, Macro Goals by Pillar (3 bars).
   - Middle: tile grid, Macro Goals by Theme (11 colored tiles, theme name + count).
   - Right: table, "Top 10 Macro Goals at Risk / Critical" — Macro Goal, Pillar, Gap %, Status badge. Sort by gap ratio descending, filter to At Risk/Critical statuses, take top 10.
6. **Full-width line chart**: "Macro Goals Trend (All Years)" — count of goals in each status bucket over time. **This is the hardest chart** — status-over-time isn't a direct field. Lower priority; the original brief says it's OK to mark as a known gap in the README if time-constrained rather than forcing it.
7. **Footer**: "Percentages may not add up to 100% due to rounding" + source attribution.

### Page 2 — Macro Goal Detail (route: `/goal/:mgCode`)
1. Header: "Macro Goal: {name}", home icon back to overview, reset icon.
2. Left: searchable list of all goal names (radio-select) + "Total Macro Goals Incorporated: {N}".
3. Left-bottom: scrollable table of all goals — Baseline / Target 2030 / Target 2047, current selection highlighted.
4. Center-top: 2030/2047 toggle; line chart "Trend Analysis for Target {year}" — blue "Current Trend" line (`trendData[mgCode].currentTrend`) vs orange "Required Trend" line (`trendData[mgCode].requiredTrend.target2030` or `.target2047`, already computed).
5. Center-bottom: "Analysis" table — Target {year} / Current CAGR / Required CAGR / Target Achievement, from `macroGoals[i].cagr` (× 100 for %, handle `cagr === null` for the 31 goals without CAGR analysis — show an empty/N-A state, don't crash).
6. Best Practices panel: out of scope for v1 (no data) — either omit or static "coming soon" placeholder.

Color coding (already encoded as CSS variables, see Section 6): On Track → green, Slightly Off Track → amber, At Risk → orange, Critical → red. Pillar accents: Thriving Economy → green, Empowered Citizen → navy blue, Key Enablers → purple.

---

## 5. Business-rule assumptions already made (don't silently re-decide these — extend or explicitly flag if changing)

1. **Required Trend = linear interpolation.** Computed in
   `scripts/convert_csv_to_json.py::interpolate_required_trend()` from
   `baseline` at the earliest actual year to `target_2030`/`target_2047`
   at 2030/2047. If GRIT actually used a compounding/CAGR-based curve,
   this is the one function to change — regenerate the JSON, don't
   hand-edit it.
2. Not every goal has CAGR/trend data (only 79 of 110) — `hasCagrAnalysis: false` and `cagr: null` mark these; UI must handle that state (e.g. detail page shows "CAGR analysis not available for this goal" rather than blank/broken tables).

Still undecided / left for you to flag if you pick an approach:
- What "Near Achievement" means for the 2 KPI cards (suggested: goals with `status_against_target_20XX === "On Track..."`, but not yet implemented — confirm before building).
- Whether/how to attempt the "Macro Goals Trend (All Years)" chart (status counts over time) — no direct field for it; lowest priority per original roadmap.

---

## 6. Design tokens already committed to `src/index.css` (Tailwind v4 `@theme` block)

Palette chosen deliberately to avoid generic AI-dashboard defaults (no
cream+terracotta, no near-black+neon): cool slate background
(`--color-surface-0: #f4f6fa`), deep institutional navy
(`--color-navy-800: #16294f`) as primary brand color, warm saffron accent
(`--color-saffron-500: #e08e24`) for CTAs/highlights. Status and pillar
colors are semantic and fixed — don't remix their meaning:

- Status: `--color-status-ontrack` (green), `-slight` (amber), `-atrisk`
  (orange), `-critical` (red) — each with a `-soft` background variant for badges/cards.
- Pillar: `--color-pillar-economy` (green), `-citizen` (navy), `-enablers` (purple).
- Type: `--font-display` (Fraunces, serif — for the big header title),
  `--font-body` (IBM Plex Sans), `--font-mono` (IBM Plex Mono — use
  `.font-mono-num` utility class for KPI numbers/data tables, tabular
  figures). These are Google Fonts — need a `<link>` tag added to
  `index.html` (not yet added — currently falls back to system fonts).
  Add:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  ```
- Signature motif: `.brand-spine` utility — a thin 3-color gradient bar
  (pillar colors) meant to run along the top of the header, already defined but not yet used in any component.

---

## 7. Remaining roadmap (from the original 2-day plan, Day 1 Hour 1 = data layer = done)

**Day 1 remainder:**
- Layout shell — Header (with `.brand-spine`, add Google Fonts link), FilterBar (functional or stub first), Footer, `react-router-dom` routes for `/` and `/goal/:mgCode`.
- 5 KPI cards + Status Summary panel, reading real counts from `macroGoals.json`.
- Both donut charts (Recharts `PieChart`) + pillar bar chart.
- Theme tile grid + Top-10 At-Risk table.

**Day 2:**
- Wire real filter state (Zustand store suggested, already installed) so Pillar/Theme/Status dropdowns cross-filter every chart.
- Detail page: goal picker, baseline/target table, CAGR analysis table.
- Trend line chart with 2030/2047 toggle, using the pre-computed `currentTrend`/`requiredTrend` arrays.
- Attempt the all-years trend chart if time allows; otherwise document as a known gap.
- Polish: responsive check, color consistency, update README progress checklist, keyboard focus states (already have a global `:focus-visible` style in `index.css`).

**If short on time, cut in this order** (matches original brief): (1) all-years trend chart, (2) detail-page best-practices panel, (3) any filter without a clean data column (already handled — District/Department already omitted).

---

## 8. Working style Antigravity should follow

- Small, verifiable increments — report what's done and what to check after each one, don't silently build the whole remaining app in one pass.
- Show file/folder structure before generating a large number of new files.
- Default to static JSON (already the case) — don't introduce a backend/DB unless explicitly asked.
- Flag any new business-rule guess (thresholds, definitions, computed fields) rather than assuming silently, same as Sections 5 already did.
