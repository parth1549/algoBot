import HeaderControls from './HeaderControls';
import SummaryCard from './SummaryCard';
import StrategyFilters from './StrategyFilters';
import ActivationPanel from './ActivationPanel';

export default function AlgoTradeSection() {
  return (
    <div className="fade-in pb-20 p-2 sm:p-6 lg:p-1 max-w-[1400px] mx-auto">
      {/* 1. Top Action Headers */}
      <HeaderControls />

      {/* 2. Total MTM & Open Positions */}
      <SummaryCard />

      {/* 3. Deployed Strategies View */}
      <StrategyFilters />

      {/* 4. Deep List - Activation Panel + Filter Sub-Header */}
      <ActivationPanel />
    </div>
  );
}
