import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function getAuthenticatedUserId() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const items = await db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.userId, userId));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ticker, company } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker is required" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.userId, userId))
      .then(rows => rows.find(r => r.ticker === ticker.toUpperCase()));

    if (existing) {
      return NextResponse.json(
        { error: "Ticker already in watchlist" },
        { status: 409 }
      );
    }

    const [item] = await db
      .insert(schema.watchlists)
      .values({
        userId,
        ticker: ticker.toUpperCase(),
        company: company ?? null,
        alertOnChange: true,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Watchlist item id is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const [item] = await db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 }
      );
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this item" },
        { status: 403 }
      );
    }

    await db
      .delete(schema.watchlists)
      .where(eq(schema.watchlists.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to delete from watchlist" },
      { status: 500 }
    );
  }
}
