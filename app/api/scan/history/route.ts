import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const offset = (page - 1) * limit;

    // Get total count
    const [{ count }] = await db
      .select({ count: schema.scans.id })
      .from(schema.scans)
      .then(rows => [{ count: rows.length }]);

    // Get paginated scans
    const scans = await db
      .select()
      .from(schema.scans)
      .orderBy(desc(schema.scans.scannedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      scans,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch scan history:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan history" },
      { status: 500 }
    );
  }
}
