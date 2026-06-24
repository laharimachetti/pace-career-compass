// Core domain types for PACE career engine

export interface ResumeProfile {
  name: string;
  headline: string;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  skills: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  field: string;
  dates: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  dates: string;
  highlights: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
}

export type CareerLevel = "Student" | "Entry" | "Junior" | "Mid" | "Senior";

export interface CareerProfile {
  level: CareerLevel;
  track: string;
  closestRole: string;
  technicalStrengths: string[];
  weaknesses: string[];
  confidence: number;
}

export interface ReadinessScore {
  score: number;
  breakdown: {
    skills: number;
    projects: number;
    experience: number;
    certifications: number;
    education: number;
  };
  strengths: string[];
  weaknesses: string[];
  timeToReadyWeeks: number;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: "high" | "medium" | "low";
}

export interface RoadmapPhase {
  phase: "30 days" | "60 days" | "90 days";
  focus: string;
  milestones: { title: string; detail: string }[];
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  skillsAddressed: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
}

export interface CertificationRecommendation {
  name: string;
  issuer: string;
  reason: string;
  estimatedWeeks: number;
}

export interface WhatIfScenario {
  scenario: string;
  readinessIncrease: number;
  timelineReductionWeeks: number;
  note: string;
}

export interface ResumeAnalysis {
  profile: ResumeProfile;
  career: CareerProfile;
  readiness: ReadinessScore;
}

export interface RoleAnalysis {
  targetRole: string;
  readiness: ReadinessScore;
  gaps: SkillGap[];
  roadmap: RoadmapPhase[];
  projects: ProjectRecommendation[];
  certifications: CertificationRecommendation[];
}