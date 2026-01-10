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
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m&timezone=America/New_York`),
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
    const waveHeight = waveData.hourly.wave_height[currentIdx];
    const wavePeriod = waveData.hourly.wave_period[currentIdx];

    // Convert wind speed from m/s to mph
    const windSpeedMph = windSpeed * 2.237;

    // Calculate condition score (0-100)
    // Wakeboarding prefers calm, flat water conditions
    let score = 50; // Base score

    // Wind speed: Calm conditions (< 10 mph) are ideal
    if (windSpeedMph < 5) {
      score += 30; // Perfect - glassy conditions
    } else if (windSpeedMph < 10) {
      score += 20; // Very good
    } else if (windSpeedMph < 15) {
      score += 5; // Acceptable
    } else if (windSpeedMph < 20) {
      score -= 10; // Getting choppy
    } else {
      score -= 25; // Too windy, poor conditions
    }

    // Wave height: Flat water (0-0.3m) is ideal
    if (waveHeight < 0.3) {
      score += 25; // Glassy, perfect
    } else if (waveHeight < 0.5) {
      score += 15; // Very smooth
    } else if (waveHeight < 1.0) {
      score += 5; // Small chop, okay
    } else if (waveHeight < 1.5) {
      score -= 10; // Getting choppy
    } else {
      score -= 20; // Too choppy
    }

    // Wave period: Longer period = smoother water (better)
    if (wavePeriod > 8) {
      score += 10; // Longer period = smoother
    } else if (wavePeriod < 4) {
      score -= 10; // Short period = choppy
    }

    // Wind consistency: Check gust factor
    const gustFactor = (windGusts - windSpeed) * 2.237;
    if (gustFactor < 3) {
      score += 10; // Very consistent
    } else if (gustFactor > 8) {
      score -= 10; // Very gusty, creates chop
    }

    // Helper function to calculate wakeboarding score for a given hour
    const calculateWakeboardingScore = (idx: number): number => {
      const hWindSpeed = windData.hourly.wind_speed_10m[idx];
      const hWindGusts = windData.hourly.wind_gusts_10m[idx];
      const hWaveHeight = waveData.hourly.wave_height[idx];
      const hWavePeriod = waveData.hourly.wave_period[idx];

      const hWindSpeedMph = hWindSpeed * 2.237;
      const hGustFactor = (hWindGusts - hWindSpeed) * 2.237;

      let hScore = 50;

      if (hWindSpeedMph < 5) {
        hScore += 30;
      } else if (hWindSpeedMph < 10) {
        hScore += 20;
      } else if (hWindSpeedMph < 15) {
        hScore += 5;
      } else if (hWindSpeedMph < 20) {
        hScore -= 10;
      } else {
        hScore -= 25;
      }

      if (hWaveHeight < 0.3) {
        hScore += 25;
      } else if (hWaveHeight < 0.5) {
        hScore += 15;
      } else if (hWaveHeight < 1.0) {
        hScore += 5;
      } else if (hWaveHeight < 1.5) {
        hScore -= 10;
      } else {
        hScore -= 20;
      }

      if (hWavePeriod > 8) {
        hScore += 10;
      } else if (hWavePeriod < 4) {
        hScore -= 10;
      }

      if (hGustFactor < 3) {
        hScore += 10;
      } else if (hGustFactor > 8) {
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
      const hourScore = calculateWakeboardingScore(i);
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
    let description = "Not ideal for wakeboarding";
    let emoji = "❌";

    if (score >= 80) {
      level = "Excellent";
      description = "Perfect wakeboarding conditions - glassy water";
      emoji = "🌊";
    } else if (score >= 65) {
      level = "Good";
      description = "Great conditions for wakeboarding";
      emoji = "👍";
    } else if (score >= 50) {
      level = "Fair";
      description = "Wakeable conditions";
      emoji = "🤷";
    } else if (score >= 35) {
      level = "Poor";
      description = "Marginal conditions - choppy water";
      emoji = "⚠️";
    } else {
      level = "Very Poor";
      description = "Not recommended - too choppy";
      emoji = "❌";
    }

    const response: any = {
      score: Math.round(score),
      level,
      description,
      emoji,
      windSpeed: windSpeedMph.toFixed(1),
      windGusts: (windGusts * 2.237).toFixed(1),
      waveHeight: (waveHeight * 3.28084).toFixed(2), // Convert to feet
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
    console.error("Wakeboarding conditions API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate wakeboarding conditions" },
      { status: 500 }
    );
  }
}

