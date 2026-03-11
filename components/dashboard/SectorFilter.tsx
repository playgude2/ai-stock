"use client";

import { cn } from "@/lib/utils";
import { SECTORS } from "@/lib/types";

interface SectorFilterProps {
  selected: string | "ALL";
  onSelect: (sector: string | "ALL") => void;
  availableSectors?: string[];
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

export function SectorFilter({ selected, onSelect, availableSectors }: SectorFilterProps) {
  const sectors = availableSectors && availableSectors.length > 0
    ? SECTORS.filter((s) => availableSectors.includes(s))
    : [...SECTORS];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("ALL")}
        className={cn(
          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
          selected === "ALL"
            ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
            : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
        )}
      >
        All Sectors
      </button>
      {sectors.map((sector) => (
        <button
          key={sector}
          onClick={() => onSelect(sector)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
            selected === sector
              ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
              : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          )}
        >
          <span>{SECTOR_ICONS[sector] ?? "📊"}</span>
          {sector}
        </button>
      ))}
    </div>
  );
}
