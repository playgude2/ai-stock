"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MarketInsightPanelProps {
  insight: string;
  keyRisks: string[];
  className?: string;
}

export function MarketInsightPanel({
  insight,
  keyRisks,
  className,
}: MarketInsightPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Market Insight</h3>
      </div>

      {/* Insight text */}
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-zinc-400">{insight}</p>
      </div>

      {/* Key Risks - collapsible */}
      {keyRisks.length > 0 && (
        <div className="border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between rounded-none px-4 py-2.5 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-medium">
                Key Risks ({keyRisks.length})
              </span>
            </div>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {expanded && (
            <ul className="space-y-2 px-4 pb-4">
              {keyRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400/60" />
                  <span className="text-xs leading-relaxed text-zinc-500">
                    {risk}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
