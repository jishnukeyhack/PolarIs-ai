"use client";

import React, { useState, useEffect } from "react";
import { Sun, Wind, Battery, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { usePolarisStore } from "@/lib/store";
import { getLiveNetworkState } from "@/lib/seed-data";

interface KpiPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  colorClass: string;
  glowColor: string;
}

function KpiPill({ icon, label, value, subValue, colorClass, glowColor }: KpiPillProps) {
  return (
    <div className="kpi-pill glass-sm rounded-xl px-2.5 py-1.5 flex items-center gap-2 cursor-default">
      <span className={`${colorClass} shrink-0`}>{icon}</span>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-mono">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] font-bold font-mono text-white tabular-nums">{value}</span>
          {subValue && <span className="text-[8px] font-mono text-gray-400">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

export function TopKpiPills() {
  const { selectedStationId, resilienceModeActive, timelineHour } = usePolarisStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => (t + 1) % 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  const live = getLiveNetworkState(selectedStationId, timelineHour, resilienceModeActive);
  const renewable = ((live.solarPowerKw + live.windPowerKw) / Math.max(live.totalLoadDemandKw, 1)) * 100;

  return (
    <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 z-30 hidden lg:flex items-center gap-1.5 py-1.5 px-1 pointer-events-none">
      <KpiPill
        icon={<Sun className="w-3 h-3" />}
        label="Solar PV"
        value={`${live.solarPowerKw.toFixed(1)} kW`}
        subValue={`${live.solarGhiWm2} W/m²`}
        colorClass="text-emerald-400"
        glowColor="#34D399"
      />
      <KpiPill
        icon={<Wind className="w-3 h-3" />}
        label="Wind"
        value={`${live.windPowerKw.toFixed(1)} kW`}
        subValue={`${live.windSpeedMs.toFixed(1)} m/s`}
        colorClass="text-sky-400"
        glowColor="#7DD3FC"
      />
      <KpiPill
        icon={<Battery className="w-3 h-3" />}
        label="BESS"
        value={`${live.batterySocPercent.toFixed(1)}%`}
        subValue={live.batteryPowerFlowKw >= 0 ? `+${live.batteryPowerFlowKw.toFixed(1)}kW` : `${live.batteryPowerFlowKw.toFixed(1)}kW`}
        colorClass="text-violet-400"
        glowColor="#A78BFA"
      />
      <KpiPill
        icon={<Zap className="w-3 h-3" />}
        label="Load"
        value={`${live.totalLoadDemandKw.toFixed(1)} kW`}
        subValue={`${live.gridFrequencyHz.toFixed(2)}Hz`}
        colorClass="text-amber-400"
        glowColor="#FCA45A"
      />

      <div className="w-px h-5 bg-white/10 mx-0.5" />

      {/* RE Penetration Gauge */}
      <div className="kpi-pill glass-sm rounded-xl px-2.5 py-1.5 flex items-center gap-2 cursor-default">
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-[8px] uppercase tracking-widest text-gray-500 font-mono">RE%</span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-bold font-mono tabular-nums"
              style={{ color: renewable > 80 ? "#34D399" : renewable > 50 ? "#FCA45A" : "#FB7185" }}
            >
              {Math.min(renewable, 100).toFixed(1)}%
            </span>
            <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(renewable, 100)}%`,
                  background:
                    renewable > 80
                      ? "linear-gradient(90deg, #34D399, #7DD3FC)"
                      : renewable > 50
                      ? "linear-gradient(90deg, #FCA45A, #FCD34D)"
                      : "linear-gradient(90deg, #FB7185, #FCA45A)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`kpi-pill glass-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 cursor-default border ${
          resilienceModeActive ? "border-rose-500/30" : "border-emerald-500/20"
        }`}
      >
        {resilienceModeActive ? (
          <>
            <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-semibold text-rose-300">Survival</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold text-emerald-300">Nominal</span>
          </>
        )}
      </div>
    </div>
  );
}

export default TopKpiPills;
