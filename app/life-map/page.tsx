import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";

export default async function LifeMapPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="life-map" email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-sm font-semibold text-foreground">Life Map</h1>
        <p className="text-xs text-muted mt-1">Coming soon — 8 domains: Health, Work, Learning, Personal Growth, Digital Behavior, Creative, Life Maintenance, Relationships. Your goals and projects will live here.</p>
        <div className="mt-4 rounded-card border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-xs text-muted">Placeholder — V2 editor, no data yet.</p>
        </div>
      </main>
      <MobileBottomNav active="today" />
    </div>
  );
}
