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
