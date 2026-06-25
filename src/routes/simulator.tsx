import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, TrendingUp, Clock, Target, Loader2, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { useCareerStore } from "@/store/career-store";
import { simulateScenarios } from "@/services/gemini.service";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "What-If Simulator — PACE" },
      { name: "description", content: "Test scenarios — a new internship, a side project, a certification — and see how your match score moves." },
    ],
  }),
  component: Simulator,
});

function Simulator() {
  const resumeText = useCareerStore((s) => s.resumeText);
  const targetRole = useCareerStore((s) => s.targetRole);
  const role = useCareerStore((s) => s.roleAnalysis);
  const scenarios = useCareerStore((s) => s.scenarios);
  const setScenarios = useCareerStore((s) => s.setScenarios);
  const baseScore = role?.readiness.score ?? 0;
  const baseWeeks = role?.readiness.timeToReadyWeeks ?? 0;

  const [active, setActive] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scenarios || !resumeText || !targetRole || !role) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeText, targetRole, role]);

  async function load() {
    if (!resumeText || !targetRole) return;
    setLoading(true);
    setError(null);
    try {
      const result = await simulateScenarios({
        resumeText,
        targetRole,
        currentScore: baseScore,
      });
      setScenarios(result.scenarios);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const projected = useMemo(() => {
    if (!scenarios) return { match: baseScore, weeks: baseWeeks };
    let match = baseScore;
    let weeks = baseWeeks;
    scenarios.forEach((s, i) => {
      if (active.has(i)) {
        match += s.readinessIncrease;
        weeks -= s.timelineReductionWeeks;
      }
    });
    return {
      match: Math.max(0, Math.min(100, Math.round(match))),
      weeks: Math.max(1, Math.round(weeks)),
    };
  }, [active, scenarios, baseScore, baseWeeks]);

  const toggle = (i: number) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (!resumeText || !targetRole || !role) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Build your plan first</h1>
          <p className="mt-3 text-muted-foreground">
            The simulator runs against your resume and target role.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            Start <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">What-If Simulator</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Test your next move before you make it.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Personalized scenarios against {targetRole}. Toggle any combination to see your projected match score and timeline shift.
        </p>

        {loading && (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-5">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span className="text-sm">Generating personalized scenarios from your resume…</span>
          </div>
        )}

        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <div className="text-sm font-medium">Couldn't generate scenarios</div>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={load}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          </div>
        )}

        {scenarios && (
        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 space-y-3">
            {scenarios.map((s, i) => {
              const on = active.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className={`w-full text-left rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all ${
                    on ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{s.scenario}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{s.note}</div>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <div className={s.readinessIncrease >= 0 ? "text-brand" : "text-destructive"}>
                        {s.readinessIncrease > 0 ? "+" : ""}{s.readinessIncrease}% match
                      </div>
                      <div className="text-muted-foreground">
                        {s.timelineReductionWeeks > 0 ? "−" : "+"}
                        {Math.abs(s.timelineReductionWeeks)} wk
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            <button
              onClick={load}
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate scenarios
            </button>
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
                  {projected.match - baseScore >= 0 ? "+" : ""}
                  {projected.match - baseScore}% from today
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric icon={Clock} label="Time to ready" value={`${projected.weeks} wk`} />
                <Metric icon={Target} label="Confidence" value={projected.match > 80 ? "High" : projected.match > 60 ? "Medium" : "Building"} />
              </div>

              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <TrendingUp className="h-3.5 w-3.5 text-brand" /> Top recommendation
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {active.size === 0
                    ? "Toggle a scenario to see how your trajectory shifts."
                    : pickTop(scenarios, active)}
                </p>
              </div>
            </div>
          </aside>
        </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function pickTop(scenarios: { scenario: string; readinessIncrease: number }[], active: Set<number>) {
  let best = -Infinity;
  let bestLabel = "";
  active.forEach((i) => {
    const s = scenarios[i];
    if (s && s.readinessIncrease > best) {
      best = s.readinessIncrease;
      bestLabel = s.scenario;
    }
  });
  return bestLabel
    ? `Highest-impact pick in this combination: ${bestLabel}.`
    : "Add scenarios with positive impact to see a recommendation.";
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