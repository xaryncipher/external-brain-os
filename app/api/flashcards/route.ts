import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { CreateFlashcardReq, FlashcardRes, FlashcardReviewReq, FlashcardReviewRes, CreateFlashcardRes } from "@/lib/validators";
import { callAI } from "@/lib/ai";

// POST - Create flashcards (from AI generation or manual)
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateFlashcardReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  let cards: { deck: string; front: string; back: string }[] = [];

  // Handle different input formats
  if ("cards" in parsed.data) {
    // Pre-structured cards array
    cards = (parsed.data as any).cards;
  } else if ("raw_text" in parsed.data) {
    // This shouldn't happen in POST /api/flashcards (that's for /generate)
    return NextResponse.json({ error: "Use /api/flashcards/generate for raw text" }, { status: 400 });
  } else {
    // Single card format: { deck, front, back }
    const data = parsed.data as any;
    cards = [{
      deck: data.deck ?? "General",
      front: data.front,
      back: data.back,
    }];
  }

  if (!cards.length) return NextResponse.json({ error: "No cards provided" }, { status: 400 });

  const inserts = cards.map((c: any, i: number) => ({
    user_id: user.id,
    deck: c.deck ?? "General",
    title: c.title ?? "",
    front: c.front?.slice(0, 500) ?? "",
    back: c.back?.slice(0, 2000) ?? "",
    status: "todo" as const,
    is_today: false,
    parent_task_id: null,
    step_order: i,
    estimated_minutes: c.estimated_minutes ?? null,
    domain: c.domain ?? null,
  }));

  const { data, error } = await supabase.from("flashcards").insert(inserts).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cards: data });
}

// GET - List flashcards (with optional due filter)
export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const due = url.searchParams.get("due") === "true";
  const deck = url.searchParams.get("deck");
  const limit = parseInt(url.searchParams.get("limit") ?? "100");

  let query = supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (due) query = query.lte("next_review_at", new Date().toISOString());
  if (deck) query = query.eq("deck", deck);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cards: data });
}