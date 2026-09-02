"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Sun, Wind, Battery, Flame, Zap } from "lucide-react";
import { STATIONS, generateStationForecastMatrix } from "@/lib/seed-data";

export default function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const station =
    STATIONS.find((s) => s.id.toUpperCase() === id.toUpperCase()) || STATIONS[0];
  const matrix = generateStationForecastMatrix(station.code);

  return (
    <div className="min-h-screen bg-[#06080C] text-white p-6 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </Link>
          <div className="flex items-center gap-2 text-sky-400">
            <MapPin className="w-5 h-5" />
            <h1 className="text-base font-semibold">{station.name}</h1>
          </div>
        </div>
      </header>

      {/* Station Physical Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white">Geographic &amp; Climatic Baseline</h2>
          <div className="text-xs space-y-2 text-gray-300 font-mono">
            <div>Coordinates: {station.coordinates.lat.toFixed(4)}°S, {station.coordinates.lng.toFixed(4)}°E</div>
            <div>Elevation: {station.elevationMeters} meters Above Sea Level</div>
            <div>Climate Zone: {station.climateZone}</div>
            <div>Commissioned: Year {station.activeCommissioningYear}</div>
            <div>Winter Overwintering Crew: {station.crewCapacity.winter} Expeditioners</div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white">Microgrid Installed Capacities</h2>
          <div className="text-xs space-y-2 text-gray-300 font-mono">
            <div>Bifacial Solar PV: {station.microgridSpec.solarCapacityKw} kW (Albedo {station.microgridSpec.bifacialAlbedoFactor}x)</div>
            <div>Wind Turbines: {station.microgridSpec.windTurbines[0].count}x {station.microgridSpec.windTurbines[0].ratedKw} kW</div>
            <div>BESS Storage: {station.microgridSpec.batteryEnergyStorage.usableCapacityKwh} kWh ({station.microgridSpec.batteryEnergyStorage.chemistry})</div>
            <div>Baseline Thermal Load: {station.microgridSpec.baselineThermalLoadKw} kW</div>
            <div>Baseline Electrical Load: {station.microgridSpec.baselineElectricalLoadKw} kW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
