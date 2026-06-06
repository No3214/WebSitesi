import { NextResponse } from "next/server";

import { getLocalPulse } from "@/lib/free-apis";

export const revalidate = 1800; // 30 dk

export async function GET() {
  const pulse = await getLocalPulse();
  return NextResponse.json(pulse, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
