import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // NOAA + Open-Meteo fallback
  const noaaUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&station=${station}&datum=MSL&units=english&time_zone=lst_ldt&format=json&range=24`;
  const openMeteoUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_surface_temperature&timezone=auto`;

  try {
    // Try NOAA first
    const noaaRes = await fetch(noaaUrl);
    const noaaData = await noaaRes.json();

    if (noaaData?.data?.length && noaaData.data[0].v) {
      const latest = noaaData.data[noaaData.data.length - 1];
      return NextResponse.json({
        source: "NOAA",
        temperature: parseFloat(latest.v).toFixed(1),
        timestamp: latest.t,
      });
    }

    console.warn("NOAA water temp unavailable, falling back to Open-Meteo");

    // Try Open-Meteo Marine fallback
    const meteoRes = await fetch(openMeteoUrl);
    const meteoData = await meteoRes.json();

    if (meteoData?.hourly?.sea_surface_temperature?.length) {
      const temps = meteoData.hourly.sea_surface_temperature;
      const times = meteoData.hourly.time;
      const latestIndex = temps.length - 1;

      return NextResponse.json({
        source: "Open-Meteo",
        temperature: temps[latestIndex].toFixed(1),
        timestamp: times[latestIndex],
      });
    }

    return NextResponse.json(
      { error: "No water temperature data available" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Water temperature error:", error);
    return NextResponse.json(
      { error: "Failed to fetch water temperature" },
      { status: 500 }
    );
  }
}
