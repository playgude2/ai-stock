"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { getSimulatedPrice } from "@/lib/paper-trading/pricing";
import { getLiquidity, getLiquidityColor, getLiquidityDescription } from "@/lib/paper-trading/liquidity";
import { cn } from "@/lib/utils";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  company: string;
  aiAction?: string;
  aiConfidence?: number;
  sector?: string;
  country?: string;
  onTradeComplete?: () => void;
}

export function TradeDialog({
  open,
  onOpenChange,
  ticker,
  company,
  aiAction,
  aiConfidence,
  sector,
  country,
  onTradeComplete,
}: TradeDialogProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cashBalance, setCashBalance] = useState<number | null>(null);

  // Set simulated price and fetch cash balance when dialog opens
  useEffect(() => {
    if (open && ticker) {
      const simPrice = getSimulatedPrice(ticker);
      setPrice(simPrice.toFixed(2));
      setShares("");
      setError("");
      setSuccess("");
      setSide(aiAction === "SELL" ? "SELL" : "BUY");

      // Fetch portfolio for cash balance
      fetch("/api/paper-trading/portfolio")
        .then((r) => r.json())
        .then((d) => setCashBalance(d.portfolio?.cashBalance ?? null))
        .catch(() => {});
    }
  }, [open, ticker, aiAction]);

  const sharesNum = parseInt(shares, 10) || 0;
  const priceNum = parseFloat(price) || 0;
  const totalCost = sharesNum * priceNum;
  const remainingCash = cashBalance !== null ? cashBalance - (side === "BUY" ? totalCost : -totalCost) : null;
  const liquidity = sector && country ? getLiquidity(sector, country) : null;

  async function handleSubmit() {
    if (sharesNum <= 0) {
      setError("Enter a valid number of shares");
      return;
    }
    if (priceNum <= 0) {
      setError("Enter a valid price");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/paper-trading/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          company,
          side,
          shares: sharesNum,
          pricePerShare: priceNum,
          aiConfidence: aiConfidence ?? null,
          aiAction: aiAction ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Trade failed");
        return;
      }

      setSuccess(`${side === "BUY" ? "Bought" : "Sold"} ${sharesNum} shares of ${ticker} at $${priceNum.toFixed(2)}`);
      onTradeComplete?.();

      // Close dialog after brief delay
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1500);
    } catch {
      setError("Failed to execute trade. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            Trade {ticker}
            {aiAction && (
              <Badge
                className={cn(
                  "text-xs",
                  aiAction === "BUY" ? "bg-emerald-500/20 text-emerald-400" :
                  aiAction === "SELL" ? "bg-red-500/20 text-red-400" :
                  "bg-zinc-700 text-zinc-300"
                )}
              >
                AI: {aiAction} {aiConfidence ? `${aiConfidence}%` : ""}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Liquidity indicator */}
          {liquidity && (
            <div className={cn("text-xs px-3 py-2 rounded-lg", getLiquidityColor(liquidity))}>
              <span className="font-medium">{liquidity} LIQUIDITY</span>
              <span className="text-zinc-400 ml-2">{getLiquidityDescription(liquidity)}</span>
            </div>
          )}

          {/* Side selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("BUY")}
              className={cn(
                "py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5",
                side === "BUY"
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              BUY
            </button>
            <button
              onClick={() => setSide("SELL")}
              className={cn(
                "py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5",
                side === "SELL"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              SELL
            </button>
          </div>

          {/* Shares input */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Shares</Label>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Enter number of shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Price input */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Price per share ($)</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Price per share"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Order preview */}
          <div className="bg-zinc-800/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Order Total</span>
              <span className="text-zinc-100 font-medium">
                ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {cashBalance !== null && (
              <div className="flex justify-between text-zinc-400">
                <span>Cash Available</span>
                <span className="text-zinc-300">
                  ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {remainingCash !== null && side === "BUY" && (
              <div className="flex justify-between text-zinc-400 border-t border-zinc-700 pt-2">
                <span>After Trade</span>
                <span className={cn("font-medium", remainingCash < 0 ? "text-red-400" : "text-zinc-100")}>
                  ${remainingCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-400 text-sm bg-emerald-500/10 rounded-lg p-2.5 text-center">
              {success}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || sharesNum <= 0 || priceNum <= 0}
            className={cn(
              "font-semibold",
              side === "BUY"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `${side} ${sharesNum > 0 ? sharesNum : ""} shares`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
