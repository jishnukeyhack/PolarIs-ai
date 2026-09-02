import unittest
import sys
import os
import math

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.solver.milp_dispatcher import PolarMicrogridOptimizer

class TestOptimizer(unittest.TestCase):
    def setUp(self):
        self.optimizer = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0)

    def test_milp_power_balance_and_soc_bounds(self):
        T = 24
        solar = [0.0]*6 + [45.0, 75.0, 90.0, 85.0, 60.0, 30.0] + [0.0]*12
        wind = [20.0 + 5.0 * math.sin(i * 0.3) for i in range(T)]
        t1 = [35.0] * T
        t2 = [22.0] * T
        t3 = [13.0] * T

        res = self.optimizer.solve(
            solar_forecast=solar,
            wind_forecast=wind,
            load_tier1=t1,
            load_tier2=t2,
            load_tier3=t3,
            initial_soc=0.80,
            survival_mode=False,
        )

        self.assertTrue(res["success"])
        for soc in res["soc_trajectory"]:
            self.assertGreaterEqual(soc, 20.0)
            self.assertLessEqual(soc, 95.0)

        for t in range(T):
            gen = solar[t] + wind[t] + res["p_diesel"][t] + res["p_batt_discharge"][t] - res["p_batt_charge"][t]
            load = res["tier1_load"][t] + res["tier2_load"][t] + res["tier3_load"][t]
            self.assertAlmostEqual(gen, load, delta=0.05)

    def test_survival_mode_tier_shedding(self):
        T = 12
        solar = [0.0] * T
        wind = [0.0] * T
        t1 = [35.0] * T
        t2 = [20.0] * T
        t3 = [15.0] * T

        res = self.optimizer.solve(
            solar_forecast=solar,
            wind_forecast=wind,
            load_tier1=t1,
            load_tier2=t2,
            load_tier3=t3,
            initial_soc=0.50,
            survival_mode=True,
        )

        self.assertTrue(res["success"])
        for t in range(T):
            self.assertEqual(res["tier1_load"][t], 35.0)
            self.assertEqual(res["tier3_load"][t], 0.0)
            self.assertEqual(res["tier3_shed"][t], 15.0)
            self.assertEqual(res["tier2_load"][t], 10.0)
            self.assertEqual(res["tier2_shed"][t], 10.0)

if __name__ == "__main__":
    unittest.main()
