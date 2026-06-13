import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Trophy,
  Gift,
  Crown,
  Leaf,
  User,
  Award,
} from "lucide-react";
import { useEco } from "@/lib/eco/store";
import type { ViewKey } from "./types";

const items: { key: ViewKey; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "log", label: "Log Activity", icon: PlusCircle },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "quests", label: "Eco-Quests", icon: Trophy },
    { key: "market", label: "Marketplace", icon: Gift },
    { key: "leaderboard", label: "Leaderboard", icon: Crown },
  ];

export function Sidebar({
  active,
  onChange,
  onSettings,
  onSubmission,
}: {
  active: ViewKey;
  onChange: (k: ViewKey) => void;
  onSettings: () => void;
  onSubmission: () => void;
}) {
  const { state } = useEco();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
            <Leaf className="h-5 w-5" />
          </div>
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-foreground">EcoPulse AI</div>
          <div className="text-[10px] uppercase tracking-widest text-emerald-400/70">
            v1.0 · Live
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
              active === key
                ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            }`}
          >
            <Icon className={`h-4 w-4 ${active === key ? "text-emerald-400" : ""}`} />
            <span className="font-medium">{label}</span>
            {active === key && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      <button
        onClick={onSubmission}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/[0.04] hover:text-foreground"
      >
        <Award className="h-4 w-4" />
        Submission Portal
      </button>
      <button
        onClick={onSettings}
        className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/[0.04] hover:text-foreground"
      >
        <User className="h-4 w-4" />
        Account & profile
      </button>

      <button
        onClick={onSettings}
        className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-3 text-left transition-all hover:border-emerald-400/30"
      >
        <div className="flex items-center gap-2">
          <div className="text-2xl">{state.profile.avatar}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {state.profile.name}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="text-emerald-400">Lv {state.profile.level}</span> ·{" "}
              <span>{state.profile.tier}</span> · <span>🔥{state.profile.streak}d</span>
            </div>
          </div>
        </div>
      </button>
    </aside>
  );
}

export function MobileNav({
  active,
  onChange,
}: {
  active: ViewKey;
  onChange: (k: ViewKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-slate-950/80 px-2 py-2 backdrop-blur-xl md:hidden">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors ${
            active === key ? "text-emerald-400" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
