import { NextRequest, NextResponse } from "next/server";
import { STATIONS } from "@/lib/seed-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const station = STATIONS.find((s) => s.id.toUpperCase() === id.toUpperCase());

  if (!station) {
    return NextResponse.json(
      { error: `Station with ID '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    station,
    timestamp: new Date().toISOString(),
  });
}
