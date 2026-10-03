# FINNA city datasets (SYNTHETIC / ILLUSTRATIVE)

These files are generated sample data for Chennai, Bengaluru, Hyderabad and Mumbai.
The values use plausible ranges but are NOT official statistics and NOT measurements of real workers.
Every row has `synthetic=true`. Show "Illustrative data" in the UI wherever they are used.
Replace them with real data (PLFS, NITI Aayog gig-economy report, rent/price indices, your own
worker surveys) before claiming real-world accuracy. Keep the same column names so retraining works unchanged.

## Files
- finna_worker_samples.csv (1,296 rows): one row per synthetic worker-month. Use this to train XGBoost.
  Features: state, city, city_tier, platform_type, month, weekly_hours, experience_months, vehicle_status, cost_of_living_index
  Targets: weekly_income, monthly_rent, monthly_food_utilities, monthly_transport_fuel,
           monthly_emi_or_vehicle_rental, monthly_other_expenses, monthly_expenses_total, safe_monthly_savings
  Also: income_volatility_pct, synthetic, source, year
- finna_city_averages.csv (12 rows): city x platform averages from the samples. This is the "city average" baseline
  and the fallback when the ML service is down or the city is unknown.
- finna_seasonality.csv (144 rows): city x platform x month average weekly income and season_factor.

## Notes
- Currency is INR. Income is weekly net of fuel; expenses are monthly.
- Platform types: delivery, ride_hailing, freelance.
- vehicle_status: owned_bike_on_emi, owned_bike_paid, rented_vehicle, no_vehicle.
- Do not use any metric from this data as a real accuracy claim. Report model metrics as "on synthetic data".
