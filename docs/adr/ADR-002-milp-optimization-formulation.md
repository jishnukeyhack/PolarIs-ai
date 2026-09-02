# ADR-002: MILP Microgrid Dispatch Formulation with Polar-Night Handling

## Status
Accepted

## Context
Antarctic research station microgrids operate under extreme constraints:
1. Diesel fuel transport is costly and dangerous (seasonal shipping window).
2. Battery degradation is accelerated in sub-zero ambient temperatures.
3. Polar night creates 2-3 continuous months of zero solar irradiance ($P_{\text{solar}} = 0$).
4. System must prioritize critical life-support loads (Tier 1) over science experiments (Tier 2) and comfort/heating buffers (Tier 3).

## Decision
We formulate the microgrid dispatch as a Mixed-Integer Linear Program (MILP):

$$\min \sum_{t=1}^{T} \left( C_{\text{fuel}} \cdot P_{\text{diesel}}(t) + C_{\text{deg}} \cdot P_{\text{batt,dis}}(t) + C_{\text{penalty}} \cdot \sum_{k=1}^3 w_k \cdot P_{\text{shed},k}(t) \right)$$

Subject to:
1. **Power Balance**:
   $$P_{\text{solar}}(t) + P_{\text{wind}}(t) + P_{\text{diesel}}(t) + P_{\text{batt,dis}}(t) - P_{\text{batt,chg}}(t) = \sum_{k=1}^3 (P_{\text{load},k}(t) - P_{\text{shed},k}(t))$$
2. **Battery State of Charge (SOC)**:
   $$\text{SOC}(t+1) = \text{SOC}(t) + \frac{\eta_{\text{chg}} P_{\text{batt,chg}}(t) \Delta t}{E_{\text{cap}}} - \frac{P_{\text{batt,dis}}(t) \Delta t}{\eta_{\text{dis}} E_{\text{cap}}}$$
   $$\text{SOC}_{\min} \le \text{SOC}(t) \le \text{SOC}_{\max} \quad (0.20 \le \text{SOC} \le 0.95)$$
3. **Zero-Sensitive Adaptive Clustering for Polar Night**:
   When solar irradiance is zero across extended timesteps, the formulation bypasses solar ramping variables and tightens diesel spinning reserves to maintain grid inertia and prevent black-start failure.

## Consequences
- Guaranteed mathematical optimality with HiGHS / SciPy Linear Programming solver.
- Exact compliance with battery safety thresholds and tier-based shedding.
