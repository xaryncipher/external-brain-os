"use client";

import { Button } from "@/components/ui/Button";

export function RescueOverlay({
  open,
  step,
  onDone,
  onSmaller,
  onClose,
}: {
  open: boolean;
  step: string;
  onDone?: () => void;
  onSmaller?: () => void;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lg">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Rescue — one tiny step</p>
        <p className="mt-3 text-xl font-semibold text-foreground leading-snug">{step}</p>
        <p className="mt-2 text-xs text-muted">No pressure — just this. You can ask for a smaller step.</p>

        <div className="mt-6 flex gap-2">
          <Button variant="primary" onClick={onDone} className="flex-1">
            Done
          </Button>
          <Button variant="outline" onClick={onSmaller} className="flex-1">
            Need smaller step
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-accent" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>

        <button onClick={onClose} className="mt-4 w-full text-xs text-muted hover:text-foreground">
          Close — back to today
        </button>
      </div>
    </div>
  );
}
