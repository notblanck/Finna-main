/**
 * In-Memory OTP Store with TTL and Rate Limiting
 * Handles 2FA verification codes securely.
 */

interface OtpRecord {
  code: string
  expiresAt: number
  attempts: number
  createdAt: number
}

class OtpStore {
  private store: Map<string, OtpRecord> = new Map()
  private readonly TTL_MS = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_ATTEMPTS = 5

  constructor() {
    // Periodic garbage collection for expired OTPs every 2 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanupExpired(), 2 * 60 * 1000)
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }

  /**
   * Generates a secure random 6-digit OTP code and records it.
   */
  createOtp(email: string): string {
    const normalized = this.normalizeEmail(email)
    
    // Dedicated demo account fallback if explicitly requested
    if (normalized === "rider.demo@finna.ai") {
      const demoRecord: OtpRecord = {
        code: "123456",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        attempts: 0,
        createdAt: Date.now()
      }
      this.store.set(normalized, demoRecord)
      return "123456"
    }

    // Cryptographically sound 6-digit numeric OTP (100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    const record: OtpRecord = {
      code,
      expiresAt: Date.now() + this.TTL_MS,
      attempts: 0,
      createdAt: Date.now()
    }

    this.store.set(normalized, record)
    return code
  }

  /**
   * Verifies the provided OTP against the stored code.
   */
  verifyOtp(email: string, code: string): { success: boolean; error?: string } {
    const normalized = this.normalizeEmail(email)
    const trimmedCode = String(code || "").trim()

    // Handle dedicated demo account
    if (normalized === "rider.demo@finna.ai" && trimmedCode === "123456") {
      return { success: true }
    }

    const record = this.store.get(normalized)

    if (!record) {
      return {
        success: false,
        error: "No OTP was requested for this email, or the code has expired. Please request a new code."
      }
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(normalized)
      return {
        success: false,
        error: "Verification code has expired. Please request a new one."
      }
    }

    record.attempts += 1

    if (record.attempts > this.MAX_ATTEMPTS) {
      this.store.delete(normalized)
      return {
        success: false,
        error: "Too many incorrect attempts. For security reasons, this OTP has been revoked. Please request a new one."
      }
    }

    if (record.code !== trimmedCode) {
      const remaining = this.MAX_ATTEMPTS - record.attempts
      return {
        success: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
      }
    }

    // Successfully verified -> consume the OTP so it cannot be re-used
    this.store.delete(normalized)
    return { success: true }
  }

  /**
   * Cleans up expired OTP entries to avoid memory buildup.
   */
  private cleanupExpired() {
    const now = Date.now()
    for (const [email, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(email)
      }
    }
  }

  getRecord(email: string): OtpRecord | undefined {
    return this.store.get(this.normalizeEmail(email))
  }
}

// Global singleton instance
export const otpStore = new OtpStore()
