"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type ParseTask = { title: string };
type TriageItem = { title: string; type: "task"|"habit"|"goal"|"project"|"avoid"; bucket: "RIGHT NOW"|"TODAY"|"THIS WEEK"|"LATER"|"OPTIONAL"; reason: string };

export function BrainDump({ userId, onAdded }: { userId: string; onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [parsePreview, setParsePreview] = useState<ParseTask[] | null>(null);
  const [triagePreview, setTriagePreview] = useState<TriageItem[] | null>(null);
  const [triageChecks, setTriageChecks] = useState<boolean[]>([]);
  const [triageBuckets, setTriageBuckets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  function isBulk(input: string) {
    return input.length > 500 || input.split("\n").length > 10;
  }

  async function handleOrganize() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setParsePreview(null);
    setTriagePreview(null);

    const bulk = isBulk(text);
    const endpoint = bulk ? "/api/triage" : "/api/parse-dump";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't process that — try again?");
        return;
      }
      if (bulk) {
        const items = (data.items as TriageItem[]).slice(0, 30);
        setTriagePreview(items);
        setTriageChecks(items.map(() => true));
        setTriageBuckets(items.map((it) => it.bucket));
      } else {
        setParsePreview((data.tasks as ParseTask[]).slice(0, 15));
      }
      // log brain dump for debugging (optional, ignore error)
      try { await supabase.from("brain_dumps").insert({ user_id: userId, raw_text: text.slice(0, 5000), parsed_json: data }); } catch {}
    } catch {
      setError("Couldn't process that — try again?");
    } finally {
      setLoading(false);
    }
  }

  async function confirmParse(toToday: boolean) {
    if (!parsePreview) return;
    const checked = parsePreview.filter((_, i) => {
      const el = document.querySelector(`#parse-check-${i}`) as HTMLInputElement | null;
      return el ? el.checked : true;
    });
    if (checked.length === 0) return;
    const inserts = checked.map((t, i) => ({ user_id: userId, title: t.title.slice(0,120), status: "todo" as const, is_today: toToday, step_order: i }));
    const { error } = await supabase.from("tasks").insert(inserts);
    if (error) { setError("Couldn't save — try again?"); return; }
    setSuccess(`${checked.length} task${checked.length>1?"s":""} added to ${toToday?"Today":"backlog"}.`);
    setText("");
    setParsePreview(null);
    onAdded?.();
    setTimeout(() => setSuccess(null), 3000);
  }

  async function confirmTriage() {
    if (!triagePreview) return;
    const selected = triagePreview.filter((_, i) => triageChecks[i]);
    if (selected.length === 0) return;
    let taskInserts: any[] = [];
    let habitTitles: string[] = [];
    selected.forEach((it, idx) => {
      const bucket = triageBuckets[idx] as TriageItem["bucket"];
      if (it.type === "habit") habitTitles.push(it.title);
      else if (it.type === "avoid") return; // skip avoid
      else {
        const isToday = bucket === "RIGHT NOW" || bucket === "TODAY";
        // project/goal become task too for now
        taskInserts.push({ user_id: userId, title: it.title.slice(0,120), status: "todo" as const, is_today: isToday, domain: bucket === "RIGHT NOW" ? "Right Now" : null, step_order: taskInserts.length });
      }
    });
    if (habitTitles.length) {
      const { error } = await supabase.from("habits").insert(habitTitles.map(t => ({ user_id: userId, title: t.slice(0,80) })));
      if (error) { setError("Couldn't save habits — try again?"); return; }
    }
    if (taskInserts.length) {
      const { error } = await supabase.from("tasks").insert(taskInserts);
      if (error) { setError("Couldn't save tasks — try again?"); return; }
    }
    setSuccess(`${selected.length} items triaged — ${taskInserts.length} tasks, ${habitTitles.length} habits. Check Tasks/Habits.`);
    setText("");
    setTriagePreview(null);
    onAdded?.();
    setTimeout(() => setSuccess(null), 3500);
  }

  return (
    <Card className="p-5">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <span className="text-sm font-semibold tracking-tight text-foreground">Brain dump</span>
        <span className="text-xs font-medium text-muted border border-border rounded-button px-3 py-1.5 bg-background hover:bg-accent-soft hover:text-accent-dark">
          {open ? "Hide" : "Add messy thoughts"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Paste messy thoughts — e.g. call dentist, mom's bday gift, report due friday — or paste 100 items for AI triage"
            className="w-full rounded-card border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleOrganize} disabled={loading || !text.trim()} className="px-6">
              {loading ? "Looking…" : isBulk(text) ? "Triage with AI" : "Organize with AI"}
            </Button>
            <Button variant="outline" onClick={() => { setText(""); setParsePreview(null); setTriagePreview(null); setError(null); }}>
              Clear
            </Button>
          </div>

          {error && <div className="rounded-button border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">{error}</div>}
          {success && <div className="rounded-button border border-accent-muted bg-accent-soft px-3 py-2 text-sm text-accent-dark">{success}</div>}

          {parsePreview && (
            <div className="rounded-card border border-accent-muted bg-accent-soft p-4">
              <p className="text-xs font-semibold text-accent-dark mb-3">AI parsed — uncheck to skip</p>
              <div className="space-y-2">
                {parsePreview.map((p, i) => (
                  <label key={i} className="flex items-center gap-3 text-sm bg-surface rounded-button px-4 py-3 border border-border">
                    <input id={`parse-check-${i}`} type="checkbox" defaultChecked className="accent-accent" />
                    <span className="text-foreground">{p.title}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="primary" onClick={() => confirmParse(false)}>Add to backlog</Button>
                <Button variant="subtle" onClick={() => confirmParse(true)}>Add to today</Button>
                <Button variant="outline" onClick={() => setParsePreview(null)}>Dismiss</Button>
              </div>
            </div>
          )}

          {triagePreview && (
            <div className="rounded-card border border-accent-muted bg-accent-soft p-4">
              <p className="text-xs font-semibold text-accent-dark mb-3">AI triaged {triagePreview.length} items — edit buckets, uncheck to skip</p>
              <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                {triagePreview.map((it, i) => (
                  <div key={i} className="bg-surface rounded-card border border-border p-3 flex flex-col gap-2">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={triageChecks[i]} onChange={(e) => setTriageChecks((prev) => { const n=[...prev]; n[i]=e.target.checked; return n; })} className="mt-1 accent-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{it.title}</p>
                        <p className="text-xs text-muted mt-0.5">{it.reason}</p>
                      </div>
                    </label>
                    <div className="flex gap-2 text-xs pl-6">
                      <span className={`rounded-button px-2 py-1 border text-[11px] ${it.type==="habit"?"bg-accent-soft border-accent-muted text-accent-dark":"bg-background border-border text-muted"}`}>{it.type}</span>
                      <select value={triageBuckets[i]} onChange={(e) => setTriageBuckets((prev) => { const n=[...prev]; n[i]=e.target.value; return n; })} className="rounded-button border border-border bg-background px-2 py-1 text-xs flex-1">
                        <option>RIGHT NOW</option><option>TODAY</option><option>THIS WEEK</option><option>LATER</option><option>OPTIONAL</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="primary" onClick={confirmTriage}>Confirm & add</Button>
                <Button variant="outline" onClick={() => setTriagePreview(null)}>Dismiss</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
