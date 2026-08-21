import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { AddFlashcard } from "@/components/learn/AddFlashcard";

interface Props {
  params: Promise<{ deck: string }>;
}

export default async function AddPage({ params }: { params: Promise<{ deck: string }> }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { deck } = await params;
  const decodedDeck = decodeURIComponent(deck);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="learn" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <a href={`/learn/${encodeURIComponent(decodedDeck)}`} className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover mb-6">
          ← Back to {decodeURIComponent(deck)}
        </a>
        <AddFlashcard deck={decodedDeck} onAdded={() => redirect(`/learn/${encodeURIComponent(decodedDeck)}`)} />
      </main>
      <MobileBottomNav active="learn" />
    </div>
  );
}