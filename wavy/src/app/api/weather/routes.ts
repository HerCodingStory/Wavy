import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,sunrise,sunset&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const c = data.current;
  return NextResponse.json({
    air: c.temperature_2m,
    feels: c.apparent_temperature,
    sunrise: c.sunrise,
    sunset: c.sunset,
  });
}
