"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AddFlashcard({ deck, onAdded }: { deck: string; onAdded?: () => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [deckName, setDeckName] = useState(deck);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: [{ deck: deckName.trim() || "General", front: front.trim(), back: back.trim() }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      setFront("");
      setBack("");
      setMsg(`Added to ${deckName || "General"} deck`);
      setTimeout(() => setMsg(null), 3000);
      onAdded?.();
    } catch (e: any) {
      setMsg(e.message ?? "Couldn't add — try again?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold tracking-tight">Add flashcard to <span className="text-accent">{deck}</span></h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted">Deck</label>
          <input
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Deck name (e.g. Biology, Spanish, etc.)"
            className="mt-1 w-full rounded-card border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Front (Question)</label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={2}
            placeholder="What is the chemical equation for photosynthesis?"
            className="mt-1 w-full rounded-card border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Back (Answer)</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={3}
            placeholder="6CO2 + 6H2O → C6H12O6 + 6O2"
            className="mt-1 w-full rounded-card border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={loading} className="px-6">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/90 animate-pulse" />
                Adding…
              </span>
            ) : (
              "Add Card"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => { setFront(""); setBack(""); }}>
            Clear
          </Button>
        </div>
        {msg && <p className="text-xs rounded-button px-3 py-2 border {msg.includes('Added') ? 'bg-accent-soft border-accent-muted text-accent-dark' : 'bg-warning/10 border-warning/20 text-foreground'}">{msg}</p>}
      </form>
    </Card>
  );
}