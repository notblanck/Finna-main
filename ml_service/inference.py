"""
FINNA Real-Time Financial Profile Predictor
Loads trained XGBoost artifacts + city baselines, performs average-informed
blending, quantile/residual intervals, and provides instant fallback.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger("finna_inference")

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgb_models.joblib")
BASELINES_PATH = os.path.join(ARTIFACTS_DIR, "city_baselines.json")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "metrics.json")

# In-memory caches
_model_package: Optional[Dict[str, Any]] = None
_city_baselines: Optional[Dict[str, Any]] = None
_metrics: Optional[Dict[str, Any]] = None

def get_baselines() -> Dict[str, Any]:
    global _city_baselines
    if _city_baselines is None:
        if os.path.exists(BASELINES_PATH):
            with open(BASELINES_PATH, "r", encoding="utf-8") as f:
                _city_baselines = json.load(f)
        else:
            _city_baselines = {}
    return _city_baselines

def get_model_package() -> Optional[Dict[str, Any]]:
    global _model_package
    if _model_package is None:
        if os.path.exists(MODEL_PATH):
            try:
                _model_package = joblib.load(MODEL_PATH)
                logger.info(f"Loaded FINNA XGBoost models (version: {_model_package.get('version')})")
            except Exception as e:
                logger.error(f"Failed to load XGBoost model package: {e}")
                _model_package = None
    return _model_package

def get_metrics() -> Dict[str, Any]:
    global _metrics
    if _metrics is None:
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, "r", encoding="utf-8") as f:
                    _metrics = json.load(f)
            except Exception:
                _metrics = {}
        else:
            _metrics = {}
    return _metrics


def predict_profile(
    state: str,
    city: str,
    platform: Optional[str] = "delivery",
    hours: Optional[float] = 45.0
) -> Dict[str, Any]:
    """
    Predicts financial profile for a given city and worker profile.
    Blends XGBoost regression prediction with the city-average baseline.
    Returns estimates, ranges, baseline comparison, and confidence.
    """
    state = (state or "Tamil Nadu").strip()
    city = (city or "Chennai").strip()
    platform = (platform or "delivery").strip().lower()
    if platform not in ["delivery", "ride_hailing", "freelance_other", "mixed"]:
        platform = "delivery"
    try:
        hours = float(hours) if hours is not None else 45.0
        hours = max(10.0, min(80.0, hours))
    except (ValueError, TypeError):
        hours = 45.0

    baselines_data = get_baselines()
    city_base_map = baselines_data.get("city_baselines", {})
    state_base_map = baselines_data.get("state_baselines", {})
    national_base = baselines_data.get("national_baseline", {
        "avg_gig_weekly_income": 5800.0,
        "income_std": 750.0,
        "avg_monthly_rent": 6200.0,
        "avg_monthly_food_utilities": 4800.0,
        "avg_transport_fuel": 4200.0,
        "avg_emi_burden": 2700.0,
        "cost_of_living_index": 100.0,
        "safe_savings_capacity": 3200.0,
    })

    # Lookup city or fallback
    is_known_city = city in city_base_map
    is_known_state = state in state_base_map

    if is_known_city:
        city_info = city_base_map[city]
        city_tier = city_info.get("city_tier", "Tier 2")
        col_index = float(city_info.get("cost_of_living_index", 100.0))
        data_source = city_info.get("source", "FINNA Regional Gig Economy Dataset")
        data_year = int(city_info.get("year", 2026))
        is_synthetic = bool(city_info.get("synthetic", True))
        baseline_weekly = float(city_info.get("platform_weekly_averages", {}).get(platform, city_info["avg_gig_weekly_income"]))
        baseline_rent = float(city_info["avg_monthly_rent"])
        baseline_food = float(city_info["avg_monthly_food_utilities"])
        baseline_fuel = float(city_info["avg_transport_fuel"])
        baseline_emi = float(city_info["avg_emi_burden"])
        baseline_savings = float(city_info["safe_savings_capacity"])
        baseline_std = float(city_info["income_std"])
    elif is_known_state:
        state_info = state_base_map[state]
        city_tier = "Tier 2"
        col_index = float(state_info.get("cost_of_living_index", 100.0))
        data_source = "FINNA State-level Average Benchmark"
        data_year = 2026
        is_synthetic = True
        baseline_weekly = float(state_info["avg_gig_weekly_income"])
        baseline_rent = float(state_info["avg_monthly_rent"])
        baseline_food = float(state_info["avg_monthly_food_utilities"])
        baseline_fuel = float(state_info["avg_transport_fuel"])
        baseline_emi = float(state_info["avg_emi_burden"])
        baseline_savings = float(state_info["safe_savings_capacity"])
        baseline_std = float(state_info["income_std"])
    else:
        city_tier = "Tier 2"
        col_index = float(national_base.get("cost_of_living_index", 100.0))
        data_source = "FINNA National Average Benchmark"
        data_year = 2026
        is_synthetic = True
        baseline_weekly = float(national_base["avg_gig_weekly_income"])
        baseline_rent = float(national_base["avg_monthly_rent"])
        baseline_food = float(national_base["avg_monthly_food_utilities"])
        baseline_fuel = float(national_base["avg_transport_fuel"])
        baseline_emi = float(national_base["avg_emi_burden"])
        baseline_savings = float(national_base["safe_savings_capacity"])
        baseline_std = float(national_base["income_std"])

    pkg = get_model_package()
    metrics = get_metrics()

    # Model evaluation predictions
    xgb_estimates: Dict[str, float] = {}
    intervals: Dict[str, Dict[str, float]] = {}

    if pkg and is_known_city:
        try:
            encoder = pkg["encoder"]
            models = pkg["models"]
            intervals = pkg.get("intervals", {})

            # Prepare single-row DataFrame
            sample_df = pd.DataFrame([{
                "state": state,
                "city": city,
                "city_tier": city_tier,
                "platform_type": platform,
                "cost_of_living_index": col_index,
                "month_season_factor": 1.0,
                "typical_weekly_hours": hours
            }])

            cat_feat = encoder.transform(sample_df[pkg["feature_cols_cat"]])
            num_feat = sample_df[pkg["feature_cols_num"]].values
            X_sample = np.hstack([cat_feat, num_feat])

            for target, reg in models.items():
                pred_val = float(reg.predict(X_sample)[0])
                xgb_estimates[target] = max(500.0, round(pred_val, 2))

        except Exception as ex:
            logger.warning(f"Inference error with XGBoost: {ex}. Using baseline values.")
            xgb_estimates = {}

    # Target-specific blend weights from metrics (or 0.65/0.35 default if XGBoost won)
    def blend(target_name: str, xgb_val: Optional[float], base_val: float) -> Tuple[float, float, float]:
        if xgb_val is None:
            return round(base_val, 2), 0.0, 1.0
        
        target_metrics = metrics.get("targets", {}).get(target_name, {})
        w_xgb = target_metrics.get("blend_weight", {}).get("xgboost", 0.65)
        w_base = target_metrics.get("blend_weight", {}).get("city_baseline", 0.35)

        # If XGBoost didn't beat baseline on validation, prefer baseline
        if target_metrics.get("winner") == "Baseline":
            w_xgb = 0.20
            w_base = 0.80

        final_val = (xgb_val * w_xgb) + (base_val * w_base)
        return round(final_val, 2), w_xgb, w_base

    # Compute blended results
    weekly_income, w_xgb_inc, w_base_inc = blend(
        "avg_gig_weekly_income",
        xgb_estimates.get("avg_gig_weekly_income"),
        baseline_weekly * ((hours / 45.0) ** 0.82)
    )

    rent, _, _ = blend("avg_monthly_rent", xgb_estimates.get("avg_monthly_rent"), baseline_rent)
    food_util, _, _ = blend("avg_monthly_food_utilities", xgb_estimates.get("avg_monthly_food_utilities"), baseline_food)
    fuel, _, _ = blend("avg_transport_fuel", xgb_estimates.get("avg_transport_fuel"), baseline_fuel * (hours / 45.0))
    emi, _, _ = blend("avg_emi_burden", xgb_estimates.get("avg_emi_burden"), baseline_emi)
    savings_cap, _, _ = blend("safe_savings_capacity", xgb_estimates.get("safe_savings_capacity"), baseline_savings)

    # Uncertainty Intervals (low / high)
    # Using residual standard deviations or +/- 18% standard interval
    inc_std = intervals.get("avg_gig_weekly_income", {}).get("res_std", baseline_std)
    weekly_low = max(1500.0, round(weekly_income - 1.4 * inc_std, 2))
    weekly_high = round(weekly_income + 1.5 * inc_std, 2)

    monthly_income = round(weekly_income * 4.33, 2)
    monthly_low = round(weekly_low * 4.33, 2)
    monthly_high = round(weekly_high * 4.33, 2)

    rent_std = intervals.get("avg_monthly_rent", {}).get("res_std", rent * 0.12)
    rent_low = max(2000.0, round(rent - 1.3 * rent_std, 2))
    rent_high = round(rent + 1.3 * rent_std, 2)

    # Total expenses
    total_monthly_expenses = round(rent + food_util + fuel + emi, 2)

    # Conservative Safe-to-Spend Today calculation (TRD aligned)
    # Daily income minus daily fixed obligations and emergency set-aside
    daily_income = weekly_income / 6.0  # 6-day work week
    daily_fixed = (rent + emi) / 30.0
    safe_to_spend_today = max(0.0, round((daily_income * 0.72) - (daily_fixed * 0.6), 2))

    # Suggested Next Action
    if monthly_income > total_monthly_expenses + 2000:
        suggested_action = f"Set aside ₹{round(savings_cap):,} monthly to build a 3-month safety cushion (₹{round(rent * 3):,} typical rent cover)."
    else:
        suggested_action = f"Prioritize rent (₹{round(rent):,}) and fuel (₹{round(fuel):,}) before discretionary spends in {city}."

    confidence = "high" if is_known_city and pkg else ("medium" if is_known_city else "low")
    method = "XGBoost + City Average Blend" if (pkg and is_known_city) else ("City Average Baseline" if is_known_city else "State/National Baseline Average")

    return {
        "status": "success",
        "inputs": {
            "state": state,
            "city": city,
            "platform": platform,
            "hours": hours,
            "city_tier": city_tier,
            "cost_of_living_index": col_index
        },
        "weekly_income": {
            "expected": weekly_income,
            "low": weekly_low,
            "high": weekly_high,
            "std": round(inc_std, 2)
        },
        "monthly_income": {
            "expected": monthly_income,
            "low": monthly_low,
            "high": monthly_high
        },
        "typical_rent": {
            "expected": rent,
            "low": rent_low,
            "high": rent_high
        },
        "monthly_expenses": {
            "rent": rent,
            "food_utilities": food_util,
            "transport_fuel": fuel,
            "emi_burden": emi,
            "total": total_monthly_expenses
        },
        "safe_savings_capacity": savings_cap,
        "safe_to_spend_today": safe_to_spend_today,
        "baseline_city_average": {
            "weekly_income": round(baseline_weekly, 2),
            "monthly_rent": round(baseline_rent, 2),
            "food_utilities": round(baseline_food, 2),
            "transport_fuel": round(baseline_fuel, 2),
            "emi_burden": round(baseline_emi, 2),
            "safe_savings_capacity": round(baseline_savings, 2)
        },
        "blend_weights": {
            "xgboost": w_xgb_inc,
            "city_baseline": w_base_inc
        },
        "suggested_action": suggested_action,
        "metadata": {
            "model_version": pkg.get("version", "v1.2.0") if pkg else "v1.2.0-baseline",
            "estimation_method": method,
            "data_year": data_year,
            "data_source": data_source,
            "synthetic": is_synthetic,
            "confidence": confidence,
            "is_known_city": is_known_city,
            "fallback_used": not is_known_city or not pkg,
            "disclaimer": "FINNA provides financial intelligence and education, not regulated financial advice. All figures for non-consented accounts are estimates based on regional statistics."
        }
    }
