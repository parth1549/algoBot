'use client';

import { useEffect, useState } from 'react';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import BrokerSetup from './BrokerSetup';
import MobileMenu from './MobileMenu';

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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(3000) });
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
    <header className="h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <MobileMenu />
        <div className="text-[13px] text-[var(--text-muted)] font-medium hidden sm:block">
          Algorithmic Trading Platform · NSE/BSE
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Broker Setup */}
        <BrokerSetup />

        {/* Backend status */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {backendOnline === null ? (
            <span className="text-[var(--text-muted)]">Checking...</span>
          ) : backendOnline ? (
            <>
              <Wifi size={14} className="text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Backend Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-rose-500" />
              <span className="text-rose-500 font-semibold">Backend Offline</span>
            </>
          )}
        </div>

        {/* Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] font-mono">
          <Clock size={14} />
          {time}
        </div>

        {/* Auth / Profile Dropdown */}
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="redirect" forceRedirectUrl="/market">
              <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-md text-white cursor-pointer transition-colors">Sign in</button>
            </SignInButton>
            <SignUpButton mode="redirect" forceRedirectUrl="/market">
              <button className="px-3 py-1.5 text-xs font-semibold border border-[var(--border-bright)] hover:bg-[var(--bg-card)] rounded-md text-white cursor-pointer transition-colors">Sign up</button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
