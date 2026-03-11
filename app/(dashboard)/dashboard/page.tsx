"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { StockCard } from "@/components/dashboard/StockCard";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";
import { TickerBar } from "@/components/dashboard/TickerBar";
import { MarketInsightPanel } from "@/components/dashboard/MarketInsightPanel";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";
import { CountrySelector } from "@/components/dashboard/CountrySelector";
import { SectorFilter } from "@/components/dashboard/SectorFilter";
import { SectorOverview } from "@/components/dashboard/SectorOverview";
import { PortfolioWidget } from "@/components/paper-trading/PortfolioWidget";
import { TradeDialog } from "@/components/paper-trading/TradeDialog";
import { stripCitations } from "@/lib/utils";
import type { ScanResult, Country } from "@/lib/types";

// Clean all citation tags from a scan result
function cleanScan(scan: ScanResult): ScanResult {
  return {
    ...scan,
    marketInsight: stripCitations(scan.marketInsight),
    keyRisks: scan.keyRisks?.map(stripCitations) ?? [],
    topHeadlines: scan.topHeadlines?.map((h: any) => ({
      ...h,
      title: stripCitations(h.title),
      aiSummary: stripCitations(h.aiSummary),
    })) ?? [],
    stockRecommendations: scan.stockRecommendations?.map((r: any) => ({
      ...r,
      reason: stripCitations(r.reason),
      catalysts: r.catalysts?.map(stripCitations) ?? [],
    })) ?? [],
  };
}

export default function DashboardPage() {
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | "ALL">("ALL");
  const [selectedSector, setSelectedSector] = useState<string | "ALL">("ALL");

  // Trade dialog state
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeTicker, setTradeTicker] = useState("");
  const [tradeCompany, setTradeCompany] = useState("");
  const [tradeAiAction, setTradeAiAction] = useState<string | undefined>();
  const [tradeAiConfidence, setTradeAiConfidence] = useState<number | undefined>();
  const [tradeSector, setTradeSector] = useState<string | undefined>();
  const [tradeCountry, setTradeCountry] = useState<string | undefined>();

  // Filter recommendations based on selected country and sector
  const filteredRecommendations = useMemo(() => {
    if (!scanData?.stockRecommendations) return [];
    return scanData.stockRecommendations.filter((rec: any) => {
      const countryMatch = selectedCountry === "ALL" || rec.country === selectedCountry;
      const sectorMatch = selectedSector === "ALL" || rec.sector === selectedSector;
      return countryMatch && sectorMatch;
    });
  }, [scanData?.stockRecommendations, selectedCountry, selectedSector]);

  // Get available sectors from current data
  const availableSectors = useMemo(() => {
    if (!scanData?.stockRecommendations) return [];
    const sectors = new Set(
      scanData.stockRecommendations
        .filter((r: any) => selectedCountry === "ALL" || r.country === selectedCountry)
        .map((r: any) => r.sector)
    );
    return Array.from(sectors) as string[];
  }, [scanData?.stockRecommendations, selectedCountry]);

  // Country-wise stock counts
  const countryCounts = useMemo(() => {
    if (!scanData?.stockRecommendations) return {};
    const counts: Record<string, number> = {};
    for (const rec of scanData.stockRecommendations) {
      const country = (rec as any).country || "US";
      counts[country] = (counts[country] || 0) + 1;
    }
    return counts;
  }, [scanData?.stockRecommendations]);

  const fetchLatestScan = useCallback(async () => {
    try {
      const res = await fetch("/api/scan/latest");
      if (res.ok) {
        const data = await res.json();
        if (data.scan) {
          setScanData(cleanScan(data.scan));
        }
      }
    } catch {
      console.error("Failed to fetch latest scan");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLatestScan();
  }, [fetchLatestScan]);

  // SSE connection for live updates
  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.addEventListener("scan", (event) => {
      try {
        const data = JSON.parse(event.data);
        setScanData(cleanScan(data));
      } catch {
        console.error("Failed to parse SSE data");
      }
    });

    eventSource.addEventListener("heartbeat", () => {
      // Connection alive
    });

    eventSource.onerror = () => {
      console.error("SSE connection error, reconnecting...");
    };

    return () => eventSource.close();
  }, []);

  async function handleManualScan() {
    setScanning(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedCountry !== "ALL") params.set("country", selectedCountry);
      if (selectedSector !== "ALL") params.set("sector", selectedSector);
      const query = params.toString();
      const res = await fetch(`/api/scan${query ? `?${query}` : ""}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Scan failed");
        return;
      }
      const data = await res.json();
      setScanData(cleanScan(data.scan));
    } catch {
      setError("Failed to run scan. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  function handleOpenTrade(ticker: string, company: string, action: string, confidence: number, sector?: string, country?: string) {
    setTradeTicker(ticker);
    setTradeCompany(company);
    setTradeAiAction(action);
    setTradeAiConfidence(confidence);
    setTradeSector(sector);
    setTradeCountry(country);
    setTradeDialogOpen(true);
  }

  async function handleAddToWatchlist(ticker: string, company: string) {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, company }),
      });
    } catch {
      console.error("Failed to add to watchlist");
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Ticker Bar */}
      {scanData?.stockRecommendations && (
        <TickerBar recommendations={scanData.stockRecommendations} />
      )}

      {/* Top Section: Sentiment + Insight */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5" />
        <div className="relative z-10 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <SentimentGauge
              score={scanData?.sentimentScore ?? 0}
              sentiment={scanData?.marketSentiment ?? "NEUTRAL"}
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LiveIndicator />
                <span className="text-zinc-400 text-sm">
                  Global Market Intelligence
                </span>
              </div>
              <p className="text-zinc-300 text-sm max-w-lg leading-relaxed">
                {scanData?.marketInsight ?? "Run a scan to get market insights"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scan Button */}
            <button
              onClick={handleManualScan}
              disabled={scanning}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {selectedCountry !== "ALL" || selectedSector !== "ALL"
                    ? "Scan Filtered"
                    : "Scan Now"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Market Insight Panel */}
      {scanData && (
        <MarketInsightPanel
          insight={scanData.marketInsight}
          keyRisks={scanData.keyRisks}
        />
      )}

      {/* Country Filter */}
      {scanData?.stockRecommendations && scanData.stockRecommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">
              Markets
            </h2>
            {Object.keys(countryCounts).length > 0 && (
              <p className="text-xs text-zinc-500">
                {scanData.stockRecommendations.length} stocks across {Object.keys(countryCounts).length} markets
              </p>
            )}
          </div>
          <CountrySelector selected={selectedCountry} onSelect={setSelectedCountry} />
        </div>
      )}

      {/* Sector Filter */}
      {scanData?.stockRecommendations && scanData.stockRecommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-200">
            Sectors
          </h2>
          <SectorFilter
            selected={selectedSector}
            onSelect={setSelectedSector}
            availableSectors={availableSectors}
          />
        </div>
      )}

      {/* Sector Overview - Top Picks per Sector */}
      {selectedSector === "ALL" && filteredRecommendations.length > 0 && (
        <SectorOverview
          recommendations={filteredRecommendations}
          onSectorClick={(sector) => setSelectedSector(sector)}
        />
      )}

      {/* Portfolio Widget */}
      <PortfolioWidget />

      {/* Main Grid: Stock Cards + News */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stock Recommendations */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">
              Stock Signals
              {selectedCountry !== "ALL" && (
                <span className="text-sm font-normal text-zinc-500 ml-2">
                  {selectedCountry}
                </span>
              )}
              {selectedSector !== "ALL" && (
                <span className="text-sm font-normal text-zinc-500 ml-2">
                  / {selectedSector}
                </span>
              )}
            </h2>
            <span className="text-xs text-zinc-500">
              {filteredRecommendations.length} results
            </span>
          </div>
          {filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommendations.map(
                (rec: any, index: number) => (
                  <StockCard
                    key={`${rec.ticker}-${index}`}
                    ticker={rec.ticker}
                    company={rec.company}
                    action={rec.action}
                    confidence={rec.confidence}
                    targetTimeframe={rec.targetTimeframe}
                    currentTrend={rec.currentTrend}
                    sector={rec.sector}
                    country={rec.country}
                    riskLevel={rec.riskLevel}
                    reason={rec.reason}
                    catalysts={rec.catalysts}
                    onAddToWatchlist={() =>
                      handleAddToWatchlist(rec.ticker, rec.company)
                    }
                    onTrade={(t, c, a, conf) =>
                      handleOpenTrade(t, c, a, conf, rec.sector, rec.country)
                    }
                    index={index}
                  />
                )
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
              <p className="text-zinc-500">
                {scanData?.stockRecommendations && scanData.stockRecommendations.length > 0
                  ? "No stocks match your current filters. Try adjusting country or sector."
                  : "No recommendations yet. Click \"Scan Now\" to analyze the market."}
              </p>
            </div>
          )}
        </div>

        {/* News Feed */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">
            Breaking News
          </h2>
          {scanData?.topHeadlines && scanData.topHeadlines.length > 0 ? (
            <NewsFeed headlines={scanData.topHeadlines} />
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-500 text-sm">
                News will appear after a scan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-zinc-600 text-xs text-center">
          AI Stock Intelligence provides AI-generated market analysis for
          informational purposes only. Content does not constitute financial
          advice. All investment decisions carry risk. Always consult a qualified
          financial advisor before making investment decisions.
        </p>
      </div>

      {/* Trade Dialog */}
      <TradeDialog
        open={tradeDialogOpen}
        onOpenChange={setTradeDialogOpen}
        ticker={tradeTicker}
        company={tradeCompany}
        aiAction={tradeAiAction}
        aiConfidence={tradeAiConfidence}
        sector={tradeSector}
        country={tradeCountry}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Ticker skeleton */}
      <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse" />

      {/* Sentiment banner skeleton */}
      <div className="h-32 bg-zinc-900/50 rounded-2xl border border-zinc-800 animate-pulse" />

      {/* Filter skeletons */}
      <div className="h-12 bg-zinc-900/50 rounded-lg animate-pulse" />
      <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse" />

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-zinc-900/50 rounded-xl border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 bg-zinc-900/50 rounded-xl border border-zinc-800 animate-pulse" />
      </div>
    </div>
  );
}
