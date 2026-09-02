"use client";

import React from "react";
import { usePolarisStore } from "@/lib/store";

function MaterialIcon({ icon, className, filled = false }: { icon: string; className?: string; filled?: boolean }) {
  return (
    <span 
      className={`material-symbols-rounded ${className || ""}`}
      style={{ 
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {icon}
    </span>
  );
}

export function RightFloatingActions() {
  const { setActiveModal, stationDetailOpen, toggleStationDetail } = usePolarisStore();

  // If station detail panel is open, do not render duplicate floating pill in that exact spot
  if (stationDetailOpen) {
    return null;
  }

  return (
    <div className="absolute top-20 right-4 flex flex-col gap-3 z-30 pointer-events-auto">
      
      {/* Telemetry Dashboard Button */}
      <button
        onClick={toggleStationDetail}
        className="h-[48px] rounded-full bg-[#1E1E1E]/60 backdrop-blur-2xl border border-white/10 pl-4 pr-1.5 flex items-center gap-4 text-[#E3E3E3] hover:bg-white/10 transition-colors shadow-xl group"
      >
        <span className="text-[14px] font-medium tracking-wide drop-shadow-md">Station Telemetry</span>
        <div className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/5">
          <MaterialIcon icon="monitoring" className="text-[#E3E3E3] text-[20px]" />
        </div>
      </button>

      {/* Grid Alerts Button */}
      <button
        onClick={() => setActiveModal("search-storms")}
        className="h-[48px] rounded-full bg-[#1E1E1E]/60 backdrop-blur-2xl border border-white/10 pl-4 pr-1.5 flex items-center gap-4 text-[#E3E3E3] hover:bg-white/10 transition-colors shadow-xl group relative"
      >
        <span className="text-[14px] font-medium tracking-wide drop-shadow-md">Blizzard Alerts</span>
        <div className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/5">
          <MaterialIcon icon="storm" className="text-[#E3E3E3] text-[20px]" />
        </div>
        
        {/* Red Notification Badge */}
        <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#F2B8B5] text-[#1E1E1E] flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-sm">
          1
        </div>
      </button>
      
    </div>
  );
}

export default RightFloatingActions;
