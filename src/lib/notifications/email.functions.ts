import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type NotificationKind = "welcome" | "streak_reminder" | "quest_completed" | "badge_unlocked" | "test";

interface SendInput {
  kind: NotificationKind;
  data?: Record<string, string | number>;
}

function b64url(str: string) {
  // btoa on UTF-8 safe string
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function template(kind: NotificationKind, name: string, data: Record<string, string | number> = {}) {
  const appUrl = data.appUrl || "https://ecopulseaitech.lovable.app";
  const wrap = (title: string, body: string, cta = "Open EcoPulse AI") => `
<!doctype html><html><body style="margin:0;background:#0B132B;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0B132B;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:linear-gradient(180deg,#0f1f3d,#0a1530);border:1px solid rgba(16,185,129,0.25);border-radius:20px;overflow:hidden;">
        <tr><td style="padding:28px 32px 0;">
          <div style="display:inline-block;background:linear-gradient(135deg,#10B981,#06B6D4);width:42px;height:42px;border-radius:12px;text-align:center;line-height:42px;font-size:22px;">🌿</div>
          <div style="margin-top:10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#34d399;">EcoPulse AI</div>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          <h1 style="margin:12px 0 4px;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.01em;">${title}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 0;color:#cbd5e1;font-size:15px;line-height:1.6;">${body}</td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#06B6D4);color:#06231b;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">${cta}</a>
        </td></tr>
        <tr><td style="padding:0 32px 28px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:18px 0 0;font-size:11px;color:#64748b;">Sent by EcoPulse AI · You're getting this because you signed up to track your carbon footprint.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  switch (kind) {
    case "welcome":
      return {
        subject: "Welcome to EcoPulse AI 🌱",
        html: wrap(
          `Welcome, ${name}!`,
          `<p>You just joined a community measuring real climate impact, one decision at a time.</p>
           <p><strong>What to do first:</strong> log a trip or a meal — your dashboard, analytics, and leaderboard will update live with your real footprint.</p>`,
          "Start tracking",
        ),
      };
    case "streak_reminder":
      return {
        subject: `🔥 Don't lose your ${data.streak ?? ""}-day EcoPulse streak`,
        html: wrap(
          `Your streak is on the line, ${name}`,
          `<p>You have a <strong>${data.streak ?? 0}-day streak</strong> going. Log one quick activity today to keep the flame alive.</p>
           <p>It takes 10 seconds — even logging your lunch counts.</p>`,
          "Protect my streak",
        ),
      };
    case "quest_completed":
      return {
        subject: `Quest complete: ${data.title ?? "Eco-Quest"} ✓`,
        html: wrap(
          "Quest complete!",
          `<p>You just finished <strong>${data.title ?? "an eco-quest"}</strong> and earned <strong>+${data.xp ?? 0} XP</strong> and <strong>${data.credits ?? 0} credits</strong>.</p>
           <p>New quests refresh daily, weekly, and monthly. Keep stacking wins.</p>`,
          "View quests",
        ),
      };
    case "badge_unlocked":
      return {
        subject: `🏅 New badge unlocked: ${data.name ?? "Achievement"}`,
        html: wrap(
          `You earned "${data.name ?? "a new badge"}"`,
          `<p>${data.description ?? "A new milestone in your low-carbon journey."}</p>
           <p>It's now in your trophy case — pin it to your profile to show it off on the leaderboard.</p>`,
          "See my badges",
        ),
      };
    case "test":
    default:
      return {
        subject: "EcoPulse AI — test email ✅",
        html: wrap(
          "Your inbox is wired up",
          `<p>This is a test notification from EcoPulse AI. If you're reading this, streak reminders, quest celebrations, and badge unlocks will all land here.</p>`,
        ),
      };
  }
}

export const sendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SendInput) => {
    if (!input || typeof input !== "object" || !input.kind) throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!apiKey || !gmailKey) {
      return { ok: false, error: "Email connector not configured" };
    }

    const { supabase, userId } = context;
    const { data: authUser } = await supabase.auth.getUser();
    const to = authUser.user?.email;
    if (!to) return { ok: false, error: "No recipient email on account" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const name = profile?.full_name?.split(" ")[0] || "there";

    const tpl = template(data.kind, name, data.data ?? {});

    const raw = [
      `From: "EcoPulse AI" <me>`,
      `To: ${to}`,
      `Subject: ${tpl.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      tpl.html,
    ].join("\r\n");

    const res = await fetch(
      "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Connection-Api-Key": gmailKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: b64url(raw) }),
      },
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[ecopulse-email] send failed", res.status, txt);
      return { ok: false, error: `Gmail ${res.status}` };
    }

    return { ok: true };
  });
