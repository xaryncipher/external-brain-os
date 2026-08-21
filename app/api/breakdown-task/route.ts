import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { BreakdownReq, BreakdownRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";
import { getBreakdownCache, setBreakdownCache } from "@/lib/gemini";

const PROMPT = (title: string) => `You help someone with executive dysfunction start a vague task. Break it into 2-5 micro-steps, each <5 minutes, concrete verbs, logically ordered. Never use vague verbs "plan/organize". Make first step ridiculously small.

SCHEMA: {"steps": [{"title":"string","estimated_minutes": number}]}

EXAMPLE:
Input: "Write report"
Output: {"steps":[
  {"title":"Open report doc and title it","estimated_minutes":2},
  {"title":"Write 3 bullet points of main idea","estimated_minutes":5},
  {"title":"Expand first bullet into 2 sentences","estimated_minutes":5}
]}

Task: "${title.replace(/"/g, '\\"')}"
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BreakdownReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const cached = getBreakdownCache(parsed.data.title);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await callAI(PROMPT(parsed.data.title), BreakdownRes, { temperature: 0.4, maxTokens: 800 });
    setBreakdownCache(parsed.data.title, result);
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("AI_KEY_MISSING") || msg.includes("GROQ_KEY_MISSING") || msg.includes("GEMINI_KEY_MISSING")) return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    if (msg.includes("429")) return NextResponse.json({ error: "AI is busy — try again." }, { status: 429 });
    return NextResponse.json({ error: "Couldn't break down — try again?" }, { status: 502 });
  }
}
