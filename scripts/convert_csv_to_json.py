"""
convert_csv_to_json.py

One-time (re-runnable) ETL: reads the 3 source CSVs
(mg_master_final, mg_target_summary, mg_cagr_final) and produces two
static JSON files consumed directly by the React app:

  public/data/macroGoals.json  - one record per macro goal (110), with
                                  mg_target_summary fields merged in where
                                  available (79 of the 110 have CAGR data).
  public/data/trendData.json   - the 1000 mg_cagr_final rows, grouped by
                                  mg_code, plus a client-usable "requiredTrend"
                                  series computed via linear interpolation
                                  between (baseline, baseline_year) and
                                  (target_year, target_value) for both 2030
                                  and 2047 horizons.

BUSINESS-RULE ASSUMPTION (flagged per project brief):
  The "Required Trend" line is NOT present in the source data. We compute
  it as a straight linear interpolation from the baseline year (the
  earliest fy_numeric present for that mg_code, typically 2014) to the
  target year (2030 or 2047), using baseline -> target_2030 / target_2047
  from mg_master_final. This is the simplest faithful approach mentioned
  in the data dictionary. If GRIT used a CAGR-based (compounding) curve
  instead of linear, this will need to change in one place:
  `interpolate_required_trend()` below.

Run with:  python3 scripts/convert_csv_to_json.py
(re-run any time the source CSVs are updated in scripts/)
"""

import json
import math
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).parent
OUT_DIR = SCRIPT_DIR.parent / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

master = pd.read_csv(SCRIPT_DIR / "mg_master_final.csv", encoding="utf-8-sig")
target_summary = pd.read_csv(SCRIPT_DIR / "mg_target_summary.csv", encoding="utf-8-sig")
cagr = pd.read_csv(SCRIPT_DIR / "mg_cagr_final.csv", encoding="utf-8-sig")

# Sanity-check row counts against the data dictionary
assert len(master) == 110, f"expected 110 master rows, got {len(master)}"
assert len(target_summary) == 79, f"expected 79 target_summary rows, got {len(target_summary)}"
assert len(cagr) == 1000, f"expected 1000 cagr rows, got {len(cagr)}"

# ---------------------------------------------------------------------------
# 1. macroGoals.json — master list, left-joined with target_summary
# ---------------------------------------------------------------------------

ts_by_code = {row["mg_code"]: row for _, row in target_summary.iterrows()}

def clean_float(v):
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    return float(v)

macro_goals = []
for _, row in master.iterrows():
    mg_code = row["mg_code"]
    record = {
        "mgCode": mg_code,
        "pillar": row["pillar"],
        "theme": row["themes"],
        "macroGoal": row["macro_goal"],
        "direction": row["direction"],  # "UP" | "DOWN"
        "baseline": clean_float(row["baseline"]),
        "target2030": clean_float(row["target_2030"]),
        "target2047": clean_float(row["target_2047"]),
        "sortOrder": int(row["sort_order"]),
        "gap2030Ratio": clean_float(row["target_2030_to_baseline_gap"]),
        "gap2047Ratio": clean_float(row["target_2047_to_baseline_gap"]),
        "status2030": row["status_against_target_2030"],
        "status2047": row["status_against_target_2047"],
        "hasCagrAnalysis": mg_code in ts_by_code,
    }
    if mg_code in ts_by_code:
        ts = ts_by_code[mg_code]
        record["cagr"] = {
            "currentCagr": clean_float(ts["current_cagr"]),
            "recommendedCagr2030": clean_float(ts["recommended_cagr_2030"]),
            "recommendedCagr2047": clean_float(ts["recommended_cagr_2047"]),
            "targetAchievement2030": ts["target_2030_achievement"],
            "targetAchievement2047": ts["target_2047_achievement"],
        }
    else:
        record["cagr"] = None
    macro_goals.append(record)

macro_goals.sort(key=lambda r: r["sortOrder"])

with open(OUT_DIR / "macroGoals.json", "w", encoding="utf-8") as f:
    json.dump(macro_goals, f, indent=2, ensure_ascii=False)

# ---------------------------------------------------------------------------
# 2. trendData.json — mg_cagr_final grouped by mg_code + computed required trend
# ---------------------------------------------------------------------------

master_by_code = {row["mg_code"]: row for _, row in master.iterrows()}

def interpolate_required_trend(mg_code, years):
    """Linear interpolation from (baseline_year, baseline) to (target_year, target)
    for both the 2030 and 2047 horizons. baseline_year = earliest fy_numeric
    present in the actual trend data for this goal."""
    if mg_code not in master_by_code or not years:
        return {"target2030": [], "target2047": []}

    row = master_by_code[mg_code]
    baseline_year = min(years)
    baseline_val = clean_float(row["baseline"])
    result = {}
    for horizon_key, target_col, target_year in (
        ("target2030", "target_2030", 2030),
        ("target2047", "target_2047", 2047),
    ):
        target_val = clean_float(row[target_col])
        series = []
        if baseline_val is None or target_val is None or target_year == baseline_year:
            result[horizon_key] = series
            continue
        span = target_year - baseline_year
        # emit one point per year from baseline_year through target_year
        for yr in range(baseline_year, target_year + 1):
            frac = (yr - baseline_year) / span
            val = baseline_val + frac * (target_val - baseline_val)
            series.append({"fyNumeric": yr, "value": round(val, 4)})
        result[horizon_key] = series
    return result


trend_by_code = {}
for mg_code, group in cagr.groupby("mg_code"):
    group_sorted = group.sort_values("fy_numeric")
    years = group_sorted["fy_numeric"].tolist()
    actual = []
    current_2030 = []
    for _, r in group_sorted.iterrows():
        point = {
            "fyNumeric": int(r["fy_numeric"]),
            "fyLabel": r["fy_label"],
            "value": clean_float(r["value"]),
        }
        if r["status"] == "Actual":
            actual.append(point)
        else:  # Current_2030
            current_2030.append(point)

    trend_by_code[mg_code] = {
        "mgCode": mg_code,
        "pillar": group_sorted.iloc[0]["pillar"],
        "theme": group_sorted.iloc[0]["themes"],
        "macroGoal": group_sorted.iloc[0]["macro_goal"],
        "actual": actual,
        "currentTrend": current_2030,
        "requiredTrend": interpolate_required_trend(mg_code, years),
    }

with open(OUT_DIR / "trendData.json", "w", encoding="utf-8") as f:
    json.dump(trend_by_code, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(macro_goals)} macro goals -> {OUT_DIR / 'macroGoals.json'}")
print(f"Wrote {len(trend_by_code)} trend series -> {OUT_DIR / 'trendData.json'}")
print(f"Goals with CAGR analysis: {sum(1 for m in macro_goals if m['hasCagrAnalysis'])}")
