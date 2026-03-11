import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { scanMarket } from "@/lib/ai/analyzer";
import cache from "@/lib/cache";
import { auth } from "@/lib/auth";
import { sendAlertEmail } from "@/lib/email/mailer";
import { broadcast } from "@/lib/sse";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const SCANS_PER_DAY_FREE = 10;

export async function GET(req: NextRequest) {
  try {
    // Check authentication and rate limit
    const session = await auth();
    if (session?.user) {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, session.user.email!))
        .limit(1);

      if (user && user.plan === "free" && user.scanCount >= SCANS_PER_DAY_FREE) {
        return NextResponse.json(
          { error: "Daily scan limit reached. Upgrade to Pro for unlimited scans." },
          { status: 429 }
        );
      }
    }

    // Check cache first (for unfiltered/global scans)
    const cached = cache.get("latest-scan");
    if (cached && !req.url.includes("country=") && !req.url.includes("sector=")) {
      return NextResponse.json(cached);
    }

    // Parse optional filters
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const sector = searchParams.get("sector") || undefined;

    // Build cache key based on filters
    const cacheKey = `scan-${country || "ALL"}-${sector || "ALL"}`;

    // Check filter-specific cache
    const filterCached = cache.get(cacheKey);
    if (filterCached) {
      return NextResponse.json(filterCached);
    }

    // Run the AI market scan with filters
    const scanResult = await scanMarket({ country, sector });

    // Save to database
    const [savedScan] = await db
      .insert(schema.scans)
      .values({
        marketSentiment: scanResult.marketSentiment,
        sentimentScore: scanResult.sentimentScore,
        marketInsight: scanResult.marketInsight,
        keyRisks: scanResult.keyRisks,
        topHeadlines: scanResult.topHeadlines,
        stockRecommendations: scanResult.stockRecommendations,
      })
      .returning();

    // Store in cache (both global and filter-specific)
    cache.set("latest-scan", savedScan);
    cache.set(cacheKey, { scan: savedScan });

    // Broadcast to SSE clients
    broadcast("scan", savedScan);

    // Increment scan count for authenticated user
    if (session?.user) {
      await db
        .update(schema.users)
        .set({ scanCount: (await db
          .select({ scanCount: schema.users.scanCount })
          .from(schema.users)
          .where(eq(schema.users.email, session.user.email!))
          .limit(1)
        )[0].scanCount + 1 })
        .where(eq(schema.users.email, session.user.email!));
    }

    // Check watchlists for signal changes and send alert emails
    if (scanResult.stockRecommendations && Array.isArray(scanResult.stockRecommendations)) {
      const watchlistItems = await db
        .select()
        .from(schema.watchlists)
        .where(eq(schema.watchlists.alertOnChange, true));

      for (const item of watchlistItems) {
        const recommendation = scanResult.stockRecommendations.find(
          (rec: { ticker: string }) => rec.ticker === item.ticker
        );

        if (recommendation && recommendation.action !== item.lastSignal) {
          // Update the last signal
          await db
            .update(schema.watchlists)
            .set({ lastSignal: recommendation.action })
            .where(eq(schema.watchlists.id, item.id));

          // Create alert record
          await db.insert(schema.alerts).values({
            userId: item.userId,
            ticker: item.ticker,
            oldAction: item.lastSignal,
            newAction: recommendation.action,
            confidence: recommendation.confidence,
            reason: recommendation.reason,
          });

          // Send alert email
          const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, item.userId))
            .limit(1);

          if (user) {
            try {
              await sendAlertEmail({
                to: user.email,
                ticker: item.ticker,
                company: item.company ?? recommendation.company ?? item.ticker,
                oldAction: item.lastSignal ?? "N/A",
                newAction: recommendation.action,
                confidence: recommendation.confidence,
                reason: recommendation.reason,
              });
            } catch (emailError) {
              console.error(`Failed to send alert email to ${user.email}:`, emailError);
            }
          }
        }
      }
    }

    return NextResponse.json({ scan: savedScan });
  } catch (error) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to perform market scan: ${message}` },
      { status: 500 }
    );
  }
}
