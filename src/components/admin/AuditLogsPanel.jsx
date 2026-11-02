import AuditLogsPagination from './AuditLogsPagination';
import AuditLogsTable from './AuditLogsTable';
import LogsSearchBar from './LogsSearchBar';

// Security audit logs tab: search, table and pagination.
export default function AuditLogsPanel({
  logSearch,
  onSearchChange,
  logPage,
  setLogPage,
  filteredLogs,
  paginatedLogs,
  totalLogPages,
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <LogsSearchBar logSearch={logSearch} onSearchChange={onSearchChange} />

      {/* Logs Table */}
      <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <AuditLogsTable rows={paginatedLogs} />

        {/* Pagination Controls */}
        {totalLogPages > 1 && (
          <AuditLogsPagination
            logPage={logPage}
            totalLogPages={totalLogPages}
            totalEntries={filteredLogs.length}
            onPrevPage={() => setLogPage(prev => Math.max(prev - 1, 1))}
            onNextPage={() => setLogPage(prev => Math.min(prev + 1, totalLogPages))}
          />
        )}
      </div>
    </div>
  );
}
