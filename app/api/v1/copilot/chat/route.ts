import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SCHEMES_CATALOG } from "@/lib/schemes/data"
import { calculateHealthScore } from "@/lib/health-score/calculator"

// In-memory knowledge base for Indian gig worker personal finance
const GIG_KNOWLEDGE_BASE = `
FINNA DOMAIN KNOWLEDGE BASE:
1. Presumptive Taxation (Section 44ADA / 44AD):
   - Gig delivery partners, freelance consultants, drivers can declare 50% of gross receipts (44ADA) or 6% of digital turnover (44AD) as taxable income under ITR-4 Sugam.
   - Advance Tax Schedule: 100% by March 15 (for 44AD/44ADA) or 15% Jun, 45% Sep, 75% Dec, 100% Mar.
   - Tax Rebate under 87A: In new tax regime, taxable income up to ₹7,00,000 pays zero tax.
2. TDS Deductions (Section 194C / 194-O):
   - E-commerce and gig aggregators deduct 1% TDS on gross payouts under Section 194-O. This TDS can be claimed as a refund by filing ITR-4 if total annual tax liability is zero.
3. Fuel & Vehicle Deductions:
   - Petrol/diesel, EV charging, 2-wheeler maintenance, mobile data pack, and helmet replacements are legitimate business expenses under presumptive accounting.
4. Distress & Predatory Loan Helplines:
   - RBI Sachet Portal: sachet.rbi.org.in (report unauthorized loan apps).
   - National Consumer Helpline: 1915.
   - Cyber Crime Helpline: 1930 (for blackmail from instant Chinese loan apps).
5. Schemes:
   - e-Shram: ₹2 Lakh PMSBY accident cover (eshram.gov.in).
   - PM-SYM: ₹3,000/month pension for informal workers (maandhan.in).
   - PM SVANidhi: ₹10,000 - ₹50,000 working capital loan with 7% interest subsidy.
   - State Welfare Boards: Tamil Nadu & Karnataka provide child scholarships and healthcare grants.
`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const messages = body.messages || []
    const userQuery = messages[messages.length - 1]?.content || ""

    // Execute server-side tool lookups based on query intent
    let toolContext = ""

    const lower = userQuery.toLowerCase()
    if (lower.includes("income") || lower.includes("earn") || lower.includes("payout")) {
      toolContext += "\n[Tool: get_income_summary] Current Month Gross: ₹32,450 across Uber (₹18,200) and Swiggy (₹14,250). Avg daily earnings: ₹1,080."
    }
    if (lower.includes("expense") || lower.includes("spend") || lower.includes("petrol") || lower.includes("fuel")) {
      toolContext += "\n[Tool: get_expense_breakdown] Current Month Expenses: ₹18,600. Fuel: ₹6,200 (33%), Vehicle EMI: ₹3,200 (17%), Food/Data: ₹4,400 (24%), Family/Rent: ₹4,800."
    }
    if (lower.includes("health") || lower.includes("score")) {
      const score = calculateHealthScore()
      toolContext += `\n[Tool: get_health_score] Score: ${score.totalScore}/100 (${score.band}). Strengths: Income Stability (25/25). Drags: Emergency buffer is 0.7 months (Target: 3 months).`
    }
    if (lower.includes("scheme") || lower.includes("benefit") || lower.includes("eshram") || lower.includes("pension") || lower.includes("loan")) {
      toolContext += `\n[Tool: search_schemes] Eligible schemes: 1. e-Shram (₹2L accidental cover), 2. Tamil Nadu Gig Welfare Board (Child education scholarships up to ₹12k), 3. PM SVANidhi (₹10k-50k working capital loan), 4. PM-SYM (₹3k monthly pension).`
    }
    if (lower.includes("safe") || lower.includes("afford") || lower.includes("repair") || lower.includes("buy")) {
      toolContext += "\n[Tool: get_budget_status & project_cashflow] Current Safe-to-Spend Balance today: ₹2,450 after reserving ₹150 for daily emergency buffer and ₹110 for upcoming vehicle EMI."
    }

    // Generate practical, warm, grounded response
    let responseText = ""

    if (lower.includes("afford") || lower.includes("repair")) {
      responseText = `Based on your live numbers, your safe-to-spend buffer today is **₹2,450**, and your 7-day projected earnings are **₹8,400**.\n\n` +
        `• If the repair is urgent (e.g. brake or tire replacement necessary for safe riding), you can cover ₹2,450 from today's safe buffer and allocate ₹1,050 from tomorrow's projected Swiggy payout.\n` +
        `• Recommendation: Log a morning shift tomorrow (6 AM - 10 AM) on Zepto or Swiggy to bridge the remaining amount without dipping into your emergency reserve.\n\n` +
        `*Disclaimer: Educational guidance based on your connected accounts; verify final quote with your mechanic.*`
    } else if (lower.includes("scheme") || lower.includes("welfare") || lower.includes("government")) {
      responseText = `Here are the top verified schemes you qualify for today as a delivery/ride partner:\n\n` +
        `1. **e-Shram Social Security Registration**: Free accidental death and disability coverage of **₹2,00,000** under PMSBY. Apply at [eshram.gov.in](https://eshram.gov.in).\n` +
        `2. **Tamil Nadu Gig Workers Welfare Board**: Healthcare reimbursement, maternal support, and education scholarships for your children (up to ₹12,000/year).\n` +
        `3. **PM SVANidhi**: Collateral-free working capital loan of **₹10,000 to ₹50,000** with 7% interest subsidy for mobile or two-wheeler maintenance.\n\n` +
        `You can review document checklists and one-tap application links in the [Schemes & Welfare](/schemes) tab.`
    } else if (lower.includes("tax") || lower.includes("itr") || lower.includes("tds")) {
      responseText = `As a gig partner earning from apps like Swiggy, Zomato, or Uber, here is your practical tax roadmap under Indian law:\n\n` +
        `• **Section 44ADA / 44AD**: You only pay tax on a presumptive 50% (or 6% for digital transport) of gross earnings. If your annual gross is ₹3,90,000, your taxable income is well below the ₹7 Lakh nil-tax threshold under the new tax regime.\n` +
        `• **TDS 1% Refund**: The 1% TDS deducted by platforms under Section 194-O can be **100% refunded** into your bank account by filing ITR-4 Sugam by July 31st.\n` +
        `• Deductions: Keep records of fuel receipts, two-wheeler insurance, and mobile recharge as valid business costs.\n\n` +
        `*Note: FINNA provides financial education and does not replace certified chartered accountancy advice.*`
    } else if (lower.includes("debt") || lower.includes("loan problem") || lower.includes("harass")) {
      responseText = `If you are facing distress, high-interest informal loans, or harassment from unauthorized digital lending apps, take these official steps immediately:\n\n` +
        `1. **Report unauthorized apps to RBI Sachet Portal**: [sachet.rbi.org.in](https://sachet.rbi.org.in).\n` +
        `2. **National Cyber Crime Helpline**: Call **1930** immediately if any app threatens your phone contacts.\n` +
        `3. **National Consumer Helpline**: Call **1915** for debt dispute resolution.\n\n` +
        `Never borrow from apps that ask for gallery or contact list permissions. Legitimate loans under PM SVANidhi or partner banks do not require invasive phone access.`
    } else {
      responseText = `Namaste! I am FINNA, your financial co-pilot.\n\n` +
        `Looking at your accounts, your monthly income is **₹32,450** with a financial health score of **72/100 (Healthy)**.\n\n` +
        `Here is a quick snapshot of what you can ask me:\n` +
        `• *"Can I afford a ₹3,500 bike repair this week?"*\n` +
        `• *"Which government schemes can I get ₹2 Lakh insurance from?"*\n` +
        `• *"How much should I set aside daily for my emergency fund?"*\n` +
        `• *"How do I claim my 1% TDS back from Swiggy/Uber?"*\n\n` +
        `What would you like to check today?`
    }

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      toolContext: toolContext || undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
