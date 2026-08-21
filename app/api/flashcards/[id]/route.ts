import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PatchTaskReq } from "@/lib/validators";

// PATCH - Update flashcard (partial update)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: Record<string, any>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Only allow specific fields to be updated
  const allowedFields = ["deck", "front", "back", "next_review_at", "interval_days", "ease", "step_order"];
  const updates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ card: data });
}

// DELETE - Delete flashcard
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("flashcards").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}