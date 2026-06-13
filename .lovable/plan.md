## Goals

1. Reset every mock/sample number so a fresh account starts at true zero.
2. Require email verification on signup.
3. Connect the Gmail connector and send all EcoPulse notifications (welcome, streak-saver reminders, quest completions, weekly summary) from sender **"EcoPulse AI"** via the Lovable AI Gateway + Gmail.
4. Replace emoji badges with **Duolingo-style illustrated badges & stickers** and add a milestone reward system.

## 1. Reset all data to zero

`src/lib/eco/calc.ts`:

- `generateMockHistory()` → `[]`
- `defaultLeaderboard()` → only the current user, `prevented: 0, streak: 0, tier: "Bronze"`
- `defaultProfile()` → `xp: 0, credits: 0, streak: 0, level: 1, tier: "Bronze", baselineAnnualTons: 0`
- `defaultQuests()` → `progress: 0, completed: false`
- `defaultBadges()` → all `unlocked: false`

`src/lib/eco/store.tsx`: remove the `+150` leaderboard padding; relabel DevPanel presets as "Demo simulations".

Add tasteful empty states in `Dashboard`, `Analytics`, `Leaderboard`, `Quests`, `Marketplace`. Guard equivalencies/chart math against NaN.

## 2. Email verification on signup

- `supabase--configure_auth` with `auto_confirm_email: false` and `password_hibp_enabled: true`.
- `src/routes/auth.tsx`: after `supabase.auth.signUp`, render an inline "Check your inbox" card with a Resend button (`supabase.auth.resend`). On Sign-In, surface the `email_not_confirmed` error with a one-click resend.

Verification emails use Supabase's default sender (reliable, no DNS). The Gmail connector handles all EcoPulse-branded app notifications below.

## 3. Gmail connector + EcoPulse notifications

Connect Gmail via `standard_connectors--connect` (`google_mail`).

New server fn `src/lib/notifications/email.functions.ts` (`createServerFn` + `requireSupabaseAuth`):

- Reads `LOVABLE_API_KEY` + `GOOGLE_MAIL_API_KEY` from `process.env`.
- Builds an RFC-2822 message — `From: "EcoPulse AI" <builder@gmail>`, `Reply-To`, HTML body — base64url-encodes it, POSTs to `https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send`.
- Accepts `{ kind: "welcome" | "streak_reminder" | "quest_completed" | "badge_unlocked" | "weekly_summary", to, data }` and renders branded HTML templates (dark-green palette, leaf accent, CTA back to app, embedded badge artwork from CDN).

Client triggers:

- **Welcome** — after first authenticated load.
- **Streak reminder** — "Protect my streak" button in Dashboard + automatic prompt if `streak > 0` and no activity today.
- **Quest / Badge unlock** — `completeQuest` / `unlockBadge` in `store.tsx` fires fire-and-forget notification.
- **Test email** button in `ProfileDialog.tsx`.

`NotificationSettings.tsx` modal (sidebar) with toggles persisted to `profiles` via migration adding `notif_streak`, `notif_quests`, `notif_weekly` boolean columns; server fn checks these before sending.

## 4. Duolingo-style badges & milestone stickers

Replace every emoji badge with a real illustrated asset.

**Asset generation** — produce each badge as a 1024×1024 transparent PNG via `imagegen` (premium tier for crisp typography on the badge ribbon), then upload through `lovable-assets create` so they're CDN-served. Style brief shared across all assets to keep them cohesive:

> Duolingo-style mascot badge, chunky 3D vector illustration, soft cel-shading, thick outline, glossy highlights, vibrant eco palette (leaf-green #22c55e, sky #38bdf8, gold #facc15), centered subject on a circular ribboned medal with a small banner reading the badge name, transparent background, playful but premium.

Badges to generate (12, mapped to milestones):

- **First Step** — sprouting seedling on a medal (first activity logged)
- **Streak Spark** — flame mascot, 3-day streak
- **Streak Keeper** — flame with shield, 7-day streak
- **Streak Legend** — golden phoenix, 30-day streak
- **Tree Hugger** — hugging oak mascot, 10 trees equivalent saved
- **Forest Guardian** — owl with leaf crown, 100 trees
- **EV Pioneer** — cartoon EV car, first EV trip logged
- **Transit Hero** — bus mascot with cape, 20 transit trips
- **Plant Power** — broccoli mascot, 10 vegan meals
- **Quest Champion** — trophy with leaves, 10 quests completed
- **Marketplace Maven** — shopping bag with sparkles, first redemption
- **Carbon Crusher** — Earth mascot flexing, 100kg CO₂ prevented

Stored as `src/assets/badges/<slug>.png.asset.json`. A `BADGE_ART` map in `src/lib/eco/badges.ts` imports the JSON pointers and exports `{ id, name, description, artUrl, milestone }`.

**Data model** — extend `Badge` interface in `src/lib/eco/types.ts` with `artUrl: string`, `milestone: { kind, threshold }`, `unlockedAt?: string`. Remove `icon: string` (emoji) usage everywhere.

**Unlock logic** — new `evaluateMilestones(state)` in `store.tsx` runs after every activity log / quest completion; any newly satisfied milestone flips `unlocked: true`, sets `unlockedAt`, fires confetti + toast ("New badge: Streak Keeper"), opens a celebratory modal `BadgeUnlockedDialog.tsx` showing the full artwork, and triggers the `badge_unlocked` email.

**UI updates**:

- `Quests.tsx` "Achievements" grid → real `<img src={artUrl}>` tiles, locked badges rendered desaturated + 40% opacity with a small lock chip.
- New `MilestonesRail` on `Dashboard.tsx` showing next 3 unearned badges with a progress bar toward each threshold.
- `Marketplace.tsx` adds a "Stickers" tab where unlocked badges double as profile stickers users can pin to their profile card; pinned sticker shows on `Leaderboard.tsx` next to the name.

## 5. Verification

- Build passes; signup → verification card, no session until confirmed.
- All views render 0 with empty states on a fresh account.
- Logging activities increments numbers and unlocks the correct badge with confetti + modal + email.
- Badge grid shows illustrated artwork, no emojis remain in the badges/stickers system.
- "Send test email" delivers a branded EcoPulse AI message via Gmail.

## Out of scope

- Routing Supabase's own verification email through Gmail (needs verified domain + auth hook).
- Background cron for daily reminders (handled client-side on app open).
- Persisting activity history to the database (still localStorage per browser).
