"use client";

import React, { useEffect } from "react";
import { TopNavBar } from "@/components/dashboard/TopNavBar";
import { LeftControlsPanel } from "@/components/dashboard/LeftControlsPanel";
import { CenterVisualizer } from "@/components/dashboard/CenterVisualizer";
import { StationDetailPanel } from "@/components/dashboard/StationDetailPanel";
import { BottomTimelineScrubber } from "@/components/dashboard/BottomTimelineScrubber";
import { RightFloatingActions } from "@/components/dashboard/RightFloatingActions";
import { BottomRightLegend } from "@/components/dashboard/BottomRightLegend";
import { TopKpiPills } from "@/components/dashboard/TopKpiPills";
import { Modals } from "@/components/dashboard/Modals";
import { usePolarisStore } from "@/lib/store";

export default function PolarEnergyDashboard() {
  const {
    isPlaying,
    setIsPlaying,
    stepTimeline,
    toggleResilienceMode,
    activeView,
    setActiveView,
    activeModal,
    setActiveModal,
  } = usePolarisStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepTimeline(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          stepTimeline(1);
          break;
        case "s":
        case "S":
          e.preventDefault();
          toggleResilienceMode();
          break;
        case "v":
        case "V":
          e.preventDefault();
          setActiveView(
            activeView === "radar-map"
              ? "station-map"
              : activeView === "station-map"
              ? "power-flow-diagram"
              : "radar-map"
          );
          break;
        case "Escape":
          if (activeModal) {
            e.preventDefault();
            setActiveModal(null);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    stepTimeline,
    toggleResilienceMode,
    activeView,
    setActiveView,
    activeModal,
    setActiveModal,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070B] select-none">
      {/* 1. Top Navigation Bar — Fixed h-13 */}
      <TopNavBar />

      {/* 2. Full-Screen Center Canvas (behind all floating panels) */}
      <div className="absolute inset-0 top-[3.25rem]">
        <CenterVisualizer />
      </div>

      {/* 3. Top Center Floating KPI Badges */}
      <TopKpiPills />

      {/* 4. Left Collapsible Controls Rail */}
      <LeftControlsPanel />

      {/* 5. Right Floating Action Buttons */}
      <RightFloatingActions />

      {/* 6. Right Station Detail Forecast & Optimization Matrix */}
      <StationDetailPanel />

      {/* 7. Bottom Central Timeline Scrubber */}
      <BottomTimelineScrubber />

      {/* 8. Bottom Right Gradient Legend */}
      <BottomRightLegend />

      {/* 9. Interactive Modals */}
      <Modals />
    </main>
  );
}
