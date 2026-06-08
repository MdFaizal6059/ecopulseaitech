import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useEco } from "@/lib/eco/store";
import { totalByCategory, totalByDay } from "@/lib/eco/calc";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CAT_COLORS: Record<string, string> = {
  transport: "#10B981",
  diet: "#34D399",
  energy: "#06B6D4",
  shopping: "#F59E0B",
};

export function Analytics() {
  const { state } = useEco();
  const weekly = useMemo(() => totalByDay(state.activities, 7), [state.activities]);
  const monthly = useMemo(() => totalByDay(state.activities, 30), [state.activities]);
  const cats = useMemo(() => totalByCategory(state.activities), [state.activities]);
  const top = useMemo(() => [...state.activities].sort((a, b) => b.co2eKg - a.co2eKg).slice(0, 8), [state.activities]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400/70">Insights</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Analytics</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 text-sm font-semibold text-foreground">Weekly trend</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0B132B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 text-sm font-semibold text-foreground">Category breakdown</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {cats.map((c) => <Cell key={c.name} fill={CAT_COLORS[c.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0B132B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">30-day emission trend</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval={2} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0B132B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="total" fill="#34D399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 text-sm font-semibold text-foreground">Top emitting activities</div>
        <ul className="space-y-2">
          {top.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{({ transport: "🚗", diet: "🥗", energy: "💡", shopping: "🛍️" } as Record<string, string>)[a.category]}</span>
                <div>
                  <div className="text-sm text-foreground">{a.label}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-rose-300">{a.co2eKg.toFixed(2)} kg</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
