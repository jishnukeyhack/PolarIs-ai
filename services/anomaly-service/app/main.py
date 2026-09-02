from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np

app = FastAPI(title="PolarIs AI Anomaly Detection Service", version="1.0.0")

class TelemetryPayload(BaseModel):
    station_id: str
    wind_speed_kmh: float
    ambient_temp_c: float
    generator_vibration_mm_s: float
    bus_frequency_hz: float
    battery_temp_c: float

class AnomalyResult(BaseModel):
    station_id: str
    anomaly_detected: bool
    risk_score: float # 0.0 to 1.0
    threat_level: str # normal | warning | critical
    triggered_rules: List[str]
    recommended_action: str

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy", "service": "anomaly-service"}

@app.post("/detect/telemetry", response_model=AnomalyResult)
def detect_telemetry(payload: TelemetryPayload) -> AnomalyResult:
    rules = []
    risk_score = 0.0

    # Rule 1: Extreme Blizzard Storm Front
    if payload.wind_speed_kmh >= 100.0 or payload.ambient_temp_c <= -35.0:
        rules.append(f"Blizzard warning: Wind speed {payload.wind_speed_kmh} km/h (threshold 100 km/h)")
        risk_score += 0.55

    # Rule 2: Generator Mechanical Vibration Fault
    if payload.generator_vibration_mm_s >= 4.5:
        rules.append(f"Generator mechanical vibration anomaly: {payload.generator_vibration_mm_s} mm/s")
        risk_score += 0.35

    # Rule 3: Grid Frequency Deviation
    if abs(payload.bus_frequency_hz - 50.0) >= 0.4:
        rules.append(f"Microgrid frequency excursion: {payload.bus_frequency_hz} Hz")
        risk_score += 0.25

    # Rule 4: Battery Sub-Zero Thermal Limit
    if payload.battery_temp_c <= -15.0:
        rules.append(f"Battery cell temperature below safety minimum: {payload.battery_temp_c} C")
        risk_score += 0.20

    risk_score = min(1.0, risk_score)
    threat = "critical" if risk_score >= 0.70 else "warning" if risk_score >= 0.35 else "normal"

    action = (
        "Trigger Polar Survival Mode and shed non-critical Tier 3 loads immediately."
        if threat == "critical"
        else "Preheat battery thermal blankets and monitor wind gusts."
        if threat == "warning"
        else "Nominal operations."
    )

    return AnomalyResult(
        station_id=payload.station_id,
        anomaly_detected=threat != "normal",
        risk_score=round(risk_score, 2),
        threat_level=threat,
        triggered_rules=rules,
        recommended_action=action,
    )
