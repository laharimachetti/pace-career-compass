import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Upload, Target, Map, Sparkles, BarChart3, Compass } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PACE — Personalized AI Career Engine" },
      { name: "description", content: "See how close you are to your dream job and what to learn next. PACE turns your resume into a personalized career roadmap." },
      { property: "og:title", content: "PACE — Personalized AI Career Engine" },
      { property: "og:description", content: "Your resume in. Your career roadmap out." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-brand" />
            Personalized AI Career Engine
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Know exactly how close you are to your dream job.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Upload your resume, pick a role, and get a clear map of the skills, projects, and steps between where you are and where you want to be.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex h-11 items-center gap-2 rounded-md px-6 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              Start with your resume <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              See a sample roadmap
            </Link>
          </div>

          {/* Preview card */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
              <div className="rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/40 p-8 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Career GPS</div>
                    <div className="mt-1 text-lg font-semibold">Product Designer at a Series B startup</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Match score</div>
                    <div className="text-2xl font-semibold text-brand">72%</div>
                  </div>
                </div>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: "72%", background: "var(--gradient-brand)" }} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Strong", value: "Figma · UX Research" },
                    { label: "Building", value: "Design Systems" },
                    { label: "Next up", value: "Motion · Prototyping" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-background p-3">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="mt-1 text-sm font-medium">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, title: "Read your resume", body: "We parse your experience, projects, and skills — no rewriting required." },
            { icon: Target, title: "Pick a dream role", body: "From ML engineer to product designer. We benchmark you against what hiring really looks like." },
            { icon: Map, title: "Get a clear path", body: "A roadmap of what to learn next, what to build, and what to ignore." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-background to-muted/40 p-10">
          <div className="mb-10 max-w-2xl">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">How PACE works</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">From resume to roadmap in minutes.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: BarChart3, step: "01", title: "Benchmark", body: "Compare your skills against thousands of profiles already in the role." },
              { icon: Compass, step: "02", title: "Navigate", body: "See your Career GPS — what to focus on this month, this quarter, this year." },
              { icon: Sparkles, step: "03", title: "Simulate", body: "Test the what-ifs: a new internship, a side project, a different major." },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">{step}</span>
                  <Icon className="h-4 w-4 text-brand" />
                </div>
                <h3 className="mt-3 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
