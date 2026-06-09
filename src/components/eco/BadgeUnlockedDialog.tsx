import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEco } from "@/lib/eco/store";
import { badgeMeta } from "@/lib/eco/badges";
import { Confetti } from "./Confetti";
import { useEffect, useState } from "react";

export function BadgeUnlockedDialog() {
  const { state, acknowledgeUnlock } = useEco();
  const pendingId = state.pendingUnlocks[0];
  const meta = pendingId ? badgeMeta(pendingId) : undefined;
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    if (pendingId) setConfetti(Date.now());
  }, [pendingId]);

  if (!meta) return null;

  return (
    <Dialog open={!!pendingId} onOpenChange={(o) => { if (!o) acknowledgeUnlock(); }}>
      <DialogContent className="max-w-md overflow-hidden border-emerald-500/30 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 p-0">
        <Confetti trigger={confetti} />
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300">New badge unlocked</div>
            <div className="mx-auto mt-4 flex h-44 w-44 items-center justify-center">
              <img
                src={meta.artUrl}
                alt={meta.name}
                width={1024}
                height={1024}
                className="h-full w-full object-contain drop-shadow-[0_15px_35px_rgba(16,185,129,0.35)]"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{meta.name}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{meta.description}</p>
            <div className="mt-2 text-[11px] uppercase tracking-widest text-emerald-400/80">{meta.criteria}</div>
            <Button onClick={acknowledgeUnlock} className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              Awesome — keep going
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
