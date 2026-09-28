import { GET as getAAConsentStatus } from "@/app/api/aa/consent/[id]/status/route"

export const preferredRegion = "bom1"
export const runtime = "nodejs"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return getAAConsentStatus(request, context)
}
