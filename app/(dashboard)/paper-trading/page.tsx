"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  History,
  RotateCcw,
  DollarSign,
  PieChart,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeDialog } from "@/components/paper-trading/TradeDialog";
import { getSimulatedPrice } from "@/lib/paper-trading/pricing";
import { cn } from "@/lib/utils";
import type { PositionWithPnL, ScanResult } from "@/lib/types";

interface PortfolioData {
  id: string;
  cashBalance: number;
  totalInvested: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: PositionWithPnL[];
}

interface TradeRecord {
  id: string;
  ticker: string;
  company: string | null;
  side: "BUY" | "SELL";
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  aiConfidence: number | null;
  aiAction: string | null;
  executedAt: string;
}

export default function PaperTradingPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [tradesTotal, setTradesTotal] = useState(0);
  const [tradesPage, setTradesPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [scanData, setScanData] = useState<ScanResult | null>(null);

  // Trade dialog state
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeTicker, setTradeTicker] = useState("");
  const [tradeCompany, setTradeCompany] = useState("");
  const [tradeAiAction, setTradeAiAction] = useState<string | undefined>();
  const [tradeAiConfidence, setTradeAiConfidence] = useState<number | undefined>();

  // Quick trade form
  const [quickTicker, setQuickTicker] = useState("");
  const [quickShares, setQuickShares] = useState("");
  const [quickSide, setQuickSide] = useState<"BUY" | "SELL">("BUY");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [quickSuccess, setQuickSuccess] = useState("");

  // Dismiss tip
  useEffect(() => {
    const dismissed = localStorage.getItem("paper-trading-tip-dismissed");
    if (dismissed) setShowTip(false);
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch("/api/paper-trading/portfolio");
      const data = await res.json();
      if (data.portfolio) setPortfolio(data.portfolio);
    } catch {
      console.error("Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrades = useCallback(async (page = 0) => {
    try {
      const res = await fetch(`/api/paper-trading/trades?limit=10&offset=${page * 10}`);
      const data = await res.json();
      setTrades(data.trades || []);
      setTradesTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch trades");
    }
  }, []);

  const fetchLatestScan = useCallback(async () => {
    try {
      const res = await fetch("/api/scan/latest");
      if (res.ok) {
        const data = await res.json();
        if (data.scan) setScanData(data.scan);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchTrades(0);
    fetchLatestScan();
  }, [fetchPortfolio, fetchTrades, fetchLatestScan]);

  async function handleReset() {
    if (!confirm("Reset portfolio to $100,000? All positions and trade history will be deleted.")) return;
    setResetting(true);
    try {
      await fetch("/api/paper-trading/reset", { method: "POST" });
      await fetchPortfolio();
      await fetchTrades(0);
      setTradesPage(0);
    } catch {} finally {
      setResetting(false);
    }
  }

  function openTradeDialog(ticker: string, company: string, aiAction?: string, aiConfidence?: number) {
    setTradeTicker(ticker);
    setTradeCompany(company);
    setTradeAiAction(aiAction);
    setTradeAiConfidence(aiConfidence);
    setTradeDialogOpen(true);
  }

  async function handleQuickTrade() {
    const ticker = quickTicker.trim().toUpperCase();
    const shares = parseInt(quickShares, 10);
    if (!ticker) { setQuickError("Enter a ticker"); return; }
    if (!shares || shares <= 0) { setQuickError("Enter valid shares"); return; }

    setQuickLoading(true);
    setQuickError("");
    setQuickSuccess("");

    try {
      const price = getSimulatedPrice(ticker);
      const res = await fetch("/api/paper-trading/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, side: quickSide, shares, pricePerShare: price }),
      });
      const data = await res.json();
      if (!res.ok) { setQuickError(data.error); return; }
      setQuickSuccess(`${quickSide === "BUY" ? "Bought" : "Sold"} ${shares} ${ticker} at $${price.toFixed(2)}`);
      setQuickTicker("");
      setQuickShares("");
      await fetchPortfolio();
      await fetchTrades(tradesPage);
      setTimeout(() => setQuickSuccess(""), 3000);
    } catch {
      setQuickError("Trade failed");
    } finally {
      setQuickLoading(false);
    }
  }

  function handleTradesPageChange(newPage: number) {
    setTradesPage(newPage);
    fetchTrades(newPage);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/50 rounded-xl border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-zinc-900/50 rounded-xl border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  const totalPages = Math.ceil(tradesTotal / 10);

  return (
    <div className="space-y-6">
      {/* Educational tip */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <button
            onClick={() => { setShowTip(false); localStorage.setItem("paper-trading-tip-dismissed", "1"); }}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-300 mb-1">What is Paper Trading?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paper trading lets you practice buying and selling stocks with virtual money ($100,000) — no real risk involved.
                Use it to test strategies, follow AI signals, and build confidence before trading with real money.
                <strong className="text-zinc-300"> Tips:</strong> Start small, diversify across sectors, and always set a target price before entering a trade.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Value"
          value={portfolio?.totalValue ?? 100000}
          icon={<Wallet className="h-5 w-5" />}
          prefix="$"
          color="text-zinc-100"
        />
        <SummaryCard
          label="Cash Available"
          value={portfolio?.cashBalance ?? 100000}
          icon={<DollarSign className="h-5 w-5" />}
          prefix="$"
          color="text-zinc-300"
        />
        <SummaryCard
          label="Invested"
          value={portfolio?.totalInvested ?? 0}
          icon={<PieChart className="h-5 w-5" />}
          prefix="$"
          color="text-blue-400"
        />
        <SummaryCard
          label="Total P&L"
          value={portfolio?.totalPnL ?? 0}
          icon={portfolio && portfolio.totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          prefix={portfolio && portfolio.totalPnL >= 0 ? "+$" : "-$"}
          suffix={portfolio ? ` (${portfolio.totalPnLPercent >= 0 ? "+" : ""}${portfolio.totalPnLPercent.toFixed(2)}%)` : ""}
          color={portfolio && portfolio.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}
          absValue
        />
      </div>

      {/* Reset button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={resetting}
          className="text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200 gap-1.5"
        >
          {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Reset Portfolio
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-zinc-800 gap-1.5">
            <Wallet className="h-4 w-4" /> Portfolio
          </TabsTrigger>
          <TabsTrigger value="trade" className="data-[state=active]:bg-zinc-800 gap-1.5">
            <ArrowRightLeft className="h-4 w-4" /> Trade
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 gap-1.5">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          {portfolio && portfolio.positions.length > 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="text-left p-4">Ticker</th>
                      <th className="text-left p-4 hidden sm:table-cell">Company</th>
                      <th className="text-right p-4">Shares</th>
                      <th className="text-right p-4 hidden md:table-cell">Avg Cost</th>
                      <th className="text-right p-4">Price</th>
                      <th className="text-right p-4 hidden md:table-cell">Value</th>
                      <th className="text-right p-4">P&L</th>
                      <th className="text-right p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.positions.map((pos) => (
                      <tr key={pos.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="p-4 font-mono font-semibold text-zinc-100">{pos.ticker}</td>
                        <td className="p-4 text-zinc-400 hidden sm:table-cell">{pos.company || "-"}</td>
                        <td className="p-4 text-right text-zinc-200">{pos.shares}</td>
                        <td className="p-4 text-right text-zinc-400 hidden md:table-cell">${pos.avgCostBasis.toFixed(2)}</td>
                        <td className="p-4 text-right text-zinc-200">${pos.currentPrice.toFixed(2)}</td>
                        <td className="p-4 text-right text-zinc-300 hidden md:table-cell">${pos.marketValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className={cn("p-4 text-right font-medium", pos.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                          <span className="text-xs ml-1">({pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(1)}%)</span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTradeDialog(pos.ticker, pos.company || pos.ticker)}
                            className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                          >
                            Sell
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
              <Wallet className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-1">No positions yet</p>
              <p className="text-zinc-500 text-sm">Go to the Trade tab or use AI signals on the Dashboard to start trading.</p>
            </div>
          )}
        </TabsContent>

        {/* Trade Tab */}
        <TabsContent value="trade">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Trade Form */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="text-zinc-200 font-semibold flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                Quick Trade
              </h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-zinc-400 text-xs">Ticker Symbol</Label>
                  <Input
                    placeholder="e.g., AAPL, RELIANCE, 7203"
                    value={quickTicker}
                    onChange={(e) => setQuickTicker(e.target.value.toUpperCase())}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Shares</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of shares"
                    value={quickShares}
                    onChange={(e) => setQuickShares(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuickSide("BUY")}
                    className={cn(
                      "py-2 rounded-lg font-semibold text-sm transition-all",
                      quickSide === "BUY" ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setQuickSide("SELL")}
                    className={cn(
                      "py-2 rounded-lg font-semibold text-sm transition-all",
                      quickSide === "SELL" ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    SELL
                  </button>
                </div>

                {quickTicker && (
                  <p className="text-xs text-zinc-500">
                    Simulated price: <span className="text-zinc-300">${getSimulatedPrice(quickTicker).toFixed(2)}</span>
                  </p>
                )}

                <Button
                  onClick={handleQuickTrade}
                  disabled={quickLoading}
                  className={cn(
                    "w-full font-semibold",
                    quickSide === "BUY" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {quickLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${quickSide} at Market Price`}
                </Button>

                {quickError && <p className="text-red-400 text-xs">{quickError}</p>}
                {quickSuccess && <p className="text-emerald-400 text-xs">{quickSuccess}</p>}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="text-zinc-200 font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                AI Signal Quick Trade
              </h3>

              {scanData?.stockRecommendations && scanData.stockRecommendations.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scanData.stockRecommendations.slice(0, 10).map((rec: any, i: number) => (
                    <div
                      key={`${rec.ticker}-${i}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-zinc-100 text-sm">{rec.ticker}</span>
                          <Badge
                            className={cn(
                              "text-[10px]",
                              rec.action === "BUY" ? "bg-emerald-500/20 text-emerald-400" :
                              rec.action === "SELL" ? "bg-red-500/20 text-red-400" :
                              rec.action === "HOLD" ? "bg-amber-500/20 text-amber-400" :
                              "bg-zinc-700 text-zinc-300"
                            )}
                          >
                            {rec.action} {rec.confidence}%
                          </Badge>
                        </div>
                        <p className="text-zinc-500 text-xs truncate">{rec.company}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTradeDialog(rec.ticker, rec.company, rec.action, rec.confidence)}
                        className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-700 shrink-0 ml-2"
                      >
                        Trade
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-500 text-sm">No AI recommendations available.</p>
                  <p className="text-zinc-600 text-xs mt-1">Run a scan from the Dashboard first.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {trades.length > 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Ticker</th>
                      <th className="text-left p-4">Side</th>
                      <th className="text-right p-4">Shares</th>
                      <th className="text-right p-4">Price</th>
                      <th className="text-right p-4 hidden sm:table-cell">Total</th>
                      <th className="text-left p-4 hidden md:table-cell">AI Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="p-4 text-zinc-400 text-xs">
                          {new Date(trade.executedAt).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 font-mono font-semibold text-zinc-100">{trade.ticker}</td>
                        <td className="p-4">
                          <Badge className={cn(
                            "text-xs",
                            trade.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          )}>
                            {trade.side}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-zinc-200">{trade.shares}</td>
                        <td className="p-4 text-right text-zinc-200">${trade.pricePerShare.toFixed(2)}</td>
                        <td className="p-4 text-right text-zinc-300 hidden sm:table-cell">
                          ${trade.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {trade.aiAction ? (
                            <span className={cn(
                              "text-xs",
                              trade.aiAction === trade.side ? "text-emerald-400" : "text-amber-400"
                            )}>
                              AI: {trade.aiAction} {trade.aiConfidence ? `${trade.aiConfidence}%` : ""}
                              {trade.aiAction === trade.side ? " (Followed)" : " (Diverged)"}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                  <span className="text-zinc-500 text-xs">{tradesTotal} total trades</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={tradesPage === 0}
                      onClick={() => handleTradesPageChange(tradesPage - 1)}
                      className="border-zinc-700 text-zinc-400 h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-zinc-400 text-xs">
                      {tradesPage + 1} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={tradesPage >= totalPages - 1}
                      onClick={() => handleTradesPageChange(tradesPage + 1)}
                      className="border-zinc-700 text-zinc-400 h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
              <History className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-1">No trades yet</p>
              <p className="text-zinc-500 text-sm">Execute your first trade to see it here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Trade Dialog */}
      <TradeDialog
        open={tradeDialogOpen}
        onOpenChange={setTradeDialogOpen}
        ticker={tradeTicker}
        company={tradeCompany}
        aiAction={tradeAiAction}
        aiConfidence={tradeAiConfidence}
        onTradeComplete={() => {
          fetchPortfolio();
          fetchTrades(tradesPage);
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  prefix = "",
  suffix = "",
  color = "text-zinc-100",
  absValue = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  color?: string;
  absValue?: boolean;
}) {
  const displayVal = absValue ? Math.abs(value) : value;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
        <span className="text-zinc-600">{icon}</span>
      </div>
      <p className={cn("text-xl font-bold font-mono", color)}>
        {prefix}{displayVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {suffix && <span className="text-sm font-normal">{suffix}</span>}
      </p>
    </motion.div>
  );
}
