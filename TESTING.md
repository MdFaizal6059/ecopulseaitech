# Testing & Quality

EcoPulse AI is built to be **easily testable, validated, and maintained** —
this is a first-class concern, not an afterthought. This document explains how
the test suite is organised and how to extend it.

## Stack

| Layer           | Tool                                                                |
| --------------- | ------------------------------------------------------------------- |
| Test runner     | [Vitest 4](https://vitest.dev) (Vite-native, same transform as app) |
| DOM environment | [jsdom](https://github.com/jsdom/jsdom)                             |
| Component tests | [@testing-library/react](https://testing-library.com/) + user-event |
| Assertions      | Vitest + `@testing-library/jest-dom`                                |
| Coverage        | `@vitest/coverage-v8` (text + HTML + lcov)                          |
| CI              | GitHub Actions (`.github/workflows/ci.yml`) — lint, typecheck, test |

## Commands

```bash
bun run test            # one-shot run (used in CI)
bun run test:watch      # interactive watch mode
bun run test:coverage   # generates ./coverage with lcov + HTML report
bun run typecheck       # strict TypeScript validation
bun run lint            # ESLint
```

## Layout

Tests live **next to the code they test** with a `.test.ts(x)` suffix:

```
src/lib/eco/
├── calc.ts
├── calc.test.ts          ← 28 tests covering carbon math, parsers, aggregations
├── badges.ts
└── badges.test.ts        ← 9 tests covering milestone evaluation & badge registry
```

This co-location keeps the unit-under-test and its spec discoverable in one
glance, and avoids parallel directory trees that go stale.

## What we test

The core **business logic is fully unit-tested** and is the part of the
codebase most likely to regress as features grow:

- **Carbon math** — emission factors, tier thresholds, level/XP progression,
  baseline calculation, aggregations (`totalByDay`, `totalByCategory`).
- **Natural-language parser** — transport modes, miles→km conversion, diet
  detection, energy parsing, empty-input safety.
- **Equivalencies** — guard against `NaN`/negative inputs.
- **Milestone & badge engine** — registry integrity, unlock evaluation,
  idempotency (don't re-unlock), `normalizeBadges` migration of stored data,
  upcoming-milestone ranking.

UI components built on top of these primitives inherit their correctness;
component-level tests can be added incrementally with React Testing Library
without changes to configuration.

## Writing a new test

1. Create `MyModule.test.ts` next to `MyModule.ts`.
2. Import directly — path aliases (`@/...`) work because `vitest.config.ts`
   uses `vite-tsconfig-paths`.
3. Prefer **pure-function tests** for logic and **Testing Library** for UI.
4. Run `bun run test:watch` while iterating.

```ts
import { describe, it, expect } from "vitest";
import { tierFor } from "./calc";

describe("tierFor", () => {
  it("promotes to Gold at 100 kg", () => {
    expect(tierFor(100)).toBe("Gold");
  });
});
```

## CI

Every push and PR to `main` runs lint → typecheck → tests with coverage.
The coverage report is uploaded as a build artifact for review.
