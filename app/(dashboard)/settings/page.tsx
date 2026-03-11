"use client";

import { useState } from "react";
import { Save, Lock, Bell, Filter } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const allSectors = [
    "Technology",
    "Energy",
    "Finance",
    "Healthcare",
    "Consumer",
    "Industrials",
    "Real Estate",
    "Crypto",
  ];

  function toggleSector(sector: string) {
    setSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // Simulated save - connect to real API as needed
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Settings saved successfully");
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-500 mt-1">
          Manage your profile, notifications, and preferences
        </p>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-zinc-400" />
            </span>
            Change Password
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-400" />
            </span>
            Notifications
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm text-zinc-300">Email Alerts</p>
                <p className="text-xs text-zinc-500">
                  Receive email when watchlist signals change
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  emailAlerts ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    emailAlerts ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm text-zinc-300">Daily Digest</p>
                <p className="text-xs text-zinc-500">
                  Morning summary of market signals
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDailyDigest(!dailyDigest)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  dailyDigest ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    dailyDigest ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </section>

        {/* Sector Preferences */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-zinc-400" />
            </span>
            Sector Filters
          </h2>
          <p className="text-xs text-zinc-500">
            Select sectors to focus on (leave empty for all)
          </p>
          <div className="flex flex-wrap gap-2">
            {allSectors.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  sectors.includes(sector)
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Plan Info */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">
          Current Plan
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-mono font-bold">FREE</span>
            <p className="text-zinc-500 text-xs mt-1">
              10 manual scans per day
            </p>
          </div>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition hover:opacity-90">
            Upgrade to Pro — $29/mo
          </button>
        </div>
      </section>
    </div>
  );
}
