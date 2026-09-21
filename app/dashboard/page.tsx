import { FinnaApp } from "@/components/finna/finna-app"
import { ConsentProvider } from "@/components/finna/consent-provider"

export default function DashboardRoute() {
  return (
    <ConsentProvider>
      <FinnaApp />
    </ConsentProvider>
  )
}
