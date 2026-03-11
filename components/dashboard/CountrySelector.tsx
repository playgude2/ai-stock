"use client";

import { cn } from "@/lib/utils";
import { COUNTRIES, type Country } from "@/lib/types";

interface CountrySelectorProps {
  selected: Country | "ALL";
  onSelect: (country: Country | "ALL") => void;
}

export function CountrySelector({ selected, onSelect }: CountrySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("ALL")}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
          selected === "ALL"
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
            : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
        )}
      >
        <span className="text-base">🌍</span>
        All Markets
      </button>
      {COUNTRIES.map((country) => (
        <button
          key={country.code}
          onClick={() => onSelect(country.code)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
            selected === country.code
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          )}
        >
          <span className="text-base">{country.flag}</span>
          {country.name}
          <span className="text-xs text-zinc-600">{country.exchange}</span>
        </button>
      ))}
    </div>
  );
}
