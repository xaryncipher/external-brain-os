import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";

export default async function HabitsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="habits" email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-sm font-semibold text-foreground">Habits</h1>
        <p className="text-xs text-muted mt-1">Minimal V1 — non-punishing count, not streak shame.</p>
        <div className="mt-4 space-y-2">
          <div className="rounded-card border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Drink water</p>
              <p className="text-xs text-muted">2 today · gentle momentum</p>
            </div>
            <button className="rounded-button border border-border bg-surface px-3 py-1.5 text-xs opacity-60">Log (Phase 3)</button>
          </div>
        </div>
      </main>
      <MobileBottomNav active="habits" />
    </div>
  );
}
