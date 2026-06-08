import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Activity, AppState, Quest, UserProfile } from "./types";
import { calcBaseline, defaultState, levelFor, tierFor, totalEmissionsKg } from "./calc";

const STORAGE_KEY = "ecopulse:v1";

type Ctx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  addActivity: (a: Activity) => void;
  removeActivity: (id: string) => void;
  completeQuest: (id: string) => void;
  redeemReward: (id: string) => boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetTo: (preset: "low" | "high" | "default") => void;
  finishOnboarding: (p: Pick<UserProfile, "housing" | "diet" | "commute" | "shopping" | "name">) => void;
};

const EcoCtx = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState();
  }
}

export function EcoProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStateRaw(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setStateRaw((s) => {
      const next = updater(s);
      // recompute derived
      const prevented = Math.max(0, next.profile.baselineAnnualTons * 1000 / 12 - totalEmissionsKg(next.activities.filter(a => a.timestamp > Date.now() - 30*86400000)));
      const youIdx = next.leaderboard.findIndex(e => e.isYou);
      if (youIdx >= 0) {
        next.leaderboard[youIdx] = {
          ...next.leaderboard[youIdx],
          prevented: Math.round(prevented + 150),
          streak: next.profile.streak,
          tier: tierFor(prevented + 150),
        };
        next.leaderboard = [...next.leaderboard].sort((a,b) => b.prevented - a.prevented);
      }
      next.profile = {
        ...next.profile,
        level: levelFor(next.profile.xp),
        tier: tierFor(prevented + 150),
      };
      return { ...next };
    });
  }, []);

  const addActivity = useCallback((a: Activity) => {
    setState((s) => ({ ...s, activities: [a, ...s.activities] }));
  }, [setState]);

  const removeActivity = useCallback((id: string) => {
    setState((s) => ({ ...s, activities: s.activities.filter(x => x.id !== id) }));
  }, [setState]);

  const completeQuest = useCallback((id: string) => {
    setState((s) => {
      const quests = s.quests.map(q => q.id === id ? { ...q, progress: q.target, completed: true } : q);
      const q = s.quests.find(x => x.id === id);
      if (!q || q.completed) return s;
      return {
        ...s,
        quests,
        profile: {
          ...s.profile,
          xp: s.profile.xp + q.xp,
          credits: s.profile.credits + q.credits,
        },
      };
    });
  }, [setState]);

  const redeemReward = useCallback((id: string) => {
    let ok = false;
    setState((s) => {
      const r = s.rewards.find(x => x.id === id);
      if (!r || s.profile.credits < r.cost) return s;
      ok = true;
      return { ...s, profile: { ...s.profile, credits: s.profile.credits - r.cost } };
    });
    return ok;
  }, [setState]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, [setState]);

  const finishOnboarding = useCallback((p: Pick<UserProfile, "housing" | "diet" | "commute" | "shopping" | "name">) => {
    const baseline = calcBaseline(p.housing, p.diet, p.commute, p.shopping);
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...p, baselineAnnualTons: baseline, onboarded: true },
    }));
  }, [setState]);

  const resetTo = useCallback((preset: "low" | "high" | "default") => {
    setState((s) => {
      const fresh = defaultState();
      if (preset === "low") {
        fresh.activities = fresh.activities.map(a => ({ ...a, co2eKg: +(a.co2eKg * 0.35).toFixed(2) }));
        fresh.profile = { ...fresh.profile, ...s.profile, diet: "vegan", commute: "ev", housing: "small", shopping: "low", baselineAnnualTons: 4.2, xp: 3200, credits: 1400, streak: 28 };
      } else if (preset === "high") {
        fresh.activities = fresh.activities.map(a => ({ ...a, co2eKg: +(a.co2eKg * 2.1).toFixed(2) }));
        fresh.profile = { ...fresh.profile, ...s.profile, diet: "heavy-meat", commute: "ice", housing: "large", shopping: "high", baselineAnnualTons: 22.6, xp: 420, credits: 120, streak: 1 };
      } else {
        fresh.profile = { ...fresh.profile, onboarded: s.profile.onboarded, name: s.profile.name };
      }
      return fresh;
    });
  }, [setState]);

  const value = useMemo<Ctx>(() => ({
    state, setState, addActivity, removeActivity, completeQuest, redeemReward, updateProfile, resetTo, finishOnboarding,
  }), [state, setState, addActivity, removeActivity, completeQuest, redeemReward, updateProfile, resetTo, finishOnboarding]);

  return <EcoCtx.Provider value={value}>{children}</EcoCtx.Provider>;
}

export function useEco() {
  const c = useContext(EcoCtx);
  if (!c) throw new Error("useEco must be used inside EcoProvider");
  return c;
}
