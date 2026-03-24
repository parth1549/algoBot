'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const SYMBOLS = [
  { value: 'RELIANCE.NS', label: 'Reliance Industries' },
  { value: 'TCS.NS', label: 'TCS' },
  { value: 'INFY.NS', label: 'Infosys' },
  { value: 'HDFCBANK.NS', label: 'HDFC Bank' },
  { value: 'ITC.NS', label: 'ITC' },
  { value: 'ICICIBANK.NS', label: 'ICICI Bank' },
  { value: 'SBIN.NS', label: 'SBI' },
  { value: 'BHARTIARTL.NS', label: 'Bharti Airtel' },
  { value: 'LT.NS', label: 'L&T' },
  { value: 'ASIANPAINT.NS', label: 'Asian Paints' },
  { value: '^NSEI', label: 'NIFTY 50' },
  { value: '^NSEBANK', label: 'BANKNIFTY' },
  { value: 'BTC-USD', label: 'Bitcoin' },
];

const INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
];

const RANGES = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '1y', label: '1Y' },
];

interface MarketChartProps {
  defaultSymbol?: string;
  compact?: boolean;
  refreshInterval?: number;
}

export default function MarketChart({ defaultSymbol = 'RELIANCE.NS', compact = false, refreshInterval = 0 }: MarketChartProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [interval, setInterval_] = useState('5m');
  const [range, setRange] = useState('5d');

  const { data, latestPrice, latestVolume, loading, error, refetch } = useMarketData({
    symbol,
    interval,
    range,
    refreshInterval,
  });

  // Compute price change
  const firstPrice = data.length > 1 ? data[0].close : null;
  const priceChange = latestPrice && firstPrice ? latestPrice - firstPrice : 0;
  const priceChangePct = firstPrice ? ((priceChange / firstPrice) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  // Chart data formatting
  const chartData = data.map(d => ({
    time: d.date.split(' ')[1]?.substring(0, 5) || d.date.substring(5, 10),
    close: d.close,
    open: d.open,
    high: d.high,
    low: d.low,
    volume: d.volume,
  }));

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const pricePad = (maxPrice - minPrice) * 0.05;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: compact ? 12 : 20 }}>
        {/* Symbol Selector */}
        <select
          className="select"
          style={{ minWidth: 180, fontSize: 13 }}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          {SYMBOLS.map(s => (
            <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
          ))}
        </select>

        {/* Interval Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {INTERVALS.map(i => (
            <button
              key={i.value}
              onClick={() => setInterval_(i.value)}
              style={{
                padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                background: interval === i.value ? 'var(--bg-card)' : 'transparent',
                color: interval === i.value ? 'var(--text-primary)' : 'var(--text-muted)',
                border: interval === i.value ? '1px solid var(--border-bright)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {i.label}
            </button>
          ))}
        </div>

        {/* Range Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                background: range === r.value ? 'var(--bg-card)' : 'transparent',
                color: range === r.value ? 'var(--text-primary)' : 'var(--text-muted)',
                border: range === r.value ? '1px solid var(--border-bright)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refetch}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8,
            background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Price Header */}
      {latestPrice && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: compact ? 12 : 20 }}>
          <div style={{ fontSize: compact ? 24 : 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            ₹{latestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isPositive ? <TrendingUp size={16} color="var(--accent-green)" /> : <TrendingDown size={16} color="var(--accent-red)" />}
            <span style={{ fontSize: 14, fontWeight: 700, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePct}%)
            </span>
          </div>
          {latestVolume && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
              <BarChart3 size={13} /> Vol: {(latestVolume / 1000).toFixed(0)}K
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--accent-red)' }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <div className="spin" style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border-bright)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginBottom: 12 }} />
          <div>Loading market data for {symbol}...</div>
        </div>
      )}

      {/* Price Chart */}
      {chartData.length > 0 && (
        <>
          <div className="card" style={{ padding: '16px 16px 8px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={14} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Price Chart — {symbol}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {data.length} candles · {interval} · {range}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={compact ? 200 : 320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  domain={[minPrice - pricePad, maxPrice + pricePad]}
                  tickFormatter={v => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: any, name: any) => {
                    if (name === 'close') return [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Close'];
                    return [String(value), name || ''];
                  }) as any}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          {!compact && (
            <div className="card" style={{ padding: '16px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BarChart3 size={14} color="var(--accent)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Volume</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [Number(value).toLocaleString('en-IN'), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="rgba(59,130,246,0.4)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
