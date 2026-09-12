import numpy as np
from app.solver.pypsa_dispatcher import PolarMicrogridOptimizer


def test_pypsa_solver_power_balance():
    optimizer = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0)

    T = 24
    solar = [0.0] * 6 + [45.0, 75.0, 90.0, 85.0, 60.0, 30.0] + [0.0] * 12
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
    for soc in res["soc_trajectory"]:
        assert 20.0 <= soc <= 95.0, f"SOC violation: {soc}"

    # Power balance at each hour: Solar + Wind + Diesel + BattDis - BattChg == Total Served Load
    for t in range(T):
        gen = solar[t] + wind[t] + res["p_diesel"][t] + res["p_batt_discharge"][t] - res["p_batt_charge"][t]
        load = res["tier1_load"][t] + res["tier2_load"][t] + res["tier3_load"][t]
        assert np.isclose(gen, load, atol=1e-2), f"Power imbalance at hour {t}: gen={gen}, load={load}"

    # No shedding needed — diesel + battery + renewables comfortably cover this load
    assert sum(res["tier2_shed"]) == 0.0
    assert sum(res["tier3_shed"]) == 0.0


def test_survival_mode_load_shedding():
    optimizer = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0)

    T = 12
    solar = [0.0] * T
    wind = [0.0] * T
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
    for t in range(T):
        assert res["tier1_load"][t] == 35.0
        assert res["tier3_load"][t] == 0.0
        assert res["tier3_shed"][t] == 15.0
        assert res["tier2_load"][t] == 10.0
        assert res["tier2_shed"][t] == 10.0


def test_low_priority_tier_sheds_before_higher_priority_tier():
    """Tier 3 (lowest priority) should be sacrificed before Tier 2 whenever
    diesel + battery + renewables can't cover everything, even outside
    survival_mode — this is the LP-driven shedding the scipy version
    couldn't do (it only had the deterministic survival_mode pre-shed)."""
    optimizer = PolarMicrogridOptimizer(battery_cap_kwh=100.0, diesel_rated_kw=20.0)

    T = 24
    solar = list(np.maximum(0.0, 10.0 * np.sin((np.arange(T) - 6) / 12 * np.pi)))
    wind = [2.0] * T
    t1 = [18.0] * T  # tier1 alone is feasible on its own
    t2 = [30.0] * T
    t3 = [25.0] * T

    res = optimizer.solve(
        solar_forecast=solar,
        wind_forecast=wind,
        load_tier1=t1,
        load_tier2=t2,
        load_tier3=t3,
        initial_soc=0.30,
        survival_mode=False,
    )

    assert res["success"] is True
    assert sum(res["tier1_load"]) == sum(t1)  # tier1 always fully served
    assert sum(res["tier3_shed"]) > 0.0        # tier3 gets shed under scarcity
    assert sum(res["tier2_shed"]) < sum(res["tier3_shed"])  # tier2 protected relative to tier3


def test_pypsa_and_scipy_dispatchers_agree_when_resources_are_ample():
    """Sanity check that the PyPSA rebuild reproduces (not just resembles)
    the original scipy LP's fuel usage when nothing needs to be shed."""
    from app.solver.milp_dispatcher import PolarMicrogridOptimizer as ScipyOptimizer

    T = 24
    solar = [0.0] * 6 + [45.0, 75.0, 90.0, 85.0, 60.0, 30.0] + [0.0] * 12
    wind = [20.0 + 5.0 * np.sin(i * 0.3) for i in range(T)]
    t1, t2, t3 = [35.0] * T, [22.0] * T, [13.0] * T

    pypsa_res = PolarMicrogridOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0).solve(
        solar, wind, t1, t2, t3, initial_soc=0.80, survival_mode=False
    )
    scipy_res = ScipyOptimizer(battery_cap_kwh=600.0, diesel_rated_kw=150.0).solve(
        solar, wind, t1, t2, t3, initial_soc=0.80, survival_mode=False
    )

    # Same objective structure -> total diesel fuel burn should match closely
    assert np.isclose(pypsa_res["total_fuel_liters"], scipy_res["total_fuel_liters"], rtol=0.05)
