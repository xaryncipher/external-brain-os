import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";

export default async function TasksPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="tasks" email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-sm font-semibold text-foreground">Tasks</h1>
        <p className="text-xs text-muted mt-1">Backlog + Today — Phase 3 will wire real Supabase data.</p>
        <div className="mt-4 rounded-card border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">No tasks yet — calm placeholder.</p>
          <p className="text-xs text-muted mt-1">Brain dump on Today will fill this.</p>
        </div>
      </main>
      <MobileBottomNav active="tasks" />
    </div>
  );
}
