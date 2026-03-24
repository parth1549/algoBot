import { useState, useRef, useEffect } from 'react';
import { Settings, RefreshCcw, Layers, History, LogIn, HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderControlsProps {
  title?: string;
  showTag?: boolean;
  tagText?: string;
}

export default function HeaderControls({ title = 'Algo Trade', showTag = false, tagText = '' }: HeaderControlsProps) {
  const [planOpen, setPlanOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPlanOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
          {title}
          {showTag && (
            <span className="bg-amber-500/20 text-amber-500 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-amber-500/30">
              {tagText}
            </span>
          )}
        </h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-medium">Credits Available: <span className="text-white font-bold">0</span></span>
            <button className="text-blue-500 hover:text-blue-400 font-bold ml-1 transition-colors">Add</button>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-amber-500 font-medium">No Plan Found</span>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setPlanOpen(!planOpen)}
                className="flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                <Plus size={14} /> Add Plan
              </button>
              {planOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-700 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deploy & Subscribe</span>
                  </div>
                  <Link href="/strategies" className="block px-4 py-2 text-sm text-slate-300 hover:bg-blue-600/20 hover:text-white transition-colors">
                    User Created Strategies
                  </Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-blue-600/20 hover:text-white transition-colors">
                    Marketplace Portfolios
                  </Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-blue-600/20 hover:text-white transition-colors">
                    Upgrade to Pro Plan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors border border-transparent hover:border-slate-600">
            <Settings size={14} className="text-blue-400" /> Auto Activation
          </button>
          
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors px-2">
            <div className="relative inline-block w-8 h-4 rounded-full bg-slate-600">
              <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-white transition-transform"></div>
            </div>
            Auto restart paused executions
          </label>
          
          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors border border-transparent hover:border-slate-600">
            <Layers size={14} className="text-purple-400" /> Switch to Pro View
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors">
            <History size={14} /> History
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors">
            <LogIn size={14} className="text-emerald-400" /> Broker Login (0/0)
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors">
            <HelpCircle size={14} /> Help Center
          </button>
        </div>
      </div>
    </div>
  );
}
