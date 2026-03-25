'use client';

import { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ActivationPanel() {
  const [activeTab, setActiveTab] = useState('Strategies');
  const [timeFilter, setTimeFilter] = useState<'weekdays' | 'dte'>('weekdays');
  const [selectedDays, setSelectedDays] = useState(['M', 'T', 'W', 'Th', 'F']);

  const tabs = ['Strategies', 'Portfolios', 'RA Algos', 'CryptoBazaar Algos'];
  const days = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden mt-6">
      
      {/* Header Tabs Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700 bg-slate-800/80">
        
        <div className="flex items-center px-4 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-6 md:px-6 py-3 md:py-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search Strategies" 
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-slate-800 transition-colors">
            0 Selected <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Under Header - Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 px-6 py-4 bg-slate-800/30 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filter Execution Days</span>
        </div>

        <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700">
          <button 
            onClick={() => setTimeFilter('weekdays')}
            className={`px-4 py-1 text-xs font-bold rounded ${timeFilter === 'weekdays' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Weekdays
          </button>
          <button 
            onClick={() => setTimeFilter('dte')}
            className={`px-4 py-1 text-xs font-bold rounded ${timeFilter === 'dte' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            DTE
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          {days.map(d => (
            <button 
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                selectedDays.includes(d)
                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-8">
        <EmptyState />
      </div>

    </div>
  );
}
