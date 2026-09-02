"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/dashboard/TopNavBar";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  BatteryCharging,
  Power,
} from "lucide-react";
import { STATIONS } from "@/lib/seed-data";

export default function SurvivalModePage() {
  const [stationId, setStationId] = useState("MAITRI");
  const [deficitKw, setDeficitKw] = useState(35); // Simulated sudden deficit (e.g. blizzard icing)
  const [tier1ManualTrip, setTier1ManualTrip] = useState(false); // Locked by safety protocol
  const [tier2Override, setTier2Override] = useState<"auto" | "force_shed" | "force_keep">("auto");
  const [tier3Override, setTier3Override] = useState<"auto" | "force_shed" | "force_keep">("auto");

  const station = STATIONS.find((s) => s.id === stationId || s.code === stationId) || STATIONS[0];

  // Automated 3-Tier Shedding Ladder Logic
  const tier1LoadKw = station.microgridSpec.baselineThermalLoadKw * 0.65; // ~28 kW
  const tier2LoadKw = station.microgridSpec.baselineElectricalLoadKw * 0.55; // ~20 kW
  const tier3LoadKw = (station.microgridSpec.baselineThermalLoadKw + station.microgridSpec.baselineElectricalLoadKw) * 0.25; // ~15 kW

  const isTier3Shed = tier3Override === "force_shed" || (tier3Override === "auto" && deficitKw > 10);
  const isTier2Shed = tier2Override === "force_shed" || (tier2Override === "auto" && deficitKw > 25);
  const isTier1Shed = tier1ManualTrip;

  const totalCurtailedKw = (isTier3Shed ? tier3LoadKw : 0) + (isTier2Shed ? tier2LoadKw : 0) + (isTier1Shed ? tier1LoadKw : 0);
  const remainingLoadKw = (isTier1Shed ? 0 : tier1LoadKw) + (isTier2Shed ? 0 : tier2LoadKw) + (isTier3Shed ? 0 : tier3LoadKw);

  // Battery runway calculation (assuming 160 kWh BESS available)
  const batteryReserveKwh = 160;
  const runwayHours = remainingLoadKw > 0 ? (batteryReserveKwh / Math.max(1, remainingLoadKw - (deficitKw > 50 ? 0 : 15))).toFixed(1) : "99+";

  return (
    <div className="h-screen w-screen overflow-y-auto custom-scrollbar bg-[#07090E] text-[#E3E3E3] flex flex-col select-none">
      {/* Universal Top Nav */}
      <TopNavBar />

      <main className="flex-1 p-6 pt-24 pb-20 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FB7185]/20 border border-[#FB7185]/40 flex items-center justify-center text-[#FB7185]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Polar Survival Mode &amp; 3-Tier Load Shedding Ladder
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30 font-mono">
                  Autonomous Blackout Defense
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Deterministic Hierarchical Circuit Shedding to Guarantee Habitat Thermal &amp; Life Support Survival
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10">
              {STATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStationId(s.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    stationId === s.id
                      ? "bg-[#A8C7FA]/20 text-[#A8C7FA] border border-[#A8C7FA]/40 shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Blackout Simulator Controls */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
              <Sliders className="w-4 h-4 text-[#FB7185]" />
              <span className="font-bold uppercase tracking-wider text-white">Live Grid Stress &amp; Energy Deficit Test</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-400">Survival Condition:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${deficitKw > 25 ? "bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/40" : "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40"}`}>
                {deficitKw > 25 ? "⚠️ TIER-2 SHEDDING ENGAGED" : deficitKw > 10 ? "⚡ TIER-3 AUXILIARY SHED" : "● NOMINAL MICROGRID BALANCE"}
              </span>
            </div>
          </div>

          {/* Interactive Deficit Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300">Simulate Net Generation Deficit (Wind Calm / Blizzard Icing)</span>
              <span className="text-[#FB7185] font-bold text-sm">{deficitKw} kW Deficit</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={deficitKw}
              onChange={(e) => setDeficitKw(parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0 kW (Balanced)</span>
              <span>25 kW (Tier 3 Shed)</span>
              <span>50 kW (Tier 2 Shed)</span>
              <span>70 kW (Severe Contingency)</span>
            </div>
          </div>
        </div>

        {/* 3 Tier Hierarchy Cards with Interactive Circuit Breakers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Life Support & Habitat Heat */}
          <div className={`glass-card p-6 border-2 transition-all space-y-4 ${isTier1Shed ? "border-red-600 bg-red-950/20" : "border-[#34D399]/40 bg-[#34D399]/[0.02]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                <h3 className="font-bold text-white text-base">Tier 1: Life Support</h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-mono font-bold">
                100% PROTECTED
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Oxygen concentrators, sub-ice freshwater melters, medical bay environmental controls, and core habitat heating circuits.
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Circuit Load:</span>
                <span className="text-white font-bold">{tier1LoadKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shedding Priority:</span>
                <span className="text-[#34D399] font-bold">NEVER SHEDDABLE</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-gray-400 font-mono">Safety Interlock:</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hardware Locked
              </span>
            </div>
          </div>

          {/* Tier 2: Scientific Instruments */}
          <div className={`glass-card p-6 border-2 transition-all space-y-4 ${isTier2Shed ? "border-[#FB7185]/60 bg-[#FB7185]/[0.05]" : "border-[#A78BFA]/40 bg-[#A78BFA]/[0.02]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isTier2Shed ? "text-[#FB7185]" : "text-[#A78BFA]"}`} />
                <h3 className="font-bold text-white text-base">Tier 2: Science Labs</h3>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${isTier2Shed ? "bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40" : "bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/40"}`}>
                {isTier2Shed ? "SHED (ISOLATED)" : "ACTIVE"}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Deep ice-core thermal drills, atmospheric LIDAR spectrometer, geomagnetic sensors, and computing clusters.
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Circuit Load:</span>
                <span className="text-white font-bold">{tier2LoadKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shedding Threshold:</span>
                <span className="text-[#A78BFA] font-bold">&gt; 25 kW Deficit</span>
              </div>
            </div>

            {/* Manual Override Switch */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-gray-400 font-mono">Breaker Override:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTier2Override("auto")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier2Override === "auto" ? "bg-white/20 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setTier2Override("force_shed")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier2Override === "force_shed" ? "bg-[#FB7185]/30 text-[#FB7185]" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Trip
                </button>
                <button
                  onClick={() => setTier2Override("force_keep")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier2Override === "force_keep" ? "bg-[#34D399]/30 text-[#34D399]" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Hold
                </button>
              </div>
            </div>
          </div>

          {/* Tier 3: Ancillary & Workshop Comfort */}
          <div className={`glass-card p-6 border-2 transition-all space-y-4 ${isTier3Shed ? "border-[#FB7185]/60 bg-[#FB7185]/[0.05]" : "border-[#FCA45A]/40 bg-[#FCA45A]/[0.02]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${isTier3Shed ? "text-[#FB7185]" : "text-[#FCA45A]"}`} />
                <h3 className="font-bold text-white text-base">Tier 3: Auxiliary</h3>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${isTier3Shed ? "bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40" : "bg-[#FCA45A]/20 text-[#FCA45A] border-[#FCA45A]/40"}`}>
                {isTier3Shed ? "SHED (FIRST OUT)" : "ACTIVE"}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Sauna &amp; gym comfort heaters, vehicle engine block pre-heaters, and uncrewed storage bay zone heating.
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Circuit Load:</span>
                <span className="text-white font-bold">{tier3LoadKw.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shedding Threshold:</span>
                <span className="text-[#FCA45A] font-bold">&gt; 10 kW Deficit</span>
              </div>
            </div>

            {/* Manual Override Switch */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-gray-400 font-mono">Breaker Override:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTier3Override("auto")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier3Override === "auto" ? "bg-white/20 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setTier3Override("force_shed")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier3Override === "force_shed" ? "bg-[#FB7185]/30 text-[#FB7185]" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Trip
                </button>
                <button
                  onClick={() => setTier3Override("force_keep")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${tier3Override === "force_keep" ? "bg-[#34D399]/30 text-[#34D399]" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Hold
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Runway & Telemetry Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Estimated BESS Runway</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{runwayHours} Hours</div>
              <div className="text-[10px] text-[#34D399] font-mono">Thermal Habitability Guaranteed</div>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FB7185]/20 border border-[#FB7185]/40 flex items-center justify-center text-[#FB7185]">
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Total Load Curtailed</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{totalCurtailedKw.toFixed(1)} kW</div>
              <div className="text-[10px] text-gray-400 font-mono">Remaining Demand: {remainingLoadKw.toFixed(1)} kW</div>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A8C7FA]/20 border border-[#A8C7FA]/40 flex items-center justify-center text-[#A8C7FA]">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">BESS Usable Reserve</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{batteryReserveKwh} kWh</div>
              <div className="text-[10px] text-[#A8C7FA] font-mono">LiFePO4 Safe Deep Discharge</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
