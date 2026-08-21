"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Habit = { id: string; title: string; todayCount: number };

export function HabitsClient({ userId, initial }: { userId: string; initial: Habit[] }) {
  const [habits, setHabits] = useState<Habit[]>(initial);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  async function createHabit() {
    if (!title.trim()) return;
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, title: title.trim().slice(0, 80) })
      .select()
      .single();
    if (error) {
      setMsg("Couldn't create habit");
      return;
    }
    setHabits((prev) => [...prev, { id: (data as any).id, title: (data as any).title, todayCount: 0 }]);
    setTitle("");
  }

  async function logHabit(id: string) {
    const { error } = await supabase.from("habit_logs").insert({ habit_id: id, user_id: userId });
    if (error) {
      setMsg("Couldn't log");
      return;
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, todayCount: h.todayCount + 1 } : h)));
  }

  async function deleteHabit(id: string) {
    if (!confirm("Delete habit? Logs stay but habit removed.")) return;
    const { error } = await supabase.from("habits").delete().eq("id", id).eq("user_id", userId);
    if (error) return alert("Couldn't delete");
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold tracking-tight">Add habit</p>
        <p className="text-xs text-muted mt-1">Minimal — counts today gently, no streak shame.</p>
        <div className="mt-3 flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createHabit()}
            placeholder="e.g. Drink water"
            className="flex-1 rounded-card border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
          <Button variant="primary" onClick={createHabit} className="px-6">
            Add
          </Button>
        </div>
        {msg && <p className="text-xs text-muted mt-2">{msg}</p>}
      </Card>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted">No habits yet — add one above.</Card>
        ) : (
          habits.map((h) => (
            <Card key={h.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="text-xs text-muted mt-0.5">{h.todayCount} today · gentle momentum</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => logHabit(h.id)} className="px-4 py-2 text-xs">
                  Log
                </Button>
                <button onClick={() => deleteHabit(h.id)} className="text-xs text-muted hover:text-foreground px-2">
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
