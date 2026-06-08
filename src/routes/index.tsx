import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useEco } from "@/lib/eco/store";
import { Sidebar, MobileNav } from "@/components/eco/Sidebar";
import { Dashboard } from "@/components/eco/Dashboard";
import { LogActivity } from "@/components/eco/LogActivity";
import { Analytics } from "@/components/eco/Analytics";
import { Quests } from "@/components/eco/Quests";
import { Marketplace } from "@/components/eco/Marketplace";
import { Leaderboard } from "@/components/eco/Leaderboard";
import { Onboarding } from "@/components/eco/Onboarding";
import { DevPanel } from "@/components/eco/DevPanel";
import { SubmissionPortal } from "@/components/eco/SubmissionPortal";
import type { ViewKey } from "@/components/eco/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoPulse AI — Carbon Footprint Awareness Platform" },
      { name: "description", content: "Track, gamify, and reduce your carbon footprint with AI-powered logging, eco-quests, and global leaderboards." },
    ],
  }),
  component: App,
});

function App() {
  const { state } = useEco();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [submission, setSubmission] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0B132B] text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative flex w-full">
        <Sidebar active={view} onChange={setView} onSettings={() => setSubmission(true)} />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <div className="mx-auto max-w-6xl">
            {view === "dashboard" && <Dashboard />}
            {view === "log" && <LogActivity />}
            {view === "analytics" && <Analytics />}
            {view === "quests" && <Quests />}
            {view === "market" && <Marketplace />}
            {view === "leaderboard" && <Leaderboard />}
          </div>
        </main>
      </div>

      <MobileNav active={view} onChange={setView} />
      <DevPanel />
      <SubmissionPortal open={submission} onOpenChange={setSubmission} />
      {!state.profile.onboarded && <Onboarding />}
    </div>
  );
}
