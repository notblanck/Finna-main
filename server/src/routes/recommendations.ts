import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const recommendationsRouter = Router()

// GET /recommendations/side-hustles?city=Chennai
recommendationsRouter.get("/side-hustles", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const city = (req.query.city as string) || "Chennai"

    const { data: recommendations, error } = await supabaseAdmin
      .from("side_hustle_recommendations")
      .select("*")
      .ilike("city", `%${city}%`)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json(recommendations || [])
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
