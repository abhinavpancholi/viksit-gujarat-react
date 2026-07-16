import json
import math
import csv
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
OUT_DIR = SCRIPT_DIR.parent / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_float(v):
    if v is None or v == "":
        return None
    try:
        val = float(v)
        if math.isnan(val):
            return None
        return val
    except ValueError:
        return None

# Load master
master_rows = []
with open(SCRIPT_DIR / "mg_master_final.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        master_rows.append(row)

# Load target_summary
ts_rows = []
with open(SCRIPT_DIR / "mg_target_summary.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        ts_rows.append(row)

# Load cagr
cagr_rows = []
with open(SCRIPT_DIR / "mg_cagr_final.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        cagr_rows.append(row)

assert len(master_rows) == 110, f"expected 110 master rows, got {len(master_rows)}"
assert len(ts_rows) == 79, f"expected 79 target_summary rows, got {len(ts_rows)}"
assert len(cagr_rows) == 5359, f"expected 5359 cagr rows, got {len(cagr_rows)}"

ts_by_code = {row["mg_code"]: row for row in ts_rows}

macro_goals = []
for row in master_rows:
    mg_code = row["mg_code"]
    record = {
        "mgCode": mg_code,
        "pillar": row["pillar"],
        "theme": row["themes"],
        "macroGoal": row["macro_goal"],
        "direction": row["direction"],
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

# Group cagr rows by mg_code
cagr_by_code = {}
for row in cagr_rows:
    mg_code = row["mg_code"]
    if mg_code not in cagr_by_code:
        cagr_by_code[mg_code] = []
    cagr_by_code[mg_code].append(row)

trend_by_code = {}
for mg_code, rows in cagr_by_code.items():
    # Sort by fy_numeric
    rows_sorted = sorted(rows, key=lambda r: int(r["fy_numeric"]))
    
    actual = []
    current_2030 = []
    recommended_2030 = []
    current_2047 = []
    recommended_2047 = []
    
    for r in rows_sorted:
        point = {
            "fyNumeric": int(r["fy_numeric"]),
            "fyLabel": r["fy_label"],
            "value": clean_float(r["value"]),
        }
        status_val = r["status"]
        if status_val == "Actual":
            actual.append(point)
        elif status_val == "Current_2030":
            current_2030.append(point)
        elif status_val == "Recommended_2030":
            recommended_2030.append(point)
        elif status_val == "Current_2047":
            current_2047.append(point)
        elif status_val == "Recommended_2047":
            recommended_2047.append(point)

    first_row = rows_sorted[0]
    trend_by_code[mg_code] = {
        "mgCode": mg_code,
        "pillar": first_row["pillar"],
        "theme": first_row["themes"],
        "macroGoal": first_row["macro_goal"],
        "actual": actual,
        "current_2030": current_2030,
        "recommended_2030": recommended_2030,
        "current_2047": current_2047,
        "recommended_2047": recommended_2047,
    }

with open(OUT_DIR / "trendData.json", "w", encoding="utf-8") as f:
    json.dump(trend_by_code, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(macro_goals)} macro goals -> {OUT_DIR / 'macroGoals.json'}")
print(f"Wrote {len(trend_by_code)} trend series -> {OUT_DIR / 'trendData.json'}")
print(f"Goals with CAGR analysis: {sum(1 for m in macro_goals if m['hasCagrAnalysis'])}")
