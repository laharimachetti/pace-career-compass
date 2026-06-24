import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { TrendingUp, Target, BookOpen, Code2, Users, ArrowRight, Award, Calendar } from "lucide-react";
import { useCareerStore } from "@/store/career-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Career GPS — PACE" },
      { name: "description", content: "Your live career roadmap: where you stand, what's next, what matters." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const analysis = useCareerStore((s) => s.analysis);
  const role = useCareerStore((s) => s.roleAnalysis);
  const targetRole = useCareerStore((s) => s.targetRole);

  if (!analysis || !role) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Your Career GPS is empty</h1>
          <p className="mt-3 text-muted-foreground">
            Upload a resume and pick a target role to generate your personalized dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              Upload resume <ArrowRight className="h-4 w-4" />
            </Link>
            {analysis && (
              <Link
                to="/dream-job"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium hover:bg-accent"
              >
                Pick a target role
              </Link>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const skills = role.gaps.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Career GPS</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {targetRole} · {analysis.career.level}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {analysis.profile.name ? `${analysis.profile.name.split(" ")[0]}, ` : ""}
              here's where you stand against {targetRole} and what to move on next.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dream-job"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Change role
            </Link>
            <Link
              to="/simulator"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Run a what-if <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Top stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Target}
            label="Match score"
            value={`${role.readiness.score}%`}
            hint={`Confidence ${analysis.career.confidence}/100`}
            highlight
          />
          <StatCard
            icon={TrendingUp}
            label="Career level"
            value={analysis.career.level}
            hint={analysis.career.track}
          />
          <StatCard
            icon={Calendar}
            label="Time to ready"
            value={formatWeeks(role.readiness.timeToReadyWeeks)}
            hint="at a steady pace"
          />
        </div>

        {/* Skills + Milestones */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Skill gap analysis</h2>
              <span className="text-xs text-muted-foreground">You vs target</span>
            </div>
            <ul className="space-y-5">
              {skills.map((s) => {
                return (
                  <li key={s.skill}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.skill}</span>
                      <span className="text-muted-foreground">
                        {s.currentLevel}% <span className="text-foreground/50">/ target {s.requiredLevel}%</span>
                      </span>
                    </div>
                    <div className="mt-2 relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.requiredLevel}%`, background: "oklch(0.92 0.03 260)" }} />
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.currentLevel}%`, background: "var(--gradient-brand)" }} />
                    </div>
                    {s.priority === "high" && (
                      <div className="mt-1 text-xs text-muted-foreground">High-priority gap — focus on this first.</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Strengths & gaps</h2>
            <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">What you bring</div>
            <ul className="mt-2 space-y-2 text-sm">
              {role.readiness.strengths.slice(0, 4).map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Where to grow</div>
            <ul className="mt-2 space-y-2 text-sm">
              {role.readiness.weaknesses.slice(0, 4).map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Roadmap */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">30 · 60 · 90 day roadmap</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {role.roadmap.map((phase) => (
              <div key={phase.phase} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-brand">{phase.phase}</span>
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{phase.focus}</h3>
                <ul className="mt-3 space-y-2">
                  {phase.milestones.map((m, i) => (
                    <li key={i} className="text-sm">
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-muted-foreground">{m.detail}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">Project recommendations</h2>
          <p className="text-sm text-muted-foreground">Picked to close your specific skill gaps.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {role.projects.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{p.difficulty}</span>
                  <Code2 className="h-3.5 w-3.5 text-brand" />
                  <span className="text-muted-foreground">~{p.estimatedWeeks}w</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.skillsAddressed.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-8 mb-8">
          <h2 className="text-base font-semibold">Certifications worth pursuing</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {role.certifications.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 text-xs">
                  <Award className="h-3.5 w-3.5 text-brand" />
                  <span className="text-muted-foreground">{c.issuer}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.reason}</p>
                <div className="mt-3 text-xs text-muted-foreground">~{c.estimatedWeeks} weeks of prep</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function formatWeeks(weeks: number): string {
  if (!weeks || weeks <= 0) return "—";
  if (weeks < 8) return `${weeks} weeks`;
  const months = Math.round(weeks / 4.33);
  return `~${months} months`;
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
