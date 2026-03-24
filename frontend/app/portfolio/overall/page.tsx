export default function OverallPortfolioPage() {
  return (
    <div className="fade-in p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Overall Portfolio</h1>
      <p className="text-sm text-slate-400 mb-8">Consolidated view of all your investments.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400 uppercase">Invested Value</div>
          <div className="text-3xl font-bold text-slate-200 mt-2">₹ 12,45,000</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400 uppercase">Current Value</div>
          <div className="text-3xl font-bold text-green-400 mt-2">₹ 14,80,500</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400 uppercase">Total Returns</div>
          <div className="text-3xl font-bold text-green-400 mt-2">+18.9% (₹ 2,35,500)</div>
        </div>
      </div>
      
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-8 text-center text-slate-400 italic">
        Distribution charts and holding details will appear here once connected to your broker.
      </div>
    </div>
  );
}
