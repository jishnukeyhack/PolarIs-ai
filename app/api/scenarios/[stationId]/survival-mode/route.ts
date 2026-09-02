import { NextRequest, NextResponse } from "next/server";
import { generateDispatchSchedule } from "@/lib/seed-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  const schedule = generateDispatchSchedule(stationId.toUpperCase(), true);

  return NextResponse.json({
    status: "SURVIVAL_MODE_ENGAGED",
    stationId: stationId.toUpperCase(),
    tier1LifeSupport: "100% PROTECTED (35.0 kW)",
    tier2ScienceOps: "50% THROTTLED (18.0 kW)",
    tier3ComfortHeating: "100% SHED (0.0 kW)",
    projectedFuelSavedLiters: 480.0,
    schedule,
  });
}
