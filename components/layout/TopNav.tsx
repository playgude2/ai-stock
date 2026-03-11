"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  X,
  LayoutDashboard,
  Eye,
  Clock,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/watchlist": "Watchlist",
  "/history": "History",
  "/settings": "Settings",
};

const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "History", href: "/history", icon: Clock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function TopNav({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = pageTitles[pathname ?? ""] ?? "AI Stock";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-zinc-400 hover:text-zinc-100"
          onClick={onMenuClick ?? (() => setMobileOpen(true))}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-zinc-100">{pageTitle}</h1>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden w-64 md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search tickers..."
              className="h-9 border-zinc-800 bg-zinc-900 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
            />
          </div>
        </div>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-zinc-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 transition-colors hover:bg-zinc-700">
          <User className="h-4 w-4 text-zinc-400" />
        </button>
      </header>

      {/* Mobile sidebar sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sheet */}
          <div className="fixed inset-y-0 left-0 w-72 border-r border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                AI STOCK
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile search */}
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search tickers..."
                className="h-9 border-zinc-800 bg-zinc-900 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
              />
            </div>

            <nav className="space-y-1">
              {mobileNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
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
          </div>
        </div>
      )}
    </>
  );
}
