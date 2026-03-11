import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
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

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { ticker, company, side, shares, pricePerShare, aiConfidence, aiAction } = body;

    // Validate inputs
    if (!ticker || !side || !shares || !pricePerShare) {
      return NextResponse.json({ error: "Missing required fields: ticker, side, shares, pricePerShare" }, { status: 400 });
    }
    if (side !== "BUY" && side !== "SELL") {
      return NextResponse.json({ error: "Side must be BUY or SELL" }, { status: 400 });
    }
    if (shares <= 0 || !Number.isInteger(shares)) {
      return NextResponse.json({ error: "Shares must be a positive integer" }, { status: 400 });
    }
    if (pricePerShare <= 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
    }

    const priceCents = Math.round(pricePerShare * 100);
    const totalCents = priceCents * shares;
    const upperTicker = ticker.toUpperCase();

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

    if (side === "BUY") {
      if (portfolio.cashBalance < totalCents) {
        return NextResponse.json({
          error: `Insufficient funds. Need $${(totalCents / 100).toFixed(2)} but have $${(portfolio.cashBalance / 100).toFixed(2)}`
        }, { status: 400 });
      }
    }

    if (side === "SELL") {
      const [position] = await db
        .select()
        .from(schema.paperPositions)
        .where(and(
          eq(schema.paperPositions.portfolioId, portfolio.id),
          eq(schema.paperPositions.ticker, upperTicker)
        ))
        .limit(1);

      if (!position || position.shares < shares) {
        return NextResponse.json({
          error: `Insufficient shares. You have ${position?.shares ?? 0} shares of ${upperTicker}`
        }, { status: 400 });
      }
    }

    // Execute trade in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Insert trade record
      const [trade] = await tx
        .insert(schema.paperTrades)
        .values({
          portfolioId: portfolio.id,
          ticker: upperTicker,
          company: company ?? null,
          side,
          shares,
          pricePerShare: priceCents,
          totalAmount: totalCents,
          aiConfidence: aiConfidence ?? null,
          aiAction: aiAction ?? null,
        })
        .returning();

      // 2. Update position
      const [existingPosition] = await tx
        .select()
        .from(schema.paperPositions)
        .where(and(
          eq(schema.paperPositions.portfolioId, portfolio.id),
          eq(schema.paperPositions.ticker, upperTicker)
        ))
        .limit(1);

      if (side === "BUY") {
        if (existingPosition) {
          // Update avg cost basis: ((oldAvg * oldShares) + (price * newShares)) / totalShares
          const oldTotal = existingPosition.avgCostBasis * existingPosition.shares;
          const newTotal = priceCents * shares;
          const totalShares = existingPosition.shares + shares;
          const newAvgCost = Math.round((oldTotal + newTotal) / totalShares);

          await tx
            .update(schema.paperPositions)
            .set({
              shares: totalShares,
              avgCostBasis: newAvgCost,
              updatedAt: new Date(),
            })
            .where(eq(schema.paperPositions.id, existingPosition.id));
        } else {
          await tx
            .insert(schema.paperPositions)
            .values({
              portfolioId: portfolio.id,
              ticker: upperTicker,
              company: company ?? null,
              shares,
              avgCostBasis: priceCents,
            });
        }

        // Deduct cash
        await tx
          .update(schema.paperPortfolios)
          .set({
            cashBalance: portfolio.cashBalance - totalCents,
            updatedAt: new Date(),
          })
          .where(eq(schema.paperPortfolios.id, portfolio.id));
      } else {
        // SELL
        const remainingShares = existingPosition!.shares - shares;
        if (remainingShares === 0) {
          await tx
            .delete(schema.paperPositions)
            .where(eq(schema.paperPositions.id, existingPosition!.id));
        } else {
          await tx
            .update(schema.paperPositions)
            .set({
              shares: remainingShares,
              updatedAt: new Date(),
            })
            .where(eq(schema.paperPositions.id, existingPosition!.id));
        }

        // Add cash
        await tx
          .update(schema.paperPortfolios)
          .set({
            cashBalance: portfolio.cashBalance + totalCents,
            updatedAt: new Date(),
          })
          .where(eq(schema.paperPortfolios.id, portfolio.id));
      }

      return trade;
    });

    return NextResponse.json({ trade: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to execute trade:", error);
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 });
  }
}
