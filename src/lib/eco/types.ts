export type Category = "transport" | "diet" | "energy" | "shopping";

export type TransportMode = "ev" | "ice" | "public" | "bike" | "walk";
export type DietType = "vegan" | "vegetarian" | "low-meat" | "heavy-meat";

export interface Activity {
  id: string;
  category: Category;
  label: string;
  co2eKg: number; // negative = savings vs baseline
  timestamp: number;
  meta?: Record<string, string | number>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly" | "monthly";
  xp: number;
  credits: number;
  target: number;
  progress: number;
  completed: boolean;
  icon: string;
}

/**
 * Stored badge state only — display metadata (name, description, art) lives
 * in `BADGE_REGISTRY` (src/lib/eco/badges.ts). Render code merges them.
 */
export interface Badge {
  id: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  category: "gear" | "discount" | "donation";
}

export type Tier = "Bronze" | "Silver" | "Gold" | "Emerald" | "Diamond";

export interface UserProfile {
  name: string;
  avatar: string;
  baselineAnnualTons: number;
  xp: number;
  level: number;
  credits: number;
  streak: number;
  tier: Tier;
  onboarded: boolean;
  housing: "small" | "medium" | "large";
  diet: DietType;
  commute: TransportMode;
  shopping: "low" | "medium" | "high";
  pinnedBadge?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  prevented: number;
  streak: number;
  tier: Tier;
  isYou?: boolean;
  pinnedBadge?: string;
}

export interface AppState {
  profile: UserProfile;
  activities: Activity[];
  quests: Quest[];
  badges: Badge[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
  pendingUnlocks: string[];
}
