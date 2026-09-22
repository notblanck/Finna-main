import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("side_hustle_recommendations")
      .select("*")

    if (error || !data || data.length === 0) {
      return NextResponse.json([
        {
          id: "sh1",
          platform: "Zepto",
          job_type: "Early Morning Grocery Fulfillment",
          estimated_earning_low: 600,
          estimated_earning_high: 1100,
          reason: "Morning rush hour peak incentive (6:00 AM - 10:00 AM) in T. Nagar dark stores.",
          city: "Chennai"
        },
        {
          id: "sh2",
          platform: "Swiggy",
          job_type: "Weekend Dinner Delivery Surge",
          estimated_earning_low: 900,
          estimated_earning_high: 1800,
          reason: "Heavy weekend demand in OMR & Anna Nagar dining hubs with guaranteed per-order bonus.",
          city: "Chennai"
        },
        {
          id: "sh3",
          platform: "Rapido",
          job_type: "Peak Commute Metro Shuttle",
          estimated_earning_low: 500,
          estimated_earning_high: 950,
          reason: "High demand connecting Guindy and Alandur metro stations during evening rush.",
          city: "Chennai"
        }
      ])
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
