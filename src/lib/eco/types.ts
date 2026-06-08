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

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  emoji: string;
  criteria: string;
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
  baselineAnnualTons: number; // baseline annual CO2e tons
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
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  prevented: number; // kg co2e
  streak: number;
  tier: Tier;
  isYou?: boolean;
}

export interface AppState {
  profile: UserProfile;
  activities: Activity[];
  quests: Quest[];
  badges: Badge[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
}
