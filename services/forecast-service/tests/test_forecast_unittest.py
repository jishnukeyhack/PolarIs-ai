import unittest
import sys
import os

# Add service paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.models.forecaster import PolarForecaster

class TestForecaster(unittest.TestCase):
    def setUp(self):
        self.forecaster = PolarForecaster(station_name="Maitri")

    def test_solar_forecast_bounds(self):
        val, p10, p90 = self.forecaster.predict_solar(hours_ahead=24)
        self.assertEqual(len(val), 24)
        self.assertTrue(all(v >= 0.0 for v in val))
        self.assertTrue(all(p10[i] <= val[i] for i in range(24)))
        self.assertTrue(all(p90[i] >= val[i] for i in range(24)))
        self.assertEqual(val[0], 0.0) # Night hours

    def test_wind_forecast_power_curve(self):
        val, p10, p90 = self.forecaster.predict_wind(hours_ahead=72, storm_scenario=False)
        self.assertEqual(len(val), 72)
        self.assertTrue(all(v >= 0.0 for v in val))
        self.assertTrue(all(v <= self.forecaster.wind_capacity_kw for v in val))

    def test_forecast_error_metrics(self):
        import numpy as np
        ground_truth = np.array([50.0, 55.0, 60.0, 65.0, 70.0])
        predictions = np.array([52.0, 54.0, 59.0, 67.0, 69.0])
        metrics = self.forecaster.evaluate_metrics(ground_truth, predictions)
        self.assertLess(metrics["mae_kw"], 5.0)
        self.assertLess(metrics["rmse_kw"], 5.0)

if __name__ == "__main__":
    unittest.main()
