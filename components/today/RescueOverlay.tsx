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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-md rounded-card border border-border-strong bg-surface p-8 shadow-lg">
        <p className="text-[11px] font-semibold tracking-widest text-accent-muted uppercase">Rescue — one tiny step</p>
        <p className="mt-4 text-[22px] font-semibold text-foreground leading-snug tracking-tight">{step}</p>
        <p className="mt-2.5 text-xs text-muted">No pressure — just this. You can ask for a smaller step.</p>

        <div className="mt-8 flex gap-3">
          <Button variant="primary" onClick={onDone} className="flex-1 py-3">
            Done
          </Button>
          <Button variant="outline" onClick={onSmaller} className="flex-1 py-3">
            Need smaller step
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-accent" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>

        <button onClick={onClose} className="mt-6 w-full text-xs text-muted hover:text-foreground">
          Close — back to today
        </button>
      </div>
    </div>
  );
}
