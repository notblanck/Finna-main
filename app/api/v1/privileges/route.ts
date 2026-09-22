import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("privileges")
      .select("*")

    if (error || !data || data.length === 0) {
      return NextResponse.json([
        {
          id: "pr1",
          scope: "common",
          title: "e-Shram Social Security Registration",
          description: "National database of unorganised workers providing accident insurance cover of ₹2 Lakh (PMSBY) and social security benefits.",
          eligibility_criteria: "Gig workers aged 16-59 with Aadhaar and active mobile number.",
          apply_link: "https://eshram.gov.in"
        },
        {
          id: "pr2",
          scope: "common",
          title: "Tamil Nadu Gig Workers Welfare Board",
          description: "State welfare fund providing healthcare assistance, education grants for children, and maternal benefits for delivery and ride-share workers.",
          eligibility_criteria: "Gig delivery or transport worker operating in Tamil Nadu.",
          apply_link: "https://labour.tn.gov.in"
        },
        {
          id: "pr3",
          scope: "platform_specific",
          platform: "swiggy",
          title: "Swiggy Delivery Partner Relief Shield",
          description: "Emergency cashless hospitalization and fuel discounts with Indian Oil Corporation.",
          eligibility_criteria: "Silver or Gold tier delivery partner.",
          apply_link: "https://ride.swiggy.com"
        }
      ])
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
