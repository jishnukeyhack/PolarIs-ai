"use client";

import React, { useEffect, useState } from "react";
import { usePolarisStore } from "@/lib/store";
import { STATIONS } from "@/lib/seed-data";
import Link from "next/link";
import { usePathname } from "next/navigation";

function MI({ icon, className, filled }: { icon: string; className?: string; filled?: boolean }) {
  return (
    <span
      className={`material-symbols-rounded ${className || ""}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {icon}
    </span>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Console", icon: "dashboard" },
  { href: "/forecast", label: "Forecast Studio", icon: "query_stats" },
  { href: "/dispatch", label: "MILP Dispatch", icon: "electric_bolt" },
  { href: "/survival-mode", label: "Survival Ladder", icon: "shield" },
  { href: "/reports", label: "Reports", icon: "summarize" },
];

export function TopNavBar() {
  const {
    activeView,
    setActiveView,
    isLiveRealTime,
    toggleLiveRealTime,
    selectedStationId,
    setSelectedStationId,
    setCurrentUtcSeconds,
  } = usePolarisStore();
  const pathname = usePathname();
  const [utcTime, setUtcTime] = useState("");

  // 1Hz Real-Time Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      const ts = `${h}:${m}:${s} UTC`;
      setUtcTime(ts);
      setCurrentUtcSeconds(ts);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [setCurrentUtcSeconds]);

  return (
    <header className="fixed top-0 left-0 w-full h-[64px] flex items-center justify-between px-5 z-50 text-[#E3E3E3] bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-white/[0.06]">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#A8C7FA] to-[#7DD3FC] flex items-center justify-center text-[#0a0a0a] shadow-lg shadow-[#A8C7FA]/20">
            <MI icon="cyclone" filled={true} className="text-[20px]" />
          </div>
          <span className="text-[20px] font-semibold tracking-tight">PolarIs.ai</span>
        </Link>

        <div className="w-px h-6 bg-white/10" />

        {/* Page Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-[#A8C7FA]/15 text-[#A8C7FA] shadow-sm"
                    : "text-[#9AA0A6] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <MI icon={icon} className="text-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Live clock, station selector, view switcher, actions */}
      <div className="flex items-center gap-3">
        {/* UTC Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] font-mono text-[#A8C7FA]">
          <MI icon="schedule" className="text-[16px]" />
          <span className="tabular-nums font-bold">{utcTime || "00:00:00 UTC"}</span>
        </div>

        {/* Live toggle */}
        <button
          onClick={toggleLiveRealTime}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border flex items-center gap-2 ${
            isLiveRealTime
              ? "bg-[#34D399]/15 border-[#34D399]/30 text-[#34D399]"
              : "bg-white/[0.04] border-white/[0.08] text-[#9AA0A6]"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isLiveRealTime ? "bg-[#34D399] animate-pulse" : "bg-[#9AA0A6]"}`} />
          {isLiveRealTime ? "LIVE" : "REPLAY"}
        </button>

        {/* Station Selector */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStationId(s.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedStationId === s.id || selectedStationId === s.code
                  ? "bg-[#A8C7FA]/15 text-[#A8C7FA]"
                  : "text-[#9AA0A6] hover:text-white"
              }`}
            >
              {s.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* View Switcher (console page only) */}
        {pathname === "/" && (
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            {[
              { key: "radar-map", label: "Globe", icon: "public" },
              { key: "station-map", label: "Map", icon: "map" },
              { key: "power-flow-diagram", label: "Bus", icon: "account_tree" },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setActiveView(v.key as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  activeView === v.key
                    ? "bg-[#A8C7FA]/15 text-[#A8C7FA]"
                    : "text-[#9AA0A6] hover:text-white"
                }`}
              >
                <MI icon={v.icon} className="text-[14px]" />
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors">
            <MI icon="download" className="text-[20px] text-[#9AA0A6]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors">
            <MI icon="info" className="text-[20px] text-[#9AA0A6]" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavBar;
