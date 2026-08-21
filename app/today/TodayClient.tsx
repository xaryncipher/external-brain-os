"use client";

import { useState } from "react";
import { BrainDump } from "@/components/today/BrainDump";
import { FocusCard, UpNext, type MockTask } from "@/components/today/FocusCard";
import { RescueOverlay } from "@/components/today/RescueOverlay";
import { Card } from "@/components/ui/Card";

const MOCK_TODAY: MockTask[] = [
  { id: "1", title: "Open resume file", estimated_minutes: 2, is_today: true },
  { id: "2", title: "Write one paragraph of cover letter", estimated_minutes: 5, is_today: true },
  { id: "3", title: "Drink water and stand up", estimated_minutes: 1, is_today: true },
];

const RESCUE_STEPS = ["Put your feet on the floor.", "Stand up.", "Walk to the bathroom.", "Turn on the light."];

export function TodayClient({ email }: { email: string }) {
  const [today, setToday] = useState<MockTask[]>(MOCK_TODAY);
  const [focusId, setFocusId] = useState<string>(MOCK_TODAY[0]?.id ?? "");
  const [rescueOpen, setRescueOpen] = useState(false);
  const [rescueIdx, setRescueIdx] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  const focus = today.find((t) => t.id === focusId) ?? today[0] ?? null;
  const upNext = today.filter((t) => t.id !== focus?.id);

  function handleDone() {
    if (!focus) return;
    setDoneCount((c) => c + 1);
    setToday((prev) => prev.filter((t) => t.id !== focus.id));
    const next = upNext[0];
    if (next) setFocusId(next.id);
  }

  return (
    <div className="space-y-4">
      {/* Header meta */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Signed in as {email}</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">{doneCount} done today</span>
            <span className="text-muted"> · no streak shame</span>
          </p>
        </div>
        <button
          onClick={() => setRescueOpen(true)}
          className="text-xs rounded-button border border-warning/30 bg-warning/10 px-3 py-1.5 text-foreground hover:bg-warning/15"
        >
          I’m stuck
        </button>
      </div>

      <BrainDump
        onConfirm={(items) => {
          const newTasks: MockTask[] = items.map((it, i) => ({
            id: `m-${Date.now()}-${i}`,
            title: it.title,
            estimated_minutes: 5,
            is_today: false,
          }));
          setToday((prev) => [...prev, ...newTasks]);
        }}
      />

      <FocusCard
        task={focus}
        onStuck={() => setRescueOpen(true)}
        onStill={() => {}}
        onDone={handleDone}
      />

      <UpNext tasks={upNext} onPick={setFocusId} />

      {/* Habit mock row */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Drink water</p>
          <p className="text-xs text-muted">Habit · 2 today</p>
        </div>
        <button className="rounded-button bg-accent px-3 py-1.5 text-xs font-medium text-white">Log</button>
      </Card>

      {/* Urge mock */}
      <Card className="p-4 flex items-center justify-between border-warning/20">
        <div>
          <p className="text-sm font-medium text-foreground">Had an urge?</p>
          <p className="text-xs text-muted">Log it calmly — get a 60-sec step, no shame.</p>
        </div>
        <button className="rounded-button border border-border bg-surface px-3 py-1.5 text-xs">Had urge</button>
      </Card>

      <RescueOverlay
        open={rescueOpen}
        step={RESCUE_STEPS[rescueIdx % RESCUE_STEPS.length]}
        onDone={() => {
          setRescueIdx((i) => i + 1);
          if (rescueIdx >= RESCUE_STEPS.length - 1) setRescueOpen(false);
        }}
        onSmaller={() => setRescueIdx((i) => i + 1)}
        onClose={() => setRescueOpen(false)}
      />
    </div>
  );
}
