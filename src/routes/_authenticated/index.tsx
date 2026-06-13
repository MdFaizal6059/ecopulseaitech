import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { ProfileDialog } from "@/components/eco/ProfileDialog";
import { BadgeUnlockedDialog } from "@/components/eco/BadgeUnlockedDialog";
import type { ViewKey } from "@/components/eco/types";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendNotification } from "@/lib/notifications/email.functions";
import { badgeMeta } from "@/lib/eco/badges";

const WELCOME_KEY = "ecopulse:welcomed";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "EcoPulse AI — Carbon Footprint Awareness Platform" },
      {
        name: "description",
        content:
          "Track, gamify, and reduce your carbon footprint with AI-powered logging, eco-quests, and global leaderboards.",
      },
    ],
  }),
  component: App,
});

function App() {
  const { state, updateProfile, acknowledgeUnlock } = useEco();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [submission, setSubmission] = useState(false);
  const [profile, setProfile] = useState(false);
  const send = useServerFn(sendNotification);

  // Hydrate name/avatar from the signed-in profile and send welcome email once
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, avatar")
        .eq("id", u.user.id)
        .maybeSingle();
      if (p) updateProfile({ name: p.full_name || "Eco Explorer", avatar: p.avatar || "🌱" });

      try {
        const key = `${WELCOME_KEY}:${u.user.id}`;
        if (typeof window !== "undefined" && !localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          send({ data: { kind: "welcome" } }).catch(() => {});
        }
      } catch {
        // ignore welcome-email bootstrap failures
      }
    })();
  }, [updateProfile, send]);

  // Fire badge_unlocked email when a new unlock is queued (fire-and-forget; UI dialog handled separately)
  useEffect(() => {
    const id = state.pendingUnlocks[0];
    if (!id) return;
    const meta = badgeMeta(id);
    if (!meta) {
      acknowledgeUnlock();
      return;
    }
    send({
      data: { kind: "badge_unlocked", data: { name: meta.name, description: meta.description } },
    }).catch(() => {});
    // Don't auto-acknowledge — dialog will when user dismisses
  }, [state.pendingUnlocks, send, acknowledgeUnlock]);

  return (
    <div className="relative min-h-screen bg-[#0B132B] text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative flex w-full">
        <Sidebar
          active={view}
          onChange={setView}
          onSettings={() => setProfile(true)}
          onSubmission={() => setSubmission(true)}
        />
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
      <ProfileDialog open={profile} onOpenChange={setProfile} />
      <SubmissionPortal open={submission} onOpenChange={setSubmission} />
      <BadgeUnlockedDialog />
      {!state.profile.onboarded && <Onboarding />}
    </div>
  );
}
