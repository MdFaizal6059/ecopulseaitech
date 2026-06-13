# 🌿 EcoPulse AI — Carbon Footprint Awareness & Behavioral Gamification Platform

> **EcoPulse AI** is a production-ready, hyper-engaging carbon tracking and behavioral modification platform. Designed to bridge the gap between abstract climate data and daily human action, it combines high-fidelity glassmorphism aesthetics, real-time telemetry tracking, automated natural language parsing, and deep gamification frameworks to incentivize sustained personal carbon reduction.

---

## 🚀 Live Submission Links

For evaluation verification under **PromptWars Virtual: Main Challenge 3**, please use the direct production endpoints below:

* **⚡ Live Web Deployment:** [ecopulseaitech.lovable.app](ecopulseaitech.lovable.app)
* **💻 Public GitHub Repository:** [https://github.com/MdFaizal6059/ecopulseaitech](https://github.com/MdFaizal6059/ecopulseaitech)
* **👔 LinkedIn Build Journey Documentation:** [https://www.linkedin.com/posts/mohammed-faizal-m-b3242b311_promptwars-hack2skill-googleai-ugcPost-7470117622022422528-VY3g](https://www.linkedin.com/posts/mohammed-faizal-m-b3242b311_promptwars-hack2skill-googleai-ugcPost-7470117622022422528-VY3g)

---

## 🎨 Design Language & Visual System

EcoPulse AI uses an **Eco-Futurism** visual framework built on a premium dark mode engine, leveraging modern glassmorphic overlays, fluid CSS physics, and highly deliberate color zoning:

* **Deep Slate Base (`#0B132B`):** Establishes an immersive, low-glare dashboard workspace.
* **Vibrant Emerald / Mint (`#10B981` / `#34D399`):** Indicates dynamic carbon offsets, completed quests, and ecological wins.
* **Subtle Amber / Rose Alert Accent:** Communicates high carbon intensities dynamically.
* **Micro-interactions:** Powered via Framer Motion and Tailwind CSS transitions for haptic-feedback emulation during logs, fluid multi-step wizard tracking, and SVG canvas paint refreshes.

---

## 🌟 Architecture & Core Modules

### 1. 📋 Hyper-Personalized Onboarding & Dynamic Baseline
* **Gamified Intake Wizard:** A 4-step interactive module spanning Housing, Transport, Diet, and Consumption habits.
* **Algorithmic Profiling:** Implements standard scientific Greenhouse Gas Protocol variants ($EF \times \text{Activity}$) to establish a precise localized metric ton $CO_2e$ baseline, charted instantly against global milestones ($4.0$ tons global mean vs. $16.0$ tons regional high-intensity mean).

### 2. ⚡ Omni-Channel Quick Log & AI Assistant
* **Transactional Activity Tracking:** Slider-based smart telemetry simulations for electricity (kWh) and water usage alongside localized transport and dietary tags.
* **Natural Language Translation Engine:** A simulated deterministic regex/NLP parser allowing users to log actions via normal conversation:
    > *"I rode the electric metro for 12 kilometers and had a plant-based lunch today."*
    *The engine instantly decomposes the text string, matches the respective emission factor variables, updates the database, and pushes a toast success message.*

### 3. 📊 Dynamic Analytics Dashboard
* **Visual Telemetry:** Interactive time-series line, bar, and donut charts via Recharts/clean SVGs tracking historical performance trends over a pre-seeded 30-day window.
* **Equivalency Translation Panel:** Converts cold metric quantities into clear behavioral metrics:
    * *1 kg $CO_2e$ avoided = 14 tree seedlings nurtured over a decade or 2,300 smartphone battery charge-cycles.*

### 4. 🎮 The Eco-Quests System (Gamification Engine)
* **Variable Challenge Cadences:** Daily streaks, weekly group objectives, and macro monthly milestones (e.g., *Meatless Mondays*, *Zero-Emission Commutes*).
* **XP Progression Framework:** Real-time experience level routing complete with visual confetti generation on achievement triggers and detailed SVG badge reveals ("Green Gladiator", "Solar Sovereign").

### 5. 🏪 Swag Store & Eco-Credits Marketplace
* **Carbon Commerce Loop:** Exchange performance credits earned by reducing daily footprint outputs below the regional baseline for tangible rewards—including premium developer gear, verified offset project donations, and sustainability discount API checkouts.

### 6. 🏆 High-Stakes Leaderboard
* **Social Proof Integration:** Tiered competition architecture (Bronze, Silver, Gold, Emerald, Diamond) utilizing live peer arrays, running green streaks, and dynamic filter indices.

---

## 🧮 Explicit Mathematical Verification Logic

All platform metrics are governed dynamically in the application layer by rigorous mathematical formulas to prevent arbitrary scoring:

$$\text{Total Daily Carbon Output } (CO_2e) = C_{\text{Transport}} + C_{\text{Diet}} + C_{\text{Utilities}}$$

Where:
* **Transport Matrix ($C_{\text{Transport}}$):** $\text{Distance (km)} \times [ \text{ICE: } 0.21 \mid \text{Public Transit: } 0.12 \mid \text{EV: } 0.05 \mid \text{Active: } 0.00 ]$
* **Dietary Matrix ($C_{\text{Diet}}$):** $\text{Meals Logged} \times [ \text{Heavy Meat: } 2.5 \mid \text{Low Meat: } 1.5 \mid \text{Vegetarian: } 1.1 \mid \text{Vegan: } 0.7 ]$
* **Utility Matrix ($C_{\text{Utilities}}$):** $(\text{Electricity kWh} \times 0.85) + (\text{Water Liters} \times 0.002)$

---

## 🛠️ Tech Stack & Implementation Blueprint

The system architecture is engineered for low latency, zero build overhead, and rapid scaling using modern edge-ready primitives:

* **Frontend Framework:** React 18 / TypeScript / Vite Ecosystem
* **Styling Engine:** Tailwind CSS / Shadcn/UI primitives / Lucide Design Architecture
* **Backend / Persistence Layer:** Supabase Database Routing mapped over a fully synchronized `localStorage` fallback layer for seamless offline testing and evaluation preservation.
* **Deployment:** Edge delivery framework via Netlify/Vercel with fully unified automated continuous integration (CI/CD) pipelines connected directly via GitHub.

---

## 💻 Local Workspace Initialization

Clone the verified repository and initialize your environment locally:

```bash
git clone https://github.com/MdFaizal6059/ecopulseaitech.git
cd ecopulseaitech
bun install
bun run dev
```

---

## ✅ Testing, Validation & Maintainability

Maintainability is a first-class concern. The carbon math, natural-language
parser, and milestone/badge engine are covered by a deterministic unit-test
suite that runs locally and in CI on every push and pull request.

| Surface                             | Tooling                                       |
| ----------------------------------- | --------------------------------------------- |
| Unit + integration tests            | Vitest 4 + jsdom + Testing Library            |
| Coverage                            | `@vitest/coverage-v8` (text / html / lcov)    |
| Static analysis                     | ESLint + TypeScript `--strict`                |
| Continuous integration              | GitHub Actions — `.github/workflows/ci.yml`   |

```bash
bun run test            # one-shot test run
bun run test:watch      # interactive watch
bun run test:coverage   # generate ./coverage report
bun run typecheck       # strict TS validation
bun run lint            # ESLint
```

Tests live next to the code they exercise (e.g. `src/lib/eco/calc.test.ts`
beside `calc.ts`) so the unit-under-test and its spec are always in sync.
The full testing philosophy and contribution guide is documented in
[**TESTING.md**](./TESTING.md).

### CI pipeline

Every push and PR triggers:

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bun run typecheck`
4. `bun run test:coverage` (uploaded as a build artifact)

A green check on the PR is the merge gate.

---

## 📚 Documentation Index

Every concern has its own focused doc so judges, contributors, and future
maintainers can jump straight to what they need:

| Doc                                              | Purpose                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| [`PROBLEM_STATEMENT.md`](./PROBLEM_STATEMENT.md) | Explicit alignment with the Gen AI Academy APAC — Cohort 2 problem statement.    |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)           | One-page system map, data flow, directory layout.                                |
| [`TESTING.md`](./TESTING.md)                     | Testing philosophy, stack, and how to add a new test.                            |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)           | Local setup, code style, PR conventions, security rules.                         |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)     | Contributor Covenant — community expectations.                                   |




