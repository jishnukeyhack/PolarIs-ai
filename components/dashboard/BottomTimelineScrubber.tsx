"use client";

import React, { useEffect, useRef } from "react";
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

export function BottomTimelineScrubber() {
  const {
    timelineHour,
    setTimelineHour,
    isPlaying,
    setIsPlaying,
    stepTimeline,
    currentUtcSeconds,
  } = usePolarisStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineHour((timelineHour + 1) % 72);
    }, 380);
    return () => clearInterval(interval);
  }, [isPlaying, timelineHour, setTimelineHour]);

  const now = new Date();
  const current = new Date(now.getTime() + timelineHour * 3_600_000);
  const dayName = current.toUTCString().slice(0, 3);
  const dateStr = current.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  
  // Format matching: "Tue 1 Sep 2026, 00:00 UTC"
  const formattedTime = `${dayName} ${dateStr}, ${currentUtcSeconds || "00:00 UTC"}`;
  const initTime = `${dayName} ${dateStr}, 00:00 UTC`;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="w-[500px] bg-[#1E1E1E]/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-2">
        
        {/* Top Header: Date/Time */}
        <div className="flex items-center justify-center gap-4 text-[#E3E3E3]">
          <button onClick={() => stepTimeline(-1)} className="hover:text-white transition-colors">
            <MaterialIcon icon="arrow_left" className="text-[20px]" />
          </button>
          <span className="text-[15px] font-bold tracking-wide drop-shadow-md">{formattedTime}</span>
          <button onClick={() => stepTimeline(1)} className="hover:text-white transition-colors">
            <MaterialIcon icon="arrow_right" className="text-[20px]" />
          </button>
        </div>

        {/* Main Track Row */}
        <div className="flex items-center gap-4">
          
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#E3E3E3] shadow-md border border-white/5"
          >
            <MaterialIcon icon={isPlaying ? "pause" : "play_arrow"} filled={true} className="text-[24px]" />
          </button>

          {/* Timeline Slider with dots */}
          <div className="flex-1 relative h-6 flex items-center">
            {/* Background dashed/dotted line */}
            <div className="absolute left-0 right-0 h-[2px] bg-white/20 rounded-full overflow-hidden flex justify-between items-center pointer-events-none">
               {/* 72 dots for 72 hours */}
               {Array.from({ length: 73 }).map((_, i) => (
                  <div key={i} className="w-[2px] h-[2px] bg-white/50 rounded-full" />
               ))}
            </div>
            
            {/* The actual slider input */}
            <input
              ref={inputRef}
              type="range"
              min="0"
              max="71"
              value={timelineHour}
              onChange={(e) => setTimelineHour(parseInt(e.target.value, 10))}
              className="relative w-full cursor-pointer opacity-0 z-20 h-full"
            />
            
            {/* Custom thumb visual */}
            <div 
              className="absolute w-[16px] h-[16px] bg-[#E3E3E3] rounded-full shadow-lg border border-white/50 pointer-events-none z-10 transition-transform duration-75"
              style={{ left: `calc(${(timelineHour / 71) * 100}% - 8px)` }}
            />
          </div>

          {/* Reset/Loop Button */}
          <button
            onClick={() => setTimelineHour(0)}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-white/10 text-[#E3E3E3]"
          >
            <MaterialIcon icon="sync" className="text-[22px]" />
          </button>

        </div>

        {/* Bottom Metadata */}
        <div className="flex items-center justify-center gap-2 text-white/50 text-[11px] font-medium tracking-wide">
          <MaterialIcon icon="calendar_today" className="text-[14px]" />
          <MaterialIcon icon="arrow_left" className="text-[14px]" />
          <span>Init. {initTime}</span>
          <MaterialIcon icon="arrow_right" className="text-[14px]" />
          <MaterialIcon icon="skip_next" className="text-[14px]" />
        </div>

      </div>
    </div>
  );
}

export default BottomTimelineScrubber;
