# ADR-004: Real Scientific Data Ingestion with Deterministic Fallbacks

## Status
Accepted

## Context
A mission-critical energy management platform must operate on verified empirical datasets rather than purely random numbers:
1. Historical weather and irradiance: 40+ years of solar radiation (ALLSKY_SFC_SW_DWN), wind speed at 10m/50m (WS10M, WS50M), and 2m temperature (T2M) at Maitri (70.7667°S, 11.7333°E) and Bharati (69.4075°S, 76.1872°E).
2. Live operational forecasting: Open-Meteo Antarctic models (16-day hourly ECMWF / GFS ensemble).

## Decision
- `packages/data-pipeline` queries the NASA POWER API (`power.larc.nasa.gov/api/temporal/hourly/point`) and Open-Meteo API (`api.open-meteo.com/v1/forecast`).
- Normalizes data into the TimescaleDB hypertables (`telemetry_readings`, `forecasts`).
- Ships with a committed deterministic offline snapshot (`seed_weather_data.json`) covering 168 hours of Maitri and Bharati operational data, ensuring zero-downtime demos if external networks are throttled.

## Consequences
- Authentic physical irradiance curves and temperature fluctuations.
- Complete offline demo capability.
