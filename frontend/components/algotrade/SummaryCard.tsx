import { Info, ExternalLink } from 'lucide-react';

export default function SummaryCard() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      
      {/* Left Card */}
      <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total MTM</h2>
          <div className="text-3xl font-bold text-slate-200">₹ 0</div>
        </div>
        <a href="#" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-4 font-medium transition-colors">
          Today&apos;s MTM Graph <ExternalLink size={12} />
        </a>
      </div>

      {/* Right Side Info */}
      <div className="flex-[2] bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex gap-12">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Open Positions</div>
              <div className="text-2xl font-bold text-slate-200">0</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                Margin Blocked (approx) <Info size={12} className="text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-200">₹ 0</div>
            </div>
          </div>
          
          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-end gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
              <span className="text-xs font-medium">Include Brokerage</span>
              <div className="relative inline-block w-8 h-4 rounded-full bg-slate-700">
                <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-slate-400 transition-transform"></div>
              </div>
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
              <span className="text-xs font-medium">Taxes & Charges</span>
              <div className="relative inline-block w-8 h-4 rounded-full bg-slate-700">
                <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-slate-400 transition-transform"></div>
              </div>
            </label>
          </div>
        </div>
      </div>
      
    </div>
  );
}
