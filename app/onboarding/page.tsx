"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Bike,
  Zap,
  Car,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const GIG_PLATFORMS = [
  { id: "swiggy", name: "Swiggy", category: "Delivery" },
  { id: "zomato", name: "Zomato", category: "Delivery" },
  { id: "uber", name: "Uber", category: "Rides" },
  { id: "ola", name: "Ola", category: "Rides" },
  { id: "rapido", name: "Rapido", category: "Rides" },
  { id: "zepto", name: "Zepto", category: "Quick Commerce" },
  { id: "blinkit", name: "Blinkit", category: "Quick Commerce" },
  { id: "urban_company", name: "Urban Company", category: "Services" },
  { id: "amazon_flex", name: "Amazon Flex", category: "Logistics" },
]

const VEHICLE_TYPES = [
  { id: "two_wheeler", label: "Two-Wheeler (Petrol)", icon: Bike },
  { id: "ev_two_wheeler", label: "Electric 2W (EV)", icon: Zap },
  { id: "auto_cab", label: "Auto / Cab", icon: Car },
  { id: "none", label: "No Vehicle (Public/Bicycle)", icon: Building },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["swiggy", "zomato"])
  const [tenureMonths, setTenureMonths] = React.useState("12")
  const [city, setCity] = React.useState("Chennai")
  const [state, setState] = React.useState("Tamil Nadu")
  const [vehicleType, setVehicleType] = React.useState("two_wheeler")
  const [monthlyEarning, setMonthlyEarning] = React.useState("28000")
  const [dependents, setDependents] = React.useState("2")
  const [language, setLanguage] = React.useState("en")

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    )
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Update user profile in Supabase
        await supabase.from("users").upsert({
          id: user.id,
          city,
          state,
          preferred_language: language,
          vehicle_type: vehicleType,
          has_own_vehicle: vehicleType !== "none",
          annual_income_estimate: Number(monthlyEarning) * 12,
          dependents: Number(dependents),
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })

        // Upsert user platforms
        if (selectedPlatforms.length > 0) {
          const platformRows = selectedPlatforms.map((p, idx) => ({
            user_id: user.id,
            platform: p,
            is_primary: idx === 0,
            avg_monthly_earning: Math.round(Number(monthlyEarning) / selectedPlatforms.length),
            active: true,
          }))
          await supabase.from("user_platforms").upsert(platformRows)
        }
      }

      // Also persist in local session for offline resilience
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("finna_user")
        if (existing) {
          try {
            const parsed = JSON.parse(existing)
            parsed.onboarding_complete = true
            parsed.city = city
            parsed.platforms = selectedPlatforms
            localStorage.setItem("finna_user", JSON.stringify(parsed))
          } catch {
            // ignore
          }
        }
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Onboarding failed:", err)
      router.push("/dashboard")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-2xl mx-auto w-full pt-4 pb-6 flex items-center justify-between border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-black flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="font-bold tracking-tight text-lg">FINNA</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#737373]">
          <span>Step {step} of 3</span>
          <div className="w-16 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full py-8 my-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Which platforms do you work with?
                </h1>
                <p className="mt-2 text-sm text-[#737373]">
                  Select all delivery, rides, or service apps you earn from. We customize tax, savings, and scheme recommendations based on this.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GIG_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id)
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between min-h-[100px] ${
                        isSelected
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-black border-[#e5e5e5] hover:border-[#a3a3a3]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono opacity-60">{platform.category}</span>
                        {isSelected && <Check className="size-4 text-white" />}
                      </div>
                      <span className="font-semibold text-sm mt-3">{platform.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-2">
                <Label htmlFor="tenure" className="text-xs text-[#737373]">
                  How long have you been gigging? (Months)
                </Label>
                <Input
                  id="tenure"
                  type="number"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="mt-1.5 h-11 bg-white border-[#e5e5e5]"
                  placeholder="e.g. 12"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Location & Vehicle Setup
                </h1>
                <p className="mt-2 text-sm text-[#737373]">
                  Government welfare board programs (like Tamil Nadu or Delhi Gig Welfare Boards) and insurance eligibility require city and vehicle info.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-xs text-[#737373]">Operating City</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="size-4 absolute left-3 top-3.5 text-[#737373]" />
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-9 h-11 bg-white border-[#e5e5e5]"
                      placeholder="e.g. Chennai"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs text-[#737373]">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1.5 h-11 bg-white border-[#e5e5e5]"
                    placeholder="e.g. Tamil Nadu"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-[#737373] mb-2 block">Primary Vehicle Mode</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map((v) => {
                    const Icon = v.icon
                    const isSelected = vehicleType === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleType(v.id)}
                        className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-[#e5e5e5] hover:border-[#a3a3a3]"
                        }`}
                      >
                        <span className={`flex size-9 items-center justify-center rounded-xl ${isSelected ? "bg-white/15 text-white" : "bg-[#f5f5f5] text-black"}`}>
                          <Icon className="size-4" />
                        </span>
                        <span className="text-sm font-medium">{v.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Financial Profile & Language
                </h1>
                <p className="mt-2 text-sm text-[#737373]">
                  These estimates power your Safe-to-Spend calculations and loan/scheme eligibility matching.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="earning" className="text-xs text-[#737373]">Estimated Monthly Gig Earnings (₹)</Label>
                  <Input
                    id="earning"
                    type="number"
                    value={monthlyEarning}
                    onChange={(e) => setMonthlyEarning(e.target.value)}
                    className="mt-1.5 h-11 bg-white border-[#e5e5e5] text-lg font-bold"
                    placeholder="e.g. 28000"
                  />
                  <p className="mt-1 text-xs text-[#737373]">Combined from all active apps</p>
                </div>

                <div>
                  <Label htmlFor="dependents" className="text-xs text-[#737373]">Number of Family Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    value={dependents}
                    onChange={(e) => setDependents(e.target.value)}
                    className="mt-1.5 h-11 bg-white border-[#e5e5e5]"
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-[#737373] mb-1.5 block">Preferred Language for Guidance</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "en", label: "English" },
                      { id: "hi", label: "हिंदी (Hindi)" },
                      { id: "ta", label: "தமிழ் (Tamil)" },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLanguage(lang.id)}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold cursor-pointer transition ${
                          language === lang.id
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-[#e5e5e5] hover:border-[#a3a3a3]"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e5e5e5] flex items-center gap-3">
                  <ShieldCheck className="size-5 text-black shrink-0" />
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Your data is strictly encrypted and protected by Supabase Row-Level Security. We never share your data with unauthorized third parties.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="max-w-2xl mx-auto w-full pt-6 pb-4 flex items-center justify-between border-t border-[#e5e5e5]">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={isSubmitting}
            className="rounded-xl border-[#e5e5e5] h-11 px-5 cursor-pointer"
          >
            <ChevronLeft className="size-4 mr-1.5" /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer ml-auto"
          >
            Continue <ChevronRight className="size-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="rounded-xl bg-black text-white hover:bg-black/90 h-11 px-6 font-semibold cursor-pointer ml-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Finalizing...
              </>
            ) : (
              <>
                Complete Setup <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </footer>
    </div>
  )
}
