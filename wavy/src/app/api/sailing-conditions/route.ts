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
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period&timezone=America/New_York`),
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
    const wavePeriod = waveData.hourly.wave_period[currentIdx];

    // Convert wind speed from m/s to mph
    const windSpeedMph = windSpeed * 2.237;
    const windGustsMph = windGusts * 2.237;

    // Calculate condition score (0-100)
    // Sailing prefers moderate, consistent wind with manageable waves
    let score = 50; // Base score

    // Wind speed: 8-20 mph is ideal for most sailing
    if (windSpeedMph >= 10 && windSpeedMph <= 18) {
      score += 30; // Perfect sailing wind
    } else if (windSpeedMph >= 8 && windSpeedMph <= 22) {
      score += 20; // Good sailing wind
    } else if (windSpeedMph >= 5 && windSpeedMph <= 25) {
      score += 10; // Acceptable
    } else if (windSpeedMph < 5) {
      score -= 25; // Too light, not enough wind
    } else if (windSpeedMph > 30) {
      score -= 30; // Too strong, dangerous conditions
    } else if (windSpeedMph > 25) {
      score -= 15; // Very strong, challenging
    }

    // Wind consistency: Check gust factor
    const gustFactor = windGustsMph - windSpeedMph;
    if (gustFactor < 5) {
      score += 15; // Very consistent, ideal
    } else if (gustFactor < 10) {
      score += 5; // Reasonably consistent
    } else if (gustFactor > 15) {
      score -= 15; // Very gusty, challenging
    } else {
      score -= 5; // Somewhat gusty
    }

    // Wave height: Moderate waves (1-4 ft) are good for sailing, but too big can be dangerous
    const waveHeightFt = waveHeight * 3.28084;
    if (waveHeightFt >= 1 && waveHeightFt <= 4) {
      score += 15; // Good sailing waves
    } else if (waveHeightFt < 1) {
      score += 10; // Flat water, smooth sailing
    } else if (waveHeightFt >= 0.5 && waveHeightFt <= 6) {
      score += 5; // Acceptable wave conditions
    } else if (waveHeightFt > 8) {
      score -= 20; // Too big, dangerous
    } else if (waveHeightFt > 6) {
      score -= 10; // Large waves, challenging
    }

    // Wave period: Longer period means smoother waves (better for sailing)
    if (wavePeriod > 8) {
      score += 10; // Longer period = smoother, better
    } else if (wavePeriod < 4) {
      score -= 10; // Short period = choppy, uncomfortable
    }

    // Wind direction: For Miami area, consistent direction is good
    // We don't penalize much for direction since sailors can adjust

    // Helper function to calculate sailing score for a given hour
    const calculateSailingScore = (idx: number): number => {
      const hWindSpeed = windData.hourly.wind_speed_10m[idx];
      const hWindGusts = windData.hourly.wind_gusts_10m[idx];
      const hWaveHeight = waveData.hourly.wave_height[idx];
      const hWavePeriod = waveData.hourly.wave_period[idx];

      const hWindSpeedMph = hWindSpeed * 2.237;
      const hWindGustsMph = hWindGusts * 2.237;
      const hGustFactor = hWindGustsMph - hWindSpeedMph;
      const hWaveHeightFt = hWaveHeight * 3.28084;

      let hScore = 50;

      if (hWindSpeedMph >= 10 && hWindSpeedMph <= 18) {
        hScore += 30;
      } else if (hWindSpeedMph >= 8 && hWindSpeedMph <= 22) {
        hScore += 20;
      } else if (hWindSpeedMph >= 5 && hWindSpeedMph <= 25) {
        hScore += 10;
      } else if (hWindSpeedMph < 5) {
        hScore -= 25;
      } else if (hWindSpeedMph > 30) {
        hScore -= 30;
      } else if (hWindSpeedMph > 25) {
        hScore -= 15;
      }

      if (hGustFactor < 5) {
        hScore += 15;
      } else if (hGustFactor < 10) {
        hScore += 5;
      } else if (hGustFactor > 15) {
        hScore -= 15;
      } else {
        hScore -= 5;
      }

      if (hWaveHeightFt >= 1 && hWaveHeightFt <= 4) {
        hScore += 15;
      } else if (hWaveHeightFt < 1) {
        hScore += 10;
      } else if (hWaveHeightFt >= 0.5 && hWaveHeightFt <= 6) {
        hScore += 5;
      } else if (hWaveHeightFt > 8) {
        hScore -= 20;
      } else if (hWaveHeightFt > 6) {
        hScore -= 10;
      }

      if (hWavePeriod > 8) {
        hScore += 10;
      } else if (hWavePeriod < 4) {
        hScore -= 10;
      }

      return Math.max(0, Math.min(100, hScore));
    };

    // Find best time in next 48 hours
    let bestTime = null;
    let bestScore = score;
    let bestIdx = currentIdx;
    const hoursToCheck = Math.min(48, windData.hourly.time.length - currentIdx);

    for (let i = currentIdx; i < currentIdx + hoursToCheck; i++) {
      const hourScore = calculateSailingScore(i);
      if (hourScore > bestScore) {
        bestScore = hourScore;
        bestIdx = i;
        bestTime = windData.hourly.time[i];
      }
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine condition level
    let level = "Poor";
    let description = "Not ideal for sailing";
    let emoji = "❌";

    if (score >= 80) {
      level = "Excellent";
      description = "Perfect sailing conditions";
      emoji = "⛵";
    } else if (score >= 65) {
      level = "Good";
      description = "Great conditions for sailing";
      emoji = "👍";
    } else if (score >= 50) {
      level = "Fair";
      description = "Sailable conditions";
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

    const response: any = {
      score: Math.round(score),
      level,
      description,
      emoji,
      windSpeed: windSpeedMph.toFixed(1),
      windGusts: windGustsMph.toFixed(1),
      windDirection: windDirection?.toFixed(0),
      waveHeight: waveHeightFt.toFixed(2),
      wavePeriod: wavePeriod?.toFixed(1),
      gustFactor: gustFactor.toFixed(1),
      timestamp: windData.hourly.time[currentIdx],
      unit: "ft",
      windUnit: "mph",
    };

    // Add best time if found and different from current
    if (bestTime && bestIdx !== currentIdx && Math.round(bestScore) > Math.round(score)) {
      const bestTimeDate = new Date(bestTime);
      const hoursFromNow = Math.round((bestTimeDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      response.bestTime = bestTime;
      response.bestScore = Math.round(bestScore);
      response.bestTimeFormatted = bestTimeDate.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit", 
        hour12: true 
      });
      response.hoursFromNow = hoursFromNow;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sailing conditions API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate sailing conditions" },
      { status: 500 }
    );
  }
}

