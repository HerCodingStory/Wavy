import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) return NextResponse.json({ error: "Missing coordinates" });

  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wind_wave_direction`;
    const res = await fetch(url);
    const data = await res.json();

    const height = data?.hourly?.wave_height?.[0];
    const dir = data?.hourly?.wind_wave_direction?.[0];

    return NextResponse.json({ waveHeight: height, direction: dir });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch waves" }, { status: 500 });
  }
}
