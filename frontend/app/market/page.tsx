'use client';

import MarketChart from '@/components/MarketChart';
import { BarChart3 } from 'lucide-react';

export default function MarketPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 1100, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={22} color="var(--accent)" />
          Market Data
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Real-time OHLCV data powered by Yahoo Finance. Select a symbol and timeframe to view price and volume charts.
        </p>
      </div>

      {/* Full Market Chart */}
      <MarketChart defaultSymbol="RELIANCE.NS" refreshInterval={0} />

      {/* OHLCV Data Table will be rendered inline by scrolling down */}
    </div>
  );
}
