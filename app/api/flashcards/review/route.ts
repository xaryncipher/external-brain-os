import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { FlashcardReviewReq, FlashcardReviewRes } from "@/lib/validators";

// POST - Review flashcard (SM-2 algorithm)
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = FlashcardReviewReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  // Fetch the card
  const { data: card, error: fetchErr } = await supabase
    .from("flashcards")
    .select("*")
    .eq("id", parsed.data.card_id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  // SM-2 Algorithm
  let { interval_days, ease } = card;
  const rating = parsed.data.rating;

  if (rating === "Again") {
    interval_days = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    if (interval_days === 1) interval_days = 3;
    else if (interval_days === 3) interval_days = 7;
    else interval_days = Math.round(interval_days * ease);

    if (rating === "Hard") ease = Math.max(1.3, ease - 0.15);
    else if (rating === "Good") ease = ease;
    else if (rating === "Easy") ease = ease + 0.15;

    ease = Math.max(1.3, Math.min(2.5, ease));
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval_days);

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      interval_days,
      ease,
      next_review_at: nextReview.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.card_id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id: card.id,
    next_review_at: nextReview.toISOString(),
    interval_days,
    ease,
  });
}