import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEco } from "@/lib/eco/store";
import { Confetti } from "./Confetti";
import { toast } from "sonner";

export function Quests() {
  const { state, completeQuest, setState } = useEco();
  const [confetti, setConfetti] = useState(0);

  const advance = (id: string) => {
    setState((s) => {
      const quests = s.quests.map((q) => {
        if (q.id !== id || q.completed) return q;
        const progress = Math.min(q.target, q.progress + 1);
        return { ...q, progress, completed: progress >= q.target };
      });
      return { ...s, quests };
    });
  };

  const claim = (id: string) => {
    const q = state.quests.find((x) => x.id === id);
    if (!q) return;
    completeQuest(id);
    setConfetti(Date.now());
    toast.success(`Quest complete: ${q.title}`, { description: `+${q.xp} XP · +${q.credits} credits` });
  };

  const grouped = { daily: state.quests.filter(q => q.cadence === "daily"), weekly: state.quests.filter(q => q.cadence === "weekly"), monthly: state.quests.filter(q => q.cadence === "monthly") };

  return (
    <div className="space-y-6">
      <Confetti trigger={confetti} />
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400/70">Gamification</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Eco-Quests</h1>
      </div>

      {(["daily", "weekly", "monthly"] as const).map((cad) => (
        <section key={cad} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{cad}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {grouped[cad].map((q) => {
              const pct = (q.progress / q.target) * 100;
              return (
                <Card key={q.id} className={`relative overflow-hidden border-white/10 bg-white/[0.02] p-5 ${q.completed ? "border-emerald-400/40 bg-emerald-500/5" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{q.icon}</div>
                    <div className="flex gap-1">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">+{q.xp} XP</span>
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-300">⊙ {q.credits}</span>
                    </div>
                  </div>
                  <div className="mt-3 font-semibold text-foreground">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.description}</div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>{q.progress}/{q.target}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-white/5" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    {q.completed ? (
                      <Button disabled className="w-full bg-emerald-500/20 text-emerald-300">✓ Completed</Button>
                    ) : q.progress >= q.target ? (
                      <Button onClick={() => claim(q.id)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Claim reward</Button>
                    ) : (
                      <Button onClick={() => advance(q.id)} variant="outline" className="w-full border-white/15 bg-white/5">+1 progress</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {state.badges.map((b) => (
            <Card key={b.id} className={`p-4 text-center ${b.unlocked ? "border-emerald-400/40 bg-emerald-500/5" : "border-white/10 bg-white/[0.02] opacity-60"}`}>
              <div className="text-4xl">{b.emoji}</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.criteria}</div>
              <div className={`mt-2 text-[10px] uppercase tracking-widest ${b.unlocked ? "text-emerald-400" : "text-muted-foreground"}`}>
                {b.unlocked ? "Unlocked" : "Locked"}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
