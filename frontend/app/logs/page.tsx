'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { ScrollText, RefreshCw, Trash2 } from 'lucide-react';

function classifyLog(line: string): { level: string; color: string; bg: string } {
  if (line.includes('ERROR')) return { level: 'ERROR', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' };
  if (line.includes('WARNING') || line.includes('WARN')) return { level: 'WARN', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' };
  if (line.includes('DEBUG')) return { level: 'DEBUG', color: '#475569', bg: 'transparent' };
  return { level: 'INFO', color: '#10b981', bg: 'transparent' };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('ALL');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await api.getLogs(200);
      if (res.status === 'success') setLogs(res.logs);
      else setError(res.status === 'no_logs' ? 'No logs yet. Start the backend and run an analysis.' : 'Failed to fetch logs.');
    } catch {
      setError(`Cannot reach backend. Is the Python server running?`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filtered = filter === 'ALL' ? logs : logs.filter(l => classifyLog(l).level === filter);

  const counts = {
    ERROR: logs.filter(l => classifyLog(l).level === 'ERROR').length,
    WARN: logs.filter(l => classifyLog(l).level === 'WARN').length,
    INFO: logs.filter(l => classifyLog(l).level === 'INFO').length,
    DEBUG: logs.filter(l => classifyLog(l).level === 'DEBUG').length,
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>API Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Live log stream from the Python backend. Auto-refreshes every 5 seconds.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filter tabs */}
        {(['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
            color: filter === f ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600
          }}>
            {f} {f !== 'ALL' && counts[f] > 0 && `(${counts[f]})`}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
          Auto-refresh (5s)
        </label>
        <button onClick={() => fetchLogs()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text-secondary)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
          <RefreshCw size={12} className={loading ? 'spin' : ''} />Refresh
        </button>
        <button onClick={() => setLogs([])} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
          <Trash2 size={12} />Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--accent-red)' }}>
          {error}
        </div>
      )}

      {/* Log viewer */}
      <div style={{
        background: '#0a0d18', border: '1px solid var(--border)', borderRadius: 12,
        height: 520, overflowY: 'auto', padding: '14px', fontFamily: 'monospace', fontSize: 12,
      }}>
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
            {loading ? 'Loading logs...' : 'No log entries match the filter.'}
          </div>
        ) : (
          filtered.map((line, i) => {
            const { color, bg } = classifyLog(line);
            return (
              <div key={i} style={{
                padding: '3px 8px', borderRadius: 4, marginBottom: 2,
                color, background: bg, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all'
              }}>
                {line}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>
        {filtered.length} / {logs.length} entries shown
      </div>
    </div>
  );
}
