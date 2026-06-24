// Server-side AI functions for PACE.
// Every function calls Gemini 2.5 Flash via the Lovable AI Gateway and
// returns structured JSON. No mock data anywhere.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  ResumeAnalysis,
  RoleAnalysis,
  WhatIfScenario,
} from "@/types/career";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callGeminiJson<T>(opts: {
  system: string;
  user: string;
  schemaHint: string;
}): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    throw new Error(
      "AI is not configured on the server (missing LOVABLE_API_KEY).",
    );
  }

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `${opts.system}\n\nReply ONLY with a single valid minified JSON object matching this TypeScript shape (no prose, no markdown, no code fences):\n${opts.schemaHint}`,
        },
        { role: "user", content: opts.user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new Error("AI is rate limited right now. Try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error(
        "AI credits are exhausted. Add credits in your Lovable workspace billing.",
      );
    }
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to recover a JSON object from the response if the model added prose.
    const match = cleaned.match(/\{[\s\S]*\}$/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("AI returned an unreadable response. Please retry.");
  }
}

// ---------- analyzeResume ----------

const ANALYZE_SCHEMA = `{
  profile: {
    name: string,
    headline: string,
    summary: string,
    education: { school: string, degree: string, field: string, dates: string }[],
    experience: { company: string, role: string, dates: string, highlights: string[] }[],
    projects: { name: string, description: string, tech: string[] }[],
    certifications: { name: string, issuer: string, year?: string }[],
    skills: string[]
  },
  career: {
    level: "Student"|"Entry"|"Junior"|"Mid"|"Senior",
    track: string,
    closestRole: string,
    technicalStrengths: string[],
    weaknesses: string[],
    confidence: number  // 0-100
  },
  readiness: {
    score: number,  // 0-100
    breakdown: { skills: number, projects: number, experience: number, certifications: number, education: number },
    strengths: string[],
    weaknesses: string[],
    timeToReadyWeeks: number
  }
}`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({ resumeText: z.string().min(40).max(40000) })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ResumeAnalysis> => {
    return callGeminiJson<ResumeAnalysis>({
      system: [
        "You are an expert technical recruiter and career coach.",
        "Parse the provided resume and produce a personalized analysis.",
        "Extract ONLY facts present in the resume — do not invent skills, jobs, or projects.",
        "Score readiness with these weights: skills 40, projects 25, experience 20, certifications 10, education 5.",
        "Each breakdown component is a 0-100 score for that dimension; the overall score must equal the weighted sum.",
        "closestRole must be a real, specific role title (e.g. 'Backend Engineer', 'Data Analyst', 'ML Engineer').",
      ].join(" "),
      user: `RESUME TEXT:\n"""\n${data.resumeText}\n"""`,
      schemaHint: ANALYZE_SCHEMA,
    });
  });

// ---------- analyzeForRole ----------
// Produces gap analysis, readiness recalibrated for the target role,
// 30/60/90 day roadmap, project recs, and certification recs in one call.

const ROLE_SCHEMA = `{
  targetRole: string,
  readiness: {
    score: number,
    breakdown: { skills: number, projects: number, experience: number, certifications: number, education: number },
    strengths: string[],
    weaknesses: string[],
    timeToReadyWeeks: number
  },
  gaps: { skill: string, currentLevel: number, requiredLevel: number, gap: number, priority: "high"|"medium"|"low" }[],
  roadmap: { phase: "30 days"|"60 days"|"90 days", focus: string, milestones: { title: string, detail: string }[] }[],
  projects: { title: string, description: string, skillsAddressed: string[], difficulty: "Beginner"|"Intermediate"|"Advanced", estimatedWeeks: number }[],
  certifications: { name: string, issuer: string, reason: string, estimatedWeeks: number }[]
}`;

export const analyzeForRole = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        resumeText: z.string().min(40).max(40000),
        targetRole: z.string().min(2).max(120),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<RoleAnalysis> => {
    return callGeminiJson<RoleAnalysis>({
      system: [
        "You are a senior career coach specialized in tech and product careers.",
        "Given a candidate's resume and a target role, produce a fully personalized plan.",
        "Skill levels are 0-100 (current vs required for the target role).",
        "Generate EXACTLY 5 project recommendations that close the biggest skill gaps,",
        "and 3-5 certification recommendations that are widely recognized.",
        "Roadmap must have exactly three phases: '30 days', '60 days', '90 days', each with 3-4 milestones.",
        "Readiness weights: skills 40, projects 25, experience 20, certifications 10, education 5.",
        "Recommendations must be specific to THIS resume — reuse the candidate's actual tech and domain context.",
      ].join(" "),
      user: `TARGET ROLE: ${data.targetRole}\n\nRESUME TEXT:\n"""\n${data.resumeText}\n"""`,
      schemaHint: ROLE_SCHEMA,
    });
  });

// ---------- simulateScenarios ----------

const SIM_SCHEMA = `{
  scenarios: { scenario: string, readinessIncrease: number, timelineReductionWeeks: number, note: string }[]
}`;

export const simulateScenarios = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        resumeText: z.string().min(40).max(40000),
        targetRole: z.string().min(2).max(120),
        currentScore: z.number().min(0).max(100),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ scenarios: WhatIfScenario[] }> => {
    return callGeminiJson<{ scenarios: WhatIfScenario[] }>({
      system: [
        "You are a career simulator.",
        "Generate 6 realistic, distinct what-if scenarios this specific candidate could pursue,",
        "each with an honest estimated readiness delta (can be negative) and timeline change in weeks.",
        "Scenarios should reference the candidate's actual background and target role.",
        "Mix certifications, internships, projects, learning paths, and role pivots.",
      ].join(" "),
      user: `TARGET ROLE: ${data.targetRole}\nCURRENT READINESS: ${data.currentScore}\n\nRESUME TEXT:\n"""\n${data.resumeText}\n"""`,
      schemaHint: SIM_SCHEMA,
    });
  });