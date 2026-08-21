import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { QuizFromDeckReq, QuizFromDeckRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";

const PROMPT = (deck: string, flashcardsJson: string) => `Generate a quiz from the provided flashcard deck. Mix question types.

RULES:
- Create varied question types: recall (front->back), reverse (back->front), multiple choice
- Use existing flashcards as source — do not invent new facts
- Mix difficulty; ~70% recall, 30% reverse/multiple choice
- Max 20 questions per quiz
- Return ONLY valid JSON

SCHEMA: {"quiz": {"title": "string", "questions": [{"q": "string", "a": "string", "deck": "string", "flashcard_id": "string|null"}]}}

EXAMPLE:
Input: deck="Biology", flashcards=[...]
Output: {"quiz": {"title": "Biology Quiz", "questions": [
  {"q": "What is the chemical equation for photosynthesis?", "a": "6CO2 + 6H2O -> C6H12O6 + 6O2", "deck": "Biology", "flashcard_id": "..."},
  {"q": "Where does photosynthesis occur?", "a": "In chloroplasts", "deck": "Biology", "flashcard_id": "..."}
]}}

Input: deck="${deck}", flashcards: ${flashcardsJson}
Output:`;

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = QuizFromDeckReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  // Fetch flashcards for the deck
  const { data: cards, error: fetchErr } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .eq("deck", parsed.data.deck)
    .limit(50);

  if (fetchErr) return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 });
  if (!cards || !cards.length) return NextResponse.json({ error: "No flashcards in this deck" }, { status: 400 });

  // Limit cards for quiz generation
  const limitedCards = cards.slice(0, parsed.data.count ?? 10);
  const flashcardsJson = JSON.stringify(limitedCards.map(c => ({
    id: c.id,
    front: c.front,
    back: c.back,
    deck: c.deck,
  })));

  try {
    const prompt = `Generate a quiz from the provided flashcard deck. Mix question types.

RULES:
- Create varied question types: recall (front->back), reverse (back->front), multiple choice
- Use existing flashcards as source — do not invent new facts
- Mix difficulty; ~70% recall, 30% reverse/multiple choice
- Max 20 questions per quiz
- Return ONLY valid JSON

SCHEMA: {"quiz": {"title": "string", "questions": [{"q": "string", "a": "string", "deck": "string", "flashcard_id": "string|null"}]}}

EXAMPLE:
Input: deck="Biology", flashcards=[...]
Output: {"quiz": {"title": "Biology Quiz", "questions": [
  {"q": "What is the chemical equation for photosynthesis?", "a": "6CO2 + 6H2O -> C6H12O6 + 6O2", "deck": "Biology", "flashcard_id": "..."},
  {"q": "Where does photosynthesis occur?", "a": "In chloroplasts", "deck": "Biology", "flashcard_id": "..."}
]}}

Input: deck="${parsed.data.deck}", flashcards: ${flashcardsJson}
Output:`;

    const result = await callAI(prompt, QuizFromDeckRes, { temperature: 0.5, maxTokens: 3000 });
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("AI_KEY_MISSING") || msg.includes("GROQ_KEY_MISSING") || msg.includes("GEMINI_KEY_MISSING")) {
      return NextResponse.json({ error: "AI not configured." }, { status: 503 });
    }
    if (msg.includes("429")) return NextResponse.json({ error: "AI is busy — try again." }, { status: 429 });
    return NextResponse.json({ error: "Couldn't generate quiz — try again?" }, { status: 502 });
  }
}