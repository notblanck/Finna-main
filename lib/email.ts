import nodemailer from "nodemailer"

interface SendOtpEmailOptions {
  email: string
  otp: string
}

let cachedTransporter: nodemailer.Transporter | null = null

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === "true" || port === 465

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    })
    return cachedTransporter
  }

  // Fallback: If no SMTP credentials configured, attempt creating an Ethereal test account or local logger
  try {
    const testAccount = await nodemailer.createTestAccount()
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    console.log(`[Email Service] Using Ethereal test mail account: ${testAccount.user}`)
    return cachedTransporter
  } catch (err) {
    console.warn("[Email Service] Could not create Ethereal test account, using direct JSON stream transport:", err)
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    })
    return cachedTransporter
  }
}

/**
 * Sends a high-conversion, branded 6-digit OTP verification email.
 */
export async function sendOtpEmail({ email, otp }: SendOtpEmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"FINNA Security" <auth@finna.ai>'
  const transporter = await getTransporter()

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FINNA Login Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0c0f17;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0c0f17;
      padding: 40px 16px;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background: #131926;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .header {
      padding: 32px 32px 20px;
      text-align: center;
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #10b981;
      display: inline-block;
    }
    .logo-badge {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 3px 8px;
      border-radius: 6px;
      margin-left: 6px;
      font-weight: 700;
      vertical-align: middle;
    }
    .body {
      padding: 32px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 28px;
    }
    .otp-box {
      display: inline-block;
      letter-spacing: 10px;
      font-size: 34px;
      font-weight: 800;
      color: #10b981;
      background: #0f172a;
      border: 2px dashed rgba(16, 185, 129, 0.4);
      border-radius: 12px;
      padding: 16px 28px;
      margin: 0 0 28px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      text-indent: 10px;
    }
    .notice {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      padding: 14px;
      font-size: 12px;
      line-height: 1.5;
      color: #64748b;
      margin-bottom: 24px;
      text-align: left;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      background: #0d121c;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">FINNA <span class="logo-badge">Security 2FA</span></div>
      </div>
      <div class="body">
        <h1 class="title">Verification Code</h1>
        <p class="text">
          We received a request to sign in to your FINNA account associated with <strong>${email}</strong>. 
          Use the 6-digit code below to complete your authentication.
        </p>
        
        <div class="otp-box">${otp}</div>

        <div class="notice">
          <strong>Security Notice:</strong>
          <ul style="margin: 6px 0 0; padding-left: 18px;">
            <li>This code is valid for <strong>10 minutes</strong>.</li>
            <li>Never share this OTP with anyone. FINNA representatives will never ask for your verification code.</li>
            <li>If you did not request this login, you can safely ignore this email.</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} FINNA Technologies Inc. • Financial Intelligence for Gig Workers
      </div>
    </div>
  </div>
</body>
</html>
`

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: `${otp} is your FINNA verification code`,
    text: `Your FINNA verification code is: ${otp}. This code is valid for 10 minutes. Do not share this code with anyone.`,
    html: htmlContent
  }

  const info = await transporter.sendMail(mailOptions)
  console.log(`[Email Service] OTP email dispatched to ${email}. Message ID: ${info.messageId || "ok"}`)

  let previewUrl: string | undefined
  try {
    const testUrl = nodemailer.getTestMessageUrl(info)
    if (testUrl) {
      previewUrl = testUrl as string
      console.log(`[Email Service] Ethereal preview URL: ${previewUrl}`)
    }
  } catch {
    // Ignore test URL failure
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl
  }
}
