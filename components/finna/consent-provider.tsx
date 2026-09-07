"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { createConsentId, defaultConsent, type Consent } from "@/lib/mock-aa-data"

type ConsentContextValue = {
  consent: Consent
  giveConsent: () => Consent
  approveConsent: () => void
  cancelConsent: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(defaultConsent)
  const value = useMemo(() => ({
    consent,
    giveConsent: () => {
      const next = { ...consent, id: createConsentId(), status: "pending" as const }
      setConsent(next)
      return next
    },
    approveConsent: () => setConsent((current) => ({ ...current, status: "approved" })),
    cancelConsent: () => setConsent((current) => ({ ...current, status: "cancelled" })),
  }), [consent])
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const value = useContext(ConsentContext)
  if (!value) throw new Error("useConsent must be used inside ConsentProvider")
  return value
}
