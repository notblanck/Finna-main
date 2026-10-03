/**
 * FINNA Copilot Conversational Onboarding & Estimation Engine
 * 
 * Flow:
 * 1. Which platforms do you work on? (Swiggy, Zomato, Uber, etc.)
 * 2. Which city/area do you work in?
 * 3. Roughly how many hours/days do you work?
 * 4. What is your approximate monthly income range?
 * 5. What are your major fixed expenses—rent, EMI, fuel, family costs?
 * 6. What do you want help with—saving, emergency planning, loan affordability, government schemes, tax?
 * 
 * Critical Wording:
 * - Always use "estimate" / "estimated"
 * - Never use "predict" or "verified financial score"
 * - Show confidence ranges (e.g. "Estimated safe-to-spend: ₹280–₹410/day, based on the details you shared")
 * - Provide interactive assumption editing
 * - Applies strictly to the Co-pilot without modifying external website routes.
 */

export interface CopilotProfileData {
  platforms: string[]
  city: string
  hoursPerWeek: number
  hoursLabel: string
  monthlyIncomeRange: string
  monthlyIncomeExpected: number
  monthlyIncomeLow: number
  monthlyIncomeHigh: number
  fixedExpensesLabel: string
  rentAmount: number
  emiAmount: number
  fuelAmount: number
  livingAmount: number
  totalFixedExpenses: number
  goals: string[]
  completedAt?: string
  lastEditedField?: string
}

export interface CopilotEstimateResult {
  dailySafeToSpend: {
    low: number
    high: number
    expected: number
    rangeFormatted: string
  }
  monthlySavings: {
    low: number
    high: number
    expected: number
    annualPotential: number
    rangeFormatted: string
  }
  emergencyFund: {
    target: number
    timelineMonthsLow: number
    timelineMonthsHigh: number
    survivalMonthly: number
  }
  affordableEmi: {
    maxSafeEmiLow: number
    maxSafeEmiHigh: number
    currentEmi: number
    dtiPct: number
    status: string
  }
  benchmarkIncome: {
    low: number
    high: number
    expected: number
    contextText: string
  }
  schemesAndTax: {
    title: string
    category: string
    description: string
  }[]
  confidenceRange: string
  formattedExplanation: string
}

export interface OnboardingQuestion {
  step: number
  title: string
  prompt: {
    en: string
    ta: string
    hi: string
  }
  subtitle?: {
    en: string
    ta: string
    hi: string
  }
  options: {
    id: string
    label: {
      en: string
      ta: string
      hi: string
    }
    value: string
  }[]
  isMultiSelect?: boolean
}

export const COPILOT_ONBOARDING_STEPS: OnboardingQuestion[] = [
  // 1. Platforms
  {
    step: 1,
    title: "Platforms",
    prompt: {
      en: "Which platforms do you work on?",
      ta: "நீங்கள் எந்த தளங்களில் பணிபுரிகிறீர்கள்?",
      hi: "आप किन प्लेटफॉर्म्स पर काम करते हैं?",
    },
    subtitle: {
      en: "Tap one or more platforms, or type below.",
      ta: "ஒன்று அல்லது அதற்கு மேற்பட்ட தளங்களைத் தேர்ந்தெடுக்கவும்.",
      hi: "एक या अधिक प्लेटफॉर्म चुनें या नीचे टाइप करें।",
    },
    isMultiSelect: true,
    options: [
      { id: "swiggy", label: { en: "Swiggy", ta: "ஸ்விகி (Swiggy)", hi: "स्वीगी (Swiggy)" }, value: "Swiggy" },
      { id: "zomato", label: { en: "Zomato", ta: "ஜொமாட்டோ (Zomato)", hi: "ज़ोमैटो (Zomato)" }, value: "Zomato" },
      { id: "uber", label: { en: "Uber", ta: "ஊபர் (Uber)", hi: "उबर (Uber)" }, value: "Uber" },
      { id: "ola", label: { en: "Ola", ta: "ஓலா (Ola)", hi: "ओला (Ola)" }, value: "Ola" },
      { id: "zepto", label: { en: "Zepto", ta: "செப்டோ (Zepto)", hi: "ज़ेप्टो (Zepto)" }, value: "Zepto" },
      { id: "blinkit", label: { en: "Blinkit", ta: "பிளிங்கிட் (Blinkit)", hi: "ब्लिंकिट (Blinkit)" }, value: "Blinkit" },
      { id: "rapido", label: { en: "Rapido", ta: "ராபிடோ (Rapido)", hi: "रैपिडो (Rapido)" }, value: "Rapido" },
      { id: "porter", label: { en: "Porter", ta: "போர்ட்டர் (Porter)", hi: "पोर्टर (Porter)" }, value: "Porter" },
      { id: "amazon_flex", label: { en: "Amazon Flex", ta: "அமேசான் ஃப்ளெக்ஸ்", hi: "अमेज़न फ्लेक्स" }, value: "Amazon Flex" },
      { id: "other", label: { en: "Freelance / Other", ta: "பிற வேலைகள்", hi: "अन्य फ्रीलांस" }, value: "Freelance / Other" },
    ],
  },

  // 2. City / Area
  {
    step: 2,
    title: "City / Area",
    prompt: {
      en: "Which city or area do you primarily work in?",
      ta: "நீங்கள் முக்கியமாக எந்த ஊரில் வேலை செய்கிறீர்கள்?",
      hi: "आप मुख्य रूप से किस शहर या क्षेत्र में काम करते हैं?",
    },
    subtitle: {
      en: "Helps benchmark against local cost-of-living & gig earnings averages.",
      ta: "உள்ளூர் செலவுகள் மற்றும் சராசரி வருமானத்தை அறிய உதவுகிறது.",
      hi: "स्थानीय जीवन-यापन खर्च और औसत कमाई की तुलना में मदद करता है।",
    },
    options: [
      { id: "chennai", label: { en: "Chennai", ta: "சென்னை (Chennai)", hi: "चेन्नई (Chennai)" }, value: "Chennai" },
      { id: "bengaluru", label: { en: "Bengaluru", ta: "பெங்களூரு (Bengaluru)", hi: "बेंगलुरु (Bengaluru)" }, value: "Bengaluru" },
      { id: "mumbai", label: { en: "Mumbai", ta: "மும்பை (Mumbai)", hi: "मुंबई (Mumbai)" }, value: "Mumbai" },
      { id: "hyderabad", label: { en: "Hyderabad", ta: "ஹைதராபாத் (Hyderabad)", hi: "हैदराबाद (Hyderabad)" }, value: "Hyderabad" },
      { id: "delhi", label: { en: "Delhi NCR", ta: "டெல்லி என்.சி.ஆர்", hi: "दिल्ली एनसीआर" }, value: "Delhi NCR" },
      { id: "pune", label: { en: "Pune", ta: "புனே (Pune)", hi: "पुणे (Pune)" }, value: "Pune" },
      { id: "kolkata", label: { en: "Kolkata", ta: "கொல்கத்தா", hi: "कोलकाता" }, value: "Kolkata" },
      { id: "other_city", label: { en: "Other City", ta: "பிற நகரம்", hi: "अन्य शहर" }, value: "Other City" },
    ],
  },

  // 3. Hours / Days
  {
    step: 3,
    title: "Hours & Days",
    prompt: {
      en: "Roughly how many hours or days do you work?",
      ta: "தோராயமாக வாரம் எத்தனை மணி நேரம் வேலை செய்கிறீர்கள்?",
      hi: "आप लगभग कितने घंटे या दिन काम करते हैं?",
    },
    subtitle: {
      en: "Select your typical weekly gig schedule.",
      ta: "உங்கள் வாராந்திர பணி அட்டவணையைத் தேர்வுசெய்யவும்.",
      hi: "अपना साप्ताहिक कार्य समय चुनें।",
    },
    options: [
      {
        id: "full_time",
        label: {
          en: "45–50 hrs/wk (8–9 hrs/day, 6 days)",
          ta: "45–50 மணி/வாரம் (முழு நேரம், 6 நாட்கள்)",
          hi: "45–50 घंटे/सप्ताह (फुल टाइम, 6 दिन)",
        },
        value: "48",
      },
      {
        id: "part_time",
        label: {
          en: "25–35 hrs/wk (Part-time, 4–5 days)",
          ta: "25–35 மணி/வாரம் (பகுதி நேரம், 4–5 நாட்கள்)",
          hi: "25–35 घंटे/सप्ताह (पार्ट टाइम, 4–5 दिन)",
        },
        value: "30",
      },
      {
        id: "intensive",
        label: {
          en: "60+ hrs/wk (Intensive, 7 days)",
          ta: "60+ மணி/வாரம் (தீவிர உழைப்பு, 7 நாட்கள்)",
          hi: "60+ घंटे/सप्ताह (7 दिन लगातार)",
        },
        value: "60",
      },
      {
        id: "weekend",
        label: {
          en: "15–20 hrs/wk (Weekend / side gigs)",
          ta: "15–20 மணி/வாரம் (வார இறுதி மட்டும்)",
          hi: "15–20 घंटे/सप्ताह (केवल वीकेंड)",
        },
        value: "18",
      },
    ],
  },

  // 4. Monthly Income Range
  {
    step: 4,
    title: "Monthly Income",
    prompt: {
      en: "What is your approximate monthly income range?",
      ta: "உங்கள் தோராயமான மாத வருமானம் எவ்வளவு?",
      hi: "आपकी अनुमानित मासिक आय का दायरा क्या है?",
    },
    subtitle: {
      en: "Includes platform payouts, incentives, and tips.",
      ta: "தள ஊதியம், போனஸ் மற்றும் டிப்ஸ் உட்பட.",
      hi: "प्लेटफॉर्म कमाई, इंसेंटिव और टिप्स मिलाकर।",
    },
    options: [
      {
        id: "inc_15_25",
        label: { en: "₹15,000 – ₹25,000", ta: "₹15,000 – ₹25,000", hi: "₹15,000 – ₹25,000" },
        value: "15000-25000",
      },
      {
        id: "inc_25_35",
        label: { en: "₹25,000 – ₹35,000", ta: "₹25,000 – ₹35,000", hi: "₹25,000 – ₹35,000" },
        value: "25000-35000",
      },
      {
        id: "inc_35_45",
        label: { en: "₹35,000 – ₹45,000", ta: "₹35,000 – ₹45,000", hi: "₹35,000 – ₹45,000" },
        value: "35000-45000",
      },
      {
        id: "inc_45_60",
        label: { en: "₹45,000 – ₹60,000", ta: "₹45,000 – ₹60,000", hi: "₹45,000 – ₹60,000" },
        value: "45000-60000",
      },
      {
        id: "inc_60_plus",
        label: { en: "₹60,000+", ta: "₹60,000-க்கு மேல்", hi: "₹60,000 से अधिक" },
        value: "60000-80000",
      },
    ],
  },

  // 5. Major Fixed Expenses
  {
    step: 5,
    title: "Fixed Expenses",
    prompt: {
      en: "What are your major fixed expenses—rent, EMI, fuel, family costs?",
      ta: "உங்கள் முக்கிய நிலையான செலவுகள் என்ன—வாடகை, இஎம்ஐ, பெட்ரோல், குடும்பச் செலவு?",
      hi: "आपके मुख्य तय मासिक खर्च क्या हैं—किराया, ईएमआई, ईंधन, पारिवारिक खर्च?",
    },
    subtitle: {
      en: "Choose the preset closest to your situation or type specific amounts below.",
      ta: "உங்களுக்கு ஏற்ற விருப்பத்தைத் தேர்ந்தெடுக்கவும் அல்லது கீழே தட்டச்சு செய்யவும்.",
      hi: "अपने सबसे करीबी विकल्प को चुनें या नीचे सटीक राशि लिखें।",
    },
    options: [
      {
        id: "exp_moderate",
        label: {
          en: "Moderate: ~₹16,000/mo (Rent ₹6k, EMI ₹3k, Fuel ₹4k, Living ₹3k)",
          ta: "நடுத்தர: ~₹16,000/மாதம் (வாடகை ₹6k, இஎம்ஐ ₹3k, பெட்ரோல் ₹4k)",
          hi: "मध्यम: ~₹16,000/माह (किराया ₹6k, ईएमआई ₹3k, पेट्रोल ₹4k)",
        },
        value: "rent:6000,emi:3000,fuel:4000,living:3000",
      },
      {
        id: "exp_low",
        label: {
          en: "Lower: ~₹10,500/mo (Rent ₹4.5k, Fuel ₹3k, Living ₹3k, No EMI)",
          ta: "குறைந்த: ~₹10,500/மாதம் (வாடகை ₹4.5k, பெட்ரோல் ₹3k, இஎம்ஐ இல்லை)",
          hi: "कम: ~₹10,500/माह (किराया ₹4.5k, पेट्रोल ₹3k, कोई ईएमआई नहीं)",
        },
        value: "rent:4500,emi:0,fuel:3000,living:3000",
      },
      {
        id: "exp_high",
        label: {
          en: "Higher: ~₹23,000/mo (Rent ₹9k, EMI ₹5k, Fuel ₹5k, Family ₹4k)",
          ta: "அதிக: ~₹23,000/மாதம் (வாடகை ₹9k, இஎம்ஐ ₹5k, பெட்ரோல் ₹5k)",
          hi: "अधिक: ~₹23,000/माह (किराया ₹9k, ईएमआई ₹5k, पेट्रोल ₹5k)",
        },
        value: "rent:9000,emi:5000,fuel:5000,living:4000",
      },
      {
        id: "exp_rent_only",
        label: {
          en: "Rent & Fuel: ~₹12,000/mo (Rent ₹6.5k, Fuel ₹3.5k, Living ₹2k)",
          ta: "வாடகை மற்றும் பெட்ரோல் மட்டும்: ~₹12,000/மாதம்",
          hi: "केवल किराया और ईंधन: ~₹12,000/माह",
        },
        value: "rent:6500,emi:0,fuel:3500,living:2000",
      },
    ],
  },

  // 6. Help Goals
  {
    step: 6,
    title: "Financial Goals",
    prompt: {
      en: "What do you want help with the most right now?",
      ta: "உங்களுக்கு இப்போது எதில் அதிக உதவி தேவைப்படுகிறது?",
      hi: "आपको इस समय सबसे ज्यादा किस चीज़ में मदद चाहिए?",
    },
    subtitle: {
      en: "Select all that apply.",
      ta: "பொருத்தமானவற்றைத் தேர்ந்தெடுக்கவும்.",
      hi: "जो लागू हो उन्हें चुनें।",
    },
    isMultiSelect: true,
    options: [
      {
        id: "goal_spend",
        label: {
          en: "Daily safe-to-spend limit",
          ta: "தினசரி செலவு வரம்பு (Safe-to-Spend)",
          hi: "दैनिक सुरक्षित खर्च सीमा",
        },
        value: "safe-to-spend",
      },
      {
        id: "goal_savings",
        label: {
          en: "Emergency fund & monthly savings",
          ta: "அவசரகால நிதி மற்றும் சேமிப்பு",
          hi: "इमरजेंसी फंड और मासिक बचत",
        },
        value: "emergency-fund",
      },
      {
        id: "goal_emi",
        label: {
          en: "Loan affordability & EMI safety",
          ta: "கடன் மற்றும் இஎம்ஐ பாதுகாப்பு",
          hi: "लोन और ईएमआई वहनीयता",
        },
        value: "loan-affordability",
      },
      {
        id: "goal_schemes",
        label: {
          en: "Government welfare schemes",
          ta: "அரசு நலத்திட்டங்கள் (PM SVANidhi / PM-JAY)",
          hi: "सरकारी योजनाएं (स्वनिधि / आयुष्मान)",
        },
        value: "government-schemes",
      },
      {
        id: "goal_tax",
        label: {
          en: "Gig tax guidance (44AD / 44ADA)",
          ta: "வருமான வரி ஆலோசனை (Section 44AD)",
          hi: "टैक्स नियम और छूट (धारा 44AD)",
        },
        value: "tax-guidance",
      },
      {
        id: "goal_all",
        label: {
          en: "All of the above (Full Guidance)",
          ta: "அனைத்தும் (முழுமையான ஆலோசனை)",
          hi: "उपरोक्त सभी (पूर्ण मार्गदर्शन)",
        },
        value: "all",
      },
    ],
  },
]

export const DEFAULT_COPILOT_PROFILE: CopilotProfileData = {
  platforms: ["Swiggy", "Zomato"],
  city: "Chennai",
  hoursPerWeek: 48,
  hoursLabel: "45–50 hrs/wk (6 days)",
  monthlyIncomeRange: "₹25,000 – ₹35,000",
  monthlyIncomeExpected: 30000,
  monthlyIncomeLow: 25000,
  monthlyIncomeHigh: 35000,
  fixedExpensesLabel: "Moderate (~₹16,000/mo)",
  rentAmount: 6000,
  emiAmount: 3000,
  fuelAmount: 4000,
  livingAmount: 3000,
  totalFixedExpenses: 16000,
  goals: ["safe-to-spend", "emergency-fund", "loan-affordability", "government-schemes"],
}

/**
 * Deterministically computes the full Copilot Financial Estimate.
 * Adheres strictly to the requirement:
 * - Wording: "estimate", NOT "predict" or "verified financial score".
 * - Shows confidence range (e.g. "Estimated safe-to-spend: ₹280–₹410/day, based on the details you shared").
 * - Returns structured breakdowns for daily spending, savings, emergency fund, EMI, and schemes.
 */
export function calculateCopilotEstimate(
  profile: CopilotProfileData,
  lang: "en" | "ta" | "hi" = "en"
): CopilotEstimateResult {
  const {
    monthlyIncomeExpected,
    monthlyIncomeLow,
    monthlyIncomeHigh,
    rentAmount,
    emiAmount,
    fuelAmount,
    livingAmount,
    totalFixedExpenses,
    city,
    platforms,
    hoursPerWeek,
  } = profile

  // 1. Monthly surplus after essential fixed commitments
  const fixedTotal = totalFixedExpenses || (rentAmount + emiAmount + fuelAmount + livingAmount) || 15000
  const expectedSurplus = Math.max(1500, monthlyIncomeExpected - fixedTotal)
  const lowSurplus = Math.max(1000, monthlyIncomeLow - fixedTotal * 1.05)
  const highSurplus = Math.max(2500, monthlyIncomeHigh - fixedTotal * 0.95)

  // 2. Daily Safe-to-Spend Range (based on 26 active working days)
  // Reserves 25-30% of surplus for savings buffer; remaining is daily discretionary
  const dailyLow = Math.max(120, Math.round((lowSurplus * 0.72) / 26 / 10) * 10)
  const dailyHigh = Math.max(dailyLow + 60, Math.round((highSurplus * 0.75) / 26 / 10) * 10)
  const dailyExpected = Math.round(((dailyLow + dailyHigh) / 2) / 10) * 10

  // 3. Monthly Savings Potential Range
  const savingsLow = Math.max(1200, Math.round((lowSurplus * 0.25) / 100) * 100)
  const savingsHigh = Math.max(savingsLow + 1000, Math.round((highSurplus * 0.35) / 100) * 100)
  const savingsExpected = Math.round((expectedSurplus * 0.30) / 100) * 100
  const annualSavings = savingsExpected * 12

  // 4. Emergency-fund target and timeline
  // 2.5 months of survival expenses (Rent + EMI + Basic Groceries/Fuel)
  const survivalMonthly = Math.round(rentAmount + emiAmount + (fuelAmount * 0.6) + livingAmount)
  const emergencyTarget = Math.max(25000, Math.round((survivalMonthly * 2.5) / 1000) * 1000)
  const timelineLow = Math.max(3, Math.ceil(emergencyTarget / Math.max(1500, savingsHigh)))
  const timelineHigh = Math.max(timelineLow + 2, Math.ceil(emergencyTarget / Math.max(1000, savingsLow)))

  // 5. Affordable EMI Range (Keeping DTI < 25-28%)
  const maxSafeEmiLow = Math.round((monthlyIncomeLow * 0.22) / 100) * 100
  const maxSafeEmiHigh = Math.round((monthlyIncomeHigh * 0.26) / 100) * 100
  const dtiPct = monthlyIncomeExpected > 0 ? Math.round((emiAmount / monthlyIncomeExpected) * 100) : 0
  const emiStatus = dtiPct <= 15 ? "Comfortably Safe" : dtiPct <= 28 ? "Moderate" : "High Debt Burden"

  // 6. Platform / City Benchmark Income Range
  const platformStr = platforms.join(", ") || "Gig delivery"
  const benchLow = Math.round((monthlyIncomeLow * 0.95) / 500) * 500
  const benchHigh = Math.round((monthlyIncomeHigh * 1.05) / 500) * 500
  const benchContext = `Benchmark for ${platformStr} in ${city || "your city"} (~${hoursPerWeek || 45} hrs/wk): ₹${benchLow.toLocaleString("en-IN")}–₹${benchHigh.toLocaleString("en-IN")}/month`

  // 7. Relevant Welfare Schemes and Tax Guidance
  const schemesAndTax = [
    {
      title: "PM SVANidhi Micro-Credit Facility",
      category: "Working Capital",
      description: "Collateral-free credit line for informal & platform gig workers (Tranches: ₹10k → ₹20k → ₹50k) with 7% interest subsidy from MoHUA.",
    },
    {
      title: "Ayushman Bharat (PM-JAY)",
      category: "Health Protection",
      description: "Comprehensive secondary & tertiary hospitalization coverage up to ₹5,00,000 per family per year across empaneled public & private hospitals.",
    },
    {
      title: "Platform Partner Group Medical Policy",
      category: "Accident & Medical",
      description: `Active partners on ${platformStr} qualify for group hospitalization (~₹1.5L–₹3L) with premium deductions covered or subsidized by the platform.`,
    },
    {
      title: "Presumptive Tax Guidance (Section 44AD / 44ADA)",
      category: "Tax Compliance",
      description: "Gig workers can declare presumptive deemed income (6% for digital receipts or 50% for technical services) without maintaining audit books. Zero tax payable up to ₹7,00,000 annual net income with Section 87A rebate.",
    },
  ]

  const confidenceRange =
    lang === "ta"
      ? "நம்பகத்தன்மை வரம்பு: நடுத்தரம் (சுய அறிக்கை மற்றும் நகர சராசரி அடிப்படையில்)"
      : lang === "hi"
      ? "विश्वास सीमा: मध्यम (आपके द्वारा दिए गए विवरण और शहर के आधार पर)"
      : "Confidence Range: Medium (based on self-reported details & city baseline)"

  // Multilingual Formatted Explanation Block
  let formattedExplanation = ""

  if (lang === "ta") {
    formattedExplanation =
      `### 📊 FINNA நிதி அடிப்படை மதிப்பீடு\n` +
      `*நீங்கள் பகிர்ந்த விவரங்களின் அடிப்படையில் கணக்கிடப்பட்டது. இவை வழிகாட்டுதல் மதிப்பீடுகள் மட்டுமே, verified financial score அல்ல.*\n\n` +
      `---\n\n` +
      `**1. தினசரி பாதுகாப்பான செலவு (Daily Safe-to-Spend)**\n` +
      `• **மதிப்பிடப்பட்ட பாதுகாப்பான செலவு: ₹${dailyLow}–₹${dailyHigh}/நாள்** (சராசரி: **₹${dailyExpected}/நாள்**), நீங்கள் பகிர்ந்த விவரங்களின் அடிப்படையில்.\n` +
      `  *உங்கள் ₹${(rentAmount + emiAmount).toLocaleString("en-IN")} மாத வாடகை மற்றும் இஎம்ஐ தேவைகளை ஒதுக்கிய பிறகு இந்தத் தொகையை தினசரி நிம்மதியாக செலவழிக்கலாம்.*\n\n` +
      `**2. மாத சேமிப்பு சாத்தியக்கூறு (Monthly Savings Potential)**\n` +
      `• **மதிப்பிடப்பட்ட மாத சேமிப்பு: ₹${savingsLow.toLocaleString("en-IN")}–₹${savingsHigh.toLocaleString("en-IN")}/மாதம்** (தோராயமாக **₹${savingsExpected.toLocaleString("en-IN")}/மா**).\n` +
      `  *இந்த வேகத்தில், உங்கள் 12 மாத மொத்த சேமிப்பு திறன் **₹${annualSavings.toLocaleString("en-IN")}** என மதிப்பிடப்பட்டுள்ளது.*\n\n` +
      `**3. அவசரகால நிதி இலக்கு & கால அளவு (Emergency-Fund Target)**\n` +
      `• **அவசர நிதி இலக்கு: ₹${emergencyTarget.toLocaleString("en-IN")}** (~**${timelineLow}–${timelineHigh} மாதங்கள்** காலக்கெடு).\n` +
      `  *வாடகை (₹${rentAmount.toLocaleString("en-IN")}), இஎம்ஐ (₹${emiAmount.toLocaleString("en-IN")}) மற்றும் பெட்ரோல் செலவுகளை 2.5 மாதங்களுக்கு பாதுகாக்க உதவும்.*\n\n` +
      `**4. கட்டுப்படியாகும் இஎம்ஐ வரம்பு (Affordable EMI Range)**\n` +
      `• **பாதுகாப்பான மாதாந்திர இஎம்ஐ வரம்பு: ₹${maxSafeEmiLow.toLocaleString("en-IN")}–₹${maxSafeEmiHigh.toLocaleString("en-IN")}/மாதம் வரை** (வருமானத்தில் 25%-க்குள்).\n` +
      `  *தற்போதைய இஎம்ஐ: ₹${emiAmount.toLocaleString("en-IN")}/மாதம் (${dtiPct}% DTI — **${emiStatus}**).*\n\n` +
      `**5. தள & நகர சராசரி வருமான ஒப்பீடு**\n` +
      `• **மதிப்பிடப்பட்ட வருமான வரம்பு: ₹${benchLow.toLocaleString("en-IN")}–₹${benchHigh.toLocaleString("en-IN")}/மாதம்**.\n` +
      `  *${benchContext}.*\n\n` +
      `**6. நலத்திட்டங்கள் & வரி வழிகாட்டுதல் (Welfare Schemes & Tax)**\n` +
      `• **PM SVANidhi:** பிணையில்லாத ₹10,000–₹50,000 கடன் வசதி (7% வட்டி மானியம்).\n` +
      `• **Ayushman Bharat (PM-JAY):** குடும்பத்திற்கு ₹5,00,000 இலவச மருத்துவ காப்பீடு.\n` +
      `• **வருமான வரி (Section 44AD):** ₹7,00,000 ஆண்டு வருமானம் வரை புதிய வரி முறையில் பூஜ்ஜிய வரி (Zero Tax).\n\n` +
      `---\n` +
      `📌 *${confidenceRange}*\n` +
      `💡 *கீழே உள்ள அனுமானங்களை (வருமானம், வாடகை, இஎம்ஐ, நேரம்) மாற்றலாம் அல்லது என்னிடம் கேள்வி கேட்கலாம்!*`
  } else if (lang === "hi") {
    formattedExplanation =
      `### 📊 FINNA वित्तीय आधारभूत अनुमान\n` +
      `*आपके द्वारा साझा किए गए विवरणों पर आधारित। ये आधारभूत अनुमान हैं, कोई क्रेडिट स्कोर या verified financial score नहीं।*\n\n` +
      `---\n\n` +
      `**1. दैनिक सुरक्षित खर्च सीमा (Daily Safe-to-Spend)**\n` +
      `• **अनुमानित सुरक्षित खर्च: ₹${dailyLow}–₹${dailyHigh}/दिन** (औसत: **₹${dailyExpected}/दिन**), आपके द्वारा साझा किए गए विवरण के आधार पर।\n` +
      `  *आपके ₹${(rentAmount + emiAmount).toLocaleString("en-IN")} के मासिक किराए और ईएमआई भुगतान के बाद, आप प्रतिदिन तनावमुक्त होकर खर्च कर सकते हैं।*\n\n` +
      `**2. मासिक बचत क्षमता (Monthly Savings Potential)**\n` +
      `• **अनुमानित मासिक बचत: ₹${savingsLow.toLocaleString("en-IN")}–₹${savingsHigh.toLocaleString("en-IN")}/माह** (लगभग **₹${savingsExpected.toLocaleString("en-IN")}/माह**)।\n` +
      `  *इस गति से आपकी 12 महीने की अनुमानित बचत क्षमता **₹${annualSavings.toLocaleString("en-IN")}** है।*\n\n` +
      `**3. इमरजेंसी-फंड लक्ष्य और समय-सीमा (Emergency-Fund Target)**\n` +
      `• **इमरजेंसी फंड लक्ष्य: ₹${emergencyTarget.toLocaleString("en-IN")}** (~**${timelineLow}–${timelineHigh} महीने**)।\n` +
      `  *यह आपके आवश्यक खर्चों (किराया: ₹${rentAmount.toLocaleString("en-IN")}, ईएमआई: ₹${emiAmount.toLocaleString("en-IN")}, ईंधन) के लिए 2.5 महीने का सुरक्षा कवच देता है।*\n\n` +
      `**4. वहनीय ईएमआई दायरा (Affordable EMI Range)**\n` +
      `• **सुरक्षित मासिक ईएमआई सीमा: ₹${maxSafeEmiLow.toLocaleString("en-IN")}–₹${maxSafeEmiHigh.toLocaleString("en-IN")}/माह तक** (आय का 25% से कम)।\n` +
      `  *आपकी वर्तमान ईएमआई: ₹${emiAmount.toLocaleString("en-IN")}/माह (${dtiPct}% DTI — **${emiStatus}**)।*\n\n` +
      `**5. प्लेटफॉर्म और शहर आय तुलना**\n` +
      `• **अनुमानित आय दायरा: ₹${benchLow.toLocaleString("en-IN")}–₹${benchHigh.toLocaleString("en-IN")}/माह**।\n` +
      `  *${benchContext}.*\n\n` +
      `**6. कल्याणकारी योजनाएं और टैक्स मार्गदर्शन**\n` +
      `• **पीएम स्वनिधि (PM SVANidhi):** ₹10,000–₹50,000 बिना गारंटी माइक्रोक्रेडिट (7% ब्याज सब्सिडी)।\n` +
      `• **आयुष्मान भारत (PM-JAY):** प्रति परिवार प्रति वर्ष ₹5,00,000 अस्पताल सुरक्षा।\n` +
      `• **टैक्स मार्गदर्शन (धारा 44AD):** ₹7,00,000 तक की वार्षिक आय पर धारा 87A के तहत शून्य टैक्स।\n\n` +
      `---\n` +
      `📌 *${confidenceRange}*\n` +
      `💡 *आप नीचे दिए गए विकल्पों से किसी भी अनुमान (आय, किराया, ईएमआई) को बदल सकते हैं या मुझसे कोई भी प्रश्न पूछ सकते हैं!*`
  } else {
    formattedExplanation =
      `### 📊 FINNA Financial Baseline Estimate\n` +
      `*Based on the details you shared. These are baseline estimates, not a credit check or verified financial score.*\n\n` +
      `---\n\n` +
      `**1. Daily Safe-to-Spend Amount**\n` +
      `• **Estimated safe-to-spend: ₹${dailyLow}–₹${dailyHigh}/day** (average: **₹${dailyExpected}/day**), based on the details you shared.\n` +
      `  *After safeguarding your ₹${(rentAmount + emiAmount).toLocaleString("en-IN")} monthly rent & EMI obligations and maintaining a planned savings buffer, you can comfortably spend this each active working day without cashflow stress.*\n\n` +
      `**2. Monthly Savings Potential**\n` +
      `• **Estimated monthly savings: ₹${savingsLow.toLocaleString("en-IN")}–₹${savingsHigh.toLocaleString("en-IN")}/month** (approx. **₹${savingsExpected.toLocaleString("en-IN")}/mo**).\n` +
      `  *At this pace, your 12-month accumulated savings potential is estimated at **₹${annualSavings.toLocaleString("en-IN")}**.*\n\n` +
      `**3. Emergency-Fund Target & Timeline**\n` +
      `• **Emergency-fund target: ₹${emergencyTarget.toLocaleString("en-IN")}** (~**${timelineLow}–${timelineHigh} months** timeline).\n` +
      `  *Provides a 2.5-month cushion for your essential survival expenses (Rent: ₹${rentAmount.toLocaleString("en-IN")}, EMI: ₹${emiAmount.toLocaleString("en-IN")}, Fuel: ₹${fuelAmount.toLocaleString("en-IN")}) to protect against bike repairs or health pauses.*\n\n` +
      `**4. Affordable EMI Range**\n` +
      `• **Safe monthly EMI limit: up to ₹${maxSafeEmiLow.toLocaleString("en-IN")}–₹${maxSafeEmiHigh.toLocaleString("en-IN")}/month** (keeps Debt-to-Income < 25%).\n` +
      `  *Your current EMI is ₹${emiAmount.toLocaleString("en-IN")}/month (${dtiPct}% DTI — **${emiStatus}**).*\n\n` +
      `**5. Platform & City Income Benchmark**\n` +
      `• **Estimated monthly earnings range: ₹${benchLow.toLocaleString("en-IN")}–₹${benchHigh.toLocaleString("en-IN")}/month**.\n` +
      `  *${benchContext}.*\n\n` +
      `**6. Welfare Schemes & Tax Guidance**\n` +
      `• **PM SVANidhi:** Pre-approved ₹10,000–₹50,000 micro-credit at 7% interest subsidy.\n` +
      `• **Ayushman Bharat (PM-JAY):** ₹5,00,000/year family hospital coverage.\n` +
      `• **Tax Guidance (Sec 44AD):** Presumptive taxation scheme means zero tax liability up to ₹7,00,000 under new regime rebate.\n\n` +
      `---\n` +
      `📌 *${confidenceRange}*\n` +
      `💡 *You can edit any assumption (income, rent, EMI, hours) below, or ask me any question!*`
  }

  return {
    dailySafeToSpend: {
      low: dailyLow,
      high: dailyHigh,
      expected: dailyExpected,
      rangeFormatted: `₹${dailyLow}–₹${dailyHigh}/day`,
    },
    monthlySavings: {
      low: savingsLow,
      high: savingsHigh,
      expected: savingsExpected,
      annualPotential: annualSavings,
      rangeFormatted: `₹${savingsLow.toLocaleString("en-IN")}–₹${savingsHigh.toLocaleString("en-IN")}/mo`,
    },
    emergencyFund: {
      target: emergencyTarget,
      timelineMonthsLow: timelineLow,
      timelineMonthsHigh: timelineHigh,
      survivalMonthly,
    },
    affordableEmi: {
      maxSafeEmiLow,
      maxSafeEmiHigh,
      currentEmi: emiAmount,
      dtiPct,
      status: emiStatus,
    },
    benchmarkIncome: {
      low: benchLow,
      high: benchHigh,
      expected: monthlyIncomeExpected,
      contextText: benchContext,
    },
    schemesAndTax,
    confidenceRange,
    formattedExplanation,
  }
}

/**
 * Storage helpers for Copilot Onboarding State
 */
const COPILOT_PROFILE_KEY = "finna_copilot_profile"
const COPILOT_ONBOARDED_KEY = "finna_copilot_onboarded"

export function getStoredCopilotProfile(): CopilotProfileData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(COPILOT_PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CopilotProfileData
  } catch {
    return null
  }
}

export function isCopilotOnboarded(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(COPILOT_ONBOARDED_KEY) === "true"
  } catch {
    return false
  }
}

export function resetCopilotProfile(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(COPILOT_PROFILE_KEY)
    localStorage.removeItem(COPILOT_ONBOARDED_KEY)
    window.dispatchEvent(new Event("finna_data_updated"))
    window.dispatchEvent(new Event("finna_profile_updated"))
  } catch {}
}

export function saveCopilotProfile(data: CopilotProfileData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(COPILOT_PROFILE_KEY, JSON.stringify(data))
    localStorage.setItem(COPILOT_ONBOARDED_KEY, "true")

    // Synchronize into custom Arun & Gig overrides so that all Copilot intents
    // in lib/copilot/engine.ts calculate against these exact numbers.
    const monthlyNet = data.monthlyIncomeExpected || 30000
    const weeklyAvg = Math.round(monthlyNet / 4.33)

    const gigOverride = {
      platforms: [
        {
          id: data.platforms[0]?.toLowerCase() || "swiggy",
          name: data.platforms[0] || "Swiggy",
          monthlyNetEarnings: Math.round(monthlyNet * 0.6),
          weeklyEarningsAvg: Math.round(weeklyAvg * 0.6),
          activeHoursWeekly: Math.round((data.hoursPerWeek || 45) * 0.6),
        },
        {
          id: data.platforms[1]?.toLowerCase() || "zomato",
          name: data.platforms[1] || "Zomato",
          monthlyNetEarnings: Math.round(monthlyNet * 0.4),
          weeklyEarningsAvg: Math.round(weeklyAvg * 0.4),
          activeHoursWeekly: Math.round((data.hoursPerWeek || 45) * 0.4),
        },
      ],
      aggregate: {
        totalNetMonthly: monthlyNet,
        totalGrossMonthly: Math.round(monthlyNet * 1.1),
        totalWeeklyAvg: weeklyAvg,
        primaryPlatform: data.platforms[0] || "Swiggy",
      },
    }

    const arunOverride = {
      profile: {
        fullName: "Friend",
        city: data.city || "Chennai",
        state: "Tamil Nadu",
      },
      obligations: [
        {
          id: "obl_rent",
          name: "House Rent",
          type: "rent",
          amount: data.rentAmount || 6000,
          dueDay: 5,
        },
        {
          id: "obl_emi",
          name: "Two-Wheeler Loan EMI",
          type: "emi",
          amount: data.emiAmount || 3000,
          dueDay: 10,
        },
      ],
      totalBankBalance: Math.max(5000, Math.round(monthlyNet * 0.5)),
    }

    localStorage.setItem("finna_gig_override", JSON.stringify(gigOverride))
    localStorage.setItem("finna_arun_override", JSON.stringify(arunOverride))

    // Dispatch update notification
    window.dispatchEvent(new Event("finna_data_updated"))
    window.dispatchEvent(new Event("finna_profile_updated"))
  } catch (err) {
    console.error("Failed to save Copilot Profile:", err)
  }
}

/**
 * Interactive Assumption Presets for quick inline editing without redoing the questionnaire
 */
export interface AssumptionPreset {
  id: string
  label: {
    en: string
    ta: string
    hi: string
  }
  patch: Partial<CopilotProfileData>
}

export function getAssumptionPresets(field: "income" | "expenses" | "hours" | "city"): AssumptionPreset[] {
  switch (field) {
    case "income":
      return [
        {
          id: "inc_20k",
          label: { en: "₹20,000/mo", ta: "₹20,000/மாதம்", hi: "₹20,000/माह" },
          patch: { monthlyIncomeExpected: 20000, monthlyIncomeLow: 16000, monthlyIncomeHigh: 24000, monthlyIncomeRange: "₹16k–₹24k" },
        },
        {
          id: "inc_28k",
          label: { en: "₹28,000/mo", ta: "₹28,000/மாதம்", hi: "₹28,000/माह" },
          patch: { monthlyIncomeExpected: 28000, monthlyIncomeLow: 24000, monthlyIncomeHigh: 33000, monthlyIncomeRange: "₹24k–₹33k" },
        },
        {
          id: "inc_35k",
          label: { en: "₹35,000/mo", ta: "₹35,000/மாதம்", hi: "₹35,000/माह" },
          patch: { monthlyIncomeExpected: 35000, monthlyIncomeLow: 30000, monthlyIncomeHigh: 42000, monthlyIncomeRange: "₹30k–₹42k" },
        },
        {
          id: "inc_45k",
          label: { en: "₹45,000/mo", ta: "₹45,000/மாதம்", hi: "₹45,000/माह" },
          patch: { monthlyIncomeExpected: 45000, monthlyIncomeLow: 38000, monthlyIncomeHigh: 54000, monthlyIncomeRange: "₹38k–₹54k" },
        },
      ]
    case "expenses":
      return [
        {
          id: "exp_low",
          label: { en: "Low: ₹10.5k (Rent ₹4.5k, No EMI)", ta: "குறைந்த: ₹10.5k (வாடகை ₹4.5k, இஎம்ஐ இல்லை)", hi: "कम: ₹10.5k (किराया ₹4.5k, कोई ईएमआई नहीं)" },
          patch: { rentAmount: 4500, emiAmount: 0, fuelAmount: 3000, livingAmount: 3000, totalFixedExpenses: 10500 },
        },
        {
          id: "exp_mod",
          label: { en: "Moderate: ₹16k (Rent ₹6k, EMI ₹3k)", ta: "நடுத்தர: ₹16k (வாடகை ₹6k, இஎம்ஐ ₹3k)", hi: "मध्यम: ₹16k (किराया ₹6k, ईएमआई ₹3k)" },
          patch: { rentAmount: 6000, emiAmount: 3000, fuelAmount: 4000, livingAmount: 3000, totalFixedExpenses: 16000 },
        },
        {
          id: "exp_high",
          label: { en: "High: ₹23k (Rent ₹9k, EMI ₹5k)", ta: "அதிக: ₹23k (வாடகை ₹9k, இஎம்ஐ ₹5k)", hi: "अधिक: ₹23k (किराया ₹9k, ईएमआई ₹5k)" },
          patch: { rentAmount: 9000, emiAmount: 5000, fuelAmount: 5000, livingAmount: 4000, totalFixedExpenses: 23000 },
        },
      ]
    case "hours":
      return [
        {
          id: "hrs_30",
          label: { en: "30 hrs/wk (Part-time)", ta: "30 மணி/வாரம் (பகுதி நேரம்)", hi: "30 घंटे/सप्ताह (पार्ट-टाइम)" },
          patch: { hoursPerWeek: 30, hoursLabel: "30 hrs/wk" },
        },
        {
          id: "hrs_48",
          label: { en: "48 hrs/wk (Standard 6d)", ta: "48 மணி/வாரம் (வழக்கமான 6 நாள்)", hi: "48 घंटे/सप्ताह (मानक 6 दिन)" },
          patch: { hoursPerWeek: 48, hoursLabel: "48 hrs/wk" },
        },
        {
          id: "hrs_60",
          label: { en: "60 hrs/wk (Intensive)", ta: "60 மணி/வாரம் (தீவிர உழைப்பு)", hi: "60 घंटे/सप्ताह (सघन कार्य)" },
          patch: { hoursPerWeek: 60, hoursLabel: "60 hrs/wk" },
        },
      ]
    case "city":
      return [
        {
          id: "city_chn",
          label: { en: "Chennai", ta: "சென்னை", hi: "चेन्नई" },
          patch: { city: "Chennai" },
        },
        {
          id: "city_blr",
          label: { en: "Bengaluru", ta: "பெங்களூரு", hi: "बेंगलुरु" },
          patch: { city: "Bengaluru" },
        },
        {
          id: "city_mum",
          label: { en: "Mumbai", ta: "மும்பை", hi: "मुंबई" },
          patch: { city: "Mumbai" },
        },
        {
          id: "city_del",
          label: { en: "Delhi NCR", ta: "டெல்லி", hi: "दिल्ली" },
          patch: { city: "Delhi NCR" },
        },
      ]
  }
}

/**
 * Suggested follow-up prompt chips after completing onboarding or calculation
 */
export interface CopilotFollowupChip {
  id: string
  label: {
    en: string
    ta: string
    hi: string
  }
  query: {
    en: string
    ta: string
    hi: string
  }
}

export const COPILOT_FOLLOWUP_CHIPS: CopilotFollowupChip[] = [
  {
    id: "emi_check",
    label: {
      en: "Can I pay an EMI of ₹4,200?",
      ta: "₹4,200 இஎம்ஐ செலுத்த முடியுமா?",
      hi: "क्या ₹4,200 ईएमआई चुका सकता हूँ?",
    },
    query: {
      en: "Can I pay my two-wheeler EMI of ₹4,200 due on the 5th?",
      ta: "5-ம் தேதி வரவிருக்கும் ₹4,200 பைக் இஎம்ஐ-யை என்னால் செலுத்த முடியுமா?",
      hi: "क्या मैं 5 तारीख को आने वाली ₹4,200 की बाइक ईएमआई चुका सकता हूँ?",
    },
  },
  {
    id: "safe_spend",
    label: {
      en: "Safe-to-spend today?",
      ta: "பாதுகாப்பான தினசரி செலவு?",
      hi: "दैनिक सुरक्षित खर्च सीमा?",
    },
    query: {
      en: "How much can I safely spend today after my rent and EMI?",
      ta: "வாடகை மற்றும் இஎம்ஐ கழித்து இன்று எவ்வளவு பாதுகாப்பாக செலவழிக்கலாம்?",
      hi: "किराया और ईएमआई के बाद आज मैं कितना खर्च कर सकता हूँ?",
    },
  },
  {
    id: "emergency_timeline",
    label: {
      en: "Reach emergency target faster?",
      ta: "அவசர நிதியை விரைவாக சேர்க்க?",
      hi: "इमरजेंसी फंड तेजी से कैसे बनाएं?",
    },
    query: {
      en: "How can I reach my emergency fund target faster with gig incentives?",
      ta: "கூடுதல் ஊக்கத்தொகை மூலம் அவசர நிதியை விரைவாக எவ்வாறு எட்டுவது?",
      hi: "इंसेंटिव के साथ इमरजेंसी फंड का लक्ष्य तेजी से कैसे पूरा करें?",
    },
  },
  {
    id: "pm_svanidhi",
    label: {
      en: "How to apply for PM SVANidhi?",
      ta: "PM SVANidhi கடனுக்கு விண்ணப்பிக்க?",
      hi: "पीएम स्वनिधि आवेदन कैसे करें?",
    },
    query: {
      en: "How do I apply for the PM SVANidhi micro-credit scheme for gig workers?",
      ta: "கிக் தொழிலாளர்களுக்கான PM SVANidhi கடனுக்கு விண்ணப்பிப்பது எப்படி?",
      hi: "गिग वर्कर्स के लिए पीएम स्वनिधि योजना में आवेदन कैसे करें?",
    },
  },
  {
    id: "tax_44ad",
    label: {
      en: "How does Section 44AD save tax?",
      ta: "Section 44AD வரி சேமிப்பு எப்படி?",
      hi: "धारा 44AD से टैक्स कैसे बचता है?",
    },
    query: {
      en: "How does presumptive tax Section 44AD apply to my gig earnings?",
      ta: "என் கிக் வருமானத்திற்கு Section 44AD வரி திட்டம் எவ்வாறு பொருந்தும்?",
      hi: "मेरी गिग आय पर धारा 44AD अनुमानित टैक्स योजना कैसे लागू होती है?",
    },
  },
]
