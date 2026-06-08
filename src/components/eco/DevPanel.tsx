import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, X, Leaf, Flame, RotateCcw } from "lucide-react";
import { useEco } from "@/lib/eco/store";
import { toast } from "sonner";

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const { resetTo, state } = useEco();

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-emerald-400 shadow-2xl backdrop-blur-xl transition-all hover:scale-110 hover:border-emerald-400/40 md:bottom-6"
        aria-label="Dev panel"
      >
        <Settings2 className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-40 w-80 rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-2xl md:bottom-24">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-emerald-400/70">Dev Mode</div>
              <div className="text-sm font-semibold text-foreground">Validation Panel</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Simulate profile shifts to verify real-time recalibration.</p>

          <div className="mt-4 space-y-2">
            <Button
              onClick={() => { resetTo("low"); toast.success("Switched to Low-Carbon Champion"); setOpen(false); }}
              className="w-full justify-start bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
            >
              <Leaf className="mr-2 h-4 w-4" /> Low-Carbon Champion
            </Button>
            <Button
              onClick={() => { resetTo("high"); toast.success("Switched to Heavy Fossil Fuel"); setOpen(false); }}
              className="w-full justify-start bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
            >
              <Flame className="mr-2 h-4 w-4" /> Heavy Fossil Fuel Base
            </Button>
            <Button
              onClick={() => { resetTo("default"); toast.success("Reset to balanced default"); setOpen(false); }}
              variant="outline"
              className="w-full justify-start border-white/15 bg-white/5"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset to Default
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
            <div className="font-mono">
              baseline: {state.profile.baselineAnnualTons}t · xp: {state.profile.xp} · credits: {state.profile.credits} · streak: {state.profile.streak}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
