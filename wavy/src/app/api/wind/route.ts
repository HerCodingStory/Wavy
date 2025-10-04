import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) return NextResponse.json({ error: "Missing coordinates" });

  try {
    const res = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const meta = await res.json();
    const forecastUrl = meta?.properties?.forecast;
    const forecast = await fetch(forecastUrl).then((r) => r.json());

    const today = forecast?.properties?.periods?.[0];
    const tonight = forecast?.properties?.periods?.[1];

    return NextResponse.json({
      today: today?.detailedForecast,
      tonight: tonight?.detailedForecast,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch NWS data" }, { status: 500 });
  }
}
