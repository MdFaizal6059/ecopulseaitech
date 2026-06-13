# Problem Statement Alignment

> Submission: **Gen AI Academy APAC — Cohort 2** (Hack2Skill × Google Cloud)
> Project: **EcoPulse AI** — an AI-powered carbon-footprint awareness and
> behavioral-change platform.

This document is the explicit map between the hackathon problem statement
and the features that ship in this repository. Every claim below points to
the file or module that implements it, so judges and evaluators can verify
in seconds.

---

## 1. The Problem

> *Climate awareness is high, but daily behavior is unchanged. Existing
> carbon trackers are either too clinical (spreadsheets, audits) or too
> shallow (one-tap "offset" buttons). Neither produces sustained,
> measurable reductions in personal emissions. The opportunity is to use
> Generative AI to make carbon literacy effortless and to use behavioral
> design to make it sticky.*

### Why this matters for APAC

* Per-capita emissions in APAC are rising faster than any other region.
* Smartphone-first users in APAC respond to gamified, social, low-friction
  experiences (Duolingo, Strava, payment apps) far better than to dashboards.
* Localized transport mixes (two-wheelers, metros, EV ride-share) need a
  parser that understands natural everyday language, not US-only forms.

---

## 2. Our Solution at a Glance

EcoPulse AI is a production-ready web app that turns carbon tracking into a
**daily 10-second ritual**, powered by:

1. **Generative-AI natural-language logging** — "Took the metro 8 km and
   had a vegan lunch" is parsed into structured emissions in real time
   (`src/lib/eco/calc.ts → parseNaturalLanguage`).
2. **Scientific emission factors** — Greenhouse Gas Protocol-aligned
   constants for transport, diet, and energy (`TRANSPORT_EF`, `DIET_EF`,
   `ENERGY_EF` in `calc.ts`), fully unit-tested in `calc.test.ts`.
3. **Behavioral gamification** — XP, levels, streaks, eco-quests, a tier
   system (Bronze → Diamond), and **12 hand-illustrated milestone badges**
   in the spirit of Duolingo (`src/lib/eco/badges.ts`, art under
   `src/assets/badges/`).
4. **Email notifications via the Gmail connector** — verified sign-up,
   welcome email, streak-protection reminders, quest and badge unlock
   notifications, all branded as **EcoPulse AI**
   (`src/lib/notifications/email.functions.ts`).
5. **Privacy-respecting auth** — email verification required before
   sign-up; OAuth via Google supported through the Lovable broker.
6. **Equivalency translator** — converts kg CO₂e prevented into trees,
   phone charges, km driven, and burgers (`equivalencies()` in `calc.ts`)
   so abstract numbers become tangible wins.

---

## 3. Mapping to Judging Criteria

| Criterion                          | Where it shows up in this repo                                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem-statement alignment**    | This document + `README.md` "Architecture & Core Modules"; every feature is traceable to a sustainability outcome.                                                                                      |
| **Use of Generative AI**           | `parseNaturalLanguage` (NL → structured activities), Gmail-powered AI assistant for streak reminders, AI-styled equivalency narratives (`equivalencies()`).                                             |
| **Code quality**                   | Strict TypeScript, ESLint + Prettier, JSDoc on all public APIs, modular co-located tests, no dead code, semantic design tokens (no hardcoded colors). See `ARCHITECTURE.md` and `CONTRIBUTING.md`.      |
| **Testing & maintainability**      | 37+ deterministic unit tests (`*.test.ts` next to source), `@vitest/coverage-v8`, GitHub Actions CI running lint + typecheck + coverage on every push. See `TESTING.md`.                                |
| **Security**                       | Row-Level Security on every public table, `has_role` security-definer pattern, Supabase email verification enforced, no service keys in client code, audited via `supabase--linter`.                    |
| **Efficiency**                     | Edge-deployed (Cloudflare Workers), per-request `QueryClient`, loader-pattern data fetching, image assets compressed, no client-side heavy libraries.                                                   |
| **Accessibility**                  | shadcn/Radix primitives (ARIA-correct by default), semantic design tokens guarantee WCAG-AA contrast, keyboard navigation, `aria-label` on every icon-only button, single `<main>` per route.           |
| **Uniqueness / "wow" factor**      | Hand-illustrated 3D vector badges (not emoji), confetti badge-unlock dialog, glassmorphic eco-futurist visual system, real Gmail-branded notifications under the **EcoPulse AI** sender identity.       |

---

## 4. End-to-End User Journey

```text
 ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
 │ Sign up + verify│ ─▶ │ 4-step onboarding│ ─▶ │ Personal baseline│
 │  email (Gmail)  │    │ housing/diet/etc.│    │  (annual tCO₂e)  │
 └─────────────────┘    └─────────────────┘    └──────────────────┘
                                                         │
                                                         ▼
 ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
 │ Streak reminders │ ◀─ │ Daily NL logging│ ─▶ │ Quests + XP + tier│
 │  (Gmail notif.)  │    │ "biked 5 km..." │    │  Bronze→Diamond   │
 └──────────────────┘    └─────────────────┘    └──────────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────┐
                                          │ Milestone badges unlocked │
                                          │ + marketplace + leaderbd. │
                                          └──────────────────────────┘
```

---

## 5. What Makes This Submission Different

* **Zero placeholder data.** A new account starts at exactly zero —
  zero XP, zero kg prevented, Bronze tier, empty leaderboard. Nothing in
  the UI is fake (`defaultProfile`, `defaultLeaderboard` in `calc.ts`).
* **Badges are real illustrated assets**, not emoji or GIFs — see the
  PNGs under `src/assets/badges/`.
* **Email verification is mandatory** before a new account can log
  activities — configured via `supabase--configure_auth` and enforced in
  `src/routes/auth.tsx`.
* **Tested business logic.** Carbon math, NL parsing, milestone logic and
  data aggregations are all covered by Vitest specs that run in CI.
* **Documented and contributable.** `README.md`, `ARCHITECTURE.md`,
  `CONTRIBUTING.md`, `TESTING.md`, and this `PROBLEM_STATEMENT.md` mean a
  judge or new contributor can be productive in minutes.

---

## 6. Verifying Each Claim

```bash
bun install
bun run lint           # ESLint, zero warnings policy
bun run typecheck      # strict TypeScript
bun run test:coverage  # 37+ tests, coverage report in ./coverage
```

CI runs the same pipeline on every push — see
[.github/workflows/ci.yml](.github/workflows/ci.yml).
