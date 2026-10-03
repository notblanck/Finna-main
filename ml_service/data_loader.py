"""Load FINNA's replaceable worker, city-average, and seasonality datasets.

The files deliberately have distinct schemas: worker observations train the
model, city averages are the prediction baseline/fallback, and seasonality is a
month-level input. Compatible real datasets can replace them unchanged.
"""

import os
from typing import Any, Dict, Tuple

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
WORKER_FILE = "finna_worker_samples.csv"
CITY_AVERAGES_FILE = "finna_city_averages.csv"
SEASONALITY_FILE = "finna_seasonality.csv"

WORKER_REQUIRED = {
    "state", "city", "city_tier", "platform_type", "month", "weekly_hours",
    "experience_months", "vehicle_status", "cost_of_living_index", "weekly_income",
    "income_volatility_pct", "monthly_rent", "monthly_food_utilities",
    "monthly_transport_fuel", "monthly_emi_or_vehicle_rental",
    "monthly_other_expenses", "monthly_expenses_total", "safe_monthly_savings",
    "synthetic", "source", "year",
}
CITY_REQUIRED = {
    "state", "city", "city_tier", "platform_type", "cost_of_living_index",
    "avg_weekly_income", "income_std", "avg_monthly_rent",
    "avg_monthly_food_utilities", "avg_monthly_transport_fuel", "avg_monthly_emi",
    "avg_monthly_expenses_total", "avg_safe_monthly_savings", "n_samples",
    "synthetic", "source", "year",
}
SEASONALITY_REQUIRED = {"city", "platform_type", "month", "avg_weekly_income", "season_factor", "synthetic"}


def _path(filename: str, data_dir: str | None = None) -> str:
    return os.path.join(data_dir or DATA_DIR, filename)


def _read_required(filename: str, required: set[str], data_dir: str | None = None) -> pd.DataFrame:
    path = _path(filename, data_dir)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Required FINNA dataset is missing: {path}")
    frame = pd.read_csv(path)
    missing = sorted(required - set(frame.columns))
    if missing:
        raise ValueError(f"{filename} is missing required columns: {missing}")
    if frame.empty:
        raise ValueError(f"{filename} has no rows")
    frame["synthetic"] = frame["synthetic"].astype(str).str.strip().str.lower().isin(["true", "1", "yes"])
    return frame


def load_finna_datasets(data_dir: str | None = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """Return training rows, supplied city averages, seasons, and provenance."""
    workers = _read_required(WORKER_FILE, WORKER_REQUIRED, data_dir)
    city_averages = _read_required(CITY_AVERAGES_FILE, CITY_REQUIRED, data_dir)
    seasonality = _read_required(SEASONALITY_FILE, SEASONALITY_REQUIRED, data_dir)

    for frame in (workers, city_averages, seasonality):
        frame["city"] = frame["city"].astype(str).str.strip()
        frame["platform_type"] = frame["platform_type"].astype(str).str.strip().str.lower()
    for frame in (workers, city_averages):
        frame["state"] = frame["state"].astype(str).str.strip()
    workers["month"] = pd.to_numeric(workers["month"], errors="raise").astype(int)
    seasonality["month"] = pd.to_numeric(seasonality["month"], errors="raise").astype(int)
    if not workers["month"].between(1, 12).all() or not seasonality["month"].between(1, 12).all():
        raise ValueError("month must be between 1 and 12 in worker and seasonality datasets")

    training = workers.merge(
        seasonality[["city", "platform_type", "month", "season_factor"]],
        on=["city", "platform_type", "month"], how="left", validate="many_to_one",
    )
    if training["season_factor"].isna().any():
        raise ValueError(f"{int(training['season_factor'].isna().sum())} worker rows have no matching seasonality entry")

    report = {
        "dataset_files": [WORKER_FILE, CITY_AVERAGES_FILE, SEASONALITY_FILE],
        "training_rows": len(training), "city_average_rows": len(city_averages),
        "seasonality_rows": len(seasonality), "cities": sorted(training["city"].unique().tolist()),
        "is_all_synthetic": bool(training["synthetic"].all() and city_averages["synthetic"].all() and seasonality["synthetic"].all()),
        "has_any_synthetic": bool(training["synthetic"].any() or city_averages["synthetic"].any() or seasonality["synthetic"].any()),
    }
    return training, city_averages, seasonality, report


def _aggregate(frame: pd.DataFrame) -> Dict[str, Any]:
    return {
        "avg_weekly_income": round(float(frame["avg_weekly_income"].mean()), 2),
        "income_std": round(float(frame["income_std"].mean()), 2),
        "avg_monthly_rent": round(float(frame["avg_monthly_rent"].mean()), 2),
        "avg_monthly_food_utilities": round(float(frame["avg_monthly_food_utilities"].mean()), 2),
        "avg_monthly_transport_fuel": round(float(frame["avg_monthly_transport_fuel"].mean()), 2),
        "avg_monthly_emi": round(float(frame["avg_monthly_emi"].mean()), 2),
        "avg_monthly_expenses_total": round(float(frame["avg_monthly_expenses_total"].mean()), 2),
        "avg_safe_monthly_savings": round(float(frame["avg_safe_monthly_savings"].mean()), 2),
        "cost_of_living_index": round(float(frame["cost_of_living_index"].mean()), 2),
        "sample_count": int(frame["n_samples"].sum()), "synthetic": bool(frame["synthetic"].any()),
    }


def build_city_baselines(city_averages: pd.DataFrame, seasonality: pd.DataFrame) -> Dict[str, Any]:
    """Serialize supplied city averages as the only profile baseline/fallback."""
    city_baselines: Dict[str, Dict[str, Any]] = {}
    for city, group in city_averages.groupby("city", sort=True):
        first = group.iloc[0]
        values = _aggregate(group)
        values.update({
            "city": city, "state": str(first["state"]), "city_tier": str(first["city_tier"]),
            "platform_averages": {
                str(row.platform_type): {
                    "avg_weekly_income": float(row.avg_weekly_income), "income_std": float(row.income_std),
                    "avg_monthly_rent": float(row.avg_monthly_rent), "avg_monthly_food_utilities": float(row.avg_monthly_food_utilities),
                    "avg_monthly_transport_fuel": float(row.avg_monthly_transport_fuel), "avg_monthly_emi": float(row.avg_monthly_emi),
                    "avg_monthly_expenses_total": float(row.avg_monthly_expenses_total),
                    "avg_safe_monthly_savings": float(row.avg_safe_monthly_savings), "n_samples": int(row.n_samples),
                } for row in group.itertuples(index=False)
            },
            "source": str(first["source"]), "year": int(first["year"]),
        })
        city_baselines[city] = values

    return {
        "provenance": {"label": "Illustrative data" if city_averages["synthetic"].any() else "Dataset data", "synthetic": bool(city_averages["synthetic"].any()), "baseline_file": CITY_AVERAGES_FILE, "seasonality_file": SEASONALITY_FILE},
        "national_baseline": _aggregate(city_averages),
        "state_baselines": {state: _aggregate(group) for state, group in city_averages.groupby("state", sort=True)},
        "city_baselines": city_baselines,
        "season_factors": {f"{row.city}|{row.platform_type}|{int(row.month)}": float(row.season_factor) for row in seasonality.itertuples(index=False)},
    }
