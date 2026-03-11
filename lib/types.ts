export interface Headline {
  title: string;
  source: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  sector: string;
  aiSummary: string;
}

export type Country = "US" | "India" | "UK" | "China" | "Japan";

export const COUNTRIES: { code: Country; name: string; flag: string; exchange: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸", exchange: "NYSE/NASDAQ" },
  { code: "India", name: "India", flag: "🇮🇳", exchange: "NSE/BSE" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", exchange: "LSE" },
  { code: "China", name: "China", flag: "🇨🇳", exchange: "SSE/SZSE" },
  { code: "Japan", name: "Japan", flag: "🇯🇵", exchange: "TSE" },
];

export const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Energy",
  "Agriculture",
  "Defense",
  "Water",
  "Food & Beverages",
  "Textiles & Apparel",
  "Consumer",
  "Industrials",
  "Real Estate",
  "Telecommunications",
  "Automobile",
  "Pharmaceuticals",
  "Mining & Metals",
  "Infrastructure",
  "Renewable Energy",
  "E-Commerce",
  "Banking",
] as const;

export type Sector = (typeof SECTORS)[number];

export interface StockRecommendation {
  ticker: string;
  company: string;
  action: "BUY" | "SELL" | "HOLD" | "WATCH";
  confidence: number;
  targetTimeframe: "INTRADAY" | "SHORT_TERM" | "MEDIUM_TERM";
  currentTrend: "UP" | "DOWN" | "SIDEWAYS";
  sector: string;
  country: Country;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
  catalysts: string[];
}

export interface ScanResult {
  scannedAt?: string;
  marketSentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | "VOLATILE";
  sentimentScore: number;
  marketInsight: string;
  keyRisks: string[];
  topHeadlines: Headline[];
  stockRecommendations: StockRecommendation[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  scanCount: number;
  createdAt: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  ticker: string;
  company: string | null;
  lastSignal: string | null;
  alertOnChange: boolean;
  addedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  ticker: string;
  oldAction: string;
  newAction: string;
  confidence: number;
  reason: string;
  sentAt: Date;
}

// Paper Trading types
export interface PaperPortfolio {
  id: string;
  userId: string;
  cashBalance: number; // cents
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperPosition {
  id: string;
  portfolioId: string;
  ticker: string;
  company: string | null;
  shares: number;
  avgCostBasis: number; // cents per share
  openedAt: Date;
  updatedAt: Date;
}

export interface PaperTrade {
  id: string;
  portfolioId: string;
  ticker: string;
  company: string | null;
  side: "BUY" | "SELL";
  shares: number;
  pricePerShare: number; // cents
  totalAmount: number; // cents
  aiConfidence: number | null;
  aiAction: string | null;
  executedAt: Date;
}

export interface PortfolioSummary {
  cashBalance: number; // dollars
  totalInvested: number; // dollars
  totalValue: number; // dollars
  totalPnL: number; // dollars
  totalPnLPercent: number;
  positions: PositionWithPnL[];
}

export interface PositionWithPnL {
  id: string;
  ticker: string;
  company: string | null;
  shares: number;
  avgCostBasis: number; // dollars per share
  currentPrice: number; // dollars per share
  marketValue: number; // dollars
  pnl: number; // dollars
  pnlPercent: number;
}

export interface TradeRequest {
  ticker: string;
  company?: string;
  side: "BUY" | "SELL";
  shares: number;
  pricePerShare: number; // dollars
  aiConfidence?: number;
  aiAction?: string;
}
