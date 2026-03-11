# AI Stock Intelligence Platform

AI-powered global stock market analysis platform that delivers real-time trading signals, sector insights, multi-country market coverage, and a paper trading simulator — all powered by Claude AI with web search.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

## Screenshots

### Dashboard — Market Intelligence & Sentiment
![Dashboard](public/images/dashboard.png)

### Sector-wise Top Picks
![Sector Picks](public/images/sector-picks.png)

### Stock Signals with Trade & Watchlist Actions
![Stock Signals](public/images/stock-signals.png)

### Paper Trading — Portfolio, Quick Trade & AI Signals
![Paper Trading](public/images/paper-trading.png)

### Trade Dialog — Buy/Sell with AI Confidence
![Trade Dialog](public/images/trade-dialog.png)

## Features

### AI Market Scanner
- Claude AI with real-time web search analyzes breaking financial news
- Generates BUY/SELL/HOLD/WATCH signals with confidence scores (50-99%)
- Country-specific and sector-specific focused scans
- Robust JSON extraction with retry logic for rate limits

### Multi-Country Coverage
- **US** — NYSE/NASDAQ (AAPL, TSLA, etc.)
- **India** — NSE/BSE (RELIANCE, TCS, INFY, etc.)
- **UK** — LSE (SHEL, AZN, HSBA, etc.)
- **China** — SSE/SZSE (600519, BABA, JD, etc.)
- **Japan** — TSE (7203, 6758, 9984, etc.)

### 20 Sector Analysis
Technology, Finance, Healthcare, Energy, Agriculture, Defense, Water, Food & Beverages, Textiles & Apparel, Consumer, Industrials, Real Estate, Telecommunications, Automobile, Pharmaceuticals, Mining & Metals, Infrastructure, Renewable Energy, E-Commerce, Banking

### Paper Trading Platform
- **$100,000 virtual cash** to practice trading without risk
- **Buy & Sell** stocks directly from AI signal cards or the dedicated trading page
- **Portfolio tracking** with real-time P&L, positions table, and market value
- **Trade history** with AI signal comparison — see if you followed or diverged from AI recommendations
- **Quick Trade form** for manual ticker entry
- **AI Signal Quick Trade** — one-click trade from latest scan recommendations
- **Liquidity indicators** — shows how easy a stock is to buy/sell based on sector and country
- **Reset portfolio** — start fresh anytime with $100k
- **Educational tips** — learn about paper trading, position sizing, and risk management

### Dashboard & Analytics
- **Sector-wise Top Picks** — best stock recommendations organized by sector
- **Country & Sector Filters** — filter stocks by market and sector, scan with filters applied
- **Live Dashboard** — Server-Sent Events (SSE) for real-time scan updates
- **Sentiment Analysis** — market sentiment gauge with score (-100 to +100)
- **Portfolio Widget** — compact P&L summary on the main dashboard

### Watchlist & Alerts
- Track stocks and get email notifications on signal changes
- Alert toggle per stock with automatic signal monitoring
- Scan history with pagination and CSV export

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
│   ├── (dashboard)/
│   │   ├── dashboard/            # Main dashboard with scanner
│   │   ├── paper-trading/        # Paper trading platform
│   │   ├── watchlist/            # Stock watchlist
│   │   ├── history/              # Scan history
│   │   └── settings/             # User settings
│   ├── api/
│   │   ├── scan/                 # AI market scan endpoints
│   │   ├── paper-trading/        # Paper trading API
│   │   │   ├── portfolio/        # Portfolio management
│   │   │   ├── trade/            # Execute trades
│   │   │   ├── trades/           # Trade history
│   │   │   └── reset/            # Reset portfolio
│   │   ├── watchlist/            # Watchlist CRUD
│   │   ├── alerts/               # Alert management
│   │   └── stream/               # SSE live updates
│   └── auth/                     # Login & register pages
├── components/
│   ├── dashboard/                # Dashboard components
│   ├── paper-trading/            # Paper trading components
│   │   ├── TradeDialog.tsx       # Trade modal with AI signals
│   │   └── PortfolioWidget.tsx   # Compact portfolio summary
│   ├── layout/                   # Sidebar, TopNav
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── ai/analyzer.ts            # Claude AI market scanner
│   ├── paper-trading/            # Paper trading utilities
│   │   ├── pricing.ts            # Simulated stock pricing
│   │   └── liquidity.ts          # Liquidity heuristics
│   ├── auth.ts                   # NextAuth configuration
│   ├── db/                       # Drizzle schema & connection
│   ├── email/mailer.ts           # Email notifications
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions
└── middleware.ts                  # Auth middleware
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scan` | Run AI market scan (supports `?country=India&sector=Energy`) |
| GET | `/api/scan/latest` | Get latest scan result |
| GET | `/api/scan/history` | Get scan history |
| GET/POST | `/api/watchlist` | Manage watchlist |
| GET | `/api/alerts` | Get user alerts |
| GET | `/api/stream` | SSE live updates |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/paper-trading/portfolio` | Get portfolio with P&L |
| POST | `/api/paper-trading/trade` | Execute buy/sell trade |
| GET | `/api/paper-trading/trades` | Trade history (paginated) |
| POST | `/api/paper-trading/reset` | Reset portfolio to $100k |

## License

MIT
