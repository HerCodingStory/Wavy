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
        { error: "No wave data available" },
        { status: 404 }
      );
    }

    // Get current data (latest available)
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

    const waveHeight = data.hourly.wave_height[currentIdx];
    const waveDir = data.hourly.wave_direction[currentIdx];
    const wavePeriod = data.hourly.wave_period[currentIdx];
    const peakPeriod = data.hourly.wave_peak_period?.[currentIdx] || wavePeriod;

    // Calculate swell components (simplified - using wave data as primary swell)
    // In a real implementation, you'd want separate swell data
    const primarySwell = {
      height: waveHeight,
      period: peakPeriod,
      direction: waveDir,
    };

    // Calculate surf height (wave height adjusted for period)
    // Formula: surf height ≈ wave height * (1 + period/10)
    const surfHeight = waveHeight * (1 + wavePeriod / 10);

    return NextResponse.json({
      waveHeight: waveHeight?.toFixed(2),
      waveDir: waveDir?.toFixed(0),
      wavePeriod: wavePeriod?.toFixed(1),
      peakPeriod: peakPeriod?.toFixed(1),
      surfHeight: surfHeight?.toFixed(2),
      primarySwell,
      timestamp: data.hourly.time[currentIdx],
      hourly: {
        time: data.hourly.time.slice(currentIdx, currentIdx + 24),
        height: data.hourly.wave_height.slice(currentIdx, currentIdx + 24),
        period: data.hourly.wave_period.slice(currentIdx, currentIdx + 24),
        direction: data.hourly.wave_direction.slice(currentIdx, currentIdx + 24),
      },
    });
  } catch (error) {
    console.error("Waves API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wave data" },
      { status: 500 }
    );
  }
}
