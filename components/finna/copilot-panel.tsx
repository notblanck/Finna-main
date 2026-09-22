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
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  feedback?: "up" | "down"
  timestamp: string
}

const PROMPT_CHIPS = [
  "Can I afford a ₹3,500 bike repair?",
  "Which schemes give ₹2 Lakh insurance?",
  "How do I claim 1% TDS refund?",
  "How much should I save daily?",
]

export function CopilotPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: "Namaste! I am FINNA, your AI financial co-pilot. Ask me anything about your earnings, safe-to-spend limits, taxes, or welfare schemes.",
      timestamp: "Just now",
    },
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

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
      const res = await fetch("/api/v1/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content || "I am analyzing your data. Please check back in a moment.",
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble reaching the financial advisory service. Please check your connection.",
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
              className="pointer-events-auto w-full sm:w-[420px] h-full bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-black text-white">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-black">FINNA Copilot</h2>
                    <p className="text-[11px] text-[#737373]">AI Gig Financial Coach · Grounded in your numbers</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="size-8 rounded-lg text-[#737373] hover:text-black cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>

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
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isUser
                            ? "bg-black text-white rounded-br-xs"
                            : "bg-white text-black border border-[#e5e5e5] rounded-bl-xs shadow-xs"
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.content}</div>
                      </div>

                      {/* Assistant feedback buttons */}
                      {!isUser && msg.id !== "msg-welcome" && (
                        <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-[#737373]">
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
                  <div className="flex items-center gap-2 text-xs text-[#737373] p-2">
                    <Loader2 className="size-3.5 animate-spin text-black" />
                    <span>Analyzing your income and safe limits...</span>
                  </div>
                )}
              </div>

              {/* Suggested Prompt Chips */}
              <div className="px-4 py-2 border-t border-[#e5e5e5] bg-white overflow-x-auto flex gap-1.5 no-scrollbar">
                {PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f5] text-black border border-[#e5e5e5] hover:border-black cursor-pointer transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 sm:p-4 border-t border-[#e5e5e5] bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about spending, repairs, schemes..."
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
                <p className="mt-2 text-[10px] text-center text-[#737373]">
                  Educational financial guidance based on your data · Not SEBI investment advice
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
