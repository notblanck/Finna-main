# FINNA — MCP (Model Context Protocol) Integration Inventory

This document outlines the MCP servers and tools configured and utilized during the architecture build and verification of FINNA.

---

## 1. Active MCP Servers

### Playwright MCP
- **Server**: `@modelcontextprotocol/server-playwright` / Playwright subagent
- **Purpose**: Automated end-to-end browser testing, verifying authentication flows, responsive layouts, interactive dialogs, and navigation states across mobile and desktop viewports.

### Supabase Integration
- **Server**: Direct Supabase REST / `@supabase/supabase-js` / PostgREST
- **Purpose**: Real-time Postgres database access, RLS policy enforcement, table inspection, and seed data synchronization for gig worker profiles and welfare programs.

### Vercel MCP
- **Server**: `@modelcontextprotocol/server-vercel`
- **Purpose**: Deployment tracking, environment variable configuration, build logs analysis, and production preview verification.

### Git & Codebase Tools
- **Purpose**: Idempotent git version control, granular branch management, commit traceability per phase, and lint error resolution.
