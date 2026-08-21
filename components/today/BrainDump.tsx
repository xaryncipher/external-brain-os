"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function BrainDump({
  onConfirm,
  disabled,
}: {
  onConfirm?: (items: { title: string }[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<{ title: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock parse — no AI in Phase 2, just splits lines so UI can be approved
  function mockParse(input: string) {
    const lines = input
      .split(/\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((s) => ({ title: s.charAt(0).toUpperCase() + s.slice(1).slice(0, 60) }));
    return lines.length ? lines : [{ title: "Review brain dump" }];
  }

  function handleParse() {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setPreview(mockParse(text));
      setLoading(false);
    }, 400);
  }

  return (
    <Card className="p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-foreground">Brain dump</span>
        <span className="text-xs text-muted border border-border rounded-button px-2 py-1 bg-background">
          {open ? "Hide" : "Add messy thoughts"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Paste messy thoughts — e.g. call dentist, mom's bday gift, report due friday"
            className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleParse} disabled={loading || !text.trim()}>
              {loading ? "Looking…" : "Organize"}
            </Button>
            <Button variant="outline" onClick={() => setText("")}>
              Clear
            </Button>
          </div>

          {preview && (
            <div className="rounded-card border border-accent/20 bg-accent/10 p-3">
              <p className="text-xs font-medium text-foreground mb-2">
                Preview — uncheck anything to skip (Phase 2 mock)
              </p>
              <div className="space-y-1.5">
                {preview.map((p, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm bg-surface rounded-button px-3 py-2 border border-border">
                    <input type="checkbox" defaultChecked className="accent-accent" />
                    <span className="text-foreground">{p.title}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" onClick={() => onConfirm?.(preview)} disabled={disabled}>
                  Add to backlog
                </Button>
                <Button variant="subtle" onClick={() => setPreview(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
