/**
 * Proxy utility for Setu AA API routes.
 *
 * When the Next.js serverless function (running on Vercel US-East) gets a 403
 * from Setu's Cloudflare WAF, this utility proxies the request through the
 * Express backend running from an Indian IP.
 */

const BACKEND_URL = (process.env.FINNA_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "")

export async function proxyToBackend(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  const url = `${BACKEND_URL}/api/aa${path}`

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...(options.body ? { body: options.body } : {}),
  })

  return res
}

/**
 * Returns true if the error indicates Setu's Cloudflare WAF blocked the request
 * (403 Forbidden from a non-Indian IP like Vercel's US-East Lambda).
 */
export function isCloudflareBlock(error: any): boolean {
  if (!error) return false
  const msg = (error.message || "").toLowerCase()
  return (
    msg.includes("403") ||
    msg.includes("forbidden") ||
    msg.includes("cloudflare") ||
    msg.includes("waf") ||
    msg.includes("access denied")
  )
}
