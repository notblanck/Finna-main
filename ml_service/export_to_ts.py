import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base_dir, "artifacts", "city_baselines.json")
target_path = os.path.join(base_dir, "..", "lib", "data", "city-baselines.ts")

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

states = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
]

header = """/**
 * FINNA City-Level Dataset Baselines & Indian Geography Data
 * Used for searchable State/City selection, instant offline fallbacks,
 * and baseline comparison metrics.
 */

export interface CityBaselineInfo {
  city: string
  state: string
  city_tier: string
  avg_gig_weekly_income: number
  income_std: number
  avg_monthly_rent: number
  avg_monthly_food_utilities: number
  avg_transport_fuel: number
  avg_emi_burden: number
  cost_of_living_index: number
  safe_savings_capacity: number
  platform_weekly_averages: Record<string, number>
  sample_count: number
  synthetic: boolean
  source: string
  year: number
}

export interface StateBaselineInfo {
  avg_gig_weekly_income: number
  income_std: number
  avg_monthly_rent: number
  avg_monthly_food_utilities: number
  avg_transport_fuel: number
  avg_emi_burden: number
  cost_of_living_index: number
  safe_savings_capacity: number
  sample_count: number
}

export interface NationalBaselineInfo extends StateBaselineInfo {}

export const INDIAN_STATES_AND_UTS: string[] = """ + json.dumps(states, indent=2) + """;

export const CITY_BASELINES_DATA: {
  national_baseline: NationalBaselineInfo
  state_baselines: Record<string, StateBaselineInfo>
  city_baselines: Record<string, CityBaselineInfo>
} = """ + json.dumps(data, indent=2) + """;

export function getCitiesForState(state: string): string[] {
  const normState = state.trim().toLowerCase()
  const cities: string[] = []
  for (const [cityName, info] of Object.entries(CITY_BASELINES_DATA.city_baselines)) {
    if (info.state.toLowerCase() === normState) {
      cities.push(cityName)
    }
  }
  return cities.sort()
}

export interface EstimatedFinancialProfile {
  status: string
  inputs: {
    state: string
    city: string
    platform: string
    hours: number
    city_tier: string
    cost_of_living_index: number
  }
  weekly_income: {
    expected: number
    low: number
    high: number
    std: number
  }
  monthly_income: {
    expected: number
    low: number
    high: number
  }
  typical_rent: {
    expected: number
    low: number
    high: number
  }
  monthly_expenses: {
    rent: number
    food_utilities: number
    transport_fuel: number
    emi_burden: number
    total: number
  }
  safe_savings_capacity: number
  safe_to_spend_today: number
  baseline_city_average: {
    weekly_income: number
    monthly_rent: number
    food_utilities: number
    transport_fuel: number
    emi_burden: number
    safe_savings_capacity: number
  }
  blend_weights: {
    xgboost: number
    city_baseline: number
  }
  suggested_action: string
  metadata: {
    model_version: string
    estimation_method: string
    data_year: number
    data_source: string
    synthetic: boolean
    confidence: "high" | "medium" | "low"
    is_known_city: boolean
    fallback_used: boolean
    disclaimer: string
  }
  user_edited?: {
    income?: boolean
    rent?: boolean
    emi?: boolean
  }
}

export function computeLocalFallbackProfile(
  state: string,
  city: string,
  platform: string = "delivery",
  hours: number = 45
): EstimatedFinancialProfile {
  const normCity = city.trim()
  const normState = state.trim()
  const normPlatform = (platform || "delivery").toLowerCase()
  const validHours = Math.max(10, Math.min(80, hours || 45))

  const cityMap = CITY_BASELINES_DATA.city_baselines
  const stateMap = CITY_BASELINES_DATA.state_baselines
  const natBase = CITY_BASELINES_DATA.national_baseline

  const isKnownCity = normCity in cityMap
  const isKnownState = normState in stateMap

  let cityTier = "Tier 2"
  let colIndex = 100
  let dataSource = "FINNA Regional Baseline Averages"
  let dataYear = 2026
  let isSynthetic = true
  let baseWeekly = natBase.avg_gig_weekly_income
  let baseRent = natBase.avg_monthly_rent
  let baseFood = natBase.avg_monthly_food_utilities
  let baseFuel = natBase.avg_transport_fuel
  let baseEmi = natBase.avg_emi_burden
  let baseSavings = natBase.safe_savings_capacity
  let incStd = natBase.income_std

  if (isKnownCity) {
    const c = cityMap[normCity]
    cityTier = c.city_tier
    colIndex = c.cost_of_living_index
    dataSource = c.source
    dataYear = c.year
    isSynthetic = c.synthetic
    baseWeekly = c.platform_weekly_averages?.[normPlatform] ?? c.avg_gig_weekly_income
    baseRent = c.avg_monthly_rent
    baseFood = c.avg_monthly_food_utilities
    baseFuel = c.avg_transport_fuel
    baseEmi = c.avg_emi_burden
    baseSavings = c.safe_savings_capacity
    incStd = c.income_std
  } else if (isKnownState) {
    const s = stateMap[normState]
    colIndex = s.cost_of_living_index
    dataSource = "State-level Average Benchmark"
    baseWeekly = s.avg_gig_weekly_income
    baseRent = s.avg_monthly_rent
    baseFood = s.avg_monthly_food_utilities
    baseFuel = s.avg_transport_fuel
    baseEmi = s.avg_emi_burden
    baseSavings = s.safe_savings_capacity
    incStd = s.income_std
  }

  // Adjust for hours (45 hrs is reference)
  const hoursFactor = Math.pow(validHours / 45, 0.82)
  const weeklyIncome = Math.round(baseWeekly * hoursFactor)
  const fuelFactor = validHours / 45
  const adjustedFuel = Math.round(baseFuel * fuelFactor)

  const weeklyLow = Math.max(1500, Math.round(weeklyIncome - 1.4 * incStd))
  const weeklyHigh = Math.round(weeklyIncome + 1.5 * incStd)

  const monthlyIncome = Math.round(weeklyIncome * 4.33)
  const monthlyLow = Math.round(weeklyLow * 4.33)
  const monthlyHigh = Math.round(weeklyHigh * 4.33)

  const rentLow = Math.max(2000, Math.round(baseRent * 0.85))
  const rentHigh = Math.round(baseRent * 1.15)

  const totalMonthlyExpenses = baseRent + baseFood + adjustedFuel + baseEmi

  // Safe to spend today
  const dailyIncome = weeklyIncome / 6
  const dailyFixed = (baseRent + baseEmi) / 30
  const safeToSpendToday = Math.max(0, Math.round((dailyIncome * 0.72) - (dailyFixed * 0.6)))

  let suggestedAction = ""
  if (monthlyIncome > totalMonthlyExpenses + 2000) {
    suggestedAction = `Set aside ₹${baseSavings.toLocaleString("en-IN")} monthly to build a 3-month safety cushion (₹${Math.round(baseRent * 3).toLocaleString("en-IN")} typical rent cover).`
  } else {
    suggestedAction = `Prioritize rent (₹${baseRent.toLocaleString("en-IN")}) and fuel (₹${adjustedFuel.toLocaleString("en-IN")}) before discretionary spends in ${normCity}.`
  }

  return {
    status: "success",
    inputs: {
      state: normState,
      city: normCity,
      platform: normPlatform,
      hours: validHours,
      city_tier: cityTier,
      cost_of_living_index: colIndex
    },
    weekly_income: {
      expected: weeklyIncome,
      low: weeklyLow,
      high: weeklyHigh,
      std: Math.round(incStd)
    },
    monthly_income: {
      expected: monthlyIncome,
      low: monthlyLow,
      high: monthlyHigh
    },
    typical_rent: {
      expected: baseRent,
      low: rentLow,
      high: rentHigh
    },
    monthly_expenses: {
      rent: baseRent,
      food_utilities: baseFood,
      transport_fuel: adjustedFuel,
      emi_burden: baseEmi,
      total: totalMonthlyExpenses
    },
    safe_savings_capacity: baseSavings,
    safe_to_spend_today: safeToSpendToday,
    baseline_city_average: {
      weekly_income: Math.round(baseWeekly),
      monthly_rent: Math.round(baseRent),
      food_utilities: Math.round(baseFood),
      transport_fuel: Math.round(baseFuel),
      emi_burden: Math.round(baseEmi),
      safe_savings_capacity: Math.round(baseSavings)
    },
    blend_weights: {
      xgboost: 0.0,
      city_baseline: 1.0
    },
    suggested_action: suggestedAction,
    metadata: {
      model_version: "v1.2.0-baseline",
      estimation_method: isKnownCity ? "City Average Baseline" : "State/National Baseline Average",
      data_year: dataYear,
      data_source: dataSource,
      synthetic: isSynthetic,
      confidence: isKnownCity ? "medium" : "low",
      is_known_city: isKnownCity,
      fallback_used: true,
      disclaimer: "FINNA provides financial intelligence and education, not regulated financial advice. All figures for non-consented accounts are estimates based on regional statistics."
    }
  }
}
"""

with open(target_path, "w", encoding="utf-8") as f:
    f.write(header)

print(f"Exported to {target_path}")
