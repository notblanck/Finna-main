"use client"

import { EstimatedFinancialProfile, computeLocalFallbackProfile } from "./city-baselines"
export type { EstimatedFinancialProfile } from "./city-baselines"
import { getArunMasterData, updateArunMasterData } from "./arun-master"
import { getFutureGigData, updateFutureGigData } from "./gig-data-layer"

const ESTIMATE_PROFILE_KEY = "finna_estimate_profile"
const ESTIMATE_MODE_KEY = "finna_estimate_mode"
const USER_KEY = "finna_user"

export function getStoredEstimatedProfile(): EstimatedFinancialProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ESTIMATE_PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EstimatedFinancialProfile
  } catch {
    return null
  }
}

export const getEstimatedFinancialProfile = getStoredEstimatedProfile

export function saveEstimatedProfile(
  profile: EstimatedFinancialProfile,
  userName?: string
): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ESTIMATE_PROFILE_KEY, JSON.stringify(profile))
    localStorage.setItem(ESTIMATE_MODE_KEY, "true")
    document.cookie = "finna_estimate_mode=true; path=/; max-age=31536000; SameSite=Lax"

    // Update guest user storage
    const existingUser = localStorage.getItem(USER_KEY)
    let parsedUser: any = {}
    try {
      if (existingUser) parsedUser = JSON.parse(existingUser)
    } catch {}

    const resolvedName = userName?.trim() || parsedUser.name || parsedUser.full_name || "Friend"
    parsedUser.name = resolvedName
    parsedUser.full_name = resolvedName
    parsedUser.city = profile.inputs.city
    parsedUser.state = profile.inputs.state
    parsedUser.platform = profile.inputs.platform
    parsedUser.hours = profile.inputs.hours
    parsedUser.onboarding_complete = true
    parsedUser.is_estimate_mode = true

    localStorage.setItem(USER_KEY, JSON.stringify(parsedUser))

    // Sync into authoritative engine models
    syncProfileToAuthoritativeEngine(profile, resolvedName)
  } catch (err) {
    console.error("Failed to persist estimated financial profile:", err)
  }
}

export function syncProfileToAuthoritativeEngine(
  profile: EstimatedFinancialProfile,
  userName: string
): void {
  try {
    const master = getArunMasterData()

    // 1. Update Profile & Obligations in Authoritative Master Model
    const rentAmount = profile.typical_rent.expected
    const emiAmount = profile.monthly_expenses.emi_burden

    const updatedObligations = master.obligations.map((o) => {
      if (o.type === "rent") return { ...o, amount: Math.round(rentAmount) }
      if (o.type === "emi") return { ...o, amount: Math.round(emiAmount) }
      return o
    })

    updateArunMasterData({
      profile: {
        ...master.profile,
        fullName: userName,
        city: profile.inputs.city,
        state: profile.inputs.state,
      },
      obligations: updatedObligations,
    })

    // 2. Update Gig Layer Model
    const gig = getFutureGigData()
    const monthlyNet = Math.round(profile.monthly_income.expected)
    const weeklyAvg = Math.round(profile.weekly_income.expected)

    const updatedPlatforms = gig.platforms.map((p, idx) => {
      if (idx === 0) {
        return {
          ...p,
          monthlyNetEarnings: Math.round(monthlyNet * 0.6),
          weeklyEarningsAvg: Math.round(weeklyAvg * 0.6),
        }
      }
      return {
        ...p,
        monthlyNetEarnings: Math.round(monthlyNet * 0.4),
        weeklyEarningsAvg: Math.round(weeklyAvg * 0.4),
      }
    })

    updateFutureGigData({
      platforms: updatedPlatforms,
      aggregate: {
        ...gig.aggregate,
        totalNetMonthly: monthlyNet,
        totalGrossMonthly: Math.round(monthlyNet * 1.1),
        totalWeeklyAvg: weeklyAvg,
      },
    })

    // Notify listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finna_data_updated"))
      window.dispatchEvent(new CustomEvent("finna_profile_updated", { detail: profile }))
    }
  } catch (err) {
    console.warn("Failed to sync profile to authoritative engine:", err)
  }
}

export function updateEstimatedField(
  field: "income" | "rent" | "emi",
  newValue: number
): EstimatedFinancialProfile | null {
  const current = getStoredEstimatedProfile()
  if (!current) return null

  const profile = { ...current }
  profile.user_edited = profile.user_edited || {}

  if (field === "income") {
    // newValue is monthly income
    profile.user_edited.income = true
    const monthly = Math.max(5000, Math.round(newValue))
    const weekly = Math.round(monthly / 4.33)
    const std = profile.weekly_income.std || Math.round(weekly * 0.12)
    profile.monthly_income = {
      expected: monthly,
      low: Math.max(3000, Math.round((weekly - 1.4 * std) * 4.33)),
      high: Math.round((weekly + 1.5 * std) * 4.33),
    }
    profile.weekly_income = {
      expected: weekly,
      low: Math.max(1200, Math.round(weekly - 1.4 * std)),
      high: Math.round(weekly + 1.5 * std),
      std,
    }
  } else if (field === "rent") {
    profile.user_edited.rent = true
    const rent = Math.max(1000, Math.round(newValue))
    profile.typical_rent = {
      expected: rent,
      low: Math.max(800, Math.round(rent * 0.85)),
      high: Math.round(rent * 1.15),
    }
    profile.monthly_expenses.rent = rent
  } else if (field === "emi") {
    profile.user_edited.emi = true
    const emi = Math.max(0, Math.round(newValue))
    profile.monthly_expenses.emi_burden = emi
  }

  // Recalculate totals
  const rent = profile.typical_rent.expected
  const food = profile.monthly_expenses.food_utilities
  const fuel = profile.monthly_expenses.transport_fuel
  const emi = profile.monthly_expenses.emi_burden
  profile.monthly_expenses.total = rent + food + fuel + emi

  const monthlyInc = profile.monthly_income.expected
  const weeklyInc = profile.weekly_income.expected
  const dailyInc = weeklyInc / 6
  const dailyFixed = (rent + emi) / 30
  profile.safe_to_spend_today = Math.max(0, Math.round((dailyInc * 0.72) - (dailyFixed * 0.6)))

  const surplus = Math.max(500, monthlyInc - profile.monthly_expenses.total)
  profile.safe_savings_capacity = Math.round(surplus * 0.65)

  // Persist updated profile
  const storedUser = localStorage.getItem(USER_KEY)
  let name = "Friend"
  try {
    if (storedUser) name = JSON.parse(storedUser).name || "Friend"
  } catch {}

  saveEstimatedProfile(profile, name)
  return profile
}

export function getUserDisplayName(): string {
  if (typeof window === "undefined") return "Friend"
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      const u = JSON.parse(raw)
      const n = u.name || u.full_name
      if (n && typeof n === "string" && n.trim()) {
        return n.trim().split(" ")[0]
      }
    }
    const master = getArunMasterData()
    if (master.profile?.fullName) {
      return master.profile.fullName.split(" ")[0]
    }
  } catch {}
  return "Friend"
}

export function getUserFullName(): string {
  if (typeof window === "undefined") return "Friend"
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      const u = JSON.parse(raw)
      const n = u.name || u.full_name
      if (n && typeof n === "string" && n.trim()) {
        return n.trim()
      }
    }
    const master = getArunMasterData()
    if (master.profile?.fullName) {
      return master.profile.fullName
    }
  } catch {}
  return "Friend"
}

export function isEstimateModeActive(): boolean {
  if (typeof window === "undefined") return false
  try {
    const hasAA =
      localStorage.getItem("finna_active_aa_consent") !== null ||
      localStorage.getItem("finna_aa_complete") === "true" ||
      document.cookie.includes("finna_aa_complete=true")
    if (hasAA) return false

    return (
      localStorage.getItem(ESTIMATE_MODE_KEY) === "true" ||
      localStorage.getItem(ESTIMATE_PROFILE_KEY) !== null
    )
  } catch {
    return false
  }
}
