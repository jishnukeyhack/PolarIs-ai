# ADR-005: Resilience Layer and Polar Survival Mode

## Status
Accepted

## Context
During catastrophic Antarctic blizzard conditions (wind speeds > 120 km/h, sub -40°C temperature, zero solar radiation, potential wind turbine lockouts for structural safety):
1. Microgrid load must automatically shed non-critical assets to preserve life-support systems (heating, oxygen generation, water melt tanks, vital communications).
2. Battery SOC must be conserved to maintain reserve margins.
3. Operators require immediate visual feedback, alert banners, and single-click or automated emergency dispatch re-optimization.

## Decision
1. **Tiered Load Hierarchy**:
   - **Tier 1 (Life Support & Vital Comms)**: 100% protected, never shed under any circumstance.
   - **Tier 2 (Science Experiments & Core Labs)**: Throttled by 50%–75% during warning phase.
   - **Tier 3 (Comfort Heating, Secondary Lighting, Luxury Loads)**: 100% shed during Survival Mode.
2. **Resilience Triggers**:
   - Extreme storm detection (wind > 28 m/s or blizzard anomaly score > 0.85).
   - Low reserve margin (< 15%).
   - Operator manual override switch on the UI.
3. **UI Visual Feedback**:
   - Map recolors to warning amber/red palette.
   - Animated storm cyclone vectors intensify.
   - Network flow diagram highlights shed tier lines in dashed orange/red with live power drops.

## Consequences
- Prevents station blackout and catastrophic freeze-ups.
- Clear visual cues adhering to Google UX safety design standards.
