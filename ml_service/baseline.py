"""
FINNA Plain City-Average Baseline Estimator
Computes and predicts city-level dataset averages (the plain average baseline).
"""

from typing import Dict, Tuple
import pandas as pd
import numpy as np

TARGETS = [
    "avg_gig_weekly_income",
    "avg_monthly_rent",
    "avg_monthly_food_utilities",
    "avg_transport_fuel",
    "avg_emi_burden",
    "safe_savings_capacity"
]

class CityAverageBaseline:
    """
    Plain city-average baseline estimator.
    Predicts the mean of the training data for (city, target),
    falling back to (state, target) and then national mean.
    """
    def __init__(self):
        self.city_means: Dict[str, Dict[str, float]] = {}
        self.city_platform_income: Dict[Tuple[str, str], float] = {}
        self.state_means: Dict[str, Dict[str, float]] = {}
        self.national_means: Dict[str, float] = {}

    def fit(self, df: pd.DataFrame):
        for t in TARGETS:
            self.national_means[t] = float(df[t].mean())
            self.state_means[t] = df.groupby("state")[t].mean().to_dict()
            self.city_means[t] = df.groupby("city")[t].mean().to_dict()

        p_grp = df.groupby(["city", "platform_type"])["avg_gig_weekly_income"].mean().to_dict()
        self.city_platform_income = { (str(k[0]), str(k[1])): float(v) for k, v in p_grp.items() }

    def predict_one(self, state: str, city: str, platform: str, target: str) -> float:
        if target == "avg_gig_weekly_income" and (city, platform) in self.city_platform_income:
            return self.city_platform_income[(city, platform)]
        if city in self.city_means.get(target, {}):
            return self.city_means[target][city]
        if state in self.state_means.get(target, {}):
            return self.state_means[target][state]
        return self.national_means.get(target, 5000.0)

    def predict_df(self, df: pd.DataFrame, target: str) -> np.ndarray:
        preds = [
            self.predict_one(row["state"], row["city"], row["platform_type"], target)
            for _, row in df.iterrows()
        ]
        return np.array(preds)
