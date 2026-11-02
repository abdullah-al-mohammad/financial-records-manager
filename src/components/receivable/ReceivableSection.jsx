import ReceivableFilters from './ReceivableFilters';
import ReceivableSummaryCards from './ReceivableSummaryCards';
import ReceivableTable from './ReceivableTable';

// The receivable ledger tab: metric cards, filters and records table.
export default function ReceivableSection({
  stats,
  receivableCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  accountFilter,
  onAccountChange,
  filteredRecords,
  onAdd,
  onReceive,
  onRevert,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <ReceivableSummaryCards stats={stats} receivableCount={receivableCount} />

      <ReceivableFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        accountFilter={accountFilter}
        onAccountChange={onAccountChange}
        totalCount={receivableCount}
        pendingCount={stats.pendingCount}
        receivedCount={stats.receivedCount}
      />

      <ReceivableTable
        records={filteredRecords}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        accountFilter={accountFilter}
        onAdd={onAdd}
        onReceive={onReceive}
        onRevert={onRevert}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
