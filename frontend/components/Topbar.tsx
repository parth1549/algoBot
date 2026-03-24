'use client';

import { useEffect, useState } from 'react';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import BrokerSetup from './BrokerSetup';

export default function Topbar() {
  const [time, setTime] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://localhost:8000/', { signal: AbortSignal.timeout(3000) });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: 56,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
        Algorithmic Trading Platform · NSE/BSE
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Broker Setup */}
        <BrokerSetup />

        {/* Backend status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          {backendOnline === null ? (
            <span style={{ color: 'var(--text-muted)' }}>Checking...</span>
          ) : backendOnline ? (
            <>
              <Wifi size={14} color="var(--accent-green)" />
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Backend Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} color="var(--accent-red)" />
              <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Backend Offline</span>
            </>
          )}
        </div>

        {/* Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          <Clock size={14} />
          {time}
        </div>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
