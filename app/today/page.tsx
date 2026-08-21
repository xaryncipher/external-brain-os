import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, PlaceholderGrid, MobileBottomNav } from "@/components/layout/AppShell";
import { TodayClient } from "./TodayClient";
import { fetchTodayTasks } from "@/lib/tasks";
import { fetchHabitsWithTodayCount } from "@/lib/habits";

export default async function TodayPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let todayTasks: Awaited<ReturnType<typeof fetchTodayTasks>> = [];
  let habits: Awaited<ReturnType<typeof fetchHabitsWithTodayCount>> = [];
  let doneCount = 0;

  try {
    todayTasks = await fetchTodayTasks(supabase, user.id);
    habits = await fetchHabitsWithTodayCount(supabase, user.id);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "done")
      .gte("completed_at", todayStart.toISOString());
    doneCount = count ?? 0;
  } catch {
    // If tables not yet created or env placeholder, fall back to empty (Phase 2 mock already handles)
    todayTasks = [];
    habits = [];
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="today" email={user.email} />

      <main className="mx-auto max-w-3xl px-5 py-8">
        <TodayClient email={user.email ?? ""} userId={user.id} initialTasks={todayTasks} initialHabits={habits} initialDoneCount={doneCount} />
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
