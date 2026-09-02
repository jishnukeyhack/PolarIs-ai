# ADR-001: Monorepo and Polyglot Architecture

## Status
Accepted

## Context
PolarIs AI requires a dual-nature architecture:
1. Ultra-responsive, edge-deployed, 60fps web console providing sub-second interactions, Google WeatherLab visual fidelity, and real-time streaming charts.
2. Heavy mathematical optimization (MILP with HiGHS/PyPSA/SciPy), machine learning forecasting (LightGBM/XGBoost/LSTM), and multivariate anomaly detection (PyOD/ADTK) best implemented in Python 3.12.

## Decision
We adopt a monorepo structure with Turborepo:
- **Frontend / BFF (`apps/web`)**: Next.js 15 (App Router, React 19, TypeScript strict mode, Tailwind CSS v4). Next.js Route Handlers serve as the public API surface with Zod validation and in-memory LRU / Redis result caching.
- **Python Microservices (`services/`)**: FastAPI microservices for `forecast-service`, `optimizer-service`, `telemetry-service`, and `anomaly-service`.
- **Contracts (`packages/types`)**: Shared Zod schemas on the TypeScript side mirroring Pydantic models on the Python side.

## Consequences
- Single repo ensures synchronized API contracts between TypeScript frontend and Python services.
- Edge caching provides <10ms response for identical scenario replays.
- Python services can be deployed to Google Cloud Run or executed locally via Docker Compose.
