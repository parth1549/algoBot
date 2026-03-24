const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type SignalType = 'BUY' | 'SELL';

export interface StatusResponse {
  status: string;
  symbol?: string;
  current_price?: number;
  signal?: SignalType;
  equity?: number;
  total_rows?: number;
  last_updated?: string;
  message?: string;
  instructions?: string;
}

export interface AnalyzeResponse {
  status: string;
  symbol: string;
  message: string;
  results?: {
    current_price: number;
    signal: SignalType;
    equity: number;
    total_return: string;
    rows_analyzed: number;
    features: string[];
  };
}

export interface LiveSignalResponse {
  status: string;
  price?: number;
  signal?: SignalType;
  equity?: number;
  symbol?: string;
  message?: string;
}

export interface DataRow {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  SMA10?: number;
  SMA20?: number;
  RSI?: number;
  HMA50?: number;
  HMA200?: number;
  ATR?: number;
  UT_trend?: number;
  signal?: number;
  equity?: number;
}

export interface SignalRow {
  Close: number;
  signal: number;
}

export interface LogsResponse {
  status: string;
  total_lines: number;
  returned_lines: number;
  log_file: string;
  logs: string[];
}

export interface SymbolsResponse {
  available_symbols: string[];
  total: number;
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface MarketCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResponse {
  status: string;
  symbol: string;
  interval: string;
  range: string;
  count: number;
  latest_price: number;
  latest_volume: number;
  data: MarketCandle[];
  message?: string;
}

export interface LatestCandleResponse {
  status: string;
  symbol: string;
  candle: MarketCandle;
  message?: string;
}

export const api = {
  getStatus: () => apiFetch<StatusResponse>('/status'),
  getSymbols: () => apiFetch<SymbolsResponse>('/symbols'),
  analyze: (symbol: string) =>
    apiFetch<AnalyzeResponse>(`/analyze?symbol=${symbol}`, { method: 'POST' }),
  getLiveSignal: () => apiFetch<LiveSignalResponse>('/live-signal'),
  getData: () => apiFetch<DataRow[]>('/data'),
  getSignal: () => apiFetch<SignalRow[]>('/signal'),
  getEquity: () => apiFetch<number[]>('/equity'),
  getLogs: (limit = 100) => apiFetch<LogsResponse>(`/logs?limit=${limit}`),
  getDashboard: () => apiFetch<{
    status: string; symbol: string; price: number;
    signal: SignalType; equity: number; total_return: string;
    data: DataRow[];
  }>('/dashboard'),
  runBacktest: (payload: Record<string, unknown>) => apiFetch<AnalyzeResponse>('/run_backtest', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Yahoo Finance Market Data
  getMarketData: (symbol: string, interval = '5m', range = '5d') =>
    apiFetch<MarketDataResponse>(`/market-data/${symbol}?interval=${interval}&range=${range}`),
  getLatestCandle: (symbol: string, interval = '5m') =>
    apiFetch<LatestCandleResponse>(`/market-data/${symbol}/latest?interval=${interval}`),
};
