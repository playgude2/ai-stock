"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

type Trend = "up" | "down";

interface SparklineChartProps {
  data: number[];
  trend?: Trend;
  width?: number;
  height?: number;
  className?: string;
}

export default function SparklineChart({
  data,
  trend,
  width,
  height = 40,
  className,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  // Auto-detect trend if not provided
  const resolvedTrend =
    trend ?? (data.length >= 2 && data[data.length - 1] >= data[0] ? "up" : "down");

  const strokeColor = resolvedTrend === "up" ? "#34d399" : "#f87171";

  return (
    <div className={cn("inline-block", className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
