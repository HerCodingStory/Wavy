import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json({
    temperature: data.current.temperature_2m,
    unit: data.current_units.temperature_2m,
  });
}
