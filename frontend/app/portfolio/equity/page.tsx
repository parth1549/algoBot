export default function EquityPortfolioPage() {
  return (
    <div className="fade-in p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Equity Investments</h1>
      <p className="text-sm text-slate-400 mb-8">Direct stocks and equity-based instruments.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Invested Value</div>
          <div className="text-3xl font-bold text-slate-200 mt-2">₹ 8,00,000</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Current Value</div>
          <div className="text-3xl font-bold text-green-400 mt-2">₹ 9,50,000</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl border-l-4 border-l-blue-500">
          <div className="text-sm font-semibold text-slate-400 uppercase">Unrealized P&L</div>
          <div className="text-3xl font-bold text-green-400 mt-2">+18.75%</div>
        </div>
      </div>
      
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-700 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Symbol</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Avg Price</th>
              <th className="px-6 py-4">LTP</th>
              <th className="px-6 py-4 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50 hover:bg-slate-800/60">
              <td className="px-6 py-4 font-bold text-blue-400">RELIANCE</td>
              <td className="px-6 py-4">100</td>
              <td className="px-6 py-4">₹ 2,400</td>
              <td className="px-6 py-4">₹ 2,900</td>
              <td className="px-6 py-4 text-right text-green-400 font-bold">+ ₹ 50,000</td>
            </tr>
            <tr className="hover:bg-slate-800/60">
              <td className="px-6 py-4 font-bold text-blue-400">ITC</td>
              <td className="px-6 py-4">500</td>
              <td className="px-6 py-4">₹ 400</td>
              <td className="px-6 py-4">₹ 450</td>
              <td className="px-6 py-4 text-right text-green-400 font-bold">+ ₹ 25,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
