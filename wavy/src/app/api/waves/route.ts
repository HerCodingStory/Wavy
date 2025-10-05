import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period&timezone=America/New_York`;

  const res = await fetch(url);
  const data = await res.json();

  const idx = data.hourly.time.findIndex((t: string) => t.includes("12:00"));
  const wave = {
    waveHeight: data.hourly.wave_height[idx],
    waveDir: data.hourly.wave_direction[idx],
    wavePeriod: data.hourly.wave_period[idx],
  };

  return NextResponse.json(wave);
}
