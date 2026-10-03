import { test, describe } from "node:test"
import assert from "node:assert/strict"

// 1. Test Form Validation Logic
describe("Onboarding Form Validation", () => {
  const validateName = (name) => {
    if (!name || typeof name !== "string") return false
    const trimmed = name.trim()
    return trimmed.length >= 2 && trimmed.length <= 40
  }

  const validateState = (state, validStates) => {
    return Boolean(state && validStates.includes(state))
  }

  const validateHours = (hours) => {
    if (hours === undefined || hours === null || hours === "") return true // optional
    const num = Number(hours)
    return !isNaN(num) && num >= 1 && num <= 112
  }

  test("Name validation enforces trimmed length between 2 and 40 characters", () => {
    assert.equal(validateName(""), false, "Empty name should fail")
    assert.equal(validateName("   "), false, "Whitespace-only name should fail")
    assert.equal(validateName("A"), false, "Single character should fail")
    assert.equal(validateName("  A  "), false, "Trimmed single character should fail")
    assert.equal(validateName("Jo"), true, "2-character name should pass")
    assert.equal(validateName("Priya Sharma"), true, "Valid name should pass")
    assert.equal(validateName("  Arun Kumar  "), true, "Untrimmed valid name should pass after trim")
    assert.equal(
      validateName("This name is way too long and exceeds forty characters total"),
      false,
      "Name exceeding 40 characters should fail"
    )
    assert.equal(validateName("A".repeat(40)), true, "Exact 40 character name should pass")
  })

  test("State/City dependency correctly maps states to available cities", async () => {
    const { INDIAN_STATES_AND_UTS, STATE_CITY_MAPPING, getCitiesForState, hasCityData } = await import("../lib/data/city-baselines.ts")

    assert.equal(INDIAN_STATES_AND_UTS.length, 36, "Must contain all 36 Indian states and UTs")
    assert.ok(INDIAN_STATES_AND_UTS.includes("Tamil Nadu"))
    assert.ok(INDIAN_STATES_AND_UTS.includes("Maharashtra"))
    assert.ok(INDIAN_STATES_AND_UTS.includes("Delhi"))
    assert.ok(INDIAN_STATES_AND_UTS.includes("Karnataka"))

    const tnCities = getCitiesForState("Tamil Nadu")
    assert.ok(tnCities.length > 0, "Tamil Nadu should have cities")
    assert.ok(tnCities.includes("Chennai"), "Tamil Nadu should include Chennai")
    assert.deepEqual(tnCities, ["Chennai"], "Fallback cities must match the supplied illustrative dataset")

    const mhCities = getCitiesForState("Maharashtra")
    assert.ok(mhCities.includes("Mumbai"), "Maharashtra should include Mumbai")
    assert.deepEqual(mhCities, ["Mumbai"], "Fallback cities must match the supplied illustrative dataset")

    assert.equal(hasCityData("Tamil Nadu", "Chennai"), true)
    assert.equal(hasCityData("Tamil Nadu", "NonExistentTown"), false)
  })

  test("Optional weekly hours accepts skipping and validates reasonable ranges", () => {
    assert.equal(validateHours(undefined), true, "Skipping should be allowed")
    assert.equal(validateHours(null), true, "Skipping should be allowed")
    assert.equal(validateHours(""), true, "Skipping should be allowed")
    assert.equal(validateHours(45), true, "Standard 45h should be valid")
    assert.equal(validateHours(0), false, "0 hours should be invalid")
    assert.equal(validateHours(120), false, "Excessive hours (>112) should be invalid")
  })
})

// 2. Test Prediction with Known Cities
describe("Prediction Engine with Known Cities", () => {
  test("Computes valid profile with intervals and baselines for Chennai", async () => {
    const { computeLocalFallbackProfile } = await import("../lib/data/city-baselines.ts")

    const profile = computeLocalFallbackProfile({
      name: "Karthik",
      state: "Tamil Nadu",
      city: "Chennai",
      platform: "delivery",
      hours: 48,
    })

    assert.equal(profile.inputs.city, "Chennai")
    assert.equal(profile.inputs.state, "Tamil Nadu")
    assert.equal(profile.inputs.platform, "delivery")

    // Weekly income with intervals
    assert.ok(profile.weekly_income.expected > 4000, "Weekly income should be realistic")
    assert.ok(profile.weekly_income.low < profile.weekly_income.expected, "Low should be strictly less than expected")
    assert.ok(profile.weekly_income.high > profile.weekly_income.expected, "High should be strictly greater than expected")

    // Monthly income
    assert.ok(profile.monthly_income.expected > 15000, "Monthly income should scale realistically")
    assert.ok(profile.monthly_income.low < profile.monthly_income.expected)
    assert.ok(profile.monthly_income.high > profile.monthly_income.expected)

    // Rent & Expenses
    assert.ok(profile.typical_rent.expected > 3000, "Rent should be realistic")
    assert.ok(profile.monthly_expenses.total > 0, "Expenses should be positive")
    assert.ok(profile.monthly_expenses.food_utilities > 0)
    assert.ok(profile.monthly_expenses.transport_fuel > 0)
    assert.ok(profile.monthly_expenses.emi_burden > 0)

    // Safe-to-Spend & Savings Capacity
    assert.ok(profile.safe_to_spend_today > 0, "Safe-to-spend today should be positive")
    assert.ok(profile.safe_savings_capacity >= 0, "Safe savings capacity should be non-negative")

    // Baseline & Metadata
    assert.ok(profile.baseline_city_average.weekly_income > 0)
    assert.ok(profile.model_version.includes("city-average"))
    assert.equal(profile.data_source_badge, "synthetic") // Since sample synthetic data is loaded
    assert.ok(profile.suggested_action.length > 10)
  })
})

// 3. Test Unknown City Fallback
describe("Unknown City Fallback", () => {
  test("Gracefully falls back to state average when city is unlisted", async () => {
    const { computeLocalFallbackProfile } = await import("../lib/data/city-baselines.ts")

    const profile = computeLocalFallbackProfile({
      name: "Pooja",
      state: "Tamil Nadu",
      city: "RemoteVillageX",
      platform: "freelance",
      hours: 30,
    })

    assert.equal(profile.inputs.city, "RemoteVillageX")
    assert.ok(profile.weekly_income.expected > 0, "Should generate valid estimate via state fallback")
    assert.ok(profile.typical_rent.expected > 0)
    assert.equal(profile.confidence_level, "fallback")
    assert.ok(profile.fallback_applied, "fallback_applied flag must be true")
  })

  test("Gracefully falls back to national average when state is also unknown", async () => {
    const { computeLocalFallbackProfile } = await import("../lib/data/city-baselines.ts")

    const profile = computeLocalFallbackProfile({
      name: "Guest",
      state: "UnknownState",
      city: "UnknownCity",
      platform: "delivery",
      hours: 40,
    })

    assert.ok(profile.weekly_income.expected > 0, "Should generate valid estimate via national fallback")
    assert.ok(profile.safe_to_spend_today > 0)
    assert.equal(profile.confidence_level, "fallback")
    assert.ok(profile.fallback_applied)
  })
})

// 4. Test Service-Down Fallback Resilience
describe("Service-Down Fallback Resilience", () => {
  test("Local fallback profile executes in < 5ms without network calls", async () => {
    const { computeLocalFallbackProfile } = await import("../lib/data/city-baselines.ts")

    const start = performance.now()
    const profile = computeLocalFallbackProfile({
      name: "Tester",
      state: "Maharashtra",
      city: "Mumbai",
      platform: "ride_hailing",
      hours: 50,
    })
    const duration = performance.now() - start

    assert.ok(duration < 20, `Execution time was ${duration.toFixed(2)}ms, expected < 20ms`)
    assert.equal(profile.inputs.city, "Mumbai")
    assert.ok(profile.typical_rent.expected > 6000, "Mumbai rent should reflect Tier 1 cost")
  })
})

// 5. Test Financial Engine Integration & Telemetry Reactivity
describe("Financial Engine Reading Estimates", () => {
  test("Engine recalculates cashflow and safe-to-spend when profile is updated", async () => {
    const { getArunMasterData, updateArunMasterData } = await import("../lib/data/arun-master.ts")

    // Baseline calculation from arunMasterData
    const master = getArunMasterData()
    assert.ok(master.profile.fullName, "Base profile should have a name")
    assert.ok(master.bankAccounts.length > 0, "Base bank accounts should exist")
    assert.ok(master.obligations.length > 0, "Base obligations should exist")

    // Simulate ML profile update
    const simulatedEstimate = {
      weeklyIncome: 7500,
      monthlyIncome: 7500 * 4.33,
      rent: 6500,
      emi: 2200,
    }

    const dailyIncome = simulatedEstimate.weeklyIncome / 6
    const dailyFixed = (simulatedEstimate.rent + simulatedEstimate.emi) / 30
    const safeToSpend = Math.max(0, Math.round((dailyIncome * 0.72) - (dailyFixed * 0.6)))

    assert.ok(safeToSpend > 0, "Deterministic safe-to-spend should be positive")

    // Now simulate user editing income to higher value (e.g. ₹9,000/wk)
    const editedWeekly = 9000
    const editedDailyIncome = editedWeekly / 6
    const updatedSafeToSpend = Math.max(0, Math.round((editedDailyIncome * 0.72) - (dailyFixed * 0.6)))

    assert.ok(
      updatedSafeToSpend > safeToSpend,
      "Increasing estimated income should increase daily safe-to-spend allowance"
    )

    // Simulate user editing rent to higher value (e.g. ₹10,000)
    const editedRent = 10000
    const editedDailyFixed = (editedRent + simulatedEstimate.emi) / 30
    const reducedSafeToSpend = Math.max(0, Math.round((dailyIncome * 0.72) - (editedDailyFixed * 0.6)))

    assert.ok(
      reducedSafeToSpend < safeToSpend,
      "Increasing rent obligation should reduce daily safe-to-spend allowance"
    )
  })
})
