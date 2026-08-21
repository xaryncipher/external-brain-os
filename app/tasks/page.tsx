import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { TasksClient } from "./TasksClient";
import { fetchTodayTasks, fetchBacklogTasks } from "@/lib/tasks";

export default async function TasksPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let today: Awaited<ReturnType<typeof fetchTodayTasks>> = [];
  let backlog: Awaited<ReturnType<typeof fetchBacklogTasks>> = [];
  try {
    today = await fetchTodayTasks(supabase, user.id);
    backlog = await fetchBacklogTasks(supabase, user.id);
  } catch {}

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="tasks" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">Tasks</h1>
        <p className="text-xs text-muted mt-1">Today + Backlog — real Supabase, calm moves.</p>
        <div className="mt-6">
          <TasksClient userId={user.id} initialToday={today} initialBacklog={backlog} />
        </div>
      </main>
      <MobileBottomNav active="tasks" />
    </div>
  );
}
