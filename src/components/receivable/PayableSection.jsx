import PayableFilters from './PayableFilters';
import PayableSummaryCards from './PayableSummaryCards';
import PayableTable from './PayableTable';

// The payable ledger tab: notice, metric cards, filters and records table.
export default function PayableSection({
  payStats,
  payableCount,
  paySearchQuery,
  onSearchChange,
  payStatusFilter,
  onStatusChange,
  payAccountFilter,
  onAccountChange,
  filteredPayables,
  onAdd,
  onPay,
  onRevert,
  onEdit,
  onDelete,
}) {
  return (
    <>
      {/* Payable Header Notice */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Manage suppliers &amp; debts you owe. Clicking{' '}
          <span className="font-semibold text-rose-400">"Pay Now"</span> deducts from cash balance.
        </p>
      </div>

      <PayableSummaryCards payStats={payStats} payableCount={payableCount} />

      <PayableFilters
        paySearchQuery={paySearchQuery}
        onSearchChange={onSearchChange}
        payStatusFilter={payStatusFilter}
        onStatusChange={onStatusChange}
        payAccountFilter={payAccountFilter}
        onAccountChange={onAccountChange}
        totalCount={payableCount}
        unpaidCount={payStats.unpaidCount}
        paidCount={payStats.paidCount}
      />

      <PayableTable
        records={filteredPayables}
        paySearchQuery={paySearchQuery}
        payStatusFilter={payStatusFilter}
        payAccountFilter={payAccountFilter}
        onAdd={onAdd}
        onPay={onPay}
        onRevert={onRevert}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
