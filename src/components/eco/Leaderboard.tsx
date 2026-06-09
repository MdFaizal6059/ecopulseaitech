import { Card } from "@/components/ui/card";
import { useEco } from "@/lib/eco/store";
import { Crown, Users } from "lucide-react";
import { badgeMeta } from "@/lib/eco/badges";

const TIER_COLOR: Record<string, string> = {
  Diamond: "from-cyan-300 to-sky-500",
  Emerald: "from-emerald-300 to-teal-500",
  Gold: "from-amber-300 to-yellow-500",
  Silver: "from-slate-200 to-slate-400",
  Bronze: "from-orange-300 to-amber-600",
};

export function Leaderboard() {
  const { state } = useEco();
  const entries = state.leaderboard;
  const isLonely = entries.length <= 1;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400/70">Social proof</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Global Leaderboard</h1>
      </div>

      {isLonely && (
        <Card className="border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm font-semibold text-foreground">Be the first to set the pace</div>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            EcoPulse AI just launched — friends you invite will show up here as they log activities. For now, prevented CO₂ is the metric. Log your first action to start climbing.
          </p>
        </Card>
      )}

      <Card className="border-white/10 bg-white/[0.02] p-2">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2">Tier</div>
          <div className="col-span-1">Streak</div>
          <div className="col-span-2 text-right">CO₂e prevented</div>
        </div>
        <div className="divide-y divide-white/5">
          {entries.map((e, i) => {
            const pinned = e.pinnedBadge ? badgeMeta(e.pinnedBadge) : null;
            return (
              <div key={e.id} className={`grid grid-cols-12 items-center px-4 py-3 text-sm transition-colors ${e.isYou ? "bg-emerald-500/10" : "hover:bg-white/[0.03]"}`}>
                <div className="col-span-1 font-mono text-muted-foreground">{i + 1}{i === 0 && <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-400" />}</div>
                <div className="col-span-6 flex items-center gap-2">
                  <span className="text-xl">{e.avatar}</span>
                  <span className={`font-medium ${e.isYou ? "text-emerald-300" : "text-foreground"}`}>
                    {e.name} {e.isYou && <span className="ml-1 rounded-full bg-emerald-400/20 px-2 text-[10px] text-emerald-300">YOU</span>}
                  </span>
                  {pinned && (
                    <img src={pinned.artUrl} alt={pinned.name} width={1024} height={1024} loading="lazy" className="h-6 w-6 object-contain" title={pinned.name} />
                  )}
                </div>
                <div className="col-span-2">
                  <span className={`bg-gradient-to-r ${TIER_COLOR[e.tier]} bg-clip-text text-xs font-semibold text-transparent`}>{e.tier}</span>
                </div>
                <div className="col-span-1 text-xs text-amber-300">🔥{e.streak}</div>
                <div className="col-span-2 text-right text-sm font-semibold text-foreground">{e.prevented} kg</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
