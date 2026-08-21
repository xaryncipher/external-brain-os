import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { StudyCard } from "@/components/learn/StudyCard";
import { AddFlashcard } from "@/components/learn/AddFlashcard";
import { Card } from "@/components/ui/Card";

interface Props {
  params: Promise<{ deck: string }>;
}

export default async function DeckPage({ params }: Props) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { deck } = await params;
  const decodedDeck = decodeURIComponent(deck);

  // Fetch card counts
  const [{ count: total }, { count: due }] = await Promise.all([
    supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("deck", decodedDeck),
    supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("deck", decodedDeck).lte("next_review_at", new Date().toISOString()),
  ]);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="learn" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">{decodedDeck}</h1>
            <p className="text-xs text-muted mt-1">
              {total ?? 0} cards · {due ?? 0} due now
            </p>
          </div>
          <a href={`/learn/${encodeURIComponent(decodedDeck)}/add`}>
            <button className="rounded-button bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
              Add Card
            </button>
          </a>
        </div>

        <StudyCard deck={decodedDeck} />

        <div className="mt-6">
          <AddFlashcard deck={decodedDeck} onAdded={() => window.location.reload()} />
        </div>
      </main>
      <MobileBottomNav active="learn" />
    </div>
  );
}