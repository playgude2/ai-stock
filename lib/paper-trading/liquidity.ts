/**
 * Heuristic liquidity estimation based on sector + country.
 * In a real app, this would use order book data or volume metrics.
 */

export type LiquidityLevel = "HIGH" | "MEDIUM" | "LOW";

const HIGH_LIQUIDITY_SECTORS = new Set([
  "Technology",
  "Finance",
  "Banking",
  "Energy",
  "Healthcare",
  "E-Commerce",
]);

const MEDIUM_LIQUIDITY_SECTORS = new Set([
  "Consumer",
  "Industrials",
  "Automobile",
  "Pharmaceuticals",
  "Telecommunications",
  "Real Estate",
]);

const HIGH_LIQUIDITY_COUNTRIES = new Set(["US", "UK", "Japan"]);

export function getLiquidity(sector: string, country: string): LiquidityLevel {
  const isHighSector = HIGH_LIQUIDITY_SECTORS.has(sector);
  const isMediumSector = MEDIUM_LIQUIDITY_SECTORS.has(sector);
  const isHighCountry = HIGH_LIQUIDITY_COUNTRIES.has(country);

  if (isHighSector && isHighCountry) return "HIGH";
  if (isHighSector || (isMediumSector && isHighCountry)) return "MEDIUM";
  return "LOW";
}

export function getLiquidityColor(level: LiquidityLevel): string {
  switch (level) {
    case "HIGH": return "text-emerald-400 bg-emerald-400/10";
    case "MEDIUM": return "text-amber-400 bg-amber-400/10";
    case "LOW": return "text-red-400 bg-red-400/10";
  }
}

export function getLiquidityDescription(level: LiquidityLevel): string {
  switch (level) {
    case "HIGH": return "Easy to buy and sell — high trading volume";
    case "MEDIUM": return "Moderate trading volume — may take time to fill large orders";
    case "LOW": return "Low trading volume — harder to buy/sell quickly";
  }
}
