/**
 * Extra coverage for the smaller, easy-to-regress helpers in calc.ts.
 * Keeps the core math and labels under test so refactors don't silently
 * change emission factors or human-readable strings.
 */
import { describe, it, expect } from "vitest";
import {
  TRANSPORT_EF,
  DIET_EF,
  ENERGY_EF,
  WATER_EF,
  US_AVG_TONS,
  GLOBAL_AVG_TONS,
  labelMode,
  labelDiet,
  defaultState,
  equivalencies,
  totalByDay,
  totalByCategory,
} from "./calc";

describe("emission-factor constants", () => {
  it("are non-negative numbers", () => {
    for (const v of Object.values(TRANSPORT_EF)) expect(v).toBeGreaterThanOrEqual(0);
    for (const v of Object.values(DIET_EF)) expect(v).toBeGreaterThan(0);
    expect(ENERGY_EF).toBeGreaterThan(0);
    expect(WATER_EF).toBeGreaterThan(0);
  });

  it("orders transport modes from cleanest to dirtiest", () => {
    expect(TRANSPORT_EF.bike).toBeLessThanOrEqual(TRANSPORT_EF.ev);
    expect(TRANSPORT_EF.ev).toBeLessThan(TRANSPORT_EF.public);
    expect(TRANSPORT_EF.public).toBeLessThan(TRANSPORT_EF.ice);
  });

  it("orders diets vegan → vegetarian → low-meat → heavy-meat", () => {
    expect(DIET_EF.vegan).toBeLessThan(DIET_EF.vegetarian);
    expect(DIET_EF.vegetarian).toBeLessThan(DIET_EF["low-meat"]);
    expect(DIET_EF["low-meat"]).toBeLessThan(DIET_EF["heavy-meat"]);
  });

  it("US baseline is meaningfully larger than the global average", () => {
    expect(US_AVG_TONS).toBeGreaterThan(GLOBAL_AVG_TONS);
  });
});

describe("label helpers", () => {
  it("labelMode covers every TransportMode key", () => {
    for (const mode of Object.keys(TRANSPORT_EF) as Array<keyof typeof TRANSPORT_EF>) {
      expect(typeof labelMode(mode)).toBe("string");
      expect(labelMode(mode).length).toBeGreaterThan(0);
    }
  });

  it("labelDiet covers every DietType key", () => {
    for (const d of Object.keys(DIET_EF) as Array<keyof typeof DIET_EF>) {
      expect(typeof labelDiet(d)).toBe("string");
    }
  });
});

describe("defaultState integrity", () => {
  it("starts fully zeroed — no demo data leaks to production", () => {
    const s = defaultState();
    expect(s.activities).toEqual([]);
    expect(s.pendingUnlocks).toEqual([]);
    expect(s.profile.xp).toBe(0);
    expect(s.profile.credits).toBe(0);
    expect(s.profile.streak).toBe(0);
    expect(s.profile.onboarded).toBe(false);
    expect(s.badges.every((b) => !b.unlocked)).toBe(true);
    expect(s.leaderboard).toHaveLength(1);
    expect(s.leaderboard[0].isYou).toBe(true);
  });
});

describe("aggregation edge cases", () => {
  it("totalByDay handles an empty activity list", () => {
    const buckets = totalByDay([], 7);
    expect(buckets).toHaveLength(7);
    expect(buckets.every((b) => b.total === 0)).toBe(true);
  });

  it("totalByCategory always returns all four categories", () => {
    const cats = totalByCategory([]);
    expect(cats.map((c) => c.name).sort()).toEqual(["diet", "energy", "shopping", "transport"]);
  });

  it("equivalencies of 100kg gives sensible round numbers", () => {
    const e = equivalencies(100);
    expect(e.trees).toBeGreaterThan(0);
    expect(e.kmDriven).toBeGreaterThan(0);
    expect(e.burgers).toBeGreaterThan(0);
    expect(e.phoneCharges).toBeGreaterThan(0);
  });
});
