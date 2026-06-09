import type {
  Activity,
  AppState,
  DietType,
  LeaderboardEntry,
  Quest,
  Reward,
  Tier,
  TransportMode,
  UserProfile,
} from "./types";
import { defaultBadges } from "./badges";

// Emission factors (kg CO2e per unit)
export const TRANSPORT_EF: Record<TransportMode, number> = {
  ev: 0.05,
  ice: 0.21,
  public: 0.12,
  bike: 0,
  walk: 0,
};

export const DIET_EF: Record<DietType, number> = {
  vegan: 0.7,
  vegetarian: 1.1,
  "low-meat": 1.5,
  "heavy-meat": 2.5,
};

export const ENERGY_EF = 0.42; // kg CO2e per kWh
export const WATER_EF = 0.34;

// Baselines (annual tons)
export const US_AVG_TONS = 16.0;
export const GLOBAL_AVG_TONS = 4.0;

export function tierFor(prevented: number): Tier {
  if (prevented >= 500) return "Diamond";
  if (prevented >= 250) return "Emerald";
  if (prevented >= 100) return "Gold";
  if (prevented >= 40) return "Silver";
  return "Bronze";
}

export function levelFor(xp: number) {
  return Math.floor(xp / 250) + 1;
}

export function xpToNextLevel(xp: number) {
  const lvl = levelFor(xp);
  const next = lvl * 250;
  return { current: xp - (lvl - 1) * 250, needed: 250, total: next };
}

export function calcBaseline(
  housing: UserProfile["housing"],
  diet: DietType,
  commute: TransportMode,
  shopping: UserProfile["shopping"],
): number {
  const housingTons = housing === "small" ? 2 : housing === "medium" ? 4 : 7;
  const dietTons = DIET_EF[diet] * 365 * 0.001 * 1.5;
  const commuteTons = (TRANSPORT_EF[commute] * 30 * 365) / 1000;
  const shoppingTons = shopping === "low" ? 1 : shopping === "medium" ? 2.5 : 5;
  return +(housingTons + dietTons + commuteTons + shoppingTons).toFixed(2);
}

const id = () => Math.random().toString(36).slice(2, 10);

export function labelMode(m: TransportMode): string {
  return { ev: "EV drive", ice: "car drive", public: "transit", bike: "cycling", walk: "walking" }[m];
}
export function labelDiet(d: DietType): string {
  return { vegan: "Vegan", vegetarian: "Vegetarian", "low-meat": "Low-meat", "heavy-meat": "Heavy-meat" }[d];
}

export function defaultQuests(): Quest[] {
  return [
    { id: "q1", title: "Meatless Monday", description: "Log a vegan or vegetarian meal today", cadence: "daily", xp: 50, credits: 20, target: 1, progress: 0, completed: false, icon: "🥗" },
    { id: "q2", title: "Zero-Emission Commute", description: "Take 3 bike/walk/transit trips this week", cadence: "weekly", xp: 150, credits: 60, target: 3, progress: 0, completed: false, icon: "🚲" },
    { id: "q3", title: "Phantom Power Purge", description: "Stay under 8 kWh for 5 days", cadence: "weekly", xp: 200, credits: 80, target: 5, progress: 0, completed: false, icon: "🔌" },
    { id: "q4", title: "EV Evangelist", description: "Log 10 EV/transit trips this month", cadence: "monthly", xp: 400, credits: 200, target: 10, progress: 0, completed: false, icon: "⚡" },
    { id: "q5", title: "Hydro Hero", description: "Cut water usage 3 days in a row", cadence: "weekly", xp: 120, credits: 40, target: 3, progress: 0, completed: false, icon: "💧" },
    { id: "q6", title: "Solar Sovereign", description: "30 days of below-baseline emissions", cadence: "monthly", xp: 800, credits: 400, target: 30, progress: 0, completed: false, icon: "☀️" },
  ];
}

export function defaultRewards(): Reward[] {
  return [
    { id: "r1", name: "EcoPulse Sticker Pack", description: "Premium die-cut vinyl stickers", cost: 100, emoji: "🪧", category: "gear" },
    { id: "r2", name: "Bamboo Notebook", description: "Carbon-neutral developer journal", cost: 300, emoji: "📓", category: "gear" },
    { id: "r3", name: "Organic Cotton Tee", description: "EcoPulse signature tee", cost: 800, emoji: "👕", category: "gear" },
    { id: "r4", name: "Plant a Tree", description: "We plant a real tree in your name", cost: 250, emoji: "🌳", category: "donation" },
    { id: "r5", name: "10 Trees Bundle", description: "Reforest a small patch", cost: 2000, emoji: "🌲", category: "donation" },
    { id: "r6", name: "Allbirds 15% Off", description: "Discount code for sustainable shoes", cost: 500, emoji: "👟", category: "discount" },
    { id: "r7", name: "Patagonia 10% Off", description: "Outdoor gear discount", cost: 600, emoji: "🧥", category: "discount" },
    { id: "r8", name: "Tesla Supercharge Credit", description: "$10 charging credit", cost: 1500, emoji: "⚡", category: "discount" },
  ];
}

export function defaultLeaderboard(profileName = "You", avatar = "🌱"): LeaderboardEntry[] {
  return [
    { id: "you", name: profileName, avatar, prevented: 0, streak: 0, tier: "Bronze", isYou: true },
  ];
}

export function defaultProfile(): UserProfile {
  return {
    name: "You",
    avatar: "🌱",
    baselineAnnualTons: 0,
    xp: 0,
    level: 1,
    credits: 0,
    streak: 0,
    tier: "Bronze",
    onboarded: false,
    housing: "medium",
    diet: "low-meat",
    commute: "public",
    shopping: "medium",
  };
}

export function defaultState(): AppState {
  return {
    profile: defaultProfile(),
    activities: [],
    quests: defaultQuests(),
    badges: defaultBadges(),
    rewards: defaultRewards(),
    leaderboard: defaultLeaderboard(),
    pendingUnlocks: [],
  };
}

// AI Carbon Assistant — natural language parser
export function parseNaturalLanguage(text: string): Activity[] {
  const lower = text.toLowerCase();
  const acts: Activity[] = [];
  const now = Date.now();

  const kmMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|mi)\b/);
  if (kmMatch) {
    const num = parseFloat(kmMatch[1]);
    const km = /mile/.test(kmMatch[0]) ? num * 1.609 : num;
    let mode: TransportMode = "ice";
    if (/metro|subway|bus|train|transit|tram/.test(lower)) mode = "public";
    else if (/ev|electric|tesla/.test(lower)) mode = "ev";
    else if (/bike|cycl|bicycl/.test(lower)) mode = "bike";
    else if (/walk|walked|walking/.test(lower)) mode = "walk";
    else if (/car|drove|driving|uber|taxi/.test(lower)) mode = "ice";
    acts.push({
      id: id(),
      category: "transport",
      label: `${km.toFixed(1)}km ${labelMode(mode)}`,
      co2eKg: +(km * TRANSPORT_EF[mode]).toFixed(2),
      timestamp: now,
      meta: { mode, km: +km.toFixed(1) },
    });
  }

  let diet: DietType | null = null;
  if (/vegan/.test(lower)) diet = "vegan";
  else if (/vegetarian|veggie/.test(lower)) diet = "vegetarian";
  else if (/chicken|fish|salmon|low.?meat/.test(lower)) diet = "low-meat";
  else if (/beef|steak|burger|lamb|pork|heavy.?meat/.test(lower)) diet = "heavy-meat";
  if (diet || /\b(ate|eat|meal|lunch|dinner|breakfast|salad)\b/.test(lower)) {
    const d = diet ?? "low-meat";
    acts.push({
      id: id(),
      category: "diet",
      label: `${labelDiet(d)} meal`,
      co2eKg: +DIET_EF[d].toFixed(2),
      timestamp: now,
      meta: { diet: d },
    });
  }

  const kwhMatch = lower.match(/(\d+(?:\.\d+)?)\s*kwh/);
  if (kwhMatch) {
    const kwh = parseFloat(kwhMatch[1]);
    acts.push({
      id: id(),
      category: "energy",
      label: `${kwh} kWh energy`,
      co2eKg: +(kwh * ENERGY_EF).toFixed(2),
      timestamp: now,
      meta: { kwh },
    });
  }

  return acts;
}

// Aggregations
export function totalByDay(activities: Activity[], days = 30) {
  const buckets: { date: string; total: number; label: string }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = d.getTime() + 86400000;
    const total = activities
      .filter((a) => a.timestamp >= d.getTime() && a.timestamp < next)
      .reduce((s, a) => s + a.co2eKg, 0);
    buckets.push({
      date: d.toISOString().slice(5, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      total: +total.toFixed(2),
    });
  }
  return buckets;
}

export function totalByCategory(activities: Activity[]) {
  const cats: Record<string, number> = { transport: 0, diet: 0, energy: 0, shopping: 0 };
  for (const a of activities) cats[a.category] = (cats[a.category] ?? 0) + a.co2eKg;
  return Object.entries(cats).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
}

export function totalEmissionsKg(activities: Activity[]) {
  return +activities.reduce((s, a) => s + a.co2eKg, 0).toFixed(2);
}

// Equivalencies
export function equivalencies(kgSaved: number) {
  const safe = Number.isFinite(kgSaved) ? Math.max(0, kgSaved) : 0;
  return {
    trees: Math.round(safe / 21),
    phoneCharges: Math.round(safe * 121),
    kmDriven: Math.round(safe / 0.21),
    burgers: Math.round(safe / 2.5),
  };
}
