import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { windSpeed, gusts, direction, waveHeight, waterQuality } = body;

  let score = 100;

  if (windSpeed < 12) score -= 30;
  if (windSpeed > 30) score -= 20;
  if (gusts - windSpeed > 5) score -= 10;
  if (waveHeight > 2.5) score -= 10;
  if (waterQuality !== "Good") score -= 15;
  if (direction > 190 && direction < 350) score -= 10; // offshore = unsafe

  let message = "Perfect 🌞";
  if (score < 60) message = "Marginal ⚠️";
  if (score < 40) message = "Unsafe 🚫";

  return NextResponse.json({ score, message });
}
