import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Search, ArrowRight, Briefcase } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dream-job")({
  head: () => ({
    meta: [
      { title: "Choose your dream job — PACE" },
      { name: "description", content: "Pick the role you're aiming for. PACE benchmarks you against it." },
    ],
  }),
  component: DreamJobPage,
});

const ROLES = [
  { title: "Software Engineer", company: "FAANG / Big Tech", tags: ["Python", "DSA", "Systems"] },
  { title: "Product Manager", company: "B2B SaaS", tags: ["Strategy", "Analytics", "Discovery"] },
  { title: "Data Scientist", company: "Fintech", tags: ["Stats", "SQL", "ML"] },
  { title: "ML Engineer", company: "AI startup", tags: ["PyTorch", "MLOps", "LLMs"] },
  { title: "Product Designer", company: "Series B startup", tags: ["Figma", "Systems", "Research"] },
  { title: "Investment Banking Analyst", company: "Bulge bracket", tags: ["Excel", "Valuation", "M&A"] },
  { title: "Consultant", company: "MBB", tags: ["Cases", "Slides", "Comms"] },
  { title: "Growth Marketer", company: "DTC brand", tags: ["SEO", "Paid", "Lifecycle"] },
  { title: "Founding Engineer", company: "Pre-seed", tags: ["Full-stack", "Speed", "Product"] },
];

function DreamJobPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => ROLES.filter((r) => (r.title + r.company).toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Step 2 of 3</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">What are you aiming for?</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Choose a role. We'll benchmark you against people already doing it and show what's between you and the offer.
        </p>

        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search roles, companies, industries…"
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const isActive = selected === r.title;
            return (
              <button
                key={r.title}
                onClick={() => setSelected(r.title)}
                className={`text-left rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all ${
                  isActive ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-foreground/20"
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {r.company}
                </div>
                <div className="mt-2 text-base font-semibold">{r.title}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected ? <>Targeting <span className="font-medium text-foreground">{selected}</span></> : "Pick a role to continue"}
          </p>
          <button
            disabled={!selected}
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--gradient-brand)" }}
          >
            Build my Career GPS <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}