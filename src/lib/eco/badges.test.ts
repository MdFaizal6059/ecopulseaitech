import { describe, it, expect } from "vitest";
import {
  BADGE_REGISTRY,
  badgeMeta,
  defaultBadges,
  evaluateMilestones,
  milestoneValues,
  normalizeBadges,
  upcomingMilestones,
} from "./badges";
import { defaultState } from "./calc";
import type { AppState } from "./types";

function stateWith(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), ...partial };
}

describe("BADGE_REGISTRY", () => {
  it("has unique ids and positive thresholds", () => {
    const ids = new Set(BADGE_REGISTRY.map((b) => b.id));
    expect(ids.size).toBe(BADGE_REGISTRY.length);
    for (const b of BADGE_REGISTRY) {
      expect(b.milestone.threshold).toBeGreaterThan(0);
      expect(b.artUrl).toBeTruthy();
    }
  });

  it("badgeMeta lookup works", () => {
    expect(badgeMeta("first-step")?.name).toBe("First Step");
    expect(badgeMeta("does-not-exist")).toBeUndefined();
  });
});

describe("defaultBadges", () => {
  it("returns one entry per registered badge, all locked", () => {
    const badges = defaultBadges();
    expect(badges).toHaveLength(BADGE_REGISTRY.length);
    expect(badges.every((b) => b.unlocked === false)).toBe(true);
  });
});

describe("milestoneValues", () => {
  it("counts activities, ev/transit trips, and vegan meals", () => {
    const state = stateWith({
      activities: [
        {
          id: "a",
          category: "transport",
          label: "EV",
          co2eKg: 1,
          timestamp: Date.now(),
          meta: { mode: "ev" },
        },
        {
          id: "b",
          category: "transport",
          label: "Bus",
          co2eKg: 1,
          timestamp: Date.now(),
          meta: { mode: "public" },
        },
        {
          id: "c",
          category: "diet",
          label: "Vegan",
          co2eKg: 0.5,
          timestamp: Date.now(),
          meta: { diet: "vegan" },
        },
      ],
    });
    const v = milestoneValues(state, 0);
    expect(v.first_activity).toBe(3);
    expect(v.ev_trips).toBe(1);
    expect(v.transit_trips).toBe(1);
    expect(v.vegan_meals).toBe(1);
    expect(v.rewards_redeemed).toBe(0);
  });
});

describe("evaluateMilestones", () => {
  it("unlocks 'first-step' once an activity is logged", () => {
    const state = stateWith({
      activities: [
        {
          id: "1",
          category: "transport",
          label: "EV",
          co2eKg: 1,
          timestamp: Date.now(),
          meta: { mode: "ev" },
        },
      ],
    });
    const { badges, newlyUnlocked } = evaluateMilestones(state, 0);
    expect(newlyUnlocked).toContain("first-step");
    expect(badges.find((b) => b.id === "first-step")!.unlocked).toBe(true);
  });

  it("does not re-unlock already-unlocked badges", () => {
    const base = defaultState();
    base.badges = base.badges.map((b) => (b.id === "first-step" ? { ...b, unlocked: true } : b));
    base.activities = [
      {
        id: "1",
        category: "transport",
        label: "EV",
        co2eKg: 1,
        timestamp: Date.now(),
        meta: { mode: "ev" },
      },
    ];
    const { newlyUnlocked } = evaluateMilestones(base, 0);
    expect(newlyUnlocked).not.toContain("first-step");
  });
});

describe("upcomingMilestones", () => {
  it("returns at most 3 locked milestones sorted by progress", () => {
    const state = defaultState();
    const upcoming = upcomingMilestones(state, 0);
    expect(upcoming.length).toBeLessThanOrEqual(3);
    for (const u of upcoming) {
      expect(u.pct).toBeGreaterThanOrEqual(0);
      expect(u.pct).toBeLessThanOrEqual(100);
    }
  });
});

describe("normalizeBadges", () => {
  it("falls back to defaults for invalid input", () => {
    expect(normalizeBadges(null)).toEqual(defaultBadges());
    expect(normalizeBadges("nope" as unknown)).toEqual(defaultBadges());
  });

  it("preserves unlocked state for known ids and drops unknown ids", () => {
    const stored = [
      { id: "first-step", unlocked: true, unlockedAt: 12345 },
      { id: "ghost-badge", unlocked: true },
    ];
    const result = normalizeBadges(stored);
    expect(result.find((b) => b.id === "first-step")).toMatchObject({
      unlocked: true,
      unlockedAt: 12345,
    });
    expect(result.find((b) => b.id === "ghost-badge")).toBeUndefined();
    expect(result.length).toBe(BADGE_REGISTRY.length);
  });
});
