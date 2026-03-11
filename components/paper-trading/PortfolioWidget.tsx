"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioData {
  cashBalance: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export function PortfolioWidget() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetch("/api/paper-trading/portfolio")
      .then((r) => r.json())
      .then((d) => {
        if (d.portfolio) setData(d.portfolio);
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const isPositive = data.totalPnL >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-zinc-200">Paper Portfolio</span>
        </div>
        <Link
          href="/paper-trading"
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Total Value</p>
          <p className="text-lg font-bold font-mono text-zinc-100">
            ${data.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 mb-0.5">P&L</p>
          <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-emerald-400" : "text-red-400")}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isPositive ? "+" : ""}${data.totalPnL.toFixed(2)}
            <span className="text-xs">({isPositive ? "+" : ""}{data.totalPnLPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
