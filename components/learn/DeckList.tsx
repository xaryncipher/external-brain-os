"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function DeckList() {
  const [decks, setDecks] = useState<{ deck: string; count: number; due: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDecks() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("deck, next_review_at")
        .order("deck");
      if (error) return;
      const map = new Map<string, { count: number; due: number }>();
      (data ?? []).forEach((c) => {
        const m = map.get(c.deck) ?? { count: 0, due: 0 };
        m.count++;
        if (new Date(c.next_review_at) <= new Date()) m.due++;
        map.set(c.deck, m);
      });
      const arr = Array.from(map.entries()).map(([deck, v]) => ({ deck, count: v.count, due: v.due }));
      setDecks(arr);
      setLoading(false);
    }
    fetchDecks();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-1/3 rounded bg-border" />
          <div className="h-4 w-1/2 rounded bg-border" />
          <div className="h-4 w-1/3 rounded bg-border" />
        </div>
      </Card>
    );
  }

  if (decks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted">No decks yet</p>
        <p className="mt-1 text-xs text-muted">Create your first flashcard or import from Brain Dump</p>
        <Link href="/learn/add" className="mt-4 inline-block rounded-button bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Add Flashcard
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((d) => (
        <Link key={d.deck} href={`/learn/${encodeURIComponent(d.deck)}`}>
          <Card className="p-4 flex items-center justify-between hover:bg-background transition-colors group">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-button bg-accent-soft text-accent text-sm font-medium">📚</span>
              <div>
                <p className="text-sm font-medium text-foreground">{d.deck}</p>
                <p className="text-xs text-muted">{d.count} cards · {d.due} due</p>
              </div>
            </div>
            <span className="text-xs text-muted group-hover:text-foreground">→</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}