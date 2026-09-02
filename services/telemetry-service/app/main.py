from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
import time
import math

app = FastAPI(title="PolarIs AI Telemetry Ingestion Service", version="1.0.0")

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy", "service": "telemetry-service"}

@app.get("/telemetry/{station_id}/live")
def get_live_telemetry(station_id: str) -> Dict[str, Any]:
    now = time.time()
    t = now % 3600 # 1-hour cycle
    
    # Smooth continuous physical values
    solar = max(0.0, math.sin((t / 3600.0) * math.pi) * 88.0)
    wind = 42.0 + 12.0 * math.sin(t / 120.0)
    load = 68.0 + 6.0 * math.sin(t / 300.0)
    
    net_ren = solar + wind
    diesel = max(0.0, load - net_ren) if net_ren < load else 0.0
    soc = 82.5 + 4.0 * math.sin(t / 600.0)

    return {
        "station_id": station_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
        "solar_kw": round(solar, 1),
        "wind_kw": round(wind, 1),
        "diesel_kw": round(diesel, 1),
        "battery_soc_pct": round(soc, 1),
        "total_demand_kw": round(load, 1),
        "bus_frequency_hz": round(50.0 + 0.02 * math.sin(t / 10.0), 3),
        "bus_voltage_v": round(400.0 + 0.4 * math.sin(t / 15.0), 1),
    }
