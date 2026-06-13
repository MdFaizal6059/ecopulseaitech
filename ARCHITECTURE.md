# Architecture

EcoPulse AI is a **TanStack Start** (React 19 + Vite 7) application
deployed to Cloudflare Workers, backed by Supabase (Lovable Cloud) for
auth, database, and row-level security. This document is a one-page map
of how the pieces fit together so a new contributor — or judge — can
navigate the codebase confidently.

## High-level diagram

```text
 ┌───────────────────────────── Browser ─────────────────────────────┐
 │                                                                  │
 │  React 19 + TanStack Router  ──▶  shadcn/ui + Tailwind v4 tokens │
 │              │                                                    │
 │              │ useServerFn / loaders                              │
 ▼              ▼                                                    │
 ┌───────────────────────── TanStack Start ─────────────────────────┐
 │  createServerFn(...)         server routes (api/public/*)        │
 │  ├─ requireSupabaseAuth      └─ Gmail webhook handlers           │
 │  └─ Gmail connector calls                                        │
 └──────────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
   ┌────────────────────┐         ┌────────────────────┐
   │  Supabase (Cloud)  │         │  Gmail via         │
   │  Auth + Postgres   │         │  Lovable connector │
   │  RLS + has_role()  │         │  gateway           │
   └────────────────────┘         └────────────────────┘
```

## Directory map

```text
src/
├── routes/                       file-based routing (TanStack)
│   ├── __root.tsx                root layout, head/og, auth listener
│   ├── auth.tsx                  sign-in / sign-up + email verification UI
│   └── _authenticated/           ssr:false, gated subtree
│       ├── route.tsx             managed auth gate (do not edit)
│       └── index.tsx             main app shell + view switching
├── components/
│   ├── eco/                      product surface (Dashboard, Quests, Leaderboard, ...)
│   └── ui/                       shadcn primitives
├── lib/
│   ├── eco/
│   │   ├── calc.ts               pure carbon math + NL parser  ◀── unit-tested
│   │   ├── calc.test.ts
│   │   ├── badges.ts             milestone registry + evaluator ◀── unit-tested
│   │   ├── badges.test.ts
│   │   ├── store.tsx             React provider + reducer + persistence
│   │   └── types.ts              domain types
│   └── notifications/
│       └── email.functions.ts    Gmail-backed server fns (welcome, streak, badge)
├── assets/badges/                illustrated milestone art (PNG)
└── integrations/supabase/        auto-generated; do not edit
```

## Data flow (single activity log)

1. User submits "Took the metro 8 km" in `LogActivity.tsx`.
2. `parseNaturalLanguage(text)` (pure function, `calc.ts`) returns
   `Activity[]` with category, kg CO₂e, and metadata.
3. `EcoProvider.addActivities(...)` updates the reducer, persists to
   `localStorage`, recomputes XP/streak/tier.
4. `evaluateMilestones(state)` checks every entry in `BADGE_REGISTRY`;
   newly satisfied milestones are pushed onto `pendingUnlocks`.
5. The root component drains `pendingUnlocks`, opens
   `BadgeUnlockedDialog`, and fires a Gmail notification through
   `sendNotification({ kind: "badge_unlocked", ... })`.

## Authentication & security

* Email verification is **mandatory** before sign-up succeeds.
* Auth state lives in Supabase; the browser client persists session in
  `localStorage`. Protected routes are gated by the integration-managed
  `_authenticated/route.tsx` (`ssr: false`).
* Every public table has Row-Level Security enabled and uses the
  `has_role(uuid, app_role)` security-definer function to avoid
  recursive policies. See `supabase/migrations/`.
* `SUPABASE_SERVICE_ROLE_KEY` is server-only and never imported into
  client-reachable modules.

## Quality gates

* **Static**: `bun run lint` (ESLint + Prettier), `bun run typecheck`
  (`tsc --noEmit`, strict mode).
* **Tests**: `bun run test:coverage` (Vitest 4 + jsdom + Testing Library)
  with co-located `*.test.ts`. See [`TESTING.md`](./TESTING.md).
* **CI**: GitHub Actions runs lint → typecheck → tests with coverage on
  every push and PR to `main`
  ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).

## Extending the system

* **New emission factor** → add to `TRANSPORT_EF` / `DIET_EF` in
  `calc.ts`, add a test case in `calc.test.ts`.
* **New badge** → add a `BadgeMeta` entry to `BADGE_REGISTRY` and drop a
  PNG into `src/assets/badges/`. The evaluator picks it up automatically;
  add a test in `badges.test.ts`.
* **New notification type** → extend the `kind` union in
  `email.functions.ts` and add a branded HTML template.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branch/PR conventions and
the local development loop.
