import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"

import { authRouter } from "./routes/auth.js"
import { consentRouter } from "./routes/consent.js"
import { webhooksRouter } from "./routes/webhooks.js"
import { accountsRouter } from "./routes/accounts.js"
import { transactionsRouter } from "./routes/transactions.js"
import { predictionsRouter } from "./routes/predictions.js"
import { safeToSpendRouter } from "./routes/safe-to-spend.js"
import { savingsRouter } from "./routes/savings.js"
import { recommendationsRouter } from "./routes/recommendations.js"
import { marketplaceRouter } from "./routes/marketplace.js"
import { privilegesRouter } from "./routes/privileges.js"
import { cashflowRouter } from "./routes/cashflow.js"
import { profileRouter } from "./routes/profile.js"
import { aaRouter } from "./routes/aa.js"
import { aaService } from "./services/aa/index.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middlewares
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(morgan("dev"))

// Base Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "finna-backend-api",
    version: "1.0.0",
    aa_mode: aaService.name,
    timestamp: new Date().toISOString()
  })
})

// TRD §3 API Routes under /api/v1
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/consent", consentRouter)
app.use("/api/v1/webhooks", webhooksRouter)
app.use("/api/v1/accounts", accountsRouter)
app.use("/api/v1/transactions", transactionsRouter)
app.use("/api/v1/predictions", predictionsRouter)
app.use("/api/v1/safe-to-spend", safeToSpendRouter)
app.use("/api/v1/savings", savingsRouter)
app.use("/api/v1/recommendations", recommendationsRouter)
app.use("/api/v1/marketplace", marketplaceRouter)
app.use("/api/v1/health-score", marketplaceRouter) // TRD §3 endpoint direct alias
app.use("/api/v1/privileges", privilegesRouter)
app.use("/api/v1/cashflow", cashflowRouter)
app.use("/api/v1/profile", profileRouter)
app.use("/api/aa", aaRouter)
app.use("/api/v1/aa", aaRouter)

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Internal Server Error:", err)
  res.status(500).json({ error: "Internal Server Error", message: err.message })
})

app.listen(PORT, () => {
  console.log(`[FINNA Backend API] running on http://localhost:${PORT}`)
  console.log(`[FINNA AA Service] Active mode: ${aaService.name}`)
})

export default app
