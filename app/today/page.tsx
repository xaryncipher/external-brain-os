import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TodayPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Phase 1 placeholder — no tasks yet, just the shell for auth guard
  // Phase 2 will replace this with FocusCard + BrainDump + UpNext per PROJECT_SPEC.md:304
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <h1 className="text-sm font-semibold text-foreground">Today</h1>
          <nav className="flex items-center gap-3 text-xs text-muted">
            <Link href="/today" className="text-accent font-medium">
              Today
            </Link>
            <span>Tasks</span>
            <span>Habits</span>
            <form
              action={async () => {
                "use server";
                const { createServerSupabase } = await import("@/lib/supabase/server");
                const s = await createServerSupabase();
                await s.auth.signOut();
                redirect("/login");
              }}
            >
              <button type="submit" className="rounded-button border border-border px-2.5 py-1 hover:bg-background">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-card border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">Phase 1 — you are signed in.</p>
          <p className="mt-1 text-lg font-medium text-foreground">Welcome — your external brain will live here.</p>
          <p className="mt-2 text-sm text-muted">
            Signed in as <span className="text-foreground">{user.email}</span>
          </p>
          <div className="mt-6 rounded-button bg-accent/10 border border-accent/20 p-4 text-left">
            <p className="text-sm font-medium text-foreground">Next: Phase 2 — premium UI shell + preview.html</p>
            <p className="text-xs text-muted mt-1">
              Focus card + brain dump + habits will replace this placeholder.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3 text-xs">
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-muted">Life Map</p>
            <p className="text-foreground">Coming soon</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-muted">Learn</p>
            <p className="text-foreground">Coming soon</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-muted">Insights</p>
            <p className="text-foreground">Coming soon</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-muted">Game</p>
            <p className="text-foreground">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
