import { Router, Request, Response } from "express"
import { supabaseAdmin, supabasePublic } from "../services/supabase.js"

export const authRouter = Router()

// POST /auth/otp/request - request phone OTP
authRouter.post("/otp/request", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" })
    }

    // For demo/sandbox testing
    if (phone.includes("9876543210") || process.env.USE_MOCK_AUTH === "true") {
      return res.json({
        message: "OTP sent successfully (Demo Mode: use OTP 123456)",
        phone,
        mockOtp: "123456"
      })
    }

    const { data, error } = await supabasePublic.auth.signInWithOtp({
      phone,
      options: { channel: "sms" }
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({ message: "OTP sent successfully", data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /auth/otp/verify - verify OTP and return session token
authRouter.post("/otp/verify", async (req: Request, res: Response) => {
  try {
    const { phone, token } = req.body
    if (!phone || !token) {
      return res.status(400).json({ error: "Phone and token (OTP) are required" })
    }

    // Demo/Sandbox fallback
    if (token === "123456" || phone.includes("9876543210")) {
      return res.json({
        session: {
          access_token: "demo-jwt-token-chennai-rider",
          token_type: "bearer",
          expires_in: 86400,
          user: {
            id: "demo-user-12345",
            phone,
            preferred_language: "en"
          }
        }
      })
    }

    const { data, error } = await supabasePublic.auth.verifyOtp({
      phone,
      token,
      type: "sms"
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({ session: data.session, user: data.user })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /auth/signup-email
authRouter.post("/signup-email", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, preferredLanguage } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, preferred_language: preferredLanguage || "en" }
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Insert or update profile
    await supabaseAdmin.from("users").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      preferred_language: preferredLanguage || "en"
    })

    return res.status(201).json({ user: data.user })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /auth/login-email
authRouter.post("/login-email", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({ session: data.session, user: data.user })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
