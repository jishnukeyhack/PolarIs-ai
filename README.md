# PolarIs AI — Polar Energy Lab

> A predictive, optimization-driven, resilient microgrid energy management platform purpose-built for Antarctic research stations and extreme environments.

PolarIs AI delivers cutting-edge forecasting, dispatch optimization, and resilience controls tailored for long-duration polar operations. Designed for the Smart India Hackathon 2026 (SIH2026), this repository demonstrates an end-to-end system that reduces diesel dependence, preserves life-safety systems in emergencies, and surfaces actionable insights for field operators and researchers.

---

## Key Features

1. Design system and immersive UI:
   - A polar-first visual language with high-contrast glass panels, cinematic particle streamlines, and a focus on operator clarity in low-light / high-glare conditions.
   - Responsive dashboard, 3D Earth preview, and visual workflows for forecast-to-dispatch traces.

2. Predictive Multi-Horizon Forecasting:
   - Multi-horizon forecasting (1h, 6h, 24h, 72h) for solar irradiance, wind power potential, and thermal/electrical station loads.
   - Combines long-term historical climatology with short-to-medium range numerical forecasts to provide robust predictions under polar conditions.

3. High-Performance MILP Dispatch Engine:
   - Mixed-Integer Linear Programming formulation minimizing fuel consumption, battery wear, and operational risk.
   - Optimized to handle extended polar nights, long periods of low renewable availability, and spinning reserve constraints.
   - Result caching and warm-starting for sub-second decision cycles in simulated judge/demo scenarios.

4. Polar Survival Mode & Autonomous Resilience:
   - Real-time multivariate anomaly detection across telemetry streams (wind gusts, generator vibration, voltage/Hz excursions).
   - Automated 3-tier load prioritization and controlled shedding during extreme events to protect life-support systems and critical science infrastructure.

5. Photorealistic 3D Earth Preview and Visual Telemetry:
   - High-fidelity globe visualization with station-centric zoom, orbital camera transitions, and layered overlays for power flows, weather fronts, and operational alarms.

6. Auditability & Explainability:
   - Full traceability from raw telemetry and forecast inputs to optimized dispatch decisions.
   - Human-readable decision logs and scenario replay for judge walkthroughs and post-event forensics.

---

## Architecture Overview

```
polaris-ai/
├── apps/
│   └── web/                     # Next.js 15 App Router (BFF + Polar-themed UI)
│       ├── app/
│       │   ├── (dashboard)/page.tsx   # Main Console
│       │   ├── earth/page.tsx         # 3D Earth Orbit View
│       │   ├── forecast/page.tsx      # ML Forecast Studio
│       │   ├── dispatch/page.tsx      # MILP Optimizer Studio
│       │   ├── survival-mode/page.tsx # Catastrophic Resilience Command
│       │   ├── reports/page.tsx       # Executive Reports & Benchmarks
│       │   └── api/                   # Public Edge API Route Handlers
│       ├── components/
│       │   ├── glass/                 # GlassPanel, GlassCard, GlassPill
│       │   ├── dashboard/             # TopNavBar, LeftControls, CenterVisualizer, StationDetail
│       │   └── ui/                    # ToggleSwitch, Sliders
│       └── styles/tokens.css          # Polar design tokens & glass recipes
├── services/
│   ├── forecast-service/              # Python FastAPI (ML forecasting models)
│   ├── optimizer-service/             # Python FastAPI (HiGHS / SciPy MILP)
│   ├── telemetry-service/             # FastAPI + IoT Stream Generator
│   └── anomaly-service/               # FastAPI + multivariate anomaly detector
├── packages/
│   ├── types/                         # Shared TypeScript Interfaces & Zod Contracts
│   ├── data-pipeline/                 # Historical climatology & forecast ETL clients + seed snapshots
│   └── ui/                            # Shared token definitions
├── docs/
│   ├── adr/                           # Architecture Decision Records (ADR-001 to ADR-005)
│   └── IMPLEMENTATION_PLAN.md
├── DEMO_SCRIPT.md                     # Step-by-step investor & judge walkthrough
├── docker-compose.yml
└── turbo.json
```

---

## Quick Start (< 5 Minutes)

### Option 1: Docker Compose (Full Stack)

```bash
# Clone the repository
git clone https://github.com/jishnukeyhack/PolarIs-ai.git
cd PolarIs-ai

# Spin up Postgres/TimescaleDB, Redis, Mosquitto, Python Services, and Next.js Web
docker compose up --build
```

Open the console at http://localhost:3000 and follow the DEMO_SCRIPT.md for a structured judge walkthrough.

### Option 2: Local Development

```bash
# 1. Install Node.js dependencies
npm install

# 2. Start the Next.js web application for local dev
npm run dev --workspace=@polaris/web
```

Open http://localhost:3000 in your browser.

---

## Interactive Controls & Shortcuts

| Key | Action |
|---|---|
| Space | Play / Pause 72-hour timeline scrubber |
| ← / → | Step timeline ±1 hour |
| S | Toggle Polar Survival Mode (emergency load prioritization) |
| V | Switch between meteorological Radar Map & Power Flow Diagram |
| Esc | Close active popups / modals |

---

## Published Antarctic Station Benchmarks (Representative Estimates)

| Station | Jurisdiction | Renewable % | Annual Diesel Saved | Annual Cost Avoided |
|---|---:|---:|---:|---:|
| Maitri | India | 64.2% | 28,400 Liters | ₹9,100,000 (approx.) |
| Bharati | India | 68.1% | 34,200 Liters | ₹10,950,000 (approx.) |
| Maitri II (Next-Gen) | India | 74.5% | 52,000 Liters | ₹16,650,000 (approx.) |

> These are representative estimates based on simulated dispatch scenarios and historical climate baselines; actual savings will vary with fuel prices, operational constraints, and local logistics.

---

## How Judges Can Evaluate (SIH2026 Walkthrough)

1. Start the full stack with Docker Compose and open the console.
2. Run the DEMO_SCRIPT.md to reproduce a condensed 15-minute scenario: forecast ingestion -> dispatch optimization -> simulated extreme event -> Polar Survival Mode activation.
3. Inspect the decision logs and scenario replay: verify explainability of dispatch choices and why specific loads were prioritized.
4. Review resilience behaviors under fault-injection (simulated generator failure, rapid wind gusts) and confirm life-safety protection and controlled shedding.
5. Check performance metrics: forecast RMSE, dispatch runtime, fuel reductions, battery cycle counts.

---

## Contributing & Roadmap

We welcome contributions that strengthen reliability, add station adapters, and improve explainability.

Planned near-term priorities:
- Hardware-in-the-loop telemetry adapter for field testing
- Expanded regional climatology baselines and uncertainty-aware forecasts
- Policy-aware dispatch modes for multi-station coordination

---

## License & Attribution

This project was developed for SIH2026 and is provided under an open-source license. It leverages publicly available historical climatology datasets and numerical forecast products; data attributions and references are documented in docs/IMPLEMENTATION_PLAN.md.

For demo instructions and a judge-focused walkthrough, see DEMO_SCRIPT.md.
