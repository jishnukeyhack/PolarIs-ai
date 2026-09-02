"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePolarisStore } from "@/lib/store";
import { STATIONS, getLiveNetworkState } from "@/lib/seed-data";
import { fetchOpenMeteoWeather, OpenMeteoWeatherData } from "@/lib/api/openMeteo";
import { fetchNasaSolarData, NasaSolarPointData } from "@/lib/api/nasaPower";
import {
  Sun,
  Wind,
  Battery,
  Flame,
  Zap,
  ShieldAlert,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Activity,
  Globe2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface StationGeo {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elev: number;
  type: "active" | "future";
  color: string;
}

const POLAR_STATIONS: StationGeo[] = [
  {
    id: "MAITRI",
    name: "Maitri Research Station",
    lat: -70.7667,
    lon: 11.7333,
    elev: 117,
    type: "active",
    color: "#7DD3FC", // Cyan Ice
  },
  {
    id: "BHARATI",
    name: "Bharati Research Station",
    lat: -69.4075,
    lon: 76.1872,
    elev: 35,
    type: "active",
    color: "#34D399", // Aurora Green
  },
  {
    id: "MAITRI_2",
    name: "Maitri II (2029 Future Asset)",
    lat: -70.77,
    lon: 11.83,
    elev: 125,
    type: "future",
    color: "#A78BFA", // Violet Storage
  },
];

export function PolarGlobe() {
  const {
    timelineHour,
    selectedStationId,
    setSelectedStationId,
    resilienceModeActive,
    toggleResilienceMode,
    layerSolar,
    layerWind,
    layerBattery,
    layerDiesel,
    layerLoad,
    setActiveView,
  } = usePolarisStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera & Globe State (focused on Antarctica South Pole)
  const [rotX, setRotX] = useState<number>(1.25); // Tilt to view South Pole
  const [rotY, setRotY] = useState<number>(0.35);
  const [zoom, setZoom] = useState<number>(1.4);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetRotX, setTargetRotX] = useState<number>(1.25);
  const [targetRotY, setTargetRotY] = useState<number>(0.35);
  const [targetZoom, setTargetZoom] = useState<number>(1.4);
  const [imageryMode, setImageryMode] = useState<"satellite" | "topo">("satellite");

  // Real-time API data
  const [weatherData, setWeatherData] = useState<OpenMeteoWeatherData | null>(null);
  const [solarData, setSolarData] = useState<NasaSolarPointData | null>(null);
  const [popupStation, setPopupStation] = useState<StationGeo | null>(POLAR_STATIONS[0]);

  const liveState = getLiveNetworkState(selectedStationId, timelineHour, resilienceModeActive);

  // Fetch real-time NASA & Open-Meteo data for Maitri on mount
  useEffect(() => {
    let mounted = true;
    async function loadLiveData() {
      const [wData, sData] = await Promise.all([
        fetchOpenMeteoWeather(-70.7667, 11.7333, "MAITRI"),
        fetchNasaSolarData(-70.7667, 11.7333),
      ]);
      if (mounted) {
        setWeatherData(wData);
        setSolarData(sData);
      }
    }
    loadLiveData();
    return () => {
      mounted = false;
    };
  }, []);

  // Focus Camera on Maitri
  const focusMaitri = useCallback(() => {
    // Coordinates for Maitri (-70.77, 11.73)
    setTargetRotX(1.22);
    setTargetRotY(0.2);
    setTargetZoom(1.95);
    setSelectedStationId("MAITRI");
    setPopupStation(POLAR_STATIONS[0]);
  }, [setSelectedStationId]);

  // Focus Camera on Bharati
  const focusBharati = useCallback(() => {
    setTargetRotX(1.2);
    setTargetRotY(-1.32);
    setTargetZoom(1.95);
    setSelectedStationId("BHARATI");
    setPopupStation(POLAR_STATIONS[1]);
  }, [setSelectedStationId]);

  // Reset Antarctic Orbit
  const resetOrbit = useCallback(() => {
    setTargetRotX(1.25);
    setTargetRotY(0.35);
    setTargetZoom(1.35);
  }, []);

  // Mouse Handlers for Drag-To-Rotate and Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setTargetRotY((prev) => prev + dx * 0.005);
    setTargetRotX((prev) => Math.max(0.4, Math.min(2.1, prev + dy * 0.005)));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setTargetZoom((prev) => Math.max(0.9, Math.min(3.8, prev + delta)));
  };

  // Convert (lat, lon) to 2D screen coordinate on the projected sphere
  const projectToScreen = useCallback(
    (lat: number, lon: number, radius: number, cx: number, cy: number, currentRotX: number, currentRotY: number) => {
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;

      // 3D sphere coordinate
      const x = radius * Math.cos(latRad) * Math.sin(lonRad);
      const y = radius * Math.sin(latRad);
      const z = radius * Math.cos(latRad) * Math.cos(lonRad);

      // Rotate around Y
      const x1 = x * Math.cos(currentRotY) + z * Math.sin(currentRotY);
      const z1 = -x * Math.sin(currentRotY) + z * Math.cos(currentRotY);

      // Rotate around X (Tilt)
      const y2 = y * Math.cos(currentRotX) - z1 * Math.sin(currentRotX);
      const z2 = y * Math.sin(currentRotX) + z1 * Math.cos(currentRotX);

      // Check if on visible hemisphere (facing camera)
      const visible = z2 > -radius * 0.1;

      return {
        screenX: cx + x1,
        screenY: cy - y2,
        visible,
        depth: z2,
      };
    },
    []
  );

  // 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Wind particles simulation over Antarctica
    const windParticles = Array.from({ length: 180 }, () => ({
      lat: -65 - Math.random() * 22,
      lon: Math.random() * 360 - 180,
      speed: 0.12 + Math.random() * 0.35,
      life: Math.random() * 100,
      maxLife: 80 + Math.random() * 60,
    }));

    // Starfield particles in deep space
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      brightness: Math.random() * 0.7 + 0.3,
    }));

    let currentRx = rotX;
    let currentRy = rotY;
    let currentZ = zoom;

    const render = () => {
      // Smooth camera interpolation
      currentRx += (targetRotX - currentRx) * 0.08;
      currentRy += (targetRotY - currentRy) * 0.08;
      currentZ += (targetZoom - currentZ) * 0.08;
      setRotX(currentRx);
      setRotY(currentRy);
      setZoom(currentZ);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const baseRadius = Math.min(width, height) * 0.38;
      const radius = baseRadius * currentZ;

      // 1. Deep Space Starfield
      for (const s of stars) {
        ctx.fillStyle = `rgba(241, 243, 247, ${s.brightness * (0.8 + Math.sin(Date.now() * 0.002 + s.x) * 0.2)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // 2. Atmospheric Rim Glow (Fresnel Rayleigh Scattering)
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      atmoGrad.addColorStop(0, "rgba(125, 211, 252, 0.0)");
      atmoGrad.addColorStop(0.65, "rgba(125, 211, 252, 0.15)");
      atmoGrad.addColorStop(0.9, "rgba(56, 189, 248, 0.28)");
      atmoGrad.addColorStop(1, "rgba(14, 165, 233, 0)");
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 3. 3D Globe Body (Ocean & Continent Sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Deep Ocean Shader Base
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, 10, cx, cy, radius);
      oceanGrad.addColorStop(0, imageryMode === "satellite" ? "#0F1A2C" : "#08101C");
      oceanGrad.addColorStop(0.6, "#070D18");
      oceanGrad.addColorStop(1, "#03060B");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 4. Antarctic Ice Sheet & Continent Topography Geometry
      // Render Antarctic coastline, Queen Maud Land, Ross Ice Shelf, and Ronne Ice Shelf
      ctx.fillStyle = imageryMode === "satellite" ? "rgba(224, 242, 254, 0.88)" : "rgba(186, 230, 253, 0.75)";
      ctx.strokeStyle = "rgba(125, 211, 252, 0.55)";
      ctx.lineWidth = 1.2;

      // Draw latitude grid rings (Polar circles: 60°S, 70°S, 80°S)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      [-60, -70, -80].forEach((lat) => {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = projectToScreen(lat, lon, radius, cx, cy, currentRx, currentRy);
          if (lon === -180) {
            ctx.moveTo(pt.screenX, pt.screenY);
          } else {
            ctx.lineTo(pt.screenX, pt.screenY);
          }
        }
        ctx.stroke();
      });

      // Draw longitude meridian ribs
      [-120, -60, 0, 60, 120, 180].forEach((lon) => {
        ctx.beginPath();
        for (let lat = -50; lat >= -90; lat -= 2) {
          const pt = projectToScreen(lat, lon, radius, cx, cy, currentRx, currentRy);
          if (lat === -50) {
            ctx.moveTo(pt.screenX, pt.screenY);
          } else {
            ctx.lineTo(pt.screenX, pt.screenY);
          }
        }
        ctx.stroke();
      });

      // Draw Antarctic Continent Ice Polygon
      const antarcticContour: Array<[number, number]> = [
        [-65, -60], [-68, -45], [-72, -30], [-70, -10],
        [-70.76, 11.73], // Maitri (Queen Maud Land)
        [-69.5, 30], [-68, 50],
        [-69.4, 76.19],  // Bharati (Larsemann Hills)
        [-67, 100], [-66, 120], [-67, 140], [-71, 160],
        [-78, 175], [-82, -170], [-76, -150], [-73, -120],
        [-72, -90], [-67, -70], [-65, -60],
      ];

      ctx.beginPath();
      let firstPoint = true;
      for (const [lat, lon] of antarcticContour) {
        const pt = projectToScreen(lat, lon, radius, cx, cy, currentRx, currentRy);
        if (firstPoint) {
          ctx.moveTo(pt.screenX, pt.screenY);
          firstPoint = false;
        } else {
          ctx.lineTo(pt.screenX, pt.screenY);
        }
      }
      ctx.closePath();
      const iceGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius * 0.75);
      iceGrad.addColorStop(0, "#FFFFFF");
      iceGrad.addColorStop(0.5, "#E0F2FE");
      iceGrad.addColorStop(1, "#BAE6FD");
      ctx.fillStyle = iceGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.85)";
      ctx.stroke();

      // 5. Dynamic Layer: Solar Irradiance Heatmap Overlay
      if (layerSolar) {
        const solarGhi = liveState.solarKw > 0 ? liveState.solarKw : 38.5;
        const solarIntensity = Math.min(1, solarGhi / 60);

        const solarGrad = ctx.createRadialGradient(
          cx + Math.cos(currentRy) * radius * 0.3,
          cy - Math.sin(currentRx) * radius * 0.3,
          10,
          cx,
          cy,
          radius * 0.65
        );
        solarGrad.addColorStop(0, `rgba(52, 211, 153, ${0.45 * solarIntensity})`);
        solarGrad.addColorStop(0.5, `rgba(125, 211, 252, ${0.28 * solarIntensity})`);
        solarGrad.addColorStop(1, "rgba(3, 42, 56, 0)");

        ctx.fillStyle = solarGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Dynamic Layer: Wind Power Velocity Streamlines
      if (layerWind) {
        const stormMode = timelineHour >= 42 && timelineHour <= 54;
        const windSpeedMultiplier = stormMode ? 2.4 : 1.0;

        ctx.lineWidth = stormMode ? 1.8 : 1.2;
        for (const p of windParticles) {
          p.lon += p.speed * windSpeedMultiplier * 1.6;
          if (p.lon > 180) p.lon = -180;
          p.life += 1;
          if (p.life > p.maxLife) {
            p.life = 0;
            p.lat = -65 - Math.random() * 22;
            p.lon = Math.random() * 360 - 180;
          }

          const pt1 = projectToScreen(p.lat, p.lon, radius * 1.01, cx, cy, currentRx, currentRy);
          const pt2 = projectToScreen(
            p.lat + (Math.sin(p.lon * 0.05) * 1.2),
            p.lon + (p.speed * 4),
            radius * 1.01,
            cx,
            cy,
            currentRx,
            currentRy
          );

          if (pt1.visible && pt2.visible) {
            const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * (stormMode ? 0.75 : 0.45);
            ctx.strokeStyle = stormMode
              ? `rgba(251, 146, 60, ${alpha})` // Katabatic Blizzard Orange
              : `rgba(125, 211, 252, ${alpha})`; // Clean Arctic Ice Blue
            ctx.beginPath();
            ctx.moveTo(pt1.screenX, pt1.screenY);
            ctx.lineTo(pt2.screenX, pt2.screenY);
            ctx.stroke();
          }
        }
      }

      // 7. Dynamic Layer: 3D Power Flow Arcs (Solar/Wind -> BESS -> Habitat)
      const maitriPt = projectToScreen(-70.7667, 11.7333, radius, cx, cy, currentRx, currentRy);
      const bharatiPt = projectToScreen(-69.4075, 76.1872, radius, cx, cy, currentRx, currentRy);
      const maitri2Pt = projectToScreen(-70.77, 11.83, radius, cx, cy, currentRx, currentRy);

      if (maitriPt.visible && maitri2Pt.visible) {
        // Microgrid Intertie Arc (Maitri <-> Maitri II)
        ctx.strokeStyle = "rgba(167, 139, 250, 0.65)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(maitriPt.screenX, maitriPt.screenY);
        ctx.quadraticCurveTo(
          (maitriPt.screenX + maitri2Pt.screenX) / 2,
          (maitriPt.screenY + maitri2Pt.screenY) / 2 - 25,
          maitri2Pt.screenX,
          maitri2Pt.screenY
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3D Sphere Shading / Night Shadow Overlay
      const shadowGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      shadowGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      shadowGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.0)");
      shadowGrad.addColorStop(1, "rgba(2, 4, 8, 0.82)");
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore(); // Exit sphere clipping

      // 8. 3D Station Beacons & Interactive Layer Badges (Rendered in front of globe)
      POLAR_STATIONS.forEach((st) => {
        const pt = projectToScreen(st.lat, st.lon, radius, cx, cy, currentRx, currentRy);
        if (!pt.visible) return;

        const isSelected = selectedStationId === st.id;
        const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;

        // Altitude Pin Pole
        ctx.strokeStyle = st.color;
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(pt.screenX, pt.screenY);
        ctx.lineTo(pt.screenX, pt.screenY - 24);
        ctx.stroke();

        // Pulsing Radar Beacon Ring
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY - 24, 6 + pulse * 8, 0, Math.PI * 2);
        ctx.stroke();

        // Solid Center Beacon Dot
        ctx.fillStyle = isSelected ? "#FFFFFF" : st.color;
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY - 24, isSelected ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Layer: Battery BESS Status 3D Ring
        if (layerBattery && isSelected) {
          const soc = liveState.batterySoc;
          const socColor = soc > 70 ? "#34D399" : soc > 30 ? "#FB923C" : "#F04B4B";
          ctx.strokeStyle = socColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pt.screenX, pt.screenY - 24, 18, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (soc / 100)));
          ctx.stroke();
        }

        // Layer: Habitat Load Demand Column
        if (layerLoad && isSelected) {
          const loadKw = liveState.loadKw;
          const colHeight = Math.min(60, (loadKw / 70) * 45);
          ctx.fillStyle = "rgba(167, 139, 250, 0.4)";
          ctx.fillRect(pt.screenX - 3, pt.screenY - 24 - colHeight, 6, colHeight);
        }

        // Station Label Pill
        const label = st.name.split(" ")[0]; // "Maitri", "Bharati"
        ctx.font = isSelected ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = "rgba(6, 8, 12, 0.85)";
        ctx.strokeStyle = isSelected ? st.color : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pt.screenX - textWidth / 2 - 8, pt.screenY - 48, textWidth + 16, 18, 9999);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? "#FFFFFF" : "rgba(241, 243, 247, 0.85)";
        ctx.fillText(label, pt.screenX - textWidth / 2, pt.screenY - 35);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    rotX,
    rotY,
    zoom,
    targetRotX,
    targetRotY,
    targetZoom,
    timelineHour,
    selectedStationId,
    resilienceModeActive,
    layerSolar,
    layerWind,
    layerBattery,
    layerDiesel,
    layerLoad,
    imageryMode,
    projectToScreen,
    liveState,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL / Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 3D Globe HUD Controls */}
      <div className="absolute top-20 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => setTargetZoom((z) => Math.min(3.8, z + 0.35))}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-white/10 text-white shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <Maximize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={() => setTargetZoom((z) => Math.max(0.9, z - 0.35))}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-white/10 text-white shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <Minimize2 className="w-4 h-4 text-[#7DD3FC]" />
        </button>
        <button
          onClick={focusMaitri}
          title="Focus Maitri Station (-70.77°S, 11.73°E)"
          className="px-3 py-2 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-[#7DD3FC]/40 text-[#7DD3FC] text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          Focus Maitri
        </button>
        <button
          onClick={focusBharati}
          title="Focus Bharati Station (-69.41°S, 76.19°E)"
          className="px-3 py-2 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-[#34D399]/40 text-[#34D399] text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Compass className="w-3.5 h-3.5" />
          Bharati
        </button>
        <button
          onClick={resetOrbit}
          title="Reset Antarctic Polar Orbit"
          className="p-2.5 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-white/10 text-white/80 hover:text-white shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setImageryMode((m) => (m === "satellite" ? "topo" : "satellite"))}
          title="Toggle Satellite / Topographic Ice Texture"
          className="p-2.5 rounded-xl bg-[#12161F]/80 hover:bg-[#181C24] border border-white/10 text-white/80 hover:text-white shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          <Globe2 className="w-4 h-4 text-[#A78BFA]" />
        </button>
      </div>

      {/* Real-time Antarctic Station HUD Card */}
      {popupStation && (
        <div className="absolute top-20 left-72 z-20 w-80 rounded-2xl bg-[#0B0E14]/90 border border-white/12 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7DD3FC] animate-pulse" />
                <h3 className="text-sm font-semibold text-white tracking-wide">{popupStation.name}</h3>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {popupStation.lat.toFixed(4)}°S, {popupStation.lon.toFixed(4)}°E • Elev: {popupStation.elev}m
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

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-[#34D399] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Solar GHI</div>
                <div className="font-mono font-bold text-white">{liveState.solarKw.toFixed(1)} kW</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-[#7DD3FC] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Wind Velocity</div>
                <div className="font-mono font-bold text-white">
                  {weatherData?.wind_speed_ms ?? 14.2} m/s
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2.5">
              <Battery className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">BESS SOC</div>
                <div className="font-mono font-bold text-white">{liveState.batterySoc.toFixed(1)}%</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#12161F]/70 border border-white/5 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#FB923C] shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">Habitat Load</div>
                <div className="font-mono font-bold text-white">{liveState.loadKw.toFixed(1)} kW</div>
              </div>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-300">
            <span>Temp: {weatherData?.temperature_c ?? -18.4}°C</span>
            <span>Pressure: {weatherData?.surface_pressure_hpa ?? 988.2} hPa</span>
            <span className="text-[#34D399]">
              {solarData?.isLiveApi ? "NASA Live" : "Physics Calibrated"}
            </span>
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setActiveView("power-flow-diagram")}
              className="flex-1 py-1.5 rounded-xl bg-[#7DD3FC]/15 hover:bg-[#7DD3FC]/25 border border-[#7DD3FC]/30 text-[#7DD3FC] text-xs font-semibold transition-all text-center"
            >
              Inspect Bus Diagram
            </button>
            <button
              onClick={toggleResilienceMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                resilienceModeActive
                  ? "bg-[#34D399]/20 border-[#34D399]/40 text-[#34D399]"
                  : "bg-[#FB923C]/20 border-[#FB923C]/40 text-[#FB923C]"
              }`}
            >
              {resilienceModeActive ? "Disengage Survival" : "Engage Survival"}
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher Pill at Bottom Left */}
      <div className="absolute bottom-24 left-72 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#0B0E14]/85 border border-white/10 shadow-xl backdrop-blur-md">
        <button
          onClick={() => setActiveView("radar-map")}
          className="px-3 py-1.5 rounded-xl bg-[#7DD3FC]/20 text-[#7DD3FC] text-xs font-semibold flex items-center gap-1.5"
        >
          <Globe2 className="w-3.5 h-3.5" />
          3D Earth Globe
        </button>
        <button
          onClick={() => setActiveView("power-flow-diagram")}
          className="px-3 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Activity className="w-3.5 h-3.5" />
          Single-Line Bus Diagram
        </button>
      </div>
    </div>
  );
}
