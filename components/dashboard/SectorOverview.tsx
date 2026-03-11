"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { StockRecommendation } from "@/lib/types";

interface SectorOverviewProps {
  recommendations: StockRecommendation[];
  onSectorClick?: (sector: string) => void;
}

const SECTOR_ICONS: Record<string, string> = {
  Technology: "💻",
  Finance: "💰",
  Healthcare: "🏥",
  Energy: "⚡",
  Agriculture: "🌾",
  Defense: "🛡️",
  Water: "💧",
  "Food & Beverages": "🍔",
  "Textiles & Apparel": "👕",
  Consumer: "🛒",
  Industrials: "🏭",
  "Real Estate": "🏠",
  Telecommunications: "📡",
  Automobile: "🚗",
  Pharmaceuticals: "💊",
  "Mining & Metals": "⛏️",
  Infrastructure: "🏗️",
  "Renewable Energy": "🌱",
  "E-Commerce": "🛍️",
  Banking: "🏦",
};

const actionColors: Record<string, string> = {
  BUY: "text-emerald-400",
  SELL: "text-red-400",
  HOLD: "text-amber-400",
  WATCH: "text-blue-400",
};

const FLAG_MAP: Record<string, string> = {
  US: "🇺🇸",
  India: "🇮🇳",
  UK: "🇬🇧",
  China: "🇨🇳",
  Japan: "🇯🇵",
};

export function SectorOverview({ recommendations, onSectorClick }: SectorOverviewProps) {
  const sectorGroups = useMemo(() => {
    const groups: Record<string, StockRecommendation[]> = {};
    for (const rec of recommendations) {
      const sector = rec.sector || "Other";
      if (!groups[sector]) groups[sector] = [];
      groups[sector].push(rec);
    }
    // Sort sectors by number of stocks descending
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [recommendations]);

  if (sectorGroups.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-200">
        Sector-wise Top Picks
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sectorGroups.map(([sector, stocks], idx) => {
          const topPick = stocks.reduce((best, s) =>
            s.confidence > best.confidence ? s : best
          , stocks[0]);
          const buyCount = stocks.filter((s) => s.action === "BUY").length;
          const sellCount = stocks.filter((s) => s.action === "SELL").length;

          return (
            <motion.div
              key={sector}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              onClick={() => onSectorClick?.(sector)}
              className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-all"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{SECTOR_ICONS[sector] ?? "📊"}</span>
                  <h3 className="font-semibold text-zinc-200 text-sm">{sector}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                    {stocks.length} stocks
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>

              {/* Signal Summary */}
              <div className="flex gap-3 mb-3">
                {buyCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" /> {buyCount} BUY
                  </span>
                )}
                {sellCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <TrendingDown className="h-3 w-3" /> {sellCount} SELL
                  </span>
                )}
                {stocks.length - buyCount - sellCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Minus className="h-3 w-3" /> {stocks.length - buyCount - sellCount} HOLD/WATCH
                  </span>
                )}
              </div>

              {/* Top Pick */}
              <div className="rounded-lg bg-zinc-800/50 p-3 border border-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Top Pick</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{FLAG_MAP[topPick.country] ?? ""}</span>
                    <span className="font-mono font-bold text-zinc-100 text-sm">
                      {topPick.ticker}
                    </span>
                    <span className="text-xs text-zinc-500 truncate max-w-[100px]">
                      {topPick.company}
                    </span>
                  </div>
                  <Badge className={cn("text-xs font-bold", actionColors[topPick.action])}>
                    {topPick.action} {topPick.confidence}%
                  </Badge>
                </div>
              </div>

              {/* Other stocks in sector */}
              {stocks.length > 1 && (
                <div className="mt-2 space-y-1">
                  {stocks
                    .filter((s) => s.ticker !== topPick.ticker)
                    .slice(0, 3)
                    .map((stock) => (
                      <div
                        key={stock.ticker}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{FLAG_MAP[stock.country] ?? ""}</span>
                          <span className="font-mono text-zinc-300">{stock.ticker}</span>
                        </div>
                        <span className={cn("font-medium", actionColors[stock.action])}>
                          {stock.action}
                        </span>
                      </div>
                    ))}
                  {stocks.length > 4 && (
                    <p className="text-xs text-zinc-600 pt-1">
                      +{stocks.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
