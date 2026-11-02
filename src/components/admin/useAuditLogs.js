import { useMemo, useState } from 'react';
import {
  LOGS_PER_PAGE,
  filterAuditLogs,
  getTotalLogPages,
  paginateLogs,
} from './adminLogic';

// Owns audit-log search + pagination state and the derived page slices.
export default function useAuditLogs(logs = []) {
  // Search & Pagination States
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);

  // Filter logs by search queries
  const filteredLogs = useMemo(() => filterAuditLogs(logs, logSearch), [logs, logSearch]);

  // Paginated logs
  const paginatedLogs = useMemo(
    () => paginateLogs(filteredLogs, logPage, LOGS_PER_PAGE),
    [filteredLogs, logPage]
  );

  const totalLogPages = getTotalLogPages(filteredLogs.length, LOGS_PER_PAGE);

  const handleSearchChange = value => {
    setLogSearch(value);
    setLogPage(1); // Reset page to 1
  };

  return {
    logSearch,
    handleSearchChange,
    logPage,
    setLogPage,
    filteredLogs,
    paginatedLogs,
    totalLogPages,
  };
}
