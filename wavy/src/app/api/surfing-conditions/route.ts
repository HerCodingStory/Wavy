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
    // Fetch wave, wind, and tide data
    const [waveRes, windRes, tideRes] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wave_direction&timezone=America/New_York`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m&timezone=America/New_York`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=America/New_York`),
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
    const waveHeight = waveHeightM * 3.28084; // Convert to feet
    const wavePeriod = waveData.hourly.wave_period[currentIdx];
    const waveDirection = waveData.hourly.wave_direction[currentIdx];
    const windSpeedMps = windData.hourly.wind_speed_10m[currentIdx];
    const windSpeed = windSpeedMps * 2.23694; // Convert to mph
    const windDirection = windData.hourly.wind_direction_10m[currentIdx];

    // Calculate condition score (0-100)
    let score = 50; // Base score

    // Wave height: 1.6-6.6ft (0.5-2m) is ideal for most surfers
    if (waveHeight >= 1.6 && waveHeight <= 6.6) {
      score += 25;
    } else if (waveHeight >= 1.0 && waveHeight <= 8.2) {
      score += 15;
    } else if (waveHeight < 1.0) {
      score -= 20; // Too flat
    } else if (waveHeight > 9.8) {
      score -= 15; // Too big for most
    }

    // Wave period: 8-15s is ideal
    if (wavePeriod >= 8 && wavePeriod <= 15) {
      score += 20;
    } else if (wavePeriod >= 6 && wavePeriod <= 18) {
      score += 10;
    } else if (wavePeriod < 6) {
      score -= 15; // Too choppy
    }

    // Wind: Offshore (wind blowing from land to sea) is ideal
    // For Miami area, offshore typically means wind from NW to NE (270-90 degrees)
    // We need to check if wind is opposite to wave direction (offshore)
    const windToWaveDiff = Math.abs(windDirection - waveDirection);
    const isOffshore = windToWaveDiff > 90 && windToWaveDiff < 270;
    
    if (windSpeed < 5) {
      score += 15; // Light wind is good
    } else if (windSpeed < 10 && isOffshore) {
      score += 10; // Light offshore is excellent
    } else if (windSpeed > 20) {
      score -= 20; // Too windy
    } else if (windSpeed > 15) {
      score -= 10; // Windy
    }

    // Helper function to calculate surfing score for a given hour
    const calculateSurfingScore = (idx: number): number => {
      const hWaveHeightM = waveData.hourly.wave_height[idx];
      const hWaveHeight = hWaveHeightM * 3.28084;
      const hWavePeriod = waveData.hourly.wave_period[idx];
      const hWaveDirection = waveData.hourly.wave_direction[idx];
      const hWindSpeedMps = windData.hourly.wind_speed_10m[idx];
      const hWindSpeed = hWindSpeedMps * 2.23694;
      const hWindDirection = windData.hourly.wind_direction_10m[idx];

      let hScore = 50;

      if (hWaveHeight >= 1.6 && hWaveHeight <= 6.6) {
        hScore += 25;
      } else if (hWaveHeight >= 1.0 && hWaveHeight <= 8.2) {
        hScore += 15;
      } else if (hWaveHeight < 1.0) {
        hScore -= 20;
      } else if (hWaveHeight > 9.8) {
        hScore -= 15;
      }

      if (hWavePeriod >= 8 && hWavePeriod <= 15) {
        hScore += 20;
      } else if (hWavePeriod >= 6 && hWavePeriod <= 18) {
        hScore += 10;
      } else if (hWavePeriod < 6) {
        hScore -= 15;
      }

      const hWindToWaveDiff = Math.abs(hWindDirection - hWaveDirection);
      const hIsOffshore = hWindToWaveDiff > 90 && hWindToWaveDiff < 270;

      if (hWindSpeed < 5) {
        hScore += 15;
      } else if (hWindSpeed < 10 && hIsOffshore) {
        hScore += 10;
      } else if (hWindSpeed > 20) {
        hScore -= 20;
      } else if (hWindSpeed > 15) {
        hScore -= 10;
      }

      return Math.max(0, Math.min(100, hScore));
    };

    // Find best time in next 48 hours
    let bestTime = null;
    let bestScore = score;
    let bestIdx = currentIdx;
    const hoursToCheck = Math.min(48, waveData.hourly.time.length - currentIdx);

    for (let i = currentIdx; i < currentIdx + hoursToCheck; i++) {
      const hourScore = calculateSurfingScore(i);
      if (hourScore > bestScore) {
        bestScore = hourScore;
        bestIdx = i;
        bestTime = waveData.hourly.time[i];
      }
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine condition level
    let level = "Poor";
    let description = "Not ideal for surfing";
    let emoji = "❌";

    if (score >= 80) {
      level = "Excellent";
      description = "Perfect surfing conditions";
      emoji = "🏄‍♂️";
    } else if (score >= 65) {
      level = "Good";
      description = "Great conditions for surfing";
      emoji = "👍";
    } else if (score >= 50) {
      level = "Fair";
      description = "Surfable conditions";
      emoji = "🤷";
    } else if (score >= 35) {
      level = "Poor";
      description = "Marginal conditions";
      emoji = "⚠️";
    } else {
      level = "Very Poor";
      description = "Not recommended";
      emoji = "❌";
    }

    const response: any = {
      score: Math.round(score),
      level,
      description,
      emoji,
      waveHeight: waveHeight?.toFixed(2),
      wavePeriod: wavePeriod?.toFixed(1),
      windSpeed: windSpeed?.toFixed(1),
      windDirection: windDirection?.toFixed(0),
      isOffshore,
      timestamp: waveData.hourly.time[currentIdx],
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
    console.error("Surfing conditions API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate surfing conditions" },
      { status: 500 }
    );
  }
}

