/**
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

export const INDIAN_STATES_AND_UTS: string[] = [
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
];

export const CITY_BASELINES_DATA: {
  national_baseline: NationalBaselineInfo
  state_baselines: Record<string, StateBaselineInfo>
  city_baselines: Record<string, CityBaselineInfo>
} = {
  "national_baseline": {
    "avg_gig_weekly_income": 6119.46,
    "income_std": 792.4,
    "avg_monthly_rent": 6091.86,
    "avg_monthly_food_utilities": 4811.76,
    "avg_transport_fuel": 4453.01,
    "avg_emi_burden": 2747.24,
    "cost_of_living_index": 102.37,
    "safe_savings_capacity": 5678.94,
    "sample_count": 3600
  },
  "state_baselines": {
    "Andaman and Nicobar Islands": {
      "avg_gig_weekly_income": 5821.84,
      "income_std": 752.76,
      "avg_monthly_rent": 6185.96,
      "avg_monthly_food_utilities": 5106.73,
      "avg_transport_fuel": 4679.9,
      "avg_emi_burden": 2614.51,
      "cost_of_living_index": 105.0,
      "safe_savings_capacity": 4654.08,
      "sample_count": 60
    },
    "Andhra Pradesh": {
      "avg_gig_weekly_income": 6057.53,
      "income_std": 774.17,
      "avg_monthly_rent": 5662.22,
      "avg_monthly_food_utilities": 4646.24,
      "avg_transport_fuel": 4370.61,
      "avg_emi_burden": 2762.27,
      "cost_of_living_index": 98.5,
      "safe_savings_capacity": 5892.86,
      "sample_count": 120
    },
    "Arunachal Pradesh": {
      "avg_gig_weekly_income": 4998.02,
      "income_std": 626.6,
      "avg_monthly_rent": 4494.8,
      "avg_monthly_food_utilities": 4106.07,
      "avg_transport_fuel": 3883.97,
      "avg_emi_burden": 2184.29,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 4727.65,
      "sample_count": 60
    },
    "Assam": {
      "avg_gig_weekly_income": 5753.22,
      "income_std": 733.65,
      "avg_monthly_rent": 5201.37,
      "avg_monthly_food_utilities": 4487.91,
      "avg_transport_fuel": 4335.95,
      "avg_emi_burden": 2594.63,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5585.58,
      "sample_count": 60
    },
    "Bihar": {
      "avg_gig_weekly_income": 5501.48,
      "income_std": 689.05,
      "avg_monthly_rent": 5008.19,
      "avg_monthly_food_utilities": 4416.87,
      "avg_transport_fuel": 4133.56,
      "avg_emi_burden": 2497.75,
      "cost_of_living_index": 93.0,
      "safe_savings_capacity": 5228.94,
      "sample_count": 60
    },
    "Chandigarh": {
      "avg_gig_weekly_income": 7131.8,
      "income_std": 927.22,
      "avg_monthly_rent": 7190.66,
      "avg_monthly_food_utilities": 5501.5,
      "avg_transport_fuel": 4978.3,
      "avg_emi_burden": 3198.17,
      "cost_of_living_index": 116.0,
      "safe_savings_capacity": 6739.79,
      "sample_count": 60
    },
    "Chhattisgarh": {
      "avg_gig_weekly_income": 5512.53,
      "income_std": 722.53,
      "avg_monthly_rent": 4991.17,
      "avg_monthly_food_utilities": 4325.9,
      "avg_transport_fuel": 4109.14,
      "avg_emi_burden": 2524.8,
      "cost_of_living_index": 92.0,
      "safe_savings_capacity": 5321.26,
      "sample_count": 60
    },
    "Dadra and Nagar Haveli and Daman and Diu": {
      "avg_gig_weekly_income": 5649.98,
      "income_std": 737.33,
      "avg_monthly_rent": 5191.06,
      "avg_monthly_food_utilities": 4396.85,
      "avg_transport_fuel": 4219.41,
      "avg_emi_burden": 2516.12,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5477.04,
      "sample_count": 60
    },
    "Delhi": {
      "avg_gig_weekly_income": 8414.3,
      "income_std": 1115.75,
      "avg_monthly_rent": 10179.71,
      "avg_monthly_food_utilities": 6634.88,
      "avg_transport_fuel": 5739.95,
      "avg_emi_burden": 3602.61,
      "cost_of_living_index": 140.0,
      "safe_savings_capacity": 7066.21,
      "sample_count": 60
    },
    "Goa": {
      "avg_gig_weekly_income": 6921.1,
      "income_std": 906.09,
      "avg_monthly_rent": 7501.09,
      "avg_monthly_food_utilities": 5581.97,
      "avg_transport_fuel": 4873.03,
      "avg_emi_burden": 3104.71,
      "cost_of_living_index": 118.0,
      "safe_savings_capacity": 6091.26,
      "sample_count": 60
    },
    "Gujarat": {
      "avg_gig_weekly_income": 6507.14,
      "income_std": 836.94,
      "avg_monthly_rent": 6346.91,
      "avg_monthly_food_utilities": 4970.67,
      "avg_transport_fuel": 4583.28,
      "avg_emi_burden": 2888.24,
      "cost_of_living_index": 105.67,
      "safe_savings_capacity": 6282.49,
      "sample_count": 180
    },
    "Haryana": {
      "avg_gig_weekly_income": 7558.1,
      "income_std": 982.21,
      "avg_monthly_rent": 8648.75,
      "avg_monthly_food_utilities": 5849.2,
      "avg_transport_fuel": 5130.61,
      "avg_emi_burden": 3336.3,
      "cost_of_living_index": 125.0,
      "safe_savings_capacity": 6652.53,
      "sample_count": 120
    },
    "Himachal Pradesh": {
      "avg_gig_weekly_income": 6071.1,
      "income_std": 770.56,
      "avg_monthly_rent": 6089.27,
      "avg_monthly_food_utilities": 4882.14,
      "avg_transport_fuel": 4663.62,
      "avg_emi_burden": 2790.1,
      "cost_of_living_index": 103.0,
      "safe_savings_capacity": 5382.91,
      "sample_count": 60
    },
    "Jammu and Kashmir": {
      "avg_gig_weekly_income": 5544.96,
      "income_std": 718.09,
      "avg_monthly_rent": 5209.36,
      "avg_monthly_food_utilities": 4454.84,
      "avg_transport_fuel": 4406.62,
      "avg_emi_burden": 2602.72,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 4993.94,
      "sample_count": 120
    },
    "Jharkhand": {
      "avg_gig_weekly_income": 5420.47,
      "income_std": 699.97,
      "avg_monthly_rent": 4903.24,
      "avg_monthly_food_utilities": 4279.4,
      "avg_transport_fuel": 4110.12,
      "avg_emi_burden": 2492.23,
      "cost_of_living_index": 91.0,
      "safe_savings_capacity": 5175.27,
      "sample_count": 60
    },
    "Karnataka": {
      "avg_gig_weekly_income": 6109.18,
      "income_std": 783.46,
      "avg_monthly_rent": 6244.22,
      "avg_monthly_food_utilities": 4803.25,
      "avg_transport_fuel": 4366.42,
      "avg_emi_burden": 2752.03,
      "cost_of_living_index": 102.75,
      "safe_savings_capacity": 5607.37,
      "sample_count": 240
    },
    "Kerala": {
      "avg_gig_weekly_income": 6595.05,
      "income_std": 852.21,
      "avg_monthly_rent": 6416.63,
      "avg_monthly_food_utilities": 5159.11,
      "avg_transport_fuel": 4660.02,
      "avg_emi_burden": 2957.46,
      "cost_of_living_index": 109.0,
      "safe_savings_capacity": 6283.44,
      "sample_count": 120
    },
    "Ladakh": {
      "avg_gig_weekly_income": 5517.06,
      "income_std": 720.64,
      "avg_monthly_rent": 5626.75,
      "avg_monthly_food_utilities": 4691.27,
      "avg_transport_fuel": 4567.91,
      "avg_emi_burden": 2500.51,
      "cost_of_living_index": 99.0,
      "safe_savings_capacity": 4575.16,
      "sample_count": 60
    },
    "Lakshadweep": {
      "avg_gig_weekly_income": 5197.46,
      "income_std": 672.82,
      "avg_monthly_rent": 4811.9,
      "avg_monthly_food_utilities": 4302.88,
      "avg_transport_fuel": 4000.91,
      "avg_emi_burden": 2209.1,
      "cost_of_living_index": 92.0,
      "safe_savings_capacity": 4862.35,
      "sample_count": 60
    },
    "Madhya Pradesh": {
      "avg_gig_weekly_income": 6094.97,
      "income_std": 789.55,
      "avg_monthly_rent": 5599.53,
      "avg_monthly_food_utilities": 4625.32,
      "avg_transport_fuel": 4384.18,
      "avg_emi_burden": 2747.28,
      "cost_of_living_index": 98.0,
      "safe_savings_capacity": 6042.95,
      "sample_count": 120
    },
    "Maharashtra": {
      "avg_gig_weekly_income": 7034.39,
      "income_std": 915.65,
      "avg_monthly_rent": 8298.72,
      "avg_monthly_food_utilities": 5504.68,
      "avg_transport_fuel": 4888.65,
      "avg_emi_burden": 3093.76,
      "cost_of_living_index": 117.75,
      "safe_savings_capacity": 6015.62,
      "sample_count": 240
    },
    "Manipur": {
      "avg_gig_weekly_income": 5095.57,
      "income_std": 662.06,
      "avg_monthly_rent": 4527.28,
      "avg_monthly_food_utilities": 4089.66,
      "avg_transport_fuel": 3908.17,
      "avg_emi_burden": 2291.0,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 4873.02,
      "sample_count": 60
    },
    "Meghalaya": {
      "avg_gig_weekly_income": 5724.64,
      "income_std": 765.23,
      "avg_monthly_rent": 5528.43,
      "avg_monthly_food_utilities": 4613.94,
      "avg_transport_fuel": 4340.83,
      "avg_emi_burden": 2599.96,
      "cost_of_living_index": 97.0,
      "safe_savings_capacity": 5220.61,
      "sample_count": 60
    },
    "Mizoram": {
      "avg_gig_weekly_income": 5172.26,
      "income_std": 675.59,
      "avg_monthly_rent": 4696.38,
      "avg_monthly_food_utilities": 4211.6,
      "avg_transport_fuel": 4014.56,
      "avg_emi_burden": 2408.78,
      "cost_of_living_index": 91.0,
      "safe_savings_capacity": 4784.96,
      "sample_count": 60
    },
    "Nagaland": {
      "avg_gig_weekly_income": 5178.79,
      "income_std": 668.4,
      "avg_monthly_rent": 4603.44,
      "avg_monthly_food_utilities": 4204.21,
      "avg_transport_fuel": 4026.91,
      "avg_emi_burden": 2301.67,
      "cost_of_living_index": 90.0,
      "safe_savings_capacity": 4912.99,
      "sample_count": 60
    },
    "Odisha": {
      "avg_gig_weekly_income": 5821.18,
      "income_std": 762.12,
      "avg_monthly_rent": 5378.13,
      "avg_monthly_food_utilities": 4558.99,
      "avg_transport_fuel": 4221.17,
      "avg_emi_burden": 2700.02,
      "cost_of_living_index": 96.0,
      "safe_savings_capacity": 5589.21,
      "sample_count": 60
    },
    "Puducherry": {
      "avg_gig_weekly_income": 6162.21,
      "income_std": 800.2,
      "avg_monthly_rent": 5929.5,
      "avg_monthly_food_utilities": 4680.59,
      "avg_transport_fuel": 4340.48,
      "avg_emi_burden": 2679.11,
      "cost_of_living_index": 101.0,
      "safe_savings_capacity": 6047.41,
      "sample_count": 60
    },
    "Punjab": {
      "avg_gig_weekly_income": 5962.89,
      "income_std": 768.02,
      "avg_monthly_rent": 5485.62,
      "avg_monthly_food_utilities": 4555.09,
      "avg_transport_fuel": 4268.38,
      "avg_emi_burden": 2645.54,
      "cost_of_living_index": 97.0,
      "safe_savings_capacity": 5907.17,
      "sample_count": 120
    },
    "Rajasthan": {
      "avg_gig_weekly_income": 5799.89,
      "income_std": 736.49,
      "avg_monthly_rent": 5460.68,
      "avg_monthly_food_utilities": 4565.79,
      "avg_transport_fuel": 4280.03,
      "avg_emi_burden": 2660.59,
      "cost_of_living_index": 96.5,
      "safe_savings_capacity": 5488.34,
      "sample_count": 120
    },
    "Sikkim": {
      "avg_gig_weekly_income": 5970.0,
      "income_std": 752.44,
      "avg_monthly_rent": 6006.67,
      "avg_monthly_food_utilities": 4833.95,
      "avg_transport_fuel": 4522.19,
      "avg_emi_burden": 2718.04,
      "cost_of_living_index": 102.0,
      "safe_savings_capacity": 5306.33,
      "sample_count": 60
    },
    "Tamil Nadu": {
      "avg_gig_weekly_income": 5967.45,
      "income_std": 782.77,
      "avg_monthly_rent": 5810.89,
      "avg_monthly_food_utilities": 4654.63,
      "avg_transport_fuel": 4311.52,
      "avg_emi_burden": 2675.33,
      "cost_of_living_index": 98.6,
      "safe_savings_capacity": 5647.68,
      "sample_count": 300
    },
    "Telangana": {
      "avg_gig_weekly_income": 6367.0,
      "income_std": 815.92,
      "avg_monthly_rent": 6626.14,
      "avg_monthly_food_utilities": 4934.01,
      "avg_transport_fuel": 4483.44,
      "avg_emi_burden": 2872.85,
      "cost_of_living_index": 106.0,
      "safe_savings_capacity": 5847.46,
      "sample_count": 120
    },
    "Tripura": {
      "avg_gig_weekly_income": 4996.62,
      "income_std": 669.9,
      "avg_monthly_rent": 4425.76,
      "avg_monthly_food_utilities": 3990.37,
      "avg_transport_fuel": 3790.78,
      "avg_emi_burden": 2200.51,
      "cost_of_living_index": 88.0,
      "safe_savings_capacity": 4855.85,
      "sample_count": 60
    },
    "Uttar Pradesh": {
      "avg_gig_weekly_income": 6064.92,
      "income_std": 788.03,
      "avg_monthly_rent": 5953.56,
      "avg_monthly_food_utilities": 4757.99,
      "avg_transport_fuel": 4434.22,
      "avg_emi_burden": 2762.7,
      "cost_of_living_index": 101.2,
      "safe_savings_capacity": 5646.18,
      "sample_count": 300
    },
    "Uttarakhand": {
      "avg_gig_weekly_income": 6203.17,
      "income_std": 814.84,
      "avg_monthly_rent": 6034.27,
      "avg_monthly_food_utilities": 4822.02,
      "avg_transport_fuel": 4576.45,
      "avg_emi_burden": 2798.37,
      "cost_of_living_index": 102.0,
      "safe_savings_capacity": 5823.31,
      "sample_count": 60
    },
    "West Bengal": {
      "avg_gig_weekly_income": 6714.52,
      "income_std": 863.81,
      "avg_monthly_rent": 6754.11,
      "avg_monthly_food_utilities": 5200.12,
      "avg_transport_fuel": 4676.9,
      "avg_emi_burden": 2899.09,
      "cost_of_living_index": 110.0,
      "safe_savings_capacity": 6409.1,
      "sample_count": 60
    }
  },
  "city_baselines": {
    "Agartala": {
      "city": "Agartala",
      "state": "Tripura",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 4996.62,
      "income_std": 669.9,
      "avg_monthly_rent": 4425.76,
      "avg_monthly_food_utilities": 3990.37,
      "avg_transport_fuel": 3790.78,
      "avg_emi_burden": 2200.51,
      "cost_of_living_index": 88.0,
      "safe_savings_capacity": 4855.85,
      "platform_weekly_averages": {
        "delivery": 4671.41,
        "freelance_other": 5055.22,
        "mixed": 4982.73,
        "ride_hailing": 5277.12
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Agra": {
      "city": "Agra",
      "state": "Uttar Pradesh",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5431.79,
      "income_std": 696.44,
      "avg_monthly_rent": 4911.61,
      "avg_monthly_food_utilities": 4306.69,
      "avg_transport_fuel": 4102.68,
      "avg_emi_burden": 2497.83,
      "cost_of_living_index": 91.0,
      "safe_savings_capacity": 5192.3,
      "platform_weekly_averages": {
        "delivery": 5077.25,
        "freelance_other": 5493.21,
        "mixed": 5375.54,
        "ride_hailing": 5781.15
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Ahmedabad": {
      "city": "Ahmedabad",
      "state": "Gujarat",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 7028.16,
      "income_std": 892.16,
      "avg_monthly_rent": 7401.22,
      "avg_monthly_food_utilities": 5398.96,
      "avg_transport_fuel": 4870.18,
      "avg_emi_burden": 3062.38,
      "cost_of_living_index": 115.0,
      "safe_savings_capacity": 6518.64,
      "platform_weekly_averages": {
        "delivery": 6566.98,
        "freelance_other": 7157.7,
        "mixed": 7011.71,
        "ride_hailing": 7376.25
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Aizawl": {
      "city": "Aizawl",
      "state": "Mizoram",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5172.26,
      "income_std": 675.59,
      "avg_monthly_rent": 4696.38,
      "avg_monthly_food_utilities": 4211.6,
      "avg_transport_fuel": 4014.56,
      "avg_emi_burden": 2408.78,
      "cost_of_living_index": 91.0,
      "safe_savings_capacity": 4784.96,
      "platform_weekly_averages": {
        "delivery": 4892.43,
        "freelance_other": 5225.58,
        "mixed": 5155.91,
        "ride_hailing": 5415.12
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Amritsar": {
      "city": "Amritsar",
      "state": "Punjab",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5854.76,
      "income_std": 750.76,
      "avg_monthly_rent": 5369.61,
      "avg_monthly_food_utilities": 4508.15,
      "avg_transport_fuel": 4210.3,
      "avg_emi_burden": 2608.95,
      "cost_of_living_index": 96.0,
      "safe_savings_capacity": 5782.34,
      "platform_weekly_averages": {
        "delivery": 5491.01,
        "freelance_other": 5918.13,
        "mixed": 5887.48,
        "ride_hailing": 6122.45
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Belagavi": {
      "city": "Belagavi",
      "state": "Karnataka",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5089.59,
      "income_std": 645.4,
      "avg_monthly_rent": 4404.35,
      "avg_monthly_food_utilities": 4010.66,
      "avg_transport_fuel": 3819.9,
      "avg_emi_burden": 2293.11,
      "cost_of_living_index": 87.0,
      "safe_savings_capacity": 5036.15,
      "platform_weekly_averages": {
        "delivery": 4802.79,
        "freelance_other": 5156.92,
        "mixed": 5075.1,
        "ride_hailing": 5323.55
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Bengaluru": {
      "city": "Bengaluru",
      "state": "Karnataka",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 8227.98,
      "income_std": 1045.6,
      "avg_monthly_rent": 10474.42,
      "avg_monthly_food_utilities": 6470.6,
      "avg_transport_fuel": 5508.84,
      "avg_emi_burden": 3609.06,
      "cost_of_living_index": 138.0,
      "safe_savings_capacity": 6626.79,
      "platform_weekly_averages": {
        "delivery": 7730.61,
        "freelance_other": 8373.35,
        "mixed": 8222.84,
        "ride_hailing": 8585.1
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Bhopal": {
      "city": "Bhopal",
      "state": "Madhya Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5903.68,
      "income_std": 750.35,
      "avg_monthly_rent": 5303.59,
      "avg_monthly_food_utilities": 4462.7,
      "avg_transport_fuel": 4338.81,
      "avg_emi_burden": 2687.56,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5854.48,
      "platform_weekly_averages": {
        "delivery": 5518.97,
        "freelance_other": 5992.4,
        "mixed": 5916.64,
        "ride_hailing": 6186.69
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Bhubaneswar": {
      "city": "Bhubaneswar",
      "state": "Odisha",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5821.18,
      "income_std": 762.12,
      "avg_monthly_rent": 5378.13,
      "avg_monthly_food_utilities": 4558.99,
      "avg_transport_fuel": 4221.17,
      "avg_emi_burden": 2700.02,
      "cost_of_living_index": 96.0,
      "safe_savings_capacity": 5589.21,
      "platform_weekly_averages": {
        "delivery": 5504.94,
        "freelance_other": 5884.48,
        "mixed": 5778.48,
        "ride_hailing": 6116.82
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Chandigarh": {
      "city": "Chandigarh",
      "state": "Chandigarh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 7131.8,
      "income_std": 927.22,
      "avg_monthly_rent": 7190.66,
      "avg_monthly_food_utilities": 5501.5,
      "avg_transport_fuel": 4978.3,
      "avg_emi_burden": 3198.17,
      "cost_of_living_index": 116.0,
      "safe_savings_capacity": 6739.79,
      "platform_weekly_averages": {
        "delivery": 6725.7,
        "freelance_other": 7232.02,
        "mixed": 7074.39,
        "ride_hailing": 7495.1
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Chennai": {
      "city": "Chennai",
      "state": "Tamil Nadu",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 7363.53,
      "income_std": 955.02,
      "avg_monthly_rent": 8544.86,
      "avg_monthly_food_utilities": 5819.04,
      "avg_transport_fuel": 5055.95,
      "avg_emi_burden": 3189.64,
      "cost_of_living_index": 122.0,
      "safe_savings_capacity": 6333.93,
      "platform_weekly_averages": {
        "delivery": 6957.72,
        "freelance_other": 7417.33,
        "mixed": 7302.26,
        "ride_hailing": 7776.81
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Coimbatore": {
      "city": "Coimbatore",
      "state": "Tamil Nadu",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6285.14,
      "income_std": 840.78,
      "avg_monthly_rent": 6021.32,
      "avg_monthly_food_utilities": 4789.38,
      "avg_transport_fuel": 4423.0,
      "avg_emi_burden": 2819.43,
      "cost_of_living_index": 102.0,
      "safe_savings_capacity": 6141.58,
      "platform_weekly_averages": {
        "delivery": 5941.69,
        "freelance_other": 6391.97,
        "mixed": 6265.24,
        "ride_hailing": 6541.65
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Daman": {
      "city": "Daman",
      "state": "Dadra and Nagar Haveli and Daman and Diu",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5649.98,
      "income_std": 737.33,
      "avg_monthly_rent": 5191.06,
      "avg_monthly_food_utilities": 4396.85,
      "avg_transport_fuel": 4219.41,
      "avg_emi_burden": 2516.12,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5477.04,
      "platform_weekly_averages": {
        "delivery": 5288.3,
        "freelance_other": 5701.18,
        "mixed": 5623.5,
        "ride_hailing": 5986.93
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Dehradun": {
      "city": "Dehradun",
      "state": "Uttarakhand",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6203.17,
      "income_std": 814.84,
      "avg_monthly_rent": 6034.27,
      "avg_monthly_food_utilities": 4822.02,
      "avg_transport_fuel": 4576.45,
      "avg_emi_burden": 2798.37,
      "cost_of_living_index": 102.0,
      "safe_savings_capacity": 5823.31,
      "platform_weekly_averages": {
        "delivery": 5853.64,
        "freelance_other": 6287.1,
        "mixed": 6154.67,
        "ride_hailing": 6517.29
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Delhi": {
      "city": "Delhi",
      "state": "Delhi",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 8414.3,
      "income_std": 1115.75,
      "avg_monthly_rent": 10179.71,
      "avg_monthly_food_utilities": 6634.88,
      "avg_transport_fuel": 5739.95,
      "avg_emi_burden": 3602.61,
      "cost_of_living_index": 140.0,
      "safe_savings_capacity": 7066.21,
      "platform_weekly_averages": {
        "delivery": 7889.1,
        "freelance_other": 8521.58,
        "mixed": 8423.31,
        "ride_hailing": 8823.21
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Faridabad": {
      "city": "Faridabad",
      "state": "Haryana",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6593.38,
      "income_std": 860.03,
      "avg_monthly_rent": 6489.51,
      "avg_monthly_food_utilities": 5007.6,
      "avg_transport_fuel": 4640.62,
      "avg_emi_burden": 2983.82,
      "cost_of_living_index": 108.0,
      "safe_savings_capacity": 6313.11,
      "platform_weekly_averages": {
        "delivery": 6198.57,
        "freelance_other": 6670.54,
        "mixed": 6580.7,
        "ride_hailing": 6923.69
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Gangtok": {
      "city": "Gangtok",
      "state": "Sikkim",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5970.0,
      "income_std": 752.44,
      "avg_monthly_rent": 6006.67,
      "avg_monthly_food_utilities": 4833.95,
      "avg_transport_fuel": 4522.19,
      "avg_emi_burden": 2718.04,
      "cost_of_living_index": 102.0,
      "safe_savings_capacity": 5306.33,
      "platform_weekly_averages": {
        "delivery": 5592.17,
        "freelance_other": 6022.83,
        "mixed": 5962.98,
        "ride_hailing": 6302.01
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Gurugram": {
      "city": "Gurugram",
      "state": "Haryana",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 8522.83,
      "income_std": 1104.4,
      "avg_monthly_rent": 10808.0,
      "avg_monthly_food_utilities": 6690.8,
      "avg_transport_fuel": 5620.59,
      "avg_emi_burden": 3688.77,
      "cost_of_living_index": 142.0,
      "safe_savings_capacity": 6991.94,
      "platform_weekly_averages": {
        "delivery": 8018.15,
        "freelance_other": 8618.94,
        "mixed": 8461.36,
        "ride_hailing": 8992.86
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Guwahati": {
      "city": "Guwahati",
      "state": "Assam",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5753.22,
      "income_std": 733.65,
      "avg_monthly_rent": 5201.37,
      "avg_monthly_food_utilities": 4487.91,
      "avg_transport_fuel": 4335.95,
      "avg_emi_burden": 2594.63,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5585.58,
      "platform_weekly_averages": {
        "delivery": 5383.64,
        "freelance_other": 5825.71,
        "mixed": 5769.49,
        "ride_hailing": 6034.05
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Hubballi": {
      "city": "Hubballi",
      "state": "Karnataka",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5185.8,
      "income_std": 667.52,
      "avg_monthly_rent": 4505.3,
      "avg_monthly_food_utilities": 4112.04,
      "avg_transport_fuel": 3902.62,
      "avg_emi_burden": 2406.51,
      "cost_of_living_index": 88.0,
      "safe_savings_capacity": 5044.27,
      "platform_weekly_averages": {
        "delivery": 4875.5,
        "freelance_other": 5280.32,
        "mixed": 5100.13,
        "ride_hailing": 5487.26
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Hyderabad": {
      "city": "Hyderabad",
      "state": "Telangana",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 7664.38,
      "income_std": 962.58,
      "avg_monthly_rent": 8780.03,
      "avg_monthly_food_utilities": 5770.22,
      "avg_transport_fuel": 5067.66,
      "avg_emi_burden": 3441.06,
      "cost_of_living_index": 124.0,
      "safe_savings_capacity": 6870.11,
      "platform_weekly_averages": {
        "delivery": 7193.6,
        "freelance_other": 7758.17,
        "mixed": 7652.57,
        "ride_hailing": 8053.19
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Imphal": {
      "city": "Imphal",
      "state": "Manipur",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5095.57,
      "income_std": 662.06,
      "avg_monthly_rent": 4527.28,
      "avg_monthly_food_utilities": 4089.66,
      "avg_transport_fuel": 3908.17,
      "avg_emi_burden": 2291.0,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 4873.02,
      "platform_weekly_averages": {
        "delivery": 4801.62,
        "freelance_other": 5181.61,
        "mixed": 5048.39,
        "ride_hailing": 5350.65
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Indore": {
      "city": "Indore",
      "state": "Madhya Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6286.27,
      "income_std": 828.75,
      "avg_monthly_rent": 5895.48,
      "avg_monthly_food_utilities": 4787.94,
      "avg_transport_fuel": 4429.55,
      "avg_emi_burden": 2807.0,
      "cost_of_living_index": 101.0,
      "safe_savings_capacity": 6231.42,
      "platform_weekly_averages": {
        "delivery": 5905.34,
        "freelance_other": 6356.47,
        "mixed": 6231.98,
        "ride_hailing": 6651.29
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Itanagar": {
      "city": "Itanagar",
      "state": "Arunachal Pradesh",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 4998.02,
      "income_std": 626.6,
      "avg_monthly_rent": 4494.8,
      "avg_monthly_food_utilities": 4106.07,
      "avg_transport_fuel": 3883.97,
      "avg_emi_burden": 2184.29,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 4727.65,
      "platform_weekly_averages": {
        "delivery": 4662.91,
        "freelance_other": 5090.8,
        "mixed": 4966.37,
        "ride_hailing": 5272.0
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Jaipur": {
      "city": "Jaipur",
      "state": "Rajasthan",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6397.88,
      "income_std": 812.81,
      "avg_monthly_rent": 6210.31,
      "avg_monthly_food_utilities": 4919.83,
      "avg_transport_fuel": 4538.99,
      "avg_emi_burden": 2916.95,
      "cost_of_living_index": 104.0,
      "safe_savings_capacity": 6099.35,
      "platform_weekly_averages": {
        "delivery": 5941.82,
        "freelance_other": 6523.29,
        "mixed": 6394.95,
        "ride_hailing": 6731.47
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Jammu": {
      "city": "Jammu",
      "state": "Jammu and Kashmir",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5489.4,
      "income_std": 706.16,
      "avg_monthly_rent": 5111.92,
      "avg_monthly_food_utilities": 4409.29,
      "avg_transport_fuel": 4359.87,
      "avg_emi_burden": 2598.89,
      "cost_of_living_index": 94.0,
      "safe_savings_capacity": 4941.17,
      "platform_weekly_averages": {
        "delivery": 5112.02,
        "freelance_other": 5578.29,
        "mixed": 5467.81,
        "ride_hailing": 5799.48
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Jodhpur": {
      "city": "Jodhpur",
      "state": "Rajasthan",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5201.9,
      "income_std": 660.18,
      "avg_monthly_rent": 4711.05,
      "avg_monthly_food_utilities": 4211.76,
      "avg_transport_fuel": 4021.07,
      "avg_emi_burden": 2404.23,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 4877.32,
      "platform_weekly_averages": {
        "delivery": 4884.17,
        "freelance_other": 5256.74,
        "mixed": 5164.81,
        "ride_hailing": 5501.88
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Kanpur": {
      "city": "Kanpur",
      "state": "Uttar Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5644.07,
      "income_std": 744.09,
      "avg_monthly_rent": 5077.35,
      "avg_monthly_food_utilities": 4415.35,
      "avg_transport_fuel": 4233.97,
      "avg_emi_burden": 2604.86,
      "cost_of_living_index": 94.0,
      "safe_savings_capacity": 5426.32,
      "platform_weekly_averages": {
        "delivery": 5278.16,
        "freelance_other": 5707.15,
        "mixed": 5675.61,
        "ride_hailing": 5915.36
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Kavaratti": {
      "city": "Kavaratti",
      "state": "Lakshadweep",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5197.46,
      "income_std": 672.82,
      "avg_monthly_rent": 4811.9,
      "avg_monthly_food_utilities": 4302.88,
      "avg_transport_fuel": 4000.91,
      "avg_emi_burden": 2209.1,
      "cost_of_living_index": 92.0,
      "safe_savings_capacity": 4862.35,
      "platform_weekly_averages": {
        "delivery": 4855.6,
        "freelance_other": 5305.86,
        "mixed": 5204.92,
        "ride_hailing": 5423.49
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Kochi": {
      "city": "Kochi",
      "state": "Kerala",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6787.23,
      "income_std": 864.93,
      "avg_monthly_rent": 6687.98,
      "avg_monthly_food_utilities": 5285.34,
      "avg_transport_fuel": 4771.32,
      "avg_emi_burden": 3018.04,
      "cost_of_living_index": 112.0,
      "safe_savings_capacity": 6455.59,
      "platform_weekly_averages": {
        "delivery": 6306.99,
        "freelance_other": 6951.38,
        "mixed": 6791.92,
        "ride_hailing": 7098.61
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Kohima": {
      "city": "Kohima",
      "state": "Nagaland",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5178.79,
      "income_std": 668.4,
      "avg_monthly_rent": 4603.44,
      "avg_monthly_food_utilities": 4204.21,
      "avg_transport_fuel": 4026.91,
      "avg_emi_burden": 2301.67,
      "cost_of_living_index": 90.0,
      "safe_savings_capacity": 4912.99,
      "platform_weekly_averages": {
        "delivery": 4886.62,
        "freelance_other": 5248.0,
        "mixed": 5086.11,
        "ride_hailing": 5494.44
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Kolkata": {
      "city": "Kolkata",
      "state": "West Bengal",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 6714.52,
      "income_std": 863.81,
      "avg_monthly_rent": 6754.11,
      "avg_monthly_food_utilities": 5200.12,
      "avg_transport_fuel": 4676.9,
      "avg_emi_burden": 2899.09,
      "cost_of_living_index": 110.0,
      "safe_savings_capacity": 6409.1,
      "platform_weekly_averages": {
        "delivery": 6195.46,
        "freelance_other": 6792.17,
        "mixed": 6722.85,
        "ride_hailing": 7147.59
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Leh": {
      "city": "Leh",
      "state": "Ladakh",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5517.06,
      "income_std": 720.64,
      "avg_monthly_rent": 5626.75,
      "avg_monthly_food_utilities": 4691.27,
      "avg_transport_fuel": 4567.91,
      "avg_emi_burden": 2500.51,
      "cost_of_living_index": 99.0,
      "safe_savings_capacity": 4575.16,
      "platform_weekly_averages": {
        "delivery": 5121.76,
        "freelance_other": 5683.55,
        "mixed": 5447.43,
        "ride_hailing": 5815.51
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Lucknow": {
      "city": "Lucknow",
      "state": "Uttar Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6041.57,
      "income_std": 804.8,
      "avg_monthly_rent": 5792.95,
      "avg_monthly_food_utilities": 4672.03,
      "avg_transport_fuel": 4431.37,
      "avg_emi_burden": 2797.79,
      "cost_of_living_index": 99.0,
      "safe_savings_capacity": 5710.74,
      "platform_weekly_averages": {
        "delivery": 5676.31,
        "freelance_other": 6141.38,
        "mixed": 5965.78,
        "ride_hailing": 6382.83
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Ludhiana": {
      "city": "Ludhiana",
      "state": "Punjab",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6071.02,
      "income_std": 785.28,
      "avg_monthly_rent": 5601.63,
      "avg_monthly_food_utilities": 4602.02,
      "avg_transport_fuel": 4326.47,
      "avg_emi_burden": 2682.14,
      "cost_of_living_index": 98.0,
      "safe_savings_capacity": 6032.0,
      "platform_weekly_averages": {
        "delivery": 5743.16,
        "freelance_other": 6143.18,
        "mixed": 6052.77,
        "ride_hailing": 6344.97
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Madurai": {
      "city": "Madurai",
      "state": "Tamil Nadu",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5669.74,
      "income_std": 725.14,
      "avg_monthly_rent": 5180.74,
      "avg_monthly_food_utilities": 4393.6,
      "avg_transport_fuel": 4131.94,
      "avg_emi_burden": 2586.38,
      "cost_of_living_index": 92.0,
      "safe_savings_capacity": 5525.64,
      "platform_weekly_averages": {
        "delivery": 5295.76,
        "freelance_other": 5724.45,
        "mixed": 5663.28,
        "ride_hailing": 5995.47
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Mumbai": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 8855.82,
      "income_std": 1204.83,
      "avg_monthly_rent": 13539.51,
      "avg_monthly_food_utilities": 7232.09,
      "avg_transport_fuel": 5831.76,
      "avg_emi_burden": 3798.62,
      "cost_of_living_index": 155.0,
      "safe_savings_capacity": 6029.22,
      "platform_weekly_averages": {
        "delivery": 8377.94,
        "freelance_other": 9040.82,
        "mixed": 8809.58,
        "ride_hailing": 9194.94
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Mysuru": {
      "city": "Mysuru",
      "state": "Karnataka",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5933.36,
      "income_std": 775.34,
      "avg_monthly_rent": 5592.81,
      "avg_monthly_food_utilities": 4619.7,
      "avg_transport_fuel": 4234.34,
      "avg_emi_burden": 2699.45,
      "cost_of_living_index": 98.0,
      "safe_savings_capacity": 5722.28,
      "platform_weekly_averages": {
        "delivery": 5552.2,
        "freelance_other": 6083.06,
        "mixed": 5880.12,
        "ride_hailing": 6218.08
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Nagpur": {
      "city": "Nagpur",
      "state": "Maharashtra",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5848.01,
      "income_std": 748.81,
      "avg_monthly_rent": 5354.9,
      "avg_monthly_food_utilities": 4491.83,
      "avg_transport_fuel": 4342.99,
      "avg_emi_burden": 2708.55,
      "cost_of_living_index": 96.0,
      "safe_savings_capacity": 5650.24,
      "platform_weekly_averages": {
        "delivery": 5459.94,
        "freelance_other": 5914.47,
        "mixed": 5816.77,
        "ride_hailing": 6200.89
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Nashik": {
      "city": "Nashik",
      "state": "Maharashtra",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5722.18,
      "income_std": 744.16,
      "avg_monthly_rent": 5300.07,
      "avg_monthly_food_utilities": 4394.69,
      "avg_transport_fuel": 4205.23,
      "avg_emi_burden": 2581.49,
      "cost_of_living_index": 95.0,
      "safe_savings_capacity": 5540.12,
      "platform_weekly_averages": {
        "delivery": 5378.65,
        "freelance_other": 5811.71,
        "mixed": 5702.91,
        "ride_hailing": 5995.44
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Noida": {
      "city": "Noida",
      "state": "Uttar Pradesh",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 7934.69,
      "income_std": 1023.44,
      "avg_monthly_rent": 9179.5,
      "avg_monthly_food_utilities": 6223.05,
      "avg_transport_fuel": 5375.6,
      "avg_emi_burden": 3511.73,
      "cost_of_living_index": 132.0,
      "safe_savings_capacity": 6897.47,
      "platform_weekly_averages": {
        "delivery": 7415.04,
        "freelance_other": 8038.07,
        "mixed": 7931.75,
        "ride_hailing": 8353.88
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Panaji": {
      "city": "Panaji",
      "state": "Goa",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6921.1,
      "income_std": 906.09,
      "avg_monthly_rent": 7501.09,
      "avg_monthly_food_utilities": 5581.97,
      "avg_transport_fuel": 4873.03,
      "avg_emi_burden": 3104.71,
      "cost_of_living_index": 118.0,
      "safe_savings_capacity": 6091.26,
      "platform_weekly_averages": {
        "delivery": 6407.95,
        "freelance_other": 7032.59,
        "mixed": 6884.31,
        "ride_hailing": 7359.55
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Patna": {
      "city": "Patna",
      "state": "Bihar",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5501.48,
      "income_std": 689.05,
      "avg_monthly_rent": 5008.19,
      "avg_monthly_food_utilities": 4416.87,
      "avg_transport_fuel": 4133.56,
      "avg_emi_burden": 2497.75,
      "cost_of_living_index": 93.0,
      "safe_savings_capacity": 5228.94,
      "platform_weekly_averages": {
        "delivery": 5171.52,
        "freelance_other": 5586.87,
        "mixed": 5492.41,
        "ride_hailing": 5755.13
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Port Blair": {
      "city": "Port Blair",
      "state": "Andaman and Nicobar Islands",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5821.84,
      "income_std": 752.76,
      "avg_monthly_rent": 6185.96,
      "avg_monthly_food_utilities": 5106.73,
      "avg_transport_fuel": 4679.9,
      "avg_emi_burden": 2614.51,
      "cost_of_living_index": 105.0,
      "safe_savings_capacity": 4654.08,
      "platform_weekly_averages": {
        "delivery": 5468.16,
        "freelance_other": 5935.23,
        "mixed": 5737.11,
        "ride_hailing": 6146.87
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Puducherry": {
      "city": "Puducherry",
      "state": "Puducherry",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6162.21,
      "income_std": 800.2,
      "avg_monthly_rent": 5929.5,
      "avg_monthly_food_utilities": 4680.59,
      "avg_transport_fuel": 4340.48,
      "avg_emi_burden": 2679.11,
      "cost_of_living_index": 101.0,
      "safe_savings_capacity": 6047.41,
      "platform_weekly_averages": {
        "delivery": 5807.98,
        "freelance_other": 6197.79,
        "mixed": 6179.37,
        "ride_hailing": 6463.71
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Pune": {
      "city": "Pune",
      "state": "Maharashtra",
      "city_tier": "Tier 1",
      "avg_gig_weekly_income": 7711.53,
      "income_std": 964.79,
      "avg_monthly_rent": 9000.42,
      "avg_monthly_food_utilities": 5900.11,
      "avg_transport_fuel": 5174.6,
      "avg_emi_burden": 3286.38,
      "cost_of_living_index": 125.0,
      "safe_savings_capacity": 6842.89,
      "platform_weekly_averages": {
        "delivery": 7298.5,
        "freelance_other": 7824.65,
        "mixed": 7644.25,
        "ride_hailing": 8078.72
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Raipur": {
      "city": "Raipur",
      "state": "Chhattisgarh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5512.53,
      "income_std": 722.53,
      "avg_monthly_rent": 4991.17,
      "avg_monthly_food_utilities": 4325.9,
      "avg_transport_fuel": 4109.14,
      "avg_emi_burden": 2524.8,
      "cost_of_living_index": 92.0,
      "safe_savings_capacity": 5321.26,
      "platform_weekly_averages": {
        "delivery": 5197.18,
        "freelance_other": 5620.28,
        "mixed": 5465.87,
        "ride_hailing": 5766.78
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Ranchi": {
      "city": "Ranchi",
      "state": "Jharkhand",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5420.47,
      "income_std": 699.97,
      "avg_monthly_rent": 4903.24,
      "avg_monthly_food_utilities": 4279.4,
      "avg_transport_fuel": 4110.12,
      "avg_emi_burden": 2492.23,
      "cost_of_living_index": 91.0,
      "safe_savings_capacity": 5175.27,
      "platform_weekly_averages": {
        "delivery": 5105.09,
        "freelance_other": 5504.32,
        "mixed": 5357.07,
        "ride_hailing": 5715.38
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Salem": {
      "city": "Salem",
      "state": "Tamil Nadu",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5206.15,
      "income_std": 697.41,
      "avg_monthly_rent": 4624.81,
      "avg_monthly_food_utilities": 4092.93,
      "avg_transport_fuel": 3921.62,
      "avg_emi_burden": 2393.89,
      "cost_of_living_index": 88.0,
      "safe_savings_capacity": 5047.8,
      "platform_weekly_averages": {
        "delivery": 4878.29,
        "freelance_other": 5260.45,
        "mixed": 5176.65,
        "ride_hailing": 5509.19
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Shillong": {
      "city": "Shillong",
      "state": "Meghalaya",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5724.64,
      "income_std": 765.23,
      "avg_monthly_rent": 5528.43,
      "avg_monthly_food_utilities": 4613.94,
      "avg_transport_fuel": 4340.83,
      "avg_emi_burden": 2599.96,
      "cost_of_living_index": 97.0,
      "safe_savings_capacity": 5220.61,
      "platform_weekly_averages": {
        "delivery": 5397.58,
        "freelance_other": 5845.01,
        "mixed": 5678.57,
        "ride_hailing": 5977.41
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Shimla": {
      "city": "Shimla",
      "state": "Himachal Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6071.1,
      "income_std": 770.56,
      "avg_monthly_rent": 6089.27,
      "avg_monthly_food_utilities": 4882.14,
      "avg_transport_fuel": 4663.62,
      "avg_emi_burden": 2790.1,
      "cost_of_living_index": 103.0,
      "safe_savings_capacity": 5382.91,
      "platform_weekly_averages": {
        "delivery": 5725.59,
        "freelance_other": 6122.92,
        "mixed": 6030.64,
        "ride_hailing": 6405.24
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Srinagar": {
      "city": "Srinagar",
      "state": "Jammu and Kashmir",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5600.52,
      "income_std": 730.02,
      "avg_monthly_rent": 5306.8,
      "avg_monthly_food_utilities": 4500.39,
      "avg_transport_fuel": 4453.37,
      "avg_emi_burden": 2606.56,
      "cost_of_living_index": 96.0,
      "safe_savings_capacity": 5046.71,
      "platform_weekly_averages": {
        "delivery": 5236.59,
        "freelance_other": 5663.96,
        "mixed": 5575.68,
        "ride_hailing": 5925.84
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Surat": {
      "city": "Surat",
      "state": "Gujarat",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6522.92,
      "income_std": 864.76,
      "avg_monthly_rent": 6149.79,
      "avg_monthly_food_utilities": 4907.19,
      "avg_transport_fuel": 4535.59,
      "avg_emi_burden": 2894.42,
      "cost_of_living_index": 105.0,
      "safe_savings_capacity": 6508.19,
      "platform_weekly_averages": {
        "delivery": 6104.39,
        "freelance_other": 6618.47,
        "mixed": 6452.27,
        "ride_hailing": 6916.56
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Thiruvananthapuram": {
      "city": "Thiruvananthapuram",
      "state": "Kerala",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6402.88,
      "income_std": 839.49,
      "avg_monthly_rent": 6145.28,
      "avg_monthly_food_utilities": 5032.88,
      "avg_transport_fuel": 4548.72,
      "avg_emi_burden": 2896.88,
      "cost_of_living_index": 106.0,
      "safe_savings_capacity": 6111.3,
      "platform_weekly_averages": {
        "delivery": 5977.26,
        "freelance_other": 6519.91,
        "mixed": 6386.91,
        "ride_hailing": 6727.42
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Tiruchirappalli": {
      "city": "Tiruchirappalli",
      "state": "Tamil Nadu",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5312.69,
      "income_std": 695.48,
      "avg_monthly_rent": 4682.73,
      "avg_monthly_food_utilities": 4178.19,
      "avg_transport_fuel": 4025.09,
      "avg_emi_burden": 2387.32,
      "cost_of_living_index": 89.0,
      "safe_savings_capacity": 5189.45,
      "platform_weekly_averages": {
        "delivery": 4999.69,
        "freelance_other": 5430.34,
        "mixed": 5326.99,
        "ride_hailing": 5493.75
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Vadodara": {
      "city": "Vadodara",
      "state": "Gujarat",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5970.32,
      "income_std": 753.91,
      "avg_monthly_rent": 5489.71,
      "avg_monthly_food_utilities": 4605.85,
      "avg_transport_fuel": 4344.07,
      "avg_emi_burden": 2707.92,
      "cost_of_living_index": 97.0,
      "safe_savings_capacity": 5820.65,
      "platform_weekly_averages": {
        "delivery": 5632.55,
        "freelance_other": 6048.42,
        "mixed": 5956.94,
        "ride_hailing": 6243.39
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Varanasi": {
      "city": "Varanasi",
      "state": "Uttar Pradesh",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5272.5,
      "income_std": 671.38,
      "avg_monthly_rent": 4806.4,
      "avg_monthly_food_utilities": 4172.81,
      "avg_transport_fuel": 4027.5,
      "avg_emi_burden": 2401.3,
      "cost_of_living_index": 90.0,
      "safe_savings_capacity": 5004.06,
      "platform_weekly_averages": {
        "delivery": 4950.1,
        "freelance_other": 5339.54,
        "mixed": 5254.42,
        "ride_hailing": 5545.93
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Vijayawada": {
      "city": "Vijayawada",
      "state": "Andhra Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 5946.71,
      "income_std": 742.78,
      "avg_monthly_rent": 5516.38,
      "avg_monthly_food_utilities": 4599.79,
      "avg_transport_fuel": 4311.66,
      "avg_emi_burden": 2704.97,
      "cost_of_living_index": 97.0,
      "safe_savings_capacity": 5777.56,
      "platform_weekly_averages": {
        "delivery": 5559.61,
        "freelance_other": 6052.15,
        "mixed": 5942.56,
        "ride_hailing": 6232.51
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Visakhapatnam": {
      "city": "Visakhapatnam",
      "state": "Andhra Pradesh",
      "city_tier": "Tier 2",
      "avg_gig_weekly_income": 6168.34,
      "income_std": 805.57,
      "avg_monthly_rent": 5808.07,
      "avg_monthly_food_utilities": 4692.69,
      "avg_transport_fuel": 4429.55,
      "avg_emi_burden": 2819.57,
      "cost_of_living_index": 100.0,
      "safe_savings_capacity": 6008.17,
      "platform_weekly_averages": {
        "delivery": 5786.83,
        "freelance_other": 6289.39,
        "mixed": 6124.19,
        "ride_hailing": 6472.97
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    },
    "Warangal": {
      "city": "Warangal",
      "state": "Telangana",
      "city_tier": "Tier 3",
      "avg_gig_weekly_income": 5069.62,
      "income_std": 669.26,
      "avg_monthly_rent": 4472.24,
      "avg_monthly_food_utilities": 4097.8,
      "avg_transport_fuel": 3899.22,
      "avg_emi_burden": 2304.65,
      "cost_of_living_index": 88.0,
      "safe_savings_capacity": 4824.81,
      "platform_weekly_averages": {
        "delivery": 4752.25,
        "freelance_other": 5104.09,
        "mixed": 5077.55,
        "ride_hailing": 5344.57
      },
      "sample_count": 60,
      "synthetic": true,
      "source": "FINNA Illustrative Benchmark Survey 2026 (Synthetic)",
      "year": 2026
    }
  }
};

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
  model_version?: string
  data_source_badge?: "ml_estimate" | "city_average" | "synthetic"
  confidence_level?: string
  fallback_applied?: boolean
  data_source?: string
  data_year?: number
  user_edited?: {
    income?: boolean
    rent?: boolean
    emi?: boolean
  }
}

export function hasCityData(state?: string, city?: string): boolean {
  if (!city) return false
  const normCity = city.trim()
  return normCity in CITY_BASELINES_DATA.city_baselines
}

export function computeLocalFallbackProfile(
  stateOrOptions: string | { state?: string; city?: string; platform?: string; hours?: number; name?: string },
  cityArg?: string,
  platformArg: string = "delivery",
  hoursArg: number = 45
): EstimatedFinancialProfile {
  let state = ""
  let city = ""
  let platform = "delivery"
  let hours = 45

  if (typeof stateOrOptions === "object" && stateOrOptions !== null) {
    state = stateOrOptions.state || ""
    city = stateOrOptions.city || ""
    platform = stateOrOptions.platform || "delivery"
    hours = stateOrOptions.hours ?? 45
  } else {
    state = stateOrOptions || ""
    city = cityArg || ""
    platform = platformArg || "delivery"
    hours = hoursArg ?? 45
  }

  const normCity = (city || "").trim()
  const normState = (state || "").trim()
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
    model_version: "v1.0.0-xgb-city",
    data_source_badge: isSynthetic ? "synthetic" : "city_average",
    confidence_level: isKnownCity ? "high" : "fallback",
    fallback_applied: !isKnownCity,
    data_source: dataSource,
    data_year: dataYear,
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
