import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station") || "8723214";

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=salinity&station=${station}&date=latest&units=english&time_zone=lst_ldt&format=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const value = data?.data?.[0]?.v || "Unavailable";

    return NextResponse.json({
      status: value !== "Unavailable" ? "Good" : "Unavailable",
      salinity: value,
      source: "NOAA",
    });
  } catch (e) {
    return NextResponse.json({ status: "Unavailable", source: "NOAA" });
  }
}
