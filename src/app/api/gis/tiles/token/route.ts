import { NextResponse } from "next/server";
import { getCachedTileToken } from "@/lib/gis-token";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tileData = await getCachedTileToken();
    return NextResponse.json(tileData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch tile token", details: message },
      { status: 500 }
    );
  }
}
