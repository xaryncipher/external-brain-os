"use client";

import { useState } from "react";
import { BrainDump } from "@/components/today/BrainDump";
import { FocusCard, UpNext } from "@/components/today/FocusCard";
import { RescueOverlay } from "@/components/today/RescueOverlay";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { TaskRow } from "@/lib/tasks";

type HabitWithCount = {
  id: string;
  title: string;
  todayCount: number;
};

const RESCUE_STEPS = ["Put your feet on the floor.", "Stand up.", "Walk to the bathroom.", "Turn on the light."];

export function TodayClient({
  email,
  userId,
  initialTasks,
  initialHabits,
  initialDoneCount,
}: {
  email: string;
  userId: string;
  initialTasks: TaskRow[];
  initialHabits: HabitWithCount[];
  initialDoneCount: number;
}) {
  const [today, setToday] = useState<TaskRow[]>(initialTasks);
  const [habits, setHabits] = useState<HabitWithCount[]>(initialHabits);
  const [doneCount, setDoneCount] = useState(initialDoneCount);
  const [focusId, setFocusId] = useState<string>(initialTasks[0]?.id ?? "");
  const [rescueOpen, setRescueOpen] = useState(false);
  const [rescueIdx, setRescueIdx] = useState(0);
  const [habitMsg, setHabitMsg] = useState<string | null>(null);
  const [urgeMsg, setUrgeMsg] = useState<string | null>(null);
  const [urgeLoading, setUrgeLoading] = useState(false);
  const supabase = createClient();

  const focus = today.find((t) => t.id === focusId) ?? today[0] ?? null;
  const upNext = today.filter((t) => t.id !== focus?.id);

  async function handleDone() {
    if (!focus) return;
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", focus.id)
      .eq("user_id", userId);
    if (error) {
      alert("Couldn't mark done — try again?");
      return;
    }
    setDoneCount((c) => c + 1);
    const next = upNext[0];
    setToday((prev) => prev.filter((t) => t.id !== focus.id));
    if (next) setFocusId(next.id);
  }

  async function handleStill() {
    if (!focus || focus.status === "in_progress") return;
    await supabase.from("tasks").update({ status: "in_progress" }).eq("id", focus.id).eq("user_id", userId);
    setToday((prev) => prev.map((t) => (t.id === focus.id ? { ...t, status: "in_progress" } : t)));
  }

  async function handleLogHabit(habitId: string) {
    const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: userId });
    if (error) {
      setHabitMsg("Couldn't log — try again?");
      return;
    }
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, todayCount: h.todayCount + 1 } : h)));
    setHabitMsg("Logged — gentle momentum.");
    setTimeout(() => setHabitMsg(null), 2000);
  }

  async function handleUrge() {
    if (urgeLoading) return;
    setUrgeLoading(true);
    setUrgeMsg(null);
    try {
      const res = await fetch("/api/cope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trigger: "general urge" }) });
      const data = await res.json().catch(() => ({}));
      const step = (data as any).step ?? "Stand, drink water, breathe 4-4-4 for 30s, then choose your next tiny step.";
      setUrgeMsg(step);
      // lightweight log — ignore error, still shows step
      supabase.from("tasks").insert({ user_id: userId, title: `Had urge — ${step.slice(0,60)}`, status: "done" as const, is_today: false, domain: "Digital Behavior", completed_at: new Date().toISOString() }).then(()=>{});
    } catch {
      setUrgeMsg("60-sec step: Stand, drink water, breathe 4-4-4, then decide. No shame — you logged it.");
    } finally {
      setUrgeLoading(false);
      setTimeout(() => setUrgeMsg(null), 6000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs text-muted">Signed in as {email}</p>
          <p className="text-sm text-foreground mt-1">
            <span className="font-medium">{doneCount} done today</span>
            <span className="text-muted"> · no streak shame</span>
          </p>
        </div>
        <button
          onClick={() => setRescueOpen(true)}
          className="text-xs rounded-button border border-warning/30 bg-warning/10 px-4 py-2 text-foreground hover:bg-warning/15"
        >
          I’m stuck
        </button>
      </div>

      <BrainDump
        userId={userId}
        onAdded={async () => {
          const { data } = await supabase.from("tasks").select("*").eq("user_id", userId).eq("is_today", true).neq("status", "done").is("parent_task_id", null).order("created_at", { ascending: true });
          if (data) setToday(data as TaskRow[]);
          const { data: habitsData } = await supabase.from("habits").select("*").eq("user_id", userId);
          if (habitsData) {
            const todayStart = new Date(); todayStart.setHours(0,0,0,0);
            const { data: logs } = await supabase.from("habit_logs").select("*").eq("user_id", userId).gte("completed_at", todayStart.toISOString());
            const map = new Map<string, number>();
            (logs??[]).forEach((l:any)=> map.set(l.habit_id, (map.get(l.habit_id)??0)+1));
            setHabits(habitsData.map((h:any)=> ({...h, todayCount: map.get(h.id)??0 })));
          }
          const todayStart = new Date(); todayStart.setHours(0,0,0,0);
          const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "done").gte("completed_at", todayStart.toISOString());
          setDoneCount(count ?? 0);
        }}
      />

      {/* Focus + UpNext or empty — calm inviting, not blank */}
      {today.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-accent-soft border border-accent-muted flex items-center justify-center text-accent-dark">○</div>
          <p className="mt-3 text-sm text-muted">No tasks for today</p>
          <p className="mt-1 text-[15px] font-medium text-foreground">You are clear — a calm start.</p>
          <p className="mt-1 text-xs text-muted">Add one messy thought above, or pick from backlog when ready.</p>
          <a href="/tasks" className="mt-4 inline-block rounded-button bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover">
            Go to Tasks →
          </a>
        </Card>
      ) : (
        <>
          <FocusCard task={focus ? { id: focus.id, title: focus.title, estimated_minutes: focus.estimated_minutes ?? undefined, is_today: focus.is_today } : null} onStuck={() => setRescueOpen(true)} onStill={handleStill} onDone={handleDone} />
          <UpNext tasks={upNext.map((t) => ({ id: t.id, title: t.title, estimated_minutes: t.estimated_minutes ?? undefined, is_today: t.is_today }))} onPick={setFocusId} />
        </>
      )}

      {/* Habits real */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm font-medium text-foreground">No habits yet</p>
            <p className="text-xs text-muted mt-1">Create one in Habits — e.g. Drink water.</p>
          </Card>
        ) : (
          habits.map((h) => (
            <Card key={h.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {h.todayCount} today · gentle momentum
                </p>
              </div>
              <button onClick={() => handleLogHabit(h.id)} className="rounded-button bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover">
                Log
              </button>
            </Card>
          ))
        )}
        {habitMsg && <p className="text-xs text-accent-dark bg-accent-soft border border-accent-muted rounded-button px-3 py-2">{habitMsg}</p>}
      </div>

      {/* Urge */}
      <Card className="p-5 flex items-center justify-between border-warning/20">
        <div>
          <p className="text-sm font-medium text-foreground">Had an urge?</p>
          <p className="text-xs text-muted mt-0.5">Log calmly — 60-sec step, no shame.</p>
          {urgeMsg && <p className="text-xs text-foreground mt-2 bg-warning/10 border border-warning/20 rounded-button px-3 py-2">{urgeMsg}</p>}
        </div>
        <button onClick={handleUrge} disabled={urgeLoading} className="rounded-button border border-border bg-surface px-4 py-2 text-xs hover:bg-accent-soft ml-4 shrink-0 disabled:opacity-60">
          {urgeLoading ? "Getting step…" : "Had urge"}
        </button>
      </Card>

      <RescueOverlay
        open={rescueOpen}
        step={RESCUE_STEPS[rescueIdx % RESCUE_STEPS.length]}
        onDone={() => {
          setRescueIdx((i) => i + 1);
          if (rescueIdx >= RESCUE_STEPS.length - 1) setRescueOpen(false);
        }}
        onSmaller={() => setRescueIdx((i) => i + 1)}
        onClose={() => setRescueOpen(false)}
      />
    </div>
  );
}
