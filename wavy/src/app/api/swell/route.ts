import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,wave_peak_period&timezone=America/New_York`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();

    if (!data.hourly?.time?.length) {
      return NextResponse.json(
        { error: "No swell data available" },
        { status: 404 }
      );
    }

    // Get current data
    const now = new Date();
    let currentIdx = data.hourly.time.length - 1;
    let minDiff = Math.abs(new Date(data.hourly.time[currentIdx]).getTime() - now.getTime());

    for (let i = 0; i < data.hourly.time.length; i++) {
      const diff = Math.abs(new Date(data.hourly.time[i]).getTime() - now.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        currentIdx = i;
      }
    }

    const primarySwell = {
      height: data.hourly.wave_height[currentIdx]?.toFixed(2),
      period: data.hourly.wave_peak_period?.[currentIdx] || data.hourly.wave_period[currentIdx],
      direction: data.hourly.wave_direction[currentIdx],
      directionCardinal: getCardinalDirection(data.hourly.wave_direction[currentIdx]),
    };

    // Calculate secondary swell (simplified - using average of nearby periods)
    // In production, you'd want actual secondary swell data
    const nearbyPeriods = data.hourly.wave_period.slice(
      Math.max(0, currentIdx - 2),
      Math.min(data.hourly.wave_period.length, currentIdx + 3)
    );
    const avgPeriod = nearbyPeriods.reduce((a: number, b: number) => a + b, 0) / nearbyPeriods.length;

    const secondarySwell = {
      height: (data.hourly.wave_height[currentIdx] * 0.6)?.toFixed(2), // Estimate
      period: avgPeriod?.toFixed(1),
      direction: (data.hourly.wave_direction[currentIdx] + 30) % 360, // Estimate
      directionCardinal: getCardinalDirection((data.hourly.wave_direction[currentIdx] + 30) % 360),
    };

    return NextResponse.json({
      primary: primarySwell,
      secondary: secondarySwell,
      timestamp: data.hourly.time[currentIdx],
    });
  } catch (error) {
    console.error("Swell API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch swell data" },
      { status: 500 }
    );
  }
}

function getCardinalDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}

