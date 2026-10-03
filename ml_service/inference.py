"""Serve profile estimates from XGBoost with supplied city-average fallbacks."""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger("finna_inference")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "xgb_models.joblib")
BASELINES_PATH = os.path.join(ARTIFACTS_DIR, "city_baselines.json")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "metrics.json")
_model_package: Optional[Dict[str, Any]] = None
_city_baselines: Optional[Dict[str, Any]] = None
_metrics: Optional[Dict[str, Any]] = None


def _load_json(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as source:
        return json.load(source)


def get_baselines() -> Dict[str, Any]:
    global _city_baselines
    if _city_baselines is None:
        _city_baselines = _load_json(BASELINES_PATH)
    return _city_baselines


def get_model_package() -> Optional[Dict[str, Any]]:
    global _model_package
    if _model_package is None and os.path.exists(MODEL_PATH):
        try:
            _model_package = joblib.load(MODEL_PATH)
            if not str(_model_package.get("version", "")).startswith("v2."):
                logger.warning("Ignoring model artifact built for the retired dataset contract")
                _model_package = None
        except Exception as exc:
            logger.warning("Could not load XGBoost artifact; using city averages: %s", exc)
    return _model_package


def get_metrics() -> Dict[str, Any]:
    global _metrics
    if _metrics is None:
        _metrics = _load_json(METRICS_PATH)
    return _metrics


def _normalise_platform(platform: Optional[str]) -> str:
    value = (platform or "delivery").strip().lower()
    return value if value in {"delivery", "ride_hailing", "freelance"} else "delivery"


def _resolve_base(state: str, city: str, platform: str, baselines: Dict[str, Any]) -> Tuple[Dict[str, Any], bool, bool, str]:
    city_info = baselines.get("city_baselines", {}).get(city)
    if city_info:
        return city_info.get("platform_averages", {}).get(platform, city_info), True, False, "city"
    state_info = baselines.get("state_baselines", {}).get(state)
    if state_info:
        return state_info, False, True, "state"
    return baselines.get("national_baseline", {}), False, True, "national"


def predict_profile(state: str, city: str, platform: Optional[str] = "delivery", hours: Optional[float] = 45.0, month: Optional[int] = None) -> Dict[str, Any]:
    state, city, platform = (state or "Tamil Nadu").strip(), (city or "Chennai").strip(), _normalise_platform(platform)
    try:
        hours = max(10.0, min(80.0, float(hours or 45)))
    except (TypeError, ValueError):
        hours = 45.0
    try:
        month = int(month or datetime.now().month)
        month = month if 1 <= month <= 12 else datetime.now().month
    except (TypeError, ValueError):
        month = datetime.now().month

    baselines, metrics = get_baselines(), get_metrics()
    base, known_city, fallback_used, fallback_level = _resolve_base(state, city, platform, baselines)
    city_info = baselines.get("city_baselines", {}).get(city, {})
    state_info = baselines.get("state_baselines", {}).get(state, {})
    context = city_info or state_info or baselines.get("national_baseline", {})
    season_factor = float(baselines.get("season_factors", {}).get(f"{city}|{platform}|{month}", 1.0))
    baseline_weekly = float(base.get("avg_weekly_income", 0)) * season_factor * ((hours / 45.0) ** 0.82)
    baseline_rent = float(base.get("avg_monthly_rent", 0))
    baseline_food = float(base.get("avg_monthly_food_utilities", 0))
    baseline_fuel = float(base.get("avg_monthly_transport_fuel", 0)) * (hours / 45.0)
    baseline_emi = float(base.get("avg_monthly_emi", 0))
    baseline_total = float(base.get("avg_monthly_expenses_total", baseline_rent + baseline_food + baseline_fuel + baseline_emi))
    baseline_other = max(0.0, baseline_total - (baseline_rent + baseline_food + baseline_fuel + baseline_emi))
    baseline_savings = float(base.get("avg_safe_monthly_savings", 0))
    baseline_std = float(base.get("income_std", max(baseline_weekly * 0.2, 1)))
    city_tier = str(context.get("city_tier", "2"))
    col_index = float(context.get("cost_of_living_index", 100))
    synthetic = bool(context.get("synthetic", baselines.get("provenance", {}).get("synthetic", True)))

    xgb_values: Dict[str, float] = {}
    package = get_model_package()
    if package and known_city:
        try:
            sample = pd.DataFrame([{
                "state": state, "city": city, "city_tier": city_tier, "platform_type": platform,
                "vehicle_status": "owned_bike_paid", "month": month, "weekly_hours": hours,
                "experience_months": 12, "cost_of_living_index": col_index, "season_factor": season_factor,
            }])
            matrix = np.hstack([package["encoder"].transform(sample[package["feature_cols_cat"]]), sample[package["feature_cols_num"]].astype(float).values])
            xgb_values = {target: float(model.predict(matrix)[0]) for target, model in package["models"].items()}
        except Exception as exc:
            logger.warning("Profile inference failed; using city average fallback: %s", exc)

    defaults = {
        "weekly_income": baseline_weekly, "monthly_rent": baseline_rent,
        "monthly_food_utilities": baseline_food, "monthly_transport_fuel": baseline_fuel,
        "monthly_emi_or_vehicle_rental": baseline_emi, "monthly_other_expenses": baseline_other,
        "monthly_expenses_total": baseline_total, "safe_monthly_savings": baseline_savings,
    }
    weights: Dict[str, Tuple[float, float]] = {}
    final: Dict[str, float] = {}
    for target, baseline_value in defaults.items():
        details = metrics.get("targets", {}).get(target, {})
        xgb_weight = float(details.get("blend_weight", {}).get("xgboost", 0.65 if xgb_values else 0.0)) if xgb_values else 0.0
        base_weight = 1.0 - xgb_weight
        final[target] = xgb_values.get(target, baseline_value) * xgb_weight + baseline_value * base_weight
        weights[target] = (xgb_weight, base_weight)

    weekly_income = round(final["weekly_income"], 2)
    inc_std = float(package.get("intervals", {}).get("weekly_income", {}).get("res_std", baseline_std)) if package else baseline_std
    weekly_low, weekly_high = max(0.0, weekly_income - 1.4 * inc_std), weekly_income + 1.5 * inc_std
    monthly_income, monthly_low, monthly_high = weekly_income * 4.33, weekly_low * 4.33, weekly_high * 4.33
    rent = round(final["monthly_rent"], 2)
    food, fuel, emi = round(final["monthly_food_utilities"], 2), round(final["monthly_transport_fuel"], 2), round(final["monthly_emi_or_vehicle_rental"], 2)
    total = round(rent + food + fuel + emi + max(0.0, final["monthly_other_expenses"]), 2)
    safe_to_spend = max(0.0, round((weekly_income / 6 * 0.72) - (((rent + emi) / 30) * 0.6), 2))
    method = "XGBoost + supplied city average" if xgb_values else "Supplied city average fallback"
    source = str(context.get("source", "finna_city_averages.csv"))
    year = int(context.get("year", 2026))

    return {
        "status": "success",
        "inputs": {"state": state, "city": city, "platform": platform, "hours": hours, "month": month, "city_tier": city_tier, "cost_of_living_index": col_index, "season_factor": season_factor},
        "weekly_income": {"expected": weekly_income, "low": round(weekly_low, 2), "high": round(weekly_high, 2), "std": round(inc_std, 2)},
        "monthly_income": {"expected": round(monthly_income, 2), "low": round(monthly_low, 2), "high": round(monthly_high, 2)},
        "typical_rent": {"expected": rent, "low": round(max(0, rent * 0.85), 2), "high": round(rent * 1.15, 2)},
        "monthly_expenses": {"rent": rent, "food_utilities": food, "transport_fuel": fuel, "emi_burden": emi, "other": round(max(0.0, final["monthly_other_expenses"]), 2), "total": total},
        "safe_savings_capacity": round(max(0.0, final["safe_monthly_savings"]), 2), "safe_to_spend_today": safe_to_spend,
        "baseline_city_average": {"weekly_income": round(baseline_weekly, 2), "monthly_rent": round(baseline_rent, 2), "food_utilities": round(baseline_food, 2), "transport_fuel": round(baseline_fuel, 2), "emi_burden": round(baseline_emi, 2), "safe_savings_capacity": round(baseline_savings, 2)},
        "blend_weights": {"xgboost": weights["weekly_income"][0], "city_baseline": weights["weekly_income"][1]},
        "suggested_action": "These are illustrative estimates. Replace them with your actual income and expenses when available.",
        "model_version": package.get("version", "v2.0.0-baseline") if package else "v2.0.0-baseline",
        "data_source_badge": "synthetic" if synthetic else "city_average",
        "confidence_level": "medium" if known_city and package else "fallback",
        "fallback_applied": fallback_used or not bool(xgb_values),
        "data_source": source, "data_year": year,
        "metadata": {"model_version": package.get("version", "v2.0.0-baseline") if package else "v2.0.0-baseline", "estimation_method": method, "data_year": year, "data_source": source, "synthetic": synthetic, "confidence": "medium" if known_city else "low", "is_known_city": known_city, "fallback_used": fallback_used or not bool(xgb_values), "fallback_level": fallback_level, "evaluation_scope": "on synthetic data" if synthetic else "on supplied dataset", "disclaimer": "Illustrative data only. These synthetic estimates are not real worker statistics or financial advice."},
    }
