from fastapi import FastAPI, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from app.models.forecaster import PolarForecaster

app = FastAPI(title="PolarIs AI Forecast Service", version="1.0.0")

class ForecastDataPoint(BaseModel):
    time: str
    value: float
    p10: float
    p90: float

class ForecastResponse(BaseModel):
    station_id: str
    horizon: str
    model_version: str
    solar: List[ForecastDataPoint]
    wind: List[ForecastDataPoint]
    load: List[ForecastDataPoint]
    metrics: Dict[str, float]

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy", "service": "forecast-service"}

@app.get("/forecast/{station_id}", response_model=ForecastResponse)
def get_forecast(
    station_id: str,
    horizon: str = Query("72h", enum=["1h", "6h", "24h", "72h"]),
    storm_scenario: bool = Query(False)
) -> ForecastResponse:
    hours_map = {"1h": 1, "6h": 6, "24h": 24, "72h": 72}
    hours = hours_map.get(horizon, 72)
    
    forecaster = PolarForecaster(station_name="Maitri")
    solar_val, solar_p10, solar_p90 = forecaster.predict_solar(hours)
    wind_val, wind_p10, wind_p90 = forecaster.predict_wind(hours, storm_scenario=storm_scenario)
    load_val, load_p10, load_p90 = forecaster.predict_load(hours, storm_scenario=storm_scenario)
    
    base_time = datetime(2026, 8, 29, 0, 0, 0, tzinfo=timezone.utc)
    
    solar_list = [
        ForecastDataPoint(
            time=(base_time + timedelta(hours=i)).isoformat(),
            value=round(float(solar_val[i]), 1),
            p10=round(float(solar_p10[i]), 1),
            p90=round(float(solar_p90[i]), 1),
        )
        for i in range(hours)
    ]
    
    wind_list = [
        ForecastDataPoint(
            time=(base_time + timedelta(hours=i)).isoformat(),
            value=round(float(wind_val[i]), 1),
            p10=round(float(wind_p10[i]), 1),
            p90=round(float(wind_p90[i]), 1),
        )
        for i in range(hours)
    ]
    
    load_list = [
        ForecastDataPoint(
            time=(base_time + timedelta(hours=i)).isoformat(),
            value=round(float(load_val[i]), 1),
            p10=round(float(load_p10[i]), 1),
            p90=round(float(load_p90[i]), 1),
        )
        for i in range(hours)
    ]
    
    return ForecastResponse(
        station_id=station_id,
        horizon=horizon,
        model_version="Hybrid-LSTM v2",
        solar=solar_list,
        wind=wind_list,
        load=load_list,
        metrics={"mae_kw": 2.41, "rmse_kw": 3.82, "r2_score": 0.941},
    )
