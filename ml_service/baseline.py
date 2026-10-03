"""City-average baseline sourced from finna_city_averages.csv."""

from typing import Dict, Tuple
import numpy as np
import pandas as pd

TARGETS = [
    "weekly_income", "monthly_rent", "monthly_food_utilities", "monthly_transport_fuel",
    "monthly_emi_or_vehicle_rental", "monthly_other_expenses", "monthly_expenses_total",
    "safe_monthly_savings",
]
TARGET_TO_AVERAGE = {
    "weekly_income": "avg_weekly_income", "monthly_rent": "avg_monthly_rent",
    "monthly_food_utilities": "avg_monthly_food_utilities",
    "monthly_transport_fuel": "avg_monthly_transport_fuel",
    "monthly_emi_or_vehicle_rental": "avg_monthly_emi",
    "monthly_expenses_total": "avg_monthly_expenses_total",
    "safe_monthly_savings": "avg_safe_monthly_savings",
}


class CityAverageBaseline:
    """Use supplied city/platform averages, then city, state and national fallback."""
    def __init__(self) -> None:
        self.by_city_platform: Dict[Tuple[str, str], Dict[str, float]] = {}
        self.by_city: Dict[str, Dict[str, float]] = {}
        self.by_state: Dict[str, Dict[str, float]] = {}
        self.national: Dict[str, float] = {}

    def fit(self, city_averages: pd.DataFrame) -> None:
        self.by_city_platform = {
            (str(row.city), str(row.platform_type)): {
                key: float(getattr(row, column)) for key, column in TARGET_TO_AVERAGE.items()
            } for row in city_averages.itertuples(index=False)
        }
        self.by_city = {str(city): {key: float(group[column].mean()) for key, column in TARGET_TO_AVERAGE.items()} for city, group in city_averages.groupby("city")}
        self.by_state = {str(state): {key: float(group[column].mean()) for key, column in TARGET_TO_AVERAGE.items()} for state, group in city_averages.groupby("state")}
        self.national = {key: float(city_averages[column].mean()) for key, column in TARGET_TO_AVERAGE.items()}

    def predict_one(self, state: str, city: str, platform: str, target: str) -> float:
        if target == "monthly_other_expenses":
            subtotal = sum(self.predict_one(state, city, platform, key) for key in (
                "monthly_rent", "monthly_food_utilities", "monthly_transport_fuel", "monthly_emi_or_vehicle_rental"
            ))
            return max(0.0, self.predict_one(state, city, platform, "monthly_expenses_total") - subtotal)
        for source in (self.by_city_platform.get((city, platform)), self.by_city.get(city), self.by_state.get(state), self.national):
            if source and target in source:
                return source[target]
        return 0.0

    def predict_df(self, df: pd.DataFrame, target: str) -> np.ndarray:
        return np.array([self.predict_one(str(row.state), str(row.city), str(row.platform_type), target) for row in df.itertuples(index=False)])
