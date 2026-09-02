import { NextRequest, NextResponse } from "next/server";
import { getLiveNetworkState } from "@/lib/seed-data";

/**
 * GET /api/telemetry/:stationId/live
 * Live streaming SCADA telemetry endpoint for Antarctic research stations
 *
 * API EXTENSION HOOKS:
 * - Connect to MQTT Broker: `mosquitto.sub(topic="ncpor/stations/+/telemetry")`
 * - Connect to Modbus TCP gateway over satellite link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  const state = getLiveNetworkState(stationId.toUpperCase());

  return NextResponse.json(state);
}
