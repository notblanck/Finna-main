"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { ArrowUp } from "lucide-react"

export function ScrollProgressBar() {
  const { scrollYProgress, scrollY } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setShowScrollTop(latest > 350)
    })
  }, [scrollY])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Top 2.5px Minimalist Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-black z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-6 left-6 z-40 flex size-10 items-center justify-center rounded-full bg-white text-black border border-[#e5e5e5] shadow-md hover:bg-black hover:text-white hover:border-black transition-colors cursor-pointer group"
          >
            <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
