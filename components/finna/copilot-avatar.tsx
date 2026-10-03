"use client"

import * as React from "react"
import { motion } from "framer-motion"

export type CopilotState = "idle" | "listening" | "thinking" | "speaking"

interface CopilotAvatarProps {
  state: CopilotState
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CopilotAvatar({
  state,
  size = "md",
  className = "",
}: CopilotAvatarProps) {
  const [blink, setBlink] = React.useState(false)
  const [mouthFrame, setMouthFrame] = React.useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  // Detect prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(media.matches)
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    }
  }, [])

  // Periodic blinking during idle and thinking
  React.useEffect(() => {
    if (prefersReducedMotion) return
    let timeout: NodeJS.Timeout

    const scheduleBlink = () => {
      const delay = Math.random() * 2500 + 2000 // 2s - 4.5s
      timeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          scheduleBlink()
        }, 160)
      }, delay)
    }

    scheduleBlink()
    return () => clearTimeout(timeout)
  }, [prefersReducedMotion])

  // Mouth animation during speaking state
  React.useEffect(() => {
    if (state !== "speaking" || prefersReducedMotion) {
      setMouthFrame(0)
      return
    }

    const interval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 4)
    }, 130)

    return () => clearInterval(interval)
  }, [state, prefersReducedMotion])

  const dimensions = {
    sm: "size-10",
    md: "size-16",
    lg: "size-24",
  }[size]

  // Head and breathing animation variants
  const headVariants = {
    idle: {
      y: prefersReducedMotion ? 0 : [0, -2.5, 0],
      rotate: prefersReducedMotion ? 0 : [0, 0.8, -0.8, 0],
      transition: {
        duration: 3.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    listening: {
      y: -3,
      rotate: -1.5,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    thinking: {
      y: [0, -1.5, 0],
      rotate: [0, 2, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
    speaking: {
      y: prefersReducedMotion ? 0 : [0, -2, 0, -1, 0],
      rotate: prefersReducedMotion ? 0 : [0, 1, -1, 0.5, 0],
      transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
    },
  }

  // Mouth paths for speech phonemes
  // 0: smile/rest, 1: slightly open, 2: wide open (O/A), 3: medium open
  const mouthPaths = [
    "M 36 68 Q 50 74 64 68 Q 50 72 36 68 Z", // rest smile
    "M 38 66 Q 50 70 62 66 Q 50 77 38 66 Z", // slightly open
    "M 40 64 Q 50 67 60 64 Q 50 82 40 64 Z", // wide open
    "M 38 65 Q 50 68 62 65 Q 50 79 38 65 Z", // medium open
  ]

  const activeMouthPath =
    state === "speaking"
      ? mouthPaths[mouthFrame]
      : state === "listening"
      ? "M 39 67 Q 50 72 61 67 Q 50 71 39 67 Z"
      : state === "thinking"
      ? "M 41 68 Q 50 67 59 69 Z"
      : mouthPaths[0]

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}
      style={{
        transform: "translateZ(0)",
        WebkitFontSmoothing: "antialiased",
      }}
      aria-label={`FINNA Copilot Avatar (${state})`}
    >
      {/* Listening Wave / Pulse Ring */}
      {state === "listening" && (
        <span className="absolute -inset-2.5 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
      )}
      {state === "speaking" && (
        <span className="absolute -inset-1.5 rounded-full bg-emerald-500/15 animate-pulse pointer-events-none" />
      )}

      {/* Main Avatar SVG */}
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
        variants={headVariants}
        animate={state}
      >
        <defs>
          {/* Gentle Skin Gradient */}
          <linearGradient id="finnaSkin" x1="50" y1="20" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE0C8" />
            <stop offset="1" stopColor="#F5CBA7" />
          </linearGradient>

          {/* Hair & Outline Gradient */}
          <linearGradient id="finnaHair" x1="20" y1="10" x2="80" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1E1E" />
            <stop offset="1" stopColor="#0A0A0A" />
          </linearGradient>

          {/* Cheek Glow */}
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop stopColor="#FF7A7A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FF7A7A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Head Base Silhouette */}
        <circle cx="50" cy="52" r="34" fill="url(#finnaSkin)" />

        {/* Ears */}
        <circle cx="16" cy="53" r="6" fill="#F5CBA7" stroke="#0A0A0A" strokeWidth="1.5" />
        <circle cx="84" cy="53" r="6" fill="#F5CBA7" stroke="#0A0A0A" strokeWidth="1.5" />
        <path d="M 16 51 Q 18 53 16 55" stroke="#D9A880" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 84 51 Q 82 53 84 55" stroke="#D9A880" strokeWidth="1.2" strokeLinecap="round" />

        {/* Hair - Stylish Gig Partner Cap / Modern Hairstyle */}
        <path
          d="M 18 42 C 18 22, 34 14, 50 14 C 66 14, 82 22, 82 42 C 82 32, 75 22, 50 20 C 25 22, 18 32, 18 42 Z"
          fill="url(#finnaHair)"
        />
        <path
          d="M 22 28 C 34 16, 66 16, 78 28 C 72 23, 60 21, 50 21 C 40 21, 28 23, 22 28 Z"
          fill="#333333"
        />

        {/* Soft Cheek Blush */}
        <circle cx="28" cy="58" r="6" fill="url(#cheekBlush)" />
        <circle cx="72" cy="58" r="6" fill="url(#cheekBlush)" />

        {/* Eyebrows */}
        <g stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round">
          {state === "listening" ? (
            <>
              {/* Alert raised eyebrows */}
              <path d="M 31 38 Q 38 34 45 37" />
              <path d="M 55 37 Q 62 34 69 38" />
            </>
          ) : state === "thinking" ? (
            <>
              {/* Inquisitive thinking tilt */}
              <path d="M 31 40 Q 38 41 45 42" />
              <path d="M 55 37 Q 62 33 69 35" />
            </>
          ) : (
            <>
              {/* Friendly relaxed eyebrows */}
              <path d="M 31 39 Q 38 36 45 39" />
              <path d="M 55 39 Q 62 36 69 39" />
            </>
          )}
        </g>

        {/* Eyes Group */}
        <g>
          {blink ? (
            /* Closed Blinking Eyes */
            <g stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 32 49 Q 38 52 44 49" />
              <path d="M 56 49 Q 62 52 68 49" />
            </g>
          ) : state === "thinking" ? (
            /* Looking Up-Right (Thinking) */
            <>
              {/* Sclera */}
              <ellipse cx="38" cy="49" rx="6.5" ry="6" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
              <ellipse cx="62" cy="49" rx="6.5" ry="6" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
              {/* Iris shifted up-right */}
              <circle cx="40.5" cy="47" r="3.2" fill="#0A0A0A" />
              <circle cx="64.5" cy="47" r="3.2" fill="#0A0A0A" />
              {/* Catchlight */}
              <circle cx="41.5" cy="46" r="1.1" fill="#FFFFFF" />
              <circle cx="65.5" cy="46" r="1.1" fill="#FFFFFF" />
            </>
          ) : state === "listening" ? (
            /* Attentive Eyes */
            <>
              <ellipse cx="38" cy="49" rx="7" ry="7" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.6" />
              <ellipse cx="62" cy="49" rx="7" ry="7" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.6" />
              <circle cx="38" cy="49" r="3.6" fill="#0A0A0A" />
              <circle cx="62" cy="49" r="3.6" fill="#0A0A0A" />
              {/* Double Catchlight */}
              <circle cx="39.5" cy="47.5" r="1.4" fill="#FFFFFF" />
              <circle cx="63.5" cy="47.5" r="1.4" fill="#FFFFFF" />
              <circle cx="36.5" cy="50.5" r="0.7" fill="#FFFFFF" />
              <circle cx="60.5" cy="50.5" r="0.7" fill="#FFFFFF" />
            </>
          ) : (
            /* Standard Idle / Speaking Eyes */
            <>
              <ellipse cx="38" cy="49" rx="6.5" ry="6" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
              <ellipse cx="62" cy="49" rx="6.5" ry="6" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.5" />
              <circle cx="38" cy="49" r="3.4" fill="#0A0A0A" />
              <circle cx="62" cy="49" r="3.4" fill="#0A0A0A" />
              <circle cx="39.5" cy="47.5" r="1.2" fill="#FFFFFF" />
              <circle cx="63.5" cy="47.5" r="1.2" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* Cute Subtle Nose */}
        <path d="M 48 56 Q 50 58 52 56" stroke="#D9A880" strokeWidth="1.8" strokeLinecap="round" />

        {/* Dynamic Animated Mouth */}
        <path
          d={activeMouthPath}
          fill={state === "speaking" && mouthFrame > 0 ? "#7A1C1C" : "#0A0A0A"}
          stroke="#0A0A0A"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Subtle Teeth/Tongue highlight when mouth is open */}
        {state === "speaking" && mouthFrame >= 2 && (
          <path d="M 44 65 Q 50 67 56 65" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </motion.svg>

      {/* Floating Thinking Dots Indicator */}
      {state === "thinking" && (
        <div className="absolute -top-3.5 -right-1 flex items-center gap-1 bg-white border border-[#e5e5e5] px-2 py-1 rounded-full shadow-xs">
          <span className="size-1.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-black animate-bounce" />
        </div>
      )}
    </div>
  )
}
