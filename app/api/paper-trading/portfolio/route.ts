import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSimulatedPrices } from "@/lib/paper-trading/pricing";

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

    // Get or create portfolio
    let [portfolio] = await db
      .select()
      .from(schema.paperPortfolios)
      .where(eq(schema.paperPortfolios.userId, userId))
      .limit(1);

    if (!portfolio) {
      [portfolio] = await db
        .insert(schema.paperPortfolios)
        .values({ userId })
        .returning();
    }

    // Get positions
    const positions = await db
      .select()
      .from(schema.paperPositions)
      .where(eq(schema.paperPositions.portfolioId, portfolio.id));

    // Calculate P&L with simulated prices
    const tickers = positions.map((p) => p.ticker);
    const prices = getSimulatedPrices(tickers);

    const positionsWithPnL = positions.map((p) => {
      const currentPrice = prices[p.ticker] || 0;
      const avgCost = p.avgCostBasis / 100; // cents to dollars
      const marketValue = currentPrice * p.shares;
      const costBasis = avgCost * p.shares;
      const pnl = marketValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        id: p.id,
        ticker: p.ticker,
        company: p.company,
        shares: p.shares,
        avgCostBasis: avgCost,
        currentPrice,
        marketValue: Math.round(marketValue * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
      };
    });

    const cashBalance = portfolio.cashBalance / 100;
    const totalInvested = positionsWithPnL.reduce((sum, p) => sum + p.avgCostBasis * p.shares, 0);
    const totalMarketValue = positionsWithPnL.reduce((sum, p) => sum + p.marketValue, 0);
    const totalValue = cashBalance + totalMarketValue;
    const totalPnL = totalMarketValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return NextResponse.json({
      portfolio: {
        id: portfolio.id,
        cashBalance,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
        positions: positionsWithPnL,
      },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
