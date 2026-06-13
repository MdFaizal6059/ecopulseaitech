import firstStep from "@/assets/badges/first-step.png";
import streakSpark from "@/assets/badges/streak-spark.png";
import streakKeeper from "@/assets/badges/streak-keeper.png";
import streakLegend from "@/assets/badges/streak-legend.png";
import treeHugger from "@/assets/badges/tree-hugger.png";
import forestGuardian from "@/assets/badges/forest-guardian.png";
import evPioneer from "@/assets/badges/ev-pioneer.png";
import transitHero from "@/assets/badges/transit-hero.png";
import plantPower from "@/assets/badges/plant-power.png";
import questChampion from "@/assets/badges/quest-champion.png";
import marketplaceMaven from "@/assets/badges/marketplace-maven.png";
import carbonCrusher from "@/assets/badges/carbon-crusher.png";

import type { Activity, AppState, Badge } from "./types";
import { equivalencies, totalEmissionsKg } from "./calc";

export type MilestoneKind =
  | "first_activity"
  | "streak_days"
  | "trees_saved"
  | "ev_trips"
  | "transit_trips"
  | "vegan_meals"
  | "quests_completed"
  | "rewards_redeemed"
  | "kg_prevented";

export interface BadgeMeta {
  id: string;
  name: string;
  description: string;
  criteria: string;
  artUrl: string;
  milestone: { kind: MilestoneKind; threshold: number };
}

export const BADGE_REGISTRY: BadgeMeta[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "You logged your very first activity. The journey of a thousand miles…",
    criteria: "Log 1 activity",
    artUrl: firstStep,
    milestone: { kind: "first_activity", threshold: 1 },
  },
  {
    id: "streak-spark",
    name: "Streak Spark",
    description: "3 days in a row of conscious choices.",
    criteria: "3-day streak",
    artUrl: streakSpark,
    milestone: { kind: "streak_days", threshold: 3 },
  },
  {
    id: "streak-keeper",
    name: "Streak Keeper",
    description: "A full week of low-carbon momentum.",
    criteria: "7-day streak",
    artUrl: streakKeeper,
    milestone: { kind: "streak_days", threshold: 7 },
  },
  {
    id: "streak-legend",
    name: "Streak Legend",
    description: "30 days. You're a climate phoenix.",
    criteria: "30-day streak",
    artUrl: streakLegend,
    milestone: { kind: "streak_days", threshold: 30 },
  },
  {
    id: "tree-hugger",
    name: "Tree Hugger",
    description: "Saved enough CO₂ to equal 10 tree-years.",
    criteria: "10 trees worth of CO₂",
    artUrl: treeHugger,
    milestone: { kind: "trees_saved", threshold: 10 },
  },
  {
    id: "forest-guardian",
    name: "Forest Guardian",
    description: "A whole grove worth of carbon prevented.",
    criteria: "100 trees worth of CO₂",
    artUrl: forestGuardian,
    milestone: { kind: "trees_saved", threshold: 100 },
  },
  {
    id: "ev-pioneer",
    name: "EV Pioneer",
    description: "First electric ride logged. Zero tailpipe.",
    criteria: "Log 1 EV trip",
    artUrl: evPioneer,
    milestone: { kind: "ev_trips", threshold: 1 },
  },
  {
    id: "transit-hero",
    name: "Transit Hero",
    description: "20 trips on bus, train, or metro.",
    criteria: "20 transit trips",
    artUrl: transitHero,
    milestone: { kind: "transit_trips", threshold: 20 },
  },
  {
    id: "plant-power",
    name: "Plant Power",
    description: "10 plant-forward meals on the books.",
    criteria: "10 vegan / vegetarian meals",
    artUrl: plantPower,
    milestone: { kind: "vegan_meals", threshold: 10 },
  },
  {
    id: "quest-champion",
    name: "Quest Champion",
    description: "10 eco-quests crushed. You're built different.",
    criteria: "Complete 10 quests",
    artUrl: questChampion,
    milestone: { kind: "quests_completed", threshold: 10 },
  },
  {
    id: "marketplace-maven",
    name: "Marketplace Maven",
    description: "First redemption from the rewards store.",
    criteria: "Redeem 1 reward",
    artUrl: marketplaceMaven,
    milestone: { kind: "rewards_redeemed", threshold: 1 },
  },
  {
    id: "carbon-crusher",
    name: "Carbon Crusher",
    description: "100 kg of CO₂ prevented vs your baseline.",
    criteria: "Prevent 100 kg CO₂e",
    artUrl: carbonCrusher,
    milestone: { kind: "kg_prevented", threshold: 100 },
  },
];

export function badgeMeta(id: string): BadgeMeta | undefined {
  return BADGE_REGISTRY.find((b) => b.id === id);
}

/** Default badge state — everything locked. */
export function defaultBadges(): Badge[] {
  return BADGE_REGISTRY.map((b) => ({ id: b.id, unlocked: false }));
}

/** Compute current value for every milestone kind from app state. */
export function milestoneValues(state: AppState, redeemedCount: number) {
  const acts = state.activities;
  const evTrips = acts.filter((a) => a.category === "transport" && a.meta?.mode === "ev").length;
  const transitTrips = acts.filter(
    (a) => a.category === "transport" && a.meta?.mode === "public",
  ).length;
  const veganMeals = acts.filter(
    (a) => a.category === "diet" && (a.meta?.diet === "vegan" || a.meta?.diet === "vegetarian"),
  ).length;
  const questsCompleted = state.quests.filter((q) => q.completed).length;
  const baselineMonthlyKg = (state.profile.baselineAnnualTons * 1000) / 12;
  const monthlyEmitted = totalEmissionsKg(
    acts.filter((a) => a.timestamp > Date.now() - 30 * 86400000),
  );
  const kgPrevented = Math.max(0, baselineMonthlyKg - monthlyEmitted);
  const trees = equivalencies(kgPrevented).trees;
  return {
    first_activity: acts.length,
    streak_days: state.profile.streak,
    trees_saved: trees,
    ev_trips: evTrips,
    transit_trips: transitTrips,
    vegan_meals: veganMeals,
    quests_completed: questsCompleted,
    rewards_redeemed: redeemedCount,
    kg_prevented: Math.round(kgPrevented),
  } satisfies Record<MilestoneKind, number>;
}

/** Run milestone evaluation; return newly-unlocked badge IDs and the updated badge array. */
export function evaluateMilestones(
  state: AppState,
  redeemedCount: number,
): { badges: Badge[]; newlyUnlocked: string[] } {
  const values = milestoneValues(state, redeemedCount);
  const newlyUnlocked: string[] = [];
  const badges = state.badges.map((b) => {
    if (b.unlocked) return b;
    const meta = badgeMeta(b.id);
    if (!meta) return b;
    const current = values[meta.milestone.kind];
    if (current >= meta.milestone.threshold) {
      newlyUnlocked.push(b.id);
      return { ...b, unlocked: true, unlockedAt: Date.now() };
    }
    return b;
  });
  return { badges, newlyUnlocked };
}

/** Next 3 locked badges, ranked by closest progress. */
export function upcomingMilestones(state: AppState, redeemedCount: number) {
  const values = milestoneValues(state, redeemedCount);
  return state.badges
    .filter((b) => !b.unlocked)
    .map((b) => {
      const meta = badgeMeta(b.id)!;
      const current = Math.min(meta.milestone.threshold, values[meta.milestone.kind]);
      const pct = meta.milestone.threshold === 0 ? 0 : (current / meta.milestone.threshold) * 100;
      return { meta, current, pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);
}

/** Normalize stored badges to the current registry (handles old shape from localStorage). */
export function normalizeBadges(stored: unknown): Badge[] {
  const base = defaultBadges();
  if (!Array.isArray(stored)) return base;
  const map = new Map<string, Badge>();
  for (const raw of stored) {
    if (raw && typeof raw === "object" && "id" in raw) {
      const r = raw as { id: string; unlocked?: boolean; unlockedAt?: number };
      if (BADGE_REGISTRY.some((b) => b.id === r.id)) {
        map.set(r.id, { id: r.id, unlocked: !!r.unlocked, unlockedAt: r.unlockedAt });
      }
    }
  }
  return base.map((b) => map.get(b.id) ?? b);
}

// Convenience for components that only need to count vegan/transit activities
export function activityCountByMode(activities: Activity[], mode: string) {
  return activities.filter((a) => a.meta?.mode === mode).length;
}
