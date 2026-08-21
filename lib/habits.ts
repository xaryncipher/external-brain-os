import type { SupabaseClient } from "@supabase/supabase-js";

export type HabitRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type HabitLogRow = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
};

export async function fetchHabitsWithTodayCount(supabase: SupabaseClient, userId: string) {
  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: logs, error: logErr } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_at", todayStart.toISOString());
  if (logErr) throw logErr;

  const countMap = new Map<string, number>();
  (logs ?? []).forEach((l: HabitLogRow) => {
    countMap.set(l.habit_id, (countMap.get(l.habit_id) ?? 0) + 1);
  });

  return (habits ?? []).map((h: HabitRow) => ({
    ...h,
    todayCount: countMap.get(h.id) ?? 0,
  }));
}
