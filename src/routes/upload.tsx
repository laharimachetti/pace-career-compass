import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ScanLine,
  Sparkles,
  Target,
  Gauge,
  Map as MapIcon,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload your resume — PACE" },
      { name: "description", content: "Drop in your resume so PACE can map your skills, projects, and gaps." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [done, setDone] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    { key: "parse", label: "Analyzing resume", detail: "Reading sections, roles, and projects", icon: ScanLine, ms: 1100 },
    { key: "skills", label: "Extracting skills", detail: "Identifying tools, languages, and strengths", icon: Sparkles, ms: 1300 },
    { key: "gap", label: "Comparing against job requirements", detail: "Benchmarking against 1,200+ role signals", icon: Target, ms: 1500 },
    { key: "ready", label: "Calculating career readiness", detail: "Scoring fit, momentum, and depth", icon: Gauge, ms: 1100 },
    { key: "roadmap", label: "Generating personalized roadmap", detail: "Sequencing the next 90 days", icon: MapIcon, ms: 1400 },
  ] as const;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const startParse = () => {
    if (!file) return;
    setParsing(true);
    setStageIndex(0);
  };

  useEffect(() => {
    if (!parsing) return;
    if (stageIndex >= stages.length) {
      setParsing(false);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStageIndex((i) => i + 1), stages[stageIndex].ms);
    return () => clearTimeout(t);
  }, [parsing, stageIndex]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Step 1 of 3</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Bring your resume.</h1>
        <p className="mt-3 text-muted-foreground">
          PACE reads it once and uses it across your whole roadmap. PDF or DOCX, anything you've got.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="mt-8 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-brand/60"
        >
          {!file && (
            <>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-brand">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium">Drag and drop your resume</p>
              <p className="text-xs text-muted-foreground">or</p>
              <label className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent">
                Choose a file
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-4 text-xs text-muted-foreground">PDF, DOC, DOCX — up to 10MB</p>
            </>
          )}

          {file && !done && !parsing && (
            <div className="flex items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB · ready to analyze
                  </div>
                </div>
              </div>
              <button
                onClick={startParse}
                disabled={parsing}
                className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--gradient-brand)" }}
              >
                Analyze resume <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {parsing && (
            <div className="text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                AI analysis in progress
              </div>
              <ol className="mt-5 space-y-3">
                {stages.map((s, i) => {
                  const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.key}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                        state === "active"
                          ? "border-brand/40 bg-accent/40"
                          : "border-border bg-background"
                      }`}
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                          state === "done"
                            ? "bg-brand/10 text-brand"
                            : state === "active"
                            ? "bg-accent text-brand"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {state === "done" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium">
                            {s.label}
                            {state === "active" ? "…" : ""}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {state === "done" ? "Complete" : state === "active" ? "Running" : "Queued"}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{s.detail}</div>
                        {state === "active" && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full w-2/3 animate-pulse rounded-full"
                              style={{ background: "var(--gradient-brand)" }}
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {done && (
            <div className="text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-brand" /> Analysis complete
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Benchmarked against Software Engineer, Data Analyst, and Product Manager tracks.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Career readiness", v: "68 / 100" },
                  { k: "Closest role", v: "Data Analyst" },
                  { k: "Time to ready", v: "~12 weeks" },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg border border-border bg-background p-3">
                    <div className="text-xs text-muted-foreground">{s.k}</div>
                    <div className="mt-1 text-sm font-medium">{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Skills detected</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Python", "SQL", "Pandas", "React", "Git", "A/B testing", "Excel", "Tableau"].map((s) => (
                      <span key={s} className="rounded-full border border-border bg-accent/40 px-2 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Top gaps</div>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {[
                      { s: "Statistics & A/B depth", g: "High impact" },
                      { s: "Data modeling (dbt)", g: "Medium" },
                      { s: "System design basics", g: "Medium" },
                    ].map((g) => (
                      <li key={g.s} className="flex items-center justify-between gap-2">
                        <span>{g.s}</span>
                        <span className="text-xs text-muted-foreground">{g.g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Suggested roadmap</div>
                <ol className="mt-2 space-y-2 text-sm">
                  {[
                    { w: "Weeks 1–3", t: "Ship a SQL + Python case study on a public dataset" },
                    { w: "Weeks 4–7", t: "Complete an applied statistics & experimentation course" },
                    { w: "Weeks 8–12", t: "Build a dbt + dashboard project and publish a write-up" },
                  ].map((r) => (
                    <li key={r.w} className="flex items-start gap-3">
                      <span className="mt-0.5 w-20 shrink-0 text-xs text-muted-foreground">{r.w}</span>
                      <span>{r.t}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate({ to: "/dream-job" })}
                  className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Pick a dream role <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your resume stays private. We only use it to build your roadmap.{" "}
          <Link to="/" className="underline-offset-2 hover:underline">Back home</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}