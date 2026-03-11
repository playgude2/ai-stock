import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  plan: varchar('plan', { length: 50 }).default('free').notNull(),
  scanCount: integer('scan_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scans = pgTable('scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  scannedAt: timestamp('scanned_at').defaultNow().notNull(),
  marketSentiment: varchar('market_sentiment', { length: 50 }),
  sentimentScore: integer('sentiment_score'),
  marketInsight: text('market_insight'),
  keyRisks: jsonb('key_risks'),
  topHeadlines: jsonb('top_headlines'),
  stockRecommendations: jsonb('stock_recommendations'),
});

export const watchlists = pgTable('watchlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  company: varchar('company', { length: 255 }),
  lastSignal: varchar('last_signal', { length: 50 }),
  alertOnChange: boolean('alert_on_change').default(false).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  oldAction: varchar('old_action', { length: 50 }),
  newAction: varchar('new_action', { length: 50 }),
  confidence: integer('confidence'),
  reason: text('reason'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// Paper Trading tables
export const paperPortfolios = pgTable('paper_portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  cashBalance: integer('cash_balance').default(10000000).notNull(), // cents, $100,000.00
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paperPositions = pgTable('paper_positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id')
    .notNull()
    .references(() => paperPortfolios.id, { onDelete: 'cascade' }),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  company: varchar('company', { length: 255 }),
  shares: integer('shares').default(0).notNull(),
  avgCostBasis: integer('avg_cost_basis').default(0).notNull(), // cents per share
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paperTrades = pgTable('paper_trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id')
    .notNull()
    .references(() => paperPortfolios.id, { onDelete: 'cascade' }),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  company: varchar('company', { length: 255 }),
  side: varchar('side', { length: 10 }).notNull(), // 'BUY' | 'SELL'
  shares: integer('shares').notNull(),
  pricePerShare: integer('price_per_share').notNull(), // cents
  totalAmount: integer('total_amount').notNull(), // cents
  aiConfidence: integer('ai_confidence'),
  aiAction: varchar('ai_action', { length: 10 }),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});
