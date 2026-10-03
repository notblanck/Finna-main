"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Info,
  Maximize2,
  Minimize2,
  Minus,
  Copy,
  Check,
  History,
  CreditCard,
  Home,
  Shield,
  FileText,
  HelpCircle,
  Plus,
  SlidersHorizontal,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopilotAvatar, type CopilotState } from "./copilot-avatar"
import {
  COPILOT_ONBOARDING_STEPS,
  DEFAULT_COPILOT_PROFILE,
  calculateCopilotEstimate,
  getStoredCopilotProfile,
  isCopilotOnboarded,
  saveCopilotProfile,
  resetCopilotProfile,
  getAssumptionPresets,
  COPILOT_FOLLOWUP_CHIPS,
  type CopilotProfileData,
  type CopilotEstimateResult,
} from "@/lib/copilot/onboarding"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  audioText?: string
  feedback?: "up" | "down"
  timestamp: string
  intent?: string
  mathFormula?: string
  isNew?: boolean
  isEstimateCard?: boolean
  estimateData?: CopilotEstimateResult
}

type SupportedLang = "en" | "ta" | "hi"

interface SuggestionChip {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: Record<SupportedLang, string>
  query: Record<SupportedLang, string>
}

const SUGGESTION_CHIPS: SuggestionChip[] = [
  {
    id: "emi",
    icon: CreditCard,
    label: {
      en: "Can I pay my EMI?",
      ta: "இஎம்ஐ செலுத்த முடியுமா?",
      hi: "क्या ईएमआई चुका सकता हूँ?",
    },
    query: {
      en: "Can I pay my bike EMI of ₹4,200 due on the 5th?",
      ta: "5-ம் தேதி வரவிருக்கும் ₹4,200 பைக் இஎம்ஐ-யை என்னால் செலுத்த முடியுமா?",
      hi: "क्या मैं 5 तारीख को आने वाली ₹4,200 की बाइक ईएमआई चुका सकता हूँ?",
    },
  },
  {
    id: "rent",
    icon: Home,
    label: {
      en: "Can I pay my rent?",
      ta: "வாடகை செலுத்த முடியுமா?",
      hi: "क्या किराया दे सकता हूँ?",
    },
    query: {
      en: "Can I pay my rent of ₹6,500 due on the 10th?",
      ta: "10-ம் தேதி வரவிருக்கும் ₹6,500 வீட்டு வாடகையை என்னால் செலுத்த முடியுமா?",
      hi: "क्या मैं 10 तारीख को आने वाला ₹6,500 का किराया दे सकता हूँ?",
    },
  },
  {
    id: "safe-spend",
    icon: Shield,
    label: {
      en: "Safe-to-spend today?",
      ta: "பாதுகாப்பான தினசரி செலவு?",
      hi: "सुरक्षित खर्च सीमा?",
    },
    query: {
      en: "How much can I safely spend today after bills and savings?",
      ta: "பில் மற்றும் சேமிப்பு கழித்து இன்று எவ்வளவு பாதுகாப்பாக செலவழிக்கலாம்?",
      hi: "सभी बिल और बचत के बाद आज मैं सुरक्षित रूप से कितना खर्च कर सकता हूँ?",
    },
  },
  {
    id: "schemes",
    icon: FileText,
    label: {
      en: "Eligible welfare schemes?",
      ta: "அரசு நலத்திட்டங்கள்?",
      hi: "सरकारी कल्याण योजनाएं?",
    },
    query: {
      en: "What government or platform welfare schemes may I be eligible for?",
      ta: "நான் தகுதிபெறும் அரசு அல்லது தள நலத்திட்டங்கள் என்ன?",
      hi: "मैं किन सरकारी या प्लेटफॉर्म कल्याणकारी योजनाओं के लिए पात्र हूँ?",
    },
  },
]

const QUICK_QUESTIONS: Record<SupportedLang, string[]> = {
  en: [
    "Can I pay my EMI?",
    "Can I pay my rent?",
    "How much can I safely spend?",
    "What government schemes may I be eligible for?",
    "What insurance options are relevant?",
    "Why is my health score 72?",
    "What should I do next?",
  ],
  ta: [
    "என் பைக் இஎம்ஐ-யை என்னால் செலுத்த முடியுமா?",
    "வீட்டு வாடகையை என்னால் செலுத்த முடியுமா?",
    "இன்று எவ்வளவு பாதுகாப்பாக செலவழிக்கலாம்?",
    "நான் தகுதிபெறும் அரசு நலத்திட்டங்கள் என்ன?",
    "எனக்கு பொருத்தமான காப்பீட்டுத் திட்டங்கள் என்ன?",
    "என் நிதி ஆரோக்கிய மதிப்பெண் ஏன் 72?",
    "அடுத்து நான் என்ன நடவடிக்கை எடுக்க வேண்டும்?",
  ],
  hi: [
    "क्या मैं अपनी बाइक ईएमआई चुका सकता हूँ?",
    "क्या मैं अपने मकान का किराया दे सकता हूँ?",
    "आज मैं सुरक्षित रूप से कितना खर्च कर सकता हूँ?",
    "मैं किन सरकारी योजनाओं के लिए पात्र हूँ?",
    "मेरे लिए कौन से बीमा विकल्प सही हैं?",
    "मेरा वित्तीय स्वास्थ्य स्कोर 72 क्यों है?",
    "मुझे आगे क्या कदम उठाना चाहिए?",
  ],
}

const GREETING_TEXT: Record<SupportedLang, { title: string; desc: string; badge: string }> = {
  en: {
    title: "Hi, I'm FINNA.",
    desc: "Ask me about your EMI, rent, safe-to-spend or government schemes.",
    badge: "Grounded in your RBI AA statement and gig payouts",
  },
  ta: {
    title: "வணக்கம், நான் FINNA.",
    desc: "உங்கள் இஎம்ஐ, வீட்டு வாடகை, பாதுகாப்பான செலவு அல்லது அரசு நலத்திட்டங்கள் பற்றி கேளுங்கள்.",
    badge: "உங்கள் RBI AA வங்கி அறிக்கை மற்றும் ஸ்விக்கி/உபர் பதிவுகளின் அடிப்படையில்",
  },
  hi: {
    title: "नमस्ते, मैं FINNA हूँ।",
    desc: "अपनी ईएमआई, किराया, सुरक्षित खर्च या सरकारी योजनाओं के बारे में पूछें।",
    badge: "आपके RBI AA बैंक विवरण और स्विगी/उबर आय पर आधारित",
  },
}

// Progressive typewriter component for assistant responses
function TypedAssistantContent({
  text,
  animate = false,
  onDone,
}: {
  text: string
  animate?: boolean
  onDone?: () => void
}) {
  const [displayed, setDisplayed] = React.useState(animate ? "" : text)
  const [isTyping, setIsTyping] = React.useState(animate)

  React.useEffect(() => {
    if (!animate) {
      setDisplayed(text)
      setIsTyping(false)
      return
    }

    setDisplayed("")
    setIsTyping(true)
    let idx = 0
    const step = 4
    const timer = setInterval(() => {
      idx += step
      if (idx >= text.length) {
        setDisplayed(text)
        setIsTyping(false)
        clearInterval(timer)
        onDone?.()
      } else {
        setDisplayed(text.slice(0, idx))
      }
    }, 20)

    return () => clearInterval(timer)
  }, [text, animate, onDone])

  return (
    <div className="whitespace-pre-line leading-relaxed text-black dark:text-white">
      {displayed}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-black dark:bg-white ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  )
}

export function CopilotPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  const pathname = usePathname()

  // Coordinated Open and Close handlers
  const handleOpen = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("finna:close-all-overlays", { detail: { source: "copilot" } }))
      window.dispatchEvent(new CustomEvent("finna:copilot-state", { detail: { isOpen: true } }))
    }
    setIsOpen(true)
  }, [])

  const handleClose = React.useCallback(() => {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      window.dispatchEvent(new CustomEvent("finna:copilot-state", { detail: { isOpen: false } }))
    }
    setAvatarState("idle")
    setIsOpen(false)
  }, [])

  // Track mount & prefers-reduced-motion
  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Auto-close on route changes
  React.useEffect(() => {
    if (isOpen) {
      handleClose()
    }
  }, [pathname, handleClose])

  // Overlay coordination & Escape key handler
  React.useEffect(() => {
    const handleCloseOverlays = (e: any) => {
      if (e.detail?.source !== "copilot") {
        handleClose()
      }
    }
    const handleOpenCopilot = () => handleOpen()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    window.addEventListener("finna:close-all-overlays", handleCloseOverlays)
    window.addEventListener("finna:close-copilot", handleClose)
    window.addEventListener("finna:open-copilot", handleOpenCopilot)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("finna:close-all-overlays", handleCloseOverlays)
      window.removeEventListener("finna:close-copilot", handleClose)
      window.removeEventListener("finna:open-copilot", handleOpenCopilot)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleClose, handleOpen])

  // Single body scroll lock with clean restoration on close, route change, or unmount
  React.useEffect(() => {
    if (typeof document === "undefined") return

    if (isOpen) {
      const prevOverflow = document.body.style.overflow
      const prevTouchAction = document.body.style.touchAction
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"

      return () => {
        document.body.style.overflow = prevOverflow
        document.body.style.touchAction = prevTouchAction
      }
    }
  }, [isOpen])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [language, setLanguage] = React.useState<SupportedLang>("en")
  const [avatarState, setAvatarState] = React.useState<CopilotState>("idle")
  const [mouthShapeIndex, setMouthShapeIndex] = React.useState<number>(0)
  const [isListening, setIsListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(true)
  const [voiceNotice, setVoiceNotice] = React.useState<string | null>(null)
  const [ttsEnabled, setTtsEnabled] = React.useState(true)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [showHistory, setShowHistory] = React.useState(false)
  const [recentQueries, setRecentQueries] = React.useState<string[]>([
    "Can I pay my EMI of ₹4,200?",
    "How much can I spend safely today?",
    "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana details",
  ])

  const [messages, setMessages] = React.useState<Message[]>([])
  const [userName, setUserName] = React.useState<string>("")
  const [cityName, setCityName] = React.useState<string>("")
  const [isEstimateMode, setIsEstimateMode] = React.useState<boolean>(false)

  // Onboarding & Financial Estimation State (Scoped strictly to FINNA Copilot)
  const [onboardingStep, setOnboardingStep] = React.useState<number>(0)
  const [copilotProfile, setCopilotProfile] = React.useState<CopilotProfileData>(DEFAULT_COPILOT_PROFILE)
  const [selectedMultiOptions, setSelectedMultiOptions] = React.useState<string[]>([])
  const [activeEditField, setActiveEditField] = React.useState<"income" | "expenses" | "hours" | "city" | null>(null)
  const [latestEstimate, setLatestEstimate] = React.useState<CopilotEstimateResult | null>(null)
  const [onboardedStatus, setOnboardedStatus] = React.useState<boolean>(false)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<any>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Load User and Estimate details
  React.useEffect(() => {
    function loadUserDetails() {
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("finna_user")
          if (storedUser) {
            const parsed = JSON.parse(storedUser)
            const n = parsed.name || parsed.full_name
            if (n) setUserName(n.trim().split(" ")[0])
            if (parsed.city) setCityName(parsed.city)
          }
          const hasEstimate = localStorage.getItem("finna_estimate_mode") === "true" || localStorage.getItem("finna_estimate_profile") !== null
          const hasAA = localStorage.getItem("finna_aa_complete") === "true" || localStorage.getItem("finna_active_aa_consent") !== null
          setIsEstimateMode(hasEstimate && !hasAA)

          const storedProfile = getStoredCopilotProfile()
          const onboarded = isCopilotOnboarded()
          setOnboardedStatus(onboarded)
          if (storedProfile) {
            setCopilotProfile(storedProfile)
            setLatestEstimate(calculateCopilotEstimate(storedProfile, language))
          }
        } catch {}
      }
    }
    loadUserDetails()
    window.addEventListener("finna_data_updated", loadUserDetails)
    window.addEventListener("finna_profile_updated", loadUserDetails)
    return () => {
      window.removeEventListener("finna_data_updated", loadUserDetails)
      window.removeEventListener("finna_profile_updated", loadUserDetails)
    }
  }, [language])

  // Initialize Speech Recognition capability check
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isCapacitor = (window as any).Capacitor?.isNativePlatform?.() === true
      const hasWebSpeech =
        (window as any).SpeechRecognition !== undefined ||
        (window as any).webkitSpeechRecognition !== undefined

      if (!isCapacitor && !hasWebSpeech) {
        setSpeechSupported(false)
      }
    }
  }, [])

  // Auto scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen, isLoading, avatarState])

  // Handle Copy message
  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Text to Speech playback with mouth synchronization (5 shapes driven by boundary + fallback)
  const speakText = (text: string, langCode: SupportedLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()

    if (!ttsEnabled) {
      setAvatarState("idle")
      setMouthShapeIndex(0)
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langCode === "ta" ? "ta-IN" : langCode === "hi" ? "hi-IN" : "en-IN"
      utterance.rate = 0.96
      utterance.pitch = 1.0

      let fallbackTimer: NodeJS.Timeout | null = null

      utterance.onstart = () => {
        setAvatarState("speaking")
        setMouthShapeIndex(2)

        // Randomized fallback timer between 120ms and 180ms to keep mouth cycling naturally
        fallbackTimer = setInterval(() => {
          setMouthShapeIndex((prev) => {
            const next = ((prev ?? 0) + 1) % 5
            return next === 0 ? 1 : next
          })
        }, 145)
      }

      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name === "word") {
          setMouthShapeIndex((prev) => ((prev ?? 0) % 4) + 1)
        }
      }

      const stopSpeaking = () => {
        if (fallbackTimer) clearInterval(fallbackTimer)
        setAvatarState("idle")
        setMouthShapeIndex(0)
      }

      utterance.onend = stopSpeaking
      utterance.onerror = stopSpeaking

      window.speechSynthesis.speak(utterance)
    } catch {
      setAvatarState("idle")
      setMouthShapeIndex(0)
    }
  }

  // Proactively request and verify microphone permission via getUserMedia.
  // CRITICAL FOR MOBILE PHONES: On mobile Chrome, Safari, and WebViews, calling SpeechRecognition.start()
  // directly does not invoke the native OS/browser permission prompt if not already granted,
  // causing an immediate 'not-allowed' rejection. Calling getUserMedia in response to user tap
  // triggers the native prompt. Once granted, tracks are stopped immediately to release hardware locks.
  const ensureMicrophonePermission = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    // 1. Check Permissions API if supported (avoid prompting if user explicitly blocked)
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      try {
        const permStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (permStatus.state === "denied") {
          setVoiceNotice(
            "Microphone access is blocked. Tap the lock/tune icon in your address bar (or Android App Settings) and change Microphone to 'Allow'."
          )
          return false
        }
      } catch {
        // Permissions query for 'microphone' is not supported in some browsers (e.g. Safari iOS)
      }
    }

    // 2. Trigger native browser & OS permission dialog via getUserMedia
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        // CRITICAL FOR ANDROID: Stop all media tracks immediately.
        // Android's AudioRecord HAL permits only one audio capture client.
        // Stopping tracks immediately releases the audio device for SpeechRecognition.
        stream.getTracks().forEach((track) => track.stop())
        return true
      } catch (err: any) {
        console.warn("Microphone getUserMedia prompt error:", err)
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
          setVoiceNotice(
            "Microphone permission was denied. Tap 'Allow' when your browser asks for microphone access, or enable it in browser settings."
          )
        } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
          setVoiceNotice("No microphone found on this device.")
        } else {
          setVoiceNotice("Could not access microphone. Please check your phone settings.")
        }
        return false
      }
    }

    return true
  }

  // Capacitor Native Speech Recognition (supports Capacitor 3, 4, 5, 6)
  const startCapacitorSpeech = async () => {
    try {
      const Capacitor = (window as any).Capacitor
      const SpeechPlugin = Capacitor?.Plugins?.SpeechRecognition
      if (!SpeechPlugin) {
        throw new Error("SpeechRecognition plugin not found on Capacitor")
      }

      // Check device availability if supported
      if (typeof SpeechPlugin.available === "function") {
        const { available } = await SpeechPlugin.available()
        if (!available) {
          throw new Error("Speech recognition service not available on device")
        }
      }

      // Check and request permissions supporting both modern and legacy Capacitor APIs
      let hasAudioPerm = false
      if (typeof SpeechPlugin.checkPermissions === "function") {
        const status = await SpeechPlugin.checkPermissions()
        if (status?.speechRecognition === "granted" || status?.microphone === "granted") {
          hasAudioPerm = true
        } else if (typeof SpeechPlugin.requestPermissions === "function") {
          const req = await SpeechPlugin.requestPermissions()
          if (req?.speechRecognition === "granted" || req?.microphone === "granted") {
            hasAudioPerm = true
          }
        }
      } else if (typeof SpeechPlugin.hasPermission === "function") {
        const perm = await SpeechPlugin.hasPermission()
        if (perm?.permission) {
          hasAudioPerm = true
        } else if (typeof SpeechPlugin.requestPermission === "function") {
          const req = await SpeechPlugin.requestPermission()
          if (req?.permission) {
            hasAudioPerm = true
          }
        }
      } else {
        hasAudioPerm = true
      }

      if (!hasAudioPerm) {
        setVoiceNotice(
          "Microphone permission was denied. Tap App Info > Permissions > Microphone in Android Settings to enable."
        )
        return
      }

      setIsListening(true)
      setAvatarState("listening")
      setVoiceNotice(null)

      let listenerCleanup: (() => void) | null = null
      if (typeof SpeechPlugin.addListener === "function") {
        const handle = await SpeechPlugin.addListener("partialResults", (data: any) => {
          if (data?.matches?.length) {
            setInput(data.matches[0])
          }
        })
        listenerCleanup = () => {
          if (typeof handle?.remove === "function") handle.remove()
        }
      }

      const result = await SpeechPlugin.start({
        language: language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN",
        maxResults: 1,
        prompt: "Speak to FINNA Copilot...",
        partialResults: true,
        popup: false,
      })

      if (listenerCleanup) listenerCleanup()

      if (result?.matches?.length) {
        const spoken = result.matches[0]
        setInput(spoken)
        setIsListening(false)
        setAvatarState("thinking")
        handleSend(spoken)
      } else {
        setIsListening(false)
        setAvatarState("idle")
      }
    } catch (err: any) {
      console.warn("Capacitor speech recognition notice, trying browser fallback:", err)
      await startWebSpeech()
    }
  }

  // Web Speech API with real-time feedback & mobile resilience
  const startWebSpeech = async () => {
    try {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRec) {
        setVoiceNotice(
          "Speech recognition is not supported in this browser view. Please use Chrome on your phone, or type below."
        )
        return
      }

      // Step 1: Ensure microphone permission is granted (triggers prompt if not yet allowed)
      const hasPerm = await ensureMicrophonePermission()
      if (!hasPerm) return

      // Small delay on mobile to ensure OS audio device is freed by getUserMedia
      await new Promise((resolve) => setTimeout(resolve, 100))

      const recognition = new SpeechRec()
      recognitionRef.current = recognition
      recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN"
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
        setAvatarState("listening")
        setVoiceNotice(null)
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i]
          if (item?.isFinal) {
            finalTranscript += item[0]?.transcript || ""
          } else {
            interimTranscript += item[0]?.transcript || ""
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim()
        if (currentText) {
          setInput(currentText)
        }

        if (finalTranscript.trim()) {
          setIsListening(false)
          setAvatarState("thinking")
          handleSend(finalTranscript.trim())
        }
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error)
        setIsListening(false)
        setAvatarState("idle")
        if (event.error === "no-speech") {
          setVoiceNotice("No voice detected. Please speak closer to the microphone or type below.")
        } else if (event.error === "not-allowed") {
          setVoiceNotice(
            "Microphone permission was not allowed. Tap the lock/tune icon in your address bar to allow Microphone."
          )
        } else if (event.error === "network") {
          setVoiceNotice("Speech recognition network error. Please check your internet connection or type below.")
        } else if (event.error === "audio-capture") {
          setVoiceNotice("Microphone is currently unavailable. Ensure no other recording app is open.")
        } else {
          setVoiceNotice("Speech recognition interrupted. You can type your query below.")
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        if (!isLoading) {
          setAvatarState("idle")
        }
      }

      recognition.start()
    } catch (err: any) {
      console.error("Speech Recognition failed:", err)
      setIsListening(false)
      setAvatarState("idle")
      setVoiceNotice("Could not access microphone. Tap the lock icon in your address bar to allow Microphone.")
    }
  }

  // Toggle voice recognition
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
      }
      const Capacitor = typeof window !== "undefined" ? (window as any).Capacitor : undefined
      if (Capacitor?.Plugins?.SpeechRecognition?.stop) {
        try {
          await Capacitor.Plugins.SpeechRecognition.stop()
        } catch {}
      }
      setIsListening(false)
      setAvatarState("idle")
      return
    }

    setVoiceNotice(null)

    const isCapacitorNative =
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform?.() === true

    if (isCapacitorNative && (window as any).Capacitor?.Plugins?.SpeechRecognition) {
      await startCapacitorSpeech()
    } else {
      await startWebSpeech()
    }
  }

  // Onboarding Start
  const startOnboarding = React.useCallback(
    (langCode: SupportedLang = language) => {
      setOnboardingStep(1)
      setSelectedMultiOptions(["Swiggy", "Zomato"])
      setActiveEditField(null)
      const step1 = COPILOT_ONBOARDING_STEPS[0]
      const greetingMsg: Message = {
        id: `ai-onboarding-1-${Date.now()}`,
        role: "assistant",
        content:
          langCode === "ta"
            ? `வணக்கம்! நான் FINNA Copilot.\nஉங்கள் நிதி நிலை, பாதுகாப்பான தினசரி செலவு மற்றும் சேமிப்பை துல்லியமாக மதிப்பிட 6 எளிய கேள்விகள்.\n\n**கேள்வி 1/6: ${step1.title}**\n${step1.prompt.ta}\n\n*${step1.subtitle?.ta || ""}*`
            : langCode === "hi"
            ? `नमस्ते! मैं FINNA Copilot हूँ।\nआपकी वित्तीय स्थिति, सुरक्षित दैनिक खर्च और बचत का सटीक अनुमान लगाने के लिए 6 त्वरित प्रश्न।\n\n**प्रश्न 1/6: ${step1.title}**\n${step1.prompt.hi}\n\n*${step1.subtitle?.hi || ""}*`
            : `Hey! I'm FINNA Copilot.\nLet's calculate your personalized daily safe-to-spend limit, savings potential, and emergency cushion in 6 quick questions.\n\n**Question 1/6: ${step1.title}**\n${step1.prompt.en}\n\n*${step1.subtitle?.en || ""}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      }
      setMessages([greetingMsg])
      if (ttsEnabled) {
        speakText(
          langCode === "ta"
            ? "வணக்கம்! நீங்கள் எந்த தளங்களில் பணிபுரிகிறீர்கள்?"
            : langCode === "hi"
            ? "नमस्ते! आप किन प्लेटफॉर्म्स पर काम करते हैं?"
            : "Hey! Which platforms do you work on?",
          langCode
        )
      }
    },
    [language, ttsEnabled]
  )

  // Auto-start conversational onboarding if not yet onboarded and chat is empty
  React.useEffect(() => {
    if (isOpen && messages.length === 0 && !isCopilotOnboarded()) {
      startOnboarding(language)
    }
  }, [isOpen, messages.length, language, startOnboarding])

  // Single option selection handler for steps 2, 3, 4, 5
  const handleOnboardingOptionSelect = (val: string, displayLabel?: string) => {
    if (onboardingStep < 1 || onboardingStep > 6) return

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Step 2: City / Area
    if (onboardingStep === 2) {
      const updated = { ...copilotProfile, city: val }
      setCopilotProfile(updated)
      const userMsg: Message = {
        id: `user-step2-${Date.now()}`,
        role: "user",
        content: displayLabel || val,
        timestamp: nowTime,
      }
      const step3 = COPILOT_ONBOARDING_STEPS[2]
      const aiMsg: Message = {
        id: `ai-step3-${Date.now()}`,
        role: "assistant",
        content:
          language === "ta"
            ? `**கேள்வி 3/6: ${step3.title}**\n${step3.prompt.ta}\n\n*${step3.subtitle?.ta || ""}*`
            : language === "hi"
            ? `**प्रश्न 3/6: ${step3.title}**\n${step3.prompt.hi}\n\n*${step3.subtitle?.hi || ""}*`
            : `**Question 3/6: ${step3.title}**\n${step3.prompt.en}\n\n*${step3.subtitle?.en || ""}*`,
        timestamp: nowTime,
        isNew: true,
      }
      setMessages((prev) => [...prev, userMsg, aiMsg])
      setOnboardingStep(3)
      if (ttsEnabled) speakText(step3.prompt[language], language)
      return
    }

    // Step 3: Hours / Days
    if (onboardingStep === 3) {
      const hrs = parseInt(val, 10) || 48
      const updated = {
        ...copilotProfile,
        hoursPerWeek: hrs,
        hoursLabel: displayLabel || `${hrs} hrs/wk`,
      }
      setCopilotProfile(updated)
      const userMsg: Message = {
        id: `user-step3-${Date.now()}`,
        role: "user",
        content: displayLabel || `${hrs} hrs/wk`,
        timestamp: nowTime,
      }
      const step4 = COPILOT_ONBOARDING_STEPS[3]
      const aiMsg: Message = {
        id: `ai-step4-${Date.now()}`,
        role: "assistant",
        content:
          language === "ta"
            ? `**கேள்வி 4/6: ${step4.title}**\n${step4.prompt.ta}\n\n*${step4.subtitle?.ta || ""}*`
            : language === "hi"
            ? `**प्रश्न 4/6: ${step4.title}**\n${step4.prompt.hi}\n\n*${step4.subtitle?.hi || ""}*`
            : `**Question 4/6: ${step4.title}**\n${step4.prompt.en}\n\n*${step4.subtitle?.en || ""}*`,
        timestamp: nowTime,
        isNew: true,
      }
      setMessages((prev) => [...prev, userMsg, aiMsg])
      setOnboardingStep(4)
      if (ttsEnabled) speakText(step4.prompt[language], language)
      return
    }

    // Step 4: Monthly Income Range
    if (onboardingStep === 4) {
      let low = 25000
      let high = 35000
      let exp = 30000
      if (val.includes("-")) {
        const parts = val.split("-").map((p) => parseInt(p.trim(), 10))
        if (parts[0]) low = parts[0]
        if (parts[1]) high = parts[1]
        exp = Math.round((low + high) / 2)
      } else {
        const parsed = parseInt(val.replace(/\D/g, ""), 10)
        if (parsed > 0) {
          exp = parsed
          low = Math.round(parsed * 0.85)
          high = Math.round(parsed * 1.15)
        }
      }
      const updated = {
        ...copilotProfile,
        monthlyIncomeRange: displayLabel || `₹${low.toLocaleString("en-IN")} – ₹${high.toLocaleString("en-IN")}`,
        monthlyIncomeLow: low,
        monthlyIncomeHigh: high,
        monthlyIncomeExpected: exp,
      }
      setCopilotProfile(updated)
      const userMsg: Message = {
        id: `user-step4-${Date.now()}`,
        role: "user",
        content: displayLabel || `₹${low.toLocaleString("en-IN")} – ₹${high.toLocaleString("en-IN")}`,
        timestamp: nowTime,
      }
      const step5 = COPILOT_ONBOARDING_STEPS[4]
      const aiMsg: Message = {
        id: `ai-step5-${Date.now()}`,
        role: "assistant",
        content:
          language === "ta"
            ? `**கேள்வி 5/6: ${step5.title}**\n${step5.prompt.ta}\n\n*${step5.subtitle?.ta || ""}*`
            : language === "hi"
            ? `**प्रश्न 5/6: ${step5.title}**\n${step5.prompt.hi}\n\n*${step5.subtitle?.hi || ""}*`
            : `**Question 5/6: ${step5.title}**\n${step5.prompt.en}\n\n*${step5.subtitle?.en || ""}*`,
        timestamp: nowTime,
        isNew: true,
      }
      setMessages((prev) => [...prev, userMsg, aiMsg])
      setOnboardingStep(5)
      if (ttsEnabled) speakText(step5.prompt[language], language)
      return
    }

    // Step 5: Major Fixed Expenses
    if (onboardingStep === 5) {
      let rent = 6000
      let emi = 3000
      let fuel = 4000
      let living = 3000
      if (val.includes(":")) {
        const pairs = val.split(",")
        pairs.forEach((pair) => {
          const [k, v] = pair.split(":")
          const num = parseInt(v, 10) || 0
          if (k.trim() === "rent") rent = num
          if (k.trim() === "emi") emi = num
          if (k.trim() === "fuel") fuel = num
          if (k.trim() === "living") living = num
        })
      }
      const total = rent + emi + fuel + living
      const updated = {
        ...copilotProfile,
        rentAmount: rent,
        emiAmount: emi,
        fuelAmount: fuel,
        livingAmount: living,
        totalFixedExpenses: total,
        fixedExpensesLabel: displayLabel || `~₹${total.toLocaleString("en-IN")}/mo`,
      }
      setCopilotProfile(updated)
      const userMsg: Message = {
        id: `user-step5-${Date.now()}`,
        role: "user",
        content: displayLabel || `Fixed: Rent ₹${rent}, EMI ₹${emi}, Fuel ₹${fuel}`,
        timestamp: nowTime,
      }
      const step6 = COPILOT_ONBOARDING_STEPS[5]
      const aiMsg: Message = {
        id: `ai-step6-${Date.now()}`,
        role: "assistant",
        content:
          language === "ta"
            ? `**கேள்வி 6/6: ${step6.title}**\n${step6.prompt.ta}\n\n*${step6.subtitle?.ta || ""}*`
            : language === "hi"
            ? `**प्रश्न 6/6: ${step6.title}**\n${step6.prompt.hi}\n\n*${step6.subtitle?.hi || ""}*`
            : `**Question 6/6: ${step6.title}**\n${step6.prompt.en}\n\n*${step6.subtitle?.en || ""}*`,
        timestamp: nowTime,
        isNew: true,
      }
      setSelectedMultiOptions(["safe-to-spend", "emergency-fund", "loan-affordability", "government-schemes"])
      setMessages((prev) => [...prev, userMsg, aiMsg])
      setOnboardingStep(6)
      if (ttsEnabled) speakText(step6.prompt[language], language)
      return
    }
  }

  // Multi-option submission for Steps 1 and 6
  const handleMultiSubmit = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (onboardingStep === 1) {
      const selected = selectedMultiOptions.length > 0 ? selectedMultiOptions : ["Swiggy", "Zomato"]
      const updated = { ...copilotProfile, platforms: selected }
      setCopilotProfile(updated)
      const userMsg: Message = {
        id: `user-step1-${Date.now()}`,
        role: "user",
        content: selected.join(", "),
        timestamp: nowTime,
      }
      const step2 = COPILOT_ONBOARDING_STEPS[1]
      const aiMsg: Message = {
        id: `ai-step2-${Date.now()}`,
        role: "assistant",
        content:
          language === "ta"
            ? `**கேள்வி 2/6: ${step2.title}**\n${step2.prompt.ta}\n\n*${step2.subtitle?.ta || ""}*`
            : language === "hi"
            ? `**प्रश्न 2/6: ${step2.title}**\n${step2.prompt.hi}\n\n*${step2.subtitle?.hi || ""}*`
            : `**Question 2/6: ${step2.title}**\n${step2.prompt.en}\n\n*${step2.subtitle?.en || ""}*`,
        timestamp: nowTime,
        isNew: true,
      }
      setMessages((prev) => [...prev, userMsg, aiMsg])
      setOnboardingStep(2)
      if (ttsEnabled) speakText(step2.prompt[language], language)
      return
    }

    if (onboardingStep === 6) {
      const selectedGoals =
        selectedMultiOptions.length > 0
          ? selectedMultiOptions
          : ["safe-to-spend", "emergency-fund", "loan-affordability", "government-schemes"]
      const updated = { ...copilotProfile, goals: selectedGoals }
      const userMsg: Message = {
        id: `user-step6-${Date.now()}`,
        role: "user",
        content:
          language === "ta"
            ? "மதிப்பீடுகளைக் கணக்கிடுங்கள்"
            : language === "hi"
            ? "वित्तीय अनुमान की गणना करें"
            : "Calculate my financial estimates",
        timestamp: nowTime,
      }
      setMessages((prev) => [...prev, userMsg])
      completeOnboarding(updated)
      return
    }
  }

  // Complete onboarding, calculate estimates, save, and present results
  const completeOnboarding = (finalProfile: CopilotProfileData) => {
    saveCopilotProfile(finalProfile)
    setCopilotProfile(finalProfile)
    setOnboardedStatus(true)
    setOnboardingStep(0)
    setIsLoading(true)
    setAvatarState("thinking")

    setTimeout(() => {
      const estimate = calculateCopilotEstimate(finalProfile, language)
      setLatestEstimate(estimate)
      setIsLoading(false)
      setAvatarState("idle")

      const assistantMsg: Message = {
        id: `ai-estimate-${Date.now()}`,
        role: "assistant",
        content: estimate.formattedExplanation,
        isEstimateCard: true,
        estimateData: estimate,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      }
      setMessages((prev) => [...prev, assistantMsg])

      const speechScript =
        language === "ta"
          ? `உங்கள் விவரங்களின்படி, மதிப்பிடப்பட்ட தினசரி பாதுகாப்பான செலவு ₹${estimate.dailySafeToSpend.low} முதல் ₹${estimate.dailySafeToSpend.high} வரை. நீங்கள் எந்தக் கேள்வியும் கேட்கலாம்.`
          : language === "hi"
          ? `आपके विवरण के आधार पर, अनुमानित दैनिक सुरक्षित खर्च ₹${estimate.dailySafeToSpend.low} से ₹${estimate.dailySafeToSpend.high} है। अब आप कोई भी वित्तीय प्रश्न पूछ सकते हैं।`
          : `Based on your details, your estimated safe-to-spend is ₹${estimate.dailySafeToSpend.low} to ₹${estimate.dailySafeToSpend.high} per day, with monthly savings potential of ₹${estimate.monthlySavings.low.toLocaleString("en-IN")} to ₹${estimate.monthlySavings.high.toLocaleString("en-IN")}. I'm now ready to answer any questions!`

      if (ttsEnabled) {
        speakText(speechScript, language)
      }
    }, 400)
  }

  // Handle typed/spoken input during active onboarding steps
  const handleTextAnswerForCurrentStep = (text: string) => {
    if (onboardingStep === 1) {
      const parts = text.split(/[,/& ]+/).filter(Boolean)
      const selected = parts.length > 0 ? parts : ["Swiggy"]
      setSelectedMultiOptions(selected)
      handleMultiSubmit()
      return
    }
    if (onboardingStep === 2) {
      handleOnboardingOptionSelect(text, text)
      return
    }
    if (onboardingStep === 3) {
      const numMatch = text.match(/\d+/)
      const hrs = numMatch ? parseInt(numMatch[0], 10) : 48
      handleOnboardingOptionSelect(hrs.toString(), `${hrs} hrs/wk`)
      return
    }
    if (onboardingStep === 4) {
      const numMatch = text.replace(/k/gi, "000").match(/\d+/)
      const inc = numMatch ? parseInt(numMatch[0], 10) : 30000
      handleOnboardingOptionSelect(inc.toString(), `₹${inc.toLocaleString("en-IN")}/mo`)
      return
    }
    if (onboardingStep === 5) {
      let rent = 6000
      let emi = 3000
      let fuel = 4000
      const rentM = text.match(/rent\D*(\d+)/i)
      const emiM = text.match(/emi\D*(\d+)/i)
      const fuelM = text.match(/fuel\D*(\d+)|petrol\D*(\d+)/i)
      if (rentM) rent = parseInt(rentM[1], 10)
      if (emiM) emi = parseInt(emiM[1], 10)
      if (fuelM) fuel = parseInt(fuelM[1] || fuelM[2], 10)
      const total = rent + emi + fuel + 3000
      handleOnboardingOptionSelect(
        `rent:${rent},emi:${emi},fuel:${fuel},living:3000`,
        `Fixed expenses: ~₹${total.toLocaleString("en-IN")}/mo`
      )
      return
    }
    if (onboardingStep === 6) {
      handleMultiSubmit()
      return
    }
  }

  // Apply assumption edit patches in real-time
  const handleApplyAssumptionPatch = (patch: Partial<CopilotProfileData>, label: string) => {
    const updated = { ...copilotProfile, ...patch }
    saveCopilotProfile(updated)
    setCopilotProfile(updated)
    setActiveEditField(null)

    const estimate = calculateCopilotEstimate(updated, language)
    setLatestEstimate(estimate)

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: Message = {
      id: `user-patch-${Date.now()}`,
      role: "user",
      content:
        language === "ta"
          ? `அனுமானம் மாற்றப்பட்டது: ${label}`
          : language === "hi"
          ? `अनुमान बदला गया: ${label}`
          : `Updated assumption: ${label}`,
      timestamp: nowTime,
    }

    const assistantMsg: Message = {
      id: `ai-estimate-revised-${Date.now()}`,
      role: "assistant",
      content:
        (language === "ta"
          ? `✅ **அனுமானம் புதுப்பிக்கப்பட்டது (${label})**\nஇதோ உங்கள் திருத்தப்பட்ட நிதி அடிப்படை மதிப்பீடு:\n\n`
          : language === "hi"
          ? `✅ **अनुमान अद्यतन किया गया (${label})**\nयहाँ आपका संशोधित वित्तीय आधारभूत अनुमान है:\n\n`
          : `✅ **Assumption Updated (${label})**\nHere is your revised financial baseline estimate:\n\n`) +
        estimate.formattedExplanation,
      isEstimateCard: true,
      estimateData: estimate,
      timestamp: nowTime,
      isNew: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
  }

  // Restart onboarding from scratch
  const handleRestartOnboarding = () => {
    resetCopilotProfile()
    setOnboardedStatus(false)
    setActiveEditField(null)
    setMessages([])
    startOnboarding(language)
  }

  // Send query
  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim()
    if (!text || isLoading) return

    // If currently in an onboarding step, treat input as answer for that step
    if (onboardingStep >= 1 && onboardingStep <= 6) {
      setInput("")
      handleTextAnswerForCurrentStep(text)
      return
    }

    // Check for redo / restart intents
    const lower = text.toLowerCase()
    if (
      lower.includes("restart onboarding") ||
      lower.includes("redo onboarding") ||
      lower.includes("re-estimate") ||
      lower.includes("start over") ||
      lower.includes("redo profile") ||
      lower.includes("மீண்டும் தொடங்க") ||
      lower.includes("फिर से शुरू")
    ) {
      setInput("")
      handleRestartOnboarding()
      return
    }

    // Save to recent queries
    setRecentQueries((prev) => [text, ...prev.filter((q) => q !== text)].slice(0, 6))

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setAvatarState("thinking")

    try {
      let customMaster = undefined
      let customGig = undefined
      if (typeof window !== "undefined") {
        try {
          const mStr = localStorage.getItem("finna_arun_override")
          if (mStr) customMaster = JSON.parse(mStr)
          const gStr = localStorage.getItem("finna_gig_override")
          if (gStr) customGig = JSON.parse(gStr)
        } catch {}
      }

      const res = await fetch("/api/v1/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          customMaster,
          customGig,
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content || "I have analyzed your financial records.",
        audioText: data.audioText,
        intent: data.intent,
        mathFormula: data.mathematicalReasoning?.formula,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto play speech if TTS is active
      if (ttsEnabled && data.audioText) {
        speakText(data.audioText, data.language || language)
      } else {
        setAvatarState("idle")
      }
    } catch (err) {
      setAvatarState("idle")
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble reaching the financial advisory engine. Please check your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isNew: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (id: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: rating } : m))
    )
  }

  const handleToggleTts = () => {
    const nextState = !ttsEnabled
    setTtsEnabled(nextState)
    if (!nextState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setAvatarState("idle")
      setMouthShapeIndex(0)
    }
  }

  const handleNewChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setAvatarState("idle")
    setMouthShapeIndex(0)
    setMessages([])
    setInput("")
    setShowHistory(false)
  }

  const statusBadge = {
    idle: {
      label: "Idle",
      dot: "bg-[#737373] dark:bg-[#a3a3a3]",
      style: "bg-[#f5f5f5] text-[#525252] dark:bg-[#1f1f1f] dark:text-[#a3a3a3] border-[#e5e5e5] dark:border-[#333333]",
    },
    listening: {
      label: "Listening",
      dot: "bg-red-500 animate-ping",
      style: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900",
    },
    thinking: {
      label: "Thinking",
      dot: "bg-amber-500 animate-pulse",
      style: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900",
    },
    speaking: {
      label: "Speaking",
      dot: "bg-emerald-500 animate-pulse",
      style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    },
  }[avatarState]

  return (
    <>
      {/* Floating Action Launcher Button (When Panel is Closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[45] flex items-center gap-2.5 h-12 pl-2 pr-4 rounded-full bg-black text-white hover:bg-[#222222] dark:bg-white dark:text-black dark:hover:bg-[#f0f0f0] shadow-xl border border-[#262626] dark:border-[#e5e5e5] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          aria-label="Open FINNA Copilot"
        >
          <CopilotAvatar state={avatarState} size="sm" mouthShapeIndex={mouthShapeIndex} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight">FINNA Copilot</span>
            <span className="text-[10px] text-[#a3a3a3] dark:text-[#737373] leading-none">
              Financial AI
            </span>
          </div>
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </button>
      )}

      {/* Portal Copilot Sheet and Backdrop directly to document.body for guaranteed stacking order */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Separate Backdrop - Sibling 1 at z-[50], strictly behind the sheet */}
              <motion.div
                key="copilot-backdrop"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleClose}
                className="fixed inset-0 z-[50] bg-black/30 pointer-events-auto cursor-pointer"
                aria-hidden="true"
              />

              {/* Copilot Bottom Sheet / Panel - Sibling 2 at z-[60], clearly on top */}
              <motion.div
                key="copilot-sheet"
                role="dialog"
                aria-modal="true"
                aria-label="FINNA Copilot Financial AI Assistant"
                initial={
                  prefersReducedMotion
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 1 }
                }
                animate={{ y: 0, opacity: 1 }}
                exit={
                  prefersReducedMotion
                    ? { y: 0, opacity: 0 }
                    : { y: "100%", opacity: 1 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                }
                className={`fixed z-[60] pointer-events-auto flex flex-col justify-between overflow-hidden
                  bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] shadow-2xl
                  bottom-0 inset-x-0 h-[90dvh] max-h-[90dvh] rounded-t-3xl
                  sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[680px] sm:max-h-[calc(100vh-3rem)] sm:rounded-2xl
                  ${isExpanded ? "sm:w-[680px]" : "sm:w-[440px]"}
                `}
                style={{
                  opacity: 1,
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {/* Mobile Drag Handle Bar & Dismiss Affordance */}
                <div
                  className="sm:hidden pt-3 pb-1.5 flex justify-center bg-white dark:bg-[#121212] shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
                  onClick={handleClose}
                  role="button"
                  tabIndex={0}
                  aria-label="Close bottom sheet"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClose()
                  }}
                >
                  <div className="w-12 h-1.5 rounded-full bg-[#d4d4d4] dark:bg-[#333333]" />
                </div>

              {/* Compact Header (Inspired by GitHub Copilot chat structure) */}
              <header className="px-4 py-3 sm:px-4 sm:py-3.5 border-b border-[#e5e5e5] dark:border-[#262626] flex items-center justify-between bg-white dark:bg-[#121212] shrink-0">
                <div className="flex items-center gap-2.5">
                  <CopilotAvatar state={avatarState} size="sm" mouthShapeIndex={mouthShapeIndex} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs sm:text-sm font-bold text-black dark:text-white tracking-tight">
                        FINNA Copilot
                      </h2>
                      {/* Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.style}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* New Chat */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewChat}
                    title="New Chat"
                    className="size-7 sm:size-8 rounded-lg text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </Button>

                  {/* History Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory((prev) => !prev)}
                    title="Recent Financial Queries"
                    className={`size-7 sm:size-8 rounded-lg cursor-pointer ${
                      showHistory
                        ? "text-black dark:text-white bg-[#f5f5f5] dark:bg-[#1f1f1f]"
                        : "text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f]"
                    }`}
                  >
                    <History className="size-3.5" />
                  </Button>

                  {/* Desktop Expand / Collapse Width */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    title={isExpanded ? "Collapse width" : "Expand width"}
                    className="hidden sm:inline-flex size-7 sm:size-8 rounded-lg text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  </Button>

                  {/* Minimize */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    title="Minimize"
                    aria-label="Minimize FINNA Copilot"
                    className="size-7 sm:size-8 rounded-lg text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    <Minus className="size-3.5" />
                  </Button>

                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    title="Close"
                    aria-label="Close FINNA Copilot"
                    className="size-7 sm:size-8 rounded-lg text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </header>

              {/* History Dropdown Drawer */}
              {showHistory && (
                <div className="border-b border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#171717] px-4 py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
                    <span>Recent Financial Queries</span>
                    <button
                      type="button"
                      onClick={() => setRecentQueries([])}
                      className="hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentQueries.length === 0 ? (
                      <p className="text-[11px] text-[#a3a3a3]">No recent questions.</p>
                    ) : (
                      recentQueries.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setShowHistory(false)
                            handleSend(q)
                          }}
                          className="w-full text-left truncate px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2f2f2f] text-black dark:text-white hover:border-black dark:hover:border-white transition cursor-pointer text-[11px]"
                        >
                          {q}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Voice Notice Alert */}
              {voiceNotice && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 shrink-0">
                  <Info className="size-3.5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                  <span className="leading-relaxed">{voiceNotice}</span>
                </div>
              )}

              {/* Messages Body / Empty State */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#121212] overflow-x-hidden overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {/* EMPTY STATE */}
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6 sm:py-8 space-y-5">
                    {/* Centered Large Gig-Worker Avatar */}
                    <CopilotAvatar state={avatarState} size="lg" mouthShapeIndex={mouthShapeIndex} />

                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                        {userName
                          ? language === "hi"
                            ? `नमस्ते ${userName}, मैं FINNA हूँ।`
                            : language === "ta"
                            ? `வணக்கம் ${userName}, நான் FINNA.`
                            : `Hey ${userName}, I'm FINNA.`
                          : GREETING_TEXT[language].title}
                      </h3>
                      <p className="text-xs text-[#737373] dark:text-[#a3a3a3] leading-relaxed">
                        {GREETING_TEXT[language].desc}
                      </p>
                    </div>

                    {/* Grounded Statement Badge / Copilot Estimated Profile */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] text-[11px] text-[#525252] dark:text-[#a3a3a3]">
                        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {onboardedStatus
                            ? `${copilotProfile.city} • ${copilotProfile.platforms.join(", ")} • ${copilotProfile.hoursLabel || "48 hrs/wk"}`
                            : isEstimateMode
                            ? `Based on estimates for ${cityName || "your city"} and gig telemetry`
                            : GREETING_TEXT[language].badge}
                        </span>
                      </div>

                      {onboardedStatus ? (
                        <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setActiveEditField("income")}
                            className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <SlidersHorizontal className="size-3" />
                            <span>Edit Assumptions</span>
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={handleRestartOnboarding}
                            className="text-[#737373] hover:text-black dark:hover:text-white cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="size-3" />
                            <span>Re-estimate</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startOnboarding(language)}
                          className="mt-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="size-3.5 text-emerald-400" />
                          <span>Start 1-Min Copilot Estimation</span>
                        </button>
                      )}
                    </div>

                    {/* 4 Outlined Suggestion Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
                      {SUGGESTION_CHIPS.map((chip) => {
                        const Icon = chip.icon
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => handleSend(chip.query[language])}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#181818] hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#202020] transition text-left cursor-pointer group shadow-2xs"
                          >
                            <span className="flex size-7 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black shrink-0">
                              <Icon className="size-3.5" />
                            </span>
                            <span className="text-xs font-semibold text-black dark:text-white group-hover:underline underline-offset-2">
                              {chip.label[language]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ACTIVE MESSAGES LIST */}
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user"
                  const isLatestAssistant = !isUser && index === messages.length - 1 && msg.isNew

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                    >
                      {/* Role Header for Assistant */}
                      {!isUser && (
                        <div className="flex items-center gap-2 px-1 text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                          <CopilotAvatar state={avatarState} size="sm" mouthShapeIndex={mouthShapeIndex} className="size-5" />
                          <span className="font-bold text-black dark:text-white">FINNA</span>
                          <span>·</span>
                          <span>{msg.timestamp}</span>
                          {msg.mathFormula && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                              <Check className="size-3" /> Verified
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl p-3.5 text-xs leading-relaxed max-w-[88%] ${
                          isUser
                            ? "bg-black text-white dark:bg-white dark:text-black rounded-br-xs shadow-xs"
                            : "bg-[#f9f9f9] dark:bg-[#1a1a1a] text-black dark:text-white border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-bl-xs shadow-xs"
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-line">{msg.content}</div>
                        ) : (
                          <TypedAssistantContent
                            text={msg.content}
                            animate={isLatestAssistant}
                          />
                        )}

                        {/* Numerical Proof in Code-Style Card */}
                        {msg.mathFormula && !isUser && (
                          <div className="mt-3 pt-2.5 border-t border-[#e5e5e5] dark:border-[#2e2e2e] text-[11px] font-mono bg-white dark:bg-[#141414] p-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] space-y-1">
                            <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3] text-[10px] uppercase font-bold tracking-wider">
                              <span>Numerical Proof</span>
                              <span className="text-emerald-600 dark:text-emerald-400">SBI AA Audited</span>
                            </div>
                            <div className="text-black dark:text-white break-all">{msg.mathFormula}</div>
                          </div>
                        )}

                        {/* Interactive Assumption Editing Bar in Estimate Cards */}
                        {msg.isEstimateCard && !isUser && (
                          <div className="mt-3 pt-3 border-t border-[#e5e5e5] dark:border-[#2e2e2e] space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
                              <span className="flex items-center gap-1.5 text-black dark:text-white">
                                <SlidersHorizontal className="size-3 text-sky-500" />
                                Edit Any Assumption
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Real-time update</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => setActiveEditField(activeEditField === "income" ? null : "income")}
                                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white text-black dark:text-white transition cursor-pointer"
                              >
                                ✏️ Income: ₹{copilotProfile.monthlyIncomeExpected.toLocaleString("en-IN")}/mo
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveEditField(activeEditField === "expenses" ? null : "expenses")}
                                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white text-black dark:text-white transition cursor-pointer"
                              >
                                ✏️ Expenses: ₹{(copilotProfile.totalFixedExpenses || 16000).toLocaleString("en-IN")}/mo
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveEditField(activeEditField === "hours" ? null : "hours")}
                                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white text-black dark:text-white transition cursor-pointer"
                              >
                                ✏️ Hours: {copilotProfile.hoursPerWeek}h/wk
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveEditField(activeEditField === "city" ? null : "city")}
                                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white text-black dark:text-white transition cursor-pointer"
                              >
                                ✏️ City: {copilotProfile.city}
                              </button>
                              <button
                                type="button"
                                onClick={handleRestartOnboarding}
                                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white text-[#737373] dark:text-[#a3a3a3] transition cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="size-2.5" />
                                Redo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Assistant Actions Bar: Listen, Thumbs Up/Down, Copy */}
                      {!isUser && (
                        <div className="flex items-center gap-3 px-1 text-[11px] text-[#737373] dark:text-[#a3a3a3] pt-0.5">
                          {msg.audioText && (
                            <button
                              type="button"
                              onClick={() => speakText(msg.audioText!, language)}
                              className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white cursor-pointer font-medium transition"
                              title="Listen to response"
                            >
                              <Volume2 className="size-3" />
                              <span>Listen</span>
                            </button>
                          )}

                          <span>·</span>
                          <span className="text-[10px]">Helpful?</span>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "up")}
                            title="Helpful"
                            className={`hover:text-black dark:hover:text-white cursor-pointer transition ${
                              msg.feedback === "up" ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""
                            }`}
                          >
                            <ThumbsUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "down")}
                            title="Not helpful"
                            className={`hover:text-black dark:hover:text-white cursor-pointer transition ${
                              msg.feedback === "down" ? "text-rose-600 dark:text-rose-400 font-bold" : ""
                            }`}
                          >
                            <ThumbsDown className="size-3" />
                          </button>

                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy reply"
                            className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white cursor-pointer transition"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="size-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {isLoading && (
                  <div className="flex items-center gap-2.5 text-xs text-[#737373] dark:text-[#a3a3a3] p-3 bg-[#f9f9f9] dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] w-fit shadow-xs">
                    <Loader2 className="size-3.5 animate-spin text-black dark:text-white" />
                    <span>Analyzing your bank statement &amp; gig payouts...</span>
                  </div>
                )}
              </div>

              {/* Active Onboarding Step Options Tray (Steps 1 to 6) */}
              {onboardingStep >= 1 && onboardingStep <= 6 && (
                <div className="p-3 border-t border-[#e5e5e5] dark:border-[#262626] bg-[#f9f9f9] dark:bg-[#161616] space-y-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center justify-between text-xs font-semibold text-black dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-emerald-500" />
                      Step {onboardingStep} of 6: {COPILOT_ONBOARDING_STEPS[onboardingStep - 1].title}
                    </span>
                    <span className="text-[10px] text-[#737373] dark:text-[#a3a3a3]">
                      {COPILOT_ONBOARDING_STEPS[onboardingStep - 1].isMultiSelect
                        ? language === "ta"
                          ? "தேர்ந்தெடுத்து தொடரவும்"
                          : language === "hi"
                          ? "चुनकर आगे बढ़ें"
                          : "Select options & continue"
                        : language === "ta"
                        ? "ஒன்றைத் தேர்ந்தெடுக்கவும்"
                        : language === "hi"
                        ? "एक विकल्प चुनें"
                        : "Tap to select"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto py-1 overscroll-contain">
                    {COPILOT_ONBOARDING_STEPS[onboardingStep - 1].options.map((opt) => {
                      const isMulti = COPILOT_ONBOARDING_STEPS[onboardingStep - 1].isMultiSelect
                      const isSelected = isMulti
                        ? selectedMultiOptions.includes(opt.value)
                        : false

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (isMulti) {
                              setSelectedMultiOptions((prev) =>
                                prev.includes(opt.value)
                                  ? prev.filter((x) => x !== opt.value)
                                  : [...prev, opt.value]
                              )
                            } else {
                              handleOnboardingOptionSelect(opt.value, opt.label[language])
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs scale-[1.02]"
                              : "bg-white dark:bg-[#202020] text-black dark:text-white border-[#e5e5e5] dark:border-[#2f2f2f] hover:border-black dark:hover:border-white"
                          }`}
                        >
                          {opt.label[language]}
                        </button>
                      )
                    })}
                  </div>

                  {COPILOT_ONBOARDING_STEPS[onboardingStep - 1].isMultiSelect && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#737373] dark:text-[#a3a3a3]">
                        {selectedMultiOptions.length} selected
                      </span>
                      <Button
                        size="sm"
                        onClick={handleMultiSubmit}
                        className="text-xs font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl px-3 py-1.5 h-8 cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span>
                          {onboardingStep === 6
                            ? language === "ta"
                              ? "✨ நிதி மதிப்பீடுகளைக் கணக்கிடு"
                              : language === "hi"
                              ? "✨ वित्तीय अनुमान की गणना करें"
                              : "✨ Calculate Financial Estimates"
                            : language === "ta"
                            ? "அடுத்த கேள்வி →"
                            : language === "hi"
                            ? "अगला प्रश्न →"
                            : "Next Question →"}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Inline Assumption Adjuster Tray */}
              {activeEditField && (
                <div className="p-3 border-t border-[#e5e5e5] dark:border-[#262626] bg-[#f0f9ff] dark:bg-[#082f49]/30 text-xs space-y-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center justify-between font-semibold text-sky-950 dark:text-sky-200">
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="size-3.5 text-sky-600 dark:text-sky-400" />
                      {language === "ta"
                        ? `${activeEditField.toUpperCase()} மாற்றவும்:`
                        : language === "hi"
                        ? `${activeEditField.toUpperCase()} समायोजित करें:`
                        : `Adjust ${activeEditField.toUpperCase()}:`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveEditField(null)}
                      className="text-[#737373] hover:text-black dark:hover:text-white cursor-pointer p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getAssumptionPresets(activeEditField).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyAssumptionPatch(preset.patch, preset.label[language])}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-[#1a1a1a] border border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-900/50 cursor-pointer font-medium transition shadow-2xs"
                      >
                        {preset.label[language]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Suggestion & Follow-up Chips (when chat is active and not in onboarding) */}
              {onboardingStep === 0 && messages.length > 0 && (
                <div className="px-3.5 py-1.5 border-t border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#121212] shrink-0">
                  <div className="overflow-x-auto flex gap-1.5 no-scrollbar py-0.5">
                    {COPILOT_FOLLOWUP_CHIPS.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleSend(chip.query[language])}
                        className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] dark:bg-[#1c1c1c] text-black dark:text-white border border-[#e5e5e5] dark:border-[#2e2e2e] hover:border-black dark:hover:border-white cursor-pointer transition whitespace-nowrap shadow-2xs"
                      >
                        {chip.label[language]}
                      </button>
                    ))}
                    {QUICK_QUESTIONS[language].map((chip, idx) => (
                      <button
                        key={`quick-${idx}`}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fafafa] dark:bg-[#181818] text-[#737373] dark:text-[#a3a3a3] border border-[#e5e5e5] dark:border-[#2e2e2e] hover:border-black dark:hover:border-white cursor-pointer transition whitespace-nowrap"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Large Rounded Input Card with Controls Row Underneath */}
              <div
                className="p-3 sm:p-4 border-t border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#121212] shrink-0"
                style={{
                  paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
                }}
              >
                {voiceNotice && (
                  <div className="flex items-start justify-between gap-2 p-2.5 mb-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-start gap-2">
                      <MicOff className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <span className="leading-snug">{voiceNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceNotice(null)}
                      className="p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded text-amber-700 dark:text-amber-300 cursor-pointer shrink-0"
                      title="Dismiss notice"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
                <div className="rounded-2xl border border-[#e5e5e5] dark:border-[#262626] bg-[#f9f9f9] dark:bg-[#181818] p-2.5 focus-within:border-black dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-[#141414] transition-all shadow-xs space-y-2">
                  {/* Top Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={
                      isListening
                        ? "Listening... speak now"
                        : language === "ta"
                        ? "இஎம்ஐ, வாடகை அல்லது செலவு பற்றி கேளுங்கள்..."
                        : language === "hi"
                        ? "ईएमआई, किराया या खर्च के बारे में पूछें..."
                        : "Ask about EMI, rent, safe-to-spend, schemes..."
                    }
                    disabled={isLoading}
                    className="w-full resize-none bg-transparent border-0 p-1 text-xs text-black dark:text-white placeholder:text-[#a3a3a3] focus:outline-none focus:ring-0 leading-relaxed"
                  />

                  {/* Controls Row Underneath */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#e5e5e5]/60 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-1.5">
                      {/* Mic Button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isLoading}
                        aria-label={isListening ? "Stop voice listening" : "Speak to FINNA Copilot"}
                        title={isListening ? "Listening... click to stop" : "Speak to FINNA Copilot (tap for microphone)"}
                        className={`size-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                          isListening
                            ? "bg-red-600 text-white animate-pulse shadow-md"
                            : "bg-[#ececec] dark:bg-[#252525] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                        }`}
                      >
                        {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                      </button>

                      {/* Language Selector Pill */}
                      <div className="inline-flex rounded-lg border border-[#e5e5e5] dark:border-[#2f2f2f] bg-[#ececec] dark:bg-[#222222] p-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setLanguage("en")}
                          className={`px-1.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                            language === "en"
                              ? "bg-white dark:bg-[#121212] text-black dark:text-white shadow-2xs"
                              : "text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage("ta")}
                          className={`px-1.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                            language === "ta"
                              ? "bg-white dark:bg-[#121212] text-black dark:text-white shadow-2xs"
                              : "text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
                          }`}
                        >
                          தமிழ்
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage("hi")}
                          className={`px-1.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                            language === "hi"
                              ? "bg-white dark:bg-[#121212] text-black dark:text-white shadow-2xs"
                              : "text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
                          }`}
                        >
                          हिंदी
                        </button>
                      </div>

                      {/* Speech Output Mute/Unmute */}
                      <button
                        type="button"
                        onClick={handleToggleTts}
                        title={ttsEnabled ? "Voice Output Active (Click to Mute)" : "Voice Muted (Click to Unmute)"}
                        className={`size-8 rounded-xl flex items-center justify-center border transition cursor-pointer ${
                          ttsEnabled
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                            : "bg-[#ececec] dark:bg-[#252525] text-[#737373] dark:text-[#888888] border-[#e5e5e5] dark:border-[#2f2f2f] hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {ttsEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                      </button>
                    </div>

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      title="Send question"
                      className={`size-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                        input.trim() && !isLoading
                          ? "bg-black text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 shadow-sm"
                          : "bg-[#e5e5e5] dark:bg-[#252525] text-[#a3a3a3] dark:text-[#555555] cursor-not-allowed"
                      }`}
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Required Small Footer Line */}
                <div className="mt-2 text-center text-[10px] text-[#737373] dark:text-[#888888]">
                  Voice and text assistant. Check important numbers.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
)
}
