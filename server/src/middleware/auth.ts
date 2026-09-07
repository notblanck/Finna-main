import { Request, Response, NextFunction } from "express"
import { SupabaseClient } from "@supabase/supabase-js"
import { supabaseAdmin, getAuthenticatedSupabaseClient } from "../services/supabase.js"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    phone?: string
  }
  supabase?: SupabaseClient
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]

  // Allow demo token for testing and hackathon demo evaluation
  if (token === "demo-token" || token.startsWith("demo-")) {
    req.user = {
      id: "698856bf-1e15-43f0-8eea-0aaf1dbe17ec",
      phone: "+919042932166",
      email: "demo.driver@finna.in"
    }
    req.supabase = supabaseAdmin
    return next()
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token", details: error?.message })
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone
    }
    req.supabase = getAuthenticatedSupabaseClient(token)
    next()
  } catch (err: any) {
    return res.status(500).json({ error: "Authentication verification failed", details: err.message })
  }
}
