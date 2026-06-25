// Client-side Gemini service for PACE.
// All AI calls go directly to Google Gemini via @google/generative-ai.
// Requires VITE_GEMINI_API_KEY in your .env file.

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  ResumeAnalysis,
  RoleAnalysis,
  WhatIfScenario,
} from "@/types/career";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

function getModel() {
  if (!API_KEY) {
    throw new Error(
      "Gemini is not configured. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.",
    );
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });
}

async function callGeminiJson<T>(opts: {
  system: string;
  user: string;
  schemaHint: string;
}): Promise<T> {
  const model = getModel();
  const prompt = `${opts.system}\n\nReply ONLY with a single valid minified JSON object matching this TypeScript shape (no prose, no markdown, no code fences):\n${opts.schemaHint}\n\n${opts.user}`;

  let raw = "";
  try {
    const result = await model.generateContent(prompt);
    raw = result.response.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/quota|rate|429/i.test(msg)) {
      throw new Error("Gemini is rate limited right now. Try again in a moment.");
    }
    if (/api key|api_key|unauthor|permission|403|401/i.test(msg)) {
      throw new Error("Gemini rejected the API key. Check VITE_GEMINI_API_KEY in your .env file.");
    }
    if (/fetch|network|failed to fetch/i.test(msg)) {
      throw new Error("Network error reaching Gemini. Check your connection and retry.");
    }
    throw new Error(`Gemini request failed: ${msg}`);
  }

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new Error("Gemini returned an unreadable response. Please retry.");
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
    confidence: number
  },
  readiness: {
    score: number,
    breakdown: { skills: number, projects: number, experience: number, certifications: number, education: number },
    strengths: string[],
    weaknesses: string[],
    timeToReadyWeeks: number
  }
}`;

export async function analyzeResume(input: {
  resumeText: string;
}): Promise<ResumeAnalysis> {
  if (!input.resumeText || input.resumeText.trim().length < 40) {
    throw new Error("Resume text is too short to analyze.");
  }
  return callGeminiJson<ResumeAnalysis>({
    system: [
      "You are an expert technical recruiter and career coach.",
      "Parse the provided resume and produce a personalized analysis.",
      "Extract ONLY facts present in the resume — do not invent skills, jobs, or projects.",
      "Score readiness with these weights: skills 40, projects 25, experience 20, certifications 10, education 5.",
      "Each breakdown component is a 0-100 score for that dimension; the overall score must equal the weighted sum.",
      "closestRole must be a real, specific role title (e.g. 'Backend Engineer', 'Data Analyst', 'ML Engineer').",
    ].join(" "),
    user: `RESUME TEXT:\n"""\n${input.resumeText}\n"""`,
    schemaHint: ANALYZE_SCHEMA,
  });
}

// ---------- analyzeForRole ----------

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

export async function analyzeForRole(input: {
  resumeText: string;
  targetRole: string;
}): Promise<RoleAnalysis> {
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
    user: `TARGET ROLE: ${input.targetRole}\n\nRESUME TEXT:\n"""\n${input.resumeText}\n"""`,
    schemaHint: ROLE_SCHEMA,
  });
}

// ---------- simulateScenarios ----------

const SIM_SCHEMA = `{
  scenarios: { scenario: string, readinessIncrease: number, timelineReductionWeeks: number, note: string }[]
}`;

export async function simulateScenarios(input: {
  resumeText: string;
  targetRole: string;
  currentScore: number;
}): Promise<{ scenarios: WhatIfScenario[] }> {
  return callGeminiJson<{ scenarios: WhatIfScenario[] }>({
    system: [
      "You are a career simulator.",
      "Generate 6 realistic, distinct what-if scenarios this specific candidate could pursue,",
      "each with an honest estimated readiness delta (can be negative) and timeline change in weeks.",
      "Scenarios should reference the candidate's actual background and target role.",
      "Mix certifications, internships, projects, learning paths, and role pivots.",
    ].join(" "),
    user: `TARGET ROLE: ${input.targetRole}\nCURRENT READINESS: ${input.currentScore}\n\nRESUME TEXT:\n"""\n${input.resumeText}\n"""`,
    schemaHint: SIM_SCHEMA,
  });
}