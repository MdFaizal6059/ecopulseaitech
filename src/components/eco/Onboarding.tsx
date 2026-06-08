import { useState } from "react";
import { useEco } from "@/lib/eco/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GLOBAL_AVG_TONS, US_AVG_TONS, calcBaseline } from "@/lib/eco/calc";
import { Leaf, Home, Car, Utensils, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { DietType, TransportMode, UserProfile } from "@/lib/eco/types";

const steps = ["Welcome", "Housing", "Transport", "Diet", "Shopping", "Result"] as const;

export function Onboarding() {
  const { finishOnboarding } = useEco();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [housing, setHousing] = useState<UserProfile["housing"]>("medium");
  const [commute, setCommute] = useState<TransportMode>("public");
  const [diet, setDiet] = useState<DietType>("low-meat");
  const [shopping, setShopping] = useState<UserProfile["shopping"]>("medium");

  const baseline = calcBaseline(housing, diet, commute, shopping);
  const vsUS = +((US_AVG_TONS - baseline) / US_AVG_TONS * 100).toFixed(0);
  const vsGlobal = +((baseline - GLOBAL_AVG_TONS) / GLOBAL_AVG_TONS * 100).toFixed(0);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    finishOnboarding({ name: name.trim() || "Eco Explorer", housing, commute, diet, shopping });
    toast.success("Welcome aboard! Your dashboard is live 🌍");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
      <Card className="relative w-full max-w-2xl overflow-hidden border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-emerald-950/50 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-emerald-400/70">EcoPulse AI</div>
                <div className="text-sm font-medium text-foreground">Baseline Quiz · {step + 1}/{steps.length}</div>
              </div>
            </div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= step ? "bg-emerald-400" : "bg-white/10"}`} />
              ))}
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-6 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-emerald-400" />
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome to EcoPulse AI</h1>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                In 4 quick steps we'll calculate your annual CO₂e baseline and unlock your personalized eco-quests.
              </p>
              <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="mx-auto max-w-sm bg-white/5" />
            </div>
          )}

          {step === 1 && (
            <StepCard icon={<Home className="h-5 w-5" />} title="Housing footprint" subtitle="Pick what best describes your home">
              <Picker
                value={housing}
                onChange={setHousing}
                options={[
                  { v: "small", label: "Apartment / Studio", hint: "~2t CO₂e" },
                  { v: "medium", label: "Mid-size home", hint: "~4t CO₂e" },
                  { v: "large", label: "Large house", hint: "~7t CO₂e" },
                ]}
              />
            </StepCard>
          )}

          {step === 2 && (
            <StepCard icon={<Car className="h-5 w-5" />} title="Daily commute" subtitle="Your primary way to get around">
              <Picker
                value={commute}
                onChange={setCommute}
                options={[
                  { v: "walk", label: "Walk / Bike", hint: "0 kg/km" },
                  { v: "bike", label: "Cycling", hint: "0 kg/km" },
                  { v: "public", label: "Public transit", hint: "0.12 kg/km" },
                  { v: "ev", label: "Electric vehicle", hint: "0.05 kg/km" },
                  { v: "ice", label: "Gasoline car", hint: "0.21 kg/km" },
                ]}
              />
            </StepCard>
          )}

          {step === 3 && (
            <StepCard icon={<Utensils className="h-5 w-5" />} title="Eating habits" subtitle="On a typical day">
              <Picker
                value={diet}
                onChange={setDiet}
                options={[
                  { v: "vegan", label: "Vegan", hint: "0.7 kg/meal" },
                  { v: "vegetarian", label: "Vegetarian", hint: "1.1 kg/meal" },
                  { v: "low-meat", label: "Low meat", hint: "1.5 kg/meal" },
                  { v: "heavy-meat", label: "Heavy meat", hint: "2.5 kg/meal" },
                ]}
              />
            </StepCard>
          )}

          {step === 4 && (
            <StepCard icon={<ShoppingBag className="h-5 w-5" />} title="Shopping habits" subtitle="How much do you consume?">
              <Picker
                value={shopping}
                onChange={setShopping}
                options={[
                  { v: "low", label: "Minimalist", hint: "~1t CO₂e" },
                  { v: "medium", label: "Moderate", hint: "~2.5t CO₂e" },
                  { v: "high", label: "Frequent", hint: "~5t CO₂e" },
                ]}
              />
            </StepCard>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-emerald-400/70">Your annual baseline</div>
                <div className="mt-2 bg-gradient-to-br from-emerald-300 to-cyan-300 bg-clip-text text-7xl font-bold tracking-tight text-transparent">
                  {baseline}
                </div>
                <div className="text-sm text-muted-foreground">tons CO₂e / year</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-muted-foreground">vs US avg ({US_AVG_TONS}t)</div>
                  <div className={`mt-1 text-2xl font-semibold ${vsUS >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {vsUS >= 0 ? "−" : "+"}{Math.abs(vsUS)}%
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-muted-foreground">vs Global avg ({GLOBAL_AVG_TONS}t)</div>
                  <div className={`mt-1 text-2xl font-semibold ${vsGlobal <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {vsGlobal > 0 ? "+" : ""}{vsGlobal}%
                  </div>
                </div>
              </div>
              <Button onClick={submit} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400">
                Enter EcoPulse <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step > 0 && step < 5 && (
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={back}>Back</Button>
              <Button onClick={next} className="bg-emerald-500 text-white hover:bg-emerald-400">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 0 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={next} className="bg-emerald-500 text-white hover:bg-emerald-400">
                Start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">{icon}</div>
        <div>
          <div className="text-lg font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Picker<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; hint: string }[] }) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
            value === o.v ? "border-emerald-400/60 bg-emerald-400/10 shadow-[0_0_0_1px_rgb(16,185,129,0.3)]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
          }`}
        >
          <span className="font-medium text-foreground">{o.label}</span>
          <span className="text-xs text-muted-foreground">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}
