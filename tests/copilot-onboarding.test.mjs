import { test, describe } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import {
  COPILOT_ONBOARDING_STEPS,
  DEFAULT_COPILOT_PROFILE,
  calculateCopilotEstimate,
  getAssumptionPresets,
  COPILOT_FOLLOWUP_CHIPS,
} from "../lib/copilot/onboarding.ts"

describe("FINNA Copilot 6-Step Conversational Onboarding & Estimation Engine Contract", () => {
  const rootDir = process.cwd()
  const copilotPanel = fs.readFileSync(path.join(rootDir, "components/finna/copilot-panel.tsx"), "utf8")

  test("Defines all 6 onboarding questions sequentially with multilingual support", () => {
    assert.equal(COPILOT_ONBOARDING_STEPS.length, 6, "Must define exactly 6 onboarding steps")

    const [q1, q2, q3, q4, q5, q6] = COPILOT_ONBOARDING_STEPS

    // 1. Platforms
    assert.equal(q1.step, 1)
    assert.ok(q1.prompt.en.includes("Which platforms do you work on?"))
    assert.ok(q1.prompt.ta.includes("எந்த தளங்களில்"))
    assert.ok(q1.prompt.hi.includes("किन प्लेटफॉर्म्स पर"))
    assert.equal(q1.isMultiSelect, true)

    // 2. City / Area
    assert.equal(q2.step, 2)
    assert.ok(q2.prompt.en.includes("Which city or area do you primarily work in?"))
    assert.ok(q2.options.some((o) => o.value === "Chennai"))
    assert.ok(q2.options.some((o) => o.value === "Bengaluru"))

    // 3. Hours / Days
    assert.equal(q3.step, 3)
    assert.ok(q3.prompt.en.includes("Roughly how many hours or days do you work?"))
    assert.ok(q3.options.some((o) => o.value === "48"))

    // 4. Monthly Income Range
    assert.equal(q4.step, 4)
    assert.ok(q4.prompt.en.includes("What is your approximate monthly income range?"))

    // 5. Major Fixed Expenses
    assert.equal(q5.step, 5)
    assert.ok(q5.prompt.en.includes("What are your major fixed expenses"))

    // 6. Help Goals
    assert.equal(q6.step, 6)
    assert.ok(q6.prompt.en.includes("What do you want help with the most right now?"))
    assert.equal(q6.isMultiSelect, true)
  })

  test("Calculates all required estimations with confidence range", () => {
    const result = calculateCopilotEstimate(DEFAULT_COPILOT_PROFILE)

    // Daily safe-to-spend
    assert.ok(result.dailySafeToSpend.low > 0)
    assert.ok(result.dailySafeToSpend.high >= result.dailySafeToSpend.low)
    assert.match(result.dailySafeToSpend.rangeFormatted, /^₹\d+–₹\d+\/day$/)

    // Monthly savings potential
    assert.ok(result.monthlySavings.low > 0)
    assert.ok(result.monthlySavings.high >= result.monthlySavings.low)
    assert.ok(result.monthlySavings.annualPotential > 0)

    // Emergency fund
    assert.ok(result.emergencyFund.target >= 25000)
    assert.ok(result.emergencyFund.timelineMonthsLow > 0)
    assert.ok(result.emergencyFund.timelineMonthsHigh >= result.emergencyFund.timelineMonthsLow)

    // Affordable EMI range
    assert.ok(result.affordableEmi.maxSafeEmiLow > 0)
    assert.ok(result.affordableEmi.maxSafeEmiHigh >= result.affordableEmi.maxSafeEmiLow)

    // Platform / city benchmark
    assert.ok(result.benchmarkIncome.low > 0)
    assert.ok(result.benchmarkIncome.high >= result.benchmarkIncome.low)

    // Welfare schemes & tax guidance
    assert.ok(result.schemesAndTax.length >= 4)
    assert.ok(result.schemesAndTax.some((s) => s.title.includes("PM SVANidhi")))
    assert.ok(result.schemesAndTax.some((s) => s.title.includes("Ayushman Bharat")))
    assert.ok(result.schemesAndTax.some((s) => s.title.includes("44AD")))

    // Confidence range
    assert.ok(result.confidenceRange.includes("Confidence Range: Medium"))
  })

  test("Enforces critical wording requirement: strictly 'estimate', never 'predict' or 'verified financial score'", () => {
    const enResult = calculateCopilotEstimate(DEFAULT_COPILOT_PROFILE, "en")
    const taResult = calculateCopilotEstimate(DEFAULT_COPILOT_PROFILE, "ta")
    const hiResult = calculateCopilotEstimate(DEFAULT_COPILOT_PROFILE, "hi")

    // English: Must contain 'estimate' or 'estimated'
    assert.ok(
      enResult.formattedExplanation.toLowerCase().includes("estimate") ||
      enResult.formattedExplanation.toLowerCase().includes("estimated"),
      "Must use the word 'estimate' or 'estimated'"
    )

    // English: Must NOT contain 'predict'
    assert.equal(
      enResult.formattedExplanation.toLowerCase().includes("predict"),
      false,
      "Must NEVER use the word 'predict'"
    )

    // Explicit disclaimer that it is NOT a verified financial score
    assert.ok(
      enResult.formattedExplanation.includes("not a credit check or verified financial score"),
      "Must explicitly disclaim verified financial score"
    )
    assert.ok(
      taResult.formattedExplanation.includes("verified financial score அல்ல"),
      "Tamil must disclaim verified financial score"
    )
    assert.ok(
      hiResult.formattedExplanation.includes("verified financial score नहीं"),
      "Hindi must disclaim verified financial score"
    )

    // Confidence range is clearly stated
    assert.ok(enResult.formattedExplanation.includes("Confidence Range: Medium"))
  })

  test("Provides interactive assumption editing presets and state updating", () => {
    const incomePresets = getAssumptionPresets("income")
    const expensesPresets = getAssumptionPresets("expenses")
    const hoursPresets = getAssumptionPresets("hours")
    const cityPresets = getAssumptionPresets("city")

    assert.ok(incomePresets.length >= 3)
    assert.ok(expensesPresets.length >= 3)
    assert.ok(hoursPresets.length >= 3)
    assert.ok(cityPresets.length >= 3)

    // Test patching income and recalculating
    const patchedProfile = {
      ...DEFAULT_COPILOT_PROFILE,
      ...incomePresets[2].patch, // e.g. 35k
    }
    const recalculated = calculateCopilotEstimate(patchedProfile)
    assert.ok(recalculated.dailySafeToSpend.expected > 0)
    assert.equal(patchedProfile.monthlyIncomeExpected, 35000)
  })

  test("CopilotPanel integrates onboarding and allows assumption editing strictly within copilot", () => {
    assert.ok(
      copilotPanel.includes("startOnboarding"),
      "CopilotPanel must implement startOnboarding"
    )
    assert.ok(
      copilotPanel.includes("handleOnboardingOptionSelect"),
      "CopilotPanel must handle step option selection"
    )
    assert.ok(
      copilotPanel.includes("handleApplyAssumptionPatch"),
      "CopilotPanel must allow editing assumptions without leaving copilot"
    )
    assert.ok(
      copilotPanel.includes("COPILOT_FOLLOWUP_CHIPS"),
      "CopilotPanel must provide quick follow-up chips after onboarding"
    )
  })

  test("Website scope isolation: main website pages are NOT altered for copilot onboarding", () => {
    // Check app/page.tsx does not import copilot onboarding engine directly
    const homePage = fs.readFileSync(path.join(rootDir, "app/page.tsx"), "utf8")
    assert.ok(
      !homePage.includes("COPILOT_ONBOARDING_STEPS"),
      "app/page.tsx must remain untouched by Copilot onboarding"
    )

    // Check app/onboarding/page.tsx is the standard web wizard, not Copilot chat
    const webOnboarding = fs.readFileSync(path.join(rootDir, "app/onboarding/page.tsx"), "utf8")
    assert.ok(
      !webOnboarding.includes("COPILOT_ONBOARDING_STEPS"),
      "app/onboarding/page.tsx must remain the web onboarding flow"
    )
  })
})
