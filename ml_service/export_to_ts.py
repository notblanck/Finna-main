"""Export the retrained city-average fallback to the Next.js bundle."""

import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(base_dir, "artifacts", "city_baselines.json"), encoding="utf-8") as source:
    data = json.load(source)

states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

header = '''/**
 * Generated from ml_service/data/finna_city_averages.csv and finna_seasonality.csv.
 * These values are synthetic illustrative data, never real statistics.
 */
export const INDIAN_STATES_AND_UTS: string[] = __STATES__
export const CITY_BASELINES_DATA: any = __DATA__
export const STATE_CITY_MAPPING: Record<string, string[]> = Object.fromEntries(
  INDIAN_STATES_AND_UTS.map((state) => [state, Object.values(CITY_BASELINES_DATA.city_baselines)
    .filter((info) => info.state === state).map((info) => info.city).sort()])
)

export function getCitiesForState(state: string): string[] {
  return STATE_CITY_MAPPING[state.trim()] || []
}

export interface EstimatedFinancialProfile {
  status: string
  inputs: { state: string; city: string; platform: string; hours: number; month?: number; city_tier: string; cost_of_living_index: number; season_factor?: number }
  weekly_income: { expected: number; low: number; high: number; std: number }
  monthly_income: { expected: number; low: number; high: number }
  typical_rent: { expected: number; low: number; high: number }
  monthly_expenses: { rent: number; food_utilities: number; transport_fuel: number; emi_burden: number; total: number; other?: number }
  safe_savings_capacity: number
  safe_to_spend_today: number
  baseline_city_average: { weekly_income: number; monthly_rent: number; food_utilities: number; transport_fuel: number; emi_burden: number; safe_savings_capacity: number }
  blend_weights: { xgboost: number; city_baseline: number }
  suggested_action: string
  metadata: { model_version: string; estimation_method: string; data_year: number; data_source: string; synthetic: boolean; confidence: "high" | "medium" | "low"; is_known_city: boolean; fallback_used: boolean; disclaimer: string; evaluation_scope?: string }
  model_version?: string
  data_source_badge?: "ml_estimate" | "city_average" | "synthetic"
  confidence_level?: string
  fallback_applied?: boolean
  data_source?: string
  data_year?: number
  user_edited?: { income?: boolean; rent?: boolean; emi?: boolean }
}

export function hasCityData(_state?: string, city?: string): boolean {
  return Boolean(city && city.trim() in CITY_BASELINES_DATA.city_baselines)
}

export function computeLocalFallbackProfile(
  stateOrOptions: string | { state?: string; city?: string; platform?: string; hours?: number; month?: number; name?: string },
  cityArg?: string, platformArg = "delivery", hoursArg = 45
): EstimatedFinancialProfile {
  const options = typeof stateOrOptions === "object" ? stateOrOptions : { state: stateOrOptions, city: cityArg, platform: platformArg, hours: hoursArg }
  const state = (options.state || "Tamil Nadu").trim()
  const city = (options.city || "Chennai").trim()
  const platform = (options.platform || "delivery").toLowerCase()
  const hours = Math.max(10, Math.min(80, options.hours || 45))
  const month = options.month && options.month >= 1 && options.month <= 12 ? options.month : new Date().getMonth() + 1
  const cityInfo = CITY_BASELINES_DATA.city_baselines[city as keyof typeof CITY_BASELINES_DATA.city_baselines]
  const stateInfo = CITY_BASELINES_DATA.state_baselines[state as keyof typeof CITY_BASELINES_DATA.state_baselines]
  const base = cityInfo?.platform_averages?.[platform] || cityInfo || stateInfo || CITY_BASELINES_DATA.national_baseline
  const seasonKey = `${city}|${platform}|${month}`
  const seasonFactor = CITY_BASELINES_DATA.season_factors[seasonKey as keyof typeof CITY_BASELINES_DATA.season_factors] || 1
  const weekly = Number(base.avg_weekly_income) * Number(seasonFactor) * Math.pow(hours / 45, 0.82)
  const rent = Number(base.avg_monthly_rent)
  const food = Number(base.avg_monthly_food_utilities)
  const fuel = Number(base.avg_monthly_transport_fuel) * (hours / 45)
  const emi = Number(base.avg_monthly_emi)
  const totalAverage = Number(base.avg_monthly_expenses_total)
  const other = Math.max(0, totalAverage - rent - food - Number(base.avg_monthly_transport_fuel) - emi)
  const total = rent + food + fuel + emi + other
  const savings = Number(base.avg_safe_monthly_savings)
  const std = Number(base.income_std) || weekly * 0.2
  const low = Math.max(0, weekly - 1.4 * std)
  const high = weekly + 1.5 * std
  const synthetic = Boolean(cityInfo?.synthetic ?? stateInfo?.synthetic ?? CITY_BASELINES_DATA.provenance.synthetic)
  const fallback = !cityInfo
  const source = cityInfo?.source || "finna_city_averages.csv"
  const year = Number(cityInfo?.year || 2026)
  return {
    status: "success",
    inputs: { state, city, platform, hours, month, city_tier: String(cityInfo?.city_tier || "2"), cost_of_living_index: Number(cityInfo?.cost_of_living_index || stateInfo?.cost_of_living_index || 100), season_factor: Number(seasonFactor) },
    weekly_income: { expected: Math.round(weekly), low: Math.round(low), high: Math.round(high), std: Math.round(std) },
    monthly_income: { expected: Math.round(weekly * 4.33), low: Math.round(low * 4.33), high: Math.round(high * 4.33) },
    typical_rent: { expected: Math.round(rent), low: Math.round(rent * .85), high: Math.round(rent * 1.15) },
    monthly_expenses: { rent: Math.round(rent), food_utilities: Math.round(food), transport_fuel: Math.round(fuel), emi_burden: Math.round(emi), other: Math.round(other), total: Math.round(total) },
    safe_savings_capacity: Math.round(Math.max(0, savings)), safe_to_spend_today: Math.max(0, Math.round((weekly / 6 * .72) - ((rent + emi) / 30 * .6))),
    baseline_city_average: { weekly_income: Math.round(Number(base.avg_weekly_income)), monthly_rent: Math.round(rent), food_utilities: Math.round(food), transport_fuel: Math.round(Number(base.avg_monthly_transport_fuel)), emi_burden: Math.round(emi), safe_savings_capacity: Math.round(savings) },
    blend_weights: { xgboost: 0, city_baseline: 1 }, suggested_action: "Illustrative data only — replace these estimates with your actual income and expenses when available.",
    model_version: "v2.0.0-city-average-fallback", data_source_badge: synthetic ? "synthetic" : "city_average", confidence_level: fallback ? "fallback" : "medium", fallback_applied: true, data_source: source, data_year: year,
    metadata: { model_version: "v2.0.0-city-average-fallback", estimation_method: "Supplied city average fallback", data_year: year, data_source: source, synthetic, confidence: fallback ? "low" : "medium", is_known_city: Boolean(cityInfo), fallback_used: true, evaluation_scope: synthetic ? "on synthetic data" : "on supplied dataset", disclaimer: "Illustrative data only. These synthetic estimates are not real worker statistics or financial advice." }
  }
}
'''

target = os.path.join(base_dir, "..", "lib", "data", "city-baselines.ts")
with open(target, "w", encoding="utf-8") as output:
    output.write(header.replace("__STATES__", json.dumps(states, indent=2)).replace("__DATA__", json.dumps(data, indent=2)))
print(f"Exported supplied-city fallback to {target}")
