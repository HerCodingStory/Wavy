import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = searchParams.get("station") || "8723214"; // Virginia Key

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&station=${station}&time_zone=lst_ldt&interval=hilo&units=english&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
