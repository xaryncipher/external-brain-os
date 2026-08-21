import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { TriageReq, TriageRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";

const PROMPT = (input: string) => `You are an executive-function planning assistant. Triage a huge messy list (up to 400 items).

For each distinct item, output:
- title: cleaned, <8 words, verb-first where applicable
- type: task (finite) | habit (recurring) | goal (long-term) | project (collection) | avoid (distraction to limit)
- bucket: RIGHT NOW (max 3, only urgent+important) | TODAY | THIS WEEK | LATER | OPTIONAL
- reason: <12 words why this bucket/type

RULES:
- Group duplicates/related; never list same idea twice
- Limit RIGHT NOW to 3 most leverage items; rest to TODAY/THIS WEEK
- If item could be habit, mark habit; if fact to memorize, keep as task but note in reason "flashcard candidate"
- Detect overload: if >20 items, prioritize and mark rest LATER/OPTIONAL

SCHEMA: {"items": [{"title":"string","type":"task|habit|goal|project|avoid","bucket":"RIGHT NOW|TODAY|THIS WEEK|LATER|OPTIONAL","reason":"string"}]}

EXAMPLE:
Input: "I want to build muscle, fix sleep, learn programming, clean room, stop porn, 50 more..."
Output: {"items":[
  {"title":"Do 10 squats today","type":"habit","bucket":"TODAY","reason":"builds muscle, small start"},
  {"title":"Set 10pm wind-down alarm","type":"habit","bucket":"TODAY","reason":"fixes sleep, immediate"},
  {"title":"Complete Python intro lesson","type":"task","bucket":"THIS WEEK","reason":"learning, not urgent today"},
  {"title":"Limit late-night phone use","type":"avoid","bucket":"TODAY","reason":"protects sleep, avoid trigger"}
]}

Input: """${input.replace(/"""/g, "'\"'")}"""
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = TriageReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await callAI(PROMPT(parsed.data.raw_text), TriageRes, { temperature: 0.3, maxTokens: 4000 }) as any;
    if ((result as any).items.filter((i: any) => i.bucket === "RIGHT NOW").length > 3) {
      let kept = 0;
      (result as any).items = (result as any).items.map((it: any) => {
        if (it.bucket === "RIGHT NOW" && kept >= 3) return { ...it, bucket: "TODAY" as const };
        if (it.bucket === "RIGHT NOW") kept++;
        return it;
      });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("AI_KEY_MISSING") || msg.includes("GROQ_KEY_MISSING") || msg.includes("GEMINI_KEY_MISSING")) return NextResponse.json({ error: "AI not configured — add GROQ_API_KEY (or GEMINI_API_KEY)." }, { status: 503 });
    if (msg.includes("429")) return NextResponse.json({ error: "AI is busy — try again in a minute." }, { status: 429 });
    return NextResponse.json({ error: "Couldn't process that — try again?" }, { status: 502 });
  }
}
