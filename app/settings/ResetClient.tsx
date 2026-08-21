"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ResetClient({ userId }: { userId: string }) {
  const [counts, setCounts] = useState<Record<string, number | string>>({});
  const [confirm, setConfirm] = useState("");
  const [exportChecked, setExportChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const tables = ["tasks", "habits", "habit_logs", "brain_dumps"];
      // V2 future tables — will return 0 if not exists, we catch
      const future = ["flashcards", "quizzes", "urges", "life_map_nodes"];
      const all = [...tables, ...future];
      const result: Record<string, number | string> = {};
      for (const t of all) {
        try {
          const { count, error } = await supabase.from(t).select("id", { count: "exact", head: true }).eq("user_id", userId);
          if (error) {
            // table not exists yet (42P01) → show 0 for V2
            if (String(error.message).includes("does not exist") || String((error as any).code) === "42P01") result[t] = 0;
            else result[t] = "?";
          } else result[t] = count ?? 0;
        } catch {
          result[t] = 0;
        }
      }
      setCounts(result);
    })();
  }, [userId]);

  async function handleReset() {
    if (confirm !== "RESET") {
      setMsg('Type RESET exactly to confirm.');
      return;
    }
    if (!exportChecked) {
      setMsg("Please tick 'I exported' or export first — your data can't be restored.");
      return;
    }
    if (!window.confirm("Final check — delete ALL your tasks, habits, logs, brain dumps and future V2 data? Keep login, wipe data only. This can't be undone.")) return;

    setLoading(true);
    setMsg(null);
    try {
      // Ordered deletes — FK-safe even without DB CASCADE
      // 1) habit_logs (child of habits)
      await supabase.from("habit_logs").delete().eq("user_id", userId);
      // 2) tasks subtasks first, then all tasks
      await supabase.from("tasks").delete().eq("user_id", userId).not("parent_task_id", "is", null);
      await supabase.from("tasks").delete().eq("user_id", userId);
      // 3) habits (logs already gone)
      await supabase.from("habits").delete().eq("user_id", userId);
      // 4) brain_dumps
      await supabase.from("brain_dumps").delete().eq("user_id", userId);
      // 5) V2 tables — try, ignore if not exists
      for (const t of ["flashcards", "quizzes", "urges", "life_map_nodes"]) {
        try { await supabase.from(t).delete().eq("user_id", userId); } catch {}
      }
      setMsg("Reset done — workspace is fresh. Reloading...");
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      setMsg(`Reset failed: ${e?.message ?? "try again"}`);
    } finally {
      setLoading(false);
    }
  }

  const total = (counts.tasks as number) ?? 0;

  return (
    <Card className="p-6 border-warning/20 bg-warning/5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Danger zone — Reset workspace</h2>
      <p className="text-xs text-muted mt-1">Deletes all your data, keeps login. Projects are tasks, so they’re deleted too with their steps. V2 tables (flashcards, quizzes, urges) also wiped if they exist.</p>

      <div className="mt-4 rounded-card border border-border bg-surface p-4 text-xs">
        <p className="font-medium text-foreground">What will be deleted for this user:</p>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Tasks (including projects + subtasks): <span className="text-foreground font-medium">{String(counts.tasks ?? "?")}</span></li>
          <li>Habits: <span className="text-foreground font-medium">{String(counts.habits ?? "?")}</span> — logs: {String(counts.habit_logs ?? "?")}</li>
          <li>Brain dumps: <span className="text-foreground font-medium">{String(counts.brain_dumps ?? "?")}</span></li>
          <li>V2 future (if any): flashcards {String(counts.flashcards ?? 0)}, quizzes {String(counts.quizzes ?? 0)}, urges {String(counts.urges ?? 0)}</li>
        </ul>
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={exportChecked} onChange={(e) => setExportChecked(e.target.checked)} />
          <span className="text-foreground">I exported JSON (or I don’t need it) — I know this can’t be restored</span>
        </label>

        <div className="flex items-center gap-3">
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type RESET"
            className="flex-1 rounded-card border border-border bg-background px-4 py-2.5 text-sm focus:border-warning focus:outline-none"
          />
          <Button variant="outline" onClick={handleReset} disabled={loading || confirm !== "RESET" || !exportChecked} className="px-6 bg-warning/10 border-warning/30 hover:bg-warning/15 disabled:opacity-50">
            {loading ? "Resetting…" : "Reset everything"}
          </Button>
        </div>

        {msg && <p className={`text-xs rounded-button px-3 py-2 border ${msg.includes("done") ? "bg-accent-soft border-accent-muted text-accent-dark" : "bg-warning/10 border-warning/20 text-foreground"}`}>{msg}</p>}

        <p className="text-xs text-muted">Keep login: you stay signed in, just data wiped. To delete account entirely, do Supabase → Authentication → Users → Delete user.</p>
      </div>
    </Card>
  );
}
