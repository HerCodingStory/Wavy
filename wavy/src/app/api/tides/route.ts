import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!station) {
    return NextResponse.json(
      { error: "Station ID required" },
      { status: 400 }
    );
  }

  try {
    // Fetch tide predictions from NOAA
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const noaaUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&station=${station}&begin_date=${dateStr}&end_date=${dateStr}&datum=MSL&units=english&time_zone=lst_ldt&interval=h&format=json`;

    const noaaRes = await fetch(noaaUrl);
    if (!noaaRes.ok) {
      throw new Error(`NOAA API returned ${noaaRes.status}`);
    }
    
    const noaaData = await noaaRes.json();

    // Check for NOAA API errors
    if (noaaData.error) {
      return NextResponse.json(
        { error: noaaData.error.message || "NOAA API error" },
        { status: 400 }
      );
    }

    if (noaaData?.predictions?.length > 0) {
      const predictions = noaaData.predictions;
      const now = new Date();
      
      // Find current tide level (closest prediction to now)
      let closest = predictions[0];
      let minDiff = Math.abs(new Date(closest.t).getTime() - now.getTime());
      
      for (const pred of predictions) {
        const diff = Math.abs(new Date(pred.t).getTime() - now.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closest = pred;
        }
      }

      // Find current index
      const currentIndex = predictions.findIndex((p: { t: string; v: string }) => p.t === closest.t);
      
      // Determine if tide is rising or falling
      const isRising = currentIndex < predictions.length - 1 
        ? parseFloat(predictions[currentIndex + 1].v) > parseFloat(closest.v)
        : false;

      // Find next high and low tides from current time forward
      const futurePredictions = predictions.slice(currentIndex);
      if (futurePredictions.length === 0) {
        // If no future predictions, use all predictions
        const sorted = [...predictions].sort((a, b) => parseFloat(a.v) - parseFloat(b.v));
        return NextResponse.json({
          source: "NOAA",
          current: {
            height: parseFloat(closest.v).toFixed(2),
            time: closest.t,
            isRising,
          },
          nextHigh: {
            height: parseFloat(sorted[sorted.length - 1].v).toFixed(2),
            time: sorted[sorted.length - 1].t,
          },
          nextLow: {
            height: parseFloat(sorted[0].v).toFixed(2),
            time: sorted[0].t,
          },
          predictions: predictions.slice(0, 24),
        });
      }

      // Sort future predictions to find next high/low
      const sortedFuture = [...futurePredictions].sort((a, b) => parseFloat(a.v) - parseFloat(b.v));
      const nextLowTide = sortedFuture[0];
      const nextHighTide = sortedFuture[sortedFuture.length - 1];
      
      // Also check if we need to look further ahead for the actual next high/low
      // (since the highest/lowest might not be the next one chronologically)
      let nextHigh = nextHighTide;
      let nextLow = nextLowTide;
      
      // Find the chronologically next high tide (higher than current)
      for (let i = 1; i < futurePredictions.length; i++) {
        const pred = futurePredictions[i];
        if (parseFloat(pred.v) > parseFloat(closest.v)) {
          nextHigh = pred;
          break;
        }
      }
      
      // Find the chronologically next low tide (lower than current)
      for (let i = 1; i < futurePredictions.length; i++) {
        const pred = futurePredictions[i];
        if (parseFloat(pred.v) < parseFloat(closest.v)) {
          nextLow = pred;
          break;
        }
      }

      return NextResponse.json({
        source: "NOAA",
        current: {
          height: parseFloat(closest.v).toFixed(2),
          time: closest.t,
          isRising,
        },
        nextHigh: {
          height: parseFloat(nextHigh.v).toFixed(2),
          time: nextHigh.t,
        },
        nextLow: {
          height: parseFloat(nextLow.v).toFixed(2),
          time: nextLow.t,
        },
        predictions: predictions.slice(0, 24), // Next 24 hours
      });
    }

    return NextResponse.json(
      { error: "No tide data available" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Tide fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tide data" },
      { status: 500 }
    );
  }
}
