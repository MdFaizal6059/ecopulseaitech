# Contributing to EcoPulse AI

Thanks for your interest! This project is built to be **easy to read,
easy to test, and easy to extend**. The guide below keeps PRs short and
reviewable.

## Local setup

```bash
bun install
bun run dev          # http://localhost:5173
```

## Quality gates (must pass locally and in CI)

```bash
bun run lint          # ESLint + Prettier
bun run typecheck     # tsc --noEmit (strict)
bun run test          # Vitest, one-shot
bun run test:coverage # with coverage report
```

CI runs the same four commands on every push and PR — see
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Code style

* **TypeScript strict** — no `any`, no implicit `any`. Prefer `unknown`
  + a narrowing guard when a value is genuinely untyped.
* **Pure functions** for business logic. Anything in `src/lib/eco/`
  must be deterministic and free of `Date.now()` side-effects where
  practical (inject a clock).
* **JSDoc on every exported function** in `src/lib/`. One line of intent
  is enough; document non-obvious return shapes.
* **Design tokens, not raw colors.** Never use `text-white`, `bg-black`,
  or `bg-[#...]` in components — use semantic tokens from
  `src/styles.css`.
* **Co-locate tests.** `foo.ts` → `foo.test.ts` in the same folder.

## Commit & PR conventions

* Branch off `main`: `feat/short-description`, `fix/short-description`,
  `docs/short-description`, `test/short-description`.
* Conventional Commits where possible: `feat: add streak reminder email`.
* One logical change per PR. If you touched docs, tests, and code,
  that's fine — but don't bundle two features.
* PR description should answer: *what changed*, *why*, *how to test*.

## Adding features

| Change                       | Required follow-ups                                        |
| ---------------------------- | ---------------------------------------------------------- |
| New emission factor or tier  | Test in `src/lib/eco/calc.test.ts`                         |
| New milestone / badge        | Test in `src/lib/eco/badges.test.ts` + art under `assets/` |
| New notification kind        | Branded HTML template + smoke test                         |
| New protected route          | File under `src/routes/_authenticated/`                    |
| New public/shareable route   | Top-level route file with its own `head()`                 |
| New database table           | Migration + RLS policies + `GRANT` statements              |

## Security

* Never commit secrets. Use connector-managed env vars.
* `SUPABASE_SERVICE_ROLE_KEY` is server-only — never import
  `@/integrations/supabase/client.server` from a component.
* Every public-schema table needs RLS enabled + explicit `GRANT`s.

## Filing issues

Use the title format `[area] short summary`, e.g.
`[badges] streak-keeper unlocks at day 6`. Include reproduction steps
and the commit SHA you're on.

Thanks for helping make low-carbon living a daily ritual. 🌿
