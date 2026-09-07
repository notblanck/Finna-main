import { Router, Response } from "express"
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js"
import { supabaseAdmin } from "../services/supabase.js"

export const profileRouter = Router()

// GET /profile - get user profile and linked platforms
profileRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    const { data: platforms } = await supabaseAdmin
      .from("user_platforms")
      .select("platform, linked_at")
      .eq("user_id", userId)

    const { data: consent } = await supabaseAdmin
      .from("consents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return res.json({
      user: userProfile || {
        id: userId,
        full_name: "Arun Kumar",
        phone: "+91 98765 43210",
        preferred_language: "en"
      },
      linked_platforms: platforms || [
        { platform: "uber", linked_at: new Date().toISOString() },
        { platform: "swiggy", linked_at: new Date().toISOString() }
      ],
      active_consent: consent || {
        consent_ref: "CONSENT-DEMO2026",
        status: "APPROVED",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// PATCH /profile - update user profile details
profileRouter.patch("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { full_name, phone, preferred_language } = req.body

    const updates: any = {}
    if (full_name) updates.full_name = full_name
    if (phone) updates.phone = phone
    if (preferred_language) updates.preferred_language = preferred_language

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// PATCH /profile/language - update language preference (en | hi | ta)
profileRouter.patch("/language", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { language } = req.body

    if (!language || !["en", "hi", "ta"].includes(language)) {
      return res.status(400).json({ error: "Invalid language. Allowed values: 'en', 'hi', 'ta'" })
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ preferred_language: language })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json({ message: "Language updated successfully", preferred_language: language, user: data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
