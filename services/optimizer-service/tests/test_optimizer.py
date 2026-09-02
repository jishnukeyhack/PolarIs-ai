import pytest
import numpy as np
from app.solver.milp_dispatcher import PolarMicrogridOptimizer

def test_milp_solver_power_balance():
    optimizer = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0)
    
    # 24-hour test case
    T = 24
    solar = [0.0]*6 + [45.0, 75.0, 90.0, 85.0, 60.0, 30.0] + [0.0]*12
    wind = [20.0 + 5.0 * np.sin(i * 0.3) for i in range(T)]
    t1 = [35.0] * T
    t2 = [22.0] * T
    t3 = [13.0] * T

    res = optimizer.solve(
        solar_forecast=solar,
        wind_forecast=wind,
        load_tier1=t1,
        load_tier2=t2,
        load_tier3=t3,
        initial_soc=0.80,
        survival_mode=False,
    )

    assert res["success"] is True
    # Verify battery SOC stays strictly within [20%, 95%]
    for soc in res["soc_trajectory"]:
        assert 20.0 <= soc <= 95.0, f"SOC violation: {soc}"

    # Verify power balance at each hour: Solar + Wind + Diesel + BattDis - BattChg == Total Served Load
    for t in range(T):
        gen = solar[t] + wind[t] + res["p_diesel"][t] + res["p_batt_discharge"][t] - res["p_batt_charge"][t]
        load = res["tier1_load"][t] + res["tier2_load"][t] + res["tier3_load"][t]
        assert np.isclose(gen, load, atol=1e-2), f"Power imbalance at hour {t}: gen={gen}, load={load}"

def test_survival_mode_load_shedding():
    optimizer = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0)
    
    T = 12
    solar = [0.0] * T
    wind = [0.0] * T # Extreme blizzard with wind turbine safety cutout
    t1 = [35.0] * T
    t2 = [20.0] * T
    t3 = [15.0] * T

    res = optimizer.solve(
        solar_forecast=solar,
        wind_forecast=wind,
        load_tier1=t1,
        load_tier2=t2,
        load_tier3=t3,
        initial_soc=0.50,
        survival_mode=True,
    )

    assert res["success"] is True
    # In survival mode: Tier 1 is 100% served, Tier 3 is 100% shed, Tier 2 is 50% shed
    for t in range(T):
        assert res["tier1_load"][t] == 35.0
        assert res["tier3_load"][t] == 0.0
        assert res["tier3_shed"][t] == 15.0
        assert res["tier2_load"][t] == 10.0
        assert res["tier2_shed"][t] == 10.0
