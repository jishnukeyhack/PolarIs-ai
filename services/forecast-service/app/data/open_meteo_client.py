"""
Open-Meteo live weather -> polar microgrid generation/load targets.

This is a Python port of lib/api/open-meteo.ts (fetchOpenMeteoPolarForecast).
Keep the physics here and in the TS file in sync — they intentionally
duplicate the same conversion so the Next.js console and the forecast
service never disagree about what a given GHI/wind-speed reading means in kW.

Pipeline:
    Open-Meteo hourly NWP (ECMWF IFS / GFS / ICON)
        -> direct_normal_irradiance + diffuse_radiation -> GHI
        -> high-latitude bifacial snow-albedo PV model -> solar_kw
        -> wind_speed_10m + surface_pressure -> air-density-corrected
           IEC 61400-1 turbine curve -> wind_kw
        -> temperature_2m + wind_speed_10m -> heating-degree + wind-chill
           thermal/electrical demand model -> thermal_kw / electrical_kw
        -> p10/p90 uncertainty band around each series

If the live API is unreachable (offline demo, rate limit, judges' venue
Wi-Fi), falls back to the same climatology-shaped synthetic generator used
on the frontend, so /forecast/{station_id} never hard-fails.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import numpy as np
import openmeteo_requests
import requests_cache
from retry_requests import retry

from app.data.stations import StationSpec

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

HOURLY_VARS = [
    "temperature_2m",
    "direct_normal_irradiance",
    "diffuse_radiation",
    "wind_speed_10m",
    "wind_gusts_10m",
    "wind_direction_10m",
    "surface_pressure",
    "cloud_cover",
]

# Shared cached+retrying session (mirrors the 10-minute in-memory cache in open-meteo.ts)
_cache_session = requests_cache.CachedSession(".open_meteo_cache", expire_after=600)
_retry_session = retry(_cache_session, retries=3, backoff_factor=0.3)
_client = openmeteo_requests.Client(session=_retry_session)


@dataclass
class PolarWeatherSeries:
    """Hourly arrays, all the same length, aligned to `time_utc`."""
    time_utc: List[str]
    solar_kw: np.ndarray
    solar_p10: np.ndarray
    solar_p90: np.ndarray
    wind_kw: np.ndarray
    wind_p10: np.ndarray
    wind_p90: np.ndarray
    electrical_kw: np.ndarray
    thermal_kw: np.ndarray
    electrical_p10: np.ndarray
    electrical_p90: np.ndarray
    thermal_p10: np.ndarray
    thermal_p90: np.ndarray
    is_live_api: bool
    source: str


def _turbine_power_kw(
    wind_speed_ms: np.ndarray,
    air_density_ratio: np.ndarray,
    station: StationSpec,
) -> np.ndarray:
    """IEC 61400-1-style power curve with cold-air density correction.
    Mirrors the cubic-ish ramp used in open-meteo.ts (windKw block).
    """
    cut_in, rated, cut_out = station.wind_cut_in_ms, station.wind_rated_ms, station.wind_cut_out_ms
    ratio = np.clip((wind_speed_ms - cut_in) / max(rated - cut_in, 1e-6), 0.0, 1.0)
    power = station.wind_capacity_kw * np.power(ratio, 2.7) * air_density_ratio
    power = np.where(wind_speed_ms >= rated, station.wind_capacity_kw, power)
    power = np.where((wind_speed_ms < cut_in) | (wind_speed_ms > cut_out), 0.0, power)
    return np.minimum(station.wind_capacity_kw, np.maximum(0.0, power))


def fetch_polar_weather_series(
    station: StationSpec,
    hours_ahead: int = 72,
    forecast_days: Optional[int] = None,
) -> PolarWeatherSeries:
    """Fetch live Open-Meteo forecast for `station` and convert to kW targets.
    Falls back to a synthetic climatology series (same shape as the live
    path) if the API call fails for any reason.
    """
    days = forecast_days or min(7, max(1, math.ceil(hours_ahead / 24)))
    params = {
        "latitude": station.latitude,
        "longitude": station.longitude,
        "hourly": HOURLY_VARS,
        "forecast_days": days,
        "timezone": "UTC",
    }

    try:
        responses = _client.weather_api(OPEN_METEO_URL, params=params)
        response = responses[0]
        hourly = response.Hourly()

        n = hourly.Variables(0).ValuesAsNumpy().shape[0]
        temp_c = hourly.Variables(0).ValuesAsNumpy()
        dni = hourly.Variables(1).ValuesAsNumpy()
        diffuse = hourly.Variables(2).ValuesAsNumpy()
        wind_speed = hourly.Variables(3).ValuesAsNumpy()
        wind_gusts = hourly.Variables(4).ValuesAsNumpy()
        pressure_hpa = hourly.Variables(6).ValuesAsNumpy()

        start = datetime.fromtimestamp(hourly.Time(), tz=timezone.utc)
        interval_s = hourly.Interval()
        time_utc = [(start + timedelta(seconds=interval_s * i)).isoformat() for i in range(n)]

        temp_c = np.nan_to_num(temp_c, nan=-20.0)
        dni = np.nan_to_num(dni, nan=0.0)
        diffuse = np.nan_to_num(diffuse, nan=0.0)
        wind_speed = np.nan_to_num(wind_speed, nan=8.5)
        wind_gusts = np.nan_to_num(wind_gusts, nan=wind_speed * 1.35)
        pressure_hpa = np.nan_to_num(pressure_hpa, nan=980.0)

        # --- Solar: high-latitude bifacial snow-albedo PV model ---
        ghi = dni + diffuse
        effective_ghi = ghi * station.bifacial_albedo_factor
        temp_efficiency_bonus = 1.0 + np.maximum(0.0, -temp_c) * 0.004  # +0.4%/°C below 0°C
        solar_kw = np.minimum(
            station.solar_capacity_kw,
            (effective_ghi / 1000.0) * station.solar_capacity_kw * 0.94 * temp_efficiency_bonus,
        )
        solar_kw = np.maximum(0.0, solar_kw)

        # --- Wind: cold-air-density-corrected IEC 61400-1 curve ---
        air_density = (pressure_hpa * 100.0) / (287.05 * (temp_c + 273.15))
        density_ratio = np.maximum(0.9, air_density / 1.225)
        wind_kw = _turbine_power_kw(wind_speed, density_ratio, station)

        # --- Thermal + electrical demand: heating-degree + wind-chill model ---
        cold_delta = np.maximum(0.0, -temp_c - 10.0)
        wind_chill_delta = np.maximum(0.0, wind_speed - 10.0) * 0.45
        thermal_kw = station.baseline_thermal_kw + cold_delta * 0.75 + wind_chill_delta
        hour_of_day = (np.arange(n) % 24)
        electrical_kw = station.baseline_electrical_kw + 4.5 * np.sin(
            (hour_of_day / 24.0) * 2.0 * np.pi - np.pi / 2.0
        )

        series = PolarWeatherSeries(
            time_utc=time_utc,
            solar_kw=solar_kw,
            solar_p10=np.maximum(0.0, solar_kw * 0.85),
            solar_p90=np.minimum(station.solar_capacity_kw, solar_kw * 1.15),
            wind_kw=wind_kw,
            wind_p10=np.maximum(0.0, wind_kw * 0.82),
            wind_p90=np.minimum(station.wind_capacity_kw, wind_kw * 1.18),
            electrical_kw=electrical_kw,
            thermal_kw=thermal_kw,
            electrical_p10=electrical_kw * 0.94,
            electrical_p90=electrical_kw * 1.06,
            thermal_p10=thermal_kw * 0.94,
            thermal_p90=thermal_kw * 1.06,
            is_live_api=True,
            source="Open-Meteo High-Latitude NWP (ECMWF IFS 0.25° / GFS Global / DWD ICON)",
        )
        return _truncate(series, hours_ahead)
    except Exception:
        return _synthetic_series(station, hours_ahead)


def _truncate(series: PolarWeatherSeries, hours_ahead: int) -> PolarWeatherSeries:
    if len(series.time_utc) <= hours_ahead:
        return series
    series.time_utc = series.time_utc[:hours_ahead]
    for f in (
        "solar_kw", "solar_p10", "solar_p90",
        "wind_kw", "wind_p10", "wind_p90",
        "electrical_kw", "thermal_kw",
        "electrical_p10", "electrical_p90", "thermal_p10", "thermal_p90",
    ):
        setattr(series, f, getattr(series, f)[:hours_ahead])
    return series


def _synthetic_series(station: StationSpec, hours_ahead: int) -> PolarWeatherSeries:
    """Climatology-shaped fallback — same functional form as
    generateSyntheticPolarForecast() in open-meteo.ts, used when the live
    API is unreachable so the endpoint still returns a full response.
    """
    t = np.arange(hours_ahead)
    hour_of_day = t % 24
    now = datetime.now(timezone.utc)
    time_utc = [(now + timedelta(hours=int(i))).isoformat() for i in t]

    elevation = np.maximum(0.0, np.sin((hour_of_day - 6.0) / 12.0 * np.pi))
    ghi = elevation * 380.0
    effective_ghi = ghi * station.bifacial_albedo_factor
    solar_kw = np.minimum(station.solar_capacity_kw, (effective_ghi / 1000.0) * station.solar_capacity_kw * 0.92)

    katabatic = np.sin((t / 16.0) * np.pi) * 5.0 + np.sin(t / 6.0) * 3.0
    wind_speed = np.maximum(4.0, 11.5 + katabatic)
    density_ratio = np.ones_like(wind_speed)
    wind_kw = _turbine_power_kw(wind_speed, density_ratio, station)

    temp_c = -18.5 - np.sin((hour_of_day / 24.0) * 2.0 * np.pi) * 4.2
    cold_delta = np.maximum(0.0, -temp_c - 10.0)
    thermal_kw = station.baseline_thermal_kw + cold_delta * 0.7
    electrical_kw = station.baseline_electrical_kw + 4.0 * np.sin(
        (hour_of_day / 24.0) * 2.0 * np.pi - np.pi / 2.0
    )

    return PolarWeatherSeries(
        time_utc=time_utc,
        solar_kw=solar_kw, solar_p10=np.maximum(0.0, solar_kw * 0.85),
        solar_p90=np.minimum(station.solar_capacity_kw, solar_kw * 1.15),
        wind_kw=wind_kw, wind_p10=np.maximum(0.0, wind_kw * 0.82),
        wind_p90=np.minimum(station.wind_capacity_kw, wind_kw * 1.18),
        electrical_kw=electrical_kw, thermal_kw=thermal_kw,
        electrical_p10=electrical_kw * 0.94, electrical_p90=electrical_kw * 1.06,
        thermal_p10=thermal_kw * 0.94, thermal_p90=thermal_kw * 1.06,
        is_live_api=False,
        source="High-Precision Polar Physics Climatology Engine (fallback — live API unreachable)",
    )
