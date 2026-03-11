/**
 * Simulated stock pricing for paper trading.
 * Generates deterministic prices based on ticker + date so they stay
 * consistent within a day across page loads.
 * Replace this module with a real market data API when ready.
 */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get a simulated current price for a ticker.
 * Prices are deterministic per ticker+date — same price all day.
 */
export function getSimulatedPrice(ticker: string): number {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const tickerHash = hashCode(ticker);

  // Base price: $10 to $500 based on ticker
  const basePrice = 10 + (tickerHash % 490);

  // Daily variation: -3% to +3%
  const daySeed = hashCode(`${ticker}-${today}`);
  const dailyChange = (seededRandom(daySeed) - 0.5) * 0.06; // -3% to +3%

  const price = basePrice * (1 + dailyChange);
  return Math.round(price * 100) / 100; // 2 decimal places
}

/**
 * Get simulated prices for multiple tickers.
 */
export function getSimulatedPrices(tickers: string[]): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const ticker of tickers) {
    prices[ticker] = getSimulatedPrice(ticker);
  }
  return prices;
}
