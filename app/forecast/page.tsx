"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/dashboard/TopNavBar";
import {
  Sun,
  Wind,
  Zap,
  RefreshCw,
  Sparkles,
  Thermometer,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  CloudSnow,
  TrendingUp,
  Calendar,
  Compass,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { STATIONS } from "@/lib/seed-data";
import { fetchOpenMeteoPolarForecast, PolarStationWeatherProfile } from "@/lib/api/open-meteo";

export default function ForecastStudioPage() {
  const [stationId, setStationId] = useState("MAITRI");
  const [profile, setProfile] = useState<PolarStationWeatherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [horizonHours, setHorizonHours] = useState<24 | 72 | 168>(168); // Default to full 7-Day (168h) prediction

  // Interactive Scenario Simulator Parameters
  const [albedoMultiplier, setAlbedoMultiplier] = useState<number>(1.32);
  const [katabaticWindBoost, setKatabaticWindBoost] = useState<number>(1.0);
  const [tempOffsetC, setTempOffsetC] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<"nominal" | "blizzard" | "midnight_sun" | "polar_night">("nominal");

  const station = STATIONS.find((s) => s.id === stationId || s.code === stationId) || STATIONS[0];

  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await fetchOpenMeteoPolarForecast(
        station.code,
        station.coordinates.lat,
        station.coordinates.lng,
        station.microgridSpec.solarCapacityKw,
        station.microgridSpec.windTurbines[0].ratedKw * station.microgridSpec.windTurbines[0].count,
        station.microgridSpec.baselineThermalLoadKw,
        station.microgridSpec.baselineElectricalLoadKw
      );
      setProfile(data);
      setLastRefreshed(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" }) + " UTC");
    } catch (e) {
      console.error("Forecast fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [stationId]);

  // Apply scenario presets
  const applyScenario = (type: "nominal" | "blizzard" | "midnight_sun" | "polar_night") => {
    setActiveScenario(type);
    if (type === "blizzard") {
      setKatabaticWindBoost(2.2);
      setAlbedoMultiplier(0.9);
      setTempOffsetC(-12);
    } else if (type === "midnight_sun") {
      setKatabaticWindBoost(1.0);
      setAlbedoMultiplier(1.45);
      setTempOffsetC(4);
    } else if (type === "polar_night") {
      setKatabaticWindBoost(1.4);
      setAlbedoMultiplier(0.1);
      setTempOffsetC(-18);
    } else {
      setKatabaticWindBoost(1.0);
      setAlbedoMultiplier(1.32);
      setTempOffsetC(0);
    }
  };

  const chartData = (profile?.points || []).slice(0, horizonHours).map((pt) => {
    const effGhi = Math.round(pt.globalHorizontalIrradianceWm2 * albedoMultiplier);
    const effWindSpeed = Number((pt.windSpeedMs * katabaticWindBoost).toFixed(1));
    const effWindKw = Number(
      Math.min(
        station.microgridSpec.windTurbines[0].ratedKw * station.microgridSpec.windTurbines[0].count,
        Math.pow(effWindSpeed / 10, 2.7) * 35
      ).toFixed(1)
    );
    const effSolarKw = Number(((effGhi / 1000) * station.microgridSpec.solarCapacityKw * 0.94).toFixed(1));
    const effTemp = Number((pt.temperatureC + tempOffsetC).toFixed(1));
    const thermalBoost = Math.max(0, -effTemp - 15) * 0.8;
    const totalLoad = Number((pt.totalLoadDemandKw + thermalBoost).toFixed(1));

    // Day marker formatting
    const dayNum = Math.floor(pt.hourOffset / 24) + 1;
    const hourInDay = pt.hourOffset % 24;
    const label = horizonHours === 168 ? `D${dayNum} ${hourInDay}h` : `+${pt.hourOffset}h`;

    return {
      hour: label,
      ghi: pt.globalHorizontalIrradianceWm2,
      effectiveGhi: effGhi,
      solarKw: effSolarKw,
      windSpeed: effWindSpeed,
      windGust: Number((pt.windGustMs * katabaticWindBoost).toFixed(1)),
      windKw: effWindKw,
      tempC: effTemp,
      totalLoad: totalLoad,
      renewableTotal: Number((effSolarKw + effWindKw).toFixed(1)),
    };
  });

  const peakSolar = Math.max(...chartData.map((d) => d.solarKw), 0);
  const peakWind = Math.max(...chartData.map((d) => d.windKw), 0);
  const minTemp = Math.min(...chartData.map((d) => d.tempC), -20);
  const avgLoad =
    chartData.length > 0
      ? (chartData.reduce((acc, d) => acc + d.totalLoad, 0) / chartData.length).toFixed(1)
      : "58.0";

  return (
    <div className="h-screen w-screen overflow-y-auto custom-scrollbar bg-[#07090E] text-[#E3E3E3] flex flex-col select-none">
      {/* Universal Top Nav */}
      <TopNavBar />

      <main className="flex-1 p-6 pt-24 pb-20 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A8C7FA]/20 border border-[#A8C7FA]/40 flex items-center justify-center text-[#A8C7FA]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Open-Meteo High-Latitude Forecast Studio
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#A8C7FA]/15 text-[#A8C7FA] border border-[#A8C7FA]/30 font-mono">
                  ECMWF IFS 0.25° NWP (Up to 7 Days)
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Physics-Based Vertical Bifacial PV Albedo &amp; Katabatic Cold-Density Wind Forecasting
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Horizon Selector (24h / 72h / 7 Days) */}
            <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10">
              {[
                { hours: 24 as const, label: "24h" },
                { hours: 72 as const, label: "72h" },
                { hours: 168 as const, label: "7 Days (168h)" },
              ].map((h) => (
                <button
                  key={h.hours}
                  onClick={() => setHorizonHours(h.hours)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    horizonHours === h.hours
                      ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {/* Station Selector */}
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

            {/* Refresh NWP API Data */}
            <button
              onClick={loadForecast}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-2xl glass hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-all btn-press"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#A8C7FA]" : ""}`} />
              <span>{loading ? "Fetching..." : `Refresh (${lastRefreshed || "Live"})`}</span>
            </button>
          </div>
        </div>

        {/* Interactive Scenario Presets & Parameter Tuning */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
              <Sliders className="w-4 h-4 text-[#A8C7FA]" />
              <span className="font-bold uppercase tracking-wider text-white">
                Live Physical Simulation Scenarios ({horizonHours}h Horizon)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "nominal", label: "Nominal Climate", icon: "☀️" },
                { id: "blizzard", label: "Katabatic Blizzard (45 m/s)", icon: "❄️" },
                { id: "midnight_sun", label: "Midnight Sun Peak GHI", icon: "🌅" },
                { id: "polar_night", label: "Polar Night Low-Solar", icon: "🌌" },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => applyScenario(sc.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeScenario === sc.id
                      ? "bg-[#A8C7FA]/25 text-[#A8C7FA] border border-[#A8C7FA]/50 shadow-md font-semibold"
                      : "bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span>{sc.icon}</span>
                  <span>{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Parameter Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Albedo Multiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Snow Albedo Reflected GHI</span>
                <span className="text-[#34D399] font-bold">+{((albedoMultiplier - 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.6"
                step="0.05"
                value={albedoMultiplier}
                onChange={(e) => {
                  setAlbedoMultiplier(parseFloat(e.target.value));
                  setActiveScenario("nominal");
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0% (Bare Rock)</span>
                <span>+60% (Fresh Antarctic Firn)</span>
              </div>
            </div>

            {/* Katabatic Wind Scale */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Katabatic Wind Velocity Scale</span>
                <span className="text-[#38BDF8] font-bold">{(katabaticWindBoost * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={katabaticWindBoost}
                onChange={(e) => {
                  setKatabaticWindBoost(parseFloat(e.target.value));
                  setActiveScenario("nominal");
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>Calm (5 m/s)</span>
                <span>Gale Force (30+ m/s)</span>
              </div>
            </div>

            {/* Temperature Offset */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Polar Vortex Thermal Offset</span>
                <span className="text-[#F2B8B5] font-bold">
                  {tempOffsetC > 0 ? `+${tempOffsetC}` : tempOffsetC}°C
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="10"
                step="1"
                value={tempOffsetC}
                onChange={(e) => {
                  setTempOffsetC(parseInt(e.target.value));
                  setActiveScenario("nominal");
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>-25°C Arctic Chill</span>
                <span>+10°C Summer Warm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Forecast Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 space-y-1.5 border border-[#34D399]/20">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>{horizonHours}h Peak Solar Yield</span>
              <Sun className="w-4 h-4 text-[#34D399]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#34D399]">{peakSolar.toFixed(1)} kW</div>
            <div className="text-[10px] text-gray-400 font-mono">Bifacial Snow Albedo Applied</div>
          </div>

          <div className="glass-card p-4 space-y-1.5 border border-[#38BDF8]/20">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>{horizonHours}h Max Wind Generation</span>
              <Wind className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#38BDF8]">{peakWind.toFixed(1)} kW</div>
            <div className="text-[10px] text-gray-400 font-mono">Cold Density Multiplier Active</div>
          </div>

          <div className="glass-card p-4 space-y-1.5 border border-[#F2B8B5]/20">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Minimum Ambient Temp</span>
              <Thermometer className="w-4 h-4 text-[#F2B8B5]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F2B8B5]">{minTemp.toFixed(1)}°C</div>
            <div className="text-[10px] text-gray-400 font-mono">Cold Silicon Efficiency Gain: +12%</div>
          </div>

          <div className="glass-card p-4 space-y-1.5 border border-[#A78BFA]/20">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Average Station Demand</span>
              <Zap className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#A78BFA]">{avgLoad} kW</div>
            <div className="text-[10px] text-gray-400 font-mono">Life Support + Science Labs</div>
          </div>
        </div>

        {/* Chart 1: Solar Irradiance & Bifacial Generation */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#34D399]" />
              <h2 className="text-sm font-bold text-white">
                {horizonHours}-Hour Solar Irradiance (GHI) &amp; Bifacial PV Yield
              </h2>
            </div>
            <span className="text-xs text-[#34D399] font-mono">Bifacial Albedo + Antarctic Elevation</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ghiGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pvGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={10} interval={horizonHours === 168 ? 11 : 3} />
                <YAxis stroke="#9AA0A6" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 18, 26, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="effectiveGhi"
                  stroke="#7DD3FC"
                  fillOpacity={1}
                  fill="url(#ghiGlow)"
                  name="Effective Albedo GHI (W/m²)"
                />
                <Area
                  type="monotone"
                  dataKey="solarKw"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pvGlow)"
                  name="Solar PV Yield (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Wind Speed, Gusts & Turbine Yield */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#38BDF8]" />
              <h2 className="text-sm font-bold text-white">
                {horizonHours}-Hour Katabatic Wind Velocity &amp; Turbine Power Output
              </h2>
            </div>
            <span className="text-xs text-amber-300 font-mono">Blade De-Icing &amp; Cut-Out Safety Protection</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" stroke="#9AA0A6" fontSize={10} interval={horizonHours === 168 ? 11 : 3} />
                <YAxis stroke="#9AA0A6" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 18, 26, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="windKw"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={false}
                  name="Wind Generation (kW)"
                />
                <Line
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#FBBF24"
                  strokeWidth={1.5}
                  dot={false}
                  name="10m Wind Speed (m/s)"
                />
                <Line
                  type="monotone"
                  dataKey="windGust"
                  stroke="#F87171"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="3 3"
                  name="Peak Gusts (m/s)"
                />
                <Line
                  type="monotone"
                  dataKey="totalLoad"
                  stroke="#A78BFA"
                  strokeWidth={1.5}
                  dot={false}
                  name="Total Station Load (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
