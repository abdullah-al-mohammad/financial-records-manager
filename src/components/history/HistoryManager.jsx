import HistoryHeader from './HistoryHeader';
import HistoryMetricCards from './HistoryMetricCards';
import MonthOverMonthTable from './MonthOverMonthTable';
import PayoutsArchiveTable from './PayoutsArchiveTable';
import SalesArchiveTable from './SalesArchiveTable';
import TransfersArchiveTable from './TransfersArchiveTable';
import useHistoryArchive from './useHistoryArchive';

export default function HistoryManager({ records, payments, transfers = [], onDeleteTransfer }) {
  const {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    monthlyMetricsSummary,
    targetMonthData,
  } = useHistoryArchive({ records, payments, transfers });

  return (
    <div className="space-y-6">
      <HistoryHeader
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {availableMonths.length === 0 ? (
        <div className="glass-panel border border-slate-900 rounded-2xl p-8 text-center text-slate-500">
          No records or payments have been logged yet. Check back once you have entered
          transactions.
        </div>
      ) : (
        <>
          {/* Target Month Metrics */}
          {targetMonthData && <HistoryMetricCards targetMonthData={targetMonthData} />}

          {/* Month-over-Month Comparative Grid */}
          <MonthOverMonthTable
            monthlyMetricsSummary={monthlyMetricsSummary}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />

          {/* Historical Logs List for Selected Month */}
          {targetMonthData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Records Grid */}
              <SalesArchiveTable
                selectedMonth={selectedMonth}
                records={targetMonthData.records}
              />

              {/* Payments Grid */}
              <PayoutsArchiveTable
                selectedMonth={selectedMonth}
                payments={targetMonthData.payments}
              />

              {/* Balance Transfers Grid */}
              <TransfersArchiveTable
                selectedMonth={selectedMonth}
                transfers={targetMonthData.transfers}
                transferTotal={targetMonthData.transferTotal}
                onDeleteTransfer={onDeleteTransfer}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
