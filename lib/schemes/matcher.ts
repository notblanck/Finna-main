import { SCHEMES_CATALOG, SchemeItem } from "./data"

export interface EvaluatedScheme {
  scheme: SchemeItem
  status: "eligible" | "likely_eligible" | "not_eligible"
  score: number // 0-100 match percentage
  checklist: {
    key: string
    text: string
    passed: boolean
    missingInfo?: boolean
  }[]
  missingFieldPrompt?: string
}

export function evaluateUserSchemes(userProfile: any = {}): {
  eligible: EvaluatedScheme[]
  likelyEligible: EvaluatedScheme[]
  allSchemes: EvaluatedScheme[]
} {
  const profile = {
    platforms: userProfile.platforms || ["swiggy", "uber"],
    city: userProfile.city || "Chennai",
    state: userProfile.state || "Tamil Nadu",
    annual_income_estimate: userProfile.annual_income_estimate || 336000,
    vehicle_type: userProfile.vehicle_type || "two_wheeler",
    has_own_vehicle: userProfile.has_own_vehicle ?? true,
    aadhaar_linked: userProfile.aadhaar_linked ?? true,
    e_shram_id: userProfile.e_shram_id,
    ...userProfile,
  }

  const evaluated: EvaluatedScheme[] = SCHEMES_CATALOG.map((scheme) => {
    let passedCount = 0
    let missingInfoCount = 0

    const checklist = scheme.criteria.map((c) => {
      const passed = c.evaluate(profile)
      let missingInfo = false

      if (c.key === "aadhaar" && profile.aadhaar_linked === undefined) {
        missingInfo = true
      }
      if (c.key === "state" && !profile.state) {
        missingInfo = true
      }

      if (passed) passedCount++
      if (missingInfo) missingInfoCount++

      return {
        key: c.key,
        text: c.text,
        passed,
        missingInfo,
      }
    })

    const total = scheme.criteria.length
    const score = total > 0 ? Math.round((passedCount / total) * 100) : 100

    let status: "eligible" | "likely_eligible" | "not_eligible" = "eligible"
    let missingFieldPrompt: string | undefined

    if (passedCount === total) {
      status = "eligible"
    } else if (missingInfoCount > 0 || score >= 60) {
      status = "likely_eligible"
      if (!profile.e_shram_id && scheme.id === "eshram-2026") {
        missingFieldPrompt = "Register on e-Shram to activate your ₹2 Lakh PMSBY accidental insurance cover."
      } else if (!profile.state) {
        missingFieldPrompt = "Set your operating state to confirm state-specific welfare grants."
      } else {
        missingFieldPrompt = "Verify your linked gig ID to claim this benefit immediately."
      }
    } else {
      status = "not_eligible"
    }

    return {
      scheme,
      status,
      score,
      checklist,
      missingFieldPrompt,
    }
  })

  return {
    eligible: evaluated.filter((s) => s.status === "eligible"),
    likelyEligible: evaluated.filter((s) => s.status === "likely_eligible"),
    allSchemes: evaluated,
  }
}
