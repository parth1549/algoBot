import { Layers } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700">
        <Layers size={28} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-300 mb-2">Strategies will show up here</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        Can&apos;t find any deployable strategy. Please check your active plans, create custom strategies, or adjust filters to view archived algos.
      </p>
    </div>
  );
}
