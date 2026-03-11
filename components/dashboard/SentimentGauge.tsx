"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Sentiment = "BULLISH" | "BEARISH" | "NEUTRAL" | "VOLATILE";

interface SentimentGaugeProps {
  score: number; // -100 to 100
  sentiment: Sentiment;
  className?: string;
}

const sentimentConfig: Record<
  Sentiment,
  { color: string; stroke: string; label: string }
> = {
  BULLISH: {
    color: "text-emerald-400",
    stroke: "#34d399",
    label: "Bullish",
  },
  BEARISH: {
    color: "text-red-400",
    stroke: "#f87171",
    label: "Bearish",
  },
  NEUTRAL: {
    color: "text-amber-400",
    stroke: "#fbbf24",
    label: "Neutral",
  },
  VOLATILE: {
    color: "text-purple-400",
    stroke: "#c084fc",
    label: "Volatile",
  },
};

export function SentimentGauge({
  score,
  sentiment,
  className,
}: SentimentGaugeProps) {
  const config = sentimentConfig[sentiment];

  // SVG arc calculations
  const radius = 70;
  const strokeWidth = 10;
  const cx = 90;
  const cy = 90;
  // Arc from -225deg to 45deg (270 degrees total)
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270

  // Normalized score: -100 -> 0, 100 -> 1
  const normalized = (score + 100) / 200;
  const sweepAngle = normalized * totalAngle;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleDeg: number
  ) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const bgArc = describeArc(cx, cy, radius, startAngle, endAngle);
  const valueArc =
    sweepAngle > 0
      ? describeArc(cx, cy, radius, startAngle, startAngle + sweepAngle)
      : "";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur",
        className
      )}
    >
      <svg width="180" height="130" viewBox="0 0 180 130">
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {valueArc && (
          <path
            d={valueArc}
            fill="none"
            stroke={config.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          className={cn("fill-current text-3xl font-bold", config.color)}
          style={{ fontSize: "32px", fontWeight: 700 }}
        >
          {score > 0 ? `+${score}` : score}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          className="fill-zinc-500"
          style={{ fontSize: "12px" }}
        >
          Sentiment Score
        </text>
      </svg>

      <span
        className={cn("mt-2 text-sm font-semibold uppercase", config.color)}
      >
        {config.label}
      </span>
    </div>
  );
}
