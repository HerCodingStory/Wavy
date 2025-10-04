import { NextResponse } from "next/server";
import { MIAMI } from "@/lib/sources";

export const revalidate = 300;

export async function GET() {
  const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
  const paramsPred = new URLSearchParams({
    station: MIAMI.coopsStation,
    product: "predictions",
    datum: "MLLW",
    units: "english",
    interval: "h",
    range: "24",
    time_zone: "lst_ldt",
    format: "json",
  });
  const paramsTemp = new URLSearchParams({
    station: MIAMI.coopsStation,
    product: "water_temperature",
    units: "english",
    time_zone: "lst_ldt",
    date: "latest",
    format: "json",
  });

  const [pred, temp] = await Promise.all([
    fetch(`${base}?${paramsPred}`).then((r) => r.json()),
    fetch(`${base}?${paramsTemp}`).then((r) => r.json()),
  ]);

  return NextResponse.json({ predictions: pred, waterTemp: temp });
}
