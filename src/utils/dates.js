/**
 * Normalize any stored date value to YYYY-MM-DD for filtering and sorting.
 */
export function toDateKey(value) {
  if (value === null || value === undefined || value === '') return null;

  const str = String(value).trim();
  if (!str) return null;

  // ISO: 2026-01-26 or 2026-01-26T14:30:00
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Spreadsheet serial number (e.g. from Google Sheets export)
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial > 20000 && serial < 100000) {
      const utcMs = (serial - 25569) * 86400 * 1000;
      const d = new Date(utcMs);
      if (!Number.isNaN(d.getTime())) {
        return formatDateParts(d);
      }
    }
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateParts(parsed);
  }

  return null;
}

function formatDateParts(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(value) {
  const key = toDateKey(value);
  if (!key) return '—';
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

export function isDateInRange(value, startDate, endDate) {
  const key = toDateKey(value);
  if (!key) return false;
  if (startDate && key < startDate) return false;
  if (endDate && key > endDate) return false;
  return true;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getMonthFromDate(value) {
  const key = toDateKey(value);
  if (!key) return '';
  const monthIndex = parseInt(key.slice(5, 7), 10) - 1;
  return MONTH_NAMES[monthIndex] || '';
}

export { MONTH_NAMES };

export function compareDates(a, b) {
  const keyA = toDateKey(a) || '';
  const keyB = toDateKey(b) || '';
  return keyA.localeCompare(keyB);
}

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Sort a list of records so the most recently CREATED record appears first.
 * Prefers the `createdAt` timestamp (newest first). Records without a
 * `createdAt` fall back to their `date` (newest date first), which keeps
 * legacy data grouped sensibly. Stable for records sharing a timestamp.
 */
export function sortRecordsNewestFirst(list) {
  return [...(list || [])].sort((a, b) => {
    const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : null;
    const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : null;

    // Prefer createdAt when both present
    if (aTime != null && bTime != null) {
      if (aTime !== bTime) return bTime - aTime;
    } else if (aTime != null && bTime == null) {
      return -1; // record with a creation time stays above legacy records
    } else if (aTime == null && bTime != null) {
      return 1;
    }

    // Fall back to record date (newest date first); break ties by id (stable)
    const dateKey = (row, field) => (row && toDateKey(row[field])) || '';
    const dateCmp = dateKey(b, 'date').localeCompare(dateKey(a, 'date'));
    if (dateCmp !== 0) return dateCmp;

    return String(b?.id || '').localeCompare(String(a?.id || ''));
  });
}
