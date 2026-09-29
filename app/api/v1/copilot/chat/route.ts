import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateCopilotAnswer } from "@/lib/copilot/engine"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const messages = body.messages || []
    const userQuery = messages[messages.length - 1]?.content || ""

    if (!userQuery) {
      return NextResponse.json({ error: "Missing query content" }, { status: 400 })
    }

    // 1. Generate grounded answer via FINNA Copilot Engine
    // Calculates deterministically first, then formulates the explanation
    const copilotResult = generateCopilotAnswer(userQuery, body.customMaster, body.customGig)

    // 2. Persist to Supabase if conversation tables exist
    if (user) {
      try {
        let conversationId = body.conversationId
        if (!conversationId) {
          const { data: conv } = await supabase
            .from("copilot_conversations")
            .insert({ user_id: user.id, title: userQuery.slice(0, 40) })
            .select("id")
            .maybeSingle()
          conversationId = conv?.id
        }

        if (conversationId) {
          await supabase.from("copilot_messages").insert([
            { conversation_id: conversationId, role: "user", content: userQuery },
            {
              conversation_id: conversationId,
              role: "assistant",
              content: copilotResult.explanationText,
              metadata: {
                intent: copilotResult.intent,
                structuredResult: copilotResult.structuredResult,
                mathematicalReasoning: copilotResult.mathematicalReasoning,
              },
            },
          ])
        }
      } catch (dbErr) {
        console.warn("[Copilot Chat] DB log notice:", dbErr)
      }
    }

    return NextResponse.json({
      role: "assistant",
      content: copilotResult.explanationText,
      audioText: copilotResult.audioText,
      intent: copilotResult.intent,
      language: copilotResult.language,
      structuredResult: copilotResult.structuredResult,
      mathematicalReasoning: copilotResult.mathematicalReasoning,
    })
  } catch (err: any) {
    console.error("Copilot Chat Error:", err)
    return NextResponse.json(
      {
        role: "assistant",
        content: `I encountered an unexpected issue while retrieving your financial state: ${err.message}. Please try again.`,
      },
      { status: 500 }
    )
  }
}
