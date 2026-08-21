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
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  function isBulk(input: string) {
    return input.length > 500 || input.split("\n").length > 10;
  }

  function chunkLines(input: string, size = 40): string[] {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= size) return [lines.join("\n")];
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size).join("\n"));
    }
    return chunks;
  }

  async function handleOrganize() {
    if (!text.trim()) return;
    setLoading(true);
    setLoadingMsg(null);
    setError(null);
    setSuccess(null);
    setParsePreview(null);
    setTriagePreview(null);
    setShowAll(false);

    const bulk = isBulk(text);
    const endpoint = bulk ? "/api/triage" : "/api/parse-dump";

    try {
      if (!bulk) {
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
        setParsePreview((data.tasks as ParseTask[]).slice(0, 30));
        try { await supabase.from("brain_dumps").insert({ user_id: userId, raw_text: text.slice(0, 5000), parsed_json: data }); } catch {}
      } else {
        // Chunked triage for 121+ items — Groq primary is fast (0.09s per 40), keeps under 30 RPM
        const chunks = chunkLines(text, 40);
        let merged: TriageItem[] = [];
        for (let idx = 0; idx < chunks.length; idx++) {
          setLoadingMsg(`AI triaging chunk ${idx + 1}/${chunks.length}… calm moment…`);
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ raw_text: chunks[idx] }),
          });
          const data = await res.json();
          if (!res.ok) {
            // If one chunk fails with 429, keep prior chunks and show partial with warning
            if (res.status === 429) {
              setError(`Groq busy on chunk ${idx + 1} — got ${merged.length} items so far. Try Confirm & add those, then re-paste remaining?`);
              break;
            }
            setError(data.error ?? "Couldn't process that — try again?");
            return;
          }
          const items = (data.items as TriageItem[]) ?? [];
          merged = merged.concat(items);
        }

        // Dedupe by normalized title
        const seen = new Set<string>();
        const deduped: TriageItem[] = [];
        for (const it of merged) {
          const key = it.title.toLowerCase().trim();
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(it);
        }

        // Global RIGHT NOW ≤3 guard (each chunk may have 3, merged may have 9)
        let kept = 0;
        const guarded = deduped.map((it) => {
          if (it.bucket === "RIGHT NOW" && kept >= 3) return { ...it, bucket: "TODAY" as const };
          if (it.bucket === "RIGHT NOW") kept++;
          return it;
        });

        // Cap total to 150 for UI sanity but allow 121
        const finalItems = guarded.slice(0, 150);
        setTriagePreview(finalItems);
        setTriageChecks(finalItems.map(() => true));
        setTriageBuckets(finalItems.map((it) => it.bucket));
        setLoadingMsg(null);
        try { await supabase.from("brain_dumps").insert({ user_id: userId, raw_text: text.slice(0, 8000), parsed_json: { items: finalItems } }); } catch {}
      }
    } catch {
      setError("Couldn't process that — try again?");
    } finally {
      setLoading(false);
      setLoadingMsg(null);
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
      const origIdx = triagePreview.findIndex((x, j) => triageChecks[j] && x.title === it.title && j === idx);
      // Use triageBuckets aligned to original preview index, not filtered selected idx
    });
    // Rebuild with correct bucket mapping
    const bucketsForSelected: string[] = [];
    const typesForSelected: string[] = [];
    triagePreview.forEach((it, i) => {
      if (!triageChecks[i]) return;
      bucketsForSelected.push(triageBuckets[i]);
      typesForSelected.push(it.type);
    });
    selected.forEach((it, sIdx) => {
      const bucket = bucketsForSelected[sIdx] as TriageItem["bucket"];
      const type = typesForSelected[sIdx];
      if (type === "habit") habitTitles.push(it.title);
      else if (type === "avoid") return;
      else {
        const isToday = bucket === "RIGHT NOW" || bucket === "TODAY";
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
    const avoidCount = selected.filter((_, i) => typesForSelected[i] === "avoid").length;
    setSuccess(`${selected.length} items triaged → ${taskInserts.length} tasks, ${habitTitles.length} habits${avoidCount?`, ${avoidCount} avoids skipped`: ""}. Check Tasks/Habits.`);
    setText("");
    setTriagePreview(null);
    onAdded?.();
    setTimeout(() => setSuccess(null), 4000);
  }

  // Staged split for calm view
  const staged = triagePreview ? (() => {
    const visible: { item: TriageItem; idx: number }[] = [];
    const hidden: { item: TriageItem; idx: number }[] = [];
    triagePreview.forEach((it, idx) => {
      const bucket = triageBuckets[idx] as TriageItem["bucket"];
      if (bucket === "RIGHT NOW" || bucket === "TODAY") visible.push({ item: it, idx });
      else hidden.push({ item: it, idx });
    });
    return { visible, hidden };
  })() : null;

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
            placeholder="Paste messy thoughts — e.g. call dentist, mom's bday gift, report due friday — or paste 100+ items for AI triage"
            className="w-full rounded-card border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex gap-3 items-center">
            <Button variant="primary" onClick={handleOrganize} disabled={loading || !text.trim()} className="px-6">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/90 animate-pulse" />
                  {loadingMsg ?? "Looking…"}
                </span>
              ) : isBulk(text) ? `Triage with AI${text.split("\n").filter(Boolean).length>40?` (${Math.ceil(text.split("\n").filter(Boolean).length/40)} chunks)`:""}` : "Organize with AI"}
            </Button>
            <Button variant="outline" onClick={() => { setText(""); setParsePreview(null); setTriagePreview(null); setError(null); }}>
              Clear
            </Button>
            {loading && <span className="text-xs text-muted animate-pulse">{loadingMsg ?? "AI thinking — calm moment…"}</span>}
          </div>

          {loading && (
            <div className="rounded-card border border-border bg-surface p-4 space-y-2 animate-pulse">
              <div className="h-3 w-3/4 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border" />
              <div className="h-3 w-2/3 rounded bg-border/70" />
            </div>
          )}

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

          {triagePreview && staged && (
            <div className="rounded-card border border-accent-muted bg-accent-soft p-4">
              <p className="text-xs font-semibold text-accent-dark">AI triaged {triagePreview.length} items — {staged.visible.length} for now, {staged.hidden.length} later</p>
              <p className="text-xs text-muted mt-1">Edit buckets, uncheck to skip. Only “RIGHT NOW” (≤3) + “TODAY” shown expanded — rest collapsed to reduce overwhelm.</p>

              <div className="mt-3 space-y-2 max-h-[260px] overflow-auto pr-1">
                {staged.visible.map(({ item, idx }) => (
                  <div key={idx} className="bg-surface rounded-card border border-border p-3 flex flex-col gap-2">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={triageChecks[idx]} onChange={(e) => setTriageChecks((prev) => { const n=[...prev]; n[idx]=e.target.checked; return n; })} className="mt-1 accent-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                        <p className="text-xs text-muted mt-0.5">{item.reason}</p>
                      </div>
                    </label>
                    <div className="flex gap-2 text-xs pl-6">
                      <span className={`rounded-button px-2 py-1 border text-[11px] ${triageBuckets[idx]==="habit"||item.type==="habit"?"bg-accent-soft border-accent-muted text-accent-dark":"bg-background border-border text-muted"}`}>{item.type}</span>
                      <select value={triageBuckets[idx]} onChange={(e) => setTriageBuckets((prev) => { const n=[...prev]; n[idx]=e.target.value; return n; })} className="rounded-button border border-border bg-background px-2 py-1 text-xs flex-1">
                        <option>RIGHT NOW</option><option>TODAY</option><option>THIS WEEK</option><option>LATER</option><option>OPTIONAL</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {staged.hidden.length > 0 && (
                <div className="mt-3">
                  <button onClick={() => setShowAll((v) => !v)} className="w-full rounded-button border border-border bg-surface px-3 py-2 text-xs text-muted hover:bg-background">
                    {showAll ? `Hide ${staged.hidden.length} later items ▲` : `Show ${staged.hidden.length} later items (THIS WEEK/LATER/OPTIONAL) ▼`}
                  </button>
                  {showAll && (
                    <div className="mt-2 space-y-2 max-h-[220px] overflow-auto pr-1 border-t border-border/60 pt-3">
                      {staged.hidden.map(({ item, idx }) => (
                        <div key={idx} className="bg-surface rounded-card border border-border p-3 flex flex-col gap-2 opacity-90">
                          <label className="flex items-start gap-2">
                            <input type="checkbox" checked={triageChecks[idx]} onChange={(e) => setTriageChecks((prev) => { const n=[...prev]; n[idx]=e.target.checked; return n; })} className="mt-1 accent-accent" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                              <p className="text-xs text-muted mt-0.5">{item.reason}</p>
                            </div>
                          </label>
                          <div className="flex gap-2 text-xs pl-6">
                            <span className="rounded-button px-2 py-1 border text-[11px] bg-background border-border text-muted">{item.type}</span>
                            <select value={triageBuckets[idx]} onChange={(e) => setTriageBuckets((prev) => { const n=[...prev]; n[idx]=e.target.value; return n; })} className="rounded-button border border-border bg-background px-2 py-1 text-xs flex-1">
                              <option>RIGHT NOW</option><option>TODAY</option><option>THIS WEEK</option><option>LATER</option><option>OPTIONAL</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Button variant="primary" onClick={confirmTriage}>Confirm & add {triagePreview.filter((_,i)=>triageChecks[i]).length} items</Button>
                <Button variant="outline" onClick={() => setTriagePreview(null)}>Dismiss</Button>
              </div>
              <p className="text-xs text-muted mt-2">Tip: Uncheck “avoid” items like “No Instagram” if you don’t want them saved — they’re shown to help you see what to avoid.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
