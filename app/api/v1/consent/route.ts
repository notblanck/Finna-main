import { POST as createAAConsent } from "@/app/api/aa/consent/route"

export const preferredRegion = "bom1"
export const runtime = "nodejs"

export async function POST(request: Request) {
  return createAAConsent(request)
}
