import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: "📡",
    title: "Scan News",
    description:
      "Our AI continuously scrapes and analyzes breaking global financial news in real-time.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600",
  },
  {
    icon: "🤖",
    title: "AI Analysis",
    description:
      "Claude AI interprets market signals and generates actionable trading recommendations.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
  },
  {
    icon: "📈",
    title: "Act on It",
    description:
      "Get BUY/SELL/HOLD signals with confidence scores and risk assessments.",
    image:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "10 manual scans per day",
      "Real-time dashboard",
      "5 watchlist stocks",
      "Basic email alerts",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited scans",
      "Auto-scan every 45 seconds",
      "Unlimited watchlist",
      "Priority email alerts",
      "API access",
      "CSV export",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            AI STOCK
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-zinc-400 hover:text-zinc-200 text-sm transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:opacity-90 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200"
            alt="Trading floor"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">
                Live Market Intelligence
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Your AI-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Stock Intelligence
              </span>
              <br />
              <span className="text-white">Engine</span>
            </h2>

            <p className="text-zinc-400 text-lg mt-6 max-w-xl leading-relaxed">
              Automatically scrape, analyze, and interpret global financial news
              in real-time. Get AI-driven BUY/SELL/HOLD signals with confidence
              scores.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/dashboard"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-8 rounded-xl transition text-lg border border-zinc-700"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Scans Today", value: "1,247", icon: "🔴" },
              { label: "Stocks Tracked", value: "89+", icon: "📊" },
              { label: "Signal Accuracy", value: "78%", icon: "🎯" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-4 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
                  {stat.value}
                </p>
                <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                  {stat.icon} {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-zinc-100">How It Works</h3>
            <p className="text-zinc-500 mt-3 max-w-lg mx-auto">
              Three simple steps to AI-powered market intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover opacity-50 group-hover:opacity-70 transition-opacity scale-105 group-hover:scale-100 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-zinc-900/80 backdrop-blur rounded-xl flex items-center justify-center text-xl">
                    {feature.icon}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-zinc-900/80 backdrop-blur rounded-full flex items-center justify-center text-xs font-mono text-zinc-400">
                    {i + 1}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-zinc-100">
                    {feature.title}
                  </h4>
                  <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-zinc-100">
              Simple Pricing
            </h3>
            <p className="text-zinc-500 mt-3">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30"
                    : "bg-zinc-900/50 border border-zinc-800"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h4 className="text-2xl font-bold text-zinc-100 mt-2">
                  {plan.name}
                </h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-zinc-100">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500">{plan.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm text-zinc-400"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`mt-8 block text-center font-semibold py-3 px-6 rounded-xl transition ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-4">
            AI STOCK
          </h1>
          <p className="text-zinc-600 text-xs max-w-lg mx-auto leading-relaxed">
            AI Stock Intelligence provides AI-generated market analysis for
            informational purposes only. Content does not constitute financial
            advice. All investment decisions carry risk. Always consult a
            qualified financial advisor before making investment decisions. Past
            AI signals do not guarantee future market performance.
          </p>
          <p className="text-zinc-700 text-xs mt-6">
            &copy; {new Date().getFullYear()} AI Stock Intelligence. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
