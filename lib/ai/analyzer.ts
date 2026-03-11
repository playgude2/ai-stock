import Anthropic from "@anthropic-ai/sdk";
import type { ScanResult, Country } from "@/lib/types";

const TICKER_MAP: Record<string, string> = {
  US: "NYSE/NASDAQ",
  India: "NSE/BSE",
  UK: "LSE",
  China: "SSE/SZSE",
  Japan: "TSE",
};

const COUNTRY_CODES: Record<string, string> = {
  India: "IN",
  UK: "GB",
  China: "CN",
  Japan: "JP",
  US: "US",
};

function buildSystemPrompt(country?: string, sector?: string): string {
  const isFiltered = (country && country !== "ALL") || (sector && sector !== "ALL");
  const countries = country && country !== "ALL" ? [country] : ["US", "India", "UK", "China", "Japan"];
  const tickerInfo = countries.map((c) => `${c}=${TICKER_MAP[c] || c}`).join(", ");

  const countryLine =
    country && country !== "ALL"
      ? `You are a senior equity research analyst specializing in ${country} markets.`
      : "You are a senior global equity research analyst covering US, India, UK, China, and Japan.";

  const sectorLine =
    sector && sector !== "ALL"
      ? `Analyze the ${sector} sector exclusively.`
      : "Cover all major sectors: Technology, Finance, Healthcare, Energy, Agriculture, Defense, Water, Food & Beverages, Textiles & Apparel, Consumer, Industrials, Real Estate, Telecom, Automobile, Pharma, Mining & Metals, Infrastructure, Renewable Energy, E-Commerce, Banking.";

  const stockCount = isFiltered ? "8-12" : "15-20";

  return `${countryLine}

${sectorLine}

Exchanges: ${tickerInfo}.

RESPOND WITH ONLY A JSON OBJECT. No preamble, no explanation, no markdown fences.

Schema:
{"scannedAt":"ISO8601","marketSentiment":"BULLISH|BEARISH|NEUTRAL|VOLATILE","sentimentScore":-100to100,"marketInsight":"3 sentence macro summary","keyRisks":["risk1","risk2","risk3"],"topHeadlines":[{"title":"","source":"","impact":"HIGH|MEDIUM|LOW","sector":"","aiSummary":""}],"stockRecommendations":[{"ticker":"","company":"","action":"BUY|SELL|HOLD|WATCH","confidence":50-99,"targetTimeframe":"INTRADAY|SHORT_TERM|MEDIUM_TERM","currentTrend":"UP|DOWN|SIDEWAYS","sector":"","country":"","riskLevel":"LOW|MEDIUM|HIGH","reason":"2 sentences","catalysts":["",""]}]}

Requirements:
- ${stockCount} stock recommendations
- Each recommendation must cite specific news catalysts
- Use correct local ticker symbols`;
}

function buildUserMessage(country?: string, sector?: string): string {
  const parts = ["Search for today's top market-moving financial news"];

  if (country && country !== "ALL") {
    parts.push(`in ${country}`);
  } else {
    parts.push("across US, India, UK, China, Japan");
  }

  if (sector && sector !== "ALL") {
    parts.push(`focusing on ${sector} sector`);
  }

  parts.push("and provide actionable stock recommendations with signals.");
  return parts.join(" ");
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 10000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ScanOptions {
  country?: string;
  sector?: string;
}

export async function scanMarket(options: ScanOptions = {}): Promise<ScanResult> {
  const { country, sector } = options;
  const client = new Anthropic();

  const locationCountry =
    country && country !== "ALL"
      ? (COUNTRY_CODES[country] || "US")
      : "US";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const stream = await client.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: buildSystemPrompt(country, sector),
        tools: [
          {
            type: "web_search_20250305" as any,
            name: "web_search",
            max_uses: 3,
            user_location: {
              type: "approximate",
              country: locationCountry,
            },
          } as any,
        ],
        messages: [
          {
            role: "user",
            content: buildUserMessage(country, sector),
          },
        ],
      });

      const response = await stream.finalMessage();

      // Get ALL text blocks — with web search the model outputs
      // conversational text before the final JSON block
      const textBlocks = response.content.filter((block) => block.type === "text");
      if (textBlocks.length === 0) {
        throw new Error("No text response received from Claude");
      }

      // Combine all text blocks and extract JSON
      const fullText = textBlocks.map((b) => (b as { text: string }).text).join("\n");

      let jsonText = "";

      // Strategy 1: Look for ```json code fence
      const codeFenceMatch = fullText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeFenceMatch) {
        jsonText = codeFenceMatch[1].trim();
      } else {
        // Strategy 2: Find the first { and last } to extract JSON
        const firstBrace = fullText.indexOf("{");
        const lastBrace = fullText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonText = fullText.substring(firstBrace, lastBrace + 1);
        } else {
          throw new Error("No JSON found in response");
        }
      }

      const result: ScanResult = JSON.parse(jsonText);

      // Strip citation tags from all text fields
      const strip = (s: string) =>
        s ? s.replace(/<cite[^>]*>/gi, "").replace(/<\/cite>/gi, "").trim() : s;

      result.marketInsight = strip(result.marketInsight);
      result.keyRisks = result.keyRisks?.map(strip) ?? [];
      result.topHeadlines = result.topHeadlines?.map((h) => ({
        ...h,
        title: strip(h.title),
        aiSummary: strip(h.aiSummary),
      })) ?? [];
      result.stockRecommendations = result.stockRecommendations?.map((r) => ({
        ...r,
        reason: strip(r.reason),
        catalysts: r.catalysts?.map(strip) ?? [],
      })) ?? [];

      return result;
    } catch (error: any) {
      const isRateLimit = error?.status === 429;

      if (isRateLimit && attempt < MAX_RETRIES) {
        const retryAfter = error?.headers?.get?.("retry-after");
        const waitMs = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 60000)
          : RETRY_DELAY_MS * (attempt + 1);
        console.warn(`Rate limited, retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitMs);
        continue;
      }

      console.error("Market scan failed:", error);
      throw new Error(
        `Market scan failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  throw new Error("Market scan failed after all retries");
}
