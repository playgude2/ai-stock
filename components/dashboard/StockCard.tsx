"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const SECTOR_IMAGES: Record<string, string> = {
  Technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
  Energy:
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400",
  Finance:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
  Healthcare:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
  Consumer:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
  Industrials:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400",
  "Real Estate":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
  Crypto:
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
  Defense:
    "https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=400",
  International:
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400",
  Economy:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
  Agriculture:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400",
  Water:
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
  "Food & Beverages":
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  "Textiles & Apparel":
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400",
  Telecommunications:
    "https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400",
  Automobile:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
  Pharmaceuticals:
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
  "Mining & Metals":
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400",
  Infrastructure:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
  "Renewable Energy":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
  "E-Commerce":
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
  Banking:
    "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400",
  Default:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
};

const FLAG_MAP: Record<string, string> = {
  US: "🇺🇸",
  India: "🇮🇳",
  UK: "🇬🇧",
  China: "🇨🇳",
  Japan: "🇯🇵",
};

type Action = "BUY" | "SELL" | "HOLD" | "WATCH";
type Trend = "up" | "down" | "sideways" | "UP" | "DOWN" | "SIDEWAYS";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface StockCardProps {
  ticker: string;
  company: string;
  action: Action;
  confidence: number;
  targetTimeframe: string;
  currentTrend: Trend;
  sector: string;
  country?: string;
  riskLevel: RiskLevel;
  reason: string;
  catalysts: string[];
  onAddToWatchlist?: () => void;
  onTrade?: (ticker: string, company: string, action: Action, confidence: number) => void;
  index?: number;
}

const actionColors: Record<Action, string> = {
  BUY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  SELL: "border-red-500/30 bg-red-500/10 text-red-400",
  HOLD: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  WATCH: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

const riskColors: Record<RiskLevel, string> = {
  LOW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  HIGH: "border-red-500/30 bg-red-500/10 text-red-400",
};

const TrendIcon = ({ trend }: { trend: Trend }) => {
  const t = trend?.toLowerCase();
  if (t === "up") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (t === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-amber-400" />;
};

export function StockCard({
  ticker,
  company,
  action,
  confidence,
  targetTimeframe,
  currentTrend,
  sector,
  country,
  riskLevel,
  reason,
  catalysts,
  onAddToWatchlist,
  onTrade,
}: StockCardProps) {
  const sectorImage = SECTOR_IMAGES[sector] ?? SECTOR_IMAGES.Default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
    >
      {/* Sector image strip */}
      <div className="relative h-24 w-full overflow-hidden">
        <Image
          src={sectorImage}
          alt={sector}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          {country && FLAG_MAP[country] && (
            <Badge variant="outline" className="border-zinc-600 bg-zinc-900/70 text-xs text-zinc-300">
              {FLAG_MAP[country]} {country}
            </Badge>
          )}
          <Badge variant="outline" className="border-zinc-600 bg-zinc-900/70 text-xs text-zinc-300">
            {sector}
          </Badge>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4">
        <div>
          <h3 className="font-mono text-2xl font-bold text-zinc-100">
            {ticker}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">{company}</p>
        </div>
        <Badge className={cn("text-xs font-bold", actionColors[action])}>
          {action}
        </Badge>
      </div>

      {/* Trend & Confidence */}
      <div className="mt-3 flex items-center gap-4 px-4">
        <div className="flex items-center gap-1.5">
          <TrendIcon trend={currentTrend} />
          <span className="text-xs capitalize text-zinc-400">
            {currentTrend}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                confidence >= 70
                  ? "bg-emerald-500"
                  : confidence >= 40
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-300">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-3 px-4">
        <p className="text-sm leading-relaxed text-zinc-400">{reason}</p>
      </div>

      {/* Catalysts */}
      {catalysts.length > 0 && (
        <div className="mt-3 px-4">
          <div className="flex flex-wrap gap-1.5">
            {catalysts.map((c, i) => (
              <Badge
                key={i}
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-xs text-zinc-400"
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge className={cn("gap-1 text-xs", riskColors[riskLevel])}>
            <Shield className="h-3 w-3" />
            {riskLevel} RISK
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-zinc-700 text-xs text-zinc-400"
          >
            <Clock className="h-3 w-3" />
            {targetTimeframe}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {onTrade && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTrade(ticker, company, action, confidence)}
              className="gap-1 text-xs text-zinc-400 hover:text-blue-400"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Trade
            </Button>
          )}
          {onAddToWatchlist && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddToWatchlist}
              className="gap-1 text-xs text-zinc-400 hover:text-emerald-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Watchlist
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
