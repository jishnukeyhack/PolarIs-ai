from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.solver.milp_dispatcher import PolarMicrogridOptimizer

app = FastAPI(title="PolarIs AI MILP Optimizer Service", version="1.0.0")

class OptimizeRequest(BaseModel):
    solar_forecast: List[float]
    wind_forecast: List[float]
    load_tier1: List[float]
    load_tier2: List[float]
    load_tier3: List[float]
    initial_soc: float = Field(default=0.82, ge=0.20, le=0.95)
    survival_mode: bool = Field(default=False)
    battery_cap_kwh: float = Field(default=600.0)
    diesel_rated_kw: float = Field(default=150.0)

class OptimizeResponse(BaseModel):
    success: bool
    status: str
    p_diesel: List[float]
    p_batt_discharge: List[float]
    p_batt_charge: List[float]
    soc_trajectory: List[float]
    tier1_load: List[float]
    tier2_load: List[float]
    tier3_load: List[float]
    tier2_shed: List[float]
    tier3_shed: List[float]
    total_fuel_liters: float
    fuel_saved_pct: float
    co2_avoided_kg: float

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy", "service": "optimizer-service"}

@app.post("/optimize/dispatch", response_model=OptimizeResponse)
def optimize_dispatch(req: OptimizeRequest) -> OptimizeResponse:
    optimizer = PolarMicrogridOptimizer(
        battery_cap_kwh=req.battery_cap_kwh,
        diesel_rated_kw=req.diesel_rated_kw,
    )
    result = optimizer.solve(
        solar_forecast=req.solar_forecast,
        wind_forecast=req.wind_forecast,
        load_tier1=req.load_tier1,
        load_tier2=req.load_tier2,
        load_tier3=req.load_tier3,
        initial_soc=req.initial_soc,
        survival_mode=req.survival_mode,
    )
    return OptimizeResponse(**result)
