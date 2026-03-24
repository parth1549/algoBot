'use client';

import { useState } from 'react';

export default function StrategyFilters() {
  const [activeFilter, setActiveFilter] = useState('Running');
  const [showArchived, setShowArchived] = useState(false);

  const filters = ['Running', 'Paused', 'Sq Off', 'Error', 'Manual'];

  return (
    <div className="mb-6 border border-slate-700/50 bg-slate-800/20 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Title & Pills */}
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Deployed Strategies</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeFilter === f 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Archived Toggle */}
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Show archived</span>
          <div className={`relative inline-block w-8 h-4 rounded-full transition-colors ${showArchived ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={showArchived} 
              onChange={() => setShowArchived(!showArchived)}
            />
            <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-transform ${showArchived ? 'left-5' : 'left-1'}`}></div>
          </div>
        </label>

      </div>

      <div className="mt-6 flex flex-col items-center justify-center py-6 text-slate-500 text-sm italic border border-dashed border-slate-700 rounded-lg">
        No deployed strategies found in &apos;{activeFilter}&apos;.
      </div>

    </div>
  );
}
