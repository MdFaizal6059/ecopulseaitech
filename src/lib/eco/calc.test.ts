import { describe, it, expect } from "vitest";
import {
  tierFor,
  levelFor,
  xpToNextLevel,
  calcBaseline,
  parseNaturalLanguage,
  totalByDay,
  totalByCategory,
  totalEmissionsKg,
  equivalencies,
  defaultProfile,
  defaultQuests,
  defaultRewards,
  defaultLeaderboard,
  TRANSPORT_EF,
  DIET_EF,
  ENERGY_EF,
} from "./calc";
import type { Activity } from "./types";

describe("tierFor", () => {
  it.each([
    [0, "Bronze"],
    [39, "Bronze"],
    [40, "Silver"],
    [99, "Silver"],
    [100, "Gold"],
    [249, "Gold"],
    [250, "Emerald"],
    [499, "Emerald"],
    [500, "Diamond"],
    [10_000, "Diamond"],
  ])("returns %s tier for %i kg prevented", (kg, tier) => {
    expect(tierFor(kg as number)).toBe(tier);
  });
});

describe("levelFor / xpToNextLevel", () => {
  it("levels are 1-indexed and increase every 250 XP", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(249)).toBe(1);
    expect(levelFor(250)).toBe(2);
    expect(levelFor(1000)).toBe(5);
  });

  it("xpToNextLevel reports remaining progress in the current band", () => {
    const r = xpToNextLevel(300);
    expect(r.needed).toBe(250);
    expect(r.current).toBe(50);
    expect(r.total).toBe(500);
  });
});

describe("calcBaseline", () => {
  it("produces a positive number combining housing/diet/commute/shopping", () => {
    const tons = calcBaseline("medium", "low-meat", "public", "medium");
    expect(tons).toBeGreaterThan(0);
    expect(Number.isFinite(tons)).toBe(true);
  });

  it("larger inputs => larger footprint", () => {
    const small = calcBaseline("small", "vegan", "bike", "low");
    const large = calcBaseline("large", "heavy-meat", "ice", "high");
    expect(large).toBeGreaterThan(small);
  });
});

describe("parseNaturalLanguage", () => {
  it("parses an EV trip in km", () => {
    const acts = parseNaturalLanguage("Drove my Tesla 12 km to work");
    const t = acts.find((a) => a.category === "transport");
    expect(t).toBeDefined();
    expect(t!.meta!.mode).toBe("ev");
    expect(t!.co2eKg).toBeCloseTo(12 * TRANSPORT_EF.ev, 2);
  });

  it("converts miles to km", () => {
    const acts = parseNaturalLanguage("Took the bus 10 miles");
    const t = acts.find((a) => a.category === "transport")!;
    expect(t.meta!.mode).toBe("public");
    expect(t.meta!.km).toBeCloseTo(16.1, 0);
  });

  it("detects vegan meals", () => {
    const acts = parseNaturalLanguage("Had a vegan salad for lunch");
    const d = acts.find((a) => a.category === "diet")!;
    expect(d.meta!.diet).toBe("vegan");
    expect(d.co2eKg).toBeCloseTo(DIET_EF.vegan, 2);
  });

  it("parses kWh energy usage", () => {
    const acts = parseNaturalLanguage("Used 5 kWh today");
    const e = acts.find((a) => a.category === "energy")!;
    expect(e.meta!.kwh).toBe(5);
    expect(e.co2eKg).toBeCloseTo(5 * ENERGY_EF, 2);
  });

  it("returns empty array for unrelated text", () => {
    expect(parseNaturalLanguage("hello world")).toEqual([]);
  });
});

describe("aggregations", () => {
  const now = Date.now();
  const activities: Activity[] = [
    { id: "1", category: "transport", label: "EV", co2eKg: 2, timestamp: now, meta: {} },
    { id: "2", category: "diet", label: "Vegan", co2eKg: 0.7, timestamp: now, meta: {} },
    { id: "3", category: "energy", label: "kWh", co2eKg: 1.3, timestamp: now - 86400000, meta: {} },
  ];

  it("totalEmissionsKg sums co2e correctly", () => {
    expect(totalEmissionsKg(activities)).toBeCloseTo(4.0, 2);
  });

  it("totalByCategory groups by category", () => {
    const cats = totalByCategory(activities);
    const map = Object.fromEntries(cats.map((c) => [c.name, c.value]));
    expect(map.transport).toBeCloseTo(2, 2);
    expect(map.diet).toBeCloseTo(0.7, 2);
    expect(map.energy).toBeCloseTo(1.3, 2);
    expect(map.shopping).toBe(0);
  });

  it("totalByDay returns N buckets ordered oldest -> newest", () => {
    const buckets = totalByDay(activities, 7);
    expect(buckets).toHaveLength(7);
    // Today (last bucket) contains the 2 + 0.7 = 2.7
    expect(buckets[buckets.length - 1].total).toBeCloseTo(2.7, 2);
  });
});

describe("equivalencies", () => {
  it("zero or negative kg => zeros, never NaN", () => {
    expect(equivalencies(0)).toEqual({ trees: 0, phoneCharges: 0, kmDriven: 0, burgers: 0 });
    expect(equivalencies(-50)).toEqual({ trees: 0, phoneCharges: 0, kmDriven: 0, burgers: 0 });
    expect(equivalencies(Number.NaN)).toEqual({
      trees: 0,
      phoneCharges: 0,
      kmDriven: 0,
      burgers: 0,
    });
  });

  it("scales linearly with kg", () => {
    const a = equivalencies(21);
    expect(a.trees).toBe(1);
    expect(equivalencies(210).trees).toBe(10);
  });
});

describe("default factories", () => {
  it("defaultProfile starts at zero progress, Bronze, level 1", () => {
    const p = defaultProfile();
    expect(p.xp).toBe(0);
    expect(p.credits).toBe(0);
    expect(p.streak).toBe(0);
    expect(p.level).toBe(1);
    expect(p.tier).toBe("Bronze");
    expect(p.onboarded).toBe(false);
  });

  it("defaultQuests all start incomplete", () => {
    for (const q of defaultQuests()) {
      expect(q.progress).toBe(0);
      expect(q.completed).toBe(false);
    }
  });

  it("defaultLeaderboard contains only the current user at zero", () => {
    const lb = defaultLeaderboard("Tester", "🌿");
    expect(lb).toHaveLength(1);
    expect(lb[0]).toMatchObject({ isYou: true, prevented: 0, streak: 0, tier: "Bronze" });
  });

  it("defaultRewards has stable, positive costs", () => {
    const rewards = defaultRewards();
    expect(rewards.length).toBeGreaterThan(0);
    for (const r of rewards) expect(r.cost).toBeGreaterThan(0);
  });
});
