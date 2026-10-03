# FINNA City-Level Gig Dataset Schema & Training Guide

> **IMPORTANT NOTICE:**
> The default sample dataset in this directory (`sample_city_gig_data_synthetic.csv`) is **SYNTHETIC & ILLUSTRATIVE DATA**.
> Every row has `synthetic=true`.
> The FINNA frontend UI explicitly marks all estimates derived from this file as **"Illustrative data"** with an ML Estimate / City Average breakdown.
> **NEVER present synthetic data as real statistics.**

---

## 1. Dataset Schema Specification

To train with real statistics or custom city benchmarks, place one or more `.csv` files into this directory (`ml_service/data/`). The automated loader will validate, aggregate, and train models across all CSV files in this directory.

| Column | Type | Description | Example / Range |
| :--- | :--- | :--- | :--- |
| `state` | string | Indian State or Union Territory | `"Tamil Nadu"`, `"Karnataka"`, `"Maharashtra"` |
| `city` | string | City name | `"Chennai"`, `"Bengaluru"`, `"Mumbai"` |
| `city_tier` | string | Urban classification | `"Tier 1"`, `"Tier 2"`, `"Tier 3"` |
| `avg_gig_weekly_income` | float | Typical gross/net weekly gig earnings (INR) | `4500` - `12500` |
| `income_std` | float | Standard deviation of weekly income (volatility) | `500` - `2200` |
| `avg_monthly_rent` | float | Typical 1BHK / shared accommodation rent (INR) | `3500` - `18000` |
| `avg_monthly_food_utilities` | float | Typical monthly groceries, food, mobile, electric | `3000` - `9000` |
| `avg_transport_fuel` | float | Monthly fuel / vehicle maintenance costs (INR) | `2500` - `8000` |
| `avg_emi_burden` | float | Typical vehicle / microloan EMI obligation (INR) | `1500` - `6000` |
| `cost_of_living_index` | float | Relative cost index (National Average = 100.0) | `80.0` - `155.0` |
| `platform_type` | string | Primary gig domain | `"delivery"`, `"ride_hailing"`, `"freelance_other"`, `"mixed"` |
| `month_season_factor` | float | Seasonal demand multiplier | `0.90` (Monsoon lull) - `1.25` (Festival surge) |
| `typical_weekly_hours` | float | Typical active working hours per week | `20` - `70` |
| `safe_savings_capacity` | float | Recommended monthly savings buffer ceiling | `1200` - `9500` |
| `source` | string | Citing agency / research publication / survey | `"State Gig Board Survey 2026"` |
| `year` | integer | Year of survey observation | `2025` or `2026` |
| `synthetic` | boolean | Must be `FALSE` for real survey data | `false` or `true` |

---

## 2. Dropping In Real Datasets & Retraining

You can drop real CSV files into `ml_service/data/` (for example, `delhi_gig_workers_2026.csv`, `karnataka_platform_survey.csv`).

To validate all datasets and retrain the XGBoost models with one command:

```bash
# From project root
python ml_service/train.py

# Or within ml_service directory
cd ml_service
python train.py
```

The loader will:
1. Scan all `.csv` files in `ml_service/data/`.
2. Check for missing columns, corrupt data types, extreme outliers, and duplicate entries.
3. Print a validation and dataset summary report.
4. Train XGBoost models for:
   - Weekly Income (`avg_gig_weekly_income`)
   - Monthly Rent (`avg_monthly_rent`)
   - Safe Savings Capacity (`safe_savings_capacity`)
   - Expense Breakdown (Food/Utilities, Fuel, EMI)
5. Evaluate models using a validation split against the city-average baseline.
6. Generate and save `ml_service/artifacts/metrics.json` and trained model artifacts (`ml_service/artifacts/xgb_models.joblib`).
7. If XGBoost fails to beat the city-average baseline on validation, the pipeline falls back to the baseline and documents this in `metrics.json`.

---

## 3. What the Model Is and Is Not (Honesty & Limitations)

- **What it IS:**
  - A regional, city-level prior estimating typical financial ranges for gig workers in Indian cities.
  - A blended estimator that combines non-linear XGBoost predictions with city-level dataset averages.
  - An educational baseline that provides safe-to-spend limits, rent guidelines, and savings capacity *before* a user connects real bank accounts.
- **What it IS NOT:**
  - It is **NOT** a credit scoring algorithm or individual creditworthiness assessment.
  - It does **NOT** predict a specific user's individual bank balance or tax liability.
  - Predictions are city-level and category-level generalizations, not individual-level guarantees.
  - It is **NOT** regulated financial advice under SEBI or RBI guidelines.
