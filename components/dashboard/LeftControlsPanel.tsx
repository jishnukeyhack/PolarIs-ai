"use client";

import React, { useState } from "react";
import { usePolarisStore } from "@/lib/store";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

function MaterialIcon({
  icon,
  className,
  filled = false,
  warning = false,
  style,
}: {
  icon: string;
  className?: string;
  filled?: boolean;
  warning?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-rounded ${className || ""}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        color: warning ? "#F2B8B5" : "inherit",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

function SectionHeader({
  icon,
  title,
  toggled,
  onToggle,
}: {
  icon: string;
  title: string;
  toggled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1 cursor-default">
      <div className="flex items-center gap-3.5">
        <MaterialIcon icon={icon} className="text-[#C4C7C5] text-[22px]" />
        <span className="text-[15px] font-medium text-[#E3E3E3] tracking-wide">{title}</span>
      </div>
      <ToggleSwitch checked={toggled} onChange={onToggle} />
    </div>
  );
}

function ExpandableGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 py-1.5 px-1 hover:bg-white/[0.04] rounded-xl transition-colors"
      >
        <MaterialIcon
          icon="expand_more"
          className={`text-[#C4C7C5] text-[18px] transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
        <span className="text-[13px] text-[#C4C7C5] font-medium">{title}</span>
      </button>
      {open && <div className="pl-8 pr-1 py-1 space-y-1">{children}</div>}
    </div>
  );
}

function RadioItem({
  label,
  checked,
  onClick,
  warning,
  badge,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  warning?: boolean;
  badge?: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-white/[0.04] rounded-lg px-2 -ml-2 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#E3E3E3]">{label}</span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.2 rounded border border-[#A8C7FA]/30 bg-[#A8C7FA]/10 text-[#A8C7FA] font-mono">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {warning && <MaterialIcon icon="warning" className="text-[#F2B8B5] text-[16px]" />}
        <MaterialIcon
          icon={checked ? "radio_button_checked" : "radio_button_unchecked"}
          className={checked ? "text-[#A8C7FA] text-[18px]" : "text-[#777] text-[18px]"}
        />
      </div>
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
  color = "#A8C7FA",
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 cursor-pointer hover:bg-white/[0.04] rounded-lg px-2 -ml-2 transition-colors ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      onClick={onChange}
    >
      <span className="text-[13px] text-[#E3E3E3]">{label}</span>
      <div
        className="flex items-center justify-center w-[18px] h-[18px] rounded-md border transition-all"
        style={{
          borderColor: checked ? color : "rgba(255,255,255,0.3)",
          backgroundColor: checked ? color : "transparent",
        }}
      >
        {checked && (
          <MaterialIcon
            icon="check"
            className="text-[#062E6F] text-[14px]"
            style={{ fontWeight: 800 }}
          />
        )}
      </div>
    </div>
  );
}

export function LeftControlsPanel() {
  const {
    leftPanelOpen,
    toggleLeftPanel,
    layerSolar,
    layerWind,
    layerLoad,
    layerBattery,
    layerDiesel,
    toggleLayer,
    resilienceModeActive,
    toggleResilienceMode,
    forecastModel,
    setForecastModel,
    selectedHorizon,
    setSelectedHorizon,
  } = usePolarisStore();

  const [microgridExpanded, setMicrogridExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [forecastExpanded, setForecastExpanded] = useState(true);
  const [horizonExpanded, setHorizonExpanded] = useState(true);

  const [microgridMaster, setMicrogridMaster] = useState(true);
  const [forecastMaster, setForecastMaster] = useState(true);

  if (!leftPanelOpen) {
    return (
      <button
        onClick={toggleLeftPanel}
        className="fixed top-20 left-4 p-3 rounded-full bg-[#1E1E1E]/70 backdrop-blur-2xl border border-white/10 shadow-2xl text-[#E3E3E3] hover:bg-[#333]/80 transition-colors z-40"
        title="Open Controls Panel"
      >
        <MaterialIcon icon="tune" />
      </button>
    );
  }

  return (
    <aside className="absolute top-20 left-4 w-[320px] rounded-[28px] bg-[#14161F]/70 backdrop-blur-3xl text-[#E3E3E3] z-40 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col max-h-[calc(100vh-120px)] border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="tune" className="text-[#A8C7FA]" />
          <h2 className="text-[17px] font-semibold tracking-tight text-white">Controls &amp; Filters</h2>
        </div>
        <button onClick={toggleLeftPanel} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <MaterialIcon icon="close" className="text-[#C4C7C5]" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto px-4 pb-5 custom-scrollbar flex-1 space-y-1">
        {/* Section 1: Microgrid SCADA & Dispatch */}
        <SectionHeader
          icon="electric_bolt"
          title="Microgrid"
          toggled={microgridMaster}
          onToggle={() => setMicrogridMaster(!microgridMaster)}
        />

        <div
          className={`transition-all duration-300 overflow-hidden ${
            microgridMaster ? "opacity-100 max-h-[1000px]" : "opacity-40 max-h-0"
          }`}
        >
          <ExpandableGroup
            title="Dispatch Logic"
            open={microgridExpanded}
            onToggle={() => setMicrogridExpanded(!microgridExpanded)}
          >
            <RadioItem
              label="Nominal MILP (HiGHS)"
              checked={!resilienceModeActive}
              onClick={() => {
                if (resilienceModeActive) toggleResilienceMode();
              }}
              badge="Optimal"
            />
            <RadioItem
              label="Tier-2 Survival Shedding"
              checked={resilienceModeActive}
              onClick={() => {
                if (!resilienceModeActive) toggleResilienceMode();
              }}
              warning={resilienceModeActive}
            />
          </ExpandableGroup>

          <ExpandableGroup
            title="SCADA Map Layer Filters"
            open={layersExpanded}
            onToggle={() => setLayersExpanded(!layersExpanded)}
          >
            <CheckboxItem
              label="Solar PV (Bifacial GHI)"
              checked={layerSolar}
              onChange={() => toggleLayer("solar")}
              color="#34D399"
            />
            <CheckboxItem
              label="Wind Turbines (Katabatic)"
              checked={layerWind}
              onChange={() => toggleLayer("wind")}
              color="#38BDF8"
            />
            <CheckboxItem
              label="BESS Storage (LiFePO4)"
              checked={layerBattery}
              onChange={() => toggleLayer("battery")}
              color="#A78BFA"
            />
            <CheckboxItem
              label="Habitat Demand (Tier 1)"
              checked={layerLoad}
              onChange={() => toggleLayer("load")}
              color="#FCA45A"
            />
            <CheckboxItem
              label="Diesel Genset (Standby)"
              checked={layerDiesel}
              onChange={() => toggleLayer("diesel")}
              color="#FB923C"
            />
          </ExpandableGroup>
        </div>

        <div className="h-[1px] w-full bg-white/10 my-2" />

        {/* Section 2: AI Weather & Prediction Horizon */}
        <SectionHeader
          icon="query_stats"
          title="AI Forecasting"
          toggled={forecastMaster}
          onToggle={() => setForecastMaster(!forecastMaster)}
        />

        <div
          className={`transition-all duration-300 overflow-hidden ${
            forecastMaster ? "opacity-100 max-h-[1000px]" : "opacity-40 max-h-0"
          }`}
        >
          <ExpandableGroup
            title="NWP Models"
            open={forecastExpanded}
            onToggle={() => setForecastExpanded(!forecastExpanded)}
          >
            <RadioItem
              label="Open-Meteo ECMWF IFS"
              checked={forecastModel === "hybrid-lstm"}
              onClick={() => setForecastModel("hybrid-lstm")}
              badge="Operational"
            />
            <RadioItem
              label="MetNet Global Radar"
              checked={forecastModel === "metnet-global"}
              onClick={() => setForecastModel("metnet-global")}
            />
            <RadioItem
              label="XGBoost Physics Climatology"
              checked={forecastModel === "xgboost"}
              onClick={() => setForecastModel("xgboost")}
            />
          </ExpandableGroup>

          <ExpandableGroup
            title="Prediction Horizon"
            open={horizonExpanded}
            onToggle={() => setHorizonExpanded(!horizonExpanded)}
          >
            <RadioItem
              label="24 Hours (Intraday)"
              checked={selectedHorizon === "24h"}
              onClick={() => setSelectedHorizon("24h")}
            />
            <RadioItem
              label="72 Hours (3 Days)"
              checked={selectedHorizon === "72h"}
              onClick={() => setSelectedHorizon("72h")}
            />
            <RadioItem
              label="168 Hours (7-Day Forecast)"
              checked={selectedHorizon === "168h"}
              onClick={() => setSelectedHorizon("168h")}
              badge="7 Days"
            />
          </ExpandableGroup>
        </div>
      </div>
    </aside>
  );
}

export default LeftControlsPanel;
