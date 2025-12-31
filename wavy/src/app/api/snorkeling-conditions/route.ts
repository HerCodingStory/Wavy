import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const station = searchParams.get("station");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude required" },
      { status: 400 }
    );
  }

  try {
    // Get base URL for internal API calls
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Fetch wind, wave, and water quality data
    const [windRes, waveRes, qualityRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m&timezone=America/New_York`),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period&timezone=America/New_York`),
      station ? fetch(`${baseUrl}/api/water-quality?station=${station}`) : Promise.resolve(null),
    ]);

    if (!windRes.ok || !waveRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const windData = await windRes.json();
    const waveData = await waveRes.json();
    let waterQuality = null;
    if (qualityRes) {
      try {
        const qualityData = await qualityRes.json();
        waterQuality = qualityData;
      } catch {
        // Water quality optional
      }
    }

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
    const waveHeight = waveData.hourly.wave_height[currentIdx];
    const wavePeriod = waveData.hourly.wave_period[currentIdx];

    // Convert wind speed from m/s to mph
    const windSpeedMph = windSpeed * 2.237;

    // Calculate condition score (0-100)
    // Snorkeling prefers calm, clear conditions
    let score = 50; // Base score

    // Wind speed: Calm conditions (< 10 mph) are ideal
    if (windSpeedMph < 5) {
      score += 25; // Perfect - calm conditions
    } else if (windSpeedMph < 10) {
      score += 15; // Very good
    } else if (windSpeedMph < 15) {
      score += 5; // Acceptable
    } else if (windSpeedMph < 20) {
      score -= 10; // Getting choppy
    } else {
      score -= 25; // Too windy, poor visibility
    }

    // Wave height: Flat water (0-0.5m) is ideal for visibility
    if (waveHeight < 0.3) {
      score += 25; // Glassy, perfect visibility
    } else if (waveHeight < 0.5) {
      score += 15; // Very smooth
    } else if (waveHeight < 1.0) {
      score += 5; // Small waves, okay
    } else if (waveHeight < 1.5) {
      score -= 10; // Getting choppy, reduced visibility
    } else {
      score -= 20; // Too choppy, poor visibility
    }

    // Wave period: Longer period = smoother water (better)
    if (wavePeriod > 8) {
      score += 10; // Longer period = smoother
    } else if (wavePeriod < 4) {
      score -= 10; // Short period = choppy
    }

    // Water quality: Good quality is essential
    if (waterQuality && !waterQuality.error) {
      const qualityStatus = waterQuality.status || waterQuality.quality || "";
      if (qualityStatus.toLowerCase().includes("good") || qualityStatus.toLowerCase().includes("excellent")) {
        score += 15; // Excellent water quality
      } else if (qualityStatus.toLowerCase().includes("fair") || qualityStatus.toLowerCase().includes("acceptable")) {
        score += 5; // Acceptable
      } else if (qualityStatus.toLowerCase().includes("poor") || qualityStatus.toLowerCase().includes("unsafe")) {
        score -= 20; // Poor water quality, unsafe
      }
    }

    // Wind consistency: Check gust factor
    const gustFactor = (windGusts - windSpeed) * 2.237;
    if (gustFactor < 3) {
      score += 5; // Very consistent
    } else if (gustFactor > 8) {
      score -= 5; // Very gusty, creates chop
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine condition level
    let level = "Poor";
    let description = "Not ideal for snorkeling";
    let emoji = "❌";

    if (score >= 80) {
      level = "Excellent";
      description = "Perfect snorkeling conditions - clear and calm";
      emoji = "🤿";
    } else if (score >= 65) {
      level = "Good";
      description = "Great conditions for snorkeling";
      emoji = "👍";
    } else if (score >= 50) {
      level = "Fair";
      description = "Snorkelable conditions";
      emoji = "🤷";
    } else if (score >= 35) {
      level = "Poor";
      description = "Marginal conditions - choppy water";
      emoji = "⚠️";
    } else {
      level = "Very Poor";
      description = "Not recommended - poor visibility";
      emoji = "❌";
    }

    return NextResponse.json({
      score: Math.round(score),
      level,
      description,
      emoji,
      windSpeed: windSpeedMph.toFixed(1),
      windGusts: (windGusts * 2.237).toFixed(1),
      waveHeight: waveHeight?.toFixed(2),
      wavePeriod: wavePeriod?.toFixed(1),
      waterQuality: waterQuality?.status || waterQuality?.quality || "Unknown",
      timestamp: windData.hourly.time[currentIdx],
    });
  } catch (error) {
    console.error("Snorkeling conditions API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate snorkeling conditions" },
      { status: 500 }
    );
  }
}

