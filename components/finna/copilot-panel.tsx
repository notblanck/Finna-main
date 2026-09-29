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
  Bot,
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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  audioText?: string
  feedback?: "up" | "down"
  timestamp: string
  intent?: string
  mathFormula?: string
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

export function CopilotPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [language, setLanguage] = React.useState<SupportedLang>("en")
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
    },
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<any>(null)

  // Initialize Speech Recognition
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setSpeechSupported(false)
      }
    }
  }, [])

  // Auto scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen, isLoading])

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
        },
      ])
    }
  }

  // Text to Speech playback
  const speakText = (text: string, langCode: SupportedLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel() // Stop any current utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode === "ta" ? "ta-IN" : langCode === "hi" ? "hi-IN" : "en-IN"
    utterance.rate = 0.95
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechSupported) {
      setVoiceNotice("Speech recognition is not supported in this browser. Please type your message.")
      setTimeout(() => setVoiceNotice(null), 4000)
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceNotice(null)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInput(transcript)
          setIsListening(false)
          // Automatically send detected voice question
          handleSend(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error)
        setIsListening(false)
        if (event.error === "no-speech") {
          setVoiceNotice("No voice detected. Please try speaking closer to the microphone or type below.")
        } else if (event.error === "not-allowed") {
          setVoiceNotice("Microphone permission denied. Please allow microphone access or use text.")
        } else {
          setVoiceNotice("Unclear speech input detected. Clean fallback: please type your question below.")
        }
        setTimeout(() => setVoiceNotice(null), 5000)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err) {
      console.error("Speech Recognition start failed:", err)
      setIsListening(false)
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
        content: data.content || "I have analyzed your data.",
        audioText: data.audioText,
        intent: data.intent,
        mathFormula: data.mathematicalReasoning?.formula,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto play speech if TTS enabled
      if (ttsEnabled && data.audioText) {
        speakText(data.audioText, data.language || language)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble reaching the financial advisory engine. Please verify your connection.",
          timestamp: "Just now",
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

  return (
    <>
      {/* Floating Action Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 h-12 px-4 rounded-full bg-black text-white hover:bg-black/90 shadow-xl border border-[#262626] transition hover:scale-105 cursor-pointer"
          aria-label="Open FINNA Copilot"
        >
          <Sparkles className="size-4 text-white animate-pulse" />
          <span className="text-xs font-bold tracking-tight">FINNA Copilot</span>
          <span className="flex size-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Slide-over Drawer / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto sm:hidden"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="pointer-events-auto w-full sm:w-[450px] h-full bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between"
            >
              {/* Header with Language Selector and Voice Toggle */}
              <div className="p-4 sm:p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-black text-white shadow-xs">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-black">FINNA Copilot</h2>
                      <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] text-black px-1.5 py-0.2 rounded border border-[#e5e5e5]">
                        v2.0 Brain
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373]">Grounded in Arun's AA + Gig Records</p>
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

                  {/* TTS Mute / Unmute Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setTtsEnabled(!ttsEnabled)
                      if (ttsEnabled && typeof window !== "undefined") {
                        window.speechSynthesis.cancel()
                      }
                    }}
                    title={ttsEnabled ? "Voice Speech Output Active (Click to Mute)" : "Speech Output Muted (Click to Unmute)"}
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
                    onClick={() => setIsOpen(false)}
                    className="size-8 rounded-lg text-[#737373] hover:text-black cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Voice Listening Notice / Clean Fallback Banner */}
              {voiceNotice && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="size-3.5 shrink-0 mt-0.5" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              {/* Messages Container */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
                {messages.map((msg) => {
                  const isUser = msg.role === "user"
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
                        <div className="whitespace-pre-line">{msg.content}</div>

                        {/* Benchmark formula tag */}
                        {msg.mathFormula && !isUser && (
                          <div className="mt-2.5 pt-2 border-t border-[#e5e5e5] text-[10px] font-mono text-[#737373] bg-[#f5f5f5] p-2 rounded-lg">
                            <span className="font-bold text-black block mb-0.5">FinQA / TAT-QA Numerical Proof:</span>
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
                  <div className="flex items-center gap-2 text-xs text-[#737373] p-2 bg-white rounded-xl border border-[#e5e5e5] w-fit shadow-2xs">
                    <Loader2 className="size-3.5 animate-spin text-black" />
                    <span>Calculating financial engine limits...</span>
                  </div>
                )}
              </div>

              {/* 7 Core Canonical Questions (Chips) */}
              <div className="px-4 py-2 border-t border-[#e5e5e5] bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">
                    Core Verified Questions
                  </span>
                  <span className="text-[10px] font-mono text-[#737373]">7 of 7 active</span>
                </div>
                <div className="overflow-x-auto flex gap-1.5 no-scrollbar pb-1">
                  {CORE_QUESTIONS[language].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(chip)}
                      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] text-black border border-[#e5e5e5] hover:border-black hover:bg-black hover:text-white cursor-pointer transition shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer with Microphone and Fallback */}
              <div className="p-3 sm:p-4 border-t border-[#e5e5e5] bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Microphone STT Button */}
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    onClick={toggleListening}
                    disabled={isLoading}
                    title={
                      isListening
                        ? "Listening... Click to stop"
                        : "Click to speak (Voice Agent)"
                    }
                    className={`size-10 rounded-xl shrink-0 cursor-pointer transition ${
                      isListening
                        ? "bg-red-500 text-white hover:bg-red-600 animate-pulse border-red-500"
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
                        ? "Listening to speech (speak now)..."
                        : language === "ta"
                        ? "இஎம்ஐ, வாடகை அல்லது செலவு பற்றி கேளுங்கள்..."
                        : language === "hi"
                        ? "ईएमआई, किराया या खर्च के बारे में पूछें..."
                        : "Ask about EMI, rent, safe-to-spend, schemes..."
                    }
                    className="h-10 text-xs bg-[#f5f5f5] border-[#e5e5e5] rounded-xl focus-visible:ring-black"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="size-10 rounded-xl bg-black text-white hover:bg-black/90 shrink-0 cursor-pointer"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#737373]">
                  <span>Voice & Text Agent · STT + FinEngine + TTS</span>
                  <span className="font-mono">Theme 3 Compliance</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

