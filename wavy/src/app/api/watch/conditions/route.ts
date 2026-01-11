import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

/**
 * Watch-optimized conditions API endpoint
 * Returns minimal, lightweight JSON for Garmin Connect IQ widgets
 * Optimized for battery life and fast response times
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const sport = searchParams.get("sport") || "surfing";
  const locationId = searchParams.get("locationId");

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

    // Fetch essential data only (optimized for watch)
    const [windRes, waveRes, conditionsRes] = await Promise.all([
      fetch(`${baseUrl}/api/wind?lat=${lat}&lon=${lon}`),
      fetch(`${baseUrl}/api/waves?lat=${lat}&lon=${lon}`),
      fetch(`${baseUrl}/api/${sport}-conditions?lat=${lat}&lon=${lon}`),
    ]);

    const wind = await windRes.json();
    const waves = await waveRes.json();
    const conditions = await conditionsRes.json();

    // Return minimal, watch-optimized response
    // All units already in US Imperial (mph, ft, etc.)
    const watchData = {
      // Timestamp for caching
      ts: Date.now(),
      
      // Wind (essential for water sports)
      w: {
        s: wind?.speed ? Math.round(wind.speed * 10) / 10 : null, // speed (mph)
        g: wind?.gusts ? Math.round(wind.gusts * 10) / 10 : null, // gusts (mph)
        d: wind?.direction ? Math.round(wind.direction) : null, // direction (degrees)
        dc: wind?.direction ? getCardinalShort(wind.direction) : null, // direction cardinal (N, NE, etc.)
      },
      
      // Waves
      v: {
        h: waves?.waveHeight ? Math.round(parseFloat(waves.waveHeight) * 10) / 10 : null, // height (ft)
        p: waves?.wavePeriod ? Math.round(waves.wavePeriod) : null, // period (s)
      },
      
      // Conditions score
      c: {
        s: conditions?.score ?? null, // score (0-100)
        l: conditions?.level ?? null, // level (Poor, Fair, Good, Excellent)
        e: conditions?.emoji ?? null, // emoji
      },
      
      // Location info (optional)
      loc: locationId || null,
    };

    return NextResponse.json(watchData, {
      headers: {
        // Cache for 5 minutes (watches update infrequently)
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error("Watch API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conditions", ts: Date.now() },
      { status: 500 }
    );
  }
}

/**
 * Get short cardinal direction
 */
function getCardinalShort(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}



