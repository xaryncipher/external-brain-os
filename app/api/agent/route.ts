import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { AgentReq, AgentRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";

const SYSTEM = `You are the Life OS brain — calm, plain, second-person, sentence case, no exclamation, no shame, no red language. You control tasks/habits/flashcards/quizzes via tools. Autonomy: GUIDED — you may create/update but MUST set needs_confirmation=true for any delete or bulk (>5) operation so UI can show confirmation.

TOOLS:
- create_task(title, is_today, domain)
- update_task(id, status, is_today)
- delete_task(id)
- create_habit(title)
- log_habit(habit_id)
- breakdown_task(task_id)
- create_flashcard(deck, front, back)
- delete_flashcard(id)
- review_flashcard(card_id, rating)  // rating: Again/Hard/Good/Easy
- create_quiz_draft(title, questions)  // V1: draft only, preview

RULES:
- Use tools to act; then reply in 1-2 sentences summarizing.
- For long pasted lists, prefer classifying each into tool calls + bucket reasoning (like Triage).
- Never expose reasoning; never claim medical authority.
- Return ONLY JSON per schema, no fences.

SCHEMA: {"reply":"string","tool_calls":[{"name":"string","args":{}}],"needs_confirmation": boolean}`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = AgentReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const todayTitles = parsed.data.context?.todayTitles?.slice(0, 10).join(", ") || "none";

  const prompt = `${SYSTEM}

CONTEXT: Today tasks: ${todayTitles}
USER: """${parsed.data.message.replace(/"""/g, "'\"'")}"""
Output:`;

  try {
    const result: any = await callAI(prompt, AgentRes, { temperature: 0.7, maxTokens: 2000 });
    const hasDelete = (result.tool_calls as any[]).some((c: any) => c.name === "delete_task");
    const isBulk = (result.tool_calls as any[]).length > 5;
    if ((hasDelete || isBulk) && !result.needs_confirmation) {
      result.needs_confirmation = true;
    }
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("AI_KEY_MISSING") || msg.includes("GROQ_KEY_MISSING") || msg.includes("GEMINI_KEY_MISSING")) return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    if (msg.includes("429")) return NextResponse.json({ error: "AI is busy — try again." }, { status: 429 });
    return NextResponse.json({ error: "Couldn't process that — try again?" }, { status: 502 });
  }
}
