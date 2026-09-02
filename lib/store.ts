import { create } from "zustand";
import type { ForecastHorizon, ForecastModelType, EnergyLayerType } from "./types";

export interface LiveTelemetryState {
  timestamp: string;
  solarKw: number;
  windKw: number;
  batterySoc: number;
  batteryPowerFlowKw: number; // + charging, - discharging
  dieselKw: number;
  loadKw: number;
  gridFrequencyHz: number;
  busVoltageV: number;
  powerFactor: number;
  renewablePenetration: number;
  carbonOffsetKgToday: number;
  dieselSavedLitersToday: number;
  satellitePingMs: number;
  temperatureC: number;
  windSpeedMs: number;
  solarGhiWm2: number;
}

interface PolarisStore {
  // Real-Time Clock & Telemetry Mode
  isLiveRealTime: boolean;
  setIsLiveRealTime: (live: boolean) => void;
  toggleLiveRealTime: () => void;
  liveTelemetry: LiveTelemetryState;
  updateLiveTelemetry: (telemetry: Partial<LiveTelemetryState>) => void;
  currentUtcSeconds: string;
  setCurrentUtcSeconds: (timeStr: string) => void;

  // Timeline State (for 72h replay / scenario exploration)
  timelineHour: number; // 0 to 71
  isPlaying: boolean;
  setTimelineHour: (hour: number) => void;
  setIsPlaying: (playing: boolean) => void;
  stepTimeline: (delta: number) => void;

  // Station Selection & Zoom
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  globeAltitude: number;
  setGlobeAltitude: (alt: number) => void;

  // Forecast & Optimization Model
  forecastModel: ForecastModelType;
  setForecastModel: (model: ForecastModelType) => void;
  selectedHorizon: ForecastHorizon;
  setSelectedHorizon: (horizon: ForecastHorizon) => void;

  // Layer Visibility
  layerSolar: boolean;
  layerWind: boolean;
  layerLoad: boolean;
  layerBattery: boolean;
  layerDiesel: boolean;
  toggleLayer: (layer: EnergyLayerType) => void;

  // Resilience & Survival Mode
  resilienceModeActive: boolean;
  toggleResilienceMode: () => void;
  setResilienceMode: (active: boolean) => void;

  // Active View (3D Earth, High-Res Station Site Map, or Single-Line Bus Diagram)
  activeView: "radar-map" | "station-map" | "power-flow-diagram";
  setActiveView: (view: "radar-map" | "station-map" | "power-flow-diagram") => void;

  // Panel States
  leftPanelOpen: boolean;
  stationDetailOpen: boolean;
  toggleLeftPanel: () => void;
  toggleStationDetail: () => void;

  // Active Modal
  activeModal: "find-locations" | "search-storms" | "shortcuts" | "export-report" | "share-link" | "info" | null;
  setActiveModal: (modal: "find-locations" | "search-storms" | "shortcuts" | "export-report" | "share-link" | "info" | null) => void;
}

export const usePolarisStore = create<PolarisStore>((set) => ({
  isLiveRealTime: true,
  setIsLiveRealTime: (live) => set({ isLiveRealTime: live }),
  toggleLiveRealTime: () => set((state) => ({ isLiveRealTime: !state.isLiveRealTime })),
  
  currentUtcSeconds: new Date().toISOString().substring(11, 19) + " UTC",
  setCurrentUtcSeconds: (timeStr) => set({ currentUtcSeconds: timeStr }),

  liveTelemetry: {
    timestamp: new Date().toISOString(),
    solarKw: 46.8,
    windKw: 38.4,
    batterySoc: 82.5,
    batteryPowerFlowKw: 12.4,
    dieselKw: 0.0,
    loadKw: 58.2,
    gridFrequencyHz: 50.02,
    busVoltageV: 400.2,
    powerFactor: 0.988,
    renewablePenetration: 94.2,
    carbonOffsetKgToday: 384.6,
    dieselSavedLitersToday: 142.8,
    satellitePingMs: 44,
    temperatureC: -19.4,
    windSpeedMs: 11.8,
    solarGhiWm2: 540,
  },
  updateLiveTelemetry: (telemetry) =>
    set((state) => ({
      liveTelemetry: { ...state.liveTelemetry, ...telemetry },
    })),

  timelineHour: 5,
  isPlaying: false,
  setTimelineHour: (hour) => set({ timelineHour: Math.max(0, Math.min(71, hour)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  stepTimeline: (delta) =>
    set((state) => ({
      timelineHour: (state.timelineHour + delta + 72) % 72,
    })),

  selectedStationId: "MAITRI",
  setSelectedStationId: (id) => set({ selectedStationId: id }),
  globeAltitude: 1.85,
  setGlobeAltitude: (alt) => set({ globeAltitude: alt }),

  forecastModel: "hybrid-lstm",
  setForecastModel: (model) => set({ forecastModel: model }),
  selectedHorizon: "72h",
  setSelectedHorizon: (horizon) => set({ selectedHorizon: horizon }),

  layerSolar: true,
  layerWind: true,
  layerLoad: true,
  layerBattery: true,
  layerDiesel: true,
  toggleLayer: (layer) =>
    set((state) => {
      switch (layer) {
        case "solar":
          return { layerSolar: !state.layerSolar };
        case "wind":
          return { layerWind: !state.layerWind };
        case "load":
          return { layerLoad: !state.layerLoad };
        case "battery":
          return { layerBattery: !state.layerBattery };
        case "diesel":
          return { layerDiesel: !state.layerDiesel };
      }
    }),

  resilienceModeActive: false,
  toggleResilienceMode: () => set((state) => ({ resilienceModeActive: !state.resilienceModeActive })),
  setResilienceMode: (active) => set({ resilienceModeActive: active }),

  activeView: "radar-map",
  setActiveView: (view) => set({ activeView: view }),

  leftPanelOpen: true,
  stationDetailOpen: true,
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleStationDetail: () => set((state) => ({ stationDetailOpen: !state.stationDetailOpen })),

  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
}));
