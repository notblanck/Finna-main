"use client"

import * as React from "react"
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
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopilotAvatar, type CopilotState } from "./copilot-avatar"

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

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<any>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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

  // Capacitor Native Speech Recognition
  const startCapacitorSpeech = async () => {
    try {
      const Capacitor = (window as any).Capacitor
      const SpeechPlugin = Capacitor?.Plugins?.SpeechRecognition
      if (!SpeechPlugin) {
        throw new Error("SpeechRecognition plugin not found on Capacitor")
      }

      const perm = await SpeechPlugin.hasPermission()
      if (!perm?.permission) {
        const req = await SpeechPlugin.requestPermission()
        if (!req?.permission) {
          setVoiceNotice("Microphone permission was denied. Please enable it in Android app settings.")
          return
        }
      }

      setIsListening(true)
      setAvatarState("listening")
      setVoiceNotice(null)

      const result = await SpeechPlugin.start({
        language: language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN",
        maxResults: 1,
        prompt: "Speak to FINNA Copilot...",
        partialResults: false,
        popup: false,
      })

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
      startWebSpeech()
    }
  }

  // Web Speech API
  const startWebSpeech = () => {
    try {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRec) {
        setVoiceNotice("Speech recognition is not available in this browser. Please type your query below.")
        setTimeout(() => setVoiceNotice(null), 4000)
        return
      }

      const recognition = new SpeechRec()
      recognitionRef.current = recognition
      recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
        setAvatarState("listening")
        setVoiceNotice(null)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript) {
          setInput(transcript)
          setIsListening(false)
          setAvatarState("thinking")
          handleSend(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error)
        setIsListening(false)
        setAvatarState("idle")
        if (event.error === "no-speech") {
          setVoiceNotice("No voice detected. Please speak closer to the microphone or type below.")
        } else if (event.error === "not-allowed") {
          setVoiceNotice("Microphone permission was denied. Please allow microphone access or type below.")
        } else {
          setVoiceNotice("Speech recognition interrupted. You can type your query.")
        }
        setTimeout(() => setVoiceNotice(null), 4500)
      }

      recognition.onend = () => {
        setIsListening(false)
        if (!isLoading) {
          setAvatarState("idle")
        }
      }

      recognition.start()
    } catch (err) {
      console.error("Speech Recognition failed:", err)
      setIsListening(false)
      setAvatarState("idle")
      setVoiceNotice("Could not access microphone. Please type your question directly.")
      setTimeout(() => setVoiceNotice(null), 4000)
    }
  }

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      setAvatarState("idle")
      return
    }

    const isCapacitorNative =
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform?.() === true

    if (isCapacitorNative && (window as any).Capacitor?.Plugins?.SpeechRecognition) {
      startCapacitorSpeech()
    } else {
      startWebSpeech()
    }
  }

  // Send query
  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim()
    if (!text || isLoading) return

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
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 h-12 pl-2 pr-4 rounded-full bg-black text-white hover:bg-[#222222] dark:bg-white dark:text-black dark:hover:bg-[#f0f0f0] shadow-xl border border-[#262626] dark:border-[#e5e5e5] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          aria-label="Open FINNA Copilot"
          style={{ transform: "translateZ(0)" }}
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

      {/* Main Floating Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-end sm:justify-end sm:p-6">
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel()
                }
                setAvatarState("idle")
                setIsOpen(false)
              }}
              className="absolute inset-0 bg-black/50 pointer-events-auto sm:hidden"
            />

            {/* Polished Floating Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto flex flex-col justify-between overflow-hidden bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] shadow-2xl transition-all duration-200
                w-full sm:h-[680px] sm:max-h-[calc(100vh-3rem)]
                h-[92vh] max-h-[92vh] rounded-t-3xl sm:rounded-2xl
                ${isExpanded ? "sm:w-[680px]" : "sm:w-[440px]"}
              `}
              style={{
                transform: "translateZ(0)",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              {/* Mobile Drag Handle Bar */}
              <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white dark:bg-[#121212]">
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
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel()
                      }
                      setAvatarState("idle")
                      setIsOpen(false)
                    }}
                    title="Minimize"
                    className="size-7 sm:size-8 rounded-lg text-[#737373] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    <Minus className="size-3.5" />
                  </Button>

                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel()
                      }
                      setAvatarState("idle")
                      setIsOpen(false)
                    }}
                    title="Close"
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
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#121212] overflow-x-hidden"
              >
                {/* EMPTY STATE */}
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6 sm:py-8 space-y-5">
                    {/* Centered Large Gig-Worker Avatar */}
                    <CopilotAvatar state={avatarState} size="lg" mouthShapeIndex={mouthShapeIndex} />

                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                        {GREETING_TEXT[language].title}
                      </h3>
                      <p className="text-xs text-[#737373] dark:text-[#a3a3a3] leading-relaxed">
                        {GREETING_TEXT[language].desc}
                      </p>
                    </div>

                    {/* Grounded in RBI AA Statement Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] text-[11px] text-[#525252] dark:text-[#a3a3a3]">
                      <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{GREETING_TEXT[language].badge}</span>
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

              {/* Quick Suggestion Chips (when chat is active) */}
              {messages.length > 0 && (
                <div className="px-3.5 py-1.5 border-t border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#121212] shrink-0">
                  <div className="overflow-x-auto flex gap-1.5 no-scrollbar py-0.5">
                    {QUICK_QUESTIONS[language].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] dark:bg-[#1c1c1c] text-black dark:text-white border border-[#e5e5e5] dark:border-[#2e2e2e] hover:border-black dark:hover:border-white cursor-pointer transition whitespace-nowrap shadow-2xs"
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
                        title={isListening ? "Listening... click to stop" : "Speak to FINNA Copilot"}
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
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
