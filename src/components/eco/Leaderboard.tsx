import { Card } from "@/components/ui/card";
import { useEco } from "@/lib/eco/store";
import { Crown } from "lucide-react";

const TIER_COLOR: Record<string, string> = {
  Diamond: "from-cyan-300 to-sky-500",
  Emerald: "from-emerald-300 to-teal-500",
  Gold: "from-amber-300 to-yellow-500",
  Silver: "from-slate-200 to-slate-400",
  Bronze: "from-orange-300 to-amber-600",
};

export function Leaderboard() {
  const { state } = useEco();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400/70">Social proof</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Global Leaderboard</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {state.leaderboard.slice(0, 3).map((e, i) => (
          <Card key={e.id} className={`relative overflow-hidden border-white/10 bg-white/[0.02] p-5 ${e.isYou ? "ring-2 ring-emerald-400/40" : ""}`}>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${TIER_COLOR[e.tier]} text-2xl`}>
                {e.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {i === 0 && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                  #{i + 1} {e.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{e.tier} · 🔥 {e.streak}d</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-emerald-300">{e.prevented}</div>
                <div className="text-[10px] text-muted-foreground">kg prevented</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/[0.02] p-2">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2">Tier</div>
          <div className="col-span-1">Streak</div>
          <div className="col-span-2 text-right">CO₂e prevented</div>
        </div>
        <div className="divide-y divide-white/5">
          {state.leaderboard.map((e, i) => (
            <div key={e.id} className={`grid grid-cols-12 items-center px-4 py-3 text-sm transition-colors ${e.isYou ? "bg-emerald-500/10" : "hover:bg-white/[0.03]"}`}>
              <div className="col-span-1 font-mono text-muted-foreground">{i + 1}</div>
              <div className="col-span-6 flex items-center gap-2">
                <span className="text-xl">{e.avatar}</span>
                <span className={`font-medium ${e.isYou ? "text-emerald-300" : "text-foreground"}`}>{e.name} {e.isYou && <span className="ml-1 rounded-full bg-emerald-400/20 px-2 text-[10px] text-emerald-300">YOU</span>}</span>
              </div>
              <div className="col-span-2">
                <span className={`bg-gradient-to-r ${TIER_COLOR[e.tier]} bg-clip-text text-xs font-semibold text-transparent`}>{e.tier}</span>
              </div>
              <div className="col-span-1 text-xs text-amber-300">🔥{e.streak}</div>
              <div className="col-span-2 text-right text-sm font-semibold text-foreground">{e.prevented} kg</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
