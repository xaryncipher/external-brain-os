"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ExportClient({ userId, email }: { userId: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  async function handleExport() {
    setLoading(true);
    setMsg(null);
    try {
      const [tasksRes, habitsRes, logsRes, dumpsRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("habit_logs").select("*").eq("user_id", userId).order("completed_at"),
        supabase.from("brain_dumps").select("*").eq("user_id", userId).order("created_at"),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (habitsRes.error) throw habitsRes.error;

      const data = {
        exported_at: new Date().toISOString(),
        user: email,
        tasks: tasksRes.data ?? [],
        habits: habitsRes.data ?? [],
        habit_logs: logsRes.data ?? [],
        brain_dumps: dumpsRes.data ?? [],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `external-brain-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Exported ${data.tasks.length} tasks, ${data.habits.length} habits — downloaded.`);
    } catch (e: any) {
      setMsg(`Couldn't export: ${e?.message ?? "try again?"}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold tracking-tight">Export your data</h2>
      <p className="text-xs text-muted mt-1">Download all tasks, habits, logs as JSON. Private — stays in your browser until you save it.</p>
      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={handleExport} disabled={loading} className="px-6">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
              Exporting…
            </span>
          ) : (
            "Download JSON"
          )}
        </Button>
        <span className="text-xs text-muted">No server upload — just your download.</span>
      </div>
      {msg && <p className="mt-3 text-xs rounded-button bg-accent-soft border border-accent-muted px-3 py-2 text-accent-dark">{msg}</p>}
    </Card>
  );
}
