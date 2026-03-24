'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api, MarketCandle } from '@/lib/api';

interface UseMarketDataOptions {
  symbol: string;
  interval?: string;
  range?: string;
  refreshInterval?: number; // ms, 0 = no polling
}

interface UseMarketDataReturn {
  data: MarketCandle[];
  latestPrice: number | null;
  latestVolume: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketData({
  symbol,
  interval = '5m',
  range = '5d',
  refreshInterval = 0,
}: UseMarketDataOptions): UseMarketDataReturn {
  const [data, setData] = useState<MarketCandle[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [latestVolume, setLatestVolume] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getMarketData(symbol, interval, range);
      if (res.status === 'success') {
        setData(res.data);
        setLatestPrice(res.latest_price);
        setLatestVolume(res.latest_volume);
      } else {
        setError(res.message || 'Failed to fetch market data');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, range]);

  // Initial fetch + refetch on param changes
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (refreshInterval > 0) {
      timerRef.current = setInterval(fetchData, refreshInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData, refreshInterval]);

  return { data, latestPrice, latestVolume, loading, error, refetch: fetchData };
}
