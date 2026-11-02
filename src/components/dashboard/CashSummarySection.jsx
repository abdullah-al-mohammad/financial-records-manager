import CarryForwardBanner from './CarryForwardBanner';
import CashBreakdownCards from './CashBreakdownCards';
import CashSummaryHero from './CashSummaryHero';
import MonthClosingHistory from './MonthClosingHistory';
import OpeningBalanceBanner from './OpeningBalanceBanner';
import OpeningBalanceHistory from './OpeningBalanceHistory';

// Total Cash = Hand Cash + Online Cash + Other Cash, with opening-balance and
// month-closing controls/history.
export default function CashSummarySection({
  paymentTotals,
  resolvedOpeningBalance,
  previousMonthClosing,
  openingSource,
  currentMonthName,
  currentYear,
  currentMonthKey,
  isCurrentMonthClosed,
  monthClosings,
  sortedClosings,
  openingBalances,
  showClosingHistory,
  showOpeningHistory,
  onToggleClosingHistory,
  onToggleOpeningHistory,
  onOpenOpeningModal,
  onOpenCloseModal,
  onOpenTransfer,
  onRemoveOpeningBalance,
  onCarryForward,
  setActiveTab,
}) {
  return (
    <div className="glass-panel border border-indigo-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CashSummaryHero
        paymentTotals={paymentTotals}
        resolvedOpeningBalance={resolvedOpeningBalance}
        isCurrentMonthClosed={isCurrentMonthClosed}
        currentMonthName={currentMonthName}
        onOpenOpeningModal={onOpenOpeningModal}
        onOpenCloseModal={onOpenCloseModal}
        onOpenTransfer={onOpenTransfer}
        setActiveTab={setActiveTab}
      />

      <CashBreakdownCards
        paymentTotals={paymentTotals}
        resolvedOpeningBalance={resolvedOpeningBalance}
      />

      {resolvedOpeningBalance && (
        <OpeningBalanceBanner
          resolvedOpeningBalance={resolvedOpeningBalance}
          openingSource={openingSource}
          currentMonthKey={currentMonthKey}
          currentMonthName={currentMonthName}
          currentYear={currentYear}
          onEdit={onOpenOpeningModal}
          onRemove={onRemoveOpeningBalance}
        />
      )}

      {!resolvedOpeningBalance && previousMonthClosing && (
        <CarryForwardBanner
          previousMonthClosing={previousMonthClosing}
          currentMonthName={currentMonthName}
          onCarryForward={onCarryForward}
        />
      )}

      {monthClosings.length > 0 && (
        <MonthClosingHistory
          monthClosings={monthClosings}
          sortedClosings={sortedClosings}
          currentMonthKey={currentMonthKey}
          showHistory={showClosingHistory}
          onToggle={onToggleClosingHistory}
        />
      )}

      {openingBalances.length > 0 && (
        <OpeningBalanceHistory
          openingBalances={openingBalances}
          currentMonthKey={currentMonthKey}
          showHistory={showOpeningHistory}
          onToggle={onToggleOpeningHistory}
        />
      )}
    </div>
  );
}
