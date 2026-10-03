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
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const CORE_QUESTIONS: Record<SupportedLang, string[]> = {
  en: [
    "Can I pay my EMI?",
    "Can I pay my rent?",
    "How much can I safely spend?",
    "What government schemes may I be eligible for?",
    "What insurance / financial options may be relevant?",
    "Why is my financial health score 72?",
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

const WELCOME_MESSAGES: Record<SupportedLang, string> = {
  en: "Namaste Arun! I am FINNA, your AI financial co-pilot grounded in your real SBI/HDFC accounts and Swiggy/Uber gig records. Ask me anything about your EMI, rent, safe-to-spend limits, or welfare schemes.",
  ta: "வணக்கம் அருண்! நான் உங்கள் FINNA AI நிதி உதவியாளர். உங்கள் SBI/HDFC வங்கி மற்றும் ஸ்விக்கி/உபர் உண்மையான தரவுகளின் அடிப்படையில் பதிலளிக்கிறேன். தவணை, வாடகை, பாதுகாப்பான செலவு அல்லது அரசு நலத்திட்டங்கள் குறித்து கேளுங்கள்.",
  hi: "नमस्ते अरुण! मैं FINNA हूँ, आपका AI वित्तीय सलाहकार। आपके वास्तविक बैंक और स्विगी/उबर डेटा के आधार पर आपकी ईएमआई, किराया, सुरक्षित खर्च और सरकारी योजनाओं पर सटीक मार्गदर्शन देने के लिए तैयार हूँ।",
}

// Progressive typing effect component for assistant responses
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
    const step = 3
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
    }, 24)

    return () => clearInterval(timer)
  }, [text, animate, onDone])

  return (
    <div className="whitespace-pre-line leading-relaxed text-black">
      {displayed}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-black ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  )
}

export function CopilotPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [language, setLanguage] = React.useState<SupportedLang>("en")
  const [avatarState, setAvatarState] = React.useState<CopilotState>("idle")
  const [isListening, setIsListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(true)
  const [voiceNotice, setVoiceNotice] = React.useState<string | null>(null)
  const [ttsEnabled, setTtsEnabled] = React.useState(true)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: WELCOME_MESSAGES.en,
      audioText: "Namaste Arun! I am FINNA, your financial co-pilot. How can I help you today?",
      timestamp: "Just now",
      isNew: false,
    },
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<any>(null)

  // Initialize Speech Recognition capability check
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRec) {
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

  // Change language: updates welcome message if untouched
  const handleLanguageChange = (lang: SupportedLang) => {
    setLanguage(lang)
    if (messages.length === 1 && messages[0].id === "msg-welcome") {
      setMessages([
        {
          id: "msg-welcome",
          role: "assistant",
          content: WELCOME_MESSAGES[lang],
          timestamp: "Just now",
          isNew: false,
        },
      ])
    }
  }

  // Text to Speech playback with avatar mouth synchronizing
  const speakText = (text: string, langCode: SupportedLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()

    if (!ttsEnabled) {
      setAvatarState("idle")
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langCode === "ta" ? "ta-IN" : langCode === "hi" ? "hi-IN" : "en-IN"
      utterance.rate = 0.95
      utterance.pitch = 1.0

      utterance.onstart = () => {
        setAvatarState("speaking")
      }
      utterance.onend = () => {
        setAvatarState("idle")
      }
      utterance.onerror = () => {
        setAvatarState("idle")
      }

      window.speechSynthesis.speak(utterance)
    } catch {
      setAvatarState("idle")
    }
  }

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechSupported) {
      setVoiceNotice("Speech recognition is not available in this browser. Please type your query below.")
      setTimeout(() => setVoiceNotice(null), 4000)
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      setAvatarState("idle")
      return
    }

    try {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
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
        const transcript = event.results[0][0].transcript
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
          setVoiceNotice("Speech recognition interrupted. You can easily type your query.")
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

  const handleSend = async (queryText?: string) => {
    const text = queryText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "Just now",
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
        timestamp: "Just now",
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
          content: "Sorry, I had trouble reaching the financial advisory engine. Please verify your connection.",
          timestamp: "Just now",
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
    }
  }

  return (
    <>
      {/* Floating Action Button - Positioned above mobile bottom bar */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 h-12 pl-2.5 pr-4 rounded-full bg-black text-white hover:bg-[#262626] shadow-xl border border-[#262626] transition active:scale-95 cursor-pointer"
          aria-label="Open FINNA Copilot"
          style={{ transform: "translateZ(0)" }}
        >
          <CopilotAvatar state={avatarState} size="sm" />
          <span className="text-xs font-bold tracking-tight">FINNA Copilot</span>
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
            {/* Backdrop on mobile - NO backdrop-blur to eliminate mobile WebView fuzziness */}
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

            {/* Chat Panel - Solid clean background with crisp subpixel rendering */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="pointer-events-auto w-full sm:w-[450px] h-full bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{
                transform: "translateZ(0)",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {/* Header with Animated Human-like Avatar */}
              <div className="p-4 sm:p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CopilotAvatar state={avatarState} size="md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-black">FINNA Copilot</h2>
                      <span className="text-[10px] font-mono font-semibold bg-[#f5f5f5] text-black px-1.5 py-0.2 rounded border border-[#e5e5e5]">
                        {avatarState.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Grounded in your RBI AA statement &amp; gig payouts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Language Selector */}
                  <div className="inline-flex rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("en")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        language === "en" ? "bg-white text-black shadow-2xs" : "text-[#737373] hover:text-black"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("ta")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        language === "ta" ? "bg-white text-black shadow-2xs" : "text-[#737373] hover:text-black"
                      }`}
                    >
                      தமிழ்
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("hi")}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        language === "hi" ? "bg-white text-black shadow-2xs" : "text-[#737373] hover:text-black"
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>

                  {/* TTS Speech Mute Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleTts}
                    title={ttsEnabled ? "Voice Output Active (Click to Mute)" : "Speech Output Muted (Click to Unmute)"}
                    className={`size-8 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                      ttsEnabled
                        ? "bg-black text-white border-black"
                        : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] hover:text-black"
                    }`}
                  >
                    {ttsEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                  </button>

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
                    className="size-8 rounded-lg text-[#737373] hover:text-black cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Clean Notice Banner */}
              {voiceNotice && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-start gap-2 shrink-0">
                  <Info className="size-3.5 shrink-0 mt-0.5 text-amber-700" />
                  <span className="leading-relaxed">{voiceNotice}</span>
                </div>
              )}

              {/* Messages Scroll Container */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]"
                style={{
                  transform: "translateZ(0)",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user"
                  const isLatestAssistant = !isUser && index === messages.length - 1 && msg.isNew

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isUser
                            ? "bg-black text-white rounded-br-xs"
                            : "bg-white text-black border border-[#e5e5e5] rounded-bl-xs shadow-xs"
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

                        {/* Benchmark formula tag */}
                        {msg.mathFormula && !isUser && (
                          <div className="mt-2.5 pt-2 border-t border-[#e5e5e5] text-[10px] font-mono text-[#737373] bg-[#f5f5f5] p-2 rounded-lg">
                            <span className="font-bold text-black block mb-0.5">Numerical Proof:</span>
                            {msg.mathFormula}
                          </div>
                        )}
                      </div>

                      {/* Assistant actions: Feedback + Replay Voice */}
                      {!isUser && msg.id !== "msg-welcome" && (
                        <div className="flex items-center gap-3 mt-1.5 px-1 text-[10px] text-[#737373]">
                          {msg.audioText && (
                            <button
                              type="button"
                              onClick={() => speakText(msg.audioText!, language)}
                              className="inline-flex items-center gap-1 hover:text-black cursor-pointer font-medium"
                              title="Listen to speech"
                            >
                              <Volume2 className="size-3" />
                              <span>Listen</span>
                            </button>
                          )}
                          <span>·</span>
                          <span>Helpful?</span>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "up")}
                            className={`hover:text-black cursor-pointer ${msg.feedback === "up" ? "text-black font-bold" : ""}`}
                          >
                            <ThumbsUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "down")}
                            className={`hover:text-black cursor-pointer ${msg.feedback === "down" ? "text-black font-bold" : ""}`}
                          >
                            <ThumbsDown className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {isLoading && (
                  <div className="flex items-center gap-2.5 text-xs text-[#737373] p-3 bg-white rounded-2xl border border-[#e5e5e5] w-fit shadow-xs">
                    <Loader2 className="size-3.5 animate-spin text-black" />
                    <span>Analyzing your bank statement &amp; schemes...</span>
                  </div>
                )}
              </div>

              {/* 7 Core Verified Questions (Chips) */}
              <div className="px-4 py-2 border-t border-[#e5e5e5] bg-white shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">
                    Quick Financial Questions
                  </span>
                  <span className="text-[10px] font-mono text-[#737373]">Verified</span>
                </div>
                <div className="overflow-x-auto flex gap-1.5 no-scrollbar pb-1">
                  {CORE_QUESTIONS[language].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(chip)}
                      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] text-black border border-[#e5e5e5] hover:border-black hover:bg-black hover:text-white cursor-pointer transition shadow-2xs whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer with Microphone and Speech Integration */}
              <div
                className="p-3 sm:p-4 border-t border-[#e5e5e5] bg-white shrink-0"
                style={{
                  paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Microphone Voice Button */}
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    onClick={toggleListening}
                    disabled={isLoading}
                    title={
                      isListening
                        ? "Listening... Click to stop"
                        : "Click to speak with FINNA Copilot"
                    }
                    className={`size-11 rounded-xl shrink-0 cursor-pointer transition ${
                      isListening
                        ? "bg-red-600 text-white hover:bg-red-700 animate-pulse border-red-600 shadow-md"
                        : "border-[#e5e5e5] text-black hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </Button>

                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening... speak now"
                        : language === "ta"
                        ? "இஎம்ஐ, வாடகை அல்லது செலவு பற்றி கேளுங்கள்..."
                        : language === "hi"
                        ? "ईएमआई, किराया या खर्च के बारे में पूछें..."
                        : "Ask about EMI, rent, safe-to-spend, schemes..."
                    }
                    className="h-11 text-xs bg-[#f5f5f5] border-[#e5e5e5] rounded-xl focus-visible:ring-black"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="size-11 rounded-xl bg-black text-white hover:bg-[#262626] shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#737373]">
                  <span>Animated Voice &amp; Text Assistant</span>
                  <span className="font-mono">Web Speech API + FinEngine</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
