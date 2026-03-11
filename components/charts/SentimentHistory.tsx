"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  time: string;
  score: number;
}

interface SentimentHistoryProps {
  data: DataPoint[];
  className?: string;
}

export default function SentimentHistory({
  data,
  className,
}: SentimentHistoryProps) {
  // Split data into positive and negative for dual coloring
  const processedData = data.map((d) => ({
    ...d,
    positive: d.score >= 0 ? d.score : 0,
    negative: d.score < 0 ? d.score : 0,
  }));

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur",
        className
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">
        Sentiment History
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={processedData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />

            <YAxis
              domain={[-100, 100]}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
              ticks={[-100, -50, 0, 50, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e4e4e7",
              }}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(value: any) => [value, "Score"]}
            />

            <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />

            <Area
              type="monotone"
              dataKey="positive"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#colorPositive)"
            />

            <Area
              type="monotone"
              dataKey="negative"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#colorNegative)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
