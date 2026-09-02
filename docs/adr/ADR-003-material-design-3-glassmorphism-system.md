# ADR-003: Material Design 3 Glassmorphism System for Polar UI

## Status
Accepted

## Context
PolarIs AI requires visual parity with Google DeepMind WeatherLab (`deepmind.google.com/science/weatherlab`), adhering to Google Material Design 3 guidelines while incorporating high-contrast, dark-mode glassmorphic surfaces suited for 24-hour polar operational consoles.

## Decision
1. **Design Tokens (`tokens.css`)**:
   - Primary: `#7DD3FC` (Ice / Wind)
   - Secondary: `#34D399` (Aurora / Solar)
   - Tertiary: `#A78BFA` (Storage / Battery)
   - Warning / Alert: `#FB923C` (Ember / Diesel)
   - Critical Alert: `#F04B4B` (Survival Mode Red)
   - Surfaces: `#06080C`, `#0B0E14`, `#12161F`, `#181C24`, `#232838`
2. **Glassmorphism**:
   - `background: color-mix(in srgb, var(--md-surface-container) 72%, transparent)`
   - `backdrop-filter: blur(20px) saturate(140%)`
   - `border: 1px solid rgba(255, 255, 255, 0.08)`
   - `box-shadow: 0 20px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,0.04)`
3. **Typography**:
   - Primary UI: Google Sans / Inter
   - Numerals & Display: Space Grotesk
   - Telemetry, Coordinates, Timestamps: IBM Plex Mono (tabular nums)
4. **Motion**:
   - M3 standard easing: `cubic-bezier(0.2, 0, 0, 1)`
   - M3 emphasized easing: `cubic-bezier(0.3, 0, 0, 1)`
   - 60fps GPU-composited transitions only (`transform`, `opacity`).

## Consequences
- Authentic Google scientific application feel.
- Sub-second perceptual rendering.
