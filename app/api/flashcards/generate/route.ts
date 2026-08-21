import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { CreateFlashcardReq, CreateFlashcardRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";

const PROMPT = (input: string, deck: string | undefined) => `You are an expert at creating high-quality flashcards for spaced repetition learning.
Extract key facts, definitions, formulas, and Q/A pairs from the input text.

RULES:
- Create ONE flashcard per distinct fact/concept — do not merge unrelated facts
- Front: clear question or prompt (verb-first where possible, <80 chars)
- Back: concise answer with key detail (<200 chars)
- For formulas: front shows formula name, back shows formula + variables
- For definitions: front asks "What is X?", back gives concise definition
- For procedures: front asks "How to do X?", back lists 3-5 steps
- Group related cards under a suggested deck name (from context or topic)
- Return ONLY valid JSON, no prose, no fences

SCHEMA: {"cards": [{"deck": "string", "front": "string", "back": "string"}]}

EXAMPLE:
Input: "Photosynthesis: 6CO2 + 6H2O -> C6H12O6 + 6O2. Chlorophyll absorbs light. Occurs in chloroplasts."
Output: {"cards": [
  {"deck": "Biology", "front": "What is the chemical equation for photosynthesis?", "back": "6CO2 + 6H2O -> C6H12O6 + 6O2"},
  {"deck": "Biology", "front": "Where does photosynthesis occur?", "back": "In chloroplasts, using chlorophyll to absorb light"}
]}

${deck ? `Suggested deck: "${deck}"` : ""}

Input: """${input.replace(/"""/g, "'\"'")}"""
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateFlashcardReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  try {
    let cards: { deck: string; front: string; back: string }[] = [];

    // Handle different input formats
    if ("cards" in parsed.data) {
      // Pre-structured cards
      cards = (parsed.data as any).cards;
    } else if ("raw_text" in parsed.data) {
      // Raw text to be processed by AI
      const rawText = (parsed.data as any).raw_text ?? "";
      if (!rawText.trim()) return NextResponse.json({ error: "Provide raw_text or cards array" }, { status: 400 });

      const result = await callAI(PROMPT(rawText, (parsed.data as any).deck), CreateFlashcardRes, { 
        temperature: 0.3, 
        maxTokens: 2000 
      });
      cards = (result as any).cards;
    } else {
      // Single card format: { deck, front, back }
      const data = parsed.data as any;
      cards = [{
        deck: data.deck ?? "General",
        front: data.front,
        back: data.back,
      }];
    }

    if (!cards || !cards.length) {
      return NextResponse.json({ error: "No cards generated" }, { status: 500 });
    }

    // Apply deck if provided
    const deck = (parsed.data as any).deck ?? "General";
    const inserts = cards.map((c: any, i: number) => ({
      user_id: user.id,
      deck: c.deck ?? deck,
      front: c.front?.slice(0, 500) ?? "",
      back: c.back?.slice(0, 2000) ?? "",
      next_review_at: new Date().toISOString(),
      interval_days: 1,
      ease: 2.5,
      step_order: i,
    }));

    const { data, error } = await supabase.from("flashcards").insert(inserts).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ cards: data });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("AI_KEY_MISSING") || msg.includes("GROQ_KEY_MISSING") || msg.includes("GEMINI_KEY_MISSING")) {
      return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    }
    if (msg.includes("429")) return NextResponse.json({ error: "AI is busy — try again." }, { status: 429 });
    return NextResponse.json({ error: "Couldn't generate flashcards — try again?" }, { status: 502 });
  }
}