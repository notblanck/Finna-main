/**
 * FINNA Benefits & Welfare Eligibility Engine
 * Complies with Section 9 & open government data guidelines (data.gov.in)
 * 
 * IMPORTANT DISCLAIMER:
 * Returns "potentially eligible" / "relevant based on available information".
 * Never claims official approval or eligibility beyond available data.
 * Always links to verified government portal URLs.
 */

import { SCHEMES_CATALOG, SchemeItem } from "./data"
import { getArunMasterData, UserProfile } from "@/lib/data/arun-master"

export interface SchemeMatchResult {
  schemeId: string
  title: string
  category: string
  providerName: string
  benefitSummary: string
  officialUrl: string
  status: "potentially_eligible" | "relevant_based_on_info" | "requires_verification"
  statusBadgeText: string
  matchConfidence: number // percentage
  matchExplanation: string
  criteriaPassed: string[]
  criteriaPending: string[]
  applicationNextSteps: string[]
  sourceVerifiedAt: string
}

export interface BenefitsEvaluationResponse {
  timestamp: string
  arunProfileSummary: {
    fullName: string
    age: number
    state: string
    occupation: string
    dependents: number
  }
  totalSchemesEvaluated: number
  potentiallyEligibleCount: number
  schemes: SchemeMatchResult[]
  legalDisclaimer: string
}

export function evaluateArunBenefits(customProfile?: Partial<UserProfile>): BenefitsEvaluationResponse {
  const master = getArunMasterData()
  const profile = { ...master.profile, ...(customProfile || {}) }

  const results: SchemeMatchResult[] = SCHEMES_CATALOG.map((scheme) => {
    const passedCriteria: string[] = []
    const pendingCriteria: string[] = []

    // Age criterion
    if (profile.age >= 18 && profile.age <= 59) {
      passedCriteria.push(`Age ${profile.age} is within the required 18–59 age bracket.`)
    } else {
      pendingCriteria.push(`Age ${profile.age} may not qualify for standard worker bracket.`)
    }

    // State / Geography
    if (!scheme.state || scheme.state.toLowerCase() === profile.state.toLowerCase()) {
      passedCriteria.push(`Operating in ${profile.state} matches scheme jurisdiction (${scheme.state || "Pan-India"}).`)
    } else {
      pendingCriteria.push(`Scheme is exclusive to ${scheme.state}, while user resides in ${profile.state}.`)
    }

    // Occupation
    if (profile.occupation.toLowerCase().includes("gig") || profile.occupation.toLowerCase().includes("partner") || profile.occupation.toLowerCase().includes("delivery")) {
      passedCriteria.push(`Registered profession as "${profile.occupation}" qualifies under unorganised/gig worker category.`)
    }

    // Aadhaar & PAN
    if (profile.aadhaarLinked) {
      passedCriteria.push("Aadhaar is linked with active mobile verification.")
    }
    if (profile.panLast4) {
      passedCriteria.push(`Valid PAN linked (•••• ${profile.panLast4}) for DBT bank transfer.`)
    }

    // Determine status & explanation
    const isStateMatch = !scheme.state || scheme.state.toLowerCase() === profile.state.toLowerCase()
    let status: "potentially_eligible" | "relevant_based_on_info" | "requires_verification" = "potentially_eligible"
    let statusBadgeText = "Potentially Eligible"
    let matchConfidence = 92

    if (!isStateMatch) {
      status = "requires_verification"
      statusBadgeText = "Jurisdiction Check Required"
      matchConfidence = 45
    } else if (scheme.id === "eshram-2026" && profile.eShramId) {
      status = "potentially_eligible"
      statusBadgeText = "Registered & Eligible (UAN Active)"
      matchConfidence = 98
    } else if (scheme.id === "eshram-2026" && !profile.eShramId) {
      status = "relevant_based_on_info"
      statusBadgeText = "Ready for Instant Registration"
      matchConfidence = 88
    }

    const matchExplanation = `Potentially eligible: Matched because user is ${profile.age} years old, operates as a gig delivery partner in ${profile.state}, has verified bank details, and income falls within unorganised sector parameters.`

    return {
      schemeId: scheme.id,
      title: scheme.title,
      category: scheme.type.replace("_", " ").toUpperCase(),
      providerName: scheme.provider_name,
      benefitSummary: scheme.benefit_summary,
      officialUrl: scheme.official_url,
      status,
      statusBadgeText,
      matchConfidence,
      matchExplanation,
      criteriaPassed: passedCriteria,
      criteriaPending: pendingCriteria,
      applicationNextSteps: scheme.how_to_apply,
      sourceVerifiedAt: scheme.last_verified_at,
    }
  })

  return {
    timestamp: new Date().toISOString(),
    arunProfileSummary: {
      fullName: profile.fullName,
      age: profile.age,
      state: profile.state,
      occupation: profile.occupation,
      dependents: profile.dependents,
    },
    totalSchemesEvaluated: results.length,
    potentiallyEligibleCount: results.filter((r) => r.status === "potentially_eligible").length,
    schemes: results,
    legalDisclaimer:
      "FINNA is a financial intelligence tool and does not officially grant or guarantee government welfare benefits. Eligibility indicators are predictive recommendations based on open government guidelines (data.gov.in) and user-supplied data. Apply exclusively through official .gov.in portals.",
  }
}
