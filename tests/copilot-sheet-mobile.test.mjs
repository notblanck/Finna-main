import { test, describe } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

describe("FINNA Copilot Mobile Bottom Sheet & Overlay Stacking Contract", () => {
  const rootDir = process.cwd()
  const globalsCss = fs.readFileSync(path.join(rootDir, "app/globals.css"), "utf8")
  const copilotPanel = fs.readFileSync(path.join(rootDir, "components/finna/copilot-panel.tsx"), "utf8")
  const cookieBanner = fs.readFileSync(path.join(rootDir, "components/finna/cookie-banner.tsx"), "utf8")
  const mobileNav = fs.readFileSync(path.join(rootDir, "components/finna/mobile-nav.tsx"), "utf8")
  const cityModal = fs.readFileSync(path.join(rootDir, "components/finna/city-onboarding-modal.tsx"), "utf8")

  test("Single unified z-index scale is defined in globals.css", () => {
    assert.match(globalsCss, /--z-content:\s*0;/, "Content should have z-index 0")
    assert.match(globalsCss, /--z-nav:\s*40;/, "Sticky nav should have z-index 40")
    assert.match(globalsCss, /--z-bottom-tabs:\s*40;/, "Bottom tabs should have z-index 40")
    assert.match(globalsCss, /--z-backdrop:\s*50;/, "Backdrop should have z-index 50")
    assert.match(globalsCss, /--z-copilot:\s*60;/, "Copilot sheet should have z-index 60")
    assert.match(globalsCss, /--z-toast:\s*70;/, "Toasts should have z-index 70")
    assert.match(globalsCss, /--z-cookie-banner:\s*80;/, "Cookie banner should have z-index 80")
  })

  test("Copilot sheet is rendered through a React Portal directly to document.body", () => {
    assert.ok(copilotPanel.includes("createPortal("), "createPortal must be called in CopilotPanel")
    assert.ok(copilotPanel.includes("document.body"), "createPortal must target document.body")
  })

  test("Backdrop and Copilot sheet are rendered as separate siblings with strict z-index stacking", () => {
    // Backdrop is sibling 1 at z-[50], panel is sibling 2 at z-[60]
    assert.ok(copilotPanel.includes("z-[50]"), "Backdrop must be at z-[50]")
    assert.ok(copilotPanel.includes("z-[60]"), "Sheet panel must be at z-[60]")

    // Backdrop must NOT use blur or backdrop-filter
    const backdropSection = copilotPanel.slice(
      copilotPanel.indexOf('key="copilot-backdrop"'),
      copilotPanel.indexOf('key="copilot-sheet"')
    )
    assert.ok(!backdropSection.includes("backdrop-blur"), "Backdrop must NOT have backdrop-blur")
    assert.ok(!backdropSection.includes("filter:"), "Backdrop must NOT use CSS filter")
    assert.ok(backdropSection.includes("onClick={handleClose}"), "Tapping backdrop must trigger handleClose")
  })

  test("Copilot panel animation operates on translateY only, always finishes at opacity 1, and supports reduced motion", () => {
    assert.ok(copilotPanel.includes("prefersReducedMotion"), "Component must detect prefers-reduced-motion")
    assert.ok(copilotPanel.includes('opacity: 1'), "Opacity must be guaranteed at 1")
    assert.ok(!copilotPanel.includes("opacity: 0, y: 30, scale: 0.98"), "Old stuck-animation variant must be removed")
  })

  test("Body scroll lock is applied once when open and cleanly restored on close and route changes", () => {
    assert.ok(copilotPanel.includes('document.body.style.overflow = "hidden"'), "Body scroll lock must be set to hidden")
    assert.ok(copilotPanel.includes("document.body.style.overflow = prevOverflow"), "Body scroll lock must restore previous overflow on cleanup")
    assert.ok(copilotPanel.includes("pathname"), "Must track pathname for route changes")
    assert.ok(copilotPanel.includes("usePathname"), "Must use next/navigation usePathname hook")
  })

  test("Overlay coordination ensures only one overlay is active and opening Copilot closes any other sheet", () => {
    // Copilot dispatches close-all-overlays and copilot-state
    assert.ok(copilotPanel.includes("finna:close-all-overlays"), "Copilot must dispatch finna:close-all-overlays")
    assert.ok(copilotPanel.includes("finna:copilot-state"), "Copilot must broadcast its open state")

    // MobileTopBar listens to close-all-overlays
    assert.ok(mobileNav.includes("finna:close-all-overlays"), "Mobile menu must listen to close-all-overlays")

    // CityOnboardingModal listens to close-all-overlays
    assert.ok(cityModal.includes("finna:close-all-overlays"), "City onboarding modal must listen to close-all-overlays")

    // CookieBanner hides while Copilot is open to prevent double dimming
    assert.ok(cookieBanner.includes("isCopilotOpen"), "Cookie banner must track isCopilotOpen")
    assert.ok(cookieBanner.includes("!isOpen || isCopilotOpen"), "Cookie banner must be suppressed while Copilot is open")
  })

  test("Copilot sheet layout includes drag handle, close button, safe-area padding, and max-h-[90dvh]", () => {
    assert.ok(copilotPanel.includes("max-h-[90dvh]"), "Sheet must use max-h-[90dvh]")
    assert.ok(copilotPanel.includes("h-[90dvh]"), "Sheet must use h-[90dvh]")
    assert.ok(copilotPanel.includes("env(safe-area-inset-bottom"), "Input must have safe-area inset padding")
    assert.ok(copilotPanel.includes("overscroll-contain"), "Message list must have overscroll-contain")
    assert.ok(copilotPanel.includes("aria-label=\"Close bottom sheet\""), "Mobile drag handle must provide close affordance")
  })
})
