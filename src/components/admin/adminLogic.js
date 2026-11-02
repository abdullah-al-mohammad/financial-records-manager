// Audit log page size used by the admin panel.
export const LOGS_PER_PAGE = 15;

// Filter audit logs by username, action, details or timestamp.
export const filterAuditLogs = (logs = [], search = '') => {
  const query = search.toLowerCase();
  return logs.filter(log => {
    return (
      log.username?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      log.timestamp?.includes(query)
    );
  });
};

// Slice the filtered logs down to the current page.
export const paginateLogs = (logs = [], page = 1, perPage = LOGS_PER_PAGE) => {
  const startIndex = (page - 1) * perPage;
  return logs.slice(startIndex, startIndex + perPage);
};

export const getTotalLogPages = (totalLogs, perPage = LOGS_PER_PAGE) =>
  Math.ceil(totalLogs / perPage) || 1;

// Format an ISO timestamp for the audit log table.
export const formatTimestamp = isoStr => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return (
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  } catch {
    return isoStr;
  }
};
