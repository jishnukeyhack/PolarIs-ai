"use client";

import React from "react";
import { Sun, ArrowUpDown } from "lucide-react";
import { usePolarisStore } from "@/lib/store";

export function BottomRightLegend() {
  const { setActiveModal } = usePolarisStore();

  return (
    <div className="absolute bottom-6 right-4 z-30 hidden sm:flex flex-col items-end gap-1.5 pointer-events-auto">
      {/* Legend Scale Pill */}
      <div className="glass rounded-xl flex items-center px-3 py-1.5 gap-2.5 border border-white/10 shadow-xl text-xs">
        {/* Solar / Power Gradient Scale */}
        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <div className="w-28 h-1.5 rounded-full flex overflow-hidden border border-black/50">
            <div className="h-full flex-1 bg-sky-950" title="0 W/m² (Polar Night)" />
            <div className="h-full flex-1 bg-sky-800" title="200 W/m²" />
            <div className="h-full flex-1 bg-sky-500" title="400 W/m²" />
            <div className="h-full flex-1 bg-emerald-400" title="600 W/m²" />
            <div className="h-full flex-1 bg-yellow-400" title="800 W/m²" />
            <div className="h-full flex-1 bg-amber-500" title="1000 W/m²" />
          </div>
          <span className="text-[9px] text-gray-400 font-mono">1 kW/m²</span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        <button
          onClick={() => setActiveModal("shortcuts")}
          className="text-gray-400 hover:text-white transition-colors"
          title="Keyboard Shortcuts"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Attribution */}
      <div className="text-[9px] text-gray-500 flex gap-2 pr-1 font-mono">
        <span>NCPOR Polar Data Engine © 2026</span>
      </div>
    </div>
  );
}

export default BottomRightLegend;
