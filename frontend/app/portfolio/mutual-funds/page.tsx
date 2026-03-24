export default function MutualFundsPortfolioPage() {
  return (
    <div className="fade-in p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Mutual Funds</h1>
      <p className="text-sm text-slate-400 mb-8">SIPs and lump-sum investments across AMCs.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-t-4 border-t-purple-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Invested Value</div>
          <div className="text-3xl font-bold text-slate-200 mt-2">₹ 4,45,000</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-t-4 border-t-purple-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Current Value</div>
          <div className="text-3xl font-bold text-green-400 mt-2">₹ 5,30,500</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-t-4 border-t-purple-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Active SIPs</div>
          <div className="text-3xl font-bold text-purple-400 mt-2">3</div>
        </div>
      </div>

      <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-8 text-center text-slate-400 italic">
        Fund allocation schemas and folio details are synchronized automatically once a broker is fully linked.
      </div>
    </div>
  );
}
