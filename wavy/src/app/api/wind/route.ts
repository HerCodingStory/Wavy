import { NextResponse } from "next/server";

export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    // Step 1: Get grid info for the coordinates (Miami)
    const pointRes = await fetch("https://api.weather.gov/points/25.724,-80.155");
    const pointData = await pointRes.json();

    const forecastUrl = pointData?.properties?.forecast;
    if (!forecastUrl) throw new Error("No forecast URL from NWS.");

    // Step 2: Fetch the actual forecast
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    const today = forecastData.properties?.periods?.[0];
    const tonight = forecastData.properties?.periods?.[1];

    return NextResponse.json({
      today: today?.detailedForecast,
      tonight: tonight?.detailedForecast,
      source: forecastUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch NWS data" }, { status: 500 });
  }
}
