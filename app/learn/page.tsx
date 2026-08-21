import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";

export default async function LearnPage() {
  const s = await createServerSupabase();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-sm font-semibold text-foreground">Learn</h1>
        <p className="text-xs text-muted mt-1">Flashcards & quizzes — AI will generate from your tasks/notes. Coming soon (V2).</p>
        <div className="mt-4 rounded-card border border-dashed border-border bg-surface p-8 text-center text-xs text-muted">Placeholder</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
