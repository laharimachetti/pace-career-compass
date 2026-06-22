import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteNav() {
  const links = [
    { to: "/upload", label: "Upload" },
    { to: "/dream-job", label: "Dream Job" },
    { to: "/dashboard", label: "Career GPS" },
    { to: "/simulator", label: "What-If" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>
            <Sparkles className="h-4 w-4" />
          </span>
          PACE
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/upload"
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--gradient-brand)" }}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} PACE — Personalized AI Career Engine</span>
          <span>Built for students charting the next step.</span>
        </div>
      </div>
    </footer>
  );
}