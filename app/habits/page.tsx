import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { HabitsClient } from "./HabitsClient";
import { fetchHabitsWithTodayCount } from "@/lib/habits";

export default async function HabitsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let habits: Awaited<ReturnType<typeof fetchHabitsWithTodayCount>> = [];
  try {
    habits = await fetchHabitsWithTodayCount(supabase, user.id);
  } catch {}

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="habits" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <HabitsClient userId={user.id} initial={habits} />
      </main>
      <MobileBottomNav active="habits" />
    </div>
  );
}
