import { NextResponse } from "next/server";
import { STATIONS } from "@/lib/seed-data";

/**
 * GET /api/stations
 * Returns all active Antarctic Research Stations (Maitri, Bharati, Maitri II)
 *
 * API EXTENSION HOOK:
 * - Plug in NCPOR live GIS endpoints or Google Earth Engine station vector boundaries here.
 */
export async function GET() {
  return NextResponse.json({
    stations: STATIONS,
    total: STATIONS.length,
    timestamp: new Date().toISOString(),
  });
}
