"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopNavBar } from "@/components/dashboard/TopNavBar";
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Leaf,
  CheckCircle2,
  Calendar,
  Sparkles,
  Building,
  Sliders,
  Shield,
  Zap,
} from "lucide-react";
import { STATIONS } from "@/lib/seed-data";

export default function ReportsPage() {
  const [selectedStation, setSelectedStation] = useState<string>("ALL");
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(3.85); // Logistics cost
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Benchmarks data
  const annualDieselSavedLiters = 114600;
  const annualCostSavedDollars = annualDieselSavedLiters * fuelPricePerLiter;
  const annualCo2AbatedTons = (annualDieselSavedLiters * 2.68) / 1000;
  const avgRenewableShare = 68.9;

  const downloadCsvReport = () => {
    const csvContent = [
      "Station,Solar Capacity (kW),Wind Turbines,Battery (kWh),Annual Fuel Saved (L),CO2 Offset (Tons),Cost Avoided (USD)",
      "Maitri Research Station,65.0,2x 25kW Direct-Drive,200,48200,129.2,$185570",
      "Bharati Research Station,50.0,3x 25kW Cold-Climate,250,54100,145.0,$208285",
      "Maitri II (2029 Asset),90.0,4x 25kW Vertical,350,12300,32.9,$47355",
      `TOTAL PORTFOLIO,205.0,9 Turbines,800 kWh,${annualDieselSavedLiters},${annualCo2AbatedTons.toFixed(1)},$${annualCostSavedDollars.toFixed(0)}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PolarIs_Antarctic_Clean_Energy_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="h-screen w-screen overflow-y-auto custom-scrollbar bg-[#07090E] text-[#E3E3E3] flex flex-col select-none">
      {/* Universal Top Nav */}
      <TopNavBar />

      <main className="flex-1 p-6 pt-24 pb-20 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A8C7FA]/20 border border-[#A8C7FA]/40 flex items-center justify-center text-[#A8C7FA]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Antarctic Clean Energy Transition — Annual Impact Reports
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 font-mono">
                  NCPOR Verified Telemetry
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Annual Logistics Avoidance, Arctic Environmental Protection &amp; Diesel Phase-Out Benchmarks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadCsvReport}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#A8C7FA] to-[#34D399] text-[#0A0E17] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#A8C7FA]/20 hover:opacity-95 transition-all btn-press"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? "Downloaded CSV!" : "Export Verified CSV Report"}</span>
            </button>
          </div>
        </div>

        {/* Cost & Carbon Calculator Tuning Strip */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#A8C7FA]" />
              <span className="font-bold uppercase tracking-wider text-white">Antarctic Logistics Cost Modeler</span>
            </div>
            <span className="text-[#34D399] font-bold">${fuelPricePerLiter.toFixed(2)} USD / Delivered Liter</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Adjust Delivered Polar Jet A-1 / Diesel Fuel Cost (Includes Icebreaker &amp; Air Drop Freight)</span>
            </div>
            <input
              type="range"
              min="2.00"
              max="6.50"
              step="0.10"
              value={fuelPricePerLiter}
              onChange={(e) => setFuelPricePerLiter(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$2.00/L (Standard Shipping)</span>
              <span>$3.85/L (Current Average)</span>
              <span>$6.50/L (Deep Inland LC-130 Air-Drop)</span>
            </div>
          </div>
        </div>

        {/* 3 Large KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-2 border border-[#34D399]/30">
            <div className="flex items-center gap-2 text-[#34D399]">
              <Leaf className="w-5 h-5" />
              <h3 className="font-bold text-sm">Annual Diesel Fuel Saved</h3>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-tight">{annualDieselSavedLiters.toLocaleString()} Liters</div>
            <p className="text-xs text-gray-400">Avoided through vertical bifacial solar PV &amp; katabatic wind microgrids.</p>
          </div>

          <div className="glass-card p-6 space-y-2 border border-[#38BDF8]/30">
            <div className="flex items-center gap-2 text-[#38BDF8]">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-sm">Logistics Budget Avoidance</h3>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-tight">${Math.round(annualCostSavedDollars).toLocaleString()} USD</div>
            <p className="text-xs text-gray-400">Direct savings on hazardous polar tanker logistics and fuel transport.</p>
          </div>

          <div className="glass-card p-6 space-y-2 border border-[#A78BFA]/30">
            <div className="flex items-center gap-2 text-[#A78BFA]">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-sm">CO₂ Emissions Abated</h3>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-tight">{annualCo2AbatedTons.toFixed(1)} Metric Tons</div>
            <p className="text-xs text-gray-400">Compliant with the Antarctic Treaty System Environmental Protocol.</p>
          </div>
        </div>

        {/* Station By Station Comprehensive Breakdown Matrix */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#A8C7FA]" />
              <h2 className="text-sm font-bold text-white">NCPOR Research Station Performance Matrix</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">Live SCADA Integration Benchmarks</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-3 font-semibold">Station Name</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Solar kWp</th>
                  <th className="pb-3 font-semibold">Wind Turbines</th>
                  <th className="pb-3 font-semibold">BESS Bank</th>
                  <th className="pb-3 font-semibold">Renewable %</th>
                  <th className="pb-3 font-semibold text-right">Annual Diesel Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7DD3FC]" />
                    Maitri Research Station
                  </td>
                  <td className="py-3.5 text-gray-400">70.76°S, 11.73°E</td>
                  <td className="py-3.5 text-[#34D399]">65 kWp (Bifacial)</td>
                  <td className="py-3.5 text-[#38BDF8]">2x 25 kW</td>
                  <td className="py-3.5 text-[#A78BFA]">200 kWh LiFePO4</td>
                  <td className="py-3.5 text-white font-bold">71.4%</td>
                  <td className="py-3.5 text-right font-bold text-[#34D399]">48,200 L</td>
                </tr>

                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    Bharati Research Station
                  </td>
                  <td className="py-3.5 text-gray-400">69.41°S, 76.19°E</td>
                  <td className="py-3.5 text-[#34D399]">50 kWp (Vertical)</td>
                  <td className="py-3.5 text-[#38BDF8]">3x 25 kW</td>
                  <td className="py-3.5 text-[#A78BFA]">250 kWh LiFePO4</td>
                  <td className="py-3.5 text-white font-bold">78.2%</td>
                  <td className="py-3.5 text-right font-bold text-[#34D399]">54,100 L</td>
                </tr>

                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                    Maitri II (2029 Future Asset)
                  </td>
                  <td className="py-3.5 text-gray-400">70.77°S, 11.83°E</td>
                  <td className="py-3.5 text-[#34D399]">90 kWp (High-Albedo)</td>
                  <td className="py-3.5 text-[#38BDF8]">4x 25 kW</td>
                  <td className="py-3.5 text-[#A78BFA]">350 kWh LiFePO4</td>
                  <td className="py-3.5 text-white font-bold">88.5%</td>
                  <td className="py-3.5 text-right font-bold text-[#34D399]">12,300 L (Phase 1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
