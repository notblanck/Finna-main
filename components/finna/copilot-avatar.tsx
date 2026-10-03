"use client"

import * as React from "react"
import { motion } from "framer-motion"

export type CopilotState = "idle" | "listening" | "thinking" | "speaking"

interface CopilotAvatarProps {
  state: CopilotState
  size?: "sm" | "md" | "lg"
  className?: string
  mouthShapeIndex?: number // 0 to 4 (closed, small, open, wide, oo)
}

export function CopilotAvatar({
  state,
  size = "md",
  className = "",
  mouthShapeIndex,
}: CopilotAvatarProps) {
  const [blink, setBlink] = React.useState(false)
  const [autoMouthFrame, setAutoMouthFrame] = React.useState(0)
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

  // Random periodic blinking every 2 to 5 seconds
  React.useEffect(() => {
    if (prefersReducedMotion) return
    let timeout: NodeJS.Timeout

    const scheduleBlink = () => {
      const delay = Math.random() * 3000 + 2000 // 2s - 5s
      timeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          scheduleBlink()
        }, 150)
      }, delay)
    }

    scheduleBlink()
    return () => clearTimeout(timeout)
  }, [prefersReducedMotion])

  // Internal speaking fallback loop if mouthShapeIndex is not explicitly driven by onboundary
  React.useEffect(() => {
    if (state !== "speaking" || prefersReducedMotion || mouthShapeIndex !== undefined) {
      setAutoMouthFrame(0)
      return
    }

    const interval = setInterval(() => {
      // cycle through 1, 2, 3, 4, 2, 1
      setAutoMouthFrame((prev) => {
        const next = (prev + 1) % 5
        return next === 0 ? 1 : next
      })
    }, 140)

    return () => clearInterval(interval)
  }, [state, prefersReducedMotion, mouthShapeIndex])

  const dimensions = {
    sm: "size-8 sm:size-9",
    md: "size-11 sm:size-12",
    lg: "size-20 sm:size-24",
  }[size]

  // Head and Breathing Animation Variants (GPU-only transforms)
  const shouldersVariants: any = {
    idle: {
      y: prefersReducedMotion ? 0 : [0, -1.2, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
    },
    listening: {
      y: -1.5,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    thinking: {
      y: 0,
      transition: { duration: 0.25 },
    },
    speaking: {
      y: prefersReducedMotion ? 0 : [0, -1.8, 0, -1, 0],
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
  }

  const headVariants: any = {
    idle: {
      y: prefersReducedMotion ? 0 : [0, -1.8, 0],
      rotate: prefersReducedMotion ? 0 : [0, 0.7, -0.7, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
    },
    listening: {
      y: -2.5,
      rotate: -2,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    thinking: {
      y: [0, -1.2, 0],
      rotate: [0, 1.8, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
    speaking: {
      y: prefersReducedMotion ? 0 : [0, -2, 0, -1, 0],
      rotate: prefersReducedMotion ? 0 : [0, 1, -0.8, 0.5, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
  }

  // 5 distinct mouth shapes for speech synthesis:
  // 0: Closed / gentle smile
  // 1: Small opening (m, b, p, t)
  // 2: Mid open (ah, eh)
  // 3: Wide open (aa, ay)
  // 4: "oo" / "oh" rounded
  const mouthPaths = [
    "M 39 61 Q 50 66 61 61", // 0: closed smile
    "M 42 61 Q 50 63 58 61 Q 50 66 42 61 Z", // 1: small
    "M 40 60 Q 50 63 60 60 Q 50 71 40 60 Z", // 2: open
    "M 38 59 Q 50 62 62 59 Q 50 74 38 59 Z", // 3: wide
    "M 43 60 Q 50 59 57 60 Q 58 69 50 69 Q 42 69 43 60 Z", // 4: oo
  ]

  const activeShape =
    state === "speaking"
      ? (mouthShapeIndex !== undefined ? mouthShapeIndex : autoMouthFrame)
      : state === "listening"
      ? 1
      : state === "thinking"
      ? 0
      : 0

  const activeMouthPath = mouthPaths[activeShape] || mouthPaths[0]

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${dimensions} ${className}`}
      style={{
        transform: "translateZ(0)",
        WebkitFontSmoothing: "antialiased",
      }}
      aria-label={`FINNA Copilot Avatar (${state})`}
    >
      {/* Listening Wave / Pulse Ring */}
      {state === "listening" && (
        <span className="absolute -inset-2 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none" />
      )}
      {state === "speaking" && (
        <span className="absolute -inset-1.5 rounded-full border border-emerald-500/30 animate-pulse pointer-events-none" />
      )}

      {/* Main Vector SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-xs"
      >
        <defs>
          {/* Warm Brown Indian Skin Tones */}
          <linearGradient id="workerSkin" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A46843" />
            <stop offset="100%" stopColor="#8C522F" />
          </linearGradient>

          {/* Under-chin / Neck Shadow */}
          <linearGradient id="workerNeckShadow" x1="50" y1="62" x2="50" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#753F1F" />
            <stop offset="100%" stopColor="#8C522F" />
          </linearGradient>

          {/* Sleek FINNA Brand Helmet (Matte Black with subtle highlights) */}
          <linearGradient id="helmetGrad" x1="20" y1="10" x2="80" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A2A2A" />
            <stop offset="50%" stopColor="#171717" />
            <stop offset="100%" stopColor="#0D0D0D" />
          </linearGradient>

          {/* Shirt Gradient (Minimalist Dark Charcoal / Black) */}
          <linearGradient id="shirtGrad" x1="20" y1="75" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#25282B" />
            <stop offset="100%" stopColor="#181A1C" />
          </linearGradient>

          {/* Gig Delivery Backpack Strap */}
          <linearGradient id="strapGrad" x1="60" y1="75" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3C4044" />
            <stop offset="100%" stopColor="#282A2C" />
          </linearGradient>

          {/* Cheek Warmth */}
          <radialGradient id="workerCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C47355" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C47355" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. LAYER: Shoulders & Delivery Shirt with Breathing Animation */}
        <motion.g
          id="shoulders"
          variants={shouldersVariants}
          animate={state}
        >
          {/* Shoulders Silhouette */}
          <path
            d="M 10 100 C 10 83, 26 75, 42 75 L 58 75 C 74 75, 90 83, 90 100 Z"
            fill="url(#shirtGrad)"
          />

          {/* Shirt Collar & Placket */}
          <path
            d="M 42 75 L 47 84 L 50 84 L 43 75 Z"
            fill="#32363A"
          />
          <path
            d="M 58 75 L 53 84 L 50 84 L 57 75 Z"
            fill="#32363A"
          />
          <line x1="50" y1="84" x2="50" y2="100" stroke="#121314" strokeWidth="1" />

          {/* Delivery Backpack Strap (Visible over right shoulder) */}
          <path
            d="M 68 76 L 76 77 L 72 100 L 64 100 Z"
            fill="url(#strapGrad)"
            stroke="#121314"
            strokeWidth="0.8"
          />
          {/* Strap Stitching / Buckle */}
          <rect x="65" y="84" width="9" height="4" rx="1" fill="#4B5056" stroke="#121314" strokeWidth="0.7" />
          <line x1="69.5" y1="84" x2="69.5" y2="88" stroke="#121314" strokeWidth="0.8" />

          {/* Left subtle strap edge */}
          <path
            d="M 23 76 L 30 77 L 26 100 L 19 100 Z"
            fill="url(#strapGrad)"
            opacity="0.6"
          />
        </motion.g>

        {/* 2. LAYER: Head, Face, Helmet, Features with Sway / Nod Animation */}
        <motion.g
          id="head-group"
          variants={headVariants}
          animate={state}
          style={{ originX: "50px", originY: "75px" }}
        >
          {/* Neck */}
          <path
            d="M 42 63 L 42 76 L 58 76 L 58 63 Z"
            fill="url(#workerSkin)"
          />
          {/* Under-chin Shadow */}
          <path
            d="M 42 63 Q 50 69 58 63 L 58 68 Q 50 72 42 68 Z"
            fill="url(#workerNeckShadow)"
          />

          {/* Ears */}
          <circle cx="26" cy="48" r="4.5" fill="#8C522F" stroke="#171717" strokeWidth="1" />
          <circle cx="74" cy="48" r="4.5" fill="#8C522F" stroke="#171717" strokeWidth="1" />
          <path d="M 26 46 Q 28 48 26 50" stroke="#663417" strokeWidth="1" strokeLinecap="round" />
          <path d="M 74 46 Q 72 48 74 50" stroke="#663417" strokeWidth="1" strokeLinecap="round" />

          {/* Face Silhouette (Jaw and Cheeks) */}
          <path
            d="M 28 41 C 28 57, 36 67, 50 67 C 64 67, 72 57, 72 41 C 72 32, 63 26, 50 26 C 37 26, 28 32, 28 41 Z"
            fill="url(#workerSkin)"
          />

          {/* Helmet Chin Strap */}
          <path
            d="M 28 43 L 43 64 L 57 64 L 72 43"
            stroke="#171717"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Subtle Cheek Warmth */}
          <circle cx="34" cy="53" r="5" fill="url(#workerCheek)" />
          <circle cx="66" cy="53" r="5" fill="url(#workerCheek)" />

          {/* 3. Sleek Open-Face Delivery Helmet (FINNA Brand) */}
          <path
            d="M 24 39 C 24 15, 39 9, 50 9 C 61 9, 76 15, 76 39 C 76 41, 73 43, 71 42 C 67 40, 62 35, 50 35 C 38 35, 33 40, 29 42 C 27 43, 24 41, 24 39 Z"
            fill="url(#helmetGrad)"
            stroke="#0D0D0D"
            strokeWidth="1.2"
          />
          {/* Helmet Visor Rim */}
          <path
            d="M 26 37 C 34 31, 66 31, 74 37 C 70 33, 60 30, 50 30 C 40 30, 30 33, 26 37 Z"
            fill="#383838"
          />
          {/* Subtle FINNA Brand Geometric Accent (Clean white pin line) */}
          <path d="M 48.5 13 L 51.5 13 L 50.8 22 L 49.2 22 Z" fill="#FFFFFF" opacity="0.9" />
          <circle cx="50" cy="25.5" r="1.3" fill="#FFFFFF" opacity="0.9" />

          {/* Eyebrows */}
          <g stroke="#171717" strokeWidth="2.2" strokeLinecap="round">
            {state === "listening" ? (
              <>
                <path d="M 33 38 Q 39 34 45 37" />
                <path d="M 55 37 Q 61 34 67 38" />
              </>
            ) : state === "thinking" ? (
              <>
                {/* One curious, one high */}
                <path d="M 33 41 Q 39 42 45 41" />
                <path d="M 55 37 Q 61 33 67 36" />
              </>
            ) : (
              <>
                {/* Confident, friendly resting arch */}
                <path d="M 33 39 Q 39 36 45 38" />
                <path d="M 55 38 Q 61 36 67 39" />
              </>
            )}
          </g>

          {/* Eyes Group */}
          <g id="eyes">
            {blink ? (
              /* Closed Blinking Eyes */
              <g stroke="#171717" strokeWidth="2.2" strokeLinecap="round">
                <path d="M 35 47 Q 40 50 45 47" />
                <path d="M 55 47 Q 60 50 65 47" />
              </g>
            ) : state === "thinking" ? (
              /* Looking Up and to the side (Thinking) */
              <>
                <ellipse cx="40" cy="46.5" rx="5.2" ry="4.5" fill="#FFFFFF" stroke="#171717" strokeWidth="1.2" />
                <ellipse cx="60" cy="46.5" rx="5.2" ry="4.5" fill="#FFFFFF" stroke="#171717" strokeWidth="1.2" />
                {/* Irises shifted up-right */}
                <circle cx="42" cy="44.8" r="2.8" fill="#1A110B" />
                <circle cx="62" cy="44.8" r="2.8" fill="#1A110B" />
                <circle cx="43" cy="43.8" r="0.9" fill="#FFFFFF" />
                <circle cx="63" cy="43.8" r="0.9" fill="#FFFFFF" />
              </>
            ) : state === "listening" ? (
              /* Alert Attentive Eyes */
              <>
                <ellipse cx="40" cy="46.5" rx="5.8" ry="5.2" fill="#FFFFFF" stroke="#171717" strokeWidth="1.3" />
                <ellipse cx="60" cy="46.5" rx="5.8" ry="5.2" fill="#FFFFFF" stroke="#171717" strokeWidth="1.3" />
                <circle cx="40" cy="46.5" r="3.1" fill="#1A110B" />
                <circle cx="60" cy="46.5" r="3.1" fill="#1A110B" />
                <circle cx="41.2" cy="45.2" r="1.1" fill="#FFFFFF" />
                <circle cx="61.2" cy="45.2" r="1.1" fill="#FFFFFF" />
                <circle cx="38.8" cy="47.6" r="0.6" fill="#FFFFFF" />
                <circle cx="58.8" cy="47.6" r="0.6" fill="#FFFFFF" />
              </>
            ) : (
              /* Standard Friendly Focused Eyes */
              <>
                <ellipse cx="40" cy="46.5" rx="5.2" ry="4.6" fill="#FFFFFF" stroke="#171717" strokeWidth="1.2" />
                <ellipse cx="60" cy="46.5" rx="5.2" ry="4.6" fill="#FFFFFF" stroke="#171717" strokeWidth="1.2" />
                <circle cx="40" cy="46.5" r="2.8" fill="#1A110B" />
                <circle cx="60" cy="46.5" r="2.8" fill="#1A110B" />
                <circle cx="41.2" cy="45.3" r="1.0" fill="#FFFFFF" />
                <circle cx="61.2" cy="45.3" r="1.0" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Clean Nose */}
          <path
            d="M 48 51 Q 50 54 52 51"
            stroke="#6B3717"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Animated Mouth (5 distinct phoneme shapes) */}
          {activeShape === 0 ? (
            /* Confident closed smile */
            <g>
              <path
                d={activeMouthPath}
                stroke="#171717"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Smile corner dimples */}
              <path d="M 37.5 60 Q 38.5 61 39.5 62" stroke="#6B3717" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 62.5 60 Q 61.5 61 60.5 62" stroke="#6B3717" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          ) : (
            /* Open speech phoneme */
            <g>
              <path
                d={activeMouthPath}
                fill="#541B1B"
                stroke="#171717"
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Upper teeth hint during wide/open speech */}
              {(activeShape === 2 || activeShape === 3) && (
                <path
                  d="M 43 61 Q 50 63 57 61"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </g>
          )}
        </motion.g>
      </svg>

      {/* Thinking Three-Dot Loader Indicator */}
      {state === "thinking" && (
        <div className="absolute -top-3.5 -right-1 flex items-center gap-1 bg-white dark:bg-[#1f1f1f] border border-[#e5e5e5] dark:border-[#333333] px-2 py-1 rounded-full shadow-sm">
          <span className="size-1.5 rounded-full bg-black dark:bg-white animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-black dark:bg-white animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-black dark:bg-white animate-bounce" />
        </div>
      )}
    </div>
  )
}
