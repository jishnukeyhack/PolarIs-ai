"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePolarisStore } from "@/lib/store";
import { STATIONS, getLiveNetworkState } from "@/lib/seed-data";
import {
  Sun,
  Wind,
  Battery,
  Flame,
  Activity,
  Zap,
  ShieldAlert,
  Globe2,
  CheckCircle2,
  Sliders,
  Cpu,
} from "lucide-react";

// Dynamically import 3D Polar Globe with ssr: false
const PolarGlobeGL = dynamic(
  () => import("@/components/globe/PolarGlobeGL").then((mod) => mod.PolarGlobeGL),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090E] text-[#E3E3E3] gap-3">
        <div className="w-10 h-10 border-2 border-[#A8C7FA] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase text-gray-400">
          Initializing 3D Planetary Earth...
        </span>
      </div>
    ),
  }
);

// Dynamically import Station Site Map
const PolarStationMap = dynamic(
  () => import("@/components/globe/PolarStationMap").then((mod) => mod.PolarStationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090E] text-[#E3E3E3] gap-3">
        <div className="w-10 h-10 border-2 border-[#A8C7FA] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase text-gray-400">
          Loading High-Resolution Google Maps Satellite Station Site...
        </span>
      </div>
    ),
  }
);

export function CenterVisualizer() {
  const {
    activeView,
    setActiveView,
    timelineHour,
    selectedStationId,
    resilienceModeActive,
    toggleResilienceMode,
  } = usePolarisStore();

  const liveState = getLiveNetworkState(selectedStationId, timelineHour, resilienceModeActive);
  const currentStation =
    STATIONS.find((s) => s.id === selectedStationId || s.code === selectedStationId) || STATIONS[0];

  if (activeView === "radar-map") {
    return <PolarGlobeGL />;
  }

  if (activeView === "station-map") {
    return <PolarStationMap />;
  }

  // Single-Line Power Flow Bus Diagram View (Fully Scrollable)
  return (
    <div className="relative w-full h-full overflow-y-auto custom-scrollbar bg-[#07090E] flex flex-col items-center p-6 pt-20 pb-36 select-none">
      {/* Bus Diagram Surface */}
      <div className="w-full max-w-5xl glass-card p-8 shadow-2xl space-y-8 my-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#A8C7FA] uppercase font-bold">
              SCADA 400V AC Microgrid Topology
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {currentStation.name} Bus Dispatch
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleResilienceMode()}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${
                resilienceModeActive
                  ? "bg-[#FB7185]/20 border-[#FB7185]/40 text-[#FB7185] shadow-[0_0_15px_rgba(251,113,133,0.3)]"
                  : "bg-[#34D399]/20 border-[#34D399]/40 text-[#34D399]"
              }`}
            >
              {resilienceModeActive ? "⚠️ TIER-2 SURVIVAL SHEDDING" : "● NOMINAL AUTONOMOUS MILP"}
            </button>
            <button
              onClick={() => setActiveView("radar-map")}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#A8C7FA]" />
              <span>Back to Globe</span>
            </button>
          </div>
        </div>

        {/* 3-Column Power Flow Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Column 1: Renewable Generation Side */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
              Renewable Generation
            </h4>

            {/* Solar Bifacial PV */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#34D399]/30 flex items-center justify-between hover:border-[#34D399]/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Bifacial Solar PV</h5>
                  <span className="text-[11px] text-gray-400 font-mono">
                    GHI {liveState.solarGhiWm2} W/m²
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-[#34D399]">
                  +{liveState.solarPowerKw.toFixed(1)} kW
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">100% Utilized</span>
              </div>
            </div>

            {/* Katabatic Wind Turbines */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#38BDF8]/30 flex items-center justify-between hover:border-[#38BDF8]/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Katabatic Turbines</h5>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {liveState.windSpeedMs.toFixed(1)} m/s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-[#38BDF8]">
                  +{liveState.windPowerKw.toFixed(1)} kW
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">Direct-Drive</span>
              </div>
            </div>

            {/* Standby Diesel Genset */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#FB923C]/30 flex items-center justify-between hover:border-[#FB923C]/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FB923C]/20 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Diesel Genset</h5>
                  <span className="text-[11px] text-gray-400 font-mono">Standby Reserve</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-[#FB923C]">
                  {liveState.dieselKw > 0 ? `+${liveState.dieselKw.toFixed(1)} kW` : "0.0 kW"}
                </span>
                <span className="text-[10px] text-[#34D399] block font-mono">
                  {liveState.dieselKw === 0 ? "Fuel Saved" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Central 400V AC Bus & BESS Storage */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
            <div className="w-full text-center pb-3 border-b border-white/10">
              <span className="text-[11px] font-mono text-[#A8C7FA] uppercase tracking-wider font-bold">
                Main Switchgear Busbar
              </span>
              <div className="text-2xl font-mono font-bold text-white mt-1">400.2 V · 50.02 Hz</div>
              <span className="text-[10px] text-[#34D399] font-mono">Power Factor: 0.988</span>
            </div>

            {/* Central BESS Storage */}
            <div className="w-full p-5 rounded-2xl bg-gradient-to-br from-[#A78BFA]/10 to-transparent border border-[#A78BFA]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#A78BFA]">
                  <Battery className="w-5 h-5" />
                  <span className="font-bold text-sm">LiFePO4 BESS Storage</span>
                </div>
                <span className="text-sm font-mono font-bold text-white">
                  {liveState.batterySocPercent.toFixed(1)}% SOC
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#A78BFA] to-[#34D399]"
                  style={{ width: `${liveState.batterySocPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-gray-400 pt-1">
                <span>Flow: {liveState.batteryPowerFlowKw >= 0 ? `+${liveState.batteryPowerFlowKw.toFixed(1)} kW (Charging)` : `${liveState.batteryPowerFlowKw.toFixed(1)} kW (Discharging)`}</span>
                <span>Health: 98.6%</span>
              </div>
            </div>
          </div>

          {/* Column 3: Habitat Demand Loads */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
              Station Loads (Hierarchical)
            </h4>

            {/* Tier 1: Life Support */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#34D399]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Tier 1: Life Support</h5>
                  <span className="text-[11px] text-gray-400 font-mono">Habitat Heating</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-white">32.0 kW</span>
                <span className="text-[10px] text-[#34D399] block font-mono font-bold">PROTECTED</span>
              </div>
            </div>

            {/* Tier 2: Science Operations */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#A78BFA]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Tier 2: Science Labs</h5>
                  <span className="text-[11px] text-gray-400 font-mono">LIDAR, Drills</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-white">18.5 kW</span>
                <span className={`text-[10px] font-mono font-bold ${resilienceModeActive ? "text-[#FB7185]" : "text-[#A78BFA]"}`}>
                  {resilienceModeActive ? "SHED" : "SERVED"}
                </span>
              </div>
            </div>

            {/* Tier 3: Auxiliary */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#FB7185]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FB923C]/20 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Tier 3: Auxiliary</h5>
                  <span className="text-[11px] text-gray-400 font-mono">Sauna, Workshops</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-white">12.0 kW</span>
                <span className={`text-[10px] font-mono font-bold ${resilienceModeActive ? "text-[#FB7185]" : "text-gray-400"}`}>
                  {resilienceModeActive ? "SHED" : "SERVED"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CenterVisualizer;
