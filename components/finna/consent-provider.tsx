"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { createConsentId, defaultConsent, type Consent, type ConsentStatus } from "@/lib/mock-aa-data"

type ExtendedConsentStatus = ConsentStatus | "rejected" | "expired" | "failed" | "revoked"

export interface ExtendedConsent extends Omit<Consent, "status"> {
  status: ExtendedConsentStatus
  url?: string
  phone?: string
  vpa?: string
}

type ConsentContextValue = {
  consent: ExtendedConsent
  giveConsent: () => ExtendedConsent
  approveConsent: () => void
  cancelConsent: () => void
  setConsentStatus: (status: ExtendedConsentStatus) => void
  updateConsent: (partial: Partial<ExtendedConsent>) => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ExtendedConsent>(defaultConsent)

  const value = useMemo(() => ({
    consent,
    giveConsent: () => {
      const next: ExtendedConsent = { ...consent, id: createConsentId(), status: "pending" }
      setConsent(next)
      return next
    },
    approveConsent: () => setConsent((current) => ({ ...current, status: "approved" })),
    cancelConsent: () => setConsent((current) => ({ ...current, status: "cancelled" })),
    setConsentStatus: (status: ExtendedConsentStatus) => setConsent((current) => ({ ...current, status })),
    updateConsent: (partial: Partial<ExtendedConsent>) => setConsent((current) => ({ ...current, ...partial })),
  }), [consent])

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const value = useContext(ConsentContext)
  if (!value) throw new Error("useConsent must be used inside ConsentProvider")
  return value
}

