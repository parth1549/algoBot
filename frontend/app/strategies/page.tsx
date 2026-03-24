'use client';

import { useState } from 'react';
import { Brain, TrendingUp, Activity, Zap, GitMerge, BarChart2, Plus, X, ServerCog, Save } from 'lucide-react';

const prebuiltStrategies = [
  {
    name: 'SMA Crossover', icon: TrendingUp, color: '#3b82f6', tag: 'Trend Following',
    description: 'Detects trend direction using SMA10 and SMA20 crossovers.',
    params: [{ label: 'Fast Period', value: '10' }, { label: 'Slow Period', value: '20' }],
    role: 'Feature for ML model — captures medium-term trend.',
  },
  {
    name: 'RSI Oscillator', icon: Activity, color: '#f59e0b', tag: 'Momentum',
    description: 'Measures overbought/oversold conditions by comparing recent gains and losses.',
    params: [{ label: 'Period', value: '14' }, { label: 'Overbought', value: '70' }, { label: 'Oversold', value: '30' }],
    role: 'Feature for ML model — captures momentum and reversal.',
  },
  {
    name: 'Hull Moving Average', icon: GitMerge, color: '#8b5cf6', tag: 'Trend + Low Lag',
    description: 'Low-lag trend indicator combining two HMAs (50 & 200 period).',
    params: [{ label: 'HMA Fast', value: '50' }, { label: 'HMA Slow', value: '200' }],
    role: 'Feature for ML model — provides low-lag trend confirmation.',
  },
  {
    name: 'ATR (Volatility)', icon: BarChart2, color: '#ef4444', tag: 'Volatility',
    description: 'Average True Range measures market volatility over 14 periods.',
    params: [{ label: 'Period', value: '14' }],
    role: 'Core input to UT Bot trend bands.',
  },
  {
    name: 'UT Bot Filter', icon: Zap, color: '#10b981', tag: 'Signal Filter',
    description: 'Creates dynamic ATR-based bands. Trend = 1 (up) or 0 (down).',
    params: [{ label: 'ATR Multiplier', value: '1' }, { label: 'ATR Period', value: '14' }],
    role: 'Gate — ML signal AND UT Bot = 1 required for BUY.',
  },
  {
    name: 'RandomForest ML', icon: Brain, color: '#ec4899', tag: 'Machine Learning',
    description: '100-tree forest trained on 20-candle rolling window of all indicators.',
    params: [{ label: 'Estimators', value: '100' }, { label: 'Window', value: '20 candles' }, { label: 'Threshold', value: 'P(up) > 0.5' }],
    role: 'Core signal generator combined with UT Bot filter.',
  },
];

const availableIndicators = [
  { id: 'sma', name: 'SMA', params: [{ name: 'Period', default: 14 }] },
  { id: 'hma', name: 'HMA', params: [{ name: 'Period', default: 50 }] },
  { id: 'utbot', name: 'UT Bot', params: [{ name: 'Multiplier', default: 1 }, { name: 'ATR Period', default: 10 }] },
  { id: 'rsi', name: 'RSI', params: [{ name: 'Period', default: 14 }] },
  { id: 'supertrend', name: 'Supertrend', params: [{ name: 'Period', default: 10 }, { name: 'Multiplier', default: 3 }] },
];

export default function StrategiesPage() {
  // State for Strategy Builder
  const [addingIndicator, setAddingIndicator] = useState<string>('');
  const [activeIndicators, setActiveIndicators] = useState<Array<{ id: string, uniqueId: number, name: string, params: { name: string, default?: number, value?: number }[] }>>([]);
  const [nextId, setNextId] = useState(1);
  const [saved, setSaved] = useState(false);

  // Add Indicator
  const handleAddIndicator = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    
    const indicatorDef = availableIndicators.find(i => i.id === id);
    if (indicatorDef) {
      setActiveIndicators([...activeIndicators, { 
        id: indicatorDef.id, 
        uniqueId: nextId, 
        name: indicatorDef.name, 
        params: indicatorDef.params.map(p => ({ ...p, value: p.default })) 
      }]);
      setNextId(nextId + 1);
    }
    setAddingIndicator('');
  };

  const handleRemoveIndicator = (uniqueId: number) => {
    setActiveIndicators(activeIndicators.filter(i => i.uniqueId !== uniqueId));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Strategies & Builder</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          View active bot modules or build your own custom algorithmic strategy.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Pre-configured Active Modules */}
        <div style={{ flex: '1 1 600px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ServerCog size={18} color="var(--accent)" />
            Active Bot Modules
          </h2>

          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Signal Logic Layer</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)' }}>
              FINAL SIGNAL = BUY <span style={{ color: 'var(--text-muted)' }}>only if</span> (ML_prob &gt; 0.5) AND (UT_bot_trend = 1)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Both must be true simultaneously. Otherwise → SELL. Dual-confirmation strictly reduces false signals in choppy markets.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {prebuiltStrategies.map(({ name, icon: Icon, color, tag, description, params, role }) => (
              <div key={name} className="card" style={{ borderTop: `3px solid ${color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{name}</span>
                  </div>
                  <span style={{ background: `${color}15`, color, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{tag}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, marginTop: 0 }}>{description}</p>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                  {params.map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color, fontWeight: 600 }}>→ {role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Strategy Builder */}
        <div style={{ flex: '0 1 450px', position: 'sticky', top: 24 }}>
          <div className="card" style={{ borderTop: '3px solid var(--accent)', padding: 0, overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} color="var(--accent)" />
                Add Your Strategy
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Construct a custom logic flow for execution.</p>
            </div>

            <div style={{ padding: 24 }}>
              {/* Option Chain Section */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Option Chain (NIFTY)
                </h3>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table className="data-table" style={{ fontSize: 11, margin: 0 }}>
                    <thead style={{ background: 'var(--bg-primary)' }}>
                      <tr>
                        <th style={{ textAlign: 'center', color: '#10b981' }}>Call LTP</th>
                        <th style={{ textAlign: 'center' }}>Strike</th>
                        <th style={{ textAlign: 'center', color: '#ef4444' }}>Put LTP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>185.40</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, background: 'rgba(255,255,255,0.03)' }}>22400</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#ef4444' }}>65.10</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>142.15</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, background: 'rgba(255,255,255,0.03)' }}>22500 <span style={{fontSize: 9, color:'var(--text-muted)'}}>(ATM)</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#ef4444' }}>89.30</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>98.50</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, background: 'rgba(255,255,255,0.03)' }}>22600</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#ef4444' }}>130.45</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Indicator Importer */}
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Import Indicators
                </h3>
                
                {/* Dropdown to add */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <select 
                    className="select" 
                    value={addingIndicator} 
                    onChange={handleAddIndicator}
                    style={{ flex: 1 }}
                  >
                    <option value="" disabled>Select Indicator...</option>
                    {availableIndicators.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                {/* Active Indicators List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
                  {activeIndicators.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                      No indicators imported yet.<br/>Select from the dropdown to add conditions.
                    </div>
                  ) : (
                    activeIndicators.map((ind, i) => (
                      <div key={ind.uniqueId} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                            {i+1}. {ind.name}
                          </span>
                          <button onClick={() => handleRemoveIndicator(ind.uniqueId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {ind.params.map(p => (
                            <div key={p.name} style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{p.name}</label>
                              <input type="number" className="input" defaultValue={p.value} style={{ width: '100%', padding: '4px 8px', fontSize: 12 }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Strategy Action */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <button onClick={handleSave} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    <Save size={16} />
                    {saved ? 'Strategy Saved!' : 'Save Custom Strategy'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
