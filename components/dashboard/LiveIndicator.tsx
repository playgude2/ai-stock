import React from "react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  active?: boolean;
  className?: string;
}

export function LiveIndicator({
  active = true,
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        {active && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              active ? "bg-emerald-400" : "bg-red-400"
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active ? "bg-emerald-500" : "bg-red-500"
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wider",
          active ? "text-emerald-400" : "text-red-400"
        )}
      >
        LIVE
      </span>

      <style jsx>{`
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
