import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // Use Open-Meteo Forecast API (works on land & sea)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned ${res.status}`);
    }

    const data = await res.json();
    const hourly = data?.hourly;

    if (!hourly?.time?.length) {
      console.warn("No wind data found for coordinates:", { lat, lon });
      return NextResponse.json({
        error: "No wind data available",
        speed: null,
        gusts: null,
        direction: null,
      });
    }

    // Get latest available reading
    const latestIndex = hourly.time.length - 1;

    const windData = {
      speed: hourly.wind_speed_10m[latestIndex],
      gusts: hourly.wind_gusts_10m[latestIndex],
      direction: hourly.wind_direction_10m[latestIndex],
      timestamp: hourly.time[latestIndex],
      source: "Open-Meteo",
    };

    return NextResponse.json(windData);
  } catch (error) {
    console.error("Wind API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wind data" },
      { status: 500 }
    );
  }
}
