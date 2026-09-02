import { NextRequest, NextResponse } from "next/server";
import { generateStationForecastMatrix } from "@/lib/seed-data";

/**
 * GET /api/forecast/:stationId
 * Returns 72-hour multi-horizon predictive weather and generation matrices
 *
 * API EXTENSION HOOKS:
 * 1. Open-Meteo High-Latitude API:
 *    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=direct_normal_irradiance,wind_speed_10m,temperature_2m`
 * 2. NASA POWER Hourly API:
 *    `https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=ALLSKY_SFC_SW_DWN,WS10M,T2M&latitude=${lat}&longitude=${lng}`
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  const matrix = generateStationForecastMatrix(stationId.toUpperCase());

  return NextResponse.json({
    ...matrix,
    servedBy: "PolarIs-Prediction-Engine-v2.4",
  });
}
