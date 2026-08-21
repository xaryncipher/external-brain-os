import Link from "next/link";

export function TopNav({ active = "today", email }: { active?: string; email?: string | null }) {
  const link = (href: string, label: string, isActive: boolean) =>
    isActive ? (
      <span className="rounded-button bg-accent px-3 py-1.5 text-xs font-medium text-white">{label}</span>
    ) : (
      <Link href={href} className="rounded-button px-3 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground">
        {label}
      </Link>
    );

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-button bg-accent flex items-center justify-center text-white text-xs font-semibold">
            B
          </span>
          <span className="text-sm font-semibold text-foreground hidden sm:inline">External Brain</span>
        </div>
        <nav className="flex items-center gap-1">
          {link("/today", "Today", active === "today")}
          {link("/tasks", "Tasks", active === "tasks")}
          {link("/habits", "Habits", active === "habits")}
          <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-xs text-muted border-l border-border pl-3">
            {email ?? ""}
          </span>
        </nav>
      </div>
    </header>
  );
}

export function PlaceholderGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      {[
        ["Life Map", "Coming soon"],
        ["Learn", "Coming soon"],
        ["Insights", "Coming soon"],
        ["Game", "Coming soon"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-card border border-border bg-surface p-4">
          <p className="text-muted">{k}</p>
          <p className="text-foreground font-medium mt-1">{v}</p>
        </div>
      ))}
    </div>
  );
}

export function MobileBottomNav({ active = "today" }: { active?: string }) {
  const items: [string, string, string][] = [
    ["/today", "Today", "◉"],
    ["/tasks", "Tasks", "☰"],
    ["/habits", "Habits", "♡"],
  ];
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-surface flex justify-around py-2">
      {items.map(([href, label, icon]) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center text-[11px] px-4 py-1.5 rounded-button ${active === label.toLowerCase() ? "text-accent font-medium" : "text-muted"}`}
        >
          <span className="text-sm leading-none">{icon}</span>
          <span className="mt-0.5">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
