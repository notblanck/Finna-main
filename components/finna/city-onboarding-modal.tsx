"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  Building2,
  Bike,
  Car,
  Briefcase,
  Layers,
  Clock,
  TrendingUp,
  Home,
  Wallet,
  Coins,
  ChevronDown,
  Search,
  Sliders,
  Edit2,
  RotateCcw,
  Loader2
} from "lucide-react"

import {
  INDIAN_STATES_AND_UTS,
  getCitiesForState,
  CITY_BASELINES_DATA,
  EstimatedFinancialProfile
} from "@/lib/data/city-baselines"
import {
  saveEstimatedProfile,
  getStoredEstimatedProfile,
  updateEstimatedField,
  getUserFullName
} from "@/lib/data/estimate-store"
import { createClient } from "@/lib/supabase/client"

interface CityOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (profile: EstimatedFinancialProfile) => void
  isEditingDetails?: boolean
}

export function CityOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  isEditingDetails = false
}: CityOnboardingModalProps) {
  const router = useRouter()

  // Steps: 1 = Name/Location, 2 = Work/Hours (Optional), 3 = Results Summary
  const [step, setStep] = React.useState<number>(1)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Step 1 Form state
  const [name, setName] = React.useState<string>("")
  const [state, setState] = React.useState<string>("Tamil Nadu")
  const [city, setCity] = React.useState<string>("Chennai")
  const [isOtherCity, setIsOtherCity] = React.useState<boolean>(false)
  const [otherCityName, setOtherCityName] = React.useState<string>("")

  // Search states for dropdowns
  const [stateSearch, setStateSearch] = React.useState<string>("")
  const [isStateDropdownOpen, setIsStateDropdownOpen] = React.useState<boolean>(false)
  const [citySearch, setCitySearch] = React.useState<string>("")
  const [isCityDropdownOpen, setIsCityDropdownOpen] = React.useState<boolean>(false)

  // Step 2 Form state (optional)
  const [platform, setPlatform] = React.useState<string>("delivery")
  const [hours, setHours] = React.useState<number>(45)

  // Results state
  const [profile, setProfile] = React.useState<EstimatedFinancialProfile | null>(null)
  const [showHowEstimated, setShowHowEstimated] = React.useState<boolean>(false)
  const [isEditingInline, setIsEditingInline] = React.useState<boolean>(false)
  const [editedIncome, setEditedIncome] = React.useState<string>("")
  const [editedRent, setEditedRent] = React.useState<string>("")
  const [editedEmi, setEditedEmi] = React.useState<string>("")

  // Pre-populate if existing details
  React.useEffect(() => {
    if (isOpen) {
      const stored = getStoredEstimatedProfile()
      const existingName = getUserFullName()
      if (existingName && existingName !== "Friend") {
        setName(existingName)
      }
      if (stored) {
        setProfile(stored)
        if (stored.inputs) {
          setState(stored.inputs.state || "Tamil Nadu")
          setCity(stored.inputs.city || "Chennai")
          setPlatform(stored.inputs.platform || "delivery")
          setHours(stored.inputs.hours || 45)
        }
        setEditedIncome(String(Math.round(stored.monthly_income.expected)))
        setEditedRent(String(Math.round(stored.typical_rent.expected)))
        setEditedEmi(String(Math.round(stored.monthly_expenses.emi_burden)))
      }
      if (isEditingDetails) {
        setStep(1)
      } else {
        setStep(1)
      }
      setErrorMsg(null)
    }
  }, [isOpen, isEditingDetails])

  // Coordinate overlays: close if another overlay opens, and notify others when this opens
  React.useEffect(() => {
    if (!isOpen) return

    window.dispatchEvent(new CustomEvent("finna:close-all-overlays", { detail: { source: "city-onboarding" } }))

    const handleCloseOverlays = (e: any) => {
      if (e.detail?.source !== "city-onboarding") {
        onClose()
      }
    }
    window.addEventListener("finna:close-all-overlays", handleCloseOverlays)
    return () => window.removeEventListener("finna:close-all-overlays", handleCloseOverlays)
  }, [isOpen, onClose])

  // Available cities for selected state
  const availableCities = React.useMemo(() => {
    return getCitiesForState(state)
  }, [state])

  // Filtered states list
  const filteredStates = React.useMemo(() => {
    if (!stateSearch.trim()) return INDIAN_STATES_AND_UTS
    return INDIAN_STATES_AND_UTS.filter((s) =>
      s.toLowerCase().includes(stateSearch.toLowerCase())
    )
  }, [stateSearch])

  // Filtered cities list
  const filteredCities = React.useMemo(() => {
    if (!citySearch.trim()) return availableCities
    return availableCities.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    )
  }, [availableCities, citySearch])

  // Update selected city if state changes
  const handleSelectState = (selectedState: string) => {
    setState(selectedState)
    setIsStateDropdownOpen(false)
    setStateSearch("")

    const cities = getCitiesForState(selectedState)
    if (cities.length > 0) {
      setCity(cities[0])
      setIsOtherCity(false)
    } else {
      setCity("Other")
      setIsOtherCity(true)
    }
  }

  const handleSelectCity = (selectedCity: string) => {
    if (selectedCity === "__OTHER__") {
      setIsOtherCity(true)
      setCity(otherCityName.trim() || "Other")
    } else {
      setIsOtherCity(false)
      setCity(selectedCity)
    }
    setIsCityDropdownOpen(false)
    citySearch && setCitySearch("")
  }

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setErrorMsg("Please enter your name (at least 2 characters).")
      return false
    }
    if (trimmed.length > 40) {
      setErrorMsg("Name cannot exceed 40 characters.")
      return false
    }
    if (!state) {
      setErrorMsg("Please choose your state.")
      return false
    }
    if (isOtherCity && !otherCityName.trim()) {
      setErrorMsg("Please enter your city name.")
      return false
    }
    setErrorMsg(null)
    return true
  }

  const handleProceedToStep2 = () => {
    if (!validateStep1()) return
    setStep(2)
  }

  // Generate Prediction via Next.js API
  const handleGenerateEstimates = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    const finalCity = isOtherCity ? (otherCityName.trim() || "Other") : city
    const trimmedName = name.trim()

    try {
      const res = await fetch("/api/v1/predict/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          city: finalCity,
          platform,
          hours
        }),
      })

      const data: EstimatedFinancialProfile = await res.json()
      setProfile(data)
      setEditedIncome(String(Math.round(data.monthly_income.expected)))
      setEditedRent(String(Math.round(data.typical_rent.expected)))
      setEditedEmi(String(Math.round(data.monthly_expenses.emi_burden)))

      // Save locally
      saveEstimatedProfile(data, trimmedName)

      // Save to Supabase users profile if authenticated
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("users").upsert({
            id: user.id,
            full_name: trimmedName,
            city: finalCity,
            state,
            annual_income_estimate: Math.round(data.monthly_income.expected * 12),
            onboarding_complete: true,
            updated_at: new Date().toISOString()
          })
        }
      } catch (dbErr) {
        console.warn("Supabase user profile update note:", dbErr)
      }

      setStep(3)
    } catch (err: any) {
      console.error("Prediction request failed:", err)
      setErrorMsg("Could not generate estimates. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle direct navigation to Dashboard
  const handleFinishAndGoToDashboard = () => {
    if (profile) {
      onComplete?.(profile)
    }
    onClose()
    router.push("/dashboard")
  }

  // Handle inline value edits in result view
  const handleSaveInlineEdits = () => {
    const incVal = Number(editedIncome)
    const rentVal = Number(editedRent)
    const emiVal = Number(editedEmi)

    if (incVal && !isNaN(incVal)) {
      updateEstimatedField("income", incVal)
    }
    if (rentVal && !isNaN(rentVal)) {
      updateEstimatedField("rent", rentVal)
    }
    if (emiVal !== undefined && !isNaN(emiVal)) {
      updateEstimatedField("emi", emiVal)
    }

    const updated = getStoredEstimatedProfile()
    if (updated) {
      setProfile(updated)
    }
    setIsEditingInline(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-3 sm:p-4 bg-black/60 animate-in fade-in-0 duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-[#e5e5e5] shadow-2xl overflow-hidden text-black"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4.5 bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
              {step === 3 ? <Sparkles className="size-3.5" /> : step}
            </span>
            <div>
              <p className="text-xs font-mono font-medium text-[#737373] uppercase tracking-wider">
                {step === 3 ? "Estimate Ready" : `Step ${step} of 2`}
              </p>
              <h2 className="text-sm font-semibold text-black">
                {step === 1
                  ? "Basic Profile & City"
                  : step === 2
                  ? "Work & Typical Hours (Optional)"
                  : `Your estimated financial profile for ${profile?.inputs.city || city}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step < 3 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#737373] font-mono">
                <span>{step === 1 ? "50%" : "90%"}</span>
                <div className="w-12 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${step * 50}%` }}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[#737373] hover:text-black hover:bg-[#eaeaea] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Name, State, City */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    errorMsg && setErrorMsg(null)
                  }}
                  placeholder="e.g. Arun Kumar"
                  maxLength={40}
                  className="w-full rounded-xl border border-[#d4d4d4] px-4 py-2.5 text-sm text-black placeholder:text-[#a3a3a3] focus:border-black focus:outline-hidden transition"
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-[#737373]">
                  Used for personalized greetings and your financial picture (2 to 40 characters).
                </p>
              </div>

              {/* State Searchable Dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  State / Union Territory <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsStateDropdownOpen(!isStateDropdownOpen)
                    setIsCityDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-[#d4d4d4] bg-white px-4 py-2.5 text-sm text-black text-left hover:border-black/40 transition cursor-pointer focus:outline-hidden"
                >
                  <span className="truncate">{state}</span>
                  <ChevronDown className="size-4 text-[#737373] shrink-0" />
                </button>

                {isStateDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-2xl border border-[#e5e5e5] bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
                    <div className="sticky top-0 bg-white pb-1.5">
                      <div className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1.5">
                        <Search className="size-3.5 text-[#737373]" />
                        <input
                          type="text"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          placeholder="Search state or UT..."
                          className="w-full bg-transparent text-xs text-black placeholder:text-[#a3a3a3] focus:outline-hidden"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredStates.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleSelectState(st)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                            st === state
                              ? "bg-black text-white font-medium"
                              : "text-black hover:bg-[#f5f5f5]"
                          }`}
                        >
                          <span>{st}</span>
                          {st === state && <Check className="size-3.5" />}
                        </button>
                      ))}
                      {filteredStates.length === 0 && (
                        <p className="p-3 text-xs text-[#737373] text-center">No state found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* City Searchable Dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCityDropdownOpen(!isCityDropdownOpen)
                    setIsStateDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-[#d4d4d4] bg-white px-4 py-2.5 text-sm text-black text-left hover:border-black/40 transition cursor-pointer focus:outline-hidden"
                >
                  <span className="truncate">
                    {isOtherCity ? (otherCityName.trim() ? `${otherCityName} (Other)` : "Other city") : city}
                  </span>
                  <ChevronDown className="size-4 text-[#737373] shrink-0" />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-2xl border border-[#e5e5e5] bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
                    <div className="sticky top-0 bg-white pb-1.5">
                      <div className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1.5">
                        <Search className="size-3.5 text-[#737373]" />
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder={`Search city in ${state}...`}
                          className="w-full bg-transparent text-xs text-black placeholder:text-[#a3a3a3] focus:outline-hidden"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredCities.map((cty) => (
                        <button
                          key={cty}
                          type="button"
                          onClick={() => handleSelectCity(cty)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                            cty === city && !isOtherCity
                              ? "bg-black text-white font-medium"
                              : "text-black hover:bg-[#f5f5f5]"
                          }`}
                        >
                          <span>{cty}</span>
                          {cty === city && !isOtherCity && <Check className="size-3.5" />}
                        </button>
                      ))}

                      {/* Other City Option */}
                      <button
                        type="button"
                        onClick={() => handleSelectCity("__OTHER__")}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition cursor-pointer border-t border-[#f0f0f0] mt-1 ${
                          isOtherCity
                            ? "bg-black text-white font-medium"
                            : "text-[#525252] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Building2 className="size-3" />
                          <span>Other city (uses {state} / national average)</span>
                        </span>
                        {isOtherCity && <Check className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* If Other City is selected, show custom city input */}
                {isOtherCity && (
                  <div className="mt-2.5 space-y-1.5 animate-in fade-in-50 duration-200">
                    <input
                      type="text"
                      value={otherCityName}
                      onChange={(e) => setOtherCityName(e.target.value)}
                      placeholder="Enter your town / city name..."
                      className="w-full rounded-xl border border-[#d4d4d4] px-4 py-2 text-xs text-black placeholder:text-[#a3a3a3] focus:border-black focus:outline-hidden"
                    />
                    <p className="text-[11px] text-[#737373] bg-[#f5f5f5] p-2 rounded-lg border border-[#e5e5e5]">
                      ℹ️ We do not have granular city-tier data for this town yet. FINNA will estimate your profile using the <strong>{state} state average</strong> and national benchmarks.
                    </p>
                  </div>
                )}
              </div>

              {/* Privacy Note */}
              <div className="pt-2">
                <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs text-[#737373] flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed">
                    <p className="text-black font-medium">Privacy First</p>
                    <p>
                      We use only your city to estimate. Nothing is shared. Read our{" "}
                      <Link href="/privacy" target="_blank" className="text-black underline hover:text-[#525252]">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Optional Platform & Hours */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="rounded-xl bg-[#fafafa] p-3 border border-[#e5e5e5] text-xs text-[#737373]">
                <span>Two quick optional questions that improve the accuracy of your estimate. You can skip them anytime.</span>
              </div>

              {/* Platform / Work Type */}
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                  Primary Gig Platform or Work Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "delivery", label: "Delivery", desc: "Swiggy, Zomato, Zepto", icon: Bike },
                    { id: "ride_hailing", label: "Rides", desc: "Uber, Ola, Rapido", icon: Car },
                    { id: "freelance_other", label: "Services", desc: "Urban Co, Freelance", icon: Briefcase },
                    { id: "mixed", label: "Multi-app", desc: "Mixed Platforms", icon: Layers },
                  ].map((p) => {
                    const Icon = p.icon
                    const isSelected = platform === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-[#e5e5e5] bg-white text-black hover:border-black/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`size-4 ${isSelected ? "text-white" : "text-[#737373]"}`} />
                          {isSelected && <Check className="size-3 text-white" />}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-semibold">{p.label}</p>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? "text-neutral-300" : "text-[#737373]"}`}>
                            {p.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Weekly Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-black uppercase tracking-wider">
                    Typical Weekly Hours
                  </label>
                  <span className="text-xs font-mono font-bold text-black bg-[#f5f5f5] px-2 py-0.5 rounded-md border border-[#e5e5e5]">
                    {hours} hrs / week (~{Math.round(hours / 6)} hrs/day)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="70"
                    step="5"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#737373] mt-1.5">
                  <span>Part-time (20h)</span>
                  <span>Standard (45h)</span>
                  <span>Heavy (65h)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Results Profile */}
          {step === 3 && profile && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Header Badges & Popover toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[#f0f0f0]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-medium font-mono">
                    <Sparkles className="size-2.5" />
                    <span>{profile.metadata.synthetic ? "Illustrative data" : "City data"}</span>
                  </span>
                  <span className="rounded-full bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-mono text-[#525252]">
                    Model {profile.metadata.model_version} ({profile.metadata.data_year})
                  </span>
                  {profile.metadata.fallback_used && (
                    <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-medium">
                      Using city averages
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowHowEstimated(!showHowEstimated)}
                  className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-black underline transition cursor-pointer"
                >
                  <Info className="size-3.5" />
                  <span>How is this estimated?</span>
                </button>
              </div>

              {/* Explanatory Banner (Collapsible Popover) */}
              {showHowEstimated && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs text-[#525252] space-y-2"
                >
                  <p className="font-semibold text-black">How FINNA Estimates Your Profile:</p>
                  <p>
                    1. <strong>City-Level Dataset:</strong> Derived from cost of living indexes and gig economy benchmarks for {profile.inputs.city}, {profile.inputs.state}.
                  </p>
                  <p>
                    2. <strong>XGBoost Model + City Average Blend:</strong> Predicts weekly income and expenses based on hours ({profile.inputs.hours}h) and platform ({profile.inputs.platform}), blended with city dataset averages weighted by validation accuracy ({Math.round(profile.blend_weights.xgboost * 100)}% ML / {Math.round(profile.blend_weights.city_baseline * 100)}% Baseline).
                  </p>
                  <p className="text-[11px] text-[#737373] italic">
                    * Important: These numbers are estimates to give you immediate insights without requiring bank access. They are NOT your actual or verified income. You can customize them anytime.
                  </p>
                </motion.div>
              )}

              {/* Editable Inline Toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#737373]">
                  All values below are <strong>estimates</strong> based on {profile.inputs.city} regional data.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingInline(!isEditingInline)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline cursor-pointer"
                >
                  <Edit2 className="size-3" />
                  <span>{isEditingInline ? "Cancel Editing" : "Customize figures"}</span>
                </button>
              </div>

              {/* Inline Editing Controls */}
              {isEditingInline && (
                <div className="rounded-2xl border border-black/20 bg-neutral-50 p-4 space-y-3 animate-in fade-in-50 duration-150">
                  <p className="text-xs font-bold text-black">Edit your expected figures (updates instantly):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#737373]">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={editedIncome}
                        onChange={(e) => setEditedIncome(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-1.5 text-xs text-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#737373]">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        value={editedRent}
                        onChange={(e) => setEditedRent(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-1.5 text-xs text-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#737373]">Monthly EMI (₹)</label>
                      <input
                        type="number"
                        value={editedEmi}
                        onChange={(e) => setEditedEmi(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-1.5 text-xs text-black"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveInlineEdits}
                      className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-[#262626] transition cursor-pointer"
                    >
                      Apply & Recompute
                    </button>
                  </div>
                </div>
              )}

              {/* 3 Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expected Income Card with Visual Range */}
                <div className="rounded-2xl bg-black p-5 text-white flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a3a3a3]">Expected weekly income</span>
                      {profile.user_edited?.income ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-neutral-900 px-2 py-0.5 rounded border border-emerald-600/40">
                          your input
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#a3a3a3] bg-neutral-800 px-2 py-0.5 rounded">
                          {profile.metadata.synthetic ? "Illustrative" : "ML estimate"}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-3xl font-medium tracking-tight">
                      ₹{Math.round(profile.weekly_income.expected).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-[#a3a3a3] ml-1">/ wk</span>
                    </p>
                    <p className="mt-1 text-xs text-[#a3a3a3]">
                      ~₹{Math.round(profile.monthly_income.expected).toLocaleString("en-IN")} monthly net
                    </p>
                  </div>

                  {/* Range visual bar */}
                  <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-[#a3a3a3]">
                      <span>Low: ₹{Math.round(profile.weekly_income.low).toLocaleString("en-IN")}</span>
                      <span>High: ₹{Math.round(profile.weekly_income.high).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-white rounded-full w-3/4 mx-auto" />
                    </div>
                    <p className="text-[10px] text-[#737373]">
                      City dataset average: ₹{Math.round(profile.baseline_city_average.weekly_income).toLocaleString("en-IN")}/wk
                    </p>
                  </div>
                </div>

                {/* Safe-to-Spend & Savings Capacity */}
                <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#737373]">Safe-to-spend today</span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                        Daily Allowance
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-medium tracking-tight text-black">
                      ₹{Math.round(profile.safe_to_spend_today).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-[#737373] ml-1">/ day</span>
                    </p>
                    <p className="mt-1 text-xs text-[#737373]">
                      Protects rent, loan EMI, fuel, and reserve goals
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs">
                    <span className="text-[#737373]">Safe monthly savings capacity:</span>
                    <strong className="text-black font-semibold">
                      ₹{Math.round(profile.safe_savings_capacity).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    Typical Expenses for {profile.inputs.city}
                  </h3>
                  <span className="text-xs font-mono font-medium text-black">
                    Total: ₹{Math.round(profile.monthly_expenses.total).toLocaleString("en-IN")}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-white rounded-xl border border-[#e5e5e5] p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#737373]">
                      <span>Typical Rent</span>
                      {profile.user_edited?.rent && <span className="text-[9px] text-emerald-600 font-mono">edited</span>}
                    </div>
                    <p className="text-sm font-semibold text-black mt-1">
                      ₹{Math.round(profile.typical_rent.expected).toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-[#737373]">1BHK / Shared</span>
                  </div>

                  <div className="bg-white rounded-xl border border-[#e5e5e5] p-2.5">
                    <span className="text-[11px] text-[#737373]">Food & Bills</span>
                    <p className="text-sm font-semibold text-black mt-1">
                      ₹{Math.round(profile.monthly_expenses.food_utilities).toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-[#737373]">Groceries + power</span>
                  </div>

                  <div className="bg-white rounded-xl border border-[#e5e5e5] p-2.5">
                    <span className="text-[11px] text-[#737373]">Transport & Fuel</span>
                    <p className="text-sm font-semibold text-black mt-1">
                      ₹{Math.round(profile.monthly_expenses.transport_fuel).toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-[#737373]">{profile.inputs.hours}h work usage</span>
                  </div>

                  <div className="bg-white rounded-xl border border-[#e5e5e5] p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#737373]">
                      <span>Vehicle EMI</span>
                      {profile.user_edited?.emi && <span className="text-[9px] text-emerald-600 font-mono">edited</span>}
                    </div>
                    <p className="text-sm font-semibold text-black mt-1">
                      ₹{Math.round(profile.monthly_expenses.emi_burden).toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-[#737373]">Average 2W obligation</span>
                  </div>
                </div>
              </div>

              {/* Suggested Next Action */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
                <Sparkles className="size-4.5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-900">Suggested Next Action</p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {profile.suggested_action}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-[#f0f0f0] px-6 py-4 bg-white">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-medium text-[#737373] hover:text-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-medium text-white hover:bg-[#262626] transition shadow-xs cursor-pointer"
              >
                <span>Next: Work details</span>
                <ArrowRight className="size-3.5" />
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-medium text-black hover:bg-[#f5f5f5] transition cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateEstimates}
                  disabled={isSubmitting}
                  className="rounded-full px-4 py-2 text-xs font-medium text-[#737373] hover:text-black transition cursor-pointer disabled:opacity-50"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleGenerateEstimates}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-medium text-white hover:bg-[#262626] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Estimating profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Predict My Profile</span>
                      <Sparkles className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-medium text-black hover:bg-[#f5f5f5] transition cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Change city / name</span>
              </button>
              <button
                type="button"
                onClick={handleFinishAndGoToDashboard}
                className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-xs font-medium text-white hover:bg-[#262626] transition shadow-sm cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
