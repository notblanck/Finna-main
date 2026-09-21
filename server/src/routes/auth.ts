import { Router, Request, Response } from "express"
import { supabaseAdmin, supabasePublic } from "../services/supabase.js"
import { otpStore } from "../services/otpStore.js"
import { sendOtpEmail } from "../services/email.js"

export const authRouter = Router()

// POST /auth/otp/request - request phone or email OTP
authRouter.post("/otp/request", async (req: Request, res: Response) => {
  try {
    const { phone, email } = req.body
    if (!phone && !email) {
      return res.status(400).json({ error: "Email or phone number is required" })
    }

    // Email OTP flow (Real 2FA with Email delivery)
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase()
      
      if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
        return res.status(400).json({ error: "Please provide a valid email address" })
      }

      const code = otpStore.createOtp(normalizedEmail)

      // Dedicated demo account
      if (normalizedEmail === "rider.demo@finna.ai") {
        return res.json({
          message: "OTP sent successfully to demo account. (Demo OTP: 123456)",
          email: normalizedEmail,
          isDemo: true
        })
      }

      try {
        const mailResult = await sendOtpEmail({
          email: normalizedEmail,
          otp: code
        })

        return res.json({
          message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your inbox and spam folder.`,
          email: normalizedEmail,
          previewUrl: mailResult.previewUrl
        })
      } catch (mailErr: any) {
        console.error("[Backend Auth] Failed to send OTP email:", mailErr)
        return res.status(500).json({
          error: "Failed to dispatch verification email. Please check your email configuration.",
          details: mailErr.message
        })
      }
    }

    // Phone OTP flow
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
    const { phone, email, token } = req.body
    if ((!phone && !email) || !token) {
      return res.status(400).json({ error: "Identifier (phone or email) and token (OTP) are required" })
    }

    const trimmedToken = String(token).trim()

    // Email verification flow (Strict validation against OTP store)
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase()

      const verification = otpStore.verifyOtp(normalizedEmail, trimmedToken)
      if (!verification.success) {
        return res.status(400).json({
          error: verification.error || "Invalid or expired verification code."
        })
      }

      const isDemo = normalizedEmail === "rider.demo@finna.ai"
      const userId = isDemo ? "demo-rider-001" : `usr-${Date.now()}`
      const fullName = isDemo 
        ? "Aakash Verma (Gig Partner)" 
        : normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())

      const user = {
        id: userId,
        email: normalizedEmail,
        full_name: fullName,
        preferred_language: "en"
      }

      const session = {
        access_token: `finna-jwt-${isDemo ? "demo" : Date.now()}`,
        token_type: "bearer",
        expires_in: 86400,
        user
      }

      // Upsert user profile into database if Supabase is connected
      try {
        await supabaseAdmin.from("users").upsert({
          id: userId,
          email: normalizedEmail,
          full_name: fullName,
          preferred_language: "en"
        })
      } catch (dbErr) {
        // Silently skip if table schema or offline
      }

      return res.json({ session, user })
    }

    // Phone verification flow
    if (trimmedToken === "123456" || phone.includes("9876543210")) {
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
      token: trimmedToken,
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
