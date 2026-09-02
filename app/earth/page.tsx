"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Globe, Sparkles, Map, Zap, Layers, MapPin } from "lucide-react";

const PolarGlobeGL = dynamic(
  () => import("@/components/globe/PolarGlobeGL").then((m) => m.PolarGlobeGL),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070B] text-sky-400 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-sky-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Globe className="absolute inset-0 m-auto w-6 h-6 text-sky-400/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Initializing Globe.gl</p>
          <p className="text-[11px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
            Loading 3D Planetary Engine...
          </p>
        </div>
      </div>
    ),
  }
);

const PolarStationMap = dynamic(
  () => import("@/components/globe/PolarStationMap").then((m) => m.PolarStationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070B] text-[#7DD3FC] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-sky-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <MapPin className="absolute inset-0 m-auto w-6 h-6 text-sky-400/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Initializing OpenStreetMap</p>
          <p className="text-[11px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
            Loading High-Resolution Station Site Layout...
          </p>
        </div>
      </div>
    ),
  }
);

const PolarMaplibreGlobe = dynamic(
  () => import("@/components/globe/PolarMaplibreGlobe").then((m) => m.PolarMaplibreGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070B] text-emerald-400 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Map className="absolute inset-0 m-auto w-6 h-6 text-emerald-400/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Initializing MapLibre GL</p>
          <p className="text-[11px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
            Loading Vector Globe...
          </p>
        </div>
      </div>
    ),
  }
);

type Engine = "globegl" | "station-osm" | "maplibre";

export function Earth3DPage() {
  const [engine, setEngine] = useState<Engine>("globegl");

  return (
    <div className="relative w-screen h-screen bg-[#05070B] text-white flex flex-col overflow-hidden">
      {/* ── Cinematic Header ──────────────────────────── */}
      <header
        className="relative h-14 flex items-center justify-between px-5 z-30 shrink-0"
        style={{
          background: "linear-gradient(to bottom, rgba(5,7,11,0.95) 0%, rgba(5,7,11,0.70) 70%, transparent 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] text-gray-400 hover:text-white transition-all duration-200 text-xs btn-press"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Console
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-500/30 to-blue-700/30 border border-sky-400/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-[13px] font-semibold text-white">
                3D Earth &amp; OpenStreetMap Station Twin
              </h1>
              <p className="text-[10px] text-gray-500 font-mono">Antarctic Microgrid Asset Visualizer</p>
            </div>
          </div>
        </div>

        {/* Center: Status Badges */}
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300">
            ● Real-Time WebGL Active
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-400">
            Maitri: 70.77°S 11.73°E
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-400">
            Bharati: 69.41°S 76.19°E
          </span>
        </div>

        {/* Right: Engine Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
          <button
            onClick={() => setEngine("globegl")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 btn-press ${
              engine === "globegl"
                ? "bg-sky-500/15 text-sky-200 border border-sky-400/30 shadow-[0_0_10px_rgba(125,211,252,0.12)]"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            3D Globe.gl
          </button>
          <button
            onClick={() => setEngine("station-osm")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 btn-press ${
              engine === "station-osm"
                ? "bg-violet-500/15 text-violet-200 border border-violet-400/30 shadow-[0_0_10px_rgba(167,139,250,0.12)]"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            <MapPin className="w-3 h-3" />
            OpenStreetMap Site
          </button>
          <button
            onClick={() => setEngine("maplibre")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 btn-press ${
              engine === "maplibre"
                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.12)]"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            <Map className="w-3 h-3" />
            MapLibre
          </button>
        </div>
      </header>

      {/* ── Viewport ─────────────────────────────────── */}
      <div className="flex-1 relative w-full overflow-hidden">
        {engine === "globegl" && <PolarGlobeGL />}
        {engine === "station-osm" && <PolarStationMap />}
        {engine === "maplibre" && <PolarMaplibreGlobe />}
      </div>

      {/* ── Bottom Gradient Fade ──────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, rgba(5,7,11,0.6) 0%, transparent 100%)" }}
      />
    </div>
  );
}

export default Earth3DPage;
