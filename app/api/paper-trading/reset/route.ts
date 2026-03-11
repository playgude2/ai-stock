import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
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

    const [portfolio] = await db
      .select()
      .from(schema.paperPortfolios)
      .where(eq(schema.paperPortfolios.userId, userId))
      .limit(1);

    if (!portfolio) {
      return NextResponse.json({ error: "No portfolio found" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      // Delete all trades
      await tx
        .delete(schema.paperTrades)
        .where(eq(schema.paperTrades.portfolioId, portfolio.id));

      // Delete all positions
      await tx
        .delete(schema.paperPositions)
        .where(eq(schema.paperPositions.portfolioId, portfolio.id));

      // Reset cash balance to $100,000
      await tx
        .update(schema.paperPortfolios)
        .set({
          cashBalance: 10000000, // $100,000 in cents
          updatedAt: new Date(),
        })
        .where(eq(schema.paperPortfolios.id, portfolio.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset portfolio:", error);
    return NextResponse.json({ error: "Failed to reset portfolio" }, { status: 500 });
  }
}
