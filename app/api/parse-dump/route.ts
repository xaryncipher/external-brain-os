import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ParseDumpReq, ParseDumpRes } from "@/lib/validators";
import { callGemini } from "@/lib/gemini";

const PROMPT = (input: string) => `You are an ADHD support assistant. Extract clear tasks from a messy brain dump.

RULES:
- Write action-oriented title, verb-first, <8 words, sentence case
- One task per distinct intention; do not merge unrelated
- Do not invent tasks; ignore cheers/filler
- Return ONLY valid JSON, no prose, no fences

SCHEMA: {"tasks": [{"title": "string"}]}

EXAMPLE:
Input: "ugh need to call dentist, also mom's bday soon get a gift, and that report is due friday"
Output: {"tasks": [{"title": "Call dentist to schedule"}, {"title": "Buy gift for mom's birthday"}, {"title": "Draft report due Friday"}]}

Input: """${input.replace(/"""/g, "'\"'")}"""
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = ParseDumpReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await callGemini(PROMPT(parsed.data.raw_text), ParseDumpRes, { temperature: 0.3, maxTokens: 1200 });
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("GEMINI_KEY_MISSING")) {
      return NextResponse.json({ error: "AI not configured — add GEMINI_API_KEY in .env.local and Vercel." }, { status: 503 });
    }
    if (msg.startsWith("GEMINI_429") || msg.includes("429")) {
      return NextResponse.json({ error: "AI is busy (rate limit) — try again in a minute." }, { status: 429 });
    }
    // Calm fallback, never raw dump
    return NextResponse.json({ error: "Couldn't process that — try again?" }, { status: 502 });
  }
}
