import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { z } from "zod";
import { callGemini } from "@/lib/gemini";

const Req = z.object({ trigger: z.string().min(1).max(500).optional(), trigger_text: z.string().min(1).max(500).optional() });
const Res = z.object({ step: z.string().min(5).max(200) });

const PROMPT = (trigger: string) => `Give ONE 60-second, non-judgmental coping micro-step for an urge (porn/NSFW or phone/distraction). Calm, practical, no shame, no medical claims, <30 words, verb-first. No preaching.

SCHEMA: {"step":"string"}

EXAMPLE:
Input: trigger="bored late night"
Output: {"step":"Stand, drink water, do 20-second wall sit, then decide if urge passed."}

Context: "${trigger.replace(/"/g, '\\"')}"
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }

  const parsed = Req.safeParse(body);
  const trigger = (parsed.success && (parsed.data.trigger ?? parsed.data.trigger_text)) || "general urge";

  try {
    const result = await callGemini(PROMPT(trigger), Res, { temperature: 0.6, maxTokens: 400 });
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? "";
    if (msg.includes("GEMINI_KEY_MISSING")) {
      // Fallback without AI — still calm, no error dump
      return NextResponse.json({ step: "Stand, drink water, breathe 4-4-4 for 30s, then choose your next tiny step." });
    }
    // Graceful fallback for any failure
    return NextResponse.json({ step: "Stand, drink water, do 10 slow breaths, then decide if urge passed." });
  }
}
