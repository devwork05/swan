/**
 * Non-crypto trading data lives here so pages can share it. Everything is
 * static/mock because the underlying integrations (stock market feed, copy-
 * trading platform, bot engine) are out of scope for the UI pass.
 */

export interface Stock {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
  price: number;
  change: number;
  changePct: number;
  marketCap: number;
}

/** Prices are illustrative — real integration would replace this with a live feed. */
export const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", price: 148.56, change: 2.49, changePct: 1.68, marketCap: 2350_000_000_000 },
  { symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", price: 326.78, change: 0.37, changePct: -2.79, marketCap: 2430_000_000_000 },
  { symbol: "GOOG", name: "Alphabet Inc.", exchange: "NASDAQ", price: 132.21, change: -0.28, changePct: -1.64, marketCap: 1650_000_000_000 },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", price: 189.44, change: 1.12, changePct: 0.59, marketCap: 1970_000_000_000 },
  { symbol: "META", name: "Meta Platforms", exchange: "NASDAQ", price: 298.76, change: 2.64, changePct: 0.88, marketCap: 780_000_000_000 },
  { symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", price: 413.02, change: 0.77, changePct: 2.35, marketCap: 1020_000_000_000 },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", price: 254.93, change: -1.95, changePct: -0.76, marketCap: 810_000_000_000 },
  { symbol: "SPY", name: "S&P 500 ETF", exchange: "NYSE", price: 100.0, change: -1.16, changePct: -1.16, marketCap: 420_000_000_000 },
];

export interface CopyTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  followers: number;
  totalProfit: number;
  minEntry: number;
  isFollowing?: boolean;
  copyPercent?: number;
  maxPerTrade?: number;
  dailyLimit?: number;
  recentTrades: Array<{ pair: string; direction: "RISE" | "FALL"; result: "WIN" | "LOSS"; profit: number }>;
}

/** Mock traders — designed to look plausible. Replace with a real leaderboard call later. */
export const TRADERS: CopyTrader[] = [
  {
    id: "t1",
    name: "Alex Rivera",
    username: "alexr",
    avatar: "https://i.pravatar.cc/120?img=12",
    winRate: 82,
    totalTrades: 1_248,
    wins: 1_023,
    losses: 225,
    followers: 3_420,
    totalProfit: 128_450,
    minEntry: 50,
    recentTrades: [
      { pair: "BTC/USDT", direction: "RISE", result: "WIN", profit: 128.44 },
      { pair: "ETH/USDT", direction: "RISE", result: "WIN", profit: 62.10 },
      { pair: "SOL/USDT", direction: "FALL", result: "LOSS", profit: -18.90 },
    ],
  },
  {
    id: "t2",
    name: "Priya Sharma",
    username: "priya_s",
    avatar: "https://i.pravatar.cc/120?img=45",
    winRate: 76,
    totalTrades: 890,
    wins: 676,
    losses: 214,
    followers: 2_180,
    totalProfit: 89_320,
    minEntry: 100,
    isFollowing: true,
    copyPercent: 25,
    maxPerTrade: 250,
    dailyLimit: 1_500,
    recentTrades: [
      { pair: "AAPL", direction: "RISE", result: "WIN", profit: 41.10 },
      { pair: "TSLA", direction: "FALL", result: "WIN", profit: 92.44 },
      { pair: "BTC/USDT", direction: "RISE", result: "LOSS", profit: -32.15 },
    ],
  },
  {
    id: "t3",
    name: "Marcus Chen",
    username: "marcus.c",
    avatar: "https://i.pravatar.cc/120?img=52",
    winRate: 71,
    totalTrades: 2_045,
    wins: 1_452,
    losses: 593,
    followers: 5_712,
    totalProfit: 214_900,
    minEntry: 200,
    recentTrades: [
      { pair: "ETH/USDT", direction: "FALL", result: "WIN", profit: 210.60 },
      { pair: "NVDA", direction: "RISE", result: "WIN", profit: 78.30 },
      { pair: "SPY", direction: "FALL", result: "LOSS", profit: -22.15 },
    ],
  },
  {
    id: "t4",
    name: "Zara Ahmed",
    username: "zaraa",
    avatar: "https://i.pravatar.cc/120?img=32",
    winRate: 68,
    totalTrades: 512,
    wins: 348,
    losses: 164,
    followers: 890,
    totalProfit: 42_120,
    minEntry: 25,
    recentTrades: [
      { pair: "SOL/USDT", direction: "RISE", result: "WIN", profit: 34.20 },
      { pair: "BNB/USDT", direction: "RISE", result: "WIN", profit: 58.00 },
      { pair: "META", direction: "FALL", result: "LOSS", profit: -12.44 },
    ],
  },
];

export interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  description: string;
  winRate: number;
  minInvestment: number;
  performance30d: number;
  pairs: string[];
  spark: number[];
}

/** Sample bots — same "static demo" note as above. */
export const BOTS: TradingBot[] = [
  {
    id: "b1",
    name: "Momentum Alpha",
    strategy: "Trend-following",
    description: "Rides breakouts on high-volume assets with a 4h look-back window.",
    winRate: 74,
    minInvestment: 100,
    performance30d: 12.8,
    pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "AVAX/USDT", "MATIC/USDT"],
    spark: [100, 102, 101, 105, 104, 108, 111, 113, 112, 116, 118, 121, 120, 124, 127, 129, 131],
  },
  {
    id: "b2",
    name: "Mean Reversion Pro",
    strategy: "Mean-reversion",
    description: "Fades short-term extremes on blue-chip pairs. Best in ranging markets.",
    winRate: 68,
    minInvestment: 250,
    performance30d: 7.9,
    pairs: ["BTC/USDT", "ETH/USDT", "AAPL", "MSFT", "SPY"],
    spark: [100, 99, 101, 100, 103, 102, 104, 103, 106, 105, 107, 108, 107, 109, 108, 110, 108],
  },
  {
    id: "b3",
    name: "Volatility Hunter",
    strategy: "Volatility",
    description: "Sells options-style straddles when implied vol spikes. Higher variance.",
    winRate: 82,
    minInvestment: 500,
    performance30d: 18.4,
    pairs: ["BTC/USDT", "ETH/USDT", "TSLA", "NVDA", "META"],
    spark: [100, 105, 103, 109, 108, 115, 114, 120, 118, 125, 128, 130, 133, 129, 135, 137, 141],
  },
];
