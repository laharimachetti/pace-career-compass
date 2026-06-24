import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback } from "react";
import { parseResumeFile } from "@/services/resume-parser.service";
import { analyzeResume } from "@/lib/ai.functions";
import { useCareerStore } from "@/store/career-store";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload your resume — PACE" },
      { name: "description", content: "Drop in your resume so PACE can map your skills, projects, and gaps." },
    ],
  }),
  component: UploadPage,
});

const STAGES = [
  { key: "parse", label: "Reading your resume", detail: "Extracting raw text from your file", icon: ScanLine },
  { key: "skills", label: "Extracting skills & experience", detail: "Identifying what you actually know", icon: Sparkles },
  { key: "profile", label: "Detecting career profile", detail: "Level, track, strengths, weaknesses", icon: Target },
  { key: "ready", label: "Calculating career readiness", detail: "Weighted across skills, projects, experience", icon: Gauge },
  { key: "roadmap", label: "Preparing your dashboard", detail: "Personalized roadmap ready next", icon: MapIcon },
] as const;

function UploadPage() {
  const navigate = useNavigate();
  const setResume = useCareerStore((s) => s.setResume);
  const setAnalysis = useCareerStore((s) => s.setAnalysis);
  const analysis = useCareerStore((s) => s.analysis);
  const storedFileName = useCareerStore((s) => s.fileName);

  const runAnalyze = useServerFn(analyzeResume);

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setError(null);
    }
  }, []);

  const start = async () => {
    if (!file) return;
    setError(null);
    setParsing(true);
    setStageIndex(0);
    try {
      // Stage 1: parse file
      const parsed = await parseResumeFile(file);
      setResume({ fileName: parsed.fileName, resumeText: parsed.text });
      setStageIndex(1);
      // Stages 2-4 happen inside the single Gemini call; we advance the
      // indicator while the request is in flight so the UI feels alive.
      const tickers = [1500, 1800, 1500].map((delay, i) =>
        setTimeout(() => setStageIndex(i + 2), delay * (i + 1)),
      );
      try {
        const result = await runAnalyze({ data: { resumeText: parsed.text } });
        setAnalysis(result);
        setStageIndex(STAGES.length);
      } finally {
        tickers.forEach(clearTimeout);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setParsing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setStageIndex(0);
    useCareerStore.getState().reset();
  };

  const done = !!analysis && !parsing;

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
          {!file && !done && (
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
              {storedFileName && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Last analyzed: <span className="font-medium text-foreground">{storedFileName}</span>
                </p>
              )}
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
                onClick={start}
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
                {STAGES.map((s, i) => {
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

          {error && !parsing && (
            <div className="mt-2 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-left">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">We hit a problem analyzing your resume</div>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={start}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try again
                </button>
              </div>
            </div>
          )}

          {done && analysis && (
            <div className="text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-brand" /> Analysis complete
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {analysis.profile.name ? `Hi ${analysis.profile.name.split(" ")[0]}, ` : ""}
                here's what we read from your resume.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Career readiness", v: `${analysis.readiness.score} / 100` },
                  { k: "Closest role", v: analysis.career.closestRole },
                  { k: "Time to ready", v: `~${analysis.readiness.timeToReadyWeeks} weeks` },
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
                    {analysis.profile.skills.slice(0, 18).map((s) => (
                      <span key={s} className="rounded-full border border-border bg-accent/40 px-2 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                    {analysis.profile.skills.length === 0 && (
                      <span className="text-xs text-muted-foreground">No skills detected — try a more detailed resume.</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Areas to strengthen</div>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {analysis.readiness.weaknesses.slice(0, 4).map((w) => (
                      <li key={w} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Career profile</div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">{analysis.career.level}</span> · {analysis.career.track}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {analysis.profile.headline || analysis.profile.summary}
                </p>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  onClick={reset}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Upload a different resume
                </button>
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