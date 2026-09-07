import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const privilegesRouter = Router()

// GET /privileges?platform=uber
privilegesRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { platform } = req.query

    let query = supabaseAdmin.from("privileges").select("*")

    const { data: allPrivileges, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const common = (allPrivileges || []).filter(p => p.scope === "common")
    let platformSpecific = (allPrivileges || []).filter(p => p.scope === "platform_specific")

    if (platform && typeof platform === "string") {
      platformSpecific = platformSpecific.filter(
        p => p.platform?.toLowerCase() === platform.toLowerCase()
      )
    }

    return res.json({
      common,
      platform_specific: platformSpecific,
      total_schemes: common.length + platformSpecific.length
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
