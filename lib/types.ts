import { z } from "zod";

/**
 * PolarIs AI Data Contracts & Zod Schemas
 * Type definitions for Antarctic Microgrid Management
 */

export const StationCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(-60),
  lng: z.number().min(-180).max(180),
});

export type StationCoordinates = z.infer<typeof StationCoordinatesSchema>;

export const MicrogridSpecSchema = z.object({
  solarCapacityKw: z.number().positive(),
  bifacialAlbedoFactor: z.number().min(1.0).max(1.5).default(1.25),
  windTurbines: z.array(
    z.object({
      id: z.string(),
      ratedKw: z.number().positive(),
      cutInMs: z.number().default(3.0),
      ratedMs: z.number().default(12.0),
      cutOutMs: z.number().default(25.0),
      count: z.number().int().positive().default(1),
    })
  ),
  batteryEnergyStorage: z.object({
    chemistry: z.string().default("LiFePO4-PolarGrade"),
    usableCapacityKwh: z.number().positive(),
    maxChargeRateKw: z.number().positive(),
    maxDischargeRateKw: z.number().positive(),
    minAllowedSoc: z.number().min(0).max(1).default(0.20),
    maxAllowedSoc: z.number().min(0).max(1).default(0.95),
    nominalEfficiency: z.number().min(0.8).max(1.0).default(0.94),
    installedThermalHeatersKw: z.number().default(4.5),
  }),
  dieselGenerators: z.array(
    z.object({
      id: z.string(),
      ratedKw: z.number().positive(),
      minLoadingRatio: z.number().min(0.2).max(0.5).default(0.30),
      fuelCurveLPerKwh: z.number().default(0.28),
      coldStartPenaltyLiters: z.number().default(1.8),
    })
  ),
  baselineThermalLoadKw: z.number().positive(),
  baselineElectricalLoadKw: z.number().positive(),
});

export type MicrogridSpec = z.infer<typeof MicrogridSpecSchema>;

export const AntarcticStationSchema = z.object({
  id: z.string(),
  code: z.enum(["MAITRI", "BHARATI", "MAITRI_2"]),
  name: z.string(),
  country: z.string().default("India"),
  jurisdiction: z.string().default("NCPOR / MoES"),
  coordinates: StationCoordinatesSchema,
  elevationMeters: z.number(),
  climateZone: z.string(),
  activeCommissioningYear: z.number().int(),
  crewCapacity: z.object({
    winter: z.number().int().positive(),
    summer: z.number().int().positive(),
  }),
  microgridSpec: MicrogridSpecSchema,
});

export type AntarcticStation = z.infer<typeof AntarcticStationSchema>;

export type ForecastHorizon = "1h" | "6h" | "24h" | "72h" | "168h";
export type ForecastModelType = "hybrid-lstm" | "metnet-global" | "xgboost" | "physics-baseline";
export type EnergyLayerType = "solar" | "wind" | "load" | "battery" | "diesel";

export interface HourlyForecastPoint {
  timestampUtc: string;
  hourOffset: number;
  solarGhiWm2: number;
  solarPvGenerationKw: number;
  solarPvP10Kw: number;
  solarPvP90Kw: number;
  windSpeed10mMs: number;
  windTurbineGenerationKw: number;
  windTurbineP10Kw: number;
  windTurbineP90Kw: number;
  ambientTemperatureC: number;
  electricalLoadDemandKw: number;
  thermalHeatingLoadKw: number;
  totalLoadDemandKw: number;
}

export interface StationForecastMatrix {
  stationId: string;
  stationCode: string;
  generatedAtUtc: string;
  model: ForecastModelType;
  points: HourlyForecastPoint[];
}

export interface DispatchSchedulePoint {
  hourOffset: number;
  solarUsedKw: number;
  windUsedKw: number;
  batteryChargeKw: number;
  batteryDischargeKw: number;
  batterySocPercent: number;
  dieselGen1Kw: number;
  dieselGen2Kw: number;
  totalDieselKw: number;
  fuelConsumedLiters: number;
  tier1LoadServedKw: number;
  tier2LoadServedKw: number;
  tier3LoadServedKw: number;
  unmetLoadKw: number;
}

export interface StationAlert {
  id: string;
  stationId: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  description: string;
  timestamp: string;
  etaHours?: number;
  source: string;
}
