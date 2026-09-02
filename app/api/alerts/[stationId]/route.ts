import { NextRequest, NextResponse } from "next/server";
import { getStationAlerts } from "@/lib/seed-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  const alerts = getStationAlerts(stationId.toUpperCase());

  return NextResponse.json({
    stationId: stationId.toUpperCase(),
    alerts,
    count: alerts.length,
    timestamp: new Date().toISOString(),
  });
}
