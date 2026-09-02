/**
 * Open-Meteo Antarctic API Client for Polar Energy AI
 * Fetches real-time katabatic wind speed, direction, 2m temperature, cloud cover, and surface pressure.
 * API Endpoint: https://api.open-meteo.com/v1/forecast
 */

export interface OpenMeteoWeatherData {
  stationId: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timestamp: string;
  temperature_c: number;
  wind_speed_ms: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_gusts_ms: number;
  cloud_cover_pct: number;
  surface_pressure_hpa: number;
  isKatabaticStormWarning: boolean;
  hourlyForecast: Array<{
    time: string;
    windSpeed: number;
    windDirection: number;
    temperature: number;
    solarGhi: number;
  }>;
  isLiveApi: boolean;
}

export async function fetchOpenMeteoWeather(
  latitude: number = -70.7667,
  longitude: number = 11.7333,
  stationId: string = "MAITRI"
): Promise<OpenMeteoWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,direct_normal_irradiance&forecast_days=3&timezone=UTC`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data?.current || {};
      const hourly = data?.hourly || {};

      const ws = current.wind_speed_10m ?? 14.8;
      const wd = current.wind_direction_10m ?? 165; // SSE katabatic drainage typical for Maitri
      const temp = current.temperature_2m ?? -18.2;
      const gusts = current.wind_gusts_10m ?? ws * 1.35;
      const clouds = current.cloud_cover ?? 22;
      const pressure = current.surface_pressure ?? 988.4;

      const hourlyList = (hourly.time || []).slice(0, 72).map((t: string, idx: number) => ({
        time: t,
        windSpeed: hourly.wind_speed_10m?.[idx] ?? ws,
        windDirection: hourly.wind_direction_10m?.[idx] ?? wd,
        temperature: hourly.temperature_2m?.[idx] ?? temp,
        solarGhi: hourly.direct_normal_irradiance?.[idx] ?? 0,
      }));

      return {
        stationId,
        latitude,
        longitude,
        elevation: 117,
        timestamp: current.time || new Date().toISOString(),
        temperature_c: Math.round(temp * 10) / 10,
        wind_speed_ms: Math.round(ws * 10) / 10,
        wind_speed_kmh: Math.round(ws * 3.6 * 10) / 10,
        wind_direction_deg: Math.round(wd),
        wind_gusts_ms: Math.round(gusts * 10) / 10,
        cloud_cover_pct: Math.round(clouds),
        surface_pressure_hpa: Math.round(pressure * 10) / 10,
        isKatabaticStormWarning: ws > 25 || gusts > 32,
        hourlyForecast: hourlyList,
        isLiveApi: true,
      };
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackWeatherData(stationId, latitude, longitude);
}

export function getFallbackWeatherData(
  stationId: string = "MAITRI",
  latitude: number = -70.7667,
  longitude: number = 11.7333
): OpenMeteoWeatherData {
  const now = new Date();
  const hourly = Array.from({ length: 72 }, (_, h) => {
    const d = new Date(now.getTime() + h * 3600000);
    const stormPeak = h >= 42 && h <= 54;
    const speed = stormPeak ? 28.5 + Math.sin(h) * 4.2 : 12.5 + Math.sin(h * 0.25) * 3.8;
    return {
      time: d.toISOString(),
      windSpeed: Math.round(speed * 10) / 10,
      windDirection: 165 + Math.round(Math.sin(h * 0.1) * 20),
      temperature: Math.round((-18.5 - Math.cos(h * 0.26) * 3.2) * 10) / 10,
      solarGhi: Math.max(0, Math.round(Math.sin((h % 24) / 24 * Math.PI) * 320)),
    };
  });

  return {
    stationId,
    latitude,
    longitude,
    elevation: 117,
    timestamp: now.toISOString(),
    temperature_c: -18.4,
    wind_speed_ms: 14.2,
    wind_speed_kmh: 51.1,
    wind_direction_deg: 168,
    wind_gusts_ms: 19.8,
    cloud_cover_pct: 18,
    surface_pressure_hpa: 988.2,
    isKatabaticStormWarning: false,
    hourlyForecast: hourly,
    isLiveApi: false,
  };
}
