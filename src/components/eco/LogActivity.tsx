import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useEco } from "@/lib/eco/store";
import { DIET_EF, ENERGY_EF, TRANSPORT_EF, WATER_EF, labelDiet, labelMode } from "@/lib/eco/calc";
import type { Activity, DietType, TransportMode } from "@/lib/eco/types";
import { toast } from "sonner";
import { Car, Utensils, Zap, Droplet, Plus } from "lucide-react";
import { AIAssistant } from "./AIAssistant";

const id = () => Math.random().toString(36).slice(2, 10);

export function LogActivity() {
  const { addActivity } = useEco();
  const [km, setKm] = useState(5);
  const [mode, setMode] = useState<TransportMode>("public");
  const [diet, setDiet] = useState<DietType>("low-meat");
  const [meals, setMeals] = useState(1);
  const [kwh, setKwh] = useState(8);
  const [water, setWater] = useState(0.2);

  const log = (a: Omit<Activity, "id" | "timestamp">) => {
    addActivity({ ...a, id: id(), timestamp: Date.now() });
    toast.success(`Logged · ${a.co2eKg.toFixed(2)} kg CO₂e`, { description: a.label });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400/70">Quick Log</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          What did you do today?
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 border-white/10 bg-white/[0.02] p-6">
          <Tabs defaultValue="transport">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger value="transport">
                <Car className="mr-1.5 h-3.5 w-3.5" />
                Transport
              </TabsTrigger>
              <TabsTrigger value="diet">
                <Utensils className="mr-1.5 h-3.5 w-3.5" />
                Diet
              </TabsTrigger>
              <TabsTrigger value="energy">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Energy
              </TabsTrigger>
              <TabsTrigger value="water">
                <Droplet className="mr-1.5 h-3.5 w-3.5" />
                Water
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transport" className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["walk", "bike", "public", "ev", "ice"] as TransportMode[]).map((m) => (
                  <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                    {labelMode(m)}{" "}
                    <span className="ml-1 text-[10px] opacity-60">{TRANSPORT_EF[m]} kg/km</span>
                  </Chip>
                ))}
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm text-muted-foreground">Distance</label>
                  <div className="text-2xl font-semibold text-foreground">
                    {km} <span className="text-sm text-muted-foreground">km</span>
                  </div>
                </div>
                <Slider
                  value={[km]}
                  onValueChange={(v) => setKm(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-3"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-sm text-muted-foreground">Estimated emission</span>
                <span className="text-xl font-semibold text-emerald-300">
                  {(km * TRANSPORT_EF[mode]).toFixed(2)} kg CO₂e
                </span>
              </div>
              <Button
                onClick={() =>
                  log({
                    category: "transport",
                    label: `${km}km ${labelMode(mode)}`,
                    co2eKg: +(km * TRANSPORT_EF[mode]).toFixed(2),
                    meta: { mode, km },
                  })
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110"
              >
                <Plus className="mr-2 h-4 w-4" /> Log trip
              </Button>
            </TabsContent>

            <TabsContent value="diet" className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["vegan", "vegetarian", "low-meat", "heavy-meat"] as DietType[]).map((d) => (
                  <Chip key={d} active={diet === d} onClick={() => setDiet(d)}>
                    {labelDiet(d)}{" "}
                    <span className="ml-1 text-[10px] opacity-60">{DIET_EF[d]} kg/meal</span>
                  </Chip>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Meals</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={meals}
                  onChange={(e) => setMeals(Math.max(1, Number(e.target.value)))}
                  className="w-24 bg-white/5"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-sm text-muted-foreground">Estimated emission</span>
                <span className="text-xl font-semibold text-emerald-300">
                  {(meals * DIET_EF[diet]).toFixed(2)} kg CO₂e
                </span>
              </div>
              <Button
                onClick={() =>
                  log({
                    category: "diet",
                    label: `${meals}× ${labelDiet(diet)} meal`,
                    co2eKg: +(meals * DIET_EF[diet]).toFixed(2),
                    meta: { diet, meals },
                  })
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Log meal
              </Button>
            </TabsContent>

            <TabsContent value="energy" className="mt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm text-muted-foreground">Smart meter (today)</label>
                  <div className="text-2xl font-semibold text-foreground">
                    {kwh} <span className="text-sm text-muted-foreground">kWh</span>
                  </div>
                </div>
                <Slider
                  value={[kwh]}
                  onValueChange={(v) => setKwh(v[0])}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-3"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-sm text-muted-foreground">Estimated emission</span>
                <span className="text-xl font-semibold text-emerald-300">
                  {(kwh * ENERGY_EF).toFixed(2)} kg CO₂e
                </span>
              </div>
              <Button
                onClick={() =>
                  log({
                    category: "energy",
                    label: `${kwh} kWh home energy`,
                    co2eKg: +(kwh * ENERGY_EF).toFixed(2),
                    meta: { kwh },
                  })
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Log energy
              </Button>
            </TabsContent>

            <TabsContent value="water" className="mt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm text-muted-foreground">Water (today)</label>
                  <div className="text-2xl font-semibold text-foreground">
                    {(water * 1000).toFixed(0)}{" "}
                    <span className="text-sm text-muted-foreground">L</span>
                  </div>
                </div>
                <Slider
                  value={[water]}
                  onValueChange={(v) => setWater(v[0])}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-3"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-sm text-muted-foreground">Estimated emission</span>
                <span className="text-xl font-semibold text-emerald-300">
                  {(water * WATER_EF).toFixed(2)} kg CO₂e
                </span>
              </div>
              <Button
                onClick={() =>
                  log({
                    category: "energy",
                    label: `${(water * 1000).toFixed(0)}L water`,
                    co2eKg: +(water * WATER_EF).toFixed(2),
                    meta: { water },
                  })
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Log water
              </Button>
            </TabsContent>
          </Tabs>
        </Card>

        <AIAssistant />
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
        active
          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
