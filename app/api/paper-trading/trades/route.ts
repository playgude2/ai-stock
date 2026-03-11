import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function getAuthenticatedUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, session.user.email))
    .limit(1);
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const tickerFilter = searchParams.get("ticker")?.toUpperCase();

    // Get portfolio
    const [portfolio] = await db
      .select()
      .from(schema.paperPortfolios)
      .where(eq(schema.paperPortfolios.userId, userId))
      .limit(1);

    if (!portfolio) {
      return NextResponse.json({ trades: [], total: 0 });
    }

    // Build conditions
    const conditions = [eq(schema.paperTrades.portfolioId, portfolio.id)];
    if (tickerFilter) {
      conditions.push(eq(schema.paperTrades.ticker, tickerFilter));
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    // Get total count
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(schema.paperTrades)
      .where(whereClause!);

    // Get trades
    const trades = await db
      .select()
      .from(schema.paperTrades)
      .where(whereClause!)
      .orderBy(desc(schema.paperTrades.executedAt))
      .limit(limit)
      .offset(offset);

    // Convert cents to dollars for response
    const formattedTrades = trades.map((t) => ({
      ...t,
      pricePerShare: t.pricePerShare / 100,
      totalAmount: t.totalAmount / 100,
    }));

    return NextResponse.json({ trades: formattedTrades, total });
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}
