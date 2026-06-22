import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const startParse = () => {
    if (!file) return;
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setDone(true);
    }, 1400);
  };

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

          {file && !done && (
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
                {parsing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <>Analyze resume <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          )}

          {done && (
            <div className="text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-brand" /> Resume analyzed
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Experience", v: "2 internships" },
                  { k: "Top skills", v: "Python · SQL · React" },
                  { k: "Projects", v: "4 detected" },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg border border-border bg-background p-3">
                    <div className="text-xs text-muted-foreground">{s.k}</div>
                    <div className="mt-1 text-sm font-medium">{s.v}</div>
                  </div>
                ))}
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