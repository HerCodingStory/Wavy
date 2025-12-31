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
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wave_direction&timezone=America/New_York`;

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

    // Get current data and next 24 hours for consistency analysis
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

    // Analyze next 24 hours for consistency
    const forecastHours = 24;
    const heights = data.hourly.wave_height.slice(currentIdx, currentIdx + forecastHours).filter((h: number) => h != null && !isNaN(h));
    const periods = data.hourly.wave_period.slice(currentIdx, currentIdx + forecastHours).filter((p: number) => p != null && !isNaN(p));
    const directions = data.hourly.wave_direction.slice(currentIdx, currentIdx + forecastHours).filter((d: number) => d != null && !isNaN(d));

    if (heights.length === 0 || periods.length === 0 || directions.length === 0) {
      return NextResponse.json(
        { error: "Insufficient data for consistency calculation" },
        { status: 404 }
      );
    }

    // Calculate height consistency (coefficient of variation)
    const avgHeight = heights.reduce((a: number, b: number) => a + b, 0) / heights.length;
    const heightVariance = heights.reduce((sum: number, h: number) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
    const heightStdDev = Math.sqrt(heightVariance);
    const heightCV = (heightStdDev / avgHeight) * 100; // Coefficient of variation as percentage

    // Calculate period consistency
    const avgPeriod = periods.reduce((a: number, b: number) => a + b, 0) / periods.length;
    const periodVariance = periods.reduce((sum: number, p: number) => sum + Math.pow(p - avgPeriod, 2), 0) / periods.length;
    const periodStdDev = Math.sqrt(periodVariance);
    const periodCV = (periodStdDev / avgPeriod) * 100;

    // Calculate direction consistency (circular statistics)
    // Convert directions to radians and calculate mean direction
    const dirRadians = directions.map((d: number) => (d * Math.PI) / 180);
    const sinSum = dirRadians.reduce((sum: number, d: number) => sum + Math.sin(d), 0);
    const cosSum = dirRadians.reduce((sum: number, d: number) => sum + Math.cos(d), 0);
    const meanDirRad = Math.atan2(sinSum / directions.length, cosSum / directions.length);
    const meanDirDeg = (meanDirRad * 180) / Math.PI;

    // Calculate circular variance (1 - mean resultant length)
    const meanResultantLength = Math.sqrt(sinSum * sinSum + cosSum * cosSum) / directions.length;
    const circularVariance = 1 - meanResultantLength;
    const directionConsistency = (1 - circularVariance) * 100; // Convert to percentage

    // Overall consistency score (0-100)
    // Lower CV = more consistent, higher consistency score
    const heightConsistency = Math.max(0, 100 - heightCV);
    const periodConsistency = Math.max(0, 100 - periodCV);
    const overallConsistency = (heightConsistency * 0.4 + periodConsistency * 0.3 + directionConsistency * 0.3);

    // Categorize consistency
    let level = "Poor";
    let description = "Very inconsistent conditions";
    if (overallConsistency >= 80) {
      level = "Excellent";
      description = "Very consistent conditions";
    } else if (overallConsistency >= 65) {
      level = "Good";
      description = "Consistent conditions";
    } else if (overallConsistency >= 50) {
      level = "Fair";
      description = "Moderately consistent";
    } else if (overallConsistency >= 35) {
      level = "Poor";
      description = "Inconsistent conditions";
    }

    return NextResponse.json({
      score: overallConsistency.toFixed(0),
      level,
      description,
      heightConsistency: heightConsistency.toFixed(0),
      periodConsistency: periodConsistency.toFixed(0),
      directionConsistency: directionConsistency.toFixed(0),
      avgHeight: avgHeight.toFixed(2),
      avgPeriod: avgPeriod.toFixed(1),
      meanDirection: meanDirDeg.toFixed(0),
      timestamp: data.hourly.time[currentIdx],
    });
  } catch (error) {
    console.error("Wave consistency API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate wave consistency" },
      { status: 500 }
    );
  }
}

