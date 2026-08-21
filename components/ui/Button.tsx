import * as React from "react";

type Variant = "primary" | "ghost" | "outline" | "subtle";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover border border-accent",
  ghost: "bg-transparent text-foreground hover:bg-background border border-transparent",
  outline: "bg-surface text-foreground border border-border hover:bg-background",
  subtle: "bg-accent/10 text-foreground border border-accent/20 hover:bg-accent/15",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-button px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
