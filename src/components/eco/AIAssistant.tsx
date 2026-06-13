import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";
import { parseNaturalLanguage } from "@/lib/eco/calc";
import { useEco } from "@/lib/eco/store";
import { toast } from "sonner";

export function AIAssistant() {
  const { addActivity } = useEco();
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [log, setLog] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: 'Hi! Tell me what you did today — e.g. "I ate a vegan salad and took a 5km metro ride".',
    },
  ]);

  const submit = async () => {
    if (!text.trim() || thinking) return;
    const userText = text.trim();
    setLog((l) => [...l, { role: "user", text: userText }]);
    setText("");
    setThinking(true);
    await new Promise((r) => setTimeout(r, 500));
    const acts = parseNaturalLanguage(userText);
    if (acts.length === 0) {
      setLog((l) => [
        ...l,
        {
          role: "ai",
          text: "I couldn't extract any activities. Try mentioning a distance (e.g. 5km), a meal, or kWh.",
        },
      ]);
    } else {
      acts.forEach(addActivity);
      const total = acts.reduce((s, a) => s + a.co2eKg, 0);
      setLog((l) => [
        ...l,
        {
          role: "ai",
          text: `Logged ${acts.length} activit${acts.length > 1 ? "ies" : "y"} totaling ${total.toFixed(2)} kg CO₂e: ${acts.map((a) => a.label).join(", ")}`,
        },
      ]);
      toast.success(`Logged ${acts.length} activity · ${total.toFixed(2)} kg CO₂e`);
    }
    setThinking(false);
  };

  return (
    <Card className="flex flex-col border-emerald-500/20 bg-gradient-to-br from-slate-900/60 to-emerald-950/20 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <div className="text-sm font-semibold text-foreground">AI Carbon Assistant</div>
      </div>
      <div className="mb-3 max-h-48 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {log.map((m, i) => (
          <div key={i} className={m.role === "ai" ? "text-muted-foreground" : "text-foreground"}>
            <span
              className={`mr-1.5 text-[10px] uppercase tracking-widest ${m.role === "ai" ? "text-emerald-400" : "text-cyan-400"}`}
            >
              {m.role === "ai" ? "AI" : "You"}
            </span>
            {m.text}
          </div>
        ))}
        {thinking && <div className="text-xs text-emerald-400 animate-pulse">Parsing…</div>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell me what you did…"
          className="bg-white/5"
        />
        <Button type="submit" size="icon" className="bg-emerald-500 hover:bg-emerald-400">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
