import { test, describe } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

describe("FINNA Phone Microphone Access & Speech Recognition Contract", () => {
  const rootDir = process.cwd()
  const nextConfig = fs.readFileSync(path.join(rootDir, "next.config.mjs"), "utf8")
  const middleware = fs.readFileSync(path.join(rootDir, "middleware.ts"), "utf8")
  const copilotPanel = fs.readFileSync(path.join(rootDir, "components/finna/copilot-panel.tsx"), "utf8")

  test("next.config.mjs specifies Permissions-Policy: microphone=* header", () => {
    assert.match(
      nextConfig,
      /Permissions-Policy['"]?,\s*value:\s*['"]microphone=\*['"]/,
      "next.config.mjs must declare Permissions-Policy: microphone=* to authorize phone browsers and WebViews"
    )
  })

  test("middleware.ts sets Permissions-Policy header on every response", () => {
    assert.ok(
      middleware.includes('Permissions-Policy') && middleware.includes('microphone=*'),
      "middleware.ts must set Permissions-Policy: microphone=* on outgoing responses"
    )
  })

  test("copilot-panel.tsx implements proactive getUserMedia permission priming for mobile phones", () => {
    assert.ok(
      copilotPanel.includes("ensureMicrophonePermission"),
      "Must have dedicated ensureMicrophonePermission helper"
    )
    assert.ok(
      copilotPanel.includes("navigator.mediaDevices.getUserMedia"),
      "Must invoke navigator.mediaDevices.getUserMedia to prompt native OS and mobile browser dialog"
    )
  })

  test("copilot-panel.tsx stops media tracks immediately to release Android hardware audio lock", () => {
    assert.ok(
      copilotPanel.includes("stream.getTracks().forEach((track) => track.stop())"),
      "Must release stream tracks immediately so Android AudioRecord HAL is freed for SpeechRecognition"
    )
  })

  test("copilot-panel.tsx supports both modern and legacy Capacitor Speech Recognition APIs", () => {
    assert.ok(
      copilotPanel.includes("checkPermissions") && copilotPanel.includes("requestPermissions"),
      "Must support modern Capacitor checkPermissions & requestPermissions"
    )
    assert.ok(
      copilotPanel.includes("hasPermission") && copilotPanel.includes("requestPermission"),
      "Must maintain fallback for legacy Capacitor hasPermission & requestPermission"
    )
  })

  test("copilot-panel.tsx uses interimResults for real-time speech feedback", () => {
    assert.ok(
      copilotPanel.includes("recognition.interimResults = true"),
      "Speech recognition should enable interimResults for immediate responsive feedback while speaking"
    )
  })

  test("copilot-panel.tsx renders voiceNotice alert banner to give mobile users actionable feedback", () => {
    assert.ok(
      copilotPanel.includes("{voiceNotice && ("),
      "voiceNotice must be rendered in the JSX to notify users if microphone access needs attention"
    )
  })
})
