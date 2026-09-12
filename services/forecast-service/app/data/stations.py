"""
Antarctic station registry — Python mirror of lib/seed-data.ts (STATIONS).

Keep this in sync with the frontend seed data. If you add/edit a station in
lib/seed-data.ts, update the matching entry here so forecast-service and the
Next.js console agree on coordinates and microgrid capacities.
"""
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass(frozen=True)
class StationSpec:
    code: str
    name: str
    latitude: float
    longitude: float
    elevation_m: float
    solar_capacity_kw: float
    bifacial_albedo_factor: float
    wind_capacity_kw: float          # sum of (ratedKw * count) across turbines
    wind_cut_in_ms: float
    wind_rated_ms: float
    wind_cut_out_ms: float
    battery_capacity_kwh: float
    battery_max_charge_kw: float
    battery_max_discharge_kw: float
    battery_soc_min: float
    battery_soc_max: float
    battery_efficiency: float
    diesel_rated_kw: float           # sum of ratedKw across gensets
    diesel_fuel_l_per_kwh: float     # weighted-avg fuel curve
    baseline_thermal_kw: float
    baseline_electrical_kw: float


STATIONS: Dict[str, StationSpec] = {
    "MAITRI": StationSpec(
        code="MAITRI",
        name="Maitri Research Station",
        latitude=-70.7667,
        longitude=11.7333,
        elevation_m=117,
        solar_capacity_kw=120,
        bifacial_albedo_factor=1.25,
        wind_capacity_kw=30 * 2,
        wind_cut_in_ms=3.5,
        wind_rated_ms=12.0,
        wind_cut_out_ms=25.0,
        battery_capacity_kwh=350,
        battery_max_charge_kw=90,
        battery_max_discharge_kw=120,
        battery_soc_min=0.20,
        battery_soc_max=0.95,
        battery_efficiency=0.94,
        diesel_rated_kw=100 * 2,
        diesel_fuel_l_per_kwh=0.28,
        baseline_thermal_kw=35.0,
        baseline_electrical_kw=28.0,
    ),
    "BHARATI": StationSpec(
        code="BHARATI",
        name="Bharati Research Station",
        latitude=-69.4075,
        longitude=76.1872,
        elevation_m=35,
        solar_capacity_kw=160,
        bifacial_albedo_factor=1.30,
        wind_capacity_kw=50 * 2,
        wind_cut_in_ms=3.0,
        wind_rated_ms=11.5,
        wind_cut_out_ms=28.0,
        battery_capacity_kwh=500,
        battery_max_charge_kw=150,
        battery_max_discharge_kw=180,
        battery_soc_min=0.20,
        battery_soc_max=0.95,
        battery_efficiency=0.95,
        diesel_rated_kw=150 * 2,
        diesel_fuel_l_per_kwh=0.26,
        baseline_thermal_kw=42.0,
        baseline_electrical_kw=36.0,
    ),
    "MAITRI_2": StationSpec(
        code="MAITRI_2",
        name="Maitri II Next-Gen Complex",
        latitude=-70.7700,
        longitude=11.8300,
        elevation_m=130,
        solar_capacity_kw=250,
        bifacial_albedo_factor=1.35,
        wind_capacity_kw=60 * 4,
        wind_cut_in_ms=2.8,
        wind_rated_ms=11.0,
        wind_cut_out_ms=30.0,
        battery_capacity_kwh=900,
        battery_max_charge_kw=250,
        battery_max_discharge_kw=300,
        battery_soc_min=0.15,
        battery_soc_max=0.98,
        battery_efficiency=0.96,
        diesel_rated_kw=0,  # next-gen complex — renewables + storage led
        diesel_fuel_l_per_kwh=0.28,
        baseline_thermal_kw=55.0,
        baseline_electrical_kw=45.0,
    ),
}

DEFAULT_STATION = "MAITRI"


def get_station(station_id: Optional[str]) -> StationSpec:
    """Resolve a station_id/station_code (case-insensitive) to its StationSpec.
    Falls back to Maitri if unknown, so forecast/optimize requests never 404
    on a typo'd or aliased station name during a demo.
    """
    if not station_id:
        return STATIONS[DEFAULT_STATION]
    key = station_id.strip().upper().replace("-", "_")
    return STATIONS.get(key, STATIONS[DEFAULT_STATION])
