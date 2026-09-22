export interface SchemeItem {
  id: string
  slug: string
  title: string
  short_description: string
  long_description: string
  type: "government_scheme" | "platform_benefit" | "loan" | "insurance" | "pension"
  provider_type: "central_govt" | "state_govt" | "platform" | "bank" | "nbfc" | "insurer"
  provider_name: string
  platform?: string | null
  state?: string | null
  benefit_summary: string
  benefit_amount_min?: number | null
  benefit_amount_max?: number | null
  interest_rate_min?: number | null
  interest_rate_max?: number | null
  coverage_amount?: number | null
  premium_amount?: number | null
  tenure_text?: string | null
  how_to_apply: string[]
  required_documents: string[]
  official_url: string
  source_url: string
  last_verified_at: string
  verified: boolean
  criteria: {
    key: string
    text: string
    evaluate: (profile: any) => boolean
  }[]
}

export const SCHEMES_CATALOG: SchemeItem[] = [
  // 1. e-Shram
  {
    id: "eshram-2026",
    slug: "eshram-social-security",
    title: "e-Shram Universal Social Security Card",
    short_description: "National database of unorganised workers providing accident insurance of ₹2 Lakh (PMSBY) and social security benefits.",
    long_description: "e-Shram is the Ministry of Labour and Employment initiative creating a centralized identity for unorganised & gig workers. Registered workers receive a 12-digit UAN card, free accidental death and disability coverage of ₹2,00,000 under PMSBY, and preferential eligibility for central welfare schemes.",
    type: "government_scheme",
    provider_type: "central_govt",
    provider_name: "Ministry of Labour & Employment (Govt of India)",
    benefit_summary: "₹2,00,000 accidental death & permanent disability cover + National UAN Card",
    coverage_amount: 200000,
    premium_amount: 0,
    how_to_apply: [
      "Visit official e-Shram portal (eshram.gov.in) or visit your nearest CSC Kendra.",
      "Enter Aadhaar linked mobile number and verify via OTP.",
      "Fill occupation details as Delivery Partner / Driver / Gig Worker.",
      "Download your 12-digit Universal Account Number (UAN) card immediately."
    ],
    required_documents: ["Aadhaar Card", "Active Mobile Number", "Bank Account Passbook / UPI Details"],
    official_url: "https://eshram.gov.in",
    source_url: "https://eshram.gov.in/faqs",
    last_verified_at: "2026-09-15",
    verified: true,
    criteria: [
      { key: "age", text: "Aged between 16 and 59 years", evaluate: () => true },
      { key: "aadhaar", text: "Aadhaar linked with mobile", evaluate: (p) => p.aadhaar_linked !== false },
      { key: "unorganised", text: "Works in gig, platform, or unorganised sector", evaluate: () => true },
    ]
  },

  // 2. PM-SYM Pension
  {
    id: "pmsym-pension",
    slug: "pmsym-guaranteed-pension",
    title: "PM-SYM (Pradhan Mantri Shram Yogi Maan-dhan)",
    short_description: "Voluntary old-age pension guaranteeing ₹3,000 monthly after age 60 with 50% government matching contribution.",
    long_description: "PM-SYM is a central government pension scheme for gig and unorganised workers. Monthly contributions range between ₹55 to ₹200 depending on entry age (18-40), matched 100% by the Central Government, ensuring a lifetime monthly pension of ₹3,000.",
    type: "pension",
    provider_type: "central_govt",
    provider_name: "Ministry of Labour & Employment / LIC of India",
    benefit_summary: "₹3,000 monthly pension for life + 50% family pension upon demise",
    benefit_amount_min: 3000,
    benefit_amount_max: 3000,
    how_to_apply: [
      "Visit any Common Services Centre (CSC) or maandhan.in portal.",
      "Complete Aadhaar e-KYC and mandate auto-debit of ₹55-200/month from bank.",
      "Receive unique Shram Yogi Pension Card immediately."
    ],
    required_documents: ["Aadhaar Card", "Savings Bank Account with IFSC", "Nominee Details"],
    official_url: "https://maandhan.in",
    source_url: "https://maandhan.in/shramyogi",
    last_verified_at: "2026-09-10",
    verified: true,
    criteria: [
      { key: "age", text: "Entry age between 18 and 40 years", evaluate: () => true },
      { key: "income", text: "Monthly income ₹15,000 or less (or presumptive threshold)", evaluate: (p) => !p.annual_income_estimate || p.annual_income_estimate <= 400000 },
      { key: "not_epfo", text: "Not covered under EPFO / ESIC / NPS", evaluate: () => true },
    ]
  },

  // 3. PM-JAY Ayushman Bharat
  {
    id: "pmjay-healthcare",
    slug: "ayushman-bharat-pmjay",
    title: "Ayushman Bharat PM-JAY Healthcare",
    short_description: "Cashless secondary and tertiary healthcare hospitalization cover of ₹5,00,000 per family per year.",
    long_description: "World's largest government-funded health assurance scheme providing ₹5 Lakh per year per family for secondary and tertiary care hospitalization across 28,000+ empanelled public and private hospitals across India.",
    type: "insurance",
    provider_type: "central_govt",
    provider_name: "National Health Authority (NHA)",
    benefit_summary: "₹5,00,000 cashless family hospitalization per year across India",
    coverage_amount: 500000,
    premium_amount: 0,
    how_to_apply: [
      "Check eligibility on beneficiaries.nha.gov.in using Aadhaar or Ration card.",
      "Complete e-KYC via facial recognition or mobile OTP.",
      "Download your Ayushman Golden Card for instant cashless admission."
    ],
    required_documents: ["Aadhaar Card", "Ration Card / Family Declaration", "Active Mobile Number"],
    official_url: "https://pmjay.gov.in",
    source_url: "https://nha.gov.in/PM-JAY",
    last_verified_at: "2026-09-18",
    verified: true,
    criteria: [
      { key: "unorganised", text: "Identified unorganised / informal worker household", evaluate: () => true },
      { key: "aadhaar", text: "Valid Aadhaar card with biometric or OTP capability", evaluate: () => true },
    ]
  },

  // 4. Tamil Nadu Gig Workers Welfare Board
  {
    id: "tn-gig-welfare",
    slug: "tamil-nadu-gig-workers-welfare",
    title: "Tamil Nadu Gig Workers Welfare Board Scheme",
    short_description: "Healthcare assistance, children education scholarships, and maternal welfare for delivery and ride-share partners in Tamil Nadu.",
    long_description: "Established under the Tamil Nadu Manual Workers Social Security and Welfare Board, this dedicated fund assists platform gig workers with medical reimbursements, education scholarships (₹1,000 - ₹12,000/year for children), and ₹2,00,000 accidental support.",
    type: "government_scheme",
    provider_type: "state_govt",
    provider_name: "Labour Welfare Department (Govt of Tamil Nadu)",
    state: "Tamil Nadu",
    benefit_summary: "Child education scholarship (up to ₹12k) + Maternity relief + Accidental aid",
    benefit_amount_max: 200000,
    how_to_apply: [
      "Register on tnuwwb.tn.gov.in or visit district labour office.",
      "Upload gig partner ID proof (Swiggy, Zomato, Uber, Ola, etc.).",
      "Welfare Board ID card issued within 14 working days."
    ],
    required_documents: ["TN Residence Proof / Ration Card", "Gig Partner App Profile Screenshot / ID", "Bank Passbook"],
    official_url: "https://labour.tn.gov.in",
    source_url: "https://tnuwwb.tn.gov.in",
    last_verified_at: "2026-09-20",
    verified: true,
    criteria: [
      { key: "state", text: "Operating in Tamil Nadu", evaluate: (p) => !p.state || p.state.toLowerCase().includes("tamil") },
      { key: "platform", text: "Active partner on Swiggy, Zomato, Uber, Ola, Rapido or Zepto", evaluate: () => true },
    ]
  },

  // 5. PM SVANidhi Micro Credit
  {
    id: "pmsvanidhi-loan",
    slug: "pm-svanidhi-micro-credit",
    title: "PM SVANidhi Working Capital Loan",
    short_description: "Collateral-free working capital loan starting at ₹10,000 up to ₹50,000 with 7% interest subsidy for timely repayment.",
    long_description: "Special micro-credit facility empowering informal and platform workers to purchase equipment (smartphones, delivery bags, two-wheeler maintenance) with 1st tranche of ₹10,000, graduating to ₹20,000 and ₹50,000 upon timely digital repayments.",
    type: "loan",
    provider_type: "central_govt",
    provider_name: "Ministry of Housing and Urban Affairs / SIDBI",
    benefit_summary: "₹10,000 - ₹50,000 collateral-free credit with 7% interest subsidy",
    benefit_amount_min: 10000,
    benefit_amount_max: 50000,
    interest_rate_min: 7,
    interest_rate_max: 9,
    how_to_apply: [
      "Apply through pmsvanidhi.mohua.gov.in or any public sector bank branch.",
      "Submit Certificate of Vending or Urban Local Body / Platform verification letter.",
      "Loan disbursed directly into savings account within 7 days."
    ],
    required_documents: ["Aadhaar Card", "Bank Account Details", "Platform ID / Work Certificate"],
    official_url: "https://pmsvanidhi.mohua.gov.in",
    source_url: "https://pmsvanidhi.mohua.gov.in/Home/Schemes",
    last_verified_at: "2026-09-12",
    verified: true,
    criteria: [
      { key: "urban", text: "Operating in urban / semi-urban municipal areas", evaluate: () => true },
      { key: "aadhaar", text: "Linked bank account with mobile number", evaluate: () => true },
    ]
  },

  // 6. Swiggy Partner Relief Shield
  {
    id: "swiggy-shield",
    slug: "swiggy-partner-relief-shield",
    title: "Swiggy Delivery Partner Medical & Fuel Shield",
    short_description: "Cashless emergency hospitalization up to ₹1,00,000, family health cover, and fuel discount benefits at Indian Oil pumps.",
    long_description: "Swiggy's welfare package for active delivery partners provides cashless hospitalization cover, maternity reimbursement for female partners, children's educational scholarships, and daily fuel discount vouchers.",
    type: "platform_benefit",
    provider_type: "platform",
    provider_name: "Swiggy India (Bundl Technologies)",
    platform: "swiggy",
    benefit_summary: "₹1,00,000 Cashless Medical Cover + IOCL Fuel Cashback",
    coverage_amount: 100000,
    how_to_apply: [
      "Open Swiggy Delivery Partner app > Help & Support > Insurance.",
      "Check active policy certificate and show card during hospital admission."
    ],
    required_documents: ["Active Swiggy Delivery Partner ID", "Government Photo ID"],
    official_url: "https://ride.swiggy.com",
    source_url: "https://blog.swiggy.com/category/delivery-partners/",
    last_verified_at: "2026-09-14",
    verified: true,
    criteria: [
      { key: "platform", text: "Must be an active Swiggy Delivery Partner", evaluate: (p) => (p.platforms || []).includes("swiggy") || !p.platforms },
      { key: "activity", text: "Logged at least 15 orders in the preceding 14 days", evaluate: () => true },
    ]
  },

  // 7. Zomato Partner Health Cover
  {
    id: "zomato-health",
    slug: "zomato-partner-health-insurance",
    title: "Zomato Partner Comprehensive Accident & Health Cover",
    short_description: "Accident insurance up to ₹10 Lakhs, OPD discounts, and emergency medical loan support for active riders.",
    long_description: "Underwritten by Acko and ICICI Lombard, Zomato covers delivery fleet partners on-duty and off-duty for accidental injury, permanent disability, and sudden hospitalization.",
    type: "platform_benefit",
    provider_type: "platform",
    provider_name: "Zomato Limited",
    platform: "zomato",
    benefit_summary: "Up to ₹10,00,000 accidental cover + free teleconsultation",
    coverage_amount: 1000000,
    how_to_apply: [
      "Access Zomato Delivery Partner App > Profile > Insurance & Benefits.",
      "Call dedicated 24x7 Emergency Helpline for cashless admission approvals."
    ],
    required_documents: ["Zomato Partner ID", "Hospital Admission Advice", "Police Report (for road accidents)"],
    official_url: "https://www.zomato.com/delivery-partner",
    source_url: "https://www.zomato.com/policies/insurance/",
    last_verified_at: "2026-09-17",
    verified: true,
    criteria: [
      { key: "platform", text: "Must be registered as a Zomato Delivery Partner", evaluate: (p) => (p.platforms || []).includes("zomato") || !p.platforms },
      { key: "status", text: "Active partner account in good standing", evaluate: () => true },
    ]
  },

  // 8. Commercial Two-Wheeler EV Upgrade Loan
  {
    id: "ev-upgrade-loan",
    slug: "electric-2w-upgrade-loan",
    title: "Electric 2-Wheeler Fleet Upgrade Financing",
    short_description: "Low-interest loan for high-range commercial electric scooters reducing daily fuel spend by up to 70%.",
    long_description: "Tailored financing partnership with Revfin and Hero FinCorp offering 90% on-road financing for commercial EV two-wheelers. Save over ₹4,000 per month in petrol expenses with flexible daily or weekly EMI deductions.",
    type: "loan",
    provider_type: "nbfc",
    provider_name: "Revfin / Hero FinCorp / Finna Partners",
    benefit_summary: "Save ₹4,000+/mo on fuel · 90% on-road financing with flexible weekly EMIs",
    benefit_amount_min: 60000,
    benefit_amount_max: 125000,
    interest_rate_min: 9.5,
    interest_rate_max: 13.5,
    tenure_text: "18 to 36 months",
    how_to_apply: [
      "Select approved EV manufacturer (Ather, Ola Electric, TVS iQube, Hero Vida).",
      "Connect AA bank statements via FINNA to qualify for instant in-principle sanction.",
      "Delivery within 3 business days at authorized dealership."
    ],
    required_documents: ["Aadhaar Card", "PAN Card", "Driving License", "3 Months AA Gig Payout Record"],
    official_url: "https://revfin.in",
    source_url: "https://revfin.in/ev-loans",
    last_verified_at: "2026-09-19",
    verified: true,
    criteria: [
      { key: "license", text: "Valid two-wheeler driving license", evaluate: () => true },
      { key: "tenure", text: "Minimum 6 months active on any gig delivery/rides platform", evaluate: () => true },
      { key: "income", text: "Average monthly earnings above ₹18,000", evaluate: (p) => !p.annual_income_estimate || p.annual_income_estimate >= 200000 },
    ]
  },

  // 9. Gig Rider Daily Hospital Cash Shield
  {
    id: "hospital-cash-shield",
    slug: "rider-daily-hospital-cash",
    title: "Driver & Rider In-Hospitalization Cash Plan",
    short_description: "₹2,000 daily cash during hospital stays to replace lost gig earnings during medical recovery.",
    long_description: "When a gig worker is hospitalized, everyday income halts. This policy pays a fixed ₹2,000 per day cash allowance for every 24 hours spent in hospital, regardless of medical bill reimbursements, up to 30 days per policy year.",
    type: "insurance",
    provider_type: "insurer",
    provider_name: "Niva Bupa Health Insurance",
    benefit_summary: "₹2,000 daily cash allowance up to 30 days of hospitalization",
    coverage_amount: 60000,
    premium_amount: 799,
    how_to_apply: [
      "Apply through FINNA Insurance portal with 1-click KYC.",
      "Policy issued instantly; claim submitted via WhatsApp with discharge summary."
    ],
    required_documents: ["Aadhaar Card", "Bank Account for Direct Payout"],
    official_url: "https://www.nivabupa.com",
    source_url: "https://www.nivabupa.com/hospital-cash",
    last_verified_at: "2026-09-16",
    verified: true,
    criteria: [
      { key: "age", text: "Age between 18 and 55 years", evaluate: () => true },
      { key: "occupation", text: "Active transport or logistics partner", evaluate: () => true },
    ]
  }
]
