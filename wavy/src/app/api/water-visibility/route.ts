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
    // Fetch wave and wind data to estimate water visibility
    const [waveRes, windRes] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period&timezone=America/New_York`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m&timezone=America/New_York`),
    ]);

    if (!waveRes.ok || !windRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const waveData = await waveRes.json();
    const windData = await windRes.json();

    if (!waveData.hourly?.time?.length || !windData.hourly?.time?.length) {
      return NextResponse.json(
        { error: "No data available" },
        { status: 404 }
      );
    }

    // Get current data
    const now = new Date();
    let currentIdx = waveData.hourly.time.length - 1;
    let minDiff = Math.abs(new Date(waveData.hourly.time[currentIdx]).getTime() - now.getTime());

    for (let i = 0; i < waveData.hourly.time.length; i++) {
      const diff = Math.abs(new Date(waveData.hourly.time[i]).getTime() - now.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        currentIdx = i;
      }
    }

    const waveHeightM = waveData.hourly.wave_height[currentIdx];
    const wavePeriod = waveData.hourly.wave_period[currentIdx];
    const windSpeedMps = windData.hourly.wind_speed_10m[currentIdx];
    const windGustsMps = windData.hourly.wind_gusts_10m[currentIdx];

    // Convert to US units
    const waveHeightFt = waveHeightM * 3.28084;
    const windSpeedMph = windSpeedMps * 2.23694;
    const windGustsMph = windGustsMps * 2.23694;

    // Estimate water visibility based on conditions
    // Base visibility for Miami area (typically 15-30ft in good conditions)
    let baseVisibility = 25; // feet - typical for Miami Beach in calm conditions

    // Wave height impact: Choppy water stirs up sediment
    // Calm water (< 1ft) = excellent visibility
    // Moderate waves (1-2ft) = good visibility
    // Choppy waves (> 2ft) = reduced visibility
    if (waveHeightFt < 1.0) {
      // Calm conditions - no reduction
      baseVisibility = baseVisibility;
    } else if (waveHeightFt < 2.0) {
      baseVisibility *= 0.8; // 20% reduction
    } else if (waveHeightFt < 3.0) {
      baseVisibility *= 0.6; // 40% reduction
    } else {
      baseVisibility *= 0.4; // 60% reduction - very choppy
    }

    // Wave period impact: Short period = choppy, reduces visibility
    if (wavePeriod < 4) {
      baseVisibility *= 0.7; // Choppy conditions
    } else if (wavePeriod < 6) {
      baseVisibility *= 0.85; // Somewhat choppy
    }
    // Longer periods (> 6s) are smoother, no reduction

    // Wind speed impact: Strong wind stirs up sediment and creates surface disturbance
    if (windSpeedMph < 5) {
      // Calm wind - no reduction
      baseVisibility = baseVisibility;
    } else if (windSpeedMph < 10) {
      baseVisibility *= 0.9; // Light wind - slight reduction
    } else if (windSpeedMph < 15) {
      baseVisibility *= 0.75; // Moderate wind
    } else if (windSpeedMph < 20) {
      baseVisibility *= 0.6; // Strong wind
    } else {
      baseVisibility *= 0.4; // Very strong wind - poor visibility
    }

    // Wind gusts: Very gusty conditions create more disturbance
    const gustFactor = windGustsMph - windSpeedMph;
    if (gustFactor > 10) {
      baseVisibility *= 0.8; // Very gusty
    } else if (gustFactor > 5) {
      baseVisibility *= 0.9; // Somewhat gusty
    }

    // Ensure visibility is within realistic bounds (2-50 feet for Miami area)
    const estimatedVisibility = Math.max(2, Math.min(50, baseVisibility));

    // Categorize visibility
    let level = "Poor";
    let description = "Limited underwater visibility";
    
    if (estimatedVisibility >= 30) {
      level = "Excellent";
      description = "Crystal clear water - excellent visibility";
    } else if (estimatedVisibility >= 20) {
      level = "Very Good";
      description = "Very clear water - great visibility";
    } else if (estimatedVisibility >= 15) {
      level = "Good";
      description = "Good visibility for snorkeling";
    } else if (estimatedVisibility >= 10) {
      level = "Fair";
      description = "Moderate visibility";
    } else if (estimatedVisibility >= 5) {
      level = "Poor";
      description = "Limited visibility - choppy conditions";
    } else {
      level = "Very Poor";
      description = "Very poor visibility - avoid snorkeling";
    }

    return NextResponse.json({
      visibility: estimatedVisibility.toFixed(1),
      level,
      description,
      waveHeight: waveHeightFt.toFixed(2),
      wavePeriod: wavePeriod.toFixed(1),
      windSpeed: windSpeedMph.toFixed(1),
      unit: "ft",
      timestamp: waveData.hourly.time[currentIdx],
    });
  } catch (error) {
    console.error("Water visibility API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate water visibility" },
      { status: 500 }
    );
  }
}

