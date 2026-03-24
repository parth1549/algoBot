'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, Zap, BookOpen, ScrollText, Bot, Briefcase, ChevronDown, Target, BarChart3
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Portfolio');

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/market', label: 'Market Data', icon: BarChart3 },
    { href: '/backtest', label: 'Backtesting', icon: FlaskConical },
    { href: '/forward-test', label: 'Paper Trading', icon: Target },
    { href: '/signals', label: 'Live Signals', icon: Zap },
    { href: '/strategies', label: 'Strategies', icon: BookOpen },
    { 
      label: 'Portfolio', 
      icon: Briefcase,
      subItems: [
        { href: '/portfolio/overall', label: 'Overall' },
        { href: '/portfolio/equity', label: 'Equity' },
        { href: '/portfolio/mutual-funds', label: 'Mutual Funds' },
      ]
    },
    { href: '/logs', label: 'API Logs', icon: ScrollText },
  ];

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 12px 20px',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '20px 8px 24px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>AlgoBot</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 8px', marginBottom: 8, textTransform: 'uppercase' }}>
          Navigation
        </div>
        {links.map((item) => {
          if (item.subItems) {
            const isExpanded = expandedMenu === item.label;
            const hasActiveChild = item.subItems.some(sub => pathname.startsWith(sub.href));
            
            return (
              <div key={item.label} className="flex flex-col gap-1">
                <button 
                  onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    hasActiveChild ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    {item.label}
                  </div>
                  <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {isExpanded && (
                  <div className="flex flex-col gap-1 ml-7 mt-1 border-l border-slate-700 pl-2">
                    {item.subItems.map(sub => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link 
                          key={sub.href} 
                          href={sub.href} 
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            subActive ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.href;
          return (
            <Link key={item.href!} href={item.href!} className={`nav-item${active ? ' active' : ''}`}>
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 8px 0',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          Backend: {process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000'}
        </div>
        <div>RandomForest + UT Bot</div>
        <div>SMA · RSI · HMA · ATR</div>
      </div>
    </aside>
  );
}
