"use client";

import React from "react";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Impact = "HIGH" | "MEDIUM" | "LOW";

export interface NewsHeadline {
  title: string;
  source: string;
  impact: Impact;
  sector: string;
  aiSummary: string;
}

interface NewsFeedProps {
  headlines: NewsHeadline[];
  className?: string;
}

const impactColors: Record<Impact, string> = {
  HIGH: "border-red-500/30 bg-red-500/10 text-red-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  LOW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function NewsFeed({ headlines, className }: NewsFeedProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Newspaper className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Market News</h3>
        <Badge
          variant="outline"
          className="ml-auto border-zinc-700 text-xs text-zinc-500"
        >
          {headlines.length}
        </Badge>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {headlines.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">
            No news available.
          </div>
        )}

        {headlines.map((item, index) => (
          <div
            key={index}
            className={cn(
              "px-4 py-3 transition-colors hover:bg-zinc-800/40",
              index < headlines.length - 1 && "border-b border-zinc-800/50"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium leading-snug text-zinc-200">
                {item.title}
              </h4>
              <Badge
                className={cn(
                  "shrink-0 text-[10px] font-bold",
                  impactColors[item.impact]
                )}
              >
                {item.impact}
              </Badge>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs text-zinc-500">{item.source}</span>
              <span className="text-zinc-700">&middot;</span>
              <Badge
                variant="outline"
                className="border-zinc-700 px-1.5 text-[10px] text-zinc-500"
              >
                {item.sector}
              </Badge>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              {item.aiSummary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
