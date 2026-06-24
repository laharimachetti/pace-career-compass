import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ResumeAnalysis,
  RoleAnalysis,
  WhatIfScenario,
} from "@/types/career";

export interface CareerState {
  fileName: string | null;
  resumeText: string | null;
  analysis: ResumeAnalysis | null;
  targetRole: string | null;
  roleAnalysis: RoleAnalysis | null;
  scenarios: WhatIfScenario[] | null;
  lastUpdated: number | null;

  setResume: (input: { fileName: string; resumeText: string }) => void;
  setAnalysis: (analysis: ResumeAnalysis) => void;
  setTargetRole: (role: string) => void;
  setRoleAnalysis: (role: RoleAnalysis) => void;
  setScenarios: (s: WhatIfScenario[]) => void;
  reset: () => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      fileName: null,
      resumeText: null,
      analysis: null,
      targetRole: null,
      roleAnalysis: null,
      scenarios: null,
      lastUpdated: null,

      setResume: ({ fileName, resumeText }) =>
        set({
          fileName,
          resumeText,
          analysis: null,
          roleAnalysis: null,
          scenarios: null,
          lastUpdated: Date.now(),
        }),
      setAnalysis: (analysis) => set({ analysis, lastUpdated: Date.now() }),
      setTargetRole: (role) =>
        set({ targetRole: role, roleAnalysis: null, scenarios: null }),
      setRoleAnalysis: (roleAnalysis) =>
        set({ roleAnalysis, scenarios: null, lastUpdated: Date.now() }),
      setScenarios: (scenarios) => set({ scenarios, lastUpdated: Date.now() }),
      reset: () =>
        set({
          fileName: null,
          resumeText: null,
          analysis: null,
          targetRole: null,
          roleAnalysis: null,
          scenarios: null,
          lastUpdated: null,
        }),
    }),
    {
      name: "pace-career-store",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as Storage)
          : window.localStorage,
      ),
    },
  ),
);