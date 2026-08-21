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
    <Card className="p-6">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Now</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug text-foreground">{task.title}</h2>
      {task.estimated_minutes && (
        <p className="mt-1.5 text-xs text-muted">{task.estimated_minutes} min · one tiny step</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" onClick={onStuck}>
          Stuck
        </Button>
        <Button variant="subtle" onClick={onStill}>
          Still on it
        </Button>
        <Button variant="primary" onClick={onDone}>
          Done
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        Stay here — other tasks are quietly below.
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
    <div className="mt-4">
      <p className="text-xs font-medium text-muted px-1 mb-2">Up next — tap to focus</p>
      <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick?.(t.id)}
            className="w-full text-left rounded-card border border-border bg-surface px-4 py-3 hover:bg-background transition-colors"
          >
            <p className="text-sm text-foreground line-clamp-1">{t.title}</p>
            {t.estimated_minutes && <p className="text-xs text-muted mt-0.5">{t.estimated_minutes} min</p>}
          </button>
        ))}
        {tasks.length === 0 && <p className="text-xs text-muted px-1">Nothing queued — you are clear.</p>}
      </div>
    </div>
  );
}
