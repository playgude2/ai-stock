# AI Stock Intelligence Platform

AI-powered global stock market analysis platform that delivers real-time trading signals, sector insights, and multi-country market coverage using Claude AI with web search.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet-orange)

## Features

- **AI Market Scanner** — Claude AI with real-time web search analyzes breaking financial news and generates BUY/SELL/HOLD/WATCH signals with confidence scores
- **Multi-Country Coverage** — Stocks from US (NYSE/NASDAQ), India (NSE/BSE), UK (LSE), China (SSE/SZSE), and Japan (TSE)
- **20 Sector Analysis** — Technology, Finance, Healthcare, Energy, Agriculture, Defense, Water, Food & Beverages, Textiles & Apparel, Consumer, Industrials, Real Estate, Telecommunications, Automobile, Pharmaceuticals, Mining & Metals, Infrastructure, Renewable Energy, E-Commerce, Banking
- **Sector-wise Top Picks** — Best stock recommendations organized by sector with signal summaries
- **Country & Sector Filters** — Filter stocks by market and sector for easy navigation
- **Live Dashboard** — Server-Sent Events (SSE) for real-time scan updates
- **Watchlist & Alerts** — Track stocks and get email notifications on signal changes
- **Sentiment Analysis** — Market sentiment gauge with score (-100 to +100)
- **Scan History** — Browse previous AI market scans

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude API (Sonnet) + Web Search |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth.js v5 (Credentials) |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| Animations | Framer Motion |
| UI | shadcn/ui components |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Anthropic API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/playgude2/ai-stock.git
   cd ai-stock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aistock_db?schema=public"
   ANTHROPIC_API_KEY=your_anthropic_api_key
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USERNAME=your_email
   MAIL_PASSWORD=your_app_password
   MAIL_FROM_EMAIL=your_email
   MAIL_FROM_NAME=AI STOCK
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker compose up -d

   # Run migrations
   npx drizzle-kit push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-stock/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard with scanner
│   │   ├── watchlist/        # Stock watchlist
│   │   ├── history/          # Scan history
│   │   └── settings/         # User settings
│   ├── api/                  # API routes
│   │   ├── scan/             # AI market scan endpoints
│   │   ├── watchlist/        # Watchlist CRUD
│   │   ├── alerts/           # Alert management
│   │   └── stream/           # SSE live updates
│   └── auth/                 # Login & register pages
├── components/
│   ├── dashboard/            # Dashboard components
│   │   ├── StockCard.tsx     # Stock recommendation card
│   │   ├── CountrySelector.tsx # Country filter
│   │   ├── SectorFilter.tsx  # Sector filter
│   │   ├── SectorOverview.tsx # Sector-wise top picks
│   │   ├── NewsFeed.tsx      # Breaking news feed
│   │   ├── SentimentGauge.tsx # Market sentiment gauge
│   │   └── TickerBar.tsx     # Scrolling ticker bar
│   ├── layout/               # Sidebar, TopNav
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── ai/analyzer.ts        # Claude AI market scanner
│   ├── auth.ts               # NextAuth configuration
│   ├── db/                   # Drizzle schema & connection
│   ├── email/mailer.ts       # Email notifications
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
└── middleware.ts              # Auth middleware
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scan` | Run AI market scan |
| GET | `/api/scan/latest` | Get latest scan result |
| GET | `/api/scan/history` | Get scan history |
| GET/POST | `/api/watchlist` | Manage watchlist |
| GET | `/api/alerts` | Get user alerts |
| GET | `/api/stream` | SSE live updates |
| POST | `/api/auth/register` | Register new user |

## License

MIT
