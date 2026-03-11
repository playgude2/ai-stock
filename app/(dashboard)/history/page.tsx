"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

interface ScanHistory {
  id: string;
  scannedAt: string;
  marketSentiment: string;
  sentimentScore: number;
  marketInsight: string;
  keyRisks: string[];
  topHeadlines: any[];
  stockRecommendations: any[];
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null);
  const [filterSentiment, setFilterSentiment] = useState("");

  useEffect(() => {
    fetchHistory();
  }, [page, filterSentiment]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (filterSentiment) params.set("sentiment", filterSentiment);

      const res = await fetch(`/api/scan/history?${params}`);
      if (res.ok) {
        const data = await res.json();
        setScans(data.scans || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!scans.length) return;

    const headers = [
      "Date",
      "Sentiment",
      "Score",
      "Insight",
      "Recommendations",
    ];
    const rows = scans.map((s) => [
      new Date(s.scannedAt).toISOString(),
      s.marketSentiment,
      s.sentimentScore.toString(),
      `"${(s.marketInsight || "").replace(/"/g, '""')}"`,
      s.stockRecommendations
        ?.map((r: any) => `${r.ticker}:${r.action}`)
        .join("; ") || "",
    ]);

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sentimentColor: Record<string, string> = {
    BULLISH: "text-bull bg-bull/10",
    BEARISH: "text-bear bg-bear/10",
    NEUTRAL: "text-hold bg-hold/10",
    VOLATILE: "text-watch bg-watch/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Scan History</h1>
          <p className="text-zinc-500 mt-1">
            Browse past AI market scans and analysis
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 px-4 rounded-lg transition text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["", "BULLISH", "BEARISH", "NEUTRAL", "VOLATILE"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilterSentiment(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterSentiment === s
                ? "bg-zinc-700 text-zinc-100"
                : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No scan history available yet.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Date & Time
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Sentiment
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4">
                  Score
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4 hidden md:table-cell">
                  Top Signals
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase tracking-wider p-4 hidden lg:table-cell">
                  Headlines
                </th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  onClick={() => setSelectedScan(scan)}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition cursor-pointer"
                >
                  <td className="p-4 text-zinc-300 text-sm">
                    {new Date(scan.scannedAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        sentimentColor[scan.marketSentiment] || ""
                      }`}
                    >
                      {scan.marketSentiment}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    <span
                      className={
                        scan.sentimentScore > 0
                          ? "text-bull"
                          : scan.sentimentScore < 0
                          ? "text-bear"
                          : "text-hold"
                      }
                    >
                      {scan.sentimentScore > 0 ? "+" : ""}
                      {scan.sentimentScore}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {scan.stockRecommendations?.slice(0, 3).map(
                        (r: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded"
                          >
                            {r.ticker}
                          </span>
                        )
                      )}
                      {(scan.stockRecommendations?.length || 0) > 3 && (
                        <span className="text-xs text-zinc-500">
                          +{scan.stockRecommendations.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-zinc-500 text-sm truncate max-w-xs">
                    {scan.topHeadlines?.[0]?.title || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-sm">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedScan(null)}
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-zinc-100 mb-1">
              Scan Snapshot
            </h2>
            <p className="text-zinc-500 text-sm mb-6">
              {new Date(selectedScan.scannedAt).toLocaleString()}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    sentimentColor[selectedScan.marketSentiment] || ""
                  }`}
                >
                  {selectedScan.marketSentiment}
                </span>
                <span className="font-mono text-lg">
                  {selectedScan.sentimentScore > 0 ? "+" : ""}
                  {selectedScan.sentimentScore}
                </span>
              </div>

              <div>
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Market Insight
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {selectedScan.marketInsight}
                </p>
              </div>

              {selectedScan.keyRisks?.length > 0 && (
                <div>
                  <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Key Risks
                  </h3>
                  <ul className="space-y-1">
                    {selectedScan.keyRisks.map((risk: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-400 flex items-start gap-2"
                      >
                        <span className="text-amber-400 mt-0.5">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedScan.stockRecommendations?.length > 0 && (
                <div>
                  <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {selectedScan.stockRecommendations.map(
                      (rec: any, i: number) => (
                        <div
                          key={i}
                          className="bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-zinc-100">
                              {rec.ticker}
                            </span>
                            <span className="text-zinc-500 text-sm ml-2">
                              {rec.company}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              rec.action === "BUY"
                                ? "text-bull bg-bull/10"
                                : rec.action === "SELL"
                                ? "text-bear bg-bear/10"
                                : rec.action === "HOLD"
                                ? "text-hold bg-hold/10"
                                : "text-watch bg-watch/10"
                            }`}
                          >
                            {rec.action} · {rec.confidence}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
