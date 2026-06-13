import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Activity, AppState, UserProfile } from "./types";
import { calcBaseline, defaultState, levelFor, tierFor, totalEmissionsKg } from "./calc";
import { evaluateMilestones, normalizeBadges } from "./badges";

const STORAGE_KEY = "ecopulse:v2";

type Ctx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  addActivity: (a: Activity) => void;
  removeActivity: (id: string) => void;
  completeQuest: (id: string) => void;
  redeemReward: (id: string) => boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetTo: (preset: "low" | "high" | "default") => void;
  finishOnboarding: (
    p: Pick<UserProfile, "housing" | "diet" | "commute" | "shopping" | "name">,
  ) => void;
  acknowledgeUnlock: () => void;
  redeemedCount: number;
};

const EcoCtx = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      badges: normalizeBadges(parsed.badges),
      pendingUnlocks: parsed.pendingUnlocks ?? [],
    };
  } catch {
    return defaultState();
  }
}

export function EcoProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [redeemedCount, setRedeemedCount] = useState(0);

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

  const setState = useCallback(
    (updater: (s: AppState) => AppState) => {
      setStateRaw((s) => {
        const next = updater(s);
        const monthly = totalEmissionsKg(
          next.activities.filter((a) => a.timestamp > Date.now() - 30 * 86400000),
        );
        const prevented = Math.max(0, (next.profile.baselineAnnualTons * 1000) / 12 - monthly);

        const youIdx = next.leaderboard.findIndex((e) => e.isYou);
        if (youIdx >= 0) {
          next.leaderboard[youIdx] = {
            ...next.leaderboard[youIdx],
            name: next.profile.name,
            avatar: next.profile.avatar,
            prevented: Math.round(prevented),
            streak: next.profile.streak,
            tier: tierFor(prevented),
            pinnedBadge: next.profile.pinnedBadge,
          };
          next.leaderboard = [...next.leaderboard].sort((a, b) => b.prevented - a.prevented);
        }
        next.profile = {
          ...next.profile,
          level: levelFor(next.profile.xp),
          tier: tierFor(prevented),
        };

        // Milestone evaluation
        const { badges, newlyUnlocked } = evaluateMilestones(next, redeemedCount);
        next.badges = badges;
        if (newlyUnlocked.length) {
          next.pendingUnlocks = [...(next.pendingUnlocks ?? []), ...newlyUnlocked];
        }
        return { ...next };
      });
    },
    [redeemedCount],
  );

  const addActivity = useCallback(
    (a: Activity) => {
      setState((s) => ({ ...s, activities: [a, ...s.activities] }));
    },
    [setState],
  );

  const removeActivity = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, activities: s.activities.filter((x) => x.id !== id) }));
    },
    [setState],
  );

  const completeQuest = useCallback(
    (id: string) => {
      setState((s) => {
        const q = s.quests.find((x) => x.id === id);
        if (!q || q.completed) return s;
        const quests = s.quests.map((qq) =>
          qq.id === id ? { ...qq, progress: qq.target, completed: true } : qq,
        );
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
    },
    [setState],
  );

  const redeemReward = useCallback(
    (id: string) => {
      let ok = false;
      setStateRaw((s) => {
        const r = s.rewards.find((x) => x.id === id);
        if (!r || s.profile.credits < r.cost) return s;
        ok = true;
        return { ...s, profile: { ...s.profile, credits: s.profile.credits - r.cost } };
      });
      if (ok) {
        setRedeemedCount((c) => c + 1);
        // trigger milestone re-eval
        setState((s) => ({ ...s }));
      }
      return ok;
    },
    [setState],
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    },
    [setState],
  );

  const finishOnboarding = useCallback(
    (p: Pick<UserProfile, "housing" | "diet" | "commute" | "shopping" | "name">) => {
      const baseline = calcBaseline(p.housing, p.diet, p.commute, p.shopping);
      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          ...p,
          baselineAnnualTons: baseline,
          onboarded: true,
          streak: Math.max(1, s.profile.streak),
        },
      }));
    },
    [setState],
  );

  const resetTo = useCallback(
    (preset: "low" | "high" | "default") => {
      setState((s) => {
        const fresh = defaultState();
        if (preset === "low") {
          fresh.profile = {
            ...fresh.profile,
            ...s.profile,
            diet: "vegan",
            commute: "ev",
            housing: "small",
            shopping: "low",
            baselineAnnualTons: 4.2,
            xp: 0,
            credits: 0,
            streak: 0,
          };
        } else if (preset === "high") {
          fresh.profile = {
            ...fresh.profile,
            ...s.profile,
            diet: "heavy-meat",
            commute: "ice",
            housing: "large",
            shopping: "high",
            baselineAnnualTons: 22.6,
            xp: 0,
            credits: 0,
            streak: 0,
          };
        } else {
          fresh.profile = {
            ...fresh.profile,
            onboarded: s.profile.onboarded,
            name: s.profile.name,
            avatar: s.profile.avatar,
          };
        }
        return fresh;
      });
    },
    [setState],
  );

  const acknowledgeUnlock = useCallback(() => {
    setStateRaw((s) => ({ ...s, pendingUnlocks: s.pendingUnlocks.slice(1) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setState,
      addActivity,
      removeActivity,
      completeQuest,
      redeemReward,
      updateProfile,
      resetTo,
      finishOnboarding,
      acknowledgeUnlock,
      redeemedCount,
    }),
    [
      state,
      setState,
      addActivity,
      removeActivity,
      completeQuest,
      redeemReward,
      updateProfile,
      resetTo,
      finishOnboarding,
      acknowledgeUnlock,
      redeemedCount,
    ],
  );

  return <EcoCtx.Provider value={value}>{children}</EcoCtx.Provider>;
}

export function useEco() {
  const c = useContext(EcoCtx);
  if (!c) throw new Error("useEco must be used inside EcoProvider");
  return c;
}
