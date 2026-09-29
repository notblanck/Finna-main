"use client"

import React from "react"
import Link from "next/link"

/**
 * Custom FINNA Pin Logo
 * Recreates the map pin marker with inner circle and Indian Rupee (₹) symbol
 * styled in black & white to match FINNA's minimalist aesthetic.
 */
export function FinnaLogoMark({
  className = "size-8",
  inverted = false,
}: {
  className?: string
  inverted?: boolean
}) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
      >
        {/* Outer Location Pin Marker */}
        <path
          d="M50 0C22.3858 0 0 22.3858 0 50C0 76.8 44.5 115.5 47.8 118.4C49.1 119.5 50.9 119.5 52.2 118.4C55.5 115.5 100 76.8 100 50C100 22.3858 77.6142 0 50 0Z"
          fill={inverted ? "#FFFFFF" : "#000000"}
        />
        {/* Inner Cutout Disc */}
        <circle
          cx="50"
          cy="48"
          r="26"
          fill={inverted ? "#000000" : "#FFFFFF"}
        />
        {/* Indian Rupee (₹) Symbol */}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="30"
          fill={inverted ? "#FFFFFF" : "#000000"}
          style={{ userSelect: "none" }}
        >
          ₹
        </text>
      </svg>
    </div>
  )
}

/**
 * Standard FINNA Logo with Icon + Brand Name
 */
export function FinnaLogo({
  className = "",
  size = "md",
  href = "/",
  inverted = false,
}: {
  className?: string
  size?: "sm" | "md" | "lg"
  href?: string
  inverted?: boolean
}) {
  const iconSize = size === "sm" ? "size-6" : size === "lg" ? "size-10" : "size-8"
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl"

  const content = (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight group ${className}`}>
      <FinnaLogoMark className={iconSize} inverted={inverted} />
      <span className={`${textSize} ${inverted ? "text-white" : "text-black"} tracking-tight`}>
        finna
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="cursor-pointer" aria-label="FINNA Home">
        {content}
      </Link>
    )
  }

  return content
}
