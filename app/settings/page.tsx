import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav, MobileBottomNav } from "@/components/layout/AppShell";
import { ExportClient } from "./ExportClient";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <TopNav active="settings" email={user.email} />
      <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Settings</h1>
          <p className="text-xs text-muted mt-1">Minimal — calm, no clutter.</p>
        </div>

        <Card className="p-6">
          <p className="text-sm font-medium">Account</p>
          <p className="text-xs text-muted mt-1">Signed in as {user.email}</p>
          <form
            action={async () => {
              "use server";
              const { createServerSupabase } = await import("@/lib/supabase/server");
              const s = await createServerSupabase();
              await s.auth.signOut();
              redirect("/login");
            }}
            className="mt-4"
          >
            <button type="submit" className="rounded-button border border-border bg-surface px-4 py-2 text-xs hover:bg-background">
              Sign out
            </button>
          </form>
        </Card>

        <ExportClient userId={user.id} email={user.email ?? ""} />

        <Card className="p-6">
          <p className="text-sm font-medium">About</p>
          <p className="text-xs text-muted mt-1">External Brain — ADHD Life OS. V1 focuses on Today, Tasks, Habits + AI. Your data stays private via Supabase RLS.</p>
          <p className="text-xs text-muted mt-2">Free tier: Supabase 500MB, Vercel 100GB, Groq + Gemini free. No hidden charges.</p>
        </Card>
      </main>
      <MobileBottomNav active="settings" />
    </div>
  );
}
