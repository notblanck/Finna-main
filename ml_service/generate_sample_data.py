"""
Generates the clearly labeled sample synthetic dataset for FINNA city-level XGBoost training.
File name: ml_service/data/sample_city_gig_data_synthetic.csv
Marked: synthetic=True in every row.
"""

import os
import csv
import random

CITIES_DATA = [
    # Tier 1 Metros
    {"state": "Tamil Nadu", "city": "Chennai", "tier": "Tier 1", "col": 122.0, "base_rent": 8500, "base_food": 5800, "base_fuel": 4800, "base_emi": 3200, "base_income": 6800},
    {"state": "Karnataka", "city": "Bengaluru", "tier": "Tier 1", "col": 138.0, "base_rent": 10500, "base_food": 6500, "base_fuel": 5200, "base_emi": 3600, "base_income": 7600},
    {"state": "Maharashtra", "city": "Mumbai", "tier": "Tier 1", "col": 155.0, "base_rent": 13500, "base_food": 7200, "base_fuel": 5500, "base_emi": 3800, "base_income": 8200},
    {"state": "Maharashtra", "city": "Pune", "tier": "Tier 1", "col": 125.0, "base_rent": 9000, "base_food": 5900, "base_fuel": 4900, "base_emi": 3300, "base_income": 7100},
    {"state": "Delhi", "city": "Delhi", "tier": "Tier 1", "col": 140.0, "base_rent": 10200, "base_food": 6600, "base_fuel": 5400, "base_emi": 3600, "base_income": 7800},
    {"state": "Telangana", "city": "Hyderabad", "tier": "Tier 1", "col": 124.0, "base_rent": 8800, "base_food": 5700, "base_fuel": 4800, "base_emi": 3400, "base_income": 7100},
    {"state": "West Bengal", "city": "Kolkata", "tier": "Tier 1", "col": 110.0, "base_rent": 6800, "base_food": 5200, "base_fuel": 4400, "base_emi": 2900, "base_income": 6200},
    {"state": "Gujarat", "city": "Ahmedabad", "tier": "Tier 1", "col": 115.0, "base_rent": 7400, "base_food": 5400, "base_fuel": 4600, "base_emi": 3100, "base_income": 6500},

    # Tier 2 Major Cities
    {"state": "Tamil Nadu", "city": "Coimbatore", "tier": "Tier 2", "col": 102.0, "base_rent": 6000, "base_food": 4800, "base_fuel": 4200, "base_emi": 2800, "base_income": 5800},
    {"state": "Tamil Nadu", "city": "Madurai", "tier": "Tier 2", "col": 92.0, "base_rent": 5200, "base_food": 4400, "base_fuel": 3900, "base_emi": 2600, "base_income": 5200},
    {"state": "Karnataka", "city": "Mysuru", "tier": "Tier 2", "col": 98.0, "base_rent": 5600, "base_food": 4600, "base_fuel": 4000, "base_emi": 2700, "base_income": 5500},
    {"state": "Maharashtra", "city": "Nagpur", "tier": "Tier 2", "col": 96.0, "base_rent": 5400, "base_food": 4500, "base_fuel": 4100, "base_emi": 2700, "base_income": 5400},
    {"state": "Maharashtra", "city": "Nashik", "tier": "Tier 2", "col": 95.0, "base_rent": 5300, "base_food": 4400, "base_fuel": 4000, "base_emi": 2600, "base_income": 5300},
    {"state": "Gujarat", "city": "Surat", "tier": "Tier 2", "col": 105.0, "base_rent": 6200, "base_food": 4900, "base_fuel": 4300, "base_emi": 2900, "base_income": 6000},
    {"state": "Gujarat", "city": "Vadodara", "tier": "Tier 2", "col": 97.0, "base_rent": 5500, "base_food": 4600, "base_fuel": 4100, "base_emi": 2700, "base_income": 5500},
    {"state": "Rajasthan", "city": "Jaipur", "tier": "Tier 2", "col": 104.0, "base_rent": 6200, "base_food": 4900, "base_fuel": 4300, "base_emi": 2900, "base_income": 5900},
    {"state": "Uttar Pradesh", "city": "Lucknow", "tier": "Tier 2", "col": 99.0, "base_rent": 5800, "base_food": 4700, "base_fuel": 4200, "base_emi": 2800, "base_income": 5600},
    {"state": "Uttar Pradesh", "city": "Kanpur", "tier": "Tier 2", "col": 94.0, "base_rent": 5100, "base_food": 4400, "base_fuel": 4000, "base_emi": 2600, "base_income": 5200},
    {"state": "Uttar Pradesh", "city": "Noida", "tier": "Tier 1", "col": 132.0, "base_rent": 9200, "base_food": 6200, "base_fuel": 5100, "base_emi": 3500, "base_income": 7300},
    {"state": "Haryana", "city": "Gurugram", "tier": "Tier 1", "col": 142.0, "base_rent": 10800, "base_food": 6700, "base_fuel": 5300, "base_emi": 3700, "base_income": 7900},
    {"state": "Haryana", "city": "Faridabad", "tier": "Tier 2", "col": 108.0, "base_rent": 6500, "base_food": 5000, "base_fuel": 4400, "base_emi": 3000, "base_income": 6100},
    {"state": "Kerala", "city": "Kochi", "tier": "Tier 2", "col": 112.0, "base_rent": 6700, "base_food": 5300, "base_fuel": 4500, "base_emi": 3000, "base_income": 6300},
    {"state": "Kerala", "city": "Thiruvananthapuram", "tier": "Tier 2", "col": 106.0, "base_rent": 6100, "base_food": 5000, "base_fuel": 4300, "base_emi": 2900, "base_income": 5900},
    {"state": "Madhya Pradesh", "city": "Indore", "tier": "Tier 2", "col": 101.0, "base_rent": 5900, "base_food": 4800, "base_fuel": 4200, "base_emi": 2800, "base_income": 5800},
    {"state": "Madhya Pradesh", "city": "Bhopal", "tier": "Tier 2", "col": 95.0, "base_rent": 5300, "base_food": 4500, "base_fuel": 4100, "base_emi": 2700, "base_income": 5400},
    {"state": "Chandigarh", "city": "Chandigarh", "tier": "Tier 2", "col": 116.0, "base_rent": 7200, "base_food": 5500, "base_fuel": 4700, "base_emi": 3200, "base_income": 6600},
    {"state": "Punjab", "city": "Ludhiana", "tier": "Tier 2", "col": 98.0, "base_rent": 5600, "base_food": 4600, "base_fuel": 4100, "base_emi": 2700, "base_income": 5600},
    {"state": "Punjab", "city": "Amritsar", "tier": "Tier 2", "col": 96.0, "base_rent": 5400, "base_food": 4500, "base_fuel": 4000, "base_emi": 2600, "base_income": 5400},
    {"state": "Andhra Pradesh", "city": "Visakhapatnam", "tier": "Tier 2", "col": 100.0, "base_rent": 5800, "base_food": 4700, "base_fuel": 4200, "base_emi": 2800, "base_income": 5700},
    {"state": "Andhra Pradesh", "city": "Vijayawada", "tier": "Tier 2", "col": 97.0, "base_rent": 5500, "base_food": 4600, "base_fuel": 4100, "base_emi": 2700, "base_income": 5500},
    {"state": "Bihar", "city": "Patna", "tier": "Tier 2", "col": 93.0, "base_rent": 5000, "base_food": 4400, "base_fuel": 3900, "base_emi": 2500, "base_income": 5100},
    {"state": "Odisha", "city": "Bhubaneswar", "tier": "Tier 2", "col": 96.0, "base_rent": 5400, "base_food": 4500, "base_fuel": 4000, "base_emi": 2700, "base_income": 5400},
    {"state": "Assam", "city": "Guwahati", "tier": "Tier 2", "col": 95.0, "base_rent": 5200, "base_food": 4500, "base_fuel": 4100, "base_emi": 2600, "base_income": 5300},
    {"state": "Uttarakhand", "city": "Dehradun", "tier": "Tier 2", "col": 102.0, "base_rent": 6000, "base_food": 4800, "base_fuel": 4300, "base_emi": 2800, "base_income": 5700},
    {"state": "Chhattisgarh", "city": "Raipur", "tier": "Tier 2", "col": 92.0, "base_rent": 5000, "base_food": 4300, "base_fuel": 3900, "base_emi": 2500, "base_income": 5100},
    {"state": "Jharkhand", "city": "Ranchi", "tier": "Tier 2", "col": 91.0, "base_rent": 4900, "base_food": 4300, "base_fuel": 3900, "base_emi": 2500, "base_income": 5000},

    # Additional Emerging Cities across remaining states
    {"state": "Goa", "city": "Panaji", "tier": "Tier 2", "col": 118.0, "base_rent": 7500, "base_food": 5600, "base_fuel": 4600, "base_emi": 3100, "base_income": 6400},
    {"state": "Himachal Pradesh", "city": "Shimla", "tier": "Tier 2", "col": 103.0, "base_rent": 6100, "base_food": 4900, "base_fuel": 4400, "base_emi": 2800, "base_income": 5600},
    {"state": "Jammu and Kashmir", "city": "Srinagar", "tier": "Tier 2", "col": 96.0, "base_rent": 5300, "base_food": 4500, "base_fuel": 4200, "base_emi": 2600, "base_income": 5200},
    {"state": "Jammu and Kashmir", "city": "Jammu", "tier": "Tier 2", "col": 94.0, "base_rent": 5100, "base_food": 4400, "base_fuel": 4100, "base_emi": 2600, "base_income": 5100},
    {"state": "Puducherry", "city": "Puducherry", "tier": "Tier 2", "col": 101.0, "base_rent": 5900, "base_food": 4700, "base_fuel": 4100, "base_emi": 2700, "base_income": 5700},
    {"state": "Tripura", "city": "Agartala", "tier": "Tier 3", "col": 88.0, "base_rent": 4400, "base_food": 4000, "base_fuel": 3600, "base_emi": 2200, "base_income": 4600},
    {"state": "Meghalaya", "city": "Shillong", "tier": "Tier 2", "col": 97.0, "base_rent": 5500, "base_food": 4600, "base_fuel": 4100, "base_emi": 2600, "base_income": 5300},
    {"state": "Manipur", "city": "Imphal", "tier": "Tier 3", "col": 89.0, "base_rent": 4500, "base_food": 4100, "base_fuel": 3700, "base_emi": 2300, "base_income": 4700},
    {"state": "Nagaland", "city": "Kohima", "tier": "Tier 3", "col": 90.0, "base_rent": 4600, "base_food": 4200, "base_fuel": 3800, "base_emi": 2300, "base_income": 4800},
    {"state": "Mizoram", "city": "Aizawl", "tier": "Tier 3", "col": 91.0, "base_rent": 4700, "base_food": 4200, "base_fuel": 3800, "base_emi": 2400, "base_income": 4800},
    {"state": "Sikkim", "city": "Gangtok", "tier": "Tier 2", "col": 102.0, "base_rent": 6000, "base_food": 4800, "base_fuel": 4300, "base_emi": 2700, "base_income": 5500},
    {"state": "Arunachal Pradesh", "city": "Itanagar", "tier": "Tier 3", "col": 89.0, "base_rent": 4500, "base_food": 4100, "base_fuel": 3700, "base_emi": 2200, "base_income": 4600},
    {"state": "Ladakh", "city": "Leh", "tier": "Tier 3", "col": 99.0, "base_rent": 5600, "base_food": 4700, "base_fuel": 4300, "base_emi": 2500, "base_income": 5100},
    {"state": "Andaman and Nicobar Islands", "city": "Port Blair", "tier": "Tier 3", "col": 105.0, "base_rent": 6200, "base_food": 5100, "base_fuel": 4400, "base_emi": 2600, "base_income": 5400},
    {"state": "Dadra and Nagar Haveli and Daman and Diu", "city": "Daman", "tier": "Tier 3", "col": 95.0, "base_rent": 5200, "base_food": 4400, "base_fuel": 4000, "base_emi": 2500, "base_income": 5200},
    {"state": "Lakshadweep", "city": "Kavaratti", "tier": "Tier 3", "col": 92.0, "base_rent": 4800, "base_food": 4300, "base_fuel": 3800, "base_emi": 2200, "base_income": 4800},

    # Additional Tier 3 Sample Towns for Tamil Nadu, Karnataka, Maharashtra, UP
    {"state": "Tamil Nadu", "city": "Salem", "tier": "Tier 3", "col": 88.0, "base_rent": 4600, "base_food": 4100, "base_fuel": 3700, "base_emi": 2400, "base_income": 4800},
    {"state": "Tamil Nadu", "city": "Tiruchirappalli", "tier": "Tier 3", "col": 89.0, "base_rent": 4700, "base_food": 4200, "base_fuel": 3800, "base_emi": 2400, "base_income": 4900},
    {"state": "Karnataka", "city": "Hubballi", "tier": "Tier 3", "col": 88.0, "base_rent": 4500, "base_food": 4100, "base_fuel": 3700, "base_emi": 2400, "base_income": 4800},
    {"state": "Karnataka", "city": "Belagavi", "tier": "Tier 3", "col": 87.0, "base_rent": 4400, "base_food": 4000, "base_fuel": 3600, "base_emi": 2300, "base_income": 4700},
    {"state": "Uttar Pradesh", "city": "Varanasi", "tier": "Tier 3", "col": 90.0, "base_rent": 4800, "base_food": 4200, "base_fuel": 3800, "base_emi": 2400, "base_income": 4900},
    {"state": "Uttar Pradesh", "city": "Agra", "tier": "Tier 3", "col": 91.0, "base_rent": 4900, "base_food": 4300, "base_fuel": 3900, "base_emi": 2500, "base_income": 5000},
    {"state": "Rajasthan", "city": "Jodhpur", "tier": "Tier 3", "col": 89.0, "base_rent": 4700, "base_food": 4200, "base_fuel": 3800, "base_emi": 2400, "base_income": 4800},
    {"state": "Telangana", "city": "Warangal", "tier": "Tier 3", "col": 88.0, "base_rent": 4500, "base_food": 4100, "base_fuel": 3700, "base_emi": 2300, "base_income": 4700},
]

PLATFORMS = [
    {"type": "delivery", "income_mult": 1.0, "fuel_mult": 1.05},
    {"type": "ride_hailing", "income_mult": 1.12, "fuel_mult": 1.25},
    {"type": "freelance_other", "income_mult": 1.08, "fuel_mult": 0.85},
    {"type": "mixed", "income_mult": 1.06, "fuel_mult": 1.10},
]

HOURS_VARIATIONS = [25, 35, 45, 55, 65]
SEASON_VARIATIONS = [
    {"factor": 0.92, "name": "monsoon_lull"},
    {"factor": 1.00, "name": "normal_demand"},
    {"factor": 1.15, "name": "festival_surge"},
]

def generate():
    random.seed(42)
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "sample_city_gig_data_synthetic.csv")

    fieldnames = [
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

    rows = []
    for city_info in CITIES_DATA:
        for p in PLATFORMS:
            for hrs in HOURS_VARIATIONS:
                for s in SEASON_VARIATIONS:
                    # Hours scaling: 45 hrs is the normal baseline (1.0)
                    hrs_factor = (hrs / 45.0) ** 0.82  # Slight sub-linear diminishing return for long hours
                    noise = random.uniform(0.96, 1.04)

                    weekly_income = round(
                        city_info["base_income"] * p["income_mult"] * hrs_factor * s["factor"] * noise,
                        2
                    )

                    # Volatility std: 10% - 16% of weekly income
                    income_std = round(weekly_income * random.uniform(0.10, 0.16), 2)

                    # Rent depends on city COL + minor noise
                    rent = round(city_info["base_rent"] * random.uniform(0.95, 1.05), 2)

                    # Food & Utilities
                    food_util = round(city_info["base_food"] * random.uniform(0.95, 1.05), 2)

                    # Fuel: depends on platform and hours
                    fuel_hrs_factor = (hrs / 45.0) ** 0.9
                    fuel = round(city_info["base_fuel"] * p["fuel_mult"] * fuel_hrs_factor * random.uniform(0.96, 1.04), 2)

                    # EMI burden: realistic 2W / device EMI
                    emi = round(city_info["base_emi"] * random.uniform(0.94, 1.06), 2)

                    # Safe monthly savings capacity: 15% - 25% of net monthly income after essential costs
                    monthly_income = weekly_income * 4.33
                    monthly_essentials = rent + food_util + fuel + emi
                    surplus = max(800.0, monthly_income - monthly_essentials)
                    safe_savings = round(max(1000.0, surplus * 0.65), 2)

                    rows.append({
                        "state": city_info["state"],
                        "city": city_info["city"],
                        "city_tier": city_info["tier"],
                        "avg_gig_weekly_income": weekly_income,
                        "income_std": income_std,
                        "avg_monthly_rent": rent,
                        "avg_monthly_food_utilities": food_util,
                        "avg_transport_fuel": fuel,
                        "avg_emi_burden": emi,
                        "cost_of_living_index": city_info["col"],
                        "platform_type": p["type"],
                        "month_season_factor": s["factor"],
                        "typical_weekly_hours": hrs,
                        "safe_savings_capacity": safe_savings,
                        "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
                        "year": 2026,
                        "synthetic": True,
                    })

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} sample synthetic records written to: {output_file}")
    return output_file

if __name__ == "__main__":
    generate()
