"use client";

import { useEffect, useState } from "react";
import { Trash2, Bell, BellOff } from "lucide-react";

interface WatchlistItem {
  id: string;
  ticker: string;
  company: string;
  lastSignal: string | null;
  alertOnChange: boolean;
  addedAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTicker, setAddTicker] = useState("");
  const [addCompany, setAddCompany] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function fetchWatchlist() {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      console.error("Failed to fetch watchlist");
    } finally {
      setLoading(false);
    }
  }

  async function addToWatchlist(e: React.FormEvent) {
    e.preventDefault();
    if (!addTicker.trim()) return;

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: addTicker.toUpperCase(),
          company: addCompany,
        }),
      });
      if (res.ok) {
        setAddTicker("");
        setAddCompany("");
        fetchWatchlist();
      }
    } catch {
      console.error("Failed to add to watchlist");
    }
  }

  async function removeFromWatchlist(id: string) {
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems(items.filter((item) => item.id !== id));
    } catch {
      console.error("Failed to remove from watchlist");
    }
  }

  async function toggleAlert(id: string, current: boolean) {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, alertOnChange: !current }),
      });
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, alertOnChange: !current } : item
        )
      );
    } catch {
      console.error("Failed to toggle alert");
    }
  }

  const actionColor: Record<string, string> = {
    BUY: "text-bull bg-bull/10 border-bull/20",
    SELL: "text-bear bg-bear/10 border-bear/20",
    HOLD: "text-hold bg-hold/10 border-hold/20",
    WATCH: "text-watch bg-watch/10 border-watch/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Watchlist</h1>
        <p className="text-zinc-500 mt-1">
          Track specific stocks and get alerts on signal changes
        </p>
      </div>

      {/* Add Form */}
      <form
        onSubmit={addToWatchlist}
        className="flex flex-wrap gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
      >
        <input
          type="text"
          placeholder="Ticker (e.g. AAPL)"
          value={addTicker}
          onChange={(e) => setAddTicker(e.target.value)}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono uppercase w-32"
        />
        <input
          type="text"
          placeholder="Company name"
          value={addCompany}
          onChange={(e) => setAddCompany(e.target.value)}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex-1 min-w-[200px]"
        />
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          + Add
        </button>
      </form>

      {/* Watchlist Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">
            Your watchlist is empty. Add stocks from the dashboard or the form
            above.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Ticker
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Company
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Last Signal
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Alert
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Added
                </th>
                <th className="text-right text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition"
                >
                  <td className="p-4 font-mono font-bold text-zinc-100">
                    {item.ticker}
                  </td>
                  <td className="p-4 text-zinc-400">{item.company || "—"}</td>
                  <td className="p-4">
                    {item.lastSignal ? (
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          actionColor[item.lastSignal] ||
                          "text-zinc-400 bg-zinc-800"
                        }`}
                      >
                        {item.lastSignal}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        toggleAlert(item.id, item.alertOnChange)
                      }
                      className={`p-1.5 rounded-lg transition ${
                        item.alertOnChange
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {item.alertOnChange ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-zinc-500 text-sm">
                    {new Date(item.addedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="text-zinc-600 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
