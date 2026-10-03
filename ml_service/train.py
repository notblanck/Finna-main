"""
FINNA XGBoost Training & Evaluation Pipeline
Trains multi-target regressors on city-level gig economy datasets,
evaluates against the city-average baseline, and saves model artifacts + metrics.
"""

import os
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import joblib

import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from data_loader import load_all_city_data, compute_dataset_city_baselines
from baseline import CityAverageBaseline, TARGETS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("finna_trainer")

MODEL_VERSION = "v1.2.0"
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

FEATURE_COLS_CAT = ["state", "city", "city_tier", "platform_type"]
FEATURE_COLS_NUM = ["cost_of_living_index", "month_season_factor", "typical_weekly_hours"]

def train_and_evaluate():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # 1. Load & validate data
    df, report = load_all_city_data()

    # 2. Compute city baselines JSON
    baselines_data = compute_dataset_city_baselines(df)
    baselines_path = os.path.join(ARTIFACTS_DIR, "city_baselines.json")
    with open(baselines_path, "w", encoding="utf-8") as f:
        json.dump(baselines_data, f, indent=2)
    logger.info(f"Saved city baselines to {baselines_path}")

    # 3. Train/Validation Split (80/20)
    train_df, val_df = train_test_split(df, test_size=0.20, random_state=42, shuffle=True)
    logger.info(f"Train set: {len(train_df)} rows | Validation set: {len(val_df)} rows")

    # 4. Fit Baseline Model
    baseline_model = CityAverageBaseline()
    baseline_model.fit(train_df)

    # 5. Fit Feature Preprocessor
    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    encoder.fit(train_df[FEATURE_COLS_CAT])

    def transform_features(data_df: pd.DataFrame) -> np.ndarray:
        cat_features = encoder.transform(data_df[FEATURE_COLS_CAT])
        num_features = data_df[FEATURE_COLS_NUM].values
        return np.hstack([cat_features, num_features])

    X_train = transform_features(train_df)
    X_val = transform_features(val_df)

    models: Dict[str, Any] = {}
    intervals: Dict[str, Dict[str, float]] = {}
    metrics_report: Dict[str, Any] = {
        "model_version": MODEL_VERSION,
        "trained_at": pd.Timestamp.now().isoformat(),
        "dataset_rows": len(df),
        "synthetic": report["has_any_synthetic"],
        "targets": {},
        "comparison_summary": []
    }

    print("\n" + "=" * 90)
    print(f"FINNA XGBOOST vs CITY-AVERAGE BASELINE EVALUATION ({MODEL_VERSION})")
    print("=" * 90)
    print(f"{'Target':<28} | {'XGB MAE':<10} | {'Base MAE':<10} | {'XGB RMSE':<10} | {'Base RMSE':<10} | {'Winner':<10}")
    print("-" * 90)

    for target in TARGETS:
        y_train = train_df[target].values
        y_val = val_df[target].values

        # Baseline evaluation
        base_preds = baseline_model.predict_df(val_df, target)
        base_mae = float(mean_absolute_error(y_val, base_preds))
        base_rmse = float(root_mean_squared_error(y_val, base_preds))

        # XGBoost training
        xgb_reg = xgb.XGBRegressor(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            n_jobs=-1
        )
        xgb_reg.fit(X_train, y_train)
        xgb_preds = xgb_reg.predict(X_val)

        xgb_mae = float(mean_absolute_error(y_val, xgb_preds))
        xgb_rmse = float(root_mean_squared_error(y_val, xgb_preds))

        # Residual distribution for intervals (low / high)
        residuals = y_val - xgb_preds
        res_p10 = float(np.percentile(residuals, 10))
        res_p90 = float(np.percentile(residuals, 90))
        res_std = float(np.std(residuals))

        intervals[target] = {
            "res_std": round(res_std, 2),
            "p10_delta": round(res_p10, 2),
            "p90_delta": round(res_p90, 2),
        }

        # Compare
        beats_baseline = xgb_mae < base_mae and xgb_rmse < base_rmse
        winner = "XGBoost" if beats_baseline else "Baseline"

        # Blend weights: inverse RMSE
        inv_xgb = 1.0 / max(xgb_rmse, 1e-4)
        inv_base = 1.0 / max(base_rmse, 1e-4)
        w_xgb = round(inv_xgb / (inv_xgb + inv_base), 3)
        w_base = round(1.0 - w_xgb, 3)

        models[target] = xgb_reg

        metrics_report["targets"][target] = {
            "xgboost": {
                "mae": round(xgb_mae, 2),
                "rmse": round(xgb_rmse, 2),
            },
            "city_baseline": {
                "mae": round(base_mae, 2),
                "rmse": round(base_rmse, 2),
            },
            "beats_baseline": beats_baseline,
            "winner": winner,
            "blend_weight": {
                "xgboost": w_xgb,
                "city_baseline": w_base
            },
            "intervals": intervals[target]
        }

        row_str = f"{target:<28} | {xgb_mae:<10.2f} | {base_mae:<10.2f} | {xgb_rmse:<10.2f} | {base_rmse:<10.2f} | {winner:<10}"
        print(row_str)
        metrics_report["comparison_summary"].append({
            "target": target,
            "xgb_mae": round(xgb_mae, 2),
            "base_mae": round(base_mae, 2),
            "xgb_rmse": round(xgb_rmse, 2),
            "base_rmse": round(base_rmse, 2),
            "winner": winner
        })

    print("=" * 90)

    # 6. Save Model Artifacts
    package = {
        "version": MODEL_VERSION,
        "models": models,
        "encoder": encoder,
        "intervals": intervals,
        "feature_cols_cat": FEATURE_COLS_CAT,
        "feature_cols_num": FEATURE_COLS_NUM,
        "targets": TARGETS,
        "baseline_model": baseline_model,
        "synthetic": report["has_any_synthetic"]
    }

    model_path = os.path.join(ARTIFACTS_DIR, "xgb_models.joblib")
    joblib.dump(package, model_path)
    logger.info(f"Saved trained XGBoost model package to {model_path}")

    metrics_path = os.path.join(ARTIFACTS_DIR, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    logger.info(f"Saved metrics report to {metrics_path}")

    return metrics_report

if __name__ == "__main__":
    train_and_evaluate()
