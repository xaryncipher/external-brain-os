import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { DeckList } from "@/components/learn/DeckList";

export default async function LearnPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="learn" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">Learn</h1>
        <p className="text-xs text-muted mt-1">Flashcards with spaced repetition — study smarter, not harder.</p>
        <DeckList />
      </main>
      <MobileBottomNav active="learn" />
    </div>
  );
}