'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, SignalType } from '@/lib/api';
import { Zap, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SignalRow {
  index: number;
  close: number;
  signal: SignalType;
}

interface Trade {
  id: number;
  type: SignalType;
  symbol: string;
  price: number;
  amount: number;
  quantity: number;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED';
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [liveSignal, setLiveSignal] = useState<{ signal: SignalType; price: number; symbol: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Order form
  const [amount, setAmount] = useState('');
  const [pendingTrade, setPendingTrade] = useState<Omit<Trade, 'id' | 'status'> | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeCounter, setTradeCounter] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState('');

  const fetchSignals = useCallback(async () => {
    setError('');
    try {
      const [rows, live] = await Promise.all([api.getSignal(), api.getLiveSignal()]);
      setSignals(rows.map((r, i) => ({ index: i, close: r.Close, signal: r.signal === 1 ? 'BUY' : 'SELL' })));
      if (live.status === 'success' && live.signal && live.price && live.symbol) {
        setLiveSignal({ signal: live.signal, price: live.price, symbol: live.symbol });
      }
    } catch {
      setError('Could not fetch signals. Run an analysis first from the Dashboard.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchSignals();
  }, [fetchSignals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSignals();
    setRefreshing(false);
  };

  const qty = liveSignal && amount ? (parseFloat(amount) / liveSignal.price).toFixed(4) : '';

  const handlePrepareOrder = () => {
    if (!liveSignal || !amount || parseFloat(amount) <= 0) return;
    setPendingTrade({
      type: liveSignal.signal,
      symbol: liveSignal.symbol,
      price: liveSignal.price,
      amount: parseFloat(amount),
      quantity: parseFloat(qty),
      timestamp: new Date().toISOString(),
    });
  };

  const handleConfirmOrder = () => {
    if (!pendingTrade) return;
    const trade: Trade = { ...pendingTrade, id: tradeCounter, status: 'CONFIRMED' };
    setTrades(prev => [trade, ...prev]);
    setTradeCounter(c => c + 1);
    setPendingTrade(null);
    setAmount('');
    setOrderSuccess(`Order #${tradeCounter} confirmed — ${trade.type} ${trade.quantity} units of ${trade.symbol}`);
    setTimeout(() => setOrderSuccess(''), 4000);
  };

  const handleCancelOrder = () => {
    setPendingTrade(null);
    setAmount('');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Live Signals
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Algo-generated BUY/SELL signals. You manually set the amount and confirm each trade.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertCircle size={16} color="var(--accent-red)" />
          <span style={{ color: 'var(--accent-red)', fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Success */}
      {orderSuccess && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }} className="fade-in">
          <CheckCircle size={16} color="var(--accent-green)" />
          <span style={{ color: 'var(--accent-green)', fontSize: 13 }}>{orderSuccess}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Left: Signal table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Signal History ({signals.length} candles)
            </h2>
            <button onClick={handleRefresh} disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text-secondary)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
              <RefreshCw size={12} className={refreshing ? 'spin' : ''} />Refresh
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: 500, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Close Price</th>
                    <th>Algo Signal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No signals yet. Run analysis from Dashboard first.
                    </td></tr>
                  ) : signals.slice().reverse().map((row) => (
                    <tr key={row.index}>
                      <td style={{ color: 'var(--text-muted)' }}>{row.index + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ₹{row.close.toFixed(2)}
                      </td>
                      <td>
                        <span className={row.signal === 'BUY' ? 'badge-buy' : 'badge-sell'}>
                          {row.signal}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (liveSignal) {
                              setPendingTrade({
                                type: row.signal,
                                symbol: liveSignal.symbol,
                                price: row.close,
                                amount: parseFloat(amount) || 0,
                                quantity: 0,
                                timestamp: new Date().toISOString(),
                              });
                            }
                          }}
                          style={{
                            background: row.signal === 'BUY' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: row.signal === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: `1px solid ${row.signal === 'BUY' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600
                          }}>
                          Execute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Order panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live Signal Card */}
          {liveSignal && (
            <div className="card" style={{
              borderColor: liveSignal.signal === 'BUY' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
              background: liveSignal.signal === 'BUY' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latest Signal</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: liveSignal.signal === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>LIVE</span>
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: liveSignal.signal === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {liveSignal.signal}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {liveSignal.symbol} · ₹{liveSignal.price.toFixed(2)}
              </div>
            </div>
          )}

          {/* Manual Order Panel */}
          <div className="card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, marginTop: 0 }}>
              Manual Order Entry
            </h3>

            {!pendingTrade ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 6 }}>
                    Amount (₹)
                  </label>
                  <input
                    className="input"
                    type="number"
                    placeholder="Enter amount, e.g. 10000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="100"
                  />
                </div>

                {amount && liveSignal && (
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Price</span><span style={{ color: 'var(--text-secondary)' }}>₹{liveSignal.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Amount</span><span style={{ color: 'var(--text-secondary)' }}>₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 700 }}>
                      <span>Quantity</span><span style={{ color: 'var(--text-primary)' }}>{qty} units</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, fontSize: 13 }}
                    onClick={handlePrepareOrder}
                    disabled={!amount || !liveSignal || parseFloat(amount) <= 0}>
                    Add Amount
                  </button>
                </div>
              </>
            ) : (
              <div className="fade-in">
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-yellow)', marginBottom: 8, textTransform: 'uppercase' }}>⚠ Review Order</div>
                  {[
                    ['Type', pendingTrade.type],
                    ['Symbol', pendingTrade.symbol],
                    ['Price', `₹${pendingTrade.price.toFixed(2)}`],
                    ['Amount', `₹${pendingTrade.amount.toLocaleString('en-IN')}`],
                    ['Quantity', pendingTrade.quantity > 0 ? `${pendingTrade.quantity} units` : 'Enter amount first'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Amount update for pending */}
                {pendingTrade.amount === 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <label className="stat-label" style={{ display: 'block', marginBottom: 6 }}>Amount (₹)</label>
                    <input className="input" type="number" placeholder="Enter amount" value={amount}
                      onChange={e => {
                        setAmount(e.target.value);
                        const a = parseFloat(e.target.value);
                        if (a > 0) setPendingTrade(prev => prev ? { ...prev, amount: a, quantity: a / prev.price } : prev);
                      }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-success" style={{ flex: 1, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={handleConfirmOrder}>
                    <CheckCircle size={14} />Confirm
                  </button>
                  <button onClick={handleCancelOrder}
                    style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text-secondary)', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <XCircle size={14} />Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade History */}
      {trades.length > 0 && (
        <div className="card fade-in" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, marginTop: 0 }}>
            Confirmed Trade History
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Amount (₹)</th>
                  <th>Quantity</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{t.id}</td>
                    <td><span className={t.type === 'BUY' ? 'badge-buy' : 'badge-sell'}>{t.type}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.symbol}</td>
                    <td style={{ fontFamily: 'monospace' }}>₹{t.price.toFixed(2)}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{t.quantity.toFixed(4)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                        CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
