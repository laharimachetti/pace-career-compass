import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useMemo, useState } from "react";
import { Sparkles, TrendingUp, Clock, Target } from "lucide-react";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "What-If Simulator — PACE" },
      { name: "description", content: "Test scenarios — a new internship, a side project, a certification — and see how your match score moves." },
    ],
  }),
  component: Simulator,
});

type Scenario = { id: string; label: string; deltaMatch: number; deltaMonths: number; note: string };
const SCENARIOS: Scenario[] = [
  { id: "intern", label: "Land a backend internship this summer", deltaMatch: 12, deltaMonths: -2, note: "Adds production experience and a referral surface." },
  { id: "ddia", label: "Finish Designing Data-Intensive Applications", deltaMatch: 6, deltaMonths: -1, note: "Closes most of the system design gap." },
  { id: "oss", label: "Merge 3 PRs into a popular OSS repo", deltaMatch: 5, deltaMonths: 0, note: "Signals real-world code quality and collaboration." },
  { id: "leetcode", label: "Solve 50 medium LeetCode in 8 weeks", deltaMatch: 8, deltaMonths: -1, note: "Direct correlation with phone screen pass rate." },
  { id: "side", label: "Ship a distributed systems side project", deltaMatch: 10, deltaMonths: -1, note: "Best single move for your current profile." },
  { id: "switch", label: "Switch target role to ML Engineer", deltaMatch: -18, deltaMonths: 4, note: "Heavier math + research path. Worth it if you love it." },
];

function Simulator() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const base = { match: 64, months: 7 };

  const projected = useMemo(() => {
    let match = base.match;
    let months = base.months;
    for (const s of SCENARIOS) if (active.has(s.id)) { match += s.deltaMatch; months += s.deltaMonths; }
    return { match: Math.max(0, Math.min(100, match)), months: Math.max(1, months) };
  }, [active]);

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">What-If Simulator</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Test your next move before you make it.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Toggle scenarios on the left. The projected outcome updates on the right — match score, timeline, and the one thing you should do first.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 space-y-3">
            {SCENARIOS.map((s) => {
              const on = active.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`w-full text-left rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all ${
                    on ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{s.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{s.note}</div>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <div className={s.deltaMatch >= 0 ? "text-brand" : "text-destructive"}>
                        {s.deltaMatch > 0 ? "+" : ""}{s.deltaMatch}% match
                      </div>
                      <div className="text-muted-foreground">
                        {s.deltaMonths > 0 ? "+" : ""}{s.deltaMonths} mo
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <aside className="lg:col-span-2">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-brand" /> Projected outcome
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Match score</span>
                  <span className="text-3xl font-semibold tracking-tight">{projected.match}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${projected.match}%`, background: "var(--gradient-brand)" }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {projected.match - base.match >= 0 ? "+" : ""}
                  {projected.match - base.match}% from today
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric icon={Clock} label="Time to ready" value={`${projected.months} mo`} />
                <Metric icon={Target} label="Confidence" value={projected.match > 80 ? "High" : projected.match > 60 ? "Medium" : "Building"} />
              </div>

              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <TrendingUp className="h-3.5 w-3.5 text-brand" /> Top recommendation
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {active.size === 0
                    ? "Pick one scenario to see how your trajectory shifts."
                    : "Stack the internship with the side project. Same calendar months, biggest jump in match."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}