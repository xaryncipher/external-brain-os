"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function StudyCard({ deck }: { deck: string }) {
  const [card, setCard] = useState<{
    id: string;
    front: string;
    back: string;
    interval_days: number;
    ease: number;
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDueCard();
  }, [deck]);

  async function fetchDueCard() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck", deck)
      .lte("next_review_at", new Date().toISOString())
      .order("next_review_at", { ascending: true })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error(error);
    }
    setCard((data ?? null) as any);
    setLoading(false);
  }

  async function handleReview(rating: "Again" | "Hard" | "Good" | "Easy") {
    if (!card) return;
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: card.id, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(`Rated ${rating} — next in ${data.interval_days}d`);
      setShowAnswer(false);
      fetchDueCard();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-3/4 rounded bg-border" />
          <div className="h-16 w-full rounded-button bg-border" />
          <div className="h-10 w-full rounded-button bg-border/70" />
        </div>
      </Card>
    );
  }

  if (!card) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted">No cards due for this deck</p>
        <p className="mt-1 text-xs text-muted">All caught up! Add more cards or wait for next review.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.href = `/learn/${encodeURIComponent(deck)}/add`}>
          Add Card
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted">{card.interval_days}d · ease {card.ease.toFixed(1)}</span>
<Button variant="ghost" onClick={() => fetchDueCard()}>
        Skip
      </Button>
      </div>

      <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
        {!showAnswer ? (
          <>
            <p className="text-xl font-medium text-foreground mb-4">{card.front}</p>
            <Button variant="primary" className="w-full max-w-xs" onClick={() => setShowAnswer(true)}>
              Show Answer
            </Button>
          </>
        ) : (
          <>
            <p className="text-xl font-medium text-foreground mb-2">{card.front}</p>
            <div className="w-full mt-4 p-4 rounded-card border border-accent-muted bg-accent-soft text-left">
              <p className="text-foreground">{card.back}</p>
            </div>
            <p className="text-xs text-muted mt-2">Interval: {card.interval_days}d · Ease: {card.ease.toFixed(1)}</p>
            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              <Button variant="outline" onClick={() => handleReview("Again")} className="border-warning/30 text-warning hover:bg-warning/10">Again</Button>
              <Button variant="outline" onClick={() => handleReview("Hard")} className="border-border hover:bg-accent-soft">Hard</Button>
              <Button variant="primary" onClick={() => handleReview("Good")} className="bg-accent hover:bg-accent-hover">Good</Button>
              <Button variant="outline" onClick={() => handleReview("Easy")} className="bg-accent-soft border-accent-muted hover:bg-accent/20">Easy</Button>
            </div>
          </>
        )}
      </div>

      {msg && <p className="mt-4 text-xs text-accent-dark bg-accent-soft border border-accent-muted rounded-button px-3 py-2">{msg}</p>}
    </Card>
  );
}