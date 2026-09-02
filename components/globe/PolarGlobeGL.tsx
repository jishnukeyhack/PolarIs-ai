"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sun,
  Wind,
  Battery,
  Zap,
  Layers,
  Activity,
  Globe2,
  Sparkles,
} from "lucide-react";
import { usePolarisStore } from "@/lib/store";
import { STATIONS, getLiveNetworkState } from "@/lib/seed-data";

// Dynamically import react-globe.gl with ssr: false
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#06080C] text-[#7DD3FC] gap-3">
      <div className="w-10 h-10 border-2 border-[#7DD3FC] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono tracking-wider uppercase text-gray-400">
        Loading High-Resolution 3D Planetary Earth...
      </span>
    </div>
  ),
});

interface StationPoint {
  id: string;
  code: string;
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
}

const POLAR_POINTS = STATIONS.map((s, index) => {
  // Cycle through some colors for variety
  const colors = ["#7DD3FC", "#34D399", "#A78BFA", "#FCD34D", "#FB923C"];
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    lat: s.coordinates.lat,
    lng: s.coordinates.lng,
    size: 1.2,
    color: colors[index % colors.length],
    altitude: 0.05 + (index * 0.01),
  };
});

// 3D Microgrid Power Flow & Telemetry Arcs
const POLAR_ARCS = [
  {
    startLat: -70.7667,
    startLng: 11.7333,
    endLat: -70.77,
    endLng: 11.83,
    color: ["#7DD3FC", "#A78BFA"],
    name: "Maitri <-> Maitri II Microgrid HVDC Intertie",
    dashLength: 0.4,
    dashGap: 0.2,
    dashAnimateTime: 2000,
  },
  {
    startLat: -70.7667,
    startLng: 11.7333,
    endLat: -69.4075,
    endLng: 76.1872,
    color: ["#34D399", "#7DD3FC"],
    name: "Inter-Station NCPOR SCADA Telemetry Uplink",
    dashLength: 0.5,
    dashGap: 0.3,
    dashAnimateTime: 3500,
  },
];

// 3D Pulsing Radar Rings
const POLAR_RINGS = [
  {
    lat: -70.7667,
    lng: 11.7333,
    maxR: 9,
    propagationSpeed: 3.2,
    repeatPeriod: 1200,
    color: () => "#7DD3FC",
  },
  {
    lat: -69.4075,
    lng: 76.1872,
    maxR: 8,
    propagationSpeed: 2.8,
    repeatPeriod: 1500,
    color: () => "#34D399",
  },
];

// High-Definition CDN Texture Mirrors
const TEXTURES = {
  blueMarble: "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg",
  night: "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-night.jpg",
  dark: "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-dark.jpg",
  topology: "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png",
  nightSky: "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/night-sky.png",
};

export function PolarGlobeGL() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  const {
    timelineHour,
    selectedStationId,
    setSelectedStationId,
    resilienceModeActive,
    setActiveView,
    globeAltitude,
    setGlobeAltitude,
  } = usePolarisStore();

  const [selectedPoint, setSelectedPoint] = useState<StationPoint>(POLAR_POINTS[0]);
  const [globeReady, setGlobeReady] = useState<boolean>(false);
  const [textureMode, setTextureMode] = useState<"blue-marble" | "night">("blue-marble");

  const liveState = getLiveNetworkState(selectedStationId, timelineHour, resilienceModeActive);

  // Resize handler to fit 100% of container/screen
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || window.innerWidth,
          height: containerRef.current.clientHeight || window.innerHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial focus on Antarctica when globe is ready
  useEffect(() => {
    if (globeEl.current) {
      // Point camera at Antarctica / South Pole (-70.77°S, 11.73°E)
      globeEl.current.pointOfView(
        {
          lat: -70.7667,
          lng: 11.7333,
          altitude: 1.85,
        },
        1600
      );

      const controls = globeEl.current.controls();
      if (controls) {
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
      }
    }
  }, [globeReady]);

  // Handle Zoom change and check threshold for OpenStreetMap Station view
  const handleZoomChange = useCallback(() => {
    if (!globeEl.current) return;
    const pov = globeEl.current.pointOfView();
    if (pov && pov.altitude) {
      setGlobeAltitude(pov.altitude);
      // If user zoomed very close to the station (altitude <= 0.80), offer seamless OpenStreetMap transition
      if (pov.altitude <= 0.80) {
        setActiveView("station-map");
      }
    }
  }, [setActiveView, setGlobeAltitude]);

  // Camera Fly-To Maitri & Zoom into OpenStreetMap Station
  const flyToMaitri = useCallback(() => {
    if (!globeEl.current) return;
    setSelectedStationId("MAITRI");
    setSelectedPoint(POLAR_POINTS[0]);
    globeEl.current.pointOfView(
      {
        lat: -70.7667,
        lng: 11.7333,
        altitude: 0.78,
      },
      1400
    );
    // Smoothly switch to OpenStreetMap after fly-to
    setTimeout(() => {
      setActiveView("station-map");
    }, 1450);
  }, [setSelectedStationId, setActiveView]);

  // Camera Fly-To Bharati & Zoom into OpenStreetMap Station
  const flyToBharati = useCallback(() => {
    if (!globeEl.current) return;
    setSelectedStationId("BHARATI");
    setSelectedPoint(POLAR_POINTS[1]);
    globeEl.current.pointOfView(
      {
        lat: -69.4075,
        lng: 76.1872,
        altitude: 0.78,
      },
      1400
    );
    setTimeout(() => {
      setActiveView("station-map");
    }, 1450);
  }, [setSelectedStationId, setActiveView]);

  // Reset Antarctic Orbit
  const resetAntarcticOrbit = useCallback(() => {
    if (!globeEl.current) return;
    globeEl.current.pointOfView(
      {
        lat: -82.0,
        lng: 40.0,
        altitude: 2.2,
      },
      1200
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#06080C] select-none"
    >
      {/* Globe.GL 3D Canvas */}
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        onGlobeReady={() => setGlobeReady(true)}
        globeImageUrl={textureMode === "blue-marble" ? TEXTURES.blueMarble : TEXTURES.night}
        bumpImageUrl={TEXTURES.topology}
        backgroundImageUrl={TEXTURES.nightSky}
        showAtmosphere={true}
        atmosphereColor="#38BDF8"
        atmosphereAltitude={0.25}
        // 3D Station Points
        pointsData={POLAR_POINTS}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="size"
        pointLabel={(d: any) => `
          <div style="background: rgba(11, 14, 20, 0.92); color: #FFF; padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); font-family: system-ui, monospace; font-size: 11px; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
            <b style="color: ${d.color}; font-size: 13px;">${d.name}</b><br/>
            <div style="margin-top: 4px; color: #9CA3AF;">Coords: ${Math.abs(d.lat).toFixed(2)}°S, ${d.lng.toFixed(2)}°E</div>
            <div style="color: #FB923C;">Load Demand: <b>${liveState.loadKw.toFixed(1)} kW</b></div>
            <div style="color: #34D399;">Solar GHI: <b>${liveState.solarKw.toFixed(1)} kW</b></div>
            <div style="color: #7DD3FC;">Wind Power: <b>${liveState.windKw.toFixed(1)} kW</b></div>
            <div style="color: #A78BFA;">BESS SOC: <b>${liveState.batterySoc.toFixed(1)}%</b></div>
            <div style="margin-top: 6px; color: #38BDF8; font-size: 10px;">🔍 Click to Zoom into Station OpenStreetMap</div>
          </div>
        `}
        onPointClick={(pt: any) => {
          setSelectedPoint(pt);
          setSelectedStationId(pt.code);
          globeEl.current?.pointOfView(
            {
              lat: pt.lat,
              lng: pt.lng,
              altitude: 0.78,
            },
            1200
          );
          setTimeout(() => {
            setActiveView("station-map");
          }, 1250);
        }}
        // 3D Pulsing Radar Rings
        ringsData={POLAR_RINGS}
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        // 3D Microgrid Power Flow Arcs
        arcsData={POLAR_ARCS}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.18}
        arcStroke={2.0}
        arcDashLength="dashLength"
        arcDashGap="dashGap"
        arcDashAnimateTime="dashAnimateTime"
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            const pov = globeEl.current?.pointOfView();
            if (pov) {
              const newAlt = Math.max(0.4, pov.altitude * 0.75);
              globeEl.current.pointOfView({ ...pov, altitude: newAlt }, 400);
              if (newAlt <= 0.82) {
                setTimeout(() => setActiveView("station-map"), 450);
              }
            }
          }}
          title="Zoom In (Auto-transitions to OpenStreetMap when close)"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <Maximize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={() => {
            const pov = globeEl.current?.pointOfView();
            if (pov) {
              globeEl.current.pointOfView({ ...pov, altitude: Math.min(3.5, pov.altitude * 1.35) }, 400);
            }
          }}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <Minimize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={flyToMaitri}
          title="Fly to Maitri Station & OpenStreetMap Layout"
          className="px-3 py-2 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-[#7DD3FC]/40 text-[#7DD3FC] text-xs font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5" />
          Focus Maitri
        </button>
        <button
          onClick={flyToBharati}
          title="Fly to Bharati Station & OpenStreetMap Layout"
          className="px-3 py-2 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-[#34D399]/40 text-[#34D399] text-xs font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5" />
          Focus Bharati
        </button>
        <button
          onClick={() => setActiveView("station-map")}
          title="Open High-Resolution OpenStreetMap Station Site View"
          className="px-3 py-2 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-[#A78BFA]/40 text-[#A78BFA] text-xs font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
          Station Map (OSM)
        </button>
        <button
          onClick={resetAntarcticOrbit}
          title="Reset Antarctic Orbit"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white/80 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTextureMode((m) => (m === "blue-marble" ? "night" : "blue-marble"))}
          title="Toggle Blue Marble Satellite / Night Earth Lights"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white/80 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <Globe2 className="w-4 h-4 text-[#A78BFA]" />
        </button>
      </div>

      {/* Floating Station Telemetry HUD Card */}
      {selectedPoint && (
        <div className="absolute bottom-6 left-6 z-20 w-84 rounded-2xl bg-[#0B0E14]/90 border border-white/12 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: selectedPoint.color }}
                />
                <h3 className="text-sm font-semibold text-white">{selectedPoint.name}</h3>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {Math.abs(selectedPoint.lat).toFixed(4)}°S, {selectedPoint.lng.toFixed(4)}°E • Antarctica
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                resilienceModeActive
                  ? "bg-[#FB923C]/20 border-[#FB923C]/40 text-[#FB923C]"
                  : "bg-[#34D399]/20 border-[#34D399]/40 text-[#34D399]"
              }`}
            >
              {resilienceModeActive ? "Resilience T-2" : "Autonomous Green"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#34D399] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Solar GHI</div>
                <div className="font-mono font-bold text-white">{liveState.solarKw.toFixed(1)} kW</div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#7DD3FC] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Wind Velocity</div>
                <div className="font-mono font-bold text-white">{liveState.windKw.toFixed(1)} kW</div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
              <Battery className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">BESS SOC</div>
                <div className="font-mono font-bold text-white">{liveState.batterySoc.toFixed(1)}%</div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FB923C] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Habitat Load</div>
                <div className="font-mono font-bold text-white">{liveState.loadKw.toFixed(1)} kW</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Globe.gl 3D WebGL Engine</span>
            <span className="text-[#7DD3FC]">Rayleigh Atmosphere Active</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolarGlobeGL;
