"use client";

import { useState } from "react";
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
  const supabase = createClient();

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
    setMsg(`Added ${entry.steps.length} tiny steps under "${task.title}".`);
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
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);
    if (error) return alert("Couldn't delete");
    setToday((prev) => prev.filter((t) => t.id !== id));
    setBacklog((prev) => prev.filter((t) => t.id !== id));
  }

  const Row = ({ task, onPrimary, primaryLabel }: { task: TaskRow; onPrimary: () => void; primaryLabel: string }) => {
    const bd = breakdown[task.id];
    return (
      <div className="rounded-card border border-border bg-surface px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground flex-1 min-w-0">{task.title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => breakDown(task)} disabled={!!bd?.loading} className="text-xs rounded-button border border-border px-3 py-1.5 hover:bg-accent-soft disabled:opacity-50">
              {bd?.loading ? "…" : "Break down"}
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
        {bd && bd.steps.length > 0 && (
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
            <Card className="p-6 text-center text-sm text-muted">No tasks for today — move from backlog.</Card>
          ) : (
            today.map((t) => <Row key={t.id} task={t} onPrimary={() => moveToBacklog(t.id)} primaryLabel="To backlog" />)
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted px-1">Backlog — {backlog.length}</h2>
        <div className="mt-3 space-y-2.5">
          {backlog.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted">Backlog empty — brain dump will fill it.</Card>
          ) : (
            backlog.map((t) => <Row key={t.id} task={t} onPrimary={() => moveToToday(t.id)} primaryLabel="To today" />)
          )}
        </div>
      </div>
    </div>
  );
}
