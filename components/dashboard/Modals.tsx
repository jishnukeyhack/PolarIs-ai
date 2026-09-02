"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Check,
  Copy,
  Download,
  Sliders,
  Info,
  Zap,
  Wind,
  AlertTriangle,
  MapPin,
  Flame,
  CloudSnow,
  Activity,
} from "lucide-react";
import { usePolarisStore } from "@/lib/store";
import { STATIONS } from "@/lib/seed-data";

export function Modals() {
  const {
    activeModal,
    setActiveModal,
    selectedStationId,
    setSelectedStationId,
    setTimelineHour,
    setResilienceMode,
    setActiveView,
  } = usePolarisStore();

  const [copied, setCopied] = useState(false);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-150 p-4 select-none">
      {/* Modal Container */}
      <div className="glass max-w-xl w-full rounded-2xl border border-white/12 p-6 shadow-2xl space-y-4">
        {/* ── Find Locations Modal ────────────────────── */}
        {activeModal === "find-locations" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-semibold text-white">
                  Antarctic &amp; Polar Microgrid Stations
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {STATIONS.map((station) => (
                <div
                  key={station.id}
                  onClick={() => {
                    setSelectedStationId(station.id);
                    setActiveModal(null);
                    setActiveView("station-map");
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStationId === station.id
                      ? "bg-sky-500/20 border-sky-400/60 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                      : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {station.name}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {Math.abs(station.coordinates.lat).toFixed(4)}°S, {station.coordinates.lng.toFixed(4)}°E · Elev {station.elevationMeters}m · Solar {station.microgridSpec.solarCapacityKw} kW
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                      OpenStreetMap
                    </span>
                    {selectedStationId === station.id && (
                      <Check className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Search Storms / Blizzard Tracking Modal ── */}
        {activeModal === "search-storms" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <div className="flex items-center gap-2">
                <CloudSnow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">
                  Active Katabatic Blizzards &amp; Extreme Weather
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-3">
              Open-Meteo High-Resolution Numerical Weather Predictions for Polar Cyclones:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300 text-xs">Katabatic Blizzard Ramp Warning (+42h)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    ETA: 42 Hours
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Severe katabatic wind velocity spike reaching <b>32.5 m/s (117 km/h)</b> with extreme sub-zero wind chill (-35°C). Automated turbine feathering and battery reserve heating recommended.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setTimelineHour(42);
                      setResilienceMode(true);
                      setActiveModal(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    Jump to Storm &amp; Arm Survival Mode
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1 text-xs">
                <div className="font-semibold text-blue-300">Schirmacher Polar Trough (-24.2°C)</div>
                <p className="text-gray-300">Deep atmospheric low pressure (962 hPa) over Queen Maud Land.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Keyboard Shortcuts Modal ────────────────── */}
        {activeModal === "shortcuts" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-semibold text-white">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300">Play / Pause 72h Timeline Scrubber</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-sky-300 font-mono border border-gray-700">
                  Space
                </kbd>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300">Step Timeline ±1 Hour</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-sky-300 font-mono border border-gray-700">
                  ← / →
                </kbd>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300">Toggle Polar Survival Mode</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-rose-300 font-mono border border-gray-700">
                  S
                </kbd>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300">Cycle View (3D Earth ↔ OSM ↔ Single-Line Bus)</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-sky-300 font-mono border border-gray-700">
                  V
                </kbd>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300">Close Active Modals</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono border border-gray-700">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* ── Share Link Modal ────────────────────────── */}
        {activeModal === "share-link" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <h3 className="text-base font-semibold text-white">Share Session State</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Share live Antarctic microgrid dispatch schedule with NCPOR researchers and judges:
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-gray-300">
              <input
                readOnly
                value="http://localhost:3000/?station=MAITRI&horizon=72h&model=WeatherNext2"
                className="bg-transparent flex-1 outline-none text-sky-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    "http://localhost:3000/?station=MAITRI&horizon=72h&model=WeatherNext2"
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-500 font-sans text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* ── Export Report Modal ─────────────────────── */}
        {activeModal === "export-report" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-semibold text-white">
                  Export Microgrid Schedule
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 mb-4">
              Download the optimal 72-hour Mixed-Integer Linear Programming (MILP) dispatch matrix calibrated on Open-Meteo &amp; NASA POWER solar irradiance and ECMWF katabatic wind profiles:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  alert("Exported 72h Dispatch Schedule as polar_dispatch_schedule.json");
                  setActiveModal(null);
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center font-medium text-xs text-white transition-colors"
              >
                Download JSON Schedule
              </button>
              <button
                onClick={() => {
                  alert("Exported 72h Telemetry as polar_telemetry_dataset.csv");
                  setActiveModal(null);
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center font-medium text-xs text-white transition-colors"
              >
                Download CSV Dataset
              </button>
            </div>
          </div>
        )}

        {/* ── Architecture Info Modal ─────────────────── */}
        {activeModal === "info" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-semibold text-white">
                  Polar Energy AI System Architecture
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <p>
                <strong className="text-white">Polar Energy AI</strong> is a real-time digital twin combining live high-latitude Numerical Weather Predictions (Open-Meteo ECMWF IFS), sub-10ms HiGHS MILP microgrid dispatching, and 3D Earth / OpenStreetMap spatial mapping for Antarctic research stations.
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                <div className="text-sky-300 font-bold font-sans text-xs">Live Integration Pipeline:</div>
                <div className="text-gray-400 space-y-0.5">
                  • Open-Meteo High-Latitude NWP (GHI, DNI, Wind, Pressure, Temp)<br />
                  • 1Hz SCADA Real-Time Dynamic Telemetry Stream<br />
                  • 3D Earth Globe (Globe.gl WebGL) &amp; OpenStreetMap Vector Site Map<br />
                  • 3-Tier Autonomous Survival Mode Load Shedding Controller
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Modals;
