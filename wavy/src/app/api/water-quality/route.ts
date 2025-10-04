import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const id = 4460; // Miami Beach ID
    const res = await fetch(`https://www.theswimguide.org/api/beach/?format=json&id=${id}`);
    const json = await res.json();

    const status = json?.[0]?.status_label || "Unavailable";
    const name = json?.[0]?.name;

    return NextResponse.json({ name, status });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch SwimGuide data" }, { status: 500 });
  }
}
