import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import cache from "@/lib/cache";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check cache first
    const cached = cache.get("latest-scan");
    if (cached) {
      return NextResponse.json({ scan: cached });
    }

    // Query the most recent scan from database
    const [latestScan] = await db
      .select()
      .from(schema.scans)
      .orderBy(desc(schema.scans.scannedAt))
      .limit(1);

    if (!latestScan) {
      return NextResponse.json(
        { error: "No scans found" },
        { status: 404 }
      );
    }

    // Store in cache for subsequent requests
    cache.set("latest-scan", latestScan);

    return NextResponse.json({ scan: latestScan });
  } catch (error) {
    console.error("Failed to fetch latest scan:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest scan" },
      { status: 500 }
    );
  }
}
