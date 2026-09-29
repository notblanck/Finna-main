import { NextResponse } from "next/server"
import { evaluateFinancialReasoning } from "@/lib/finance/evaluation"
import { calculateFinnaFinancialState } from "@/lib/finance/engine"

export async function GET() {
  try {
    const calc = calculateFinnaFinancialState()
    const benchmarks = evaluateFinancialReasoning(calc)
    const passedCount = benchmarks.filter((b) => b.passed).length

    return NextResponse.json({
      status: "SUCCESS",
      benchmarkSuite: "FINNA Numerical Reasoning Evaluation (FinQA, TAT-QA, data.gov.in)",
      timestamp: new Date().toISOString(),
      allPassed: passedCount === benchmarks.length,
      passedCount,
      totalCount: benchmarks.length,
      benchmarks,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
