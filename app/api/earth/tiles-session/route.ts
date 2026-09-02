import { NextResponse } from "next/server";

/**
 * GET /api/earth/tiles-session
 * Photorealistic 3D Earth Session Initialization API
 *
 * API EXTENSION HOOKS:
 * - Google Photorealistic 3D Tiles API / Earth Engine Tile Service
 *   `https://tile.googleapis.com/v1/3dtiles/root.json?key=${process.env.GOOGLE_MAPS_API_KEY}`
 */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    provider: "Google Earth Engine & 3D Photorealistic Tiles",
    defaultCoordinates: {
      lat: -70.7667,
      lng: 11.7333,
      altitudeMeters: 450000,
      heading: 0,
      tilt: 45,
    },
    layers: [
      { id: "era5-irradiance", title: "ECMWF ERA5 Surface Solar Radiation" },
      { id: "sentinel-albedo", title: "Copernicus Sentinel-2 Antarctic Albedo" },
    ],
  });
}
