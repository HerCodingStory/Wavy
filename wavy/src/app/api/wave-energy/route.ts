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
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period&timezone=America/New_York`;

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

    const waveHeight = data.hourly.wave_height[currentIdx]; // in meters
    const wavePeriod = data.hourly.wave_period[currentIdx]; // in seconds

    // Validate data
    if (waveHeight == null || wavePeriod == null || isNaN(waveHeight) || isNaN(wavePeriod)) {
      return NextResponse.json(
        { error: "Invalid wave data" },
        { status: 404 }
      );
    }

    // Wave energy calculation: E = (1/8) * ρ * g * H² * T
    // Where:
    // ρ (rho) = density of seawater ≈ 1025 kg/m³
    // g = gravitational acceleration ≈ 9.81 m/s²
    // H = wave height in meters
    // T = wave period in seconds
    // Result in kJ/m² (kilojoules per square meter)
    const rho = 1025; // kg/m³
    const g = 9.81; // m/s²
    const energy = (1 / 8) * rho * g * Math.pow(waveHeight, 2) * wavePeriod;
    const energyKJ = energy / 1000; // Convert to kJ

    // Power (energy per unit time): P = E / T
    const power = energyKJ / wavePeriod; // kW/m

    // Categorize energy level
    let level = "Low";
    let description = "Gentle conditions";
    if (energyKJ > 50) {
      level = "Very High";
      description = "Powerful surf";
    } else if (energyKJ > 30) {
      level = "High";
      description = "Strong conditions";
    } else if (energyKJ > 15) {
      level = "Moderate";
      description = "Good surf energy";
    } else if (energyKJ > 5) {
      level = "Low-Moderate";
      description = "Moderate conditions";
    }

    return NextResponse.json({
      energy: energyKJ.toFixed(1),
      power: power.toFixed(2),
      unit: "kJ/m²",
      powerUnit: "kW/m",
      level,
      description,
      waveHeight: waveHeight.toFixed(2),
      wavePeriod: wavePeriod.toFixed(1),
      timestamp: data.hourly.time[currentIdx],
    });
  } catch (error) {
    console.error("Wave energy API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate wave energy" },
      { status: 500 }
    );
  }
}

