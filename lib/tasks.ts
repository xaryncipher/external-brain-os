import type { SupabaseClient } from "@supabase/supabase-js";

export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  is_today: boolean;
  parent_task_id: string | null;
  step_order: number;
  estimated_minutes: number | null;
  domain: string | null;
  created_at: string;
  completed_at: string | null;
};

// Server helpers (use with createServerSupabase)
export async function fetchTodayTasks(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_today", true)
    .neq("status", "done")
    .is("parent_task_id", null)
    .order("step_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

export async function fetchBacklogTasks(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_today", false)
    .neq("status", "done")
    .is("parent_task_id", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

export async function fetchSubtasks(supabase: SupabaseClient, parentId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("parent_task_id", parentId)
    .order("step_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}
