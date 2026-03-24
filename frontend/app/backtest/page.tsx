'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, DataRow } from '@/lib/api';
import { FlaskConical, AlertCircle, Save, Check } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface BacktestData {
  symbol: string;
  equity: number[];
  data: DataRow[];
  totalReturn: string;
  finalEquity: number;
  startEquity: number;
}

// Reusable Segemented Toggle
const ToggleGroup = ({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
    {options.map(o => (
      <button 
        key={o} 
        onClick={() => onChange(o)} 
        style={{
          flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, borderRadius: 6,
          background: value === o ? 'var(--bg-card)' : 'transparent',
          color: value === o ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: value === o ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
          border: value === o ? '1px solid var(--border-bright)' : '1px solid transparent',
          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
        }}
      >
        {o}
      </button>
    ))}
  </div>
);

export default function BacktestPage() {
  // A. Instrument Settings
  const [index, setIndex] = useState('NIFTY');
  const [instrument, setInstrument] = useState('Futures');

  // B. Entry Settings
  const [strategyType, setStrategyType] = useState('Intraday');
  const [entryTime, setEntryTime] = useState('09:15');
  const [exitTime, setExitTime] = useState('15:15');
  const [noReentry, setNoReentry] = useState(false);
  const [noReentryTime, setNoReentryTime] = useState('14:30');
  const [overallMomentum, setOverallMomentum] = useState(true);
  const [metricType, setMetricType] = useState('Points');

  // C. Legwise Settings
  const [squareOff, setSquareOff] = useState('Complete');
  const [stopLoss, setStopLoss] = useState('50');
  const [target, setTarget] = useState('100');
  const [trailingSl, setTrailingSl] = useState('20');

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BacktestData | null>(null);
  const [saved, setSaved] = useState(false);

  // Payload computation
  const getBacktestPayload = useCallback(() => ({
    index, instrument, 
    strategyType, entryTime, exitTime, 
    reentry: noReentry ? { enabled: false, after: noReentryTime } : { enabled: true },
    momentum: overallMomentum,
    riskManagement: {
      type: metricType,
      squareOff,
      stopLoss: parseFloat(stopLoss) || 0,
      target: parseFloat(target) || 0,
      trailingSl: parseFloat(trailingSl) || 0
    }
  }), [index, instrument, strategyType, entryTime, exitTime, noReentry, noReentryTime, overallMomentum, metricType, squareOff, stopLoss, target, trailingSl]);

  const runBacktest = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = getBacktestPayload();
      
      // Hit the run_backtest endpoint that handles the complex object
      await api.runBacktest(payload);
      
      // Assuming backend still fills /data and /equity as current state structure:
      const [rawData, equityArr] = await Promise.all([api.getData(), api.getEquity()]);

      const data = rawData.filter(r => r.signal !== undefined && r.equity !== undefined);
      const startEquity = equityArr[0] ?? 100000;
      const finalEquity = equityArr[equityArr.length - 1] ?? 100000;
      const totalReturn = startEquity > 0 ? (((finalEquity - startEquity) / startEquity) * 100).toFixed(2) : '0';

      setResult({ symbol: index, equity: equityArr, data, totalReturn, finalEquity, startEquity });
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Backtest failed. Is the /run_backtest endpoint ready on port 8000?');
    } finally {
      setLoading(false);
    }
  }, [getBacktestPayload, index]);

  // Keyboard shortcut Shift + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        runBacktest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runBacktest]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Metrics extraction
  const sharpe = result
    ? (() => {
        const returns = result.equity.slice(1).map((v, i) => (v - result.equity[i]) / (result.equity[i] || 1));
        const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
        const std = Math.sqrt(returns.map(r => (r - mean) ** 2).reduce((a, b) => a + b, 0) / (returns.length || 1));
        return std > 0 ? ((mean / std) * Math.sqrt(252)).toFixed(2) : '0';
      })()
    : null;

  const maxDrawdown = result
    ? (() => {
        let peak = result.equity[0];
        let maxDD = 0;
        for (const v of result.equity) {
          if (v > peak) peak = v;
          const dd = (v - peak) / peak;
          if (dd < maxDD) maxDD = dd;
        }
        return (maxDD * 100).toFixed(2);
      })()
    : null;

  const chartData = result?.equity.map((v, i) => ({ index: i, equity: Math.round(v) })) ?? [];
  const buyCount = result?.data.filter(r => r.signal === 1).length ?? 0;
  const sellCount = result?.data.filter(r => r.signal === 0).length ?? 0;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Backtesting Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Configure detailed strategy rules and execute backtests. Press <strong>Shift + Enter</strong> to run.
        </p>
      </div>

      {/* Advanced Settings Container */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          
          {/* A. Instrument Settings */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>A. Instrument Settings</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Index / Symbol</label>
              <select className="select" style={{ width: '100%' }} value={index} onChange={e => setIndex(e.target.value)}>
                <option value="NIFTY">NIFTY 50</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
                <option value="MIDCPNIFTY">MIDCPNIFTY</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Instrument Type</label>
              <ToggleGroup options={['Cash', 'Futures']} value={instrument} onChange={setInstrument} />
            </div>
          </div>

          {/* B. Entry Settings */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>B. Entry Settings</h3>
            
            <div style={{ marginBottom: 16 }}>
              <ToggleGroup options={['Intraday', 'BTST', 'Positional']} value={strategyType} onChange={setStrategyType} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Entry Time</label>
                <input type="time" className="input" style={{ width: '100%' }} value={entryTime} onChange={e => setEntryTime(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Exit Time</label>
                <input type="time" className="input" style={{ width: '100%' }} value={exitTime} onChange={e => setExitTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={noReentry} onChange={e => setNoReentry(e.target.checked)} style={{ accentColor: 'var(--accent)' }}/>
                No re-entry after
              </label>
              {noReentry && (
                <input type="time" className="input" style={{ width: 110, padding: '6px 10px' }} value={noReentryTime} onChange={e => setNoReentryTime(e.target.value)} />
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={overallMomentum} onChange={e => setOverallMomentum(e.target.checked)} style={{ accentColor: 'var(--accent)' }}/>
                Enable Overall Momentum Filter
              </label>
            </div>
          </div>

          {/* C. Legwise Settings */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>C. Legwise & Risk</h3>
            
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Metric Type</label>
                <select className="select" style={{ width: '100%' }} value={metricType} onChange={e => setMetricType(e.target.value)}>
                  <option value="Points">Points</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Square Off</label>
                <ToggleGroup options={['Partial', 'Complete']} value={squareOff} onChange={setSquareOff} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                 <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Stop Loss</label>
                 <input type="number" className="input" style={{ width: '100%' }} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
              </div>
              <div>
                 <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Target</label>
                 <input type="number" className="input" style={{ width: '100%' }} value={target} onChange={e => setTarget(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                 <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>Trailing SL</label>
                 <input type="number" className="input" style={{ width: '100%' }} value={trailingSl} onChange={e => setTrailingSl(e.target.value)} />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleSave} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, 
              background: 'transparent', color: saved ? 'var(--accent-green)' : 'var(--text-primary)', 
              border: `1px solid ${saved ? 'var(--accent-green)' : 'var(--border-bright)'}`, 
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            {saved ? <><Check size={16}/> Saved</> : <><Save size={16}/> Save Strategy</>}
          </button>
          
          <button className="btn-primary" onClick={runBacktest} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: 13 }}>
            {loading ? (
              <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> Computing...</>
            ) : (
              <><FlaskConical size={16} /> Start Backtest <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4, fontWeight: 500 }}>(Shift+Enter)</span></>
            )}
          </button>
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertCircle size={16} color="var(--accent-red)" />
          <span style={{ color: 'var(--accent-red)', fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Loading Modal / In-container overlay spinner indicator */}
      {loading && !result && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <div className="spin" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border-bright)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginBottom: 16 }} />
          <div>Running comprehensive strategy on {index} {instrument}...</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Validating legs → Processing conditions → Simulating equity...</div>
        </div>
      )}

      {/* Backtest Results */}
      {result && !loading && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Return', value: `${result.totalReturn}%`, color: parseFloat(result.totalReturn) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
              { label: 'Final Equity', value: `₹${result.finalEquity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'var(--accent)' },
              { label: 'Sharpe Ratio', value: sharpe ?? '—', color: parseFloat(sharpe ?? '0') > 1 ? 'var(--accent-green)' : 'var(--accent-yellow)' },
              { label: 'Max Drawdown', value: `${maxDrawdown}%`, color: 'var(--accent-red)' },
              { label: 'BUY Signals', value: buyCount.toString(), color: 'var(--accent-green)' },
              { label: 'SELL Signals', value: sellCount.toString(), color: 'var(--accent-red)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card">
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, marginTop: 0 }}>
              Actionable Equity Curve — {result.symbol}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="index" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => value !== undefined ? [`₹${Number(value).toLocaleString('en-IN')}`, 'Equity'] : ['N/A', 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, marginTop: 0 }}>
              Signal Table (last 50 candles)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Close Price</th>
                    <th>Signal</th>
                    <th>Equity</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.slice(-50).map((row, i) => {
                    const pnl = row.equity !== undefined ? row.equity - (result.startEquity ?? 100000) : 0;
                    return (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₹{row.Close.toFixed(2)}
                        </td>
                        <td>
                          <span className={row.signal === 1 ? 'badge-buy' : 'badge-sell'}>
                            {row.signal === 1 ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>₹{row.equity?.toFixed(0) || '0'}</td>
                        <td style={{ color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
