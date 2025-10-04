import { NextResponse } from "next/server";

export const revalidate = 1800;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const station = searchParams.get("station") || "8723214"; // default: Virginia Key

    const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
    const queries = {
      temp: `${base}?station=${station}&product=water_temperature&date=latest&time_zone=lst_ldt&units=english&format=json`,
      salinity: `${base}?station=${station}&product=salinity&date=latest&time_zone=lst_ldt&units=english&format=json`,
      oxygen: `${base}?station=${station}&product=oxygen_concentration&date=latest&time_zone=lst_ldt&units=english&format=json`,
    };

    const [tempRes, salRes, oxyRes] = await Promise.all([
      fetch(queries.temp),
      fetch(queries.salinity),
      fetch(queries.oxygen),
    ]);

    const parseSafely = async (res: Response) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    };

    const [tempData, salData, oxyData] = await Promise.all([
      parseSafely(tempRes),
      parseSafely(salRes),
      parseSafely(oxyRes),
    ]);

    const temp = tempData?.data?.[0]?.v;
    const salinity = salData?.data?.[0]?.v;
    const oxygen = oxyData?.data?.[0]?.v;
    const timestamp =
      tempData?.data?.[0]?.t ||
      salData?.data?.[0]?.t ||
      oxyData?.data?.[0]?.t ||
      null;

    return NextResponse.json({
      station,
      temperature: temp ? `${temp}` : null,
      salinity: salinity ? `${salinity}` : null,
      oxygen: oxygen ? `${oxygen}` : null,
      timestamp,
    });
  } catch (error) {
    console.error("NOAA water quality error:", error);
    return NextResponse.json(
      { error: "Failed to fetch NOAA water data" },
      { status: 500 }
    );
  }
}
