"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Compass, Maximize2, Minimize2, RefreshCw, Zap, Battery, Sun, Wind } from "lucide-react";

interface PolarStationNode {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number]; // [Longitude, Latitude]
  elevation: number;
  currentLoadkW: number;
  solarGenerationKw: number;
  windGenerationKw: number;
  batteryStatus: string;
  statusColor: string;
}

const INDIAN_STATIONS: PolarStationNode[] = [
  {
    id: "maitri",
    code: "MAITRI",
    name: "Maitri Research Station (India)",
    coordinates: [11.7333, -70.7667],
    elevation: 117,
    currentLoadkW: 61.8,
    solarGenerationKw: 42.8,
    windGenerationKw: 31.5,
    batteryStatus: "78.4% Optimal",
    statusColor: "#7DD3FC",
  },
  {
    id: "bharati",
    code: "BHARATI",
    name: "Bharati Research Station (India)",
    coordinates: [76.1914, -69.4087],
    elevation: 35,
    currentLoadkW: 54.2,
    solarGenerationKw: 38.0,
    windGenerationKw: 45.2,
    batteryStatus: "91.2% Nominal",
    statusColor: "#34D399",
  },
  {
    id: "maitri-2",
    code: "MAITRI_2",
    name: "Maitri II (2029 Future Asset)",
    coordinates: [11.83, -70.77],
    elevation: 125,
    currentLoadkW: 35.0,
    solarGenerationKw: 60.0,
    windGenerationKw: 50.0,
    batteryStatus: "98.0% Standby",
    statusColor: "#A78BFA",
  },
];

export const PolarMaplibreGlobe: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<PolarStationNode>(INDIAN_STATIONS[0]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 1. Initialize MapLibre baseline configuration
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [11.7333, -70.7667], // Initial view focus centered on Maitri Station, Antarctica
      zoom: 2.2,
      maxZoom: 14,
    });

    mapInstance.current = map;

    // 2. Warp standard flat Web Mercator canvas into a true 3D Globe Projection
    map.on("style.load", () => {
      // Set globe projection
      try {
        // @ts-ignore - maplibre-gl globe projection support
        map.setProjection({ type: "globe" });
      } catch (e) {
        console.warn("Globe projection fallback to standard projection", e);
      }

      setMapLoaded(true);

      // 3. Inject interactive station network telemetry layers
      INDIAN_STATIONS.forEach((station) => {
        const tooltipHtml = `
          <div style="color: #F1F3F7; background: #0B0E14; font-family: system-ui, sans-serif; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); min-width: 180px;">
            <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: ${station.statusColor};">${station.name}</h4>
            <div style="font-size: 11px; margin-bottom: 3px; font-family: monospace; color: #9CA3AF;">Coords: ${Math.abs(station.coordinates[1]).toFixed(2)}°S, ${station.coordinates[0].toFixed(2)}°E</div>
            <div style="font-size: 11px; margin-bottom: 2px; color: #D1D5DB;"><b>Load Demand:</b> <span style="font-family: monospace; color: #FB923C;">${station.currentLoadkW} kW</span></div>
            <div style="font-size: 11px; margin-bottom: 2px; color: #D1D5DB;"><b>Solar GHI:</b> <span style="font-family: monospace; color: #34D399;">${station.solarGenerationKw} kW</span></div>
            <div style="font-size: 11px; margin-bottom: 2px; color: #D1D5DB;"><b>Wind Power:</b> <span style="font-family: monospace; color: #7DD3FC;">${station.windGenerationKw} kW</span></div>
            <div style="font-size: 11px; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); color: #A78BFA;"><b>BESS SOC:</b> ${station.batteryStatus}</div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(tooltipHtml);

        // Custom Marker Pin
        const el = document.createElement("div");
        el.className = "polar-custom-marker";
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = station.statusColor;
        el.style.border = "3px solid #FFFFFF";
        el.style.boxShadow = `0 0 16px ${station.statusColor}`;
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          setSelectedStation(station);
          map.flyTo({
            center: station.coordinates,
            zoom: 4.5,
            speed: 1.2,
            curve: 1.4,
            essential: true,
          });
        });

        new maplibregl.Marker({ element: el })
          .setLngLat(station.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    });

    // Clean canvas layers memory buffers upon component lifecycle unmounts
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const flyToMaitri = () => {
    if (!mapInstance.current) return;
    setSelectedStation(INDIAN_STATIONS[0]);
    mapInstance.current.flyTo({
      center: [11.7333, -70.7667],
      zoom: 4.5,
      speed: 1.2,
      essential: true,
    });
  };

  const flyToBharati = () => {
    if (!mapInstance.current) return;
    setSelectedStation(INDIAN_STATIONS[1]);
    mapInstance.current.flyTo({
      center: [76.1914, -69.4087],
      zoom: 4.5,
      speed: 1.2,
      essential: true,
    });
  };

  const resetPolarOrbit = () => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [11.7333, -70.7667],
      zoom: 2.2,
      speed: 0.8,
      essential: true,
    });
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#06080C] select-none">
      {/* MapLibre 3D Viewport Target Node */}
      <div ref={mapContainer} className="w-full h-full rounded-2xl" />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#06080C] flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-8 h-8 border-2 border-[#7DD3FC] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-gray-400">Loading MapLibre 3D Antarctic Globe...</span>
        </div>
      )}

      {/* Floating HUD Camera Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => mapInstance.current?.zoomIn()}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Maximize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={() => mapInstance.current?.zoomOut()}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Minimize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={flyToMaitri}
          title="Focus Maitri Station (-70.77°S, 11.73°E)"
          className="px-3 py-2 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-[#7DD3FC]/40 text-[#7DD3FC] text-xs font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5" />
          Focus Maitri
        </button>
        <button
          onClick={flyToBharati}
          title="Focus Bharati Station (-69.41°S, 76.19°E)"
          className="px-3 py-2 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-[#34D399]/40 text-[#34D399] text-xs font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5" />
          Focus Bharati
        </button>
        <button
          onClick={resetPolarOrbit}
          title="Reset Antarctic Orbit"
          className="p-2.5 rounded-xl bg-[#0B0E14]/85 hover:bg-[#181C24] border border-white/10 text-white/80 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Station Telemetry Card */}
      <div className="absolute bottom-6 left-6 z-20 w-80 rounded-2xl bg-[#0B0E14]/90 border border-white/12 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: selectedStation.statusColor }}
              />
              <h3 className="text-sm font-semibold text-white">{selectedStation.name}</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              {Math.abs(selectedStation.coordinates[1]).toFixed(4)}°S, {selectedStation.coordinates[0].toFixed(4)}°E • Elev: {selectedStation.elevation}m
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#34D399] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400">Solar GHI</div>
              <div className="font-mono font-bold text-white">{selectedStation.solarGenerationKw} kW</div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#7DD3FC] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400">Wind Power</div>
              <div className="font-mono font-bold text-white">{selectedStation.windGenerationKw} kW</div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
            <Battery className="w-4 h-4 text-[#A78BFA] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400">BESS Health</div>
              <div className="font-mono font-bold text-white">{selectedStation.batteryStatus}</div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FB923C] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400">Load Demand</div>
              <div className="font-mono font-bold text-white">{selectedStation.currentLoadkW} kW</div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>MapLibre 3D Vector Globe</span>
          <span className="text-[#34D399]">Projection: Globe</span>
        </div>
      </div>
    </div>
  );
};

export default PolarMaplibreGlobe;
