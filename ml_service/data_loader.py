"""
FINNA City Dataset Loader & Validator
Validates schema, checks ranges, outliers, missing values, duplicates,
and compiles city-level dataset averages (the plain average baseline).
"""

import os
import glob
import json
import logging
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("finna_data_loader")

REQUIRED_COLUMNS = [
    "state",
    "city",
    "city_tier",
    "avg_gig_weekly_income",
    "income_std",
    "avg_monthly_rent",
    "avg_monthly_food_utilities",
    "avg_transport_fuel",
    "avg_emi_burden",
    "cost_of_living_index",
    "platform_type",
    "month_season_factor",
    "typical_weekly_hours",
    "safe_savings_capacity",
    "source",
    "year",
    "synthetic"
]

NUMERIC_COLUMNS = [
    "avg_gig_weekly_income",
    "income_std",
    "avg_monthly_rent",
    "avg_monthly_food_utilities",
    "avg_transport_fuel",
    "avg_emi_burden",
    "cost_of_living_index",
    "month_season_factor",
    "typical_weekly_hours",
    "safe_savings_capacity",
    "year"
]

def validate_dataframe(df: pd.DataFrame, filename: str) -> Tuple[bool, List[str], List[str]]:
    """
    Validates a loaded DataFrame against the FINNA schema.
    Returns (is_valid, errors, warnings)
    """
    errors: List[str] = []
    warnings: List[str] = []

    # 1. Check required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"[{filename}] Missing required columns: {missing_cols}")

    if errors:
        return False, errors, warnings

    # 2. Check empty or null counts
    for col in REQUIRED_COLUMNS:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            errors.append(f"[{filename}] Column '{col}' has {null_count} null/NaN values.")

    # 3. Numeric column validation
    for col in NUMERIC_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col])
            except Exception:
                errors.append(f"[{filename}] Column '{col}' contains non-numeric data.")
        
        # Range/outlier sanity checks
        if col == "avg_gig_weekly_income":
            if (df[col] <= 0).any():
                errors.append(f"[{filename}] 'avg_gig_weekly_income' contains non-positive values.")
            if (df[col] > 50000).any():
                warnings.append(f"[{filename}] Extreme weekly income detected (> 50,000 INR).")
        elif col == "cost_of_living_index":
            if (df[col] < 40).any() or (df[col] > 250).any():
                warnings.append(f"[{filename}] Unusual cost_of_living_index outside [40, 250].")
        elif col == "typical_weekly_hours":
            if (df[col] < 5).any() or (df[col] > 110).any():
                warnings.append(f"[{filename}] Weekly hours outside [5, 110].")

    # 4. Check synthetic flag
    if "synthetic" in df.columns:
        # Normalize to boolean
        if not pd.api.types.is_bool_dtype(df["synthetic"]):
            df["synthetic"] = df["synthetic"].astype(str).str.lower().isin(["true", "1", "yes"])

    # 5. Check duplicate rows
    dup_count = df.duplicated(subset=["state", "city", "platform_type", "typical_weekly_hours", "month_season_factor"]).sum()
    if dup_count > 0:
        warnings.append(f"[{filename}] Found {dup_count} duplicate city-platform-hours condition rows.")

    is_valid = len(errors) == 0
    return is_valid, errors, warnings


def load_all_city_data(data_dir: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads and validates all CSV files from the data directory.
    Returns (combined_df, validation_report)
    """
    if data_dir is None:
        base = os.path.dirname(__file__)
        data_dir = os.path.join(base, "data")

    csv_files = glob.glob(os.path.join(data_dir, "*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV datasets found in {data_dir}. Drop city CSVs into this folder.")

    dfs: List[pd.DataFrame] = []
    all_errors: List[str] = []
    all_warnings: List[str] = []
    file_summaries: List[Dict[str, Any]] = []

    print("=" * 70)
    print(f"FINNA CITY DATASET LOADER: Scanning {len(csv_files)} file(s) in {data_dir}")
    print("=" * 70)

    for fpath in csv_files:
        fname = os.path.basename(fpath)
        try:
            df = pd.read_csv(fpath)
            valid, errs, warns = validate_dataframe(df, fname)
            all_errors.extend(errs)
            all_warnings.extend(warns)

            if valid:
                dfs.append(df)
                file_summaries.append({
                    "file": fname,
                    "rows": len(df),
                    "cities": int(df["city"].nunique()),
                    "states": int(df["state"].nunique()),
                    "synthetic": bool(df["synthetic"].any()) if "synthetic" in df.columns else False,
                    "status": "VALID"
                })
                print(f"  [OK] {fname}: {len(df)} rows, {df['city'].nunique()} cities (Synthetic={file_summaries[-1]['synthetic']})")
            else:
                file_summaries.append({
                    "file": fname,
                    "rows": len(df),
                    "status": "INVALID",
                    "errors": errs
                })
                print(f"  [FAIL] {fname}: {len(errs)} error(s)")
                for e in errs:
                    print(f"    - {e}")
        except Exception as ex:
            all_errors.append(f"[{fname}] Read error: {str(ex)}")
            print(f"  [ERROR] {fname}: {str(ex)}")

    if not dfs:
        raise ValueError(f"No valid CSV datasets could be loaded from {data_dir}. Errors: {all_errors}")

    combined = pd.concat(dfs, ignore_index=True)

    # Standardize string fields
    combined["state"] = combined["state"].astype(str).str.strip()
    combined["city"] = combined["city"].astype(str).str.strip()
    combined["platform_type"] = combined["platform_type"].astype(str).str.strip().str.lower()
    combined["city_tier"] = combined["city_tier"].astype(str).str.strip()

    report = {
        "total_files": len(csv_files),
        "valid_files": len(dfs),
        "total_rows": len(combined),
        "unique_cities": int(combined["city"].nunique()),
        "unique_states": int(combined["state"].nunique()),
        "is_all_synthetic": bool(combined["synthetic"].all()),
        "has_any_synthetic": bool(combined["synthetic"].any()),
        "files": file_summaries,
        "warnings": all_warnings,
        "errors": all_errors
    }

    print("-" * 70)
    print(f"Summary: {len(combined)} rows loaded across {combined['city'].nunique()} cities and {combined['state'].nunique()} states.")
    if report["has_any_synthetic"]:
        print("  NOTE: Dataset contains synthetic / illustrative sample rows. UI will display 'Illustrative data'.")
    if all_warnings:
        print(f"  Warnings ({len(all_warnings)}):")
        for w in all_warnings[:5]:
            print(f"    * {w}")
    print("=" * 70)

    return combined, report


def compute_dataset_city_baselines(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes plain dataset averages (city-level, state-level, and national baseline).
    This serves as:
    1. The plain average baseline requested by the user.
    2. Instant fallback if ML microservice is unreachable or city is unknown.
    """
    # 1. National baseline averages
    national = {
        "avg_gig_weekly_income": round(float(df["avg_gig_weekly_income"].mean()), 2),
        "income_std": round(float(df["income_std"].mean()), 2),
        "avg_monthly_rent": round(float(df["avg_monthly_rent"].mean()), 2),
        "avg_monthly_food_utilities": round(float(df["avg_monthly_food_utilities"].mean()), 2),
        "avg_transport_fuel": round(float(df["avg_transport_fuel"].mean()), 2),
        "avg_emi_burden": round(float(df["avg_emi_burden"].mean()), 2),
        "cost_of_living_index": round(float(df["cost_of_living_index"].mean()), 2),
        "safe_savings_capacity": round(float(df["safe_savings_capacity"].mean()), 2),
        "sample_count": int(len(df)),
    }

    # 2. State-level averages
    state_baselines: Dict[str, Dict[str, Any]] = {}
    for state_name, group in df.groupby("state"):
        state_baselines[str(state_name)] = {
            "avg_gig_weekly_income": round(float(group["avg_gig_weekly_income"].mean()), 2),
            "income_std": round(float(group["income_std"].mean()), 2),
            "avg_monthly_rent": round(float(group["avg_monthly_rent"].mean()), 2),
            "avg_monthly_food_utilities": round(float(group["avg_monthly_food_utilities"].mean()), 2),
            "avg_transport_fuel": round(float(group["avg_transport_fuel"].mean()), 2),
            "avg_emi_burden": round(float(group["avg_emi_burden"].mean()), 2),
            "cost_of_living_index": round(float(group["cost_of_living_index"].mean()), 2),
            "safe_savings_capacity": round(float(group["safe_savings_capacity"].mean()), 2),
            "sample_count": int(len(group)),
        }

    # 3. City-level averages
    city_baselines: Dict[str, Dict[str, Any]] = {}
    for city_name, group in df.groupby("city"):
        state_val = str(group["state"].iloc[0])
        tier_val = str(group["city_tier"].iloc[0])
        is_synth = bool(group["synthetic"].any())

        # Platform-specific weekly averages
        platform_weekly: Dict[str, float] = {}
        for p_type, p_group in group.groupby("platform_type"):
            platform_weekly[str(p_type)] = round(float(p_group["avg_gig_weekly_income"].mean()), 2)

        city_baselines[str(city_name)] = {
            "city": str(city_name),
            "state": state_val,
            "city_tier": tier_val,
            "avg_gig_weekly_income": round(float(group["avg_gig_weekly_income"].mean()), 2),
            "income_std": round(float(group["income_std"].mean()), 2),
            "avg_monthly_rent": round(float(group["avg_monthly_rent"].mean()), 2),
            "avg_monthly_food_utilities": round(float(group["avg_monthly_food_utilities"].mean()), 2),
            "avg_transport_fuel": round(float(group["avg_transport_fuel"].mean()), 2),
            "avg_emi_burden": round(float(group["avg_emi_burden"].mean()), 2),
            "cost_of_living_index": round(float(group["cost_of_living_index"].mean()), 2),
            "safe_savings_capacity": round(float(group["safe_savings_capacity"].mean()), 2),
            "platform_weekly_averages": platform_weekly,
            "sample_count": int(len(group)),
            "synthetic": is_synth,
            "source": str(group["source"].iloc[0]),
            "year": int(group["year"].iloc[0]),
        }

    return {
        "national_baseline": national,
        "state_baselines": state_baselines,
        "city_baselines": city_baselines
    }
