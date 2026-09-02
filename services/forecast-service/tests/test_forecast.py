import numpy as np
import pytest
from app.models.forecaster import PolarForecaster

def test_solar_forecast_bounds():
    forecaster = PolarForecaster(station_name="Maitri")
    val, p10, p90 = forecaster.predict_solar(hours_ahead=24)
    
    assert len(val) == 24
    assert np.all(val >= 0.0)
    assert np.all(p10 <= val)
    assert np.all(p90 >= val)
    # August night hours should be zero
    assert val[0] == 0.0  # 00:00 UTC is polar dark/night

def test_wind_forecast_power_curve():
    forecaster = PolarForecaster(station_name="Maitri")
    val, p10, p90 = forecaster.predict_wind(hours_ahead=72, storm_scenario=False)
    
    assert len(val) == 72
    assert np.all(val >= 0.0)
    assert np.all(val <= forecaster.wind_capacity_kw)

def test_forecast_error_metrics():
    forecaster = PolarForecaster(station_name="Maitri")
    ground_truth = np.array([50.0, 55.0, 60.0, 65.0, 70.0])
    predictions = np.array([52.0, 54.0, 59.0, 67.0, 69.0])
    
    metrics = forecaster.evaluate_metrics(ground_truth, predictions)
    assert metrics["mae_kw"] < 5.0
    assert metrics["rmse_kw"] < 5.0
