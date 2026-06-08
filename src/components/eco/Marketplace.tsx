import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEco } from "@/lib/eco/store";
import { toast } from "sonner";

export function Marketplace() {
  const { state, redeemReward } = useEco();
  const redeem = (id: string, name: string) => {
    const ok = redeemReward(id);
    if (ok) toast.success(`Redeemed: ${name}`, { description: "You'll receive details by email." });
    else toast.error("Not enough credits", { description: "Complete more quests to earn." });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-400/70">Swag Store</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Marketplace</h1>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
          Balance: ⊙ {state.profile.credits}
        </div>
      </div>

      {(["gear", "discount", "donation"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{cat === "gear" ? "Developer gear" : cat === "discount" ? "Brand discounts" : "Real-world impact"}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {state.rewards.filter(r => r.category === cat).map((r) => {
              const affordable = state.profile.credits >= r.cost;
              return (
                <Card key={r.id} className="flex flex-col border-white/10 bg-white/[0.02] p-5">
                  <div className="text-5xl">{r.emoji}</div>
                  <div className="mt-3 font-semibold text-foreground">{r.name}</div>
                  <div className="mt-1 flex-1 text-xs text-muted-foreground">{r.description}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-300">⊙ {r.cost}</span>
                    <Button onClick={() => redeem(r.id, r.name)} disabled={!affordable} size="sm" className={affordable ? "bg-emerald-500 text-white hover:bg-emerald-400" : ""} variant={affordable ? "default" : "outline"}>
                      Redeem
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
