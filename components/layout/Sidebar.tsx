"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  LineChart,
  Clock,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "Paper Trading", href: "/paper-trading", icon: LineChart },
  { label: "History", href: "/history", icon: Clock },
  { label: "Settings", href: "/settings", icon: Settings },
];

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay();
  if (day === 0 || day === 6) return false;

  const hours = et.getHours();
  const minutes = et.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  // NYSE: 9:30 AM - 4:00 PM ET
  return totalMinutes >= 570 && totalMinutes < 960;
}

export function Sidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname();
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    setMarketOpen(isMarketOpen());
    const interval = setInterval(() => {
      setMarketOpen(isMarketOpen());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            AI STOCK
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Market Status */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <Badge
          className={cn(
            "w-full justify-center gap-1.5 rounded-md py-1 text-xs font-medium",
            marketOpen
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
          )}
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              marketOpen ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
            )}
          />
          {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
        </Badge>
      </div>

      {/* User Menu */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
            <User className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-zinc-200">
              Trader
            </p>
            <p className="truncate text-xs text-zinc-500">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
