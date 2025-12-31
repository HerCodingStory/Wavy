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
    // Fetch wind and wave data
    const [windRes, waveRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&timezone=America/New_York`),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height&timezone=America/New_York`),
    ]);

    if (!windRes.ok || !waveRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const windData = await windRes.json();
    const waveData = await waveRes.json();

    if (!windData.hourly?.time?.length || !waveData.hourly?.time?.length) {
      return NextResponse.json(
        { error: "No data available" },
        { status: 404 }
      );
    }

    // Get current data
    const now = new Date();
    let currentIdx = windData.hourly.time.length - 1;
    let minDiff = Math.abs(new Date(windData.hourly.time[currentIdx]).getTime() - now.getTime());

    for (let i = 0; i < windData.hourly.time.length; i++) {
      const diff = Math.abs(new Date(windData.hourly.time[i]).getTime() - now.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        currentIdx = i;
      }
    }

    const windSpeed = windData.hourly.wind_speed_10m[currentIdx];
    const windGusts = windData.hourly.wind_gusts_10m[currentIdx];
    const windDirection = windData.hourly.wind_direction_10m[currentIdx];
    const waveHeight = waveData.hourly.wave_height[currentIdx];

    // Convert wind speed from m/s to mph for kiteboarding (typical unit)
    const windSpeedMph = windSpeed * 2.237;
    const windGustsMph = windGusts * 2.237;

    // Calculate condition score (0-100)
    let score = 50; // Base score

    // Wind speed: 12-25 mph is ideal for most kiteboarders
    if (windSpeedMph >= 12 && windSpeedMph <= 25) {
      score += 30;
    } else if (windSpeedMph >= 10 && windSpeedMph <= 30) {
      score += 20;
    } else if (windSpeedMph >= 8 && windSpeedMph <= 35) {
      score += 10;
    } else if (windSpeedMph < 8) {
      score -= 25; // Too light
    } else if (windSpeedMph > 35) {
      score -= 30; // Too strong, dangerous
    }

    // Wind consistency: Check gust factor
    const gustFactor = windGustsMph - windSpeedMph;
    if (gustFactor < 5) {
      score += 15; // Very consistent
    } else if (gustFactor < 10) {
      score += 5; // Reasonably consistent
    } else if (gustFactor > 15) {
      score -= 15; // Very gusty, dangerous
    } else {
      score -= 5; // Somewhat gusty
    }

    // Wave height: Smaller is generally better for kiteboarding (flat water preferred)
    if (waveHeight < 0.5) {
      score += 15; // Flat water, ideal
    } else if (waveHeight < 1.0) {
      score += 5; // Small waves, okay
    } else if (waveHeight > 2.0) {
      score -= 10; // Big waves, harder to kite
    }

    // Wind direction: Onshore (wind from sea to land) is generally safer for beginners
    // For Miami, onshore typically means wind from E to S (90-180 degrees)
    // Offshore can be dangerous if you get blown out to sea
    const isOnshore = windDirection >= 90 && windDirection <= 180;
    if (isOnshore) {
      score += 5; // Safer direction
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine condition level
    let level = "Poor";
    let description = "Not ideal for kiteboarding";
    let emoji = "❌";

    if (score >= 80) {
      level = "Excellent";
      description = "Perfect kiteboarding conditions";
      emoji = "🪁";
    } else if (score >= 65) {
      level = "Good";
      description = "Great conditions for kiteboarding";
      emoji = "👍";
    } else if (score >= 50) {
      level = "Fair";
      description = "Kiteable conditions";
      emoji = "🤷";
    } else if (score >= 35) {
      level = "Poor";
      description = "Marginal conditions";
      emoji = "⚠️";
    } else {
      level = "Very Poor";
      description = "Not recommended - unsafe";
      emoji = "❌";
    }

    return NextResponse.json({
      score: Math.round(score),
      level,
      description,
      emoji,
      windSpeed: windSpeedMph.toFixed(1),
      windGusts: windGustsMph.toFixed(1),
      windDirection: windDirection?.toFixed(0),
      waveHeight: (waveHeight * 3.28084).toFixed(2), // Convert to feet
      gustFactor: gustFactor.toFixed(1),
      isOnshore,
      timestamp: windData.hourly.time[currentIdx],
      unit: "ft",
      windUnit: "mph",
    });
  } catch (error) {
    console.error("Kiteboarding conditions API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate kiteboarding conditions" },
      { status: 500 }
    );
  }
}

