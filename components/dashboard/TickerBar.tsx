"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Action = "BUY" | "SELL" | "HOLD" | "WATCH";

export interface TickerRecommendation {
  ticker: string;
  action: Action;
  confidence: number;
}

interface TickerBarProps {
  recommendations: TickerRecommendation[];
  className?: string;
}

const actionTextColor: Record<Action, string> = {
  BUY: "text-emerald-400",
  SELL: "text-red-400",
  HOLD: "text-amber-400",
  WATCH: "text-blue-400",
};

export function TickerBar({
  recommendations,
  className,
}: TickerBarProps) {
  if (recommendations.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const items = [...recommendations, ...recommendations];

  return (
    <div
      className={cn(
        "overflow-hidden border-y border-zinc-800 bg-zinc-950/80",
        className
      )}
    >
      <div className="ticker-scroll flex items-center gap-8 py-2">
        {items.map((rec, i) => (
          <div
            key={`${rec.ticker}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm"
          >
            <span className="font-mono font-semibold text-zinc-200">
              {rec.ticker}
            </span>
            <span className="text-zinc-600">&middot;</span>
            <span
              className={cn("font-bold", actionTextColor[rec.action])}
            >
              {rec.action}
            </span>
            <span className="text-zinc-600">&middot;</span>
            <span className="text-zinc-500">{rec.confidence}%</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .ticker-scroll {
          animation: ticker-scroll 30s linear infinite;
          width: max-content;
        }

        .ticker-scroll:hover {
          animation-play-state: paused;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
