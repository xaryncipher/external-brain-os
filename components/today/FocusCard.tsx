"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export type MockTask = {
  id: string;
  title: string;
  estimated_minutes?: number;
  is_today: boolean;
};

export function FocusCard({
  task,
  onStuck,
  onStill,
  onDone,
  onSwap,
}: {
  task: MockTask | null;
  onStuck?: () => void;
  onStill?: () => void;
  onDone?: () => void;
  onSwap?: (id: string) => void;
}) {
  if (!task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted">No tasks for today</p>
        <p className="mt-1 text-lg font-medium text-foreground">Take a breath — or add one above.</p>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium tracking-widest text-accent-muted uppercase">Now — one thing</p>
          <h2 className="mt-2.5 text-[22px] font-semibold leading-snug tracking-tight text-foreground">{task.title}</h2>
          {task.estimated_minutes && (
            <p className="mt-2 text-xs text-muted">{task.estimated_minutes} min · one tiny step</p>
          )}
        </div>
        <span className="hidden sm:inline-flex h-2 w-2 rounded-full bg-accent animate-pulse mt-2" />
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onStuck} className="min-w-[84px]">
          Stuck
        </Button>
        <Button variant="subtle" onClick={onStill} className="min-w-[108px]">
          Still on it
        </Button>
        <Button variant="primary" onClick={onDone} className="min-w-[84px]">
          Done
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted border-t border-border/60 pt-4">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Stay here — other tasks sit quietly below.
      </div>
    </Card>
  );
}

export function UpNext({
  tasks,
  onPick,
}: {
  tasks: MockTask[];
  onPick?: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-[11px] font-medium tracking-wide text-muted px-1 mb-3 uppercase">Up next — tap to focus</p>
      <div className="space-y-2.5 max-h-[240px] overflow-auto pr-1">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick?.(t.id)}
            className="w-full text-left rounded-card border border-border bg-surface px-5 py-3.5 hover:bg-accent-soft hover:border-accent-muted transition-colors text-left"
          >
            <p className="text-sm font-medium text-foreground line-clamp-1">{t.title}</p>
            {t.estimated_minutes && <p className="text-xs text-muted mt-1">{t.estimated_minutes} min</p>}
          </button>
        ))}
        {tasks.length === 0 && <p className="text-xs text-muted px-1">Nothing queued — you are clear.</p>}
      </div>
    </div>
  );
}
