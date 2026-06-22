import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { TrendingUp, Target, BookOpen, Code2, Users, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Career GPS — PACE" },
      { name: "description", content: "Your live career roadmap: where you stand, what's next, what matters." },
    ],
  }),
  component: Dashboard,
});

const SKILLS = [
  { name: "Python", level: 85, target: 90 },
  { name: "Data Structures", level: 70, target: 90 },
  { name: "System Design", level: 35, target: 75 },
  { name: "SQL", level: 78, target: 80 },
  { name: "Distributed Systems", level: 20, target: 70 },
  { name: "Product Sense", level: 55, target: 65 },
];

const MILESTONES = [
  { done: true, title: "Resume parsed and benchmarked" },
  { done: true, title: "Two internships in backend roles" },
  { done: false, title: "Ship a distributed systems side project" },
  { done: false, title: "Pass 40 medium LeetCode questions" },
  { done: false, title: "Mock interview round (systems + behavioral)" },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Career GPS</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Software Engineer · Big Tech</h1>
            <p className="mt-2 text-muted-foreground">Here's where you stand today and what to move on next.</p>
          </div>
          <Link
            to="/simulator"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Run a what-if <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Top stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard icon={Target} label="Match score" value="64%" hint="+8 in the last 30 days" highlight />
          <StatCard icon={TrendingUp} label="Percentile" value="Top 38%" hint="vs students targeting this role" />
          <StatCard icon={Users} label="Time to ready" value="~7 months" hint="at your current pace" />
        </div>

        {/* Skills + Milestones */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Skill coverage</h2>
              <span className="text-xs text-muted-foreground">You vs target</span>
            </div>
            <ul className="space-y-5">
              {SKILLS.map((s) => {
                const gap = s.target - s.level;
                return (
                  <li key={s.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.level}% <span className="text-foreground/50">/ target {s.target}%</span>
                      </span>
                    </div>
                    <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.target}%`, background: "oklch(0.92 0.03 260)" }} />
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.level}%`, background: "var(--gradient-brand)" }} />
                    </div>
                    {gap > 20 && (
                      <div className="mt-1 text-xs text-muted-foreground">Biggest gap — prioritize this quarter.</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Milestones</h2>
            <ul className="mt-4 space-y-3">
              {MILESTONES.map((m) => (
                <li key={m.title} className="flex gap-3">
                  {m.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className={`text-sm ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Next moves */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">Recommended next moves</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <MoveCard
              icon={Code2}
              tag="Build"
              title="Ship a small distributed cache"
              body="Two-week project. Covers consistency, replication, and a real systems story for interviews."
            />
            <MoveCard
              icon={BookOpen}
              tag="Learn"
              title="Designing Data-Intensive Applications"
              body="Read chapters 1–4. Maps directly to the system design gap on your profile."
            />
            <MoveCard
              icon={Users}
              tag="Reach out"
              title="Three engineers at target companies"
              body="Specific intros, not cold spray. We drafted the openers based on your resume."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, highlight }: { icon: typeof Target; label: string; value: string; hint: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      style={highlight ? { background: "linear-gradient(180deg, oklch(0.98 0.02 260), oklch(1 0 0))" } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function MoveCard({ icon: Icon, tag, title, body }: { icon: typeof Code2; tag: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{tag}</span>
        <Icon className="h-3.5 w-3.5 text-brand" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}