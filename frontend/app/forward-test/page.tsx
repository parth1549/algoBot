'use client';

import { AlertTriangle } from 'lucide-react';
import HeaderControls from '@/components/algotrade/HeaderControls';
import SummaryCard from '@/components/algotrade/SummaryCard';
import StrategyFilters from '@/components/algotrade/StrategyFilters';
import ActivationPanel from '@/components/algotrade/ActivationPanel';

export default function ForwardTestPage() {
  return (
    <div className="fade-in pb-20 p-2 sm:p-6 lg:p-1 max-w-[1400px] mx-auto">
      {/* 1. Top Action Headers (Reused but customized) */}
      <HeaderControls title="Forward Test" showTag={true} tagText="Paper Trading" />

      {/* 2. Warning / Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
        <div className="mt-0.5 sm:mt-0">
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <p className="text-sm text-amber-200/90 leading-relaxed font-medium">
          Forward test results are hypothetical results in a simulated environment. They do not represent actual trading & these trades have not been executed.
        </p>
      </div>

      {/* 3. Total MTM & Open Positions (Reused) */}
      <SummaryCard />

      {/* 4. Deployed Strategies View (Reused) */}
      <StrategyFilters />

      {/* 5. Deep List - Activation Panel + Filter Sub-Header (Reused) */}
      <ActivationPanel />
    </div>
  );
}
