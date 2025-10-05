import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon)
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });

  try {
    // Try NOAA first
    if (station) {
      const noaaUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&station=${station}&datum=MSL&units=english&time_zone=lst_ldt&format=json&range=24`;
      const noaaRes = await fetch(noaaUrl);
      const noaaData = await noaaRes.json();

      if (noaaData?.data?.length > 0) {
        const latest = noaaData.data[noaaData.data.length - 1];
        return NextResponse.json({
          source: "NOAA",
          temp: parseFloat(latest.v).toFixed(1),
          unit: "°F",
          timestamp: latest.t,
        });
      }
    }

    // Fallback to Open-Meteo Marine API
    const meteoUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_surface_temperature&timezone=auto`;
    const meteoRes = await fetch(meteoUrl);
    const meteoData = await meteoRes.json();

    if (meteoData?.hourly?.sea_surface_temperature?.length > 0) {
      const idx = meteoData.hourly.time.length - 1;
      const tempC = meteoData.hourly.sea_surface_temperature[idx];
      const tempF = (tempC * 9) / 5 + 32;

      return NextResponse.json({
        source: "Open-Meteo",
        temp: tempF.toFixed(1),
        unit: "°F",
        timestamp: meteoData.hourly.time[idx],
      });
    }

    return NextResponse.json(
      { error: "No water temperature data found" },
      { status: 404 }
    );
  } catch (err) {
    console.error("Water temperature fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch water temperature" },
      { status: 500 }
    );
  }
}
