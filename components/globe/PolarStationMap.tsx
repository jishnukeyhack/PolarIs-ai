"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { usePolarisStore } from "@/lib/store";
import { STATIONS, getLiveNetworkState } from "@/lib/seed-data";
import {
  Sun,
  Wind,
  Battery,
  Flame,
  Zap,
  Globe2,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  Activity,
  Satellite,
  Compass,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

/*──────────────────────────────────────────────────────────────
  PolarIs.ai — High-Definition Google Maps & Satellite Integration
  Google Maps Satellite & Terrain with Real Microgrid Cable SCADA Bus
──────────────────────────────────────────────────────────────*/

interface AssetMarker {
  id: string;
  name: string;
  type: "solar" | "wind" | "battery" | "diesel" | "habitat" | "met";
  offsetLng: number;
  offsetLat: number;
  icon: string;
  color: string;
  rating: string;
  status: string;
}

const ASSET_MARKERS: AssetMarker[] = [
  {
    id: "hab",
    name: "Command Habitat & Life Support",
    type: "habitat",
    offsetLng: 0,
    offsetLat: 0,
    icon: "🏠",
    color: "#7DD3FC",
    rating: "400V AC Bus",
    status: "Nominal",
  },
  {
    id: "pv-e",
    name: "Bifacial Solar East Array",
    type: "solar",
    offsetLng: -0.0035,
    offsetLat: 0.0018,
    icon: "☀️",
    color: "#34D399",
    rating: "35 kWp Vertical",
    status: "Generating",
  },
  {
    id: "pv-w",
    name: "Bifacial Solar West Array",
    type: "solar",
    offsetLng: -0.0028,
    offsetLat: -0.0022,
    icon: "☀️",
    color: "#34D399",
    rating: "30 kWp Albedo",
    status: "Generating",
  },
  {
    id: "wt-1",
    name: "Cold-Climate Turbine #1",
    type: "wind",
    offsetLng: 0.0038,
    offsetLat: 0.0026,
    icon: "💨",
    color: "#38BDF8",
    rating: "25 kW Direct-Drive",
    status: "Spinning 42 RPM",
  },
  {
    id: "wt-2",
    name: "Cold-Climate Turbine #2",
    type: "wind",
    offsetLng: 0.0048,
    offsetLat: -0.0014,
    icon: "💨",
    color: "#38BDF8",
    rating: "25 kW Direct-Drive",
    status: "Spinning 38 RPM",
  },
  {
    id: "bess",
    name: "LiFePO4 BESS Storage Bank",
    type: "battery",
    offsetLng: 0.0018,
    offsetLat: -0.0028,
    icon: "🔋",
    color: "#A78BFA",
    rating: "200 kWh / 100 kW",
    status: "Optimal",
  },
  {
    id: "dg",
    name: "Diesel Genset Standby Bunker",
    type: "diesel",
    offsetLng: -0.0045,
    offsetLat: -0.0028,
    icon: "⛽",
    color: "#FB923C",
    rating: "2x 50 kW Scania",
    status: "Standby",
  },
  {
    id: "met",
    name: "LIDAR Met Mast & Sonic Anemometer",
    type: "met",
    offsetLng: 0.0055,
    offsetLat: 0.0012,
    icon: "📡",
    color: "#FCD34D",
    rating: "10m Tower",
    status: "Live Feed",
  },
];

// High-Definition Google Maps & Satellite Layer Tile Endpoints
const GOOGLE_MAPS_TILES = {
  "google-hybrid": {
    name: "Google Satellite (Hybrid)",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "Google Maps Imagery &copy; 2026 Maxar, CNES",
  },
  "google-satellite": {
    name: "Google Satellite (Pure)",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "Google Maps Satellite &copy; 2026",
  },
  "google-terrain": {
    name: "Google Terrain Relief",
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    attribution: "Google Maps Terrain &copy; 2026",
  },
  "carto-dark": {
    name: "Dark Matter SCADA",
    url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
    attribution: "CARTO, OpenStreetMap",
  },
};

export function PolarStationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ marker: maplibregl.Marker; type: string }[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [basemapType, setBasemapType] = useState<keyof typeof GOOGLE_MAPS_TILES>("google-hybrid");
  const [selectedAsset, setSelectedAsset] = useState<AssetMarker | null>(null);

  const {
    selectedStationId,
    setActiveView,
    resilienceModeActive,
    timelineHour,
    layerSolar,
    layerWind,
    layerBattery,
    layerDiesel,
    layerLoad,
  } = usePolarisStore();

  const currentStation =
    STATIONS.find((s) => s.id === selectedStationId || s.code === selectedStationId) || STATIONS[0];
  const live = getLiveNetworkState(selectedStationId, timelineHour, resilienceModeActive);

  const stationCoords: [number, number] = [
    currentStation.coordinates.lng,
    currentStation.coordinates.lat,
  ];

  // Initialize MapLibre with Google Maps tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];

    const selectedTile = GOOGLE_MAPS_TILES[basemapType];

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "google-maps-raster": {
            type: "raster",
            tiles: [selectedTile.url],
            tileSize: 256,
            attribution: selectedTile.attribution,
          },
        },
        layers: [
          {
            id: "google-maps-layer",
            type: "raster",
            source: "google-maps-raster",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: stationCoords,
      zoom: 14.8,
      pitch: 50,
      bearing: -15,
    });

    mapInstance.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      "bottom-right"
    );
    mapInstance.addControl(new maplibregl.ScaleControl({ maxWidth: 150 }), "bottom-left");

    mapInstance.on("load", () => {
      mapRef.current = mapInstance;
      setMapReady(true);
      mapInstance.resize();

      // Add Microgrid 400V Heat-Traced Underground Bus Cables
      const habLng = stationCoords[0];
      const habLat = stationCoords[1];

      const cableFeatures = ASSET_MARKERS.filter((a) => a.id !== "hab").map((asset) => ({
        type: "Feature" as const,
        properties: { color: asset.color, type: asset.type, name: asset.name },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [habLng, habLat],
            [habLng + asset.offsetLng, habLat + asset.offsetLat],
          ],
        },
      }));

      mapInstance.addSource("microgrid-cables", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: cableFeatures,
        },
      });

      mapInstance.addLayer({
        id: "cable-glow",
        type: "line",
        source: "microgrid-cables",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 6,
          "line-opacity": 0.45,
          "line-blur": 3,
        },
      });

      mapInstance.addLayer({
        id: "cable-core",
        type: "line",
        source: "microgrid-cables",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.5,
          "line-opacity": 0.95,
          "line-dasharray": [2, 1.5],
        },
      });

      // Add Station Asset Markers
      ASSET_MARKERS.forEach((asset) => {
        const el = document.createElement("div");
        el.className = "polar-interactive-marker";
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          " onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="
              width: 38px; height: 38px;
              border-radius: 50%;
              background: rgba(10, 14, 23, 0.92);
              border: 2px solid ${asset.color};
              display: flex; align-items: center; justify-content: center;
              font-size: 17px;
              box-shadow: 0 0 18px ${asset.color}77, 0 4px 14px rgba(0,0,0,0.85);
              backdrop-filter: blur(12px);
            ">${asset.icon}</div>
            <div style="
              margin-top: 4px;
              background: rgba(10, 14, 23, 0.92);
              border: 1px solid ${asset.color}66;
              border-radius: 8px;
              padding: 2px 8px;
              font-size: 10px;
              font-weight: 700;
              font-family: 'IBM Plex Mono', monospace;
              color: ${asset.color};
              white-space: nowrap;
              backdrop-filter: blur(12px);
              box-shadow: 0 2px 8px rgba(0,0,0,0.7);
            ">${asset.name}</div>
          </div>
        `;

        el.addEventListener("click", () => setSelectedAsset(asset));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stationCoords[0] + asset.offsetLng, stationCoords[1] + asset.offsetLat])
          .addTo(mapInstance);

        markersRef.current.push({ marker, type: asset.type });
      });
    });

    // Auto-resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [selectedStationId, basemapType]);

  // Apply layer filters dynamically to map markers
  useEffect(() => {
    markersRef.current.forEach(({ marker, type }) => {
      const el = marker.getElement();
      let visible = true;
      if (type === "solar" && !layerSolar) visible = false;
      if (type === "wind" && !layerWind) visible = false;
      if (type === "battery" && !layerBattery) visible = false;
      if (type === "diesel" && !layerDiesel) visible = false;
      if (type === "habitat" && !layerLoad) visible = false;

      el.style.display = visible ? "block" : "none";
    });
  }, [layerSolar, layerWind, layerBattery, layerDiesel, layerLoad]);

  const resetCamera = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: stationCoords,
      zoom: 14.8,
      pitch: 50,
      bearing: -15,
      essential: true,
    });
  }, [stationCoords]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06080C] select-none">
      {/* 1. Google Maps Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Top-Left Google Maps Controls & Basemap Switcher */}
      <div className="absolute top-20 left-6 z-30 flex flex-col gap-2">
        {/* Navigation Switcher */}
        <div className="glass-card rounded-2xl p-1.5 flex items-center gap-1 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={() => setActiveView("radar-map")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#A8C7FA] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 btn-press"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>3D Earth</span>
          </button>
          <button
            onClick={() => setActiveView("power-flow-diagram")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 btn-press"
          >
            <Activity className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Bus Diagram</span>
          </button>
        </div>

        {/* Google Maps Layer Switcher */}
        <div className="glass-card rounded-2xl p-1.5 flex items-center gap-1 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <Satellite className="w-3 h-3 text-[#A8C7FA]" /> Google:
          </div>
          <button
            onClick={() => setBasemapType("google-hybrid")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              basemapType === "google-hybrid"
                ? "bg-[#A8C7FA]/25 text-[#A8C7FA] border border-[#A8C7FA]/50 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setBasemapType("google-satellite")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              basemapType === "google-satellite"
                ? "bg-[#A8C7FA]/25 text-[#A8C7FA] border border-[#A8C7FA]/50 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setBasemapType("google-terrain")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              basemapType === "google-terrain"
                ? "bg-[#A8C7FA]/25 text-[#A8C7FA] border border-[#A8C7FA]/50 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setBasemapType("carto-dark")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              basemapType === "carto-dark"
                ? "bg-[#A8C7FA]/25 text-[#A8C7FA] border border-[#A8C7FA]/50 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Dark
          </button>
        </div>

        {/* Active Layer Visibility Indicator */}
        <div className="glass-card rounded-2xl px-3 py-1.5 text-[10px] font-mono text-gray-300 flex items-center gap-3 border border-white/10">
          <span>Filters:</span>
          <span className={layerSolar ? "text-[#34D399]" : "text-gray-600 line-through"}>● Solar</span>
          <span className={layerWind ? "text-[#38BDF8]" : "text-gray-600 line-through"}>● Wind</span>
          <span className={layerBattery ? "text-[#A78BFA]" : "text-gray-600 line-through"}>● BESS</span>
          <span className={layerDiesel ? "text-[#FB923C]" : "text-gray-600 line-through"}>● Diesel</span>
        </div>
      </div>

      {/* 3. Top-Right Station Telemetry HUD */}
      <div className="absolute top-20 right-6 z-30 w-80 glass-card p-4 border border-white/10 shadow-2xl backdrop-blur-3xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">{currentStation.name}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A8C7FA]/20 text-[#A8C7FA] font-mono font-bold">
            Google Satellite
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1">
              <Sun className="w-2.5 h-2.5 text-emerald-400" /> Solar PV
            </div>
            <div className="font-mono font-bold text-white text-sm">{live.solarPowerKw.toFixed(1)} kW</div>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1">
              <Wind className="w-2.5 h-2.5 text-sky-400" /> Wind Turbines
            </div>
            <div className="font-mono font-bold text-white text-sm">{live.windPowerKw.toFixed(1)} kW</div>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1">
              <Battery className="w-2.5 h-2.5 text-purple-400" /> BESS Storage
            </div>
            <div className="font-mono font-bold text-white text-sm">{live.batterySocPercent.toFixed(1)}%</div>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" /> Net Load
            </div>
            <div className="font-mono font-bold text-white text-sm">{live.totalLoadDemandKw.toFixed(1)} kW</div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>Coords: {Math.abs(stationCoords[1]).toFixed(4)}°S, {stationCoords[0].toFixed(4)}°E</span>
          <button onClick={resetCamera} className="text-[#A8C7FA] hover:underline flex items-center gap-1 font-semibold">
            <RotateCcw className="w-3 h-3" /> Reset View
          </button>
        </div>
      </div>

      {/* 4. Selected Asset Inspector Modal (Floating Glass Card) */}
      {selectedAsset && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 w-96 glass-card p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{selectedAsset.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedAsset.name}</h3>
                <span className="text-[10px] text-gray-400 font-mono">{selectedAsset.rating}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span>Operational Status</span>
              <span className="font-mono font-semibold" style={{ color: selectedAsset.color }}>
                {selectedAsset.status}
              </span>
            </div>

            {selectedAsset.type === "solar" && (
              <>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Current Yield</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(live.solarPowerKw * 0.52).toFixed(1)} kW
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Snow Albedo Boost</span>
                  <span className="font-mono text-[#A8C7FA]">+31.2% (Vertical Bifacial)</span>
                </div>
              </>
            )}

            {selectedAsset.type === "wind" && (
              <>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Power Output</span>
                  <span className="font-mono font-bold text-sky-400">
                    {(live.windPowerKw * 0.48).toFixed(1)} kW
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Katabatic Wind Speed</span>
                  <span className="font-mono text-amber-300">{live.windSpeedMs.toFixed(1)} m/s</span>
                </div>
              </>
            )}

            {selectedAsset.type === "battery" && (
              <>
                <div className="flex items-center justify-between text-gray-300">
                  <span>State of Charge (SOC)</span>
                  <span className="font-mono font-bold text-purple-400">
                    {live.batterySocPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Thermal Insulation Jacket</span>
                  <span className="font-mono text-emerald-300">Active (+18°C internal)</span>
                </div>
              </>
            )}

            {selectedAsset.type === "diesel" && (
              <>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Generator Status</span>
                  <span className="font-mono font-bold text-amber-400">
                    {live.dieselKw > 0 ? `${live.dieselKw.toFixed(1)} kW ACTIVE` : "HOT STANDBY (0 kW)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Fuel Conserved Today</span>
                  <span className="font-mono text-emerald-400">142.8 Liters</span>
                </div>
              </>
            )}

            {selectedAsset.type === "habitat" && (
              <>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Life Support Load (Tier 1)</span>
                  <span className="font-mono font-bold text-emerald-400">32.0 kW (Protected)</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Grid Frequency</span>
                  <span className="font-mono text-sky-300">{live.gridFrequencyHz.toFixed(2)} Hz</span>
                </div>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono">SCADA Modbus TCP Telemetry</span>
            <button
              onClick={() => setActiveView("power-flow-diagram")}
              className="text-[11px] font-semibold text-[#A8C7FA] hover:underline"
            >
              View Bus Flow →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolarStationMap;
