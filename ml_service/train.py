"""Train FINNA profile regressors using the supplied replaceable datasets."""

import json
import logging
import os
import subprocess
import sys
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

from baseline import CityAverageBaseline, TARGETS
from data_loader import build_city_baselines, load_finna_datasets

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("finna_trainer")

MODEL_VERSION = "v2.0.0-synthetic-illustrative"
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
FEATURE_COLS_CAT = ["state", "city", "city_tier", "platform_type", "vehicle_status"]
FEATURE_COLS_NUM = ["month", "weekly_hours", "experience_months", "cost_of_living_index", "season_factor"]


def train_and_evaluate() -> Dict[str, Any]:
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    workers, city_averages, seasonality, report = load_finna_datasets()
    baselines_data = build_city_baselines(city_averages, seasonality)
    with open(os.path.join(ARTIFACTS_DIR, "city_baselines.json"), "w", encoding="utf-8") as output:
        json.dump(baselines_data, output, indent=2)

    train_df, val_df = train_test_split(workers, test_size=0.20, random_state=42, shuffle=True)
    baseline_model = CityAverageBaseline()
    baseline_model.fit(city_averages)
    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    encoder.fit(train_df[FEATURE_COLS_CAT])

    def features(frame: pd.DataFrame) -> np.ndarray:
        return np.hstack([encoder.transform(frame[FEATURE_COLS_CAT]), frame[FEATURE_COLS_NUM].astype(float).values])

    x_train, x_val = features(train_df), features(val_df)
    models: Dict[str, Any] = {}
    intervals: Dict[str, Dict[str, float]] = {}
    metrics: Dict[str, Any] = {
        "model_version": MODEL_VERSION,
        "trained_at": pd.Timestamp.now().isoformat(),
        "dataset_rows": len(workers),
        "dataset_files": report["dataset_files"],
        "synthetic": report["has_any_synthetic"],
        "evaluation_scope": "on synthetic data" if report["has_any_synthetic"] else "on supplied dataset",
        "targets": {},
    }

    print("\nFINNA XGBOOST vs CITY-AVERAGE BASELINE (ON SYNTHETIC DATA)" if report["has_any_synthetic"] else "\nFINNA XGBOOST vs CITY-AVERAGE BASELINE")
    print(f"Training rows: {len(train_df)} | Validation rows: {len(val_df)} | Baseline: finna_city_averages.csv")
    print(f"{'Target':<35} | {'XGB MAE':<10} | {'Base MAE':<10} | Winner")
    print("-" * 82)

    for target in TARGETS:
        y_train, y_val = train_df[target].values, val_df[target].values
        base_predictions = baseline_model.predict_df(val_df, target)
        base_mae = float(mean_absolute_error(y_val, base_predictions))
        base_rmse = float(root_mean_squared_error(y_val, base_predictions))
        model = xgb.XGBRegressor(
            n_estimators=160, max_depth=4, learning_rate=0.06, subsample=0.85,
            colsample_bytree=0.9, random_state=42, n_jobs=-1,
        )
        model.fit(x_train, y_train)
        predictions = model.predict(x_val)
        mae = float(mean_absolute_error(y_val, predictions))
        rmse = float(root_mean_squared_error(y_val, predictions))
        winner = "XGBoost" if mae < base_mae and rmse < base_rmse else "City average"
        inverse_xgb, inverse_baseline = 1 / max(rmse, 1e-4), 1 / max(base_rmse, 1e-4)
        weight_xgb = round(inverse_xgb / (inverse_xgb + inverse_baseline), 3)
        if winner == "City average":
            weight_xgb = min(weight_xgb, 0.20)
        models[target] = model
        intervals[target] = {"res_std": round(float(np.std(y_val - predictions)), 2)}
        metrics["targets"][target] = {
            "xgboost": {"mae": round(mae, 2), "rmse": round(rmse, 2)},
            "city_baseline": {"mae": round(base_mae, 2), "rmse": round(base_rmse, 2)},
            "winner": winner,
            "blend_weight": {"xgboost": weight_xgb, "city_baseline": round(1 - weight_xgb, 3)},
        }
        print(f"{target:<35} | {mae:<10.2f} | {base_mae:<10.2f} | {winner}")

    package = {
        "version": MODEL_VERSION, "models": models, "encoder": encoder, "intervals": intervals,
        "feature_cols_cat": FEATURE_COLS_CAT, "feature_cols_num": FEATURE_COLS_NUM,
        "targets": TARGETS, "synthetic": report["has_any_synthetic"],
        "dataset_label": "Illustrative data" if report["has_any_synthetic"] else "Dataset data",
    }
    joblib.dump(package, os.path.join(ARTIFACTS_DIR, "xgb_models.joblib"))
    with open(os.path.join(ARTIFACTS_DIR, "metrics.json"), "w", encoding="utf-8") as output:
        json.dump(metrics, output, indent=2)
    # Keep the Next.js service-down fallback on exactly the same city averages
    # and seasonal factors as the newly trained Python service.
    subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "export_to_ts.py")], check=True)
    logger.info("Trained %s profile targets %s", len(TARGETS), metrics["evaluation_scope"])
    return metrics


if __name__ == "__main__":
    train_and_evaluate()
