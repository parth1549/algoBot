'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, FlaskConical, Zap, BookOpen, ScrollText, Briefcase, ChevronDown, Target, BarChart3, Bot
} from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="md:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-1 -ml-1 text-slate-300 hover:text-white cursor-pointer transition-colors active:scale-95">
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b0e1a] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                <Bot size={18} className="text-white" />
              </div>
              <div className="font-bold text-lg text-white">AlgoBot</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-300 hover:text-white cursor-pointer bg-slate-800/50 rounded-full active:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 p-4 pb-12 overflow-y-auto flex-1">
            <div className="text-[10px] font-bold tracking-widest text-[#475569] uppercase px-2 mb-2">Navigation</div>
            {links.map((item) => {
              if (item.subItems) {
                const isExpanded = expandedMenu === item.label;
                const hasActiveChild = item.subItems.some(sub => pathname.startsWith(sub.href));
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <button 
                      onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${
                        hasActiveChild ? 'bg-blue-900/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        {item.label}
                      </div>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col gap-1.5 ml-8 mt-1 border-l border-slate-700 pl-4 py-1">
                        {item.subItems.map(sub => {
                          const subActive = pathname === sub.href;
                          return (
                            <Link 
                              key={sub.href} 
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                subActive ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                <Link 
                  key={item.href!} 
                  href={item.href!} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                    active ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
