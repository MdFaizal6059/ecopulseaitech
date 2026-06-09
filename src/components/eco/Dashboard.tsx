import { useMemo } from "react";
import { useEco } from "@/lib/eco/store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingDown, TrendingUp, Zap, Sprout, Smartphone, Car as CarIcon, UtensilsCrossed, Flame } from "lucide-react";
import { GLOBAL_AVG_TONS, US_AVG_TONS, equivalencies, totalByDay, totalEmissionsKg, xpToNextLevel } from "@/lib/eco/calc";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AIAssistant } from "./AIAssistant";
import { badgeMeta, upcomingMilestones } from "@/lib/eco/badges";
import { useServerFn } from "@tanstack/react-start";
import { sendNotification } from "@/lib/notifications/email.functions";
import { toast } from "sonner";

export function Dashboard() {
  const { state, redeemedCount } = useEco();
  const last7 = useMemo(() => totalByDay(state.activities, 7), [state.activities]);
  const last30 = useMemo(() => totalByDay(state.activities, 30), [state.activities]);
  const monthly = useMemo(() => totalEmissionsKg(state.activities.filter(a => a.timestamp > Date.now() - 30 * 86400000)), [state.activities]);
  const baselineMonthly = (state.profile.baselineAnnualTons * 1000) / 12;
  const savedThisMonth = Math.max(0, baselineMonthly - monthly);
  const eq = equivalencies(savedThisMonth);
  const xp = xpToNextLevel(state.profile.xp);
  const upcoming = upcomingMilestones(state, redeemedCount);

  const send = useServerFn(sendNotification);
  const protectStreak = async () => {
    const t = toast.loading("Sending streak reminder…");
    const res = await send({ data: { kind: "streak_reminder", data: { streak: state.profile.streak } } });
    toast.dismiss(t);
    if (res.ok) toast.success("Reminder sent to your inbox 📬");
    else toast.error("Couldn't send email", { description: res.error });
  };

  const weeklyDelta = useMemo(() => {
    const thisWeek = last7.reduce((s, d) => s + d.total, 0);
    const prev = totalByDay(state.activities, 14).slice(0, 7).reduce((s, d) => s + d.total, 0);
    return prev > 0 ? +((thisWeek - prev) / prev * 100).toFixed(1) : 0;
  }, [state.activities, last7]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-400/70">Welcome back, {state.profile.name}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Your carbon pulse</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-amber-300">
            🔥 {state.profile.streak}-day streak
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
            💎 {state.profile.tier} tier
          </div>
          {state.profile.streak > 0 && (
            <Button size="sm" onClick={protectStreak} variant="outline" className="h-7 gap-1.5 border-amber-400/30 bg-amber-400/5 text-amber-200 hover:bg-amber-400/10">
              <Flame className="h-3.5 w-3.5" /> Protect streak
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative col-span-2 overflow-hidden border-emerald-500/20 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-emerald-950/30 p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">This month's footprint</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="bg-gradient-to-br from-emerald-300 to-cyan-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                    {monthly.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">kg CO₂e</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Baseline: {baselineMonthly.toFixed(0)} kg · <span className="text-emerald-400">{savedThisMonth.toFixed(0)} kg saved</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${weeklyDelta <= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                {weeklyDelta <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {Math.abs(weeklyDelta)}% vs last week
              </div>
            </div>

            <div className="mt-6 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "#0B132B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} />
                  <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Level {state.profile.level}</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{state.profile.xp} XP</div>
          <div className="mt-1 text-xs text-muted-foreground">{xp.needed - xp.current} XP to Lv {state.profile.level + 1}</div>
          <Progress value={(xp.current / xp.needed) * 100} className="mt-4 h-2 bg-white/5" />
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-muted-foreground">Credits</div>
              <div className="mt-1 text-xl font-semibold text-emerald-300">⊙ {state.profile.credits}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-muted-foreground">Activities</div>
              <div className="mt-1 text-xl font-semibold text-foreground">{state.activities.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Milestones rail */}
      {upcoming.length > 0 && (
        <Card className="border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Next milestones</div>
              <div className="mt-1 text-lg font-semibold text-foreground">Badges within reach</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {upcoming.map(({ meta, current, pct }) => (
              <div key={meta.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <img src={meta.artUrl} alt={meta.name} width={1024} height={1024} loading="lazy" className="h-14 w-14 shrink-0 object-contain opacity-60" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{meta.name}</div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{meta.criteria}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1 bg-white/5" />
                    <span className="text-[10px] tabular-nums text-muted-foreground">{current}/{meta.milestone.threshold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <ComparisonCard label="You" value={state.profile.baselineAnnualTons} tone="emerald" />
        <ComparisonCard label="Global avg" value={GLOBAL_AVG_TONS} tone="cyan" />
        <ComparisonCard label="US avg" value={US_AVG_TONS} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="col-span-2 border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Real-world impact</div>
              <div className="mt-1 text-lg font-semibold text-foreground">Your monthly savings equal…</div>
            </div>
            <Leaf className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Equiv icon={<Sprout className="h-4 w-4" />} value={eq.trees} unit="tree seedlings (10y)" />
            <Equiv icon={<Smartphone className="h-4 w-4" />} value={eq.phoneCharges.toLocaleString()} unit="phone charges" />
            <Equiv icon={<CarIcon className="h-4 w-4" />} value={`${eq.kmDriven.toLocaleString()}`} unit="km not driven" />
            <Equiv icon={<UtensilsCrossed className="h-4 w-4" />} value={eq.burgers} unit="beef burgers skipped" />
          </div>
        </Card>

        <AIAssistant />
      </div>

      <Card className="border-white/10 bg-white/[0.02] p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Recent activity</div>
          <Zap className="h-4 w-4 text-emerald-400" />
        </div>
        {state.activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">No activities yet</div>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
              Log a trip, meal, or kWh to see your dashboard, analytics, and leaderboard come to life.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {state.activities.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{iconFor(a.category)}</span>
                  <div>
                    <div className="text-sm text-foreground">{a.label}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${a.co2eKg > 2 ? "text-rose-300" : a.co2eKg > 0.5 ? "text-amber-300" : "text-emerald-300"}`}>
                  {a.co2eKg.toFixed(2)} kg
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ComparisonCard({ label, value, tone }: { label: string; value: number; tone: "emerald" | "cyan" | "amber" }) {
  const colors = {
    emerald: "from-emerald-400 to-teal-400 text-emerald-300 border-emerald-500/30",
    cyan: "from-cyan-400 to-sky-400 text-cyan-300 border-cyan-500/30",
    amber: "from-amber-400 to-orange-400 text-amber-300 border-amber-500/30",
  }[tone];
  return (
    <Card className={`border bg-white/[0.02] p-5 ${colors.split(" ").slice(-1)}`}>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 bg-gradient-to-r ${colors} bg-clip-text text-3xl font-bold text-transparent`}>{value}t</div>
      <div className="text-xs text-muted-foreground">CO₂e / year</div>
    </Card>
  );
}

function Equiv({ icon, value, unit }: { icon: React.ReactNode; value: number | string; unit: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-emerald-400">{icon}<span className="text-[10px] uppercase tracking-widest">Impact</span></div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{unit}</div>
    </div>
  );
}

function iconFor(c: string) {
  return { transport: "🚗", diet: "🥗", energy: "💡", shopping: "🛍️" }[c] ?? "🌱";
}
