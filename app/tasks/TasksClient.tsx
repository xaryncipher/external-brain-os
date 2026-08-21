"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TaskRow } from "@/lib/tasks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function TasksClient({
  userId,
  initialToday,
  initialBacklog,
}: {
  userId: string;
  initialToday: TaskRow[];
  initialBacklog: TaskRow[];
}) {
  const [today, setToday] = useState<TaskRow[]>(initialToday);
  const [backlog, setBacklog] = useState<TaskRow[]>(initialBacklog);
  const [newTitle, setNewTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, { steps: { title: string; estimated_minutes: number }[]; loading: boolean }>>({});
  const [subtasks, setSubtasks] = useState<Record<string, TaskRow[]>>({});
  const supabase = createClient();

  // Load existing subtasks for initial parents (so they don't vanish after reload)
  useEffect(() => {
    const parentIds = [...today, ...backlog].map((t) => t.id);
    if (parentIds.length === 0) return;
    supabase
      .from("tasks")
      .select("*")
      .in("parent_task_id", parentIds)
      .order("step_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) return;
        const map: Record<string, TaskRow[]> = {};
        (data as TaskRow[]).forEach((row) => {
          const pid = row.parent_task_id!;
          if (!map[pid]) map[pid] = [];
          map[pid].push(row);
        });
        setSubtasks(map);
      });
  }, []); // only on mount — parents from initial props

  async function refreshSubtasks(parentId: string) {
    const { data } = await supabase.from("tasks").select("*").eq("parent_task_id", parentId).order("step_order");
    if (data) setSubtasks((prev) => ({ ...prev, [parentId]: data as TaskRow[] }));
  }

  async function breakDown(task: TaskRow) {
    setBreakdown((prev) => ({ ...prev, [task.id]: { steps: [], loading: true } }));
    try {
      const res = await fetch("/api/breakdown-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.id, title: task.title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Couldn't break down — try again?");
        setBreakdown((prev) => ({ ...prev, [task.id]: { steps: [], loading: false } }));
        return;
      }
      setBreakdown((prev) => ({ ...prev, [task.id]: { steps: data.steps, loading: false } }));
    } catch {
      setMsg("Couldn't break down — try again?");
      setBreakdown((prev) => ({ ...prev, [task.id]: { steps: [], loading: false } }));
    }
  }

  async function addSteps(task: TaskRow) {
    const entry = breakdown[task.id];
    if (!entry || entry.steps.length === 0) return;
    const inserts = entry.steps.map((s, i) => ({
      user_id: userId,
      title: s.title,
      status: "todo" as const,
      is_today: task.is_today,
      parent_task_id: task.id,
      step_order: i,
      estimated_minutes: s.estimated_minutes,
    }));
    const { error } = await supabase.from("tasks").insert(inserts);
    if (error) { setMsg("Couldn't add steps"); return; }
    await refreshSubtasks(task.id);
    setMsg(`Added ${entry.steps.length} tiny steps — now shown inline under "${task.title}".`);
    setBreakdown((prev) => {
      const n = { ...prev };
      delete n[task.id];
      return n;
    });
    setTimeout(() => setMsg(null), 3000);
  }

  async function createTask() {
    if (!newTitle.trim()) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: userId, title: newTitle.trim().slice(0, 120), status: "todo", is_today: false })
      .select()
      .single();
    if (error) {
      setMsg("Couldn't create — try again?");
      return;
    }
    setBacklog((prev) => [data as TaskRow, ...prev]);
    setNewTitle("");
    setMsg("Added to backlog — move to Today when ready.");
    setTimeout(() => setMsg(null), 2500);
  }

  async function moveToToday(id: string) {
    const { error } = await supabase.from("tasks").update({ is_today: true }).eq("id", id).eq("user_id", userId);
    if (error) return alert("Couldn't move — try again?");
    const task = backlog.find((t) => t.id === id);
    if (!task) return;
    setBacklog((prev) => prev.filter((t) => t.id !== id));
    setToday((prev) => [{ ...task, is_today: true }, ...prev]);
  }

  async function moveToBacklog(id: string) {
    const { error } = await supabase.from("tasks").update({ is_today: false }).eq("id", id).eq("user_id", userId);
    if (error) return alert("Couldn't move — try again?");
    const task = today.find((t) => t.id === id);
    if (!task) return;
    setToday((prev) => prev.filter((t) => t.id !== id));
    setBacklog((prev) => [{ ...task, is_today: false }, ...prev]);
  }

  async function markDone(id: string, list: "today" | "backlog") {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return alert("Couldn't mark done");
    if (list === "today") setToday((prev) => prev.filter((t) => t.id !== id));
    else setBacklog((prev) => prev.filter((t) => t.id !== id));
  }

  async function removeTask(id: string) {
    const hasSubs = (subtasks[id]?.length ?? 0) > 0;
    if (!confirm(hasSubs ? `Delete this task and its ${subtasks[id].length} subtasks?` : "Delete this task?")) return;
    // Delete subtasks first (covers old DB without CASCADE), then parent — auto-delete with CASCADE after migration too
    const { error: subErr } = await supabase.from("tasks").delete().eq("parent_task_id", id).eq("user_id", userId);
    if (subErr) {
      setMsg(`Couldn't delete subtasks: ${subErr.message}`);
      return;
    }
    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      setMsg(`Couldn't delete: ${error.message}`);
      return;
    }
    setToday((prev) => prev.filter((t) => t.id !== id));
    setBacklog((prev) => prev.filter((t) => t.id !== id));
    setSubtasks((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    // Also remove from subtasks lists where this task was itself a subtask (rare)
    setSubtasks((prev) => {
      const n: Record<string, TaskRow[]> = {};
      for (const [pid, list] of Object.entries(prev)) {
        n[pid] = list.filter((s) => s.id !== id);
      }
      return n;
    });
  }

  const Row = ({ task, onPrimary, primaryLabel }: { task: TaskRow; onPrimary: () => void; primaryLabel: string }) => {
    const bd = breakdown[task.id];
    const subs = subtasks[task.id] ?? [];
    return (
      <div className="rounded-card border border-border bg-surface px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-medium text-foreground flex-1 min-w-0">{task.title}</p>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button onClick={() => breakDown(task)} disabled={!!bd?.loading} className="text-xs rounded-button border border-border px-3 py-1.5 hover:bg-accent-soft disabled:opacity-50">
              {bd?.loading ? (
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Breaking…</span>
              ) : subs.length ? "Re-break" : "Break down"}
            </button>
            <Button variant="outline" onClick={onPrimary} className="text-xs px-3 py-1.5">
              {primaryLabel}
            </Button>
            <button onClick={() => markDone(task.id, today.some((t) => t.id === task.id) ? "today" : "backlog")} className="rounded-button border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-white">
              Done
            </button>
            <button onClick={() => removeTask(task.id)} className="text-xs text-muted hover:text-foreground px-2">
              Delete
            </button>
          </div>
        </div>
        {bd?.loading && (
          <div className="mt-3 rounded-card border border-border bg-surface p-4 space-y-2 animate-pulse">
            <div className="h-3 w-1/3 rounded bg-border" />
            <div className="h-8 w-full rounded-button bg-border" />
            <div className="h-8 w-full rounded-button bg-border/70" />
            <div className="h-3 w-2/5 rounded bg-border/60" />
          </div>
        )}
        {bd && bd.steps.length > 0 && !bd.loading && (
          <div className="mt-3 rounded-card border border-accent-muted bg-accent-soft p-3">
            <p className="text-xs font-semibold text-accent-dark">Tiny steps — confirm to add as subtasks</p>
            <div className="mt-2 space-y-1.5">
              {bd.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-surface rounded-button px-3 py-2 border border-border">
                  <span className="text-foreground flex-1">{s.title}</span>
                  <span className="text-xs text-muted">{s.estimated_minutes}m</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={() => addSteps(task)} className="text-xs">Add {bd.steps.length} steps</Button>
              <Button variant="outline" onClick={() => setBreakdown((p)=>{ const n={...p}; delete n[task.id]; return n; })} className="text-xs">Dismiss</Button>
            </div>
          </div>
        )}
        {subs.length > 0 && (
          <div className="mt-3 border-t border-border/60 pt-3 space-y-2">
            <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Steps under this task — {subs.filter((s) => s.status !== "done").length} left</p>
            {subs.map((s) => (
              <div key={s.id} className={`flex items-center gap-2 rounded-button border px-3 py-2 text-sm ${s.status === "done" ? "bg-accent-soft border-accent-muted opacity-60 line-through" : "bg-background border-border"}`}>
                <span className="flex-1 text-foreground">{s.title}</span>
                <span className="text-xs text-muted">{s.estimated_minutes ?? 5}m</span>
                {s.status !== "done" && (
                  <button
                    onClick={async () => {
                      await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", s.id);
                      setSubtasks((prev) => ({ ...prev, [task.id]: (prev[task.id] ?? []).map((x) => (x.id === s.id ? { ...x, status: "done" } : x)) }));
                    }}
                    className="rounded-button bg-accent px-2.5 py-1 text-xs text-white"
                  >
                    Done
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold tracking-tight">Add task</p>
        <div className="mt-3 flex gap-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTask()}
            placeholder="e.g. Open resume file"
            className="flex-1 rounded-card border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
          <Button variant="primary" onClick={createTask} className="px-6">
            Add
          </Button>
        </div>
        {msg && <p className="mt-2 text-xs text-accent-dark bg-accent-soft border border-accent-muted rounded-button px-3 py-2">{msg}</p>}
      </Card>

      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted px-1">Today — {today.length}</h2>
        <div className="mt-3 space-y-2.5">
          {today.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">No tasks for today</p>
              <p className="mt-1 text-xs text-muted">Move something from backlog when you have energy — no rush.</p>
            </Card>
          ) : (
            today.map((t) => <Row key={t.id} task={t} onPrimary={() => moveToBacklog(t.id)} primaryLabel="To backlog" />)
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted px-1">Backlog — {backlog.length}</h2>
        <div className="mt-3 space-y-2.5">
          {backlog.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">Backlog is quiet</p>
              <p className="mt-1 text-xs text-muted">Your brain dump will fill it — no need to force.</p>
            </Card>
          ) : (
            backlog.map((t) => <Row key={t.id} task={t} onPrimary={() => moveToToday(t.id)} primaryLabel="To today" />)
          )}
        </div>
      </div>
    </div>
  );
}
