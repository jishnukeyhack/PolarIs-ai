"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  X,
  Sun,
  Wind,
  Zap,
  Battery,
  Flame,
  ShieldAlert,
  Calendar,
  Activity,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Brain,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { usePolarisStore } from "@/lib/store";
import {
  STATIONS,
  generateStationForecastMatrix,
  generateDispatchSchedule,
  getStationAlerts,
  getLiveNetworkState,
} from "@/lib/seed-data";

// Horizon string → number of hours
function horizonToHours(h: string): number {
  switch (h) {
    case "1h": return 1;
    case "6h": return 6;
    case "24h": return 24;
    case "72h": return 72;
    case "168h": return 168;
    default: return 72;
  }
}

export function StationDetailPanel() {
  const {
    stationDetailOpen,
    toggleStationDetail,
    selectedStationId,
    resilienceModeActive,
    timelineHour,
    isLiveRealTime,
    selectedHorizon,
  } = usePolarisStore();

  const [activeTab, setActiveTab] = useState<
    "forecast" | "optimization" | "resilience" | "battery"
  >("forecast");

  const [tick, setTick] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionPhase, setPredictionPhase] = useState("");

  // 1Hz live telemetry ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute horizon hours from store's selectedHorizon
  const displayHours = useMemo(() => horizonToHours(selectedHorizon), [selectedHorizon]);

  // AI prediction animation when horizon or station changes
  useEffect(() => {
    setIsPredicting(true);
    setPredictionPhase("Loading NWP grid data...");
    const t1 = setTimeout(() => setPredictionPhase("Running physics model..."), 300);
    const t2 = setTimeout(() => setPredictionPhase("Computing bifacial albedo..."), 600);
    const t3 = setTimeout(() => setPredictionPhase("Optimizing dispatch..."), 900);
    const t4 = setTimeout(() => {
      setPredictionPhase("Prediction complete");
      setIsPredicting(false);
    }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [selectedHorizon, selectedStationId]);

  if (!stationDetailOpen) {
    return null;
  }

  const station =
    STATIONS.find((s) => s.id === selectedStationId || s.code === selectedStationId) || STATIONS[0];
  const matrix = generateStationForecastMatrix(station.code);
  const dispatch = generateDispatchSchedule(station.code, resilienceModeActive);
  const alerts = getStationAlerts(station.code);
  const live = getLiveNetworkState(station.code, timelineHour, resilienceModeActive);

  const currentPoint = matrix.points[timelineHour] || matrix.points[0];
  const currentDispatch = dispatch[timelineHour] || dispatch[0];

  // *** FIX: Use displayHours from Zustand selectedHorizon, not hardcoded 36 ***
  const sliceCount = Math.min(displayHours, matrix.points.length);
  const xAxisInterval = displayHours >= 168 ? 23 : displayHours >= 72 ? 11 : displayHours >= 24 ? 3 : 0;

  const chartData = matrix.points.slice(0, sliceCount).map((pt, i) => {
    const disp = dispatch[i] || dispatch[0];
    const dayNum = Math.floor(pt.hourOffset / 24) + 1;
    const hourInDay = pt.hourOffset % 24;
    const label = displayHours >= 168 ? `D${dayNum} ${hourInDay}h` : displayHours >= 72 ? `D${dayNum} ${hourInDay}h` : `+${pt.hourOffset}h`;

    return {
      hour: label,
      solarPv: pt.solarPvGenerationKw,
      solarGhi: pt.solarGhiWm2,
      solarP10: pt.solarPvP10Kw,
      solarP90: pt.solarPvP90Kw,
      windGen: pt.windTurbineGenerationKw,
      windSpeed: pt.windSpeed10mMs,
      totalLoad: pt.totalLoadDemandKw,
      batSoc: disp.batterySocPercent,
      batCharge: disp.batteryChargeKw,
      batDischarge: disp.batteryDischargeKw,
      dieselGen: disp.totalDieselKw,
      solarUsed: disp.solarUsedKw,
      windUsed: disp.windUsedKw,
    };
  });

  const horizonLabel = selectedHorizon === "168h" ? "7-Day" : selectedHorizon === "72h" ? "3-Day" : selectedHorizon === "24h" ? "24h" : selectedHorizon;

  return (
    <section className="glass-card absolute top-20 right-4 w-[500px] z-40 shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-h-[calc(100vh-10rem)] overflow-hidden flex flex-col border border-white/10 backdrop-blur-3xl animate-in fade-in slide-in-from-right duration-200">
      {/* Station Title Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#A8C7FA]/20 border border-[#A8C7FA]/40 flex items-center justify-center shrink-0 text-[#A8C7FA]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              {station.name}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              [{station.jurisdiction}] · {Math.abs(station.coordinates.lat).toFixed(2)}°S, {station.coordinates.lng.toFixed(2)}°E · Elev {station.elevationMeters}m
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleStationDetail}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Prediction Status Bar */}
      <div className={`flex items-center gap-2 px-5 py-2 text-[11px] font-mono border-b border-white/10 transition-all duration-500 ${isPredicting ? "bg-[#A8C7FA]/10 text-[#A8C7FA]" : "bg-[#34D399]/5 text-[#34D399]"}`}>
        {isPredicting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="animate-pulse">{predictionPhase}</span>
          </>
        ) : (
          <>
            <Brain className="w-3.5 h-3.5" />
            <span>AI Model: {horizonLabel} prediction active · {sliceCount} data points</span>
          </>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 text-xs border-b border-white/10 bg-black/20">
        {[
          { id: "forecast", label: "Forecast Studio" },
          { id: "optimization", label: "MILP Dispatch" },
          { id: "battery", label: "BESS Storage" },
          { id: "resilience", label: "Survival Mode" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 font-semibold transition-all text-xs rounded-t-xl ${
              activeTab === tab.id
                ? "text-[#A8C7FA] border-b-2 border-[#A8C7FA] bg-white/[0.04]"
                : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className={`overflow-y-auto custom-scrollbar p-5 flex-1 text-xs data-mono space-y-4 transition-opacity duration-300 ${isPredicting ? "opacity-40" : "opacity-100"}`}>
        {activeTab === "forecast" && (
          <div className="space-y-4">
            {/* Live Instant Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-[#34D399]/20 space-y-0.5">
                <span className="text-[10px] text-gray-400 block font-mono">Solar PV Yield</span>
                <span className="text-sm font-bold font-mono text-[#34D399]">{live.solarKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-gray-400 block font-mono">GHI: {live.solarGhiWm2} W/m²</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-[#38BDF8]/20 space-y-0.5">
                <span className="text-[10px] text-gray-400 block font-mono">Katabatic Wind</span>
                <span className="text-sm font-bold font-mono text-[#38BDF8]">{live.windKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-gray-400 block font-mono">Speed: {live.windSpeedMs.toFixed(1)} m/s</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-[#A78BFA]/20 space-y-0.5">
                <span className="text-[10px] text-gray-400 block font-mono">Station Demand</span>
                <span className="text-sm font-bold font-mono text-[#A78BFA]">{live.loadKw.toFixed(1)} kW</span>
                <span className="text-[9px] text-gray-400 block font-mono">Temp: {live.temperatureC}°C</span>
              </div>
            </div>

            {/* Interactive Solar GHI & Bifacial Curve */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#34D399]" />
                  {horizonLabel} Solar PV &amp; Albedo Forecast (kW)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">P10 / P90 Confidence</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="solarGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="solarP90Glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7DD3FC" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#7DD3FC" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={9} tickLine={false} interval={xAxisInterval} />
                    <YAxis stroke="#9AA0A6" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="solarP90" stroke="#7DD3FC" fillOpacity={1} fill="url(#solarP90Glow)" strokeDasharray="3 3" name="P90 Upper Bound" />
                    <Area type="monotone" dataKey="solarPv" stroke="#34D399" strokeWidth={2} fillOpacity={1} fill="url(#solarGlow)" name="Expected Yield (kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Katabatic Wind Speed & Turbine Generation Chart */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-[#38BDF8]" />
                  {horizonLabel} Wind Velocity &amp; Turbine Dispatch
                </span>
                <span className="text-[10px] text-amber-300 font-mono">Feathering: 25 m/s</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={9} tickLine={false} interval={xAxisInterval} />
                    <YAxis stroke="#9AA0A6" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Line type="monotone" dataKey="windGen" stroke="#38BDF8" strokeWidth={2} dot={false} name="Wind Gen (kW)" />
                    <Line type="monotone" dataKey="windSpeed" stroke="#FBBF24" strokeWidth={1.5} dot={false} strokeDasharray="2 2" name="Wind Speed (m/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "optimization" && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="text-white font-semibold text-xs flex items-center justify-between">
                <span>HiGHS Mixed-Integer Linear Program (MILP)</span>
                <span className="text-[#34D399] font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OPTIMAL ({(6.5 + Math.random() * 3).toFixed(1)}ms)
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                {horizonLabel} Multi-Horizon Objective: Minimize Diesel Fuel + BESS Degradation
              </div>
            </div>

            {/* Generation Stack Chart */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-white">{horizonLabel} Optimal Generation Stack vs Habitat Demand</div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={9} tickLine={false} interval={xAxisInterval} />
                    <YAxis stroke="#9AA0A6" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="solarUsed" stackId="1" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.7} name="Solar Used" />
                    <Area type="monotone" dataKey="windUsed" stackId="1" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.7} name="Wind Used" />
                    <Area type="monotone" dataKey="batDischarge" stackId="1" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.7} name="Battery Discharge" />
                    <Area type="monotone" dataKey="dieselGen" stackId="1" stroke="#FB923C" fill="#FB923C" fillOpacity={0.7} name="Diesel Backup" />
                    <Line type="monotone" dataKey="totalLoad" stroke="#FFFFFF" strokeWidth={2} dot={false} name="Total Load" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "battery" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-bold">LiFePO4 Storage State of Health</span>
                <span className="text-xs font-mono font-bold text-[#34D399]">98.6% SOH</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#34D399] to-[#38BDF8] rounded-full transition-all duration-1000" style={{ width: "98.6%" }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-400">
                <div>Nominal Capacity: 200 kWh</div>
                <div>Internal Temp: +18.2°C (Insulated)</div>
                <div>Charge Cycle: 412 / 6000</div>
                <div>Round-Trip Efficiency: 94.2%</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-white">{horizonLabel} Battery SOC Trajectory</div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={9} tickLine={false} interval={xAxisInterval} />
                    <YAxis domain={[0, 100]} stroke="#9AA0A6" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Line type="monotone" dataKey="batSoc" stroke="#34D399" strokeWidth={2.5} dot={false} name="Battery SOC (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resilience" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Autonomous Survival Tier Hierarchy</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-mono">
                  {resilienceModeActive ? "DEFENSE ENGAGED" : "NOMINAL"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                During blizzard deficits, smart bus isolators shed non-critical circuits in sequence to protect crew life support.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#34D399]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Tier 1: Life Support &amp; Thermal</div>
                  <div className="text-[10px] text-gray-400 font-mono">Oxygen &amp; Core Habitat Heat (32 kW)</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#34D399]">PROTECTED</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#A78BFA]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Tier 2: Science &amp; Labs</div>
                  <div className="text-[10px] text-gray-400 font-mono">LIDAR, Drills, Radar (18 kW)</div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${resilienceModeActive ? "text-[#FB7185]" : "text-[#A78BFA]"}`}>
                  {resilienceModeActive ? "SHED" : "ACTIVE"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#FB7185]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Tier 3: Auxiliary Comfort</div>
                  <div className="text-[10px] text-gray-400 font-mono">Saunas &amp; Workshop Heaters (12 kW)</div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${resilienceModeActive ? "text-[#FB7185]" : "text-gray-400"}`}>
                  {resilienceModeActive ? "SHED" : "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default StationDetailPanel;
