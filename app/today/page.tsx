import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, PlaceholderGrid, MobileBottomNav } from "@/components/layout/AppShell";
import { TodayClient } from "./TodayClient";

export default async function TodayPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="today" email={user.email} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <TodayClient email={user.email ?? ""} />
        <PlaceholderGrid />
        <form
          action={async () => {
            "use server";
            const { createServerSupabase } = await import("@/lib/supabase/server");
            const s = await createServerSupabase();
            await s.auth.signOut();
            redirect("/login");
          }}
          className="mt-8 text-center"
        >
          <button type="submit" className="text-xs text-muted hover:text-foreground">
            Sign out
          </button>
        </form>
      </main>

      <MobileBottomNav active="today" />
    </div>
  );
}
